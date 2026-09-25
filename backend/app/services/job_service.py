"""Job service managing job postings, required and preferred skills.
"""

from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.models.job import Job, JobRequiredSkill, JobPreferredSkill
from app.schemas.job import JobCreate, JobUpdate
from app.ml.skill_extraction import extract_skills_from_text, normalize_skill_name


def create_job(recruiter: User, job_in: JobCreate, db: Session) -> Job:
    """Create a new job posting with required and preferred skills."""
    if recruiter.role != UserRole.RECRUITER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with the RECRUITER role can create job postings."
        )

    # If recruiter didn't specify required skills, automatically detect from job description
    required_skills_set = set()
    for s in job_in.required_skills:
        clean = s.strip()
        if clean:
            required_skills_set.add(normalize_skill_name(clean))

    if not required_skills_set:
        detected = extract_skills_from_text(job_in.description)
        for d in detected:
            required_skills_set.add(d["name"])

    preferred_skills_set = set()
    for s in job_in.preferred_skills:
        clean = s.strip()
        if clean:
            norm = normalize_skill_name(clean)
            if norm not in required_skills_set:
                preferred_skills_set.add(norm)

    job = Job(
        recruiter_id=recruiter.id,
        title=job_in.title.strip(),
        company=job_in.company.strip(),
        description=job_in.description.strip(),
        experience_level=job_in.experience_level.strip()
    )
    db.add(job)
    db.flush()

    for s_name in sorted(required_skills_set):
        db.add(JobRequiredSkill(job_id=job.id, skill_name=s_name))

    for s_name in sorted(preferred_skills_set):
        db.add(JobPreferredSkill(job_id=job.id, skill_name=s_name))

    db.commit()
    db.refresh(job)
    return job


def get_all_jobs(db: Session, skip: int = 0, limit: int = 100) -> List[Job]:
    """Retrieve all active job postings."""
    return db.query(Job).order_by(Job.created_at.desc()).offset(skip).limit(limit).all()


def get_job_by_id(job_id: int, db: Session) -> Job:
    """Retrieve job by id."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found."
        )
    return job


def update_job(job_id: int, recruiter: User, job_in: JobUpdate, db: Session) -> Job:
    """Update job posting with recruiter authorization check."""
    job = get_job_by_id(job_id, db)

    if recruiter.role != UserRole.RECRUITER or job.recruiter_id != recruiter.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the posting recruiter can edit this job."
        )

    if job_in.title is not None:
        job.title = job_in.title.strip()
    if job_in.company is not None:
        job.company = job_in.company.strip()
    if job_in.description is not None:
        job.description = job_in.description.strip()
    if job_in.experience_level is not None:
        job.experience_level = job_in.experience_level.strip()

    if job_in.required_skills is not None:
        db.query(JobRequiredSkill).filter(JobRequiredSkill.job_id == job.id).delete()
        for s in set(job_in.required_skills):
            if s.strip():
                db.add(JobRequiredSkill(job_id=job.id, skill_name=normalize_skill_name(s.strip())))

    if job_in.preferred_skills is not None:
        db.query(JobPreferredSkill).filter(JobPreferredSkill.job_id == job.id).delete()
        for s in set(job_in.preferred_skills):
            if s.strip():
                db.add(JobPreferredSkill(job_id=job.id, skill_name=normalize_skill_name(s.strip())))

    db.commit()
    db.refresh(job)
    return job


def delete_job(job_id: int, recruiter: User, db: Session) -> bool:
    """Delete job posting."""
    job = get_job_by_id(job_id, db)

    if recruiter.role != UserRole.RECRUITER or job.recruiter_id != recruiter.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the posting recruiter can delete this job."
        )

    db.delete(job)
    db.commit()
    return True
