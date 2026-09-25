import axios from 'axios';
import {
  INITIAL_MOCK_USERS,
  INITIAL_MOCK_JOBS,
  INITIAL_MOCK_RESUMES,
  INITIAL_MOCK_ANALYSES,
  SKILL_RECOMMENDATIONS_CATALOG,
} from './mockData';

// Initialize localStorage stores if empty
const initStorage = () => {
  if (!localStorage.getItem('mock_users')) {
    localStorage.setItem('mock_users', JSON.stringify(INITIAL_MOCK_USERS));
  }
  if (!localStorage.getItem('mock_jobs')) {
    localStorage.setItem('mock_jobs', JSON.stringify(INITIAL_MOCK_JOBS));
  }
  if (!localStorage.getItem('mock_resumes')) {
    localStorage.setItem('mock_resumes', JSON.stringify(INITIAL_MOCK_RESUMES));
  }
  if (!localStorage.getItem('mock_analyses')) {
    localStorage.setItem('mock_analyses', JSON.stringify(INITIAL_MOCK_ANALYSES));
  }
};
initStorage();

const getStore = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setStore = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fallback Mock Router for static GitHub Pages hosting
const handleMockFallback = async (error) => {
  const config = error.config;
  if (!config) return Promise.reject(error);

  const url = config.url.replace(/^.*\/api/, '');
  const method = config.method.toUpperCase();
  let data = {};
  if (config.data) {
    if (typeof config.data === 'string') {
      try {
        data = JSON.parse(config.data);
      } catch (e) {
        data = config.data;
      }
    } else {
      data = config.data;
    }
  }

  // Helper for mock user
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  console.warn(`[Client Mock Engine] Servicing ${method} ${url} offline`);

  // 1. Auth routes
  if (url === '/auth/login' && method === 'POST') {
    const users = getStore('mock_users');
    const u = users.find(
      (user) => user.email.toLowerCase() === data.email?.toLowerCase() && user.password === data.password
    );
    if (u) {
      return {
        data: {
          access_token: `mock_jwt_token_${u.id}_${Date.now()}`,
          token_type: 'bearer',
          user: { id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.created_at },
        },
      };
    }
    return Promise.reject({ response: { status: 401, data: { detail: 'Invalid demo credentials.' } } });
  }

  if (url === '/auth/register' && method === 'POST') {
    const users = getStore('mock_users');
    const newUser = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'CANDIDATE',
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    setStore('mock_users', users);
    return {
      data: {
        access_token: `mock_jwt_token_${newUser.id}_${Date.now()}`,
        token_type: 'bearer',
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, created_at: newUser.created_at },
      },
    };
  }

  if (url === '/auth/me' && method === 'GET') {
    if (currentUser) return { data: currentUser };
    return Promise.reject({ response: { status: 401, data: { detail: 'Unauthorized' } } });
  }

  // 2. Dashboard routes
  if (url === '/dashboard/candidate' && method === 'GET') {
    const resumes = getStore('mock_resumes').filter((r) => !currentUser || r.user_id === currentUser.id);
    const analyses = getStore('mock_analyses');
    const latest = resumes[0] || null;
    return {
      data: {
        total_resumes: resumes.length,
        latest_resume: latest
          ? {
              id: latest.id,
              filename: latest.filename,
              file_size: latest.file_size,
              uploaded_at: latest.uploaded_at,
              skills: latest.skills.map((s) => s.skill_name),
            }
          : null,
        detected_skills_count: latest ? latest.skills.length : 0,
        total_analyses: analyses.length,
        recent_analyses: analyses.slice(0, 10),
      },
    };
  }

  if (url === '/dashboard/recruiter' && method === 'GET') {
    const jobs = getStore('mock_jobs');
    const resumes = getStore('mock_resumes');
    const analyses = getStore('mock_analyses');
    const avgScore =
      analyses.reduce((acc, a) => acc + (a.similarity_score || 0), 0) / (analyses.length || 1);

    const dist = jobs.map((j) => ({
      job_id: j.id,
      job_title: j.title,
      company: j.company,
      resumes_analyzed: analyses.filter((a) => a.job_id === j.id).length,
    }));

    const skillCounts = {};
    jobs.forEach((j) => {
      j.required_skills?.forEach((sk) => {
        skillCounts[sk] = (skillCounts[sk] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count);

    return {
      data: {
        total_jobs: jobs.length,
        total_resumes: resumes.length,
        total_analyses: analyses.length,
        avg_similarity_score: Math.round(avgScore * 10) / 10,
        job_analyses_distribution: dist,
        top_demanded_skills: topSkills,
        recent_analyses: analyses,
      },
    };
  }

  // 3. Resumes routes
  if (url === '/resumes' && method === 'GET') {
    const resumes = getStore('mock_resumes');
    return { data: resumes };
  }

  if (url.startsWith('/resumes/') && method === 'GET') {
    const id = parseInt(url.split('/')[2]);
    const resumes = getStore('mock_resumes');
    const found = resumes.find((r) => r.id === id);
    if (found) return { data: found };
  }

  if (url === '/resumes/upload' && method === 'POST') {
    const resumes = getStore('mock_resumes');
    const filename = data instanceof FormData ? 'uploaded_resume.pdf' : 'resume.pdf';
    const newResume = {
      id: Date.now(),
      user_id: currentUser ? currentUser.id : 2,
      candidate_name: currentUser ? currentUser.name : 'Candidate User',
      candidate_email: currentUser ? currentUser.email : 'candidate@example.com',
      filename: filename,
      file_size: 18450,
      uploaded_at: new Date().toISOString(),
      skills_count: 8,
      extracted_text:
        'Software Developer with experience in Python, SQL, React, FastAPI, Machine Learning, Scikit-learn, Git, and Docker.',
      clean_text: 'software developer experience python sql react fastapi machine learning scikit-learn git docker',
      skills: [
        { id: 1, skill_name: 'Python', category: 'Programming Languages' },
        { id: 2, skill_name: 'SQL', category: 'Databases' },
        { id: 3, skill_name: 'React', category: 'Web Development' },
        { id: 4, skill_name: 'FastAPI', category: 'Web Development' },
        { id: 5, skill_name: 'Machine Learning', category: 'AI & Machine Learning' },
        { id: 6, skill_name: 'Scikit-learn', category: 'AI & Machine Learning' },
        { id: 7, skill_name: 'Git', category: 'Tools & Platforms' },
        { id: 8, skill_name: 'Docker', category: 'Cloud & DevOps' },
      ],
    };
    resumes.unshift(newResume);
    setStore('mock_resumes', resumes);
    return { data: newResume };
  }

  if (url.startsWith('/resumes/') && method === 'DELETE') {
    const id = parseInt(url.split('/')[2]);
    let resumes = getStore('mock_resumes');
    resumes = resumes.filter((r) => r.id !== id);
    setStore('mock_resumes', resumes);
    return { data: { success: true } };
  }

  // 4. Jobs routes
  if (url === '/jobs' && method === 'GET') {
    return { data: getStore('mock_jobs') };
  }

  if (url.startsWith('/jobs/') && method === 'GET') {
    const id = parseInt(url.split('/')[2]);
    const job = getStore('mock_jobs').find((j) => j.id === id);
    if (job) return { data: job };
  }

  if (url === '/jobs' && method === 'POST') {
    const jobs = getStore('mock_jobs');
    const newJob = {
      id: Date.now(),
      recruiter_id: currentUser ? currentUser.id : 1,
      title: data.title,
      company: data.company,
      description: data.description,
      experience_level: data.experience_level || 'Entry-level',
      required_skills: data.required_skills || [],
      preferred_skills: data.preferred_skills || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      analysis_count: 0,
    };
    jobs.unshift(newJob);
    setStore('mock_jobs', jobs);
    return { data: newJob };
  }

  if (url.startsWith('/jobs/') && method === 'DELETE') {
    const id = parseInt(url.split('/')[2]);
    let jobs = getStore('mock_jobs');
    jobs = jobs.filter((j) => j.id !== id);
    setStore('mock_jobs', jobs);
    return { data: { success: true } };
  }

  // 5. Analysis routes
  if (url === '/analysis' && method === 'POST') {
    const resumes = getStore('mock_resumes');
    const jobs = getStore('mock_jobs');
    const analyses = getStore('mock_analyses');

    const resume = resumes.find((r) => r.id === parseInt(data.resume_id)) || resumes[0];
    let job = null;

    if (data.job_id) {
      job = jobs.find((j) => j.id === parseInt(data.job_id));
    } else if (data.custom_job_description) {
      job = {
        id: Date.now(),
        title: data.custom_job_title || 'Custom Target Job',
        company: data.custom_company || 'Custom Company',
        description: data.custom_job_description,
        required_skills: data.custom_required_skills || ['Python', 'SQL', 'FastAPI'],
      };
    }

    const rSkills = (resume?.skills || []).map((s) => s.skill_name.toLowerCase());
    const jSkills = (job?.required_skills || []).map((s) => s.trim());

    const matched = jSkills.filter((js) => rSkills.includes(js.toLowerCase()));
    const missing = jSkills.filter((js) => !rSkills.includes(js.toLowerCase()));
    const additional = (resume?.skills || [])
      .map((s) => s.skill_name)
      .filter((rs) => !jSkills.map((s) => s.toLowerCase()).includes(rs.toLowerCase()));

    const simScore = Math.min(
      95,
      Math.max(15, Math.round(((matched.length * 1.5 + 2) / (jSkills.length + 3)) * 100))
    );
    const matchPct = jSkills.length > 0 ? Math.round((matched.length / jSkills.length) * 100) : 0;

    const recs = missing.map((sk) => {
      const entry = SKILL_RECOMMENDATIONS_CATALOG[sk] || {
        title: `${sk} Fundamentals`,
        description: `Learn core concepts, best practices, and hands-on projects for ${sk}.`,
        resource: 'https://docs.python.org/3/',
      };
      return {
        skill: sk,
        title: entry.title,
        description: entry.description,
        resource: entry.resource,
      };
    });

    const newAnalysis = {
      id: Date.now(),
      resume_id: resume.id,
      job_id: job ? job.id : 1,
      candidate_name: resume.candidate_name,
      candidate_email: resume.candidate_email,
      resume_filename: resume.filename,
      job_title: job ? job.title : 'Job Role',
      company: job ? job.company : 'Company',
      experience_level: job?.experience_level || 'Open Level',
      similarity_score: simScore,
      skill_match_percentage: matchPct,
      matched_skill_count: matched.length,
      required_skill_count: jSkills.length,
      matched_skills: matched,
      missing_skills: missing,
      additional_skills: additional,
      learning_recommendations: recs,
      metric_disclaimer:
        'This Job Match Score is an automated text and skill similarity metric generated by the platform. It does not represent hiring probability or guarantee employment selection.',
      created_at: new Date().toISOString(),
    };

    analyses.unshift(newAnalysis);
    setStore('mock_analyses', analyses);
    return { data: newAnalysis };
  }

  if (url === '/analysis/history' && method === 'GET') {
    return { data: getStore('mock_analyses') };
  }

  if (url.startsWith('/analysis/job/') && method === 'GET') {
    const jobId = parseInt(url.split('/')[3]);
    const analyses = getStore('mock_analyses').filter((a) => a.job_id === jobId);
    const result = analyses.map((a) => ({
      analysis_id: a.id,
      candidate_id: a.resume_id,
      candidate_name: a.candidate_name,
      candidate_email: a.candidate_email,
      resume_id: a.resume_id,
      resume_filename: a.resume_filename,
      similarity_score: a.similarity_score,
      skill_match_percentage: a.skill_match_percentage,
      matched_skill_count: a.matched_skill_count,
      required_skill_count: a.required_skill_count,
      matched_skills: a.matched_skills,
      missing_skills: a.missing_skills,
      additional_skills: a.additional_skills,
      created_at: a.created_at,
    }));
    return { data: result };
  }

  if (url.startsWith('/analysis/batch/') && method === 'POST') {
    const analyses = getStore('mock_analyses');
    return { data: analyses.slice(0, 3) };
  }

  if (url === '/analysis/compare' && method === 'POST') {
    const ids = Array.isArray(data) ? data : [];
    const all = getStore('mock_analyses');
    const comp = all
      .filter((a) => ids.includes(a.id))
      .map((a) => ({
        analysis_id: a.id,
        candidate_id: a.resume_id,
        candidate_name: a.candidate_name,
        candidate_email: a.candidate_email,
        resume_id: a.resume_id,
        resume_filename: a.resume_filename,
        similarity_score: a.similarity_score,
        skill_match_percentage: a.skill_match_percentage,
        matched_skills: a.matched_skills,
        missing_skills: a.missing_skills,
        additional_skills: a.additional_skills,
        created_at: a.created_at,
      }));
    return { data: comp };
  }

  if (url.startsWith('/analysis/') && method === 'GET') {
    const id = parseInt(url.split('/')[2]);
    const found = getStore('mock_analyses').find((a) => a.id === id);
    if (found) return { data: found };
  }

  return Promise.reject(error);
};

// Response interceptor to catch network / 404 / 500 errors and transparently fallback to client mock
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If backend is not reached (e.g. static GitHub Pages host) or 404 on API endpoint
    if (!error.response || error.response.status === 404 || error.response.status === 502) {
      try {
        return await handleMockFallback(error);
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
