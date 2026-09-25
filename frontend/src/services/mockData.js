/**
 * Client-Side Interactive Engine for GitHub Pages Static Deployment.
 * Allows the entire application to be 100% interactive on static web hosts like GitHub Pages
 * when a local or live FastAPI backend is not connected.
 */

export const INITIAL_MOCK_USERS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    email: 'recruiter@example.com',
    password: 'Recruiter@123',
    role: 'RECRUITER',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Akash Sharma',
    email: 'candidate@example.com',
    password: 'Candidate@123',
    role: 'CANDIDATE',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Priya Verma',
    email: 'priya@example.com',
    password: 'Priya@123',
    role: 'CANDIDATE',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Rahul Nair',
    email: 'rahul@example.com',
    password: 'Rahul@123',
    role: 'CANDIDATE',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_MOCK_JOBS = [
  {
    id: 1,
    recruiter_id: 1,
    title: 'Python Machine Learning Intern',
    company: 'Apex AI Technologies',
    experience_level: 'Internship',
    description:
      'We are seeking a motivated Python Machine Learning Intern to join our data intelligence team. The candidate will work on developing ML models, feature engineering pipelines, and REST APIs. Required skills include Python, SQL, Machine Learning, Pandas, and Scikit-learn. Preferred skills: FastAPI, React, and Git.',
    required_skills: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'Scikit-learn'],
    preferred_skills: ['FastAPI', 'React', 'Git'],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    analysis_count: 3,
  },
  {
    id: 2,
    recruiter_id: 1,
    title: 'Python Developer Intern',
    company: 'CloudScale Software',
    experience_level: 'Internship',
    description:
      'Looking for a Python Developer Intern to build scalable backend services. Required skills: Python, SQL, Git, and FastAPI. Experience with Linux, MySQL, and Docker is preferred.',
    required_skills: ['Python', 'SQL', 'Git', 'FastAPI'],
    preferred_skills: ['Linux', 'MySQL', 'Docker'],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    analysis_count: 1,
  },
  {
    id: 3,
    recruiter_id: 1,
    title: 'Full Stack Developer Intern',
    company: 'NextGen Digital',
    experience_level: 'Entry-level',
    description:
      'Seeking an enthusiastic Full Stack Developer Intern. The role involves designing interactive web frontends using React and JavaScript, combined with enterprise backend APIs built in Java and Spring Boot with MySQL databases.',
    required_skills: ['React', 'JavaScript', 'Spring Boot', 'MySQL'],
    preferred_skills: ['Tailwind CSS', 'Docker'],
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
    analysis_count: 1,
  },
];

export const INITIAL_MOCK_RESUMES = [
  {
    id: 1,
    user_id: 2,
    candidate_name: 'Akash Sharma',
    candidate_email: 'candidate@example.com',
    filename: 'resume_akash.pdf',
    file_size: 15420,
    uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    skills_count: 10,
    extracted_text:
      'Akash Sharma | Software Engineering Student & Python Enthusiast. Proficient in Python, SQL, MySQL, FastAPI, Git, GitHub, Pandas, Scikit-learn, Linux, and REST APIs. Built AI Resume Matcher and E-Commerce Database Manager.',
    clean_text:
      'akash sharma software engineering student python enthusiast proficient python sql mysql fastapi git github pandas scikit-learn linux rest api built ai resume matcher ecommerce database manager',
    skills: [
      { id: 1, skill_name: 'Python', category: 'Programming Languages' },
      { id: 2, skill_name: 'SQL', category: 'Databases' },
      { id: 3, skill_name: 'MySQL', category: 'Databases' },
      { id: 4, skill_name: 'FastAPI', category: 'Web Development' },
      { id: 5, skill_name: 'Git', category: 'Tools & Platforms' },
      { id: 6, skill_name: 'GitHub', category: 'Tools & Platforms' },
      { id: 7, skill_name: 'Pandas', category: 'AI & Machine Learning' },
      { id: 8, skill_name: 'Scikit-learn', category: 'AI & Machine Learning' },
      { id: 9, skill_name: 'Linux', category: 'Cloud & DevOps' },
      { id: 10, skill_name: 'REST API', category: 'Web Development' },
    ],
  },
  {
    id: 2,
    user_id: 3,
    candidate_name: 'Priya Verma',
    candidate_email: 'priya@example.com',
    filename: 'resume_priya.pdf',
    file_size: 14880,
    uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    skills_count: 9,
    extracted_text:
      'Priya Verma | Data Science Aspirant. Strong foundation in Machine Learning, Deep Learning, NLP, PyTorch, TensorFlow, Scikit-learn, Pandas, NumPy, and Python. Projects in customer churn prediction and sentiment analysis.',
    clean_text:
      'priya verma data science aspirant strong foundation machine learning deep learning nlp pytorch tensorflow scikit-learn pandas numpy python projects customer churn prediction sentiment analysis',
    skills: [
      { id: 11, skill_name: 'Python', category: 'Programming Languages' },
      { id: 12, skill_name: 'Machine Learning', category: 'AI & Machine Learning' },
      { id: 13, skill_name: 'Deep Learning', category: 'AI & Machine Learning' },
      { id: 14, skill_name: 'NLP', category: 'AI & Machine Learning' },
      { id: 15, skill_name: 'PyTorch', category: 'AI & Machine Learning' },
      { id: 16, skill_name: 'TensorFlow', category: 'AI & Machine Learning' },
      { id: 17, skill_name: 'Scikit-learn', category: 'AI & Machine Learning' },
      { id: 18, skill_name: 'Pandas', category: 'AI & Machine Learning' },
      { id: 19, skill_name: 'NumPy', category: 'AI & Machine Learning' },
    ],
  },
  {
    id: 3,
    user_id: 4,
    candidate_name: 'Rahul Nair',
    candidate_email: 'rahul@example.com',
    filename: 'resume_rahul.pdf',
    file_size: 16210,
    uploaded_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    skills_count: 8,
    extracted_text:
      'Rahul Nair | Full Stack Developer. Proficient in React, JavaScript, TypeScript, HTML, CSS, Tailwind CSS, Spring Boot, Java, MySQL, and Git. Developed healthcare portals and responsive web applications.',
    clean_text:
      'rahul nair full stack developer proficient react javascript typescript html css tailwind css spring boot java mysql git developed healthcare portals responsive web applications',
    skills: [
      { id: 20, skill_name: 'React', category: 'Web Development' },
      { id: 21, skill_name: 'JavaScript', category: 'Programming Languages' },
      { id: 22, skill_name: 'TypeScript', category: 'Programming Languages' },
      { id: 23, skill_name: 'Spring Boot', category: 'Web Development' },
      { id: 24, skill_name: 'Java', category: 'Programming Languages' },
      { id: 25, skill_name: 'MySQL', category: 'Databases' },
      { id: 26, skill_name: 'Tailwind CSS', category: 'Web Development' },
      { id: 27, skill_name: 'Git', category: 'Tools & Platforms' },
    ],
  },
];

export const INITIAL_MOCK_ANALYSES = [
  {
    id: 1,
    resume_id: 1,
    job_id: 1,
    candidate_name: 'Akash Sharma',
    candidate_email: 'candidate@example.com',
    resume_filename: 'resume_akash.pdf',
    job_title: 'Python Machine Learning Intern',
    company: 'Apex AI Technologies',
    experience_level: 'Internship',
    similarity_score: 74.2,
    skill_match_percentage: 80.0,
    matched_skill_count: 4,
    required_skill_count: 5,
    matched_skills: ['Python', 'SQL', 'Pandas', 'Scikit-learn'],
    missing_skills: ['Machine Learning'],
    additional_skills: ['FastAPI', 'Linux', 'MySQL', 'Git', 'GitHub', 'REST API'],
    learning_recommendations: [
      {
        skill: 'Machine Learning',
        title: 'Machine Learning Fundamentals & Model Pipeline',
        description:
          'Learn supervised and unsupervised learning algorithms, feature engineering, cross-validation, and metrics (Precision, Recall, ROC-AUC).',
        resource: 'https://scikit-learn.org/stable/tutorial/index.html',
      },
    ],
    metric_disclaimer:
      'This Job Match Score is an automated text and skill similarity metric generated by the platform. It does not represent hiring probability or guarantee employment selection.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 2,
    resume_id: 2,
    job_id: 1,
    candidate_name: 'Priya Verma',
    candidate_email: 'priya@example.com',
    resume_filename: 'resume_priya.pdf',
    job_title: 'Python Machine Learning Intern',
    company: 'Apex AI Technologies',
    experience_level: 'Internship',
    similarity_score: 81.5,
    skill_match_percentage: 80.0,
    matched_skill_count: 4,
    required_skill_count: 5,
    matched_skills: ['Python', 'Machine Learning', 'Pandas', 'Scikit-learn'],
    missing_skills: ['SQL'],
    additional_skills: ['Deep Learning', 'NLP', 'PyTorch', 'TensorFlow', 'NumPy'],
    learning_recommendations: [
      {
        skill: 'SQL',
        title: 'Relational Database Design & Advanced SQL',
        description:
          'Write complex JOIN queries, subqueries, indexing strategies, aggregation, and query optimization.',
        resource: 'https://mode.com/sql-tutorial/',
      },
    ],
    metric_disclaimer:
      'This Job Match Score is an automated text and skill similarity metric generated by the platform. It does not represent hiring probability or guarantee employment selection.',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 3,
    resume_id: 3,
    job_id: 1,
    candidate_name: 'Rahul Nair',
    candidate_email: 'rahul@example.com',
    resume_filename: 'resume_rahul.pdf',
    job_title: 'Python Machine Learning Intern',
    company: 'Apex AI Technologies',
    experience_level: 'Internship',
    similarity_score: 22.0,
    skill_match_percentage: 0.0,
    matched_skill_count: 0,
    required_skill_count: 5,
    matched_skills: [],
    missing_skills: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'Scikit-learn'],
    additional_skills: ['React', 'JavaScript', 'TypeScript', 'Spring Boot', 'Java', 'MySQL'],
    learning_recommendations: [
      {
        skill: 'Python',
        title: 'Python Core & Advanced Programming',
        description: 'Master Python data structures, OOP principles, and clean syntax.',
        resource: 'https://docs.python.org/3/tutorial/',
      },
      {
        skill: 'Machine Learning',
        title: 'Machine Learning Fundamentals & Model Pipeline',
        description: 'Learn supervised and unsupervised learning algorithms.',
        resource: 'https://scikit-learn.org/stable/tutorial/index.html',
      },
    ],
    metric_disclaimer:
      'This Job Match Score is an automated text and skill similarity metric generated by the platform. It does not represent hiring probability or guarantee employment selection.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export const SKILL_RECOMMENDATIONS_CATALOG = {
  Python: {
    title: 'Python Core & Advanced Programming',
    description: 'Master Python data structures, object-oriented principles, and clean syntax.',
    resource: 'https://docs.python.org/3/tutorial/',
  },
  SQL: {
    title: 'Relational Database Design & Advanced SQL',
    description: 'Write complex JOIN queries, subqueries, and database indexing.',
    resource: 'https://mode.com/sql-tutorial/',
  },
  'Machine Learning': {
    title: 'Machine Learning Fundamentals & Model Pipeline',
    description: 'Study supervised learning, regression, classification, and metrics.',
    resource: 'https://scikit-learn.org/stable/tutorial/index.html',
  },
  'Scikit-learn': {
    title: 'Scikit-learn Pipelines & Evaluation',
    description: 'Build robust pipelines, GridSearchCV hyperparameter tuning, and cross-validation.',
    resource: 'https://scikit-learn.org/stable/getting_started.html',
  },
  Pandas: {
    title: 'Data Wrangling & Analysis with Pandas',
    description: 'Master DataFrames, aggregations, missing values, and merges.',
    resource: 'https://pandas.pydata.org/docs/user_guide/index.html',
  },
  FastAPI: {
    title: 'High-Performance APIs with FastAPI',
    description: 'Construct asynchronous OpenAPI REST endpoints and schemas.',
    resource: 'https://fastapi.tiangolo.com/tutorial/',
  },
  React: {
    title: 'Modern React Architecture & Hooks',
    description: 'Build declarative UIs with functional components and hooks.',
    resource: 'https://react.dev/learn',
  },
  Docker: {
    title: 'Containerization with Docker',
    description: 'Multi-stage Dockerfiles and container networks.',
    resource: 'https://docs.docker.com/get-started/',
  },
  Git: {
    title: 'Git Version Control & Workflows',
    description: 'Master Git branching, commits, and pull request workflows.',
    resource: 'https://git-scm.com/doc',
  },
};
