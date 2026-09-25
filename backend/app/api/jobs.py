"""Job posting endpoints for recruiters and candidates.
"""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate, JobOut
from app.api.deps import get_current_user, require_recruiter
from app.services.job_service import (
    create_job,
    get_all_jobs,
    get_job_by_id,
    update_job,
    delete_job
)

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def post_job(
    job_in: JobCreate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Create a new job posting with required and preferred skills (Recruiter only)."""
    job = create_job(recruiter=current_user, job_in=job_in, db=db)
    
    return JobOut(
        id=job.id,
        recruiter_id=job.recruiter_id,
        title=job.title,
        company=job.company,
        description=job.description,
        experience_level=job.experience_level,
        created_at=job.created_at,
        updated_at=job.updated_at,
        required_skills=[s.skill_name for s in job.required_skills],
        preferred_skills=[s.skill_name for s in job.preferred_skills],
        analysis_count=len(job.match_analyses)
    )


@router.get("", response_model=List[JobOut])
def list_jobs(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all available job postings."""
    jobs = get_all_jobs(db=db, skip=skip, limit=limit)
    result = []
    for j in jobs:
        result.append(JobOut(
            id=j.id,
            recruiter_id=j.recruiter_id,
            title=j.title,
            company=j.company,
            description=j.description,
            experience_level=j.experience_level,
            created_at=j.created_at,
            updated_at=j.updated_at,
            required_skills=[s.skill_name for s in j.required_skills],
            preferred_skills=[s.skill_name for s in j.preferred_skills],
            analysis_count=len(j.match_analyses)
        ))
    return result


@router.get("/{job_id}", response_model=JobOut)
def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get single job details by ID."""
    j = get_job_by_id(job_id=job_id, db=db)
    return JobOut(
        id=j.id,
        recruiter_id=j.recruiter_id,
        title=j.title,
        company=j.company,
        description=j.description,
        experience_level=j.experience_level,
        created_at=j.created_at,
        updated_at=j.updated_at,
        required_skills=[s.skill_name for s in j.required_skills],
        preferred_skills=[s.skill_name for s in j.preferred_skills],
        analysis_count=len(j.match_analyses)
    )


@router.put("/{job_id}", response_model=JobOut)
def edit_job(
    job_id: int,
    job_in: JobUpdate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Update job posting details and skills."""
    j = update_job(job_id=job_id, recruiter=current_user, job_in=job_in, db=db)
    return JobOut(
        id=j.id,
        recruiter_id=j.recruiter_id,
        title=j.title,
        company=j.company,
        description=j.description,
        experience_level=j.experience_level,
        created_at=j.created_at,
        updated_at=j.updated_at,
        required_skills=[s.skill_name for s in j.required_skills],
        preferred_skills=[s.skill_name for s in j.preferred_skills],
        analysis_count=len(j.match_analyses)
    )


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_job(
    job_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Delete a job posting."""
    delete_job(job_id=job_id, recruiter=current_user, db=db)
    return None
