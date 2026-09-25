"""Resume upload, retrieval, and skill management endpoints.
"""

from typing import List
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.resume import Resume, ResumeSkill
from app.schemas.resume import ResumeOut, ResumeDetailOut, ResumeSkillOut
from app.api.deps import get_current_user
from app.services.resume_service import (
    process_and_save_resume,
    get_user_resumes,
    get_resume_by_id,
    delete_resume_by_id
)

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", response_model=ResumeDetailOut, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload candidate resume in PDF format.
    Validates MIME type, file extension, and file size.
    Extracts text via PyMuPDF, cleans text, detects technical skills, and persists in MySQL.
    """
    resume = process_and_save_resume(file=file, user=current_user, db=db)
    
    # Format response
    skills_out = [ResumeSkillOut.model_validate(s) for s in resume.skills]
    cand_user = resume.user

    return ResumeDetailOut(
        id=resume.id,
        user_id=resume.user_id,
        candidate_name=cand_user.name if cand_user else current_user.name,
        candidate_email=cand_user.email if cand_user else current_user.email,
        filename=resume.filename,
        file_size=resume.file_size,
        uploaded_at=resume.uploaded_at,
        skills_count=len(resume.skills),
        extracted_text=resume.extracted_text,
        clean_text=resume.clean_text,
        skills=skills_out
    )


@router.get("", response_model=List[ResumeOut])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List resumes: Candidates see their own uploaded resumes;
    Recruiters see all candidate resumes available in the platform.
    """
    resumes = get_user_resumes(user=current_user, db=db)
    result = []
    for r in resumes:
        cand = r.user
        result.append(ResumeOut(
            id=r.id,
            user_id=r.user_id,
            candidate_name=cand.name if cand else "Candidate",
            candidate_email=cand.email if cand else "",
            filename=r.filename,
            file_size=r.file_size,
            uploaded_at=r.uploaded_at,
            skills_count=len(r.skills)
        ))
    return result


@router.get("/{resume_id}", response_model=ResumeDetailOut)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full resume details including extracted text and skills."""
    resume = get_resume_by_id(resume_id=resume_id, user=current_user, db=db)
    cand = resume.user

    skills_out = [ResumeSkillOut.model_validate(s) for s in resume.skills]
    return ResumeDetailOut(
        id=resume.id,
        user_id=resume.user_id,
        candidate_name=cand.name if cand else "Candidate",
        candidate_email=cand.email if cand else "",
        filename=resume.filename,
        file_size=resume.file_size,
        uploaded_at=resume.uploaded_at,
        skills_count=len(resume.skills),
        extracted_text=resume.extracted_text,
        clean_text=resume.clean_text,
        skills=skills_out
    )


@router.get("/{resume_id}/skills", response_model=List[ResumeSkillOut])
def get_resume_skills(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detected skills for a specific resume."""
    resume = get_resume_by_id(resume_id=resume_id, user=current_user, db=db)
    return [ResumeSkillOut.model_validate(s) for s in resume.skills]


@router.get("/{resume_id}/file")
def download_resume_file(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download or view original PDF file securely."""
    resume = get_resume_by_id(resume_id=resume_id, user=current_user, db=db)
    file_path = Path(resume.file_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file does not exist on storage disk."
        )

    return FileResponse(
        path=str(file_path),
        filename=resume.filename,
        media_type="application/pdf"
    )


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resume and purge associated file and analysis data."""
    delete_resume_by_id(resume_id=resume_id, user=current_user, db=db)
    return None
