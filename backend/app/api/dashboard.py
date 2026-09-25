"""Dashboard analytics endpoints for candidates and recruiters.
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.resume import Resume, ResumeSkill
from app.models.job import Job, JobRequiredSkill
from app.models.analysis import MatchAnalysis, SkillGap
from app.schemas.analysis import CandidateStatsOut, RecruiterStatsOut, AnalysisHistoryItem
from app.api.deps import get_current_user, require_recruiter, require_candidate
from app.services.analysis_service import get_analysis_history

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/candidate", response_model=CandidateStatsOut)
def get_candidate_dashboard_data(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """Aggregate dashboard metrics, uploaded resumes, and match history for candidates."""
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).all()
    total_resumes = len(resumes)

    latest_resume_dict = None
    detected_skills_count = 0

    if resumes:
        latest = resumes[0]
        detected_skills_count = len(latest.skills)
        latest_resume_dict = {
            "id": latest.id,
            "filename": latest.filename,
            "file_size": latest.file_size,
            "uploaded_at": latest.uploaded_at,
            "skills": [s.skill_name for s in latest.skills]
        }

    # Fetch recent analyses
    history_records = get_analysis_history(user=current_user, db=db)
    recent_analyses = [AnalysisHistoryItem(**r) for r in history_records[:10]]

    return CandidateStatsOut(
        total_resumes=total_resumes,
        latest_resume=latest_resume_dict,
        detected_skills_count=detected_skills_count,
        total_analyses=len(history_records),
        recent_analyses=recent_analyses
    )


@router.get("/recruiter", response_model=RecruiterStatsOut)
def get_recruiter_dashboard_data(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Aggregate macro metrics, distributions, and analytics for recruiters."""
    total_jobs = db.query(func.count(Job.id)).scalar() or 0
    total_resumes = db.query(func.count(Resume.id)).scalar() or 0
    total_analyses = db.query(func.count(MatchAnalysis.id)).scalar() or 0

    avg_sim = db.query(func.avg(MatchAnalysis.similarity_score)).scalar() or 0.0

    # Job analyses distribution (for charts)
    jobs = db.query(Job).all()
    job_dist = []
    for j in jobs:
        count = db.query(func.count(MatchAnalysis.id)).filter(MatchAnalysis.job_id == j.id).scalar() or 0
        job_dist.append({
            "job_id": j.id,
            "job_title": j.title,
            "company": j.company,
            "resumes_analyzed": count
        })

    # Skill frequency across job postings
    skill_counts = (
        db.query(JobRequiredSkill.skill_name, func.count(JobRequiredSkill.id).label("count"))
        .group_by(JobRequiredSkill.skill_name)
        .order_by(func.count(JobRequiredSkill.id).desc())
        .limit(10)
        .all()
    )
    top_demanded_skills = [{"skill": sc[0], "count": sc[1]} for sc in skill_counts]

    # Recent candidate analyses
    history_records = get_analysis_history(user=current_user, db=db)
    recent_analyses = [AnalysisHistoryItem(**r) for r in history_records[:15]]

    return RecruiterStatsOut(
        total_jobs=total_jobs,
        total_resumes=total_resumes,
        total_analyses=total_analyses,
        avg_similarity_score=round(float(avg_sim), 2),
        job_analyses_distribution=job_dist,
        top_demanded_skills=top_demanded_skills,
        recent_analyses=recent_analyses
    )
