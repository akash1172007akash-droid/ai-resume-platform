"""Comprehensive Automated Verification Test Suite for AI Resume Intelligence Platform.
Tests all 20 required criteria specified in Project Specification Section 27.
"""

import os
import sys
from pathlib import Path
from fastapi.testclient import TestClient
import pymupdf

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.main import app
from app.ml.text_preprocessing import clean_text, preprocess_document
from app.ml.skill_extraction import extract_skills_from_text, normalize_skill_name
from app.ml.tfidf_matcher import compute_tfidf_similarity
from app.ml.skill_gap import perform_skill_gap_analysis

client = TestClient(app)

def test_full_platform_suite():
    print("==================================================")
    print("RUNNING AI RESUME PLATFORM VERIFICATION TEST SUITE")
    print("==================================================")

    # ----------------------------------------------------
    # TEST 1: User Registration
    # ----------------------------------------------------
    test_cand_email = f"test_cand_{os.getpid()}@example.com"
    reg_cand_res = client.post("/api/auth/register", json={
        "name": "Verification Candidate",
        "email": test_cand_email,
        "password": "Password@123",
        "confirm_password": "Password@123",
        "role": "CANDIDATE"
    })
    assert reg_cand_res.status_code == 201, f"Reg failed: {reg_cand_res.text}"
    cand_token = reg_cand_res.json()["access_token"]
    cand_id = reg_cand_res.json()["user"]["id"]
    print("[PASS] 1. User Registration (Candidate created)")

    # ----------------------------------------------------
    # TEST 2: User Login
    # ----------------------------------------------------
    login_res = client.post("/api/auth/login", json={
        "email": test_cand_email,
        "password": "Password@123"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    assert "access_token" in login_res.json()
    print("[PASS] 2. User Login (Credentials verified)")

    # ----------------------------------------------------
    # TEST 3: JWT Authentication & /me
    # ----------------------------------------------------
    auth_headers = {"Authorization": f"Bearer {cand_token}"}
    me_res = client.get("/api/auth/me", headers=auth_headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_cand_email
    # Invalid token check
    bad_res = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token_123"})
    assert bad_res.status_code == 401
    print("[PASS] 3. JWT Authentication (Valid & invalid token verification)")

    # ----------------------------------------------------
    # TEST 4: Resume Upload (Valid text-based PDF)
    # ----------------------------------------------------
    sample_pdf_path = Path(__file__).resolve().parent / "sample_data" / "resumes" / "resume_akash.pdf"
    if not sample_pdf_path.exists():
        sample_pdf_path = Path(__file__).resolve().parent.parent / "sample_data" / "resumes" / "resume_akash.pdf"

    with open(sample_pdf_path, "rb") as f:
        upload_res = client.post(
            "/api/resumes/upload",
            files={"file": ("resume_test.pdf", f.read(), "application/pdf")},
            headers=auth_headers
        )
    assert upload_res.status_code == 201, f"Upload failed: {upload_res.text}"
    resume_id = upload_res.json()["id"]
    detected_skills = upload_res.json()["skills"]
    assert len(detected_skills) > 0
    print(f"[PASS] 4. Resume Upload (Uploaded & processed resume ID: {resume_id})")

    # ----------------------------------------------------
    # TEST 5: PDF Text Extraction with PyMuPDF
    # ----------------------------------------------------
    extracted_text = upload_res.json()["extracted_text"]
    assert len(extracted_text) > 50
    assert "Akash" in extracted_text or "Python" in extracted_text
    print(f"[PASS] 5. PDF Text Extraction (PyMuPDF extracted {len(extracted_text)} chars)")

    # ----------------------------------------------------
    # TEST 6: Empty / Corrupt PDF Handling
    # ----------------------------------------------------
    corrupt_res = client.post(
        "/api/resumes/upload",
        files={"file": ("corrupt.pdf", b"NOT_A_VALID_PDF_STREAM", "application/pdf")},
        headers=auth_headers
    )
    assert corrupt_res.status_code in (400, 422)
    assert "could not be read as a valid PDF" in corrupt_res.text or "Unable to extract" in corrupt_res.text
    print("[PASS] 6. Empty/Corrupt PDF Handling (Rejected with clear descriptive error)")

    # ----------------------------------------------------
    # TEST 7: Skill Extraction Engine & Technical Boundary Matching
    # ----------------------------------------------------
    test_text = "Proficient in Python, C++, C#, .NET, Node.js, React.js, and Machine Learning."
    skills_found = [s["name"] for s in extract_skills_from_text(test_text)]
    assert "Python" in skills_found
    assert "C++" in skills_found
    assert "C#" in skills_found
    assert ".NET" in skills_found
    assert "Node.js" in skills_found
    assert "React" in skills_found
    assert "Machine Learning" in skills_found
    print(f"[PASS] 7. Skill Extraction (Successfully preserved technical terms: {skills_found})")

    # ----------------------------------------------------
    # TEST 8: Job Creation (Recruiter only)
    # ----------------------------------------------------
    # Login as demo recruiter
    rec_login = client.post("/api/auth/login", json={
        "email": "recruiter@example.com",
        "password": "Recruiter@123"
    })
    assert rec_login.status_code == 200
    rec_token = rec_login.json()["access_token"]
    rec_headers = {"Authorization": f"Bearer {rec_token}"}

    job_create_res = client.post("/api/jobs", json={
        "title": "Senior AI Systems Intern",
        "company": "DeepTech Dynamics",
        "description": "Looking for an intern skilled in Python, Machine Learning, Scikit-learn, SQL, and Git.",
        "experience_level": "Internship",
        "required_skills": ["Python", "Machine Learning", "Scikit-learn", "SQL", "Git"],
        "preferred_skills": ["FastAPI", "Docker"]
    }, headers=rec_headers)
    assert job_create_res.status_code == 201
    created_job_id = job_create_res.json()["id"]
    print(f"[PASS] 8. Job Creation (Created Job ID {created_job_id})")

    # ----------------------------------------------------
    # TEST 9: TF-IDF Processing
    # ----------------------------------------------------
    r_text = "Experienced in Python machine learning algorithms and SQL database design."
    j_text = "Looking for a Python engineer with machine learning and SQL experience."
    score, meta = compute_tfidf_similarity(r_text, j_text)
    assert score > 0.0
    assert "top_shared_terms" in meta
    print(f"[PASS] 9. TF-IDF Processing (Vectorized & extracted terms: {meta['top_shared_terms'][:3]})")

    # ----------------------------------------------------
    # TEST 10: Cosine Similarity Computation
    # ----------------------------------------------------
    assert 0.0 <= score <= 100.0
    print(f"[PASS] 10. Cosine Similarity (Computed match score: {score}%)")

    # ----------------------------------------------------
    # TEST 11: Required Skill Matching
    # ----------------------------------------------------
    cand_skills = ["Python", "SQL", "Git", "React"]
    job_req = ["Python", "SQL", "Machine Learning", "Scikit-learn", "Git"]
    gap_result = perform_skill_gap_analysis(cand_skills, job_req)
    assert set(gap_result["matched_skills"]) == {"Python", "SQL", "Git"}
    print(f"[PASS] 11. Required Skill Matching (Matched: {gap_result['matched_skills']})")

    # ----------------------------------------------------
    # TEST 12: Missing Skill Detection
    # ----------------------------------------------------
    assert set(gap_result["missing_skills"]) == {"Machine Learning", "Scikit-learn"}
    print(f"[PASS] 12. Missing Skill Detection (Identified missing gaps: {gap_result['missing_skills']})")

    # ----------------------------------------------------
    # TEST 13: Skill-gap Analysis Count & Percentage
    # ----------------------------------------------------
    assert gap_result["matched_count"] == 3
    assert gap_result["required_count"] == 5
    assert gap_result["skill_match_percentage"] == 60.0
    print(f"[PASS] 13. Skill-Gap Analysis (3/5 matched = 60.0%)")

    # ----------------------------------------------------
    # TEST 14: Learning Recommendations Generation
    # ----------------------------------------------------
    recs = gap_result["learning_recommendations"]
    assert len(recs) == 2
    rec_skills = [r["skill"] for r in recs]
    assert "Machine Learning" in rec_skills
    assert "Scikit-learn" in rec_skills
    print(f"[PASS] 14. Learning Recommendations (Generated curated areas for: {rec_skills})")

    # ----------------------------------------------------
    # TEST 15: Analysis History Retrieval
    # ----------------------------------------------------
    # Run an actual analysis API request first
    match_post_res = client.post("/api/analysis", json={
        "resume_id": resume_id,
        "job_id": created_job_id
    }, headers=auth_headers)
    assert match_post_res.status_code == 201
    analysis_id = match_post_res.json()["id"]

    history_res = client.get("/api/analysis/history", headers=auth_headers)
    assert history_res.status_code == 200
    assert len(history_res.json()) >= 1
    print(f"[PASS] 15. Analysis History (Fetched {len(history_res.json())} historical records)")

    # ----------------------------------------------------
    # TEST 16: Multiple Resume Analysis (Batch)
    # ----------------------------------------------------
    batch_res = client.post(
        f"/api/analysis/batch/{created_job_id}",
        json=[resume_id],
        headers=rec_headers
    )
    assert batch_res.status_code == 200
    assert len(batch_res.json()) >= 1
    print("[PASS] 16. Multiple Resume Analysis (Batch evaluation succeeded)")

    # ----------------------------------------------------
    # TEST 17: Candidate Comparison
    # ----------------------------------------------------
    compare_res = client.post(
        "/api/analysis/compare",
        json=[analysis_id],
        headers=rec_headers
    )
    assert compare_res.status_code == 200
    assert len(compare_res.json()) >= 1
    print("[PASS] 17. Candidate Comparison (Side-by-side matrix returned)")

    # ----------------------------------------------------
    # TEST 18: Unauthorized Resume Access Protection
    # ----------------------------------------------------
    # Register Candidate B
    cand_b_res = client.post("/api/auth/register", json={
        "name": "Candidate B",
        "email": f"cand_b_{os.getpid()}@example.com",
        "password": "Password@123",
        "confirm_password": "Password@123",
        "role": "CANDIDATE"
    })
    cand_b_token = cand_b_res.json()["access_token"]
    # Candidate B attempts to view Candidate A's resume
    unauth_res = client.get(f"/api/resumes/{resume_id}", headers={"Authorization": f"Bearer {cand_b_token}"})
    assert unauth_res.status_code == 403
    assert "Access denied" in unauth_res.text
    print("[PASS] 18. Unauthorized Resume Access (Blocked with 403 Forbidden)")

    # ----------------------------------------------------
    # TEST 19: Invalid File Upload Validation
    # ----------------------------------------------------
    invalid_file_res = client.post(
        "/api/resumes/upload",
        files={"file": ("malicious.exe", b"fake binary content", "application/x-msdownload")},
        headers=auth_headers
    )
    assert invalid_file_res.status_code == 400
    print("[PASS] 19. Invalid File Upload (Non-PDF rejected with 400 Bad Request)")

    # ----------------------------------------------------
    # TEST 20: Invalid API Requests & Security Validation
    # ----------------------------------------------------
    # Candidate trying to create a job (recruiter role required)
    cand_post_job = client.post("/api/jobs", json={
        "title": "Illegal Job",
        "company": "Fake",
        "description": "Short"
    }, headers=auth_headers)
    assert cand_post_job.status_code == 403
    print("[PASS] 20. Invalid API Requests (Role RBAC and bad request guards active)")

    print("==================================================")
    print("ALL 20 VERIFICATION TEST CASES PASSED SUCCESSFULLY")
    print("==================================================")

if __name__ == "__main__":
    test_full_platform_suite()
