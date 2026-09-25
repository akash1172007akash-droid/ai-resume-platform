"""Resume upload, file validation, text processing, and skill persistence service.
"""

import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import settings
from app.models.user import User, UserRole
from app.models.resume import Resume, ResumeSkill
from app.services.resume_parser import extract_text_from_pdf
from app.ml.text_preprocessing import clean_text
from app.ml.skill_extraction import extract_skills_from_text


def validate_resume_file(file: UploadFile) -> None:
    """Validates file extension, content-type, and size."""
    filename = file.filename or ""
    suffix = Path(filename).suffix.lower()

    if suffix not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{suffix}'. Only .pdf resumes are permitted."
        )

    # Some clients may send application/octet-stream or application/x-pdf
    valid_mimes = {"application/pdf", "application/x-pdf", "binary/octet-stream"}
    if file.content_type and file.content_type.lower() not in valid_mimes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME type '{file.content_type}'. Must be a PDF document."
        )


def process_and_save_resume(
    file: UploadFile,
    user: User,
    db: Session
) -> Resume:
    """
    Saves PDF to disk, extracts text with PyMuPDF, cleans text, detects skills,
    and saves records into MySQL database.
    """
    validate_resume_file(file)

    upload_dir = settings.get_upload_path()
    # Generate unique filename to avoid collision while keeping original basename
    safe_original_name = Path(file.filename or "resume.pdf").name.replace(" ", "_")
    unique_filename = f"{uuid.uuid4().hex[:8]}_{safe_original_name}"
    target_path = upload_dir / unique_filename

    # Read content and enforce size limit
    content = file.file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE // (1024 * 1024)}MB."
        )
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty (0 bytes)."
        )

    # Write file to disk
    with open(target_path, "wb") as f:
        f.write(content)

    # Extract text using PyMuPDF
    raw_text = extract_text_from_pdf(str(target_path))

    # Clean text
    cleaned = clean_text(raw_text)

    # Detect skills
    detected_skills = extract_skills_from_text(raw_text)

    # Create Resume DB record
    resume = Resume(
        user_id=user.id,
        filename=safe_original_name,
        file_path=str(target_path),
        file_size=len(content),
        extracted_text=raw_text,
        clean_text=cleaned
    )
    db.add(resume)
    db.flush()  # Flush to populate resume.id

    # Create ResumeSkill records
    seen_skills = set()
    for item in detected_skills:
        skill_name = item["name"]
        if skill_name not in seen_skills:
            seen_skills.add(skill_name)
            skill_record = ResumeSkill(
                resume_id=resume.id,
                skill_name=skill_name,
                category=item.get("category", "General")
            )
            db.add(skill_record)

    db.commit()
    db.refresh(resume)
    return resume


def get_user_resumes(user: User, db: Session) -> List[Resume]:
    """Retrieve resumes for candidate or all accessible resumes for recruiter."""
    if user.role == UserRole.CANDIDATE:
        return db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.uploaded_at.desc()).all()
    else:
        # Recruiter can view all candidate resumes in the system
        return db.query(Resume).order_by(Resume.uploaded_at.desc()).all()


def get_resume_by_id(resume_id: int, user: User, db: Session) -> Resume:
    """Retrieve a single resume with role-based access check."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )

    # Authorization check: Candidate can ONLY access their own resume
    if user.role == UserRole.CANDIDATE and resume.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not have permission to access another user's resume."
        )

    return resume


def delete_resume_by_id(resume_id: int, user: User, db: Session) -> bool:
    """Delete resume record and remove associated file from disk."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )

    if user.role == UserRole.CANDIDATE and resume.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You cannot delete another user's resume."
        )

    # Remove file from disk if exists
    try:
        path = Path(resume.file_path)
        if path.exists():
            path.unlink()
    except Exception:
        pass

    db.delete(resume)
    db.commit()
    return True
