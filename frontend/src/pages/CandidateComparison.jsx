import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  Plus,
  FileText,
  Target,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import SkillBadge from '../components/SkillBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CandidateComparison() {
  const [searchParams] = useSearchParams();
  const idsParam = searchParams.get('ids');

  const [candidates, setCandidates] = useState([]);
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparisonData();
  }, [idsParam]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const historyRes = await api.get('/analysis/history');
      setAllAnalyses(historyRes.data);

      let targetIds = [];
      if (idsParam) {
        targetIds = idsParam
          .split(',')
          .map((id) => parseInt(id.trim()))
          .filter(Boolean);
      } else if (historyRes.data.length >= 2) {
        // Default to comparing the top 2-3 recent analyses
        targetIds = historyRes.data.slice(0, 3).map((a) => a.id);
      }

      setSelectedIds(targetIds);

      if (targetIds.length > 0) {
        const compRes = await api.post('/analysis/compare', targetIds);
        setCandidates(compRes.data);
      }
    } catch (err) {
      console.error('Error loading candidate comparison', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCandidate = async (analysisId) => {
    let nextIds = [];
    if (selectedIds.includes(analysisId)) {
      nextIds = selectedIds.filter((id) => id !== analysisId);
    } else {
      nextIds = [...selectedIds, analysisId];
    }
    setSelectedIds(nextIds);

    if (nextIds.length > 0) {
      try {
        const compRes = await api.post('/analysis/compare', nextIds);
        setCandidates(compRes.data);
      } catch (err) {
        console.error('Failed to update comparison', err);
      }
    } else {
      setCandidates([]);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Generating candidate comparison matrix..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Multi-Candidate Comparison Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Side-by-side descriptive evaluation of candidate metrics, matched skills, and identified skill gaps
          </p>
        </div>

        <Link
          to="/recruiter"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Toggle Candidates in Comparison ({selectedIds.length} Selected)
        </div>
        <div className="flex flex-wrap gap-2">
          {allAnalyses.map((a) => {
            const isSelected = selectedIds.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => handleToggleCandidate(a.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {a.candidate_name} ({a.job_title})
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Cards */}
      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand) => (
            <div
              key={cand.analysis_id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6"
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {cand.candidate_name}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {cand.resume_filename}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{cand.candidate_email}</div>
                  </div>
                  <a
                    href={`/api/resumes/${cand.resume_id}/file`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View Resume PDF"
                  >
                    <FileText className="w-5 h-5" />
                  </a>
                </div>

                {/* Metrics Highlight */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
                    <div className="text-xl font-black text-blue-700">
                      {Math.round(cand.similarity_score)}%
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mt-0.5">
                      Similarity Score
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
                    <div className="text-xl font-black text-emerald-700">
                      {Math.round(cand.skill_match_percentage)}%
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-0.5">
                      Required Skills
                    </div>
                  </div>
                </div>

                {/* Matched Skills */}
                <div className="mt-5">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Matched Skills ({cand.matched_skills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cand.matched_skills?.length > 0 ? (
                      cand.matched_skills.map((s, idx) => (
                        <SkillBadge key={idx} skill={s} variant="matched" />
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">None</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="mt-4">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Missing Skills ({cand.missing_skills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cand.missing_skills?.length > 0 ? (
                      cand.missing_skills.map((s, idx) => (
                        <SkillBadge key={idx} skill={s} variant="missing" />
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 font-semibold">
                        All required skills present
                      </span>
                    )}
                  </div>
                </div>

                {/* Additional Skills */}
                <div className="mt-4">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-2">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>Additional Skills ({cand.additional_skills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cand.additional_skills?.length > 0 ? (
                      cand.additional_skills.map((s, idx) => (
                        <SkillBadge key={idx} skill={s} variant="additional" />
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">None</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {new Date(cand.created_at).toLocaleDateString()}
                </span>
                <Link
                  to={`/analysis/${cand.analysis_id}`}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Full Report →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No candidates selected for comparison. Please check candidates above.
        </div>
      )}

      {/* Recruiter Evaluation Protocol Notice (Section 18) */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
        <span className="font-bold text-slate-800">Recruiter Decision Protocol: </span>
        This matrix presents factual, application-generated NLP similarity metrics and extracted skill coverage. It does not generate algorithmic hiring recommendations or rankings. Recruiters should conduct comprehensive human evaluations, portfolio reviews, and structured interviews before reaching selection decisions.
      </div>
    </div>
  );
}
