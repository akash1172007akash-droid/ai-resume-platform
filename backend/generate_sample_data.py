"""Script to generate realistic sample candidate PDF resumes using PyMuPDF and sample job descriptions.
"""

from pathlib import Path
import pymupdf

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "sample_data" / "resumes"
JOBS_DIR = Path(__file__).resolve().parent.parent / "sample_data" / "job_descriptions"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
JOBS_DIR.mkdir(parents=True, exist_ok=True)

SAMPLE_RESUMES = [
    {
        "filename": "resume_akash.pdf",
        "name": "Akash Sharma",
        "email": "akash.sharma@example.com",
        "title": "Software Engineering Student & Python Enthusiast",
        "summary": "Passionate Computer Science student with hands-on experience building backend APIs and machine learning models. Proficient in Python, SQL, and Git, with practical knowledge of FastAPI and Pandas.",
        "skills": "Python, SQL, MySQL, FastAPI, Git, GitHub, Pandas, Scikit-learn, Linux, REST API",
        "projects": [
            "AI Resume Matcher: Developed a web platform using Python, FastAPI, and Scikit-learn to match candidate resumes with job openings.",
            "E-Commerce Database Manager: Designed relational schemas and executed complex queries in MySQL and SQL."
        ],
        "education": "B.Tech in Computer Science and Engineering - 2022-2026"
    },
    {
        "filename": "resume_priya.pdf",
        "name": "Priya Verma",
        "email": "priya.verma@example.com",
        "title": "Machine Learning & Data Science Aspirant",
        "summary": "Data science enthusiast with a solid foundation in Machine Learning, Deep Learning, and Natural Language Processing. Experienced in training predictive models with Python, Pandas, NumPy, Scikit-learn, and PyTorch.",
        "skills": "Python, Machine Learning, Deep Learning, NLP, Scikit-learn, Pandas, NumPy, PyTorch, TensorFlow, Git",
        "projects": [
            "Customer Churn Prediction: Implemented classification pipelines in Python using Scikit-learn and Pandas with 89% accuracy.",
            "Sentiment Analysis with NLP: Tokenized and analyzed sentiment of 50,000 tweets using PyTorch and NLP embeddings."
        ],
        "education": "B.S. in Data Science & Artificial Intelligence - 2022-2026"
    },
    {
        "filename": "resume_rahul.pdf",
        "name": "Rahul Nair",
        "email": "rahul.nair@example.com",
        "title": "Full Stack Developer",
        "summary": "Versatile developer focused on full-stack web applications. Proficient in React, JavaScript, HTML, CSS, Spring Boot, Java, and MySQL database engineering.",
        "skills": "React, JavaScript, TypeScript, HTML, CSS, Tailwind CSS, Spring Boot, Java, MySQL, REST API, Git",
        "projects": [
            "Healthcare Portal: Built a full-stack dashboard with React on frontend and Java Spring Boot backend, integrated with MySQL.",
            "Task Collaboration Suite: Responsive web app using React, Tailwind CSS, and RESTful APIs."
        ],
        "education": "B.Tech in Information Technology - 2021-2025"
    },
    {
        "filename": "resume_sneha.pdf",
        "name": "Sneha Patel",
        "email": "sneha.patel@example.com",
        "title": "DevOps & Cloud Engineer",
        "summary": "Cloud enthusiast with expertise in AWS, Docker, Kubernetes, CI/CD automation, and Linux administration. Skilled in Python scripting and infrastructure deployment.",
        "skills": "AWS, Docker, Kubernetes, CI/CD, Jenkins, Linux, Python, Git, Terraform, Nginx",
        "projects": [
            "Automated Microservice Pipeline: Configured Docker and Jenkins CI/CD pipelines deploying containerized apps to AWS.",
            "Kubernetes Cluster Orchestration: Managed Kubernetes deployments and ingress rules on Linux instances."
        ],
        "education": "B.E. in Computer Engineering - 2021-2025"
    }
]

def create_resume_pdf(data: dict, out_path: Path):
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)  # A4 standard

    y = 50
    # Header
    page.insert_text((50, y), data["name"], fontsize=20, fontname="helv", color=(0.1, 0.2, 0.4))
    y += 22
    page.insert_text((50, y), f"{data['title']} | {data['email']}", fontsize=11, fontname="helv", color=(0.3, 0.3, 0.3))
    y += 18
    page.draw_line((50, y), (545, y), color=(0.7, 0.7, 0.7), width=1)
    y += 25

    # Summary
    page.insert_text((50, y), "PROFESSIONAL SUMMARY", fontsize=12, fontname="helv", color=(0.1, 0.2, 0.4))
    y += 18
    # Wrap text simply
    summary_words = data["summary"].split()
    line = ""
    for w in summary_words:
        if len(line + " " + w) > 75:
            page.insert_text((50, y), line.strip(), fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
            y += 15
            line = w
        else:
            line += " " + w
    if line:
        page.insert_text((50, y), line.strip(), fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
        y += 22

    # Technical Skills
    page.insert_text((50, y), "TECHNICAL SKILLS", fontsize=12, fontname="helv", color=(0.1, 0.2, 0.4))
    y += 18
    page.insert_text((50, y), f"Skills: {data['skills']}", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
    y += 25

    # Projects
    page.insert_text((50, y), "PROJECT EXPERIENCE", fontsize=12, fontname="helv", color=(0.1, 0.2, 0.4))
    y += 18
    for proj in data["projects"]:
        words = proj.split()
        pline = "• "
        for pw in words:
            if len(pline + " " + pw) > 75:
                page.insert_text((50, y), pline.strip(), fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
                y += 15
                pline = "  " + pw
            else:
                pline += " " + pw
        if pline:
            page.insert_text((50, y), pline.strip(), fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
            y += 18
    y += 10

    # Education
    page.insert_text((50, y), "EDUCATION", fontsize=12, fontname="helv", color=(0.1, 0.2, 0.4))
    y += 18
    page.insert_text((50, y), data["education"], fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))

    doc.save(str(out_path))
    doc.close()
    print(f"Generated PDF: {out_path.name}")

# Generate sample jobs
SAMPLE_JOBS = [
    {
        "filename": "python_ml_intern.txt",
        "title": "Python Machine Learning Intern",
        "company": "Apex AI Technologies",
        "description": "We are seeking a motivated Python Machine Learning Intern to join our data intelligence team. The candidate will work on developing ML models, feature engineering pipelines, and REST APIs. Required skills include Python, SQL, Machine Learning, Pandas, and Scikit-learn. Preferred skills: FastAPI, React, and Git.",
        "experience_level": "Internship"
    },
    {
        "filename": "python_dev_intern.txt",
        "title": "Python Developer Intern",
        "company": "CloudScale Software",
        "description": "Looking for a Python Developer Intern to build scalable backend services. Required skills: Python, SQL, Git, and FastAPI. Experience with Linux, MySQL, and Docker is preferred.",
        "experience_level": "Internship"
    },
    {
        "filename": "fullstack_dev_intern.txt",
        "title": "Full Stack Developer Intern",
        "company": "NextGen Digital",
        "description": "Seeking an enthusiastic Full Stack Developer Intern. The role involves designing interactive web frontends using React and JavaScript, combined with enterprise backend APIs built in Java and Spring Boot with MySQL databases.",
        "experience_level": "Entry-level"
    }
]

if __name__ == "__main__":
    for item in SAMPLE_RESUMES:
        p = OUTPUT_DIR / item["filename"]
        create_resume_pdf(item, p)

    for j in SAMPLE_JOBS:
        jp = JOBS_DIR / j["filename"]
        with open(jp, "w", encoding="utf-8") as f:
            f.write(f"Title: {j['title']}\nCompany: {j['company']}\nLevel: {j['experience_level']}\n\n{j['description']}\n")
        print(f"Generated Job: {jp.name}")
