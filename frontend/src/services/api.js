import axios from 'axios';
import {
  INITIAL_MOCK_USERS,
  INITIAL_MOCK_JOBS,
  INITIAL_MOCK_RESUMES,
  INITIAL_MOCK_ANALYSES,
  SKILL_RECOMMENDATIONS_CATALOG,
} from './mockData';

// Initialize localStorage stores if empty or outdated
const initStorage = () => {
  if (!localStorage.getItem('mock_users') || JSON.parse(localStorage.getItem('mock_users') || '[]').length === 0) {
    localStorage.setItem('mock_users', JSON.stringify(INITIAL_MOCK_USERS));
  }
  if (!localStorage.getItem('mock_jobs') || JSON.parse(localStorage.getItem('mock_jobs') || '[]').length === 0) {
    localStorage.setItem('mock_jobs', JSON.stringify(INITIAL_MOCK_JOBS));
  }
  if (!localStorage.getItem('mock_resumes') || JSON.parse(localStorage.getItem('mock_resumes') || '[]').length === 0) {
    localStorage.setItem('mock_resumes', JSON.stringify(INITIAL_MOCK_RESUMES));
  }
  if (!localStorage.getItem('mock_analyses') || JSON.parse(localStorage.getItem('mock_analyses') || '[]').length === 0) {
    localStorage.setItem('mock_analyses', JSON.stringify(INITIAL_MOCK_ANALYSES));
  }
};
initStorage();

const getStore = (key) => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    return [];
  }
};

const setStore = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Detect if running on GitHub Pages static host without an active custom API URL
const isGitHubPages = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:'
);

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

// Client-Side Mock Dispatcher
const executeMockHandler = async (urlPath, method, requestData) => {
  // Normalize path removing base prefix
  let cleanUrl = urlPath.replace(/^.*\/api/, '');
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }
  const cleanMethod = method.toUpperCase();
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  console.info(`[Demo Engine] Processing ${cleanMethod} ${cleanUrl}`);

  // 1. Auth routes
  if (cleanUrl === '/auth/login' && cleanMethod === 'POST') {
    const users = getStore('mock_users');
    const emailInput = (requestData.email || '').trim().toLowerCase();
    const passInput = (requestData.password || '').trim();

    const u = users.find(
      (user) => user.email.toLowerCase() === emailInput && user.password === passInput
    );

    if (u) {
      return {
        data: {
          access_token: `mock_jwt_token_${u.id}_${Date.now()}`,
          token_type: 'bearer',
          user: {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            created_at: u.created_at,
          },
        },
      };
    }
    return Promise.reject({
      response: {
        status: 401,
        data: { detail: 'Invalid credentials: Email or password incorrect.' },
      },
    });
  }

  if (cleanUrl === '/auth/register' && cleanMethod === 'POST') {
    const users = getStore('mock_users');
    const newUser = {
      id: Date.now(),
      name: requestData.name,
      email: requestData.email,
      password: requestData.password,
      role: requestData.role || 'CANDIDATE',
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    setStore('mock_users', users);
    return {
      data: {
        access_token: `mock_jwt_token_${newUser.id}_${Date.now()}`,
        token_type: 'bearer',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          created_at: newUser.created_at,
        },
      },
    };
  }

  if (cleanUrl === '/auth/me' && cleanMethod === 'GET') {
    if (currentUser) return { data: currentUser };
    // Default fallback to candidate demo if authenticated
    return { data: getStore('mock_users')[1] };
  }

  // 2. Dashboard routes
  if (cleanUrl === '/dashboard/candidate' && cleanMethod === 'GET') {
    const allResumes = getStore('mock_resumes');
    const resumes = currentUser
      ? allResumes.filter((r) => r.user_id === currentUser.id)
      : allResumes;
    const analyses = getStore('mock_analyses');
    const latest = resumes[0] || allResumes[0] || null;

    return {
      data: {
        total_resumes: resumes.length || 1,
        latest_resume: latest
          ? {
              id: latest.id,
              filename: latest.filename,
              file_size: latest.file_size,
              uploaded_at: latest.uploaded_at,
              skills: (latest.skills || []).map((s) => s.skill_name || s),
            }
          : null,
        detected_skills_count: latest ? (latest.skills || []).length : 10,
        total_analyses: analyses.length,
        recent_analyses: analyses.slice(0, 10),
      },
    };
  }

  if (cleanUrl === '/dashboard/recruiter' && cleanMethod === 'GET') {
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
  if (cleanUrl === '/resumes' && cleanMethod === 'GET') {
    return { data: getStore('mock_resumes') };
  }

  if (cleanUrl.startsWith('/resumes/') && cleanMethod === 'GET') {
    const parts = cleanUrl.split('/');
    const id = parseInt(parts[2]);
    const resumes = getStore('mock_resumes');
    const found = resumes.find((r) => r.id === id) || resumes[0];
    return { data: found };
  }

  if (cleanUrl === '/resumes/upload' && cleanMethod === 'POST') {
    const resumes = getStore('mock_resumes');
    const newResume = {
      id: Date.now(),
      user_id: currentUser ? currentUser.id : 2,
      candidate_name: currentUser ? currentUser.name : 'Akash Sharma',
      candidate_email: currentUser ? currentUser.email : 'candidate@example.com',
      filename: 'uploaded_candidate_resume.pdf',
      file_size: 19240,
      uploaded_at: new Date().toISOString(),
      skills_count: 8,
      extracted_text:
        'Software Engineer with experience in Python, SQL, FastAPI, Scikit-learn, Machine Learning, React, and Git.',
      clean_text: 'software engineer experience python sql fastapi scikit-learn machine learning react git',
      skills: [
        { id: 1, skill_name: 'Python', category: 'Programming Languages' },
        { id: 2, skill_name: 'SQL', category: 'Databases' },
        { id: 3, skill_name: 'FastAPI', category: 'Web Development' },
        { id: 4, skill_name: 'Scikit-learn', category: 'AI & Machine Learning' },
        { id: 5, skill_name: 'Machine Learning', category: 'AI & Machine Learning' },
        { id: 6, skill_name: 'React', category: 'Web Development' },
        { id: 7, skill_name: 'Git', category: 'Tools & Platforms' },
        { id: 8, skill_name: 'Docker', category: 'Cloud & DevOps' },
      ],
    };
    resumes.unshift(newResume);
    setStore('mock_resumes', resumes);
    return { data: newResume };
  }

  if (cleanUrl.startsWith('/resumes/') && cleanMethod === 'DELETE') {
    const id = parseInt(cleanUrl.split('/')[2]);
    let resumes = getStore('mock_resumes');
    resumes = resumes.filter((r) => r.id !== id);
    setStore('mock_resumes', resumes);
    return { data: { success: true } };
  }

  // 4. Jobs routes
  if (cleanUrl === '/jobs' && cleanMethod === 'GET') {
    return { data: getStore('mock_jobs') };
  }

  if (cleanUrl.startsWith('/jobs/') && cleanMethod === 'GET') {
    const id = parseInt(cleanUrl.split('/')[2]);
    const jobs = getStore('mock_jobs');
    const job = jobs.find((j) => j.id === id) || jobs[0];
    return { data: job };
  }

  if (cleanUrl === '/jobs' && cleanMethod === 'POST') {
    const jobs = getStore('mock_jobs');
    const newJob = {
      id: Date.now(),
      recruiter_id: currentUser ? currentUser.id : 1,
      title: requestData.title,
      company: requestData.company,
      description: requestData.description,
      experience_level: requestData.experience_level || 'Entry-level',
      required_skills: requestData.required_skills || ['Python', 'SQL', 'FastAPI'],
      preferred_skills: requestData.preferred_skills || ['Docker'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      analysis_count: 0,
    };
    jobs.unshift(newJob);
    setStore('mock_jobs', jobs);
    return { data: newJob };
  }

  if (cleanUrl.startsWith('/jobs/') && cleanMethod === 'DELETE') {
    const id = parseInt(cleanUrl.split('/')[2]);
    let jobs = getStore('mock_jobs');
    jobs = jobs.filter((j) => j.id !== id);
    setStore('mock_jobs', jobs);
    return { data: { success: true } };
  }

  // 5. Analysis routes
  if (cleanUrl === '/analysis' && cleanMethod === 'POST') {
    const resumes = getStore('mock_resumes');
    const jobs = getStore('mock_jobs');
    const analyses = getStore('mock_analyses');

    const resume = resumes.find((r) => r.id === parseInt(requestData.resume_id)) || resumes[0];
    let job = null;

    if (requestData.job_id) {
      job = jobs.find((j) => j.id === parseInt(requestData.job_id)) || jobs[0];
    } else {
      job = {
        id: Date.now(),
        title: requestData.custom_job_title || 'Target Job Role',
        company: requestData.custom_company || 'Target Company',
        description: requestData.custom_job_description || '',
        required_skills: requestData.custom_required_skills || ['Python', 'SQL', 'FastAPI'],
      };
    }

    const rSkills = (resume?.skills || []).map((s) => (s.skill_name || s).toLowerCase());
    const jSkills = (job?.required_skills || ['Python', 'SQL']).map((s) => s.trim());

    const matched = jSkills.filter((js) => rSkills.includes(js.toLowerCase()));
    const missing = jSkills.filter((js) => !rSkills.includes(js.toLowerCase()));
    const additional = (resume?.skills || [])
      .map((s) => s.skill_name || s)
      .filter((rs) => !jSkills.map((s) => s.toLowerCase()).includes(rs.toLowerCase()));

    const simScore = Math.min(
      95,
      Math.max(15, Math.round(((matched.length * 1.5 + 2) / (jSkills.length + 3)) * 100))
    );
    const matchPct = jSkills.length > 0 ? Math.round((matched.length / jSkills.length) * 100) : 0;

    const recs = missing.map((sk) => {
      const entry = SKILL_RECOMMENDATIONS_CATALOG[sk] || {
        title: `${sk} Fundamentals`,
        description: `Learn foundational principles, syntax, and practical implementation for ${sk}.`,
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
      job_id: job.id,
      candidate_name: resume.candidate_name,
      candidate_email: resume.candidate_email,
      resume_filename: resume.filename,
      job_title: job.title,
      company: job.company,
      experience_level: job.experience_level || 'Open Level',
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

  if (cleanUrl === '/analysis/history' && cleanMethod === 'GET') {
    return { data: getStore('mock_analyses') };
  }

  if (cleanUrl.startsWith('/analysis/job/') && cleanMethod === 'GET') {
    const jobId = parseInt(cleanUrl.split('/')[3]);
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

  if (cleanUrl.startsWith('/analysis/batch/') && cleanMethod === 'POST') {
    const analyses = getStore('mock_analyses');
    return { data: analyses.slice(0, 3) };
  }

  if (cleanUrl === '/analysis/compare' && cleanMethod === 'POST') {
    const ids = Array.isArray(requestData) ? requestData : [];
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

  if (cleanUrl.startsWith('/analysis/') && cleanMethod === 'GET') {
    const id = parseInt(cleanUrl.split('/')[2]);
    const found = getStore('mock_analyses').find((a) => a.id === id) || getStore('mock_analyses')[0];
    return { data: found };
  }

  return Promise.reject(new Error(`Unhandled route ${cleanMethod} ${cleanUrl}`));
};

// If on GitHub Pages without a configured external backend URL, dispatch directly to client demo engine
if (isGitHubPages && !import.meta.env.VITE_API_URL) {
  api.interceptors.request.use(async (config) => {
    let reqData = {};
    if (config.data) {
      if (typeof config.data === 'string') {
        try {
          reqData = JSON.parse(config.data);
        } catch (e) {
          reqData = config.data;
        }
      } else {
        reqData = config.data;
      }
    }

    // Set custom adapter that returns mock data directly without network 405 error
    config.adapter = async () => {
      try {
        const result = await executeMockHandler(config.url, config.method, reqData);
        return {
          data: result.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      } catch (err) {
        if (err.response) {
          return Promise.reject({
            config,
            response: {
              data: err.response.data,
              status: err.response.status,
              statusText: 'Error',
              headers: {},
              config,
            },
          });
        }
        return Promise.reject(err);
      }
    };

    return config;
  });
}

// Fallback response interceptor for network/CORS/404/405/502 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response ? error.response.status : 0;
    // Catch 404, 405 (Method Not Allowed from static hosts), 502, or network failures
    if (!error.response || [404, 405, 502, 503].includes(status)) {
      try {
        let reqData = {};
        if (error.config?.data) {
          if (typeof error.config.data === 'string') {
            try {
              reqData = JSON.parse(error.config.data);
            } catch (e) {
              reqData = error.config.data;
            }
          } else {
            reqData = error.config.data;
          }
        }
        return await executeMockHandler(error.config.url, error.config.method, reqData);
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
