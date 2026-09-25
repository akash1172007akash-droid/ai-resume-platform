"""Analysis endpoints for single and batch candidate matching, gap analysis, and comparison.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.analysis import (
    AnalysisCreateRequest,
    AnalysisDetailOut,
    AnalysisHistoryItem,
    CandidateComparisonItem,
    SkillGapOut
)
from app.api.deps import get_current_user, require_recruiter
from app.services.analysis_service import (
    analyze_resume_against_job,
    get_analysis_by_id,
    get_analysis_history,
    get_job_analyses,
    batch_analyze_resumes_for_job
)

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("", response_model=AnalysisDetailOut, status_code=status.HTTP_201_CREATED)
def run_analysis(
    req: AnalysisCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Execute full NLP and ML matching between a resume and a job description:
    - Text preprocessing
    - TF-IDF vectorization
    - Cosine similarity (Job Match Score)
    - Controlled skill dictionary matching
    - Skill gap detection
    - Curated learning recommendations
    """
    return analyze_resume_against_job(request=req, user=current_user, db=db)


@router.get("/history", response_model=List[AnalysisHistoryItem])
def list_analysis_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve historical analyses for the authenticated candidate or recruiter."""
    records = get_analysis_history(user=current_user, db=db)
    return [AnalysisHistoryItem(**r) for r in records]


@router.get("/job/{job_id}", response_model=List[Dict[str, Any]])
def get_job_candidate_matches(
    job_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Retrieve all candidate analyses scored against a specific job posting."""
    return get_job_analyses(job_id=job_id, recruiter=current_user, db=db)


@router.post("/batch/{job_id}", response_model=List[AnalysisDetailOut])
def batch_analyze_job_candidates(
    job_id: int,
    resume_ids: List[int],
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """
    Analyze multiple candidate resumes in batch against a selected job description.
    Descriptive comparison of platform-generated metrics.
    """
    return batch_analyze_resumes_for_job(
        job_id=job_id,
        resume_ids=resume_ids,
        recruiter=current_user,
        db=db
    )


@router.get("/{analysis_id}", response_model=AnalysisDetailOut)
def get_analysis_result(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full analysis report with matched skills, missing skills, and learning gaps."""
    return get_analysis_by_id(analysis_id=analysis_id, user=current_user, db=db)


@router.get("/{analysis_id}/skill-gap", response_model=Dict[str, Any])
def get_analysis_skill_gap(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve specific skill gaps and targeted generic learning recommendations."""
    full_analysis = get_analysis_by_id(analysis_id=analysis_id, user=current_user, db=db)
    return {
        "analysis_id": full_analysis.id,
        "job_title": full_analysis.job_title,
        "matched_skills": full_analysis.matched_skills,
        "missing_skills": full_analysis.missing_skills,
        "additional_skills": full_analysis.additional_skills,
        "learning_recommendations": full_analysis.learning_recommendations,
        "matched_skill_count": full_analysis.matched_skill_count,
        "required_skill_count": full_analysis.required_skill_count,
        "skill_match_percentage": full_analysis.skill_match_percentage
    }


@router.post("/compare", response_model=List[CandidateComparisonItem])
def compare_candidate_profiles(
    analysis_ids: List[int],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compare multiple candidate match analyses side-by-side.
    Descriptive multi-candidate metric comparison.
    """
    results = []
    for aid in analysis_ids:
        try:
            analysis = get_analysis_by_id(analysis_id=aid, user=current_user, db=db)
            results.append(CandidateComparisonItem(
                analysis_id=analysis.id,
                candidate_id=analysis.resume_id,
                candidate_name=analysis.candidate_name,
                candidate_email=analysis.candidate_email,
                resume_id=analysis.resume_id,
                resume_filename=analysis.resume_filename,
                similarity_score=analysis.similarity_score,
                skill_match_percentage=analysis.skill_match_percentage,
                matched_skills=analysis.matched_skills,
                missing_skills=analysis.missing_skills,
                additional_skills=analysis.additional_skills,
                created_at=analysis.created_at
            ))
        except Exception:
            continue
    return results
