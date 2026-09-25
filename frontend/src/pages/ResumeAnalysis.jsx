import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  Target,
  FileText,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Plus,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import MatchScore from '../components/MatchScore';
import SkillBadge from '../components/SkillBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResumeAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeAnalysisId } = useParams();

  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(location.state?.resumeId || '');
  const [matchingMode, setMatchingMode] = useState('existing'); // 'existing' or 'custom'
  const [selectedJobId, setSelectedJobId] = useState(location.state?.jobId || '');

  // Custom Job input state
  const [customTitle, setCustomTitle] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customSkillsInput, setCustomSkillsInput] = useState('');

  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (routeAnalysisId) {
      fetchExistingAnalysis(routeAnalysisId);
    } else {
      fetchResumesAndJobs();
    }
  }, [routeAnalysisId]);

  const fetchExistingAnalysis = async (aid) => {
    setLoading(true);
    try {
      const res = await api.get(`/analysis/${aid}`);
      setAnalysisResult(res.data);
    } catch (err) {
      setError('Unable to load analysis report.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumesAndJobs = async () => {
    setLoading(true);
    try {
      const [resumesRes, jobsRes] = await Promise.all([
        api.get('/resumes'),
        api.get('/jobs'),
      ]);
      setResumes(resumesRes.data);
      setJobs(jobsRes.data);

      if (resumesRes.data.length > 0 && !selectedResumeId) {
        setSelectedResumeId(resumesRes.data[0].id);
      }
      if (jobsRes.data.length > 0 && !selectedJobId) {
        setSelectedJobId(jobsRes.data[0].id);
      }
    } catch (err) {
      setError('Failed to fetch initial resumes or job openings.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError('Please select a candidate resume.');
      return;
    }

    setError('');
    setAnalyzing(true);

    try {
      let payload = { resume_id: parseInt(selectedResumeId) };

      if (matchingMode === 'existing') {
        if (!selectedJobId) {
          setError('Please select a job opening to match against.');
          setAnalyzing(false);
          return;
        }
        payload.job_id = parseInt(selectedJobId);
      } else {
        if (!customDescription.trim()) {
          setError('Please enter a job description to analyze.');
          setAnalyzing(false);
          return;
        }
        payload.custom_job_title = customTitle.trim() || 'Custom Job Opening';
        payload.custom_company = customCompany.trim() || 'Custom Company';
        payload.custom_job_description = customDescription.trim();
        if (customSkillsInput.trim()) {
          payload.custom_required_skills = customSkillsInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }

      const res = await api.post('/analysis', payload);
      setAnalysisResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'An error occurred while evaluating the match.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading matching environment..." size="lg" />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Job Match & Skill Gap Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare candidate resumes against job descriptions using TF-IDF vectorization and cosine similarity
          </p>
        </div>

        {analysisResult && (
          <button
            onClick={() => {
              setAnalysisResult(null);
              fetchResumesAndJobs();
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50"
          >
            New Comparison
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* INPUT FORM (Visible when no result yet) */}
      {!analysisResult ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <form onSubmit={handleRunAnalysis} className="space-y-6">
            {/* Step 1: Select Resume */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Resume
              </label>

              {resumes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resumes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedResumeId(r.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedResumeId === r.id
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-semibold text-xs text-slate-800 truncate">
                          {r.filename}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 pl-6.5">
                        {r.candidate_name || 'Candidate'} • {r.skills_count} skills detected
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No resumes found.{' '}
                  <Link to="/resumes/upload" className="font-semibold text-blue-600 hover:underline">
                    Upload a resume first
                  </Link>
                </div>
              )}
            </div>

            {/* Step 2: Target Job Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Job Description Input
                </label>

                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMatchingMode('existing')}
                    className={`text-xs px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      matchingMode === 'existing'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Select Live Job
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchingMode('custom')}
                    className={`text-xs px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      matchingMode === 'custom'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Paste Custom Job
                  </button>
                </div>
              </div>

              {matchingMode === 'existing' ? (
                jobs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {jobs.map((j) => (
                      <div
                        key={j.id}
                        onClick={() => setSelectedJobId(j.id)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedJobId === j.id
                            ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Briefcase className="w-4 h-4 text-purple-600 shrink-0" />
                          <span className="font-semibold text-xs text-slate-800 truncate">
                            {j.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 pl-6.5">
                          {j.company} • Req Skills: {j.required_skills?.join(', ') || 'None'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    No active job postings found. Use "Paste Custom Job" or create a job posting.
                  </div>
                )
              ) : (
                <div className="space-y-3 mt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="e.g. Python Developer Intern"
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:border-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={customCompany}
                        onChange={(e) => setCustomCompany(e.target.value)}
                        placeholder="e.g. Google / TechCorp"
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Job Description Text
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Paste the job requirements, responsibilities, and technical qualifications..."
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:border-blue-600 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Explicit Required Skills (comma-separated, optional)
                    </label>
                    <input
                      type="text"
                      value={customSkillsInput}
                      onChange={(e) => setCustomSkillsInput(e.target.value)}
                      placeholder="e.g. Python, SQL, Machine Learning, FastAPI"
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:border-blue-600 outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      If left blank, required skills will be detected automatically from the job description text.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={analyzing || !selectedResumeId}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing TF-IDF & Skill Gap Analysis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute AI Match Analysis</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* ================= RESULTS DASHBOARD (Section 14) ================= */
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  {analysisResult.experience_level || 'Open Level'}
                </span>
                <span className="text-xs text-slate-400">
                  Analyzed on {new Date(analysisResult.created_at).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {analysisResult.job_title}
              </h2>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-700">{analysisResult.company}</span>
                <span>•</span>
                <span>Candidate: {analysisResult.candidate_name}</span>
                <span>•</span>
                <span className="font-mono text-slate-400">{analysisResult.resume_filename}</span>
              </div>
            </div>

            <a
              href={`/api/resumes/${analysisResult.resume_id}/file`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-colors shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>View Source PDF</span>
              <ExternalLink className="w-3 h-3 ml-0.5 text-slate-400" />
            </a>
          </div>

          {/* Similarity & Skill Match Scores Gauge */}
          <MatchScore
            similarityScore={analysisResult.similarity_score}
            skillMatchPercentage={analysisResult.skill_match_percentage}
            matchedCount={analysisResult.matched_skill_count}
            requiredCount={analysisResult.required_skill_count}
            showDetails={true}
          />

          {/* Tri-Col Skill Categorization (Matched, Missing, Additional) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Matched Skills */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    Matched Skills ({analysisResult.matched_skills?.length || 0})
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Aligned
                </span>
              </div>

              <div className="mt-3 min-h-[90px]">
                {analysisResult.matched_skills && analysisResult.matched_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.matched_skills.map((s, idx) => (
                      <SkillBadge key={idx} skill={s} variant="matched" />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No direct skills matched.</p>
                )}
              </div>
            </div>

            {/* 2. Missing Skills (Skill Gap) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    Missing Skills ({analysisResult.missing_skills?.length || 0})
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Skill Gap
                </span>
              </div>

              <div className="mt-3 min-h-[90px]">
                {analysisResult.missing_skills && analysisResult.missing_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missing_skills.map((s, idx) => (
                      <SkillBadge key={idx} skill={s} variant="missing" />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 font-medium">
                    100% of required skills present in resume!
                  </p>
                )}
              </div>
            </div>

            {/* 3. Additional Candidate Skills */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    Additional Skills ({analysisResult.additional_skills?.length || 0})
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Extra Competency
                </span>
              </div>

              <div className="mt-3 min-h-[90px]">
                {analysisResult.additional_skills && analysisResult.additional_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.additional_skills.map((s, idx) => (
                      <SkillBadge key={idx} skill={s} variant="additional" />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No extra skills detected.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 13: Generic Learning Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Generic Learning Recommendations & Gap Closure
                  </h3>
                  <p className="text-xs text-slate-400">
                    Curated technical learning paths for identified missing skills
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                Application Generated
              </span>
            </div>

            <div className="mt-4">
              {analysisResult.learning_recommendations &&
              analysisResult.learning_recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.learning_recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                            {rec.skill}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs mt-1">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {rec.description}
                        </p>
                      </div>

                      {rec.resource && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                          <a
                            href={rec.resource}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            <span>Official Documentation & Guide</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-emerald-600 font-medium">
                  No missing skills detected! Candidate possesses all required technical competencies for this job description.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
