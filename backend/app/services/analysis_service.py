"""End-to-end resume-to-job analysis service combining NLP, TF-IDF vectorization,
cosine similarity, skill gap evaluation, and persistence.
"""

from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User, UserRole
from app.models.resume import Resume, ResumeSkill
from app.models.job import Job, JobRequiredSkill, JobPreferredSkill
from app.models.analysis import MatchAnalysis, SkillGap, SkillStatus
from app.schemas.analysis import AnalysisCreateRequest, AnalysisDetailOut, CandidateComparisonItem
from app.ml.tfidf_matcher import compute_tfidf_similarity
from app.ml.skill_gap import perform_skill_gap_analysis
from app.ml.skill_extraction import extract_skills_from_text


def analyze_resume_against_job(
    request: AnalysisCreateRequest,
    user: User,
    db: Session
) -> AnalysisDetailOut:
    """
    Executes the full matching pipeline between a candidate resume and a job description.
    """
    # 1. Fetch resume and verify access
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )

    if user.role == UserRole.CANDIDATE and resume.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only analyze your own resume."
        )

    # 2. Fetch or create Job description
    job = None
    if request.job_id:
        job = db.query(Job).filter(Job.id == request.job_id).first()
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job with id {request.job_id} not found."
            )
    elif request.custom_job_description:
        # Create a transient or recorded job for candidate ad-hoc analysis
        custom_title = request.custom_job_title or "Target Job Role"
        custom_company = request.custom_company or "Target Company"
        job = Job(
            recruiter_id=user.id,
            title=custom_title,
            company=custom_company,
            description=request.custom_job_description,
            experience_level="Custom Target"
        )
        db.add(job)
        db.flush()

        req_skills = request.custom_required_skills or []
        if not req_skills:
            detected = extract_skills_from_text(request.custom_job_description)
            req_skills = [d["name"] for d in detected]

        for s in set(req_skills):
            db.add(JobRequiredSkill(job_id=job.id, skill_name=s))
        db.commit()
        db.refresh(job)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either a valid job_id or a custom_job_description."
        )

    # 3. Gather resume skills and text
    resume_skills = [s.skill_name for s in resume.skills]
    if not resume_skills and resume.extracted_text:
        # Backfill detected skills if not present
        detected = extract_skills_from_text(resume.extracted_text)
        for d in detected:
            db.add(ResumeSkill(resume_id=resume.id, skill_name=d["name"], category=d["category"]))
            resume_skills.append(d["name"])
        db.commit()

    # 4. Gather job required skills and text
    job_required_skills = [s.skill_name for s in job.required_skills]
    if not job_required_skills and job.description:
        detected_job_skills = extract_skills_from_text(job.description)
        job_required_skills = [d["name"] for d in detected_job_skills]

    # 5. Compute TF-IDF Cosine Similarity
    similarity_score, tfidf_meta = compute_tfidf_similarity(
        resume_text=resume.extracted_text or "",
        job_description_text=job.description or ""
    )

    # 6. Perform Skill Matching & Skill Gap Analysis
    gap_result = perform_skill_gap_analysis(
        resume_skills=resume_skills,
        job_required_skills=job_required_skills
    )

    # 7. Record MatchAnalysis in MySQL
    match_analysis = MatchAnalysis(
        resume_id=resume.id,
        job_id=job.id,
        similarity_score=similarity_score,
        skill_match_percentage=gap_result["skill_match_percentage"],
        matched_skill_count=gap_result["matched_count"],
        required_skill_count=gap_result["required_count"]
    )
    db.add(match_analysis)
    db.flush()

    # 8. Record Skill Gaps in MySQL
    for skill in gap_result["matched_skills"]:
        db.add(SkillGap(
            analysis_id=match_analysis.id,
            skill_name=skill,
            status=SkillStatus.MATCHED,
            learning_recommendation=None
        ))

    rec_map = {r["skill"]: f"{r['title']}: {r['description']}" for r in gap_result["learning_recommendations"]}
    for skill in gap_result["missing_skills"]:
        rec_text = rec_map.get(skill)
        db.add(SkillGap(
            analysis_id=match_analysis.id,
            skill_name=skill,
            status=SkillStatus.MISSING,
            learning_recommendation=rec_text
        ))

    for skill in gap_result["additional_skills"]:
        db.add(SkillGap(
            analysis_id=match_analysis.id,
            skill_name=skill,
            status=SkillStatus.ADDITIONAL,
            learning_recommendation=None
        ))

    db.commit()
    db.refresh(match_analysis)

    candidate_user = db.query(User).filter(User.id == resume.user_id).first()
    candidate_name = candidate_user.name if candidate_user else "Candidate"
    candidate_email = candidate_user.email if candidate_user else ""

    return AnalysisDetailOut(
        id=match_analysis.id,
        resume_id=resume.id,
        job_id=job.id,
        candidate_name=candidate_name,
        candidate_email=candidate_email,
        resume_filename=resume.filename,
        job_title=job.title,
        company=job.company,
        experience_level=job.experience_level or "Not specified",
        similarity_score=similarity_score,
        skill_match_percentage=gap_result["skill_match_percentage"],
        matched_skill_count=gap_result["matched_count"],
        required_skill_count=gap_result["required_count"],
        matched_skills=gap_result["matched_skills"],
        missing_skills=gap_result["missing_skills"],
        additional_skills=gap_result["additional_skills"],
        learning_recommendations=gap_result["learning_recommendations"],
        created_at=match_analysis.created_at
    )


def get_analysis_by_id(analysis_id: int, user: User, db: Session) -> AnalysisDetailOut:
    """Retrieve detailed analysis results by ID with permission checks."""
    analysis = db.query(MatchAnalysis).filter(MatchAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found."
        )

    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated resume not found.")

    if user.role == UserRole.CANDIDATE and resume.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not have permission to view this analysis."
        )

    job = db.query(Job).filter(Job.id == analysis.job_id).first()
    candidate_user = db.query(User).filter(User.id == resume.user_id).first()

    # Reconstruct skills by status
    gaps = db.query(SkillGap).filter(SkillGap.analysis_id == analysis.id).all()
    matched = [g.skill_name for g in gaps if g.status == SkillStatus.MATCHED]
    missing = [g.skill_name for g in gaps if g.status == SkillStatus.MISSING]
    additional = [g.skill_name for g in gaps if g.status == SkillStatus.ADDITIONAL]

    # Reconstruct learning recommendations
    from app.ml.skill_gap import LEARNING_RECOMMENDATIONS_CATALOG
    recommendations = []
    for s_name in missing:
        rec = LEARNING_RECOMMENDATIONS_CATALOG.get(s_name)
        if rec:
            recommendations.append({
                "skill": s_name,
                "title": rec["title"],
                "description": rec["description"],
                "resource": rec.get("resource", "")
            })
        else:
            recommendations.append({
                "skill": s_name,
                "title": f"{s_name} Fundamentals",
                "description": f"Learn foundational principles and real-world project applications for {s_name}.",
                "resource": ""
            })

    return AnalysisDetailOut(
        id=analysis.id,
        resume_id=resume.id,
        job_id=job.id if job else 0,
        candidate_name=candidate_user.name if candidate_user else "Candidate",
        candidate_email=candidate_user.email if candidate_user else "",
        resume_filename=resume.filename,
        job_title=job.title if job else "Custom Job",
        company=job.company if job else "Company",
        experience_level=job.experience_level if job else "N/A",
        similarity_score=analysis.similarity_score,
        skill_match_percentage=analysis.skill_match_percentage,
        matched_skill_count=analysis.matched_skill_count,
        required_skill_count=analysis.required_skill_count,
        matched_skills=matched,
        missing_skills=missing,
        additional_skills=additional,
        learning_recommendations=recommendations,
        created_at=analysis.created_at
    )


def get_analysis_history(user: User, db: Session) -> List[Dict[str, Any]]:
    """Retrieve recent analyses for candidate or recruiter."""
    query = db.query(MatchAnalysis).join(Resume).join(Job)

    if user.role == UserRole.CANDIDATE:
        query = query.filter(Resume.user_id == user.id)
    # Recruiter sees all analyses or their posted jobs
    analyses = query.order_by(MatchAnalysis.created_at.desc()).limit(100).all()

    result = []
    for a in analyses:
        cand = db.query(User).filter(User.id == a.resume.user_id).first()
        result.append({
            "id": a.id,
            "resume_id": a.resume_id,
            "job_id": a.job_id,
            "resume_filename": a.resume.filename,
            "candidate_name": cand.name if cand else "Candidate",
            "job_title": a.job.title,
            "company": a.job.company,
            "similarity_score": a.similarity_score,
            "skill_match_percentage": a.skill_match_percentage,
            "matched_skill_count": a.matched_skill_count,
            "required_skill_count": a.required_skill_count,
            "created_at": a.created_at
        })
    return result


def get_job_analyses(job_id: int, recruiter: User, db: Session) -> List[Dict[str, Any]]:
    """Retrieve all candidate analyses for a specific job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    analyses = (
        db.query(MatchAnalysis)
        .filter(MatchAnalysis.job_id == job_id)
        .order_by(MatchAnalysis.similarity_score.desc())
        .all()
    )

    result = []
    for a in analyses:
        cand = db.query(User).filter(User.id == a.resume.user_id).first()
        gaps = db.query(SkillGap).filter(SkillGap.analysis_id == a.id).all()
        matched = [g.skill_name for g in gaps if g.status == SkillStatus.MATCHED]
        missing = [g.skill_name for g in gaps if g.status == SkillStatus.MISSING]
        additional = [g.skill_name for g in gaps if g.status == SkillStatus.ADDITIONAL]

        result.append({
            "analysis_id": a.id,
            "candidate_id": cand.id if cand else 0,
            "candidate_name": cand.name if cand else "Candidate",
            "candidate_email": cand.email if cand else "",
            "resume_id": a.resume_id,
            "resume_filename": a.resume.filename,
            "similarity_score": a.similarity_score,
            "skill_match_percentage": a.skill_match_percentage,
            "matched_skill_count": a.matched_skill_count,
            "required_skill_count": a.required_skill_count,
            "matched_skills": matched,
            "missing_skills": missing,
            "additional_skills": additional,
            "created_at": a.created_at
        })
    return result


def batch_analyze_resumes_for_job(
    job_id: int,
    resume_ids: List[int],
    recruiter: User,
    db: Session
) -> List[AnalysisDetailOut]:
    """Analyze multiple candidate resumes against a single job posting."""
    if recruiter.role != UserRole.RECRUITER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only recruiters can run batch candidate analysis.")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    results = []
    for r_id in resume_ids:
        try:
            req = AnalysisCreateRequest(resume_id=r_id, job_id=job_id)
            res = analyze_resume_against_job(req, recruiter, db)
            results.append(res)
        except Exception as e:
            # Continue processing remaining resumes
            continue

    return results
