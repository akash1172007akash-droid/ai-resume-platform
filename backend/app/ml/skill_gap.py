"""Skill matching, gap detection, and curated generic learning recommendations.
"""

from typing import List, Dict, Any, Set
from app.ml.skill_extraction import normalize_skill_name

# Curated catalog of generic learning recommendations for technical skills
LEARNING_RECOMMENDATIONS_CATALOG: Dict[str, Dict[str, str]] = {
    "Python": {
        "title": "Python Core & Advanced Programming",
        "description": "Master Python data structures, object-oriented principles, generators, decorators, and type hinting.",
        "resource": "https://docs.python.org/3/tutorial/"
    },
    "Java": {
        "title": "Java Fundamentals & Modern Features",
        "description": "Study Java OOP, Collections framework, Streams API, and multithreading concepts.",
        "resource": "https://dev.java/learn/"
    },
    "C++": {
        "title": "Modern C++ Programming (C++17/20)",
        "description": "Learn memory management, pointers, STL containers, templates, and RAII principles.",
        "resource": "https://en.cppreference.com/"
    },
    "C#": {
        "title": "C# and .NET Modern Development",
        "description": "Explore C# syntax, LINQ queries, asynchronous programming (async/await), and .NET runtime.",
        "resource": "https://learn.microsoft.com/en-us/dotnet/csharp/"
    },
    "JavaScript": {
        "title": "Modern JavaScript (ES6+)",
        "description": "Understand asynchronous JavaScript (Promises, async/await), closures, DOM manipulation, and modular architecture.",
        "resource": "https://javascript.info/"
    },
    "TypeScript": {
        "title": "TypeScript Essentials for Scalable Apps",
        "description": "Learn static typing, interfaces, generics, union types, and integration with modern frontend/backend frameworks.",
        "resource": "https://www.typescriptlang.org/docs/"
    },
    "React": {
        "title": "React Modern Component Architecture",
        "description": "Practice functional components, Hooks (useEffect, useMemo, custom hooks), state management, and React Router.",
        "resource": "https://react.dev/learn"
    },
    "Node.js": {
        "title": "Node.js Server-Side Runtime & Event Loop",
        "description": "Build high-throughput REST APIs, understand the non-blocking event loop, stream processing, and NPM packaging.",
        "resource": "https://nodejs.org/en/learn"
    },
    "FastAPI": {
        "title": "High-Performance APIs with FastAPI & Pydantic",
        "description": "Construct OpenAPI-compliant asynchronous REST APIs, Pydantic data schemas, dependency injection, and JWT security.",
        "resource": "https://fastapi.tiangolo.com/tutorial/"
    },
    "Django": {
        "title": "Django Full-Stack Web Architecture",
        "description": "Master Django ORM, authentication system, middleware, and Django REST Framework for web APIs.",
        "resource": "https://docs.djangoproject.com/"
    },
    "Flask": {
        "title": "Lightweight Microservices with Flask",
        "description": "Build modular microservices with Flask Blueprints, SQLAlchemy ORM, and testing with pytest.",
        "resource": "https://flask.palletsprojects.com/"
    },
    "Spring Boot": {
        "title": "Enterprise Java Microservices with Spring Boot",
        "description": "Learn dependency injection, Spring Data JPA, Spring Security, and RESTful service design.",
        "resource": "https://spring.io/guides"
    },
    "SQL": {
        "title": "Relational Database Design & Advanced SQL",
        "description": "Write complex JOIN queries, subqueries, indexing strategies, aggregation, and query optimization.",
        "resource": "https://mode.com/sql-tutorial/"
    },
    "MySQL": {
        "title": "MySQL Administration and Index Tuning",
        "description": "Understand MySQL storage engines (InnoDB), transaction isolation levels, indexing, and backup procedures.",
        "resource": "https://dev.mysql.com/doc/"
    },
    "PostgreSQL": {
        "title": "PostgreSQL Advanced Features & JSONB",
        "description": "Leverage advanced window functions, CTEs, indexing with GiST/GIN, and ACID compliant transactions.",
        "resource": "https://www.postgresql.org/docs/"
    },
    "MongoDB": {
        "title": "NoSQL Document Modeling with MongoDB",
        "description": "Master MongoDB aggregation pipelines, document indexing, Mongoose ODM, and replica sets.",
        "resource": "https://www.mongodb.com/docs/"
    },
    "Redis": {
        "title": "In-Memory Caching & Pub/Sub with Redis",
        "description": "Implement caching layers, session stores, rate limiting, and Redis data structures (Hashes, Sorted Sets).",
        "resource": "https://redis.io/docs/"
    },
    "Machine Learning": {
        "title": "Machine Learning Fundamentals & Model Pipeline",
        "description": "Learn supervised and unsupervised learning algorithms, feature engineering, cross-validation, and metrics (Precision, Recall, ROC-AUC).",
        "resource": "https://scikit-learn.org/stable/tutorial/index.html"
    },
    "Deep Learning": {
        "title": "Deep Learning & Neural Architectures",
        "description": "Study artificial neural networks, backpropagation, CNNs for vision, and RNN/Transformer foundations.",
        "resource": "https://www.deeplearningbook.org/"
    },
    "NLP": {
        "title": "Natural Language Processing Foundations",
        "description": "Explore tokenization, TF-IDF representations, word embeddings (Word2Vec), and text classification techniques.",
        "resource": "https://web.stanford.edu/~jurafsky/slp3/"
    },
    "Scikit-learn": {
        "title": "Scikit-learn Model Training & Hyperparameter Tuning",
        "description": "Build reproducible ML pipelines using ColumnTransformer, Pipeline, GridSearchCV, and standard metrics.",
        "resource": "https://scikit-learn.org/stable/getting_started.html"
    },
    "Pandas": {
        "title": "Data Manipulation & Analysis with Pandas",
        "description": "Master DataFrames, group-by aggregations, time series analysis, missing value imputation, and merging datasets.",
        "resource": "https://pandas.pydata.org/docs/user_guide/index.html"
    },
    "NumPy": {
        "title": "Vectorized Numerical Computing with NumPy",
        "description": "Learn multi-dimensional arrays, broadcasting rules, linear algebra routines, and memory layout optimization.",
        "resource": "https://numpy.org/doc/stable/user/absolute_beginners.html"
    },
    "TensorFlow": {
        "title": "TensorFlow 2 & Keras Model Building",
        "description": "Construct neural network architectures using Keras Functional API, custom training loops, and TensorBoard.",
        "resource": "https://www.tensorflow.org/tutorials"
    },
    "PyTorch": {
        "title": "PyTorch Dynamic Neural Networks",
        "description": "Understand Tensors, Autograd, custom nn.Module classes, DataLoader pipelines, and GPU training acceleration.",
        "resource": "https://pytorch.org/tutorials/"
    },
    "Docker": {
        "title": "Containerization with Docker",
        "description": "Create efficient multi-stage Dockerfiles, manage images, container networking, and docker-compose configurations.",
        "resource": "https://docs.docker.com/get-started/"
    },
    "Kubernetes": {
        "title": "Container Orchestration with Kubernetes",
        "description": "Deploy Pods, Deployments, Services, ConfigMaps, and understand rolling updates and scaling on Kubernetes.",
        "resource": "https://kubernetes.io/docs/tutorials/"
    },
    "AWS": {
        "title": "AWS Cloud Architecture Essentials",
        "description": "Gain hands-on knowledge with AWS compute (EC2, ECS), storage (S3), serverless (Lambda), and networking (VPC).",
        "resource": "https://aws.amazon.com/getting-started/"
    },
    "Git": {
        "title": "Git Version Control & Collaboration Workflows",
        "description": "Master Git branching models (GitFlow, trunk-based), interactive rebasing, merge conflict resolution, and pull requests.",
        "resource": "https://git-scm.com/doc"
    },
    "CI/CD": {
        "title": "Continuous Integration & Deployment Automation",
        "description": "Set up automated test and build pipelines using GitHub Actions or Jenkins with containerized runners.",
        "resource": "https://docs.github.com/en/actions"
    },
    "Linux": {
        "title": "Linux Systems & Bash Shell Scripting",
        "description": "Work with Linux filesystem hierarchy, permissions, process management (systemd), and Bash automation scripts.",
        "resource": "https://linuxjourney.com/"
    }
}


def perform_skill_gap_analysis(
    resume_skills: List[str],
    job_required_skills: List[str]
) -> Dict[str, Any]:
    """
    Compares candidate resume skills against job required skills.
    
    Returns:
        {
            "matched_skills": [...],
            "missing_skills": [...],
            "additional_skills": [...],
            "matched_count": int,
            "required_count": int,
            "skill_match_percentage": float,
            "learning_recommendations": [...]
        }
    """
    # Normalize skill names for accurate comparison
    norm_resume_skills_map = {normalize_skill_name(s).lower(): normalize_skill_name(s) for s in resume_skills if s.strip()}
    norm_required_skills_map = {normalize_skill_name(s).lower(): normalize_skill_name(s) for s in job_required_skills if s.strip()}

    resume_set: Set[str] = set(norm_resume_skills_map.keys())
    required_set: Set[str] = set(norm_required_skills_map.keys())

    matched_keys = resume_set.intersection(required_set)
    missing_keys = required_set - resume_set
    additional_keys = resume_set - required_set

    # Map back to display names
    matched_skills = sorted([norm_required_skills_map[k] for k in matched_keys])
    missing_skills = sorted([norm_required_skills_map[k] for k in missing_keys])
    additional_skills = sorted([norm_resume_skills_map[k] for k in additional_keys])

    matched_count = len(matched_skills)
    required_count = len(required_set)

    if required_count > 0:
        skill_match_percentage = round((matched_count / required_count) * 100, 2)
    else:
        skill_match_percentage = 100.0 if matched_count > 0 else 0.0

    # Generate learning recommendations for missing skills
    recommendations = []
    for missing_skill in missing_skills:
        canonical_name = normalize_skill_name(missing_skill)
        rec_data = LEARNING_RECOMMENDATIONS_CATALOG.get(canonical_name)
        if rec_data:
            recommendations.append({
                "skill": canonical_name,
                "title": rec_data["title"],
                "description": rec_data["description"],
                "resource": rec_data.get("resource", "")
            })
        else:
            # Generic fallback recommendation
            recommendations.append({
                "skill": canonical_name,
                "title": f"{canonical_name} Fundamentals & Practical Application",
                "description": f"Study fundamental concepts, official documentation, and complete hands-on projects involving {canonical_name}.",
                "resource": f"https://www.google.com/search?q={canonical_name}+tutorial+documentation"
            })

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "additional_skills": additional_skills,
        "matched_count": matched_count,
        "required_count": required_count,
        "skill_match_percentage": skill_match_percentage,
        "learning_recommendations": recommendations
    }
