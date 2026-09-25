import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Briefcase,
  Building,
  Layers,
  Users,
  Target,
  FileText,
  GitCompare,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import SkillBadge from '../components/SkillBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [candidateMatches, setCandidateMatches] = useState([]);
  const [availableResumes, setAvailableResumes] = useState([]);
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  const [loading, setLoading] = useState(true);
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobAndCandidates();
  }, [id]);

  const fetchJobAndCandidates = async () => {
    setLoading(true);
    try {
      const [jobRes, matchesRes, resumesRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/analysis/job/${id}`),
        api.get('/resumes'),
      ]);
      setJob(jobRes.data);
      setCandidateMatches(matchesRes.data);
      setAvailableResumes(resumesRes.data);
    } catch (err) {
      setError('Failed to load job details or candidate rankings.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAnalyze = async () => {
    if (selectedResumes.length === 0) {
      alert('Please select at least one candidate resume to analyze.');
      return;
    }

    setBatchAnalyzing(true);
    try {
      await api.post(`/analysis/batch/${id}`, selectedResumes);
      await fetchJobAndCandidates();
      setSelectedResumes([]);
    } catch (err) {
      alert('Batch candidate analysis failed.');
    } finally {
      setBatchAnalyzing(false);
    }
  };

  const toggleSelectForCompare = (analysisId) => {
    setSelectedForCompare((prev) =>
      prev.includes(analysisId) ? prev.filter((i) => i !== analysisId) : [...prev, analysisId]
    );
  };

  const handleRunCompare = () => {
    if (selectedForCompare.length < 2) {
      alert('Please select at least 2 candidates to compare side-by-side.');
      return;
    }
    navigate(`/compare?ids=${selectedForCompare.join(',')}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading job pipeline..." size="lg" />;
  }

  if (!job) {
    return <div className="text-center py-12 text-slate-500">Job opening not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                {job.experience_level || 'Open Level'}
              </span>
              <span className="text-xs text-slate-400">
                Posted on {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {job.title}
            </h1>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-800">{job.company}</span>
              <span>•</span>
              <span>Total Evaluations: {candidateMatches.length}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {selectedForCompare.length > 0 && (
              <button
                onClick={handleRunCompare}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <GitCompare className="w-4 h-4" />
                <span>Compare Selected ({selectedForCompare.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Description & Skill Tags */}
        <div className="mt-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Position Overview
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Required Technical Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.required_skills?.map((s, idx) => (
                <SkillBadge key={idx} skill={s} variant="default" />
              ))}
            </div>
          </div>

          {job.preferred_skills?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">
                Preferred Technical Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {job.preferred_skills.map((s, idx) => (
                  <SkillBadge key={idx} skill={s} variant="preferred" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Batch Candidate Analysis Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Batch Candidate Analysis Workflow
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Select candidate resumes from platform pool to evaluate simultaneously
          </span>
        </div>

        {availableResumes.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
              {availableResumes.map((r) => {
                const isSelected = selectedResumes.includes(r.id);
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedResumes((prev) =>
                        isSelected ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                      );
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 truncate">
                        {r.candidate_name || 'Candidate'}
                      </span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded-xs border-slate-300 text-blue-600 cursor-pointer"
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono truncate">
                      {r.filename}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                {selectedResumes.length} resume(s) selected for analysis
              </span>
              <button
                onClick={handleBatchAnalyze}
                disabled={selectedResumes.length === 0 || batchAnalyzing}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {batchAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Candidates...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-3.5 h-3.5" />
                    <span>Run Batch Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">No candidate resumes available in platform pool.</p>
        )}
      </div>

      {/* Candidate Comparison Table (Section 17) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">
            Evaluated Candidates for this Opening
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Descriptive comparison of candidate profiles. Metric scores do not represent hiring probability or guarantee employment.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-8">Compare</th>
                <th className="py-3 px-4">Candidate & Resume</th>
                <th className="py-3 px-4 text-center">Resume–Job Similarity</th>
                <th className="py-3 px-4 text-center">Required Skills Matched</th>
                <th className="py-3 px-4">Missing Skills (Gaps)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {candidateMatches.length > 0 ? (
                candidateMatches.map((cand) => (
                  <tr key={cand.analysis_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedForCompare.includes(cand.analysis_id)}
                        onChange={() => toggleSelectForCompare(cand.analysis_id)}
                        className="rounded-xs border-slate-300 text-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{cand.candidate_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {cand.resume_filename}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {Math.round(cand.similarity_score)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cand.matched_skill_count} / {cand.required_skill_count} (
                        {Math.round(cand.skill_match_percentage)}%)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cand.missing_skills?.length > 0 ? (
                          cand.missing_skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold">
                            None missing
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/analysis/${cand.analysis_id}`}
                          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Report</span>
                        </Link>
                        <a
                          href={`/api/resumes/${cand.resume_id}/file`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors"
                        >
                          PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No candidates evaluated for this job yet. Use batch evaluation above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
