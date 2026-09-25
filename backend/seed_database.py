"""Database seed script populating demo accounts, jobs, resumes, and initial analyses.
"""

from pathlib import Path
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, Base, engine
from app.core.security import hash_password
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.job import Job, JobRequiredSkill, JobPreferredSkill
from app.models.resume import Resume, ResumeSkill
from app.models.analysis import MatchAnalysis, SkillGap, LearningRecommendation, SkillStatus
from app.services.resume_parser import extract_text_from_pdf
from app.ml.text_preprocessing import clean_text
from app.ml.skill_extraction import extract_skills_from_text
from app.ml.tfidf_matcher import compute_tfidf_similarity
from app.ml.skill_gap import perform_skill_gap_analysis, LEARNING_RECOMMENDATIONS_CATALOG
from app.ml.skills import SKILL_TO_CATEGORY

def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    print("--- Seeding Database ai_resume_db ---")

    # 1. Learning recommendations catalog
    if db.query(LearningRecommendation).count() == 0:
        for skill_name, data in LEARNING_RECOMMENDATIONS_CATALOG.items():
            cat = SKILL_TO_CATEGORY.get(skill_name, "General")
            db.add(LearningRecommendation(
                skill_name=skill_name,
                category=cat,
                recommendation_title=data["title"],
                recommendation_details=data["description"],
                resource_link=data.get("resource", "")
            ))
        db.commit()
        print("[OK] Seeded learning recommendations catalog")

    # 2. Users
    users_data = [
        {"name": "Sarah Jenkins", "email": "recruiter@example.com", "password": "Recruiter@123", "role": UserRole.RECRUITER},
        {"name": "Akash Sharma", "email": "candidate@example.com", "password": "Candidate@123", "role": UserRole.CANDIDATE},
        {"name": "Priya Verma", "email": "priya@example.com", "password": "Priya@123", "role": UserRole.CANDIDATE},
        {"name": "Rahul Nair", "email": "rahul@example.com", "password": "Rahul@123", "role": UserRole.CANDIDATE},
    ]

    user_map = {}
    for u in users_data:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            user_obj = User(
                name=u["name"],
                email=u["email"],
                password_hash=hash_password(u["password"]),
                role=u["role"]
            )
            db.add(user_obj)
            db.commit()
            db.refresh(user_obj)
            user_map[u["email"]] = user_obj
            print(f"[OK] Created user: {u['email']} ({u['role'].value})")
        else:
            user_map[u["email"]] = existing

    recruiter = user_map["recruiter@example.com"]
    candidate = user_map["candidate@example.com"]
    priya = user_map["priya@example.com"]
    rahul = user_map["rahul@example.com"]

    # 3. Jobs
    jobs_data = [
        {
            "title": "Python Machine Learning Intern",
            "company": "Apex AI Technologies",
            "description": "We are seeking a motivated Python Machine Learning Intern to join our data intelligence team. The candidate will work on developing ML models, feature engineering pipelines, and REST APIs. Required skills include Python, SQL, Machine Learning, Pandas, and Scikit-learn. Preferred skills: FastAPI, React, and Git.",
            "experience_level": "Internship",
            "required": ["Python", "SQL", "Machine Learning", "Pandas", "Scikit-learn"],
            "preferred": ["FastAPI", "React", "Git"]
        },
        {
            "title": "Python Developer Intern",
            "company": "CloudScale Software",
            "description": "Looking for a Python Developer Intern to build scalable backend services. Required skills: Python, SQL, Git, and FastAPI. Experience with Linux, MySQL, and Docker is preferred.",
            "experience_level": "Internship",
            "required": ["Python", "SQL", "Git", "FastAPI"],
            "preferred": ["Linux", "MySQL", "Docker"]
        },
        {
            "title": "Full Stack Developer Intern",
            "company": "NextGen Digital",
            "description": "Seeking an enthusiastic Full Stack Developer Intern. The role involves designing interactive web frontends using React and JavaScript, combined with enterprise backend APIs built in Java and Spring Boot with MySQL databases.",
            "experience_level": "Entry-level",
            "required": ["React", "JavaScript", "Spring Boot", "MySQL"],
            "preferred": ["Tailwind CSS", "Docker"]
        }
    ]

    job_objs = []
    for j in jobs_data:
        existing_job = db.query(Job).filter(Job.title == j["title"], Job.company == j["company"]).first()
        if not existing_job:
            job = Job(
                recruiter_id=recruiter.id,
                title=j["title"],
                company=j["company"],
                description=j["description"],
                experience_level=j["experience_level"]
            )
            db.add(job)
            db.flush()
            for r_skill in j["required"]:
                db.add(JobRequiredSkill(job_id=job.id, skill_name=r_skill))
            for p_skill in j["preferred"]:
                db.add(JobPreferredSkill(job_id=job.id, skill_name=p_skill))
            db.commit()
            db.refresh(job)
            job_objs.append(job)
            print(f"[OK] Created job: {job.title} at {job.company}")
        else:
            job_objs.append(existing_job)

    # 4. Upload & process sample resumes
    sample_dir = Path(__file__).resolve().parent.parent / "sample_data" / "resumes"
    upload_dir = settings.get_upload_path()

    resume_mapping = [
        {"pdf": "resume_akash.pdf", "user": candidate},
        {"pdf": "resume_priya.pdf", "user": priya},
        {"pdf": "resume_rahul.pdf", "user": rahul},
    ]

    resume_objs = []
    for r in resume_mapping:
        src_path = sample_dir / r["pdf"]
        if src_path.exists():
            dest_path = upload_dir / r["pdf"]
            if not dest_path.exists():
                with open(src_path, "rb") as sf, open(dest_path, "wb") as df:
                    df.write(sf.read())

            existing_res = db.query(Resume).filter(Resume.filename == r["pdf"], Resume.user_id == r["user"].id).first()
            if not existing_res:
                raw_text = extract_text_from_pdf(str(dest_path))
                cleaned = clean_text(raw_text)
                detected = extract_skills_from_text(raw_text)

                res_record = Resume(
                    user_id=r["user"].id,
                    filename=r["pdf"],
                    file_path=str(dest_path),
                    file_size=dest_path.stat().st_size,
                    extracted_text=raw_text,
                    clean_text=cleaned
                )
                db.add(res_record)
                db.flush()

                for sk in detected:
                    db.add(ResumeSkill(
                        resume_id=res_record.id,
                        skill_name=sk["name"],
                        category=sk["category"]
                    ))
                db.commit()
                db.refresh(res_record)
                resume_objs.append(res_record)
                print(f"[OK] Processed & saved resume: {r['pdf']} for {r['user'].name} (detected {len(detected)} skills)")
            else:
                resume_objs.append(existing_res)

    # 5. Create initial Match Analyses
    if resume_objs and job_objs:
        primary_job = job_objs[0]  # Python ML Intern
        for res in resume_objs:
            existing_analysis = db.query(MatchAnalysis).filter(
                MatchAnalysis.resume_id == res.id,
                MatchAnalysis.job_id == primary_job.id
            ).first()

            if not existing_analysis:
                r_skills = [s.skill_name for s in res.skills]
                j_skills = [s.skill_name for s in primary_job.required_skills]

                sim_score, _ = compute_tfidf_similarity(res.extracted_text or "", primary_job.description or "")
                gap_res = perform_skill_gap_analysis(r_skills, j_skills)

                analysis = MatchAnalysis(
                    resume_id=res.id,
                    job_id=primary_job.id,
                    similarity_score=sim_score,
                    skill_match_percentage=gap_res["skill_match_percentage"],
                    matched_skill_count=gap_res["matched_count"],
                    required_skill_count=gap_res["required_count"]
                )
                db.add(analysis)
                db.flush()

                for m in gap_res["matched_skills"]:
                    db.add(SkillGap(analysis_id=analysis.id, skill_name=m, status=SkillStatus.MATCHED))

                rec_map = {r["skill"]: f"{r['title']}: {r['description']}" for r in gap_res["learning_recommendations"]}
                for mis in gap_res["missing_skills"]:
                    db.add(SkillGap(analysis_id=analysis.id, skill_name=mis, status=SkillStatus.MISSING, learning_recommendation=rec_map.get(mis)))

                for add in gap_res["additional_skills"]:
                    db.add(SkillGap(analysis_id=analysis.id, skill_name=add, status=SkillStatus.ADDITIONAL))

                db.commit()
                print(f"[OK] Created initial MatchAnalysis: Resume '{res.filename}' vs '{primary_job.title}' (Sim: {sim_score}%, Skills: {gap_res['matched_count']}/{gap_res['required_count']})")

    db.close()
    print("--- Database Seeding Complete ---")

if __name__ == "__main__":
    seed()
