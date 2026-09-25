# AI Resume Intelligence & Job Matching Platform

A full-stack, production-style recruitment technology platform that automates PDF resume extraction, technical skill detection, TF-IDF vectorization, cosine similarity job matching, and skill gap analysis with curated learning recommendations.

**🌐 Live Demo Website**: [https://akash1172007akash-droid.github.io/ai-resume-platform/](https://akash1172007akash-droid.github.io/ai-resume-platform/)  
**📂 GitHub Repository**: [https://github.com/akash1172007akash-droid/ai-resume-platform](https://github.com/akash1172007akash-droid/ai-resume-platform)

---

## Overview

The **AI Resume Intelligence & Job Matching Platform** bridges the gap between candidate resumes and job descriptions through transparent natural language processing and machine learning algorithms.

Rather than acting as a black-box hiring decider, the system functions as an **explainable intelligence engine**:
- It extracts text cleanly from text-based PDF resumes using **PyMuPDF**.
- It normalizes and preserves technical syntax (`C++`, `C#`, `.NET`, `Node.js`, `React.js`).
- It extracts technical skills using a **controlled taxonomy** and multi-word alias dictionary.
- It computes a **Job Match Score** using **Scikit-learn TF-IDF vectorization** and **Cosine Similarity**.
- It deterministically identifies **Matched Skills**, **Missing Skills (Skill Gaps)**, and **Additional Skills**.
- It provides **curated learning recommendations** with links to official guides for missing technical skills.
- It equips recruiters with job posting tools, batch resume evaluations, distribution analytics, and side-by-side multi-candidate comparison tables.

---

## Problem Statement

Traditional applicant tracking workflows either rely on rigid keyword searches that fail to understand technical variations (e.g., treating `"scikit-learn"`, `"sklearn"`, and `"scikit learn"` as unrelated terms) or use opaque deep learning models that are impossible to explain, slow to run, and prone to hallucinations.

Job seekers often receive generic rejection emails without knowing what skills they lacked or how to upskill. Recruiters struggle to compare multiple candidates against required versus preferred technical competencies.

---

## Solution

This platform implements a lightweight, fully deterministic and explainable pipeline:
1. **PyMuPDF Engine**: Parses text directly from PDF pages with validation against corrupt or scanned documents.
2. **Technical Token Protection**: Prevents destruction of punctuation in programming symbols (`C++`, `.NET`, `C#`).
3. **Controlled Taxonomy Engine**: Matches canonical skills across Programming Languages, Web, Databases, AI/ML, Cloud/DevOps, and Tools.
4. **TF-IDF + Cosine Similarity**: Evaluates semantic vocabulary overlap between candidate experience and role specifications.
5. **Skill Gap & Learning Engine**: Pinpoints missing skills and generates targeted learning topics with official documentation links.
6. **Recruiter Decision Dashboard**: Displays application metrics, pipeline distribution charts, and candidate comparison matrices.

---

## User Roles

### 1. CANDIDATE
- Register and login securely with JWT authentication.
- Upload PDF resume and view extracted text and detected skills.
- Compare resume against active job openings or paste custom job descriptions.
- Inspect **Job Match Score** and **Required Skills Matched**.
- Explore **Skill Gap Analysis** (Matched, Missing, Additional skills).
- Review **Generic Learning Recommendations** to bridge technical gaps.
- Access historical match reports and manage uploaded resumes.

### 2. RECRUITER
- Create, view, update, and manage job postings.
- Specify required and preferred technical skills.
- Access the pool of candidate PDF resumes.
- Execute **Batch Candidate Analysis** across multiple resumes for a job opening.
- Review macro analytics: application volume per job, skill demand frequencies, and average similarity.
- Conduct **Side-by-Side Multi-Candidate Comparisons** across scores, skills, and gaps.

---

## Technology Stack

- **Frontend**: React 19, Vite 6, React Router DOM v7, Axios, Recharts, Lucide Icons, Tailwind CSS v4.
- **Backend**: Python 3.14, FastAPI, Uvicorn ASGI, Pydantic v2.
- **AI & ML**: Scikit-learn (`TfidfVectorizer`, `cosine_similarity`), NumPy, Pandas.
- **PDF Processing**: PyMuPDF (`pymupdf`).
- **Database**: MySQL 8.0 with SQLAlchemy 2.0 ORM and PyMySQL driver.
- **Security**: JWT (`pyjwt`), password hashing with salt (`bcrypt`).
- **Testing**: Pytest, Starlette / HTTPX `TestClient`.

---

## System Architecture

```
React Frontend (Vite)
       │
       ▼ (REST API / Bearer JWT)
FastAPI Router (/api/auth, /api/resumes, /api/jobs, /api/analysis, /api/dashboard)
       │
       ├────────────────────────┬────────────────────────┐
       ▼                        ▼                        ▼
PyMuPDF Text Extractor    NLP Preprocessing      Scikit-learn TF-IDF
       │                        │                        │
       ▼                        ▼                        ▼
PDF File Storage          Skill Extraction       Cosine Similarity & Gap Analysis
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                ▼
                    MySQL Database (ai_resume_db)
```

---

## ML Pipeline

```
Resume PDF
   │
   ▼
1. PDF Text Extraction (PyMuPDF)
   │
   ▼
2. Technical Token Protection (Preserves C++, C#, .NET, Node.js)
   │
   ▼
3. Controlled Skill Taxonomy & Alias Normalization
   │
   ▼
4. TF-IDF Vectorization with N-Grams (1, 2)
   │
   ▼
5. Cosine Similarity Computation:
      cosine_similarity(u, v) = (u · v) / (||u|| * ||v||)
   │
   ▼
6. Deterministic Skill Matching:
      Matched   = S_resume ∩ S_required
      Missing   = S_required \ S_resume
      Extra     = S_resume \ S_required
   │
   ▼
7. Curated Learning Recommendations
```

For full mathematical equations and tokenization details, see [`docs/ml_pipeline.md`](docs/ml_pipeline.md).

---

## Database Design

Database: `ai_resume_db` (MySQL 8.0)
- `users`: ID, name, email, password hash, role (`CANDIDATE`, `RECRUITER`), timestamps.
- `resumes`: User ID foreign key, filename, file path, file size, extracted text, clean text, timestamps.
- `resume_skills`: Resume ID FK, skill name, category (`UNIQUE(resume_id, skill_name)`).
- `jobs`: Recruiter ID FK, title, company, description, experience level, timestamps.
- `job_required_skills` & `job_preferred_skills`: Job ID FK, skill name.
- `match_analyses`: Resume ID FK, Job ID FK, similarity score, skill match percentage, counts, timestamps.
- `skill_gaps`: Analysis ID FK, skill name, status (`MATCHED`, `MISSING`, `ADDITIONAL`), learning recommendation text.
- `learning_recommendations`: Master lookup catalog of skill learning guides and resource links.

---

## Installation & Setup

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ and npm
- MySQL Server 8.0 running locally on port 3306

### 1. Database Setup
Log into MySQL and verify or execute `database/schema.sql`:
```bash
mysql -u root -p < database/schema.sql
```
*(The backend also automatically creates tables on launch if they do not exist)*.

### 2. Backend Installation & Seeding
```bash
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Generate sample resumes and job files
python generate_sample_data.py

# Seed demo users, live jobs, sample resumes and initial analysis
python seed_database.py
```

### 3. Frontend Installation
```bash
cd ../frontend

# Install node dependencies
npm install

# Test production build
npm run build
```

---

## Running the Application

### Start the FastAPI Backend
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`

### Start the React Frontend
In a separate terminal:
```bash
cd frontend
npm run dev
```
- Frontend Web App: `http://localhost:5173`

---

## Demo Credentials

The database seeder provisions ready-to-test accounts:

| Role | Email | Password | Preloaded Data |
| :--- | :--- | :--- | :--- |
| **Candidate** | `candidate@example.com` | `Candidate@123` | Akash Sharma, pre-loaded Python/ML resume |
| **Candidate** | `priya@example.com` | `Priya@123` | Priya Verma, Data Science resume |
| **Candidate** | `rahul@example.com` | `Rahul@123` | Rahul Nair, Full Stack React resume |
| **Recruiter** | `recruiter@example.com` | `Recruiter@123` | Sarah Jenkins, 3 active job postings |

*Quick login buttons are also provided on the login page for instantaneous demo access.*

---

## Automated Verification & Testing

Run the comprehensive 20-item end-to-end verification test suite:
```bash
cd backend
python test_suite.py
```
**Test Results (20/20 Passed)**:
1. User registration (`POST /api/auth/register`) — **PASSED**
2. User login (`POST /api/auth/login`) — **PASSED**
3. JWT authentication (`GET /api/auth/me`) — **PASSED**
4. Resume PDF upload (`POST /api/resumes/upload`) — **PASSED**
5. PDF text extraction with PyMuPDF — **PASSED**
6. Empty/corrupt PDF handling (400/422 Bad Request) — **PASSED**
7. Skill extraction preserving technical terms (`C++`, `.NET`, `Node.js`) — **PASSED**
8. Job creation (`POST /api/jobs`) — **PASSED**
9. TF-IDF vectorization & N-Gram processing — **PASSED**
10. Cosine similarity score computation — **PASSED**
11. Required skill matching — **PASSED**
12. Missing skill detection (Skill gaps) — **PASSED**
13. Skill-gap count & percentage — **PASSED**
14. Curated learning recommendations — **PASSED**
15. Analysis history retrieval (`GET /api/analysis/history`) — **PASSED**
16. Multiple resume analysis batch workflow — **PASSED**
17. Multi-candidate comparison matrix — **PASSED**
18. Unauthorized resume access protection (403 Forbidden) — **PASSED**
19. Invalid file upload validation (non-PDF blocked) — **PASSED**
20. Invalid API requests and RBAC guards — **PASSED**

---

## Important Limitation & Ethical Disclosure

> [!IMPORTANT]
> **Application Metric vs Hiring Decision**:
> The "Job Match Score" and "Similarity Score" generated by this platform are automated mathematical representations of vocabulary overlap (TF-IDF cosine similarity) and controlled skill dictionary matches.
>
> - **They do NOT represent candidate hiring probability.**
> - **They do NOT guarantee job placement or predict workplace performance.**
> - **They must never be used as an automated elimination or selection tool.**
> - The recruiter and hiring team remain the sole human decision-makers.

---

## 60-Second Interview Explanation

> *"I designed and built the AI Resume Intelligence & Job Matching Platform, a full-stack recruitment technology web application built with React, FastAPI, Scikit-learn, PyMuPDF, and MySQL.*
>
> *When a candidate uploads a PDF resume, PyMuPDF extracts raw text while our custom NLP pipeline preserves technical tokens like C++, C#, .NET, and Node.js. A controlled dictionary extracts categorized technical skills, and Scikit-learn's TF-IDF vectorizer computes cosine similarity against job openings.*
>
> *Crucially, we separate textual similarity from explicit skill gap matching. The platform highlights matched skills, identifies missing competencies, and generates curated learning recommendations to help candidates upskill. For recruiters, it offers batch resume evaluations, distribution analytics, and multi-candidate comparison tables—with strict ethical disclosures that these scores represent similarity metrics rather than hiring probabilities."*

---

## Author
Senior Full-Stack AI/ML Engineer & Product Designer
Developed for the Advanced Recruitment Intelligence Evaluation Suite.
