"""Controlled Skills Dictionary and Category Taxonomy.
Defines canonical skills, aliases/variations, and category classifications.
"""

from typing import Dict, List, Set

# Skill Taxonomy by Category
SKILL_TAXONOMY: Dict[str, List[str]] = {
    "Programming Languages": [
        "Python", "Java", "C", "C++", "C#", "JavaScript", "TypeScript", 
        "Go", "Ruby", "PHP", "Rust", "Swift", "Kotlin", "R", "Scala", "Dart"
    ],
    "Web Development": [
        "React", "Angular", "Vue", "Node.js", "Express", "Spring Boot", 
        "Django", "Flask", "FastAPI", "HTML", "CSS", "Tailwind CSS", 
        "Next.js", "ASP.NET", "GraphQL", "REST API", "Bootstrap"
    ],
    "Databases": [
        "MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle", 
        "SQLite", "Cassandra", "DynamoDB", "Elasticsearch", "SQL"
    ],
    "AI & Machine Learning": [
        "Machine Learning", "Deep Learning", "NLP", "TensorFlow", 
        "PyTorch", "Scikit-learn", "Pandas", "NumPy", "OpenCV", 
        "Computer Vision", "Keras", "Data Science", "LLM", "Generative AI"
    ],
    "Cloud & DevOps": [
        "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", 
        "CI/CD", "Terraform", "Linux", "Jenkins", "Nginx"
    ],
    "Tools & Platforms": [
        "Git", "GitHub", "GitLab", "Jira", "Postman", 
        "VS Code", "Agile", "Scrum", "Unit Testing"
    ]
}

# Reverse mapping: Skill -> Category
SKILL_TO_CATEGORY: Dict[str, str] = {}
for category, skills in SKILL_TAXONOMY.items():
    for skill in skills:
        SKILL_TO_CATEGORY[skill] = category

# Canonical skill aliases & variations mapping (lowercase normalized -> Canonical Name)
SKILL_ALIASES: Dict[str, str] = {
    # Python
    "python": "Python",
    "python3": "Python",
    "python programming": "Python",

    # Java / C family
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "c plus plus": "C++",
    "c#": "C#",
    "csharp": "C#",
    "c sharp": "C#",
    ".net": ".NET",
    "dotnet": ".NET",
    ".net core": ".NET",
    "asp.net": "ASP.NET",
    "aspnet": "ASP.NET",

    # JavaScript / TypeScript / Frontend
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "react js": "React",
    "angular": "Angular",
    "angularjs": "Angular",
    "vue": "Vue",
    "vue.js": "Vue",
    "vuejs": "Vue",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "node js": "Node.js",
    "express": "Express",
    "express.js": "Express",
    "expressjs": "Express",
    "html": "HTML",
    "html5": "HTML",
    "css": "CSS",
    "css3": "CSS",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "bootstrap": "Bootstrap",

    # Backend frameworks
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "fast api": "FastAPI",
    "rest": "REST API",
    "rest api": "REST API",
    "restful": "REST API",
    "restful api": "REST API",
    "restful apis": "REST API",
    "graphql": "GraphQL",

    # Databases
    "sql": "SQL",
    "mysql": "MySQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "oracle": "Oracle",
    "sqlite": "SQLite",
    "cassandra": "Cassandra",
    "dynamodb": "DynamoDB",
    "dynamo db": "DynamoDB",
    "elasticsearch": "Elasticsearch",

    # AI / ML / Data Science
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "scikit-learn": "Scikit-learn",
    "scikitlearn": "Scikit-learn",
    "scikit learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "opencv": "OpenCV",
    "computer vision": "Computer Vision",
    "keras": "Keras",
    "data science": "Data Science",
    "llm": "LLM",
    "llms": "LLM",
    "large language models": "LLM",
    "generative ai": "Generative AI",
    "gen ai": "Generative AI",

    # Cloud & DevOps
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "google cloud": "Google Cloud",
    "google cloud platform": "Google Cloud",
    "gcp": "Google Cloud",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "terraform": "Terraform",
    "linux": "Linux",
    "jenkins": "Jenkins",
    "nginx": "Nginx",

    # Tools & Methods
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "jira": "Jira",
    "postman": "Postman",
    "vs code": "VS Code",
    "vscode": "VS Code",
    "agile": "Agile",
    "scrum": "Scrum",
    "unit testing": "Unit Testing",
    "go": "Go",
    "golang": "Go",
    "ruby": "Ruby",
    "php": "PHP",
    "rust": "Rust",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "r": "R",
    "scala": "Scala"
}

# All unique canonical skill names
ALL_CANONICAL_SKILLS: Set[str] = set(SKILL_TO_CATEGORY.keys())
