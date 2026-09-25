import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';

export default function MatchScore({
  similarityScore = 0,
  skillMatchPercentage = 0,
  matchedCount = 0,
  requiredCount = 0,
  size = 'md',
  showDetails = true,
}) {
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600 stroke-emerald-500';
    if (score >= 40) return 'text-blue-600 stroke-blue-500';
    if (score >= 20) return 'text-amber-600 stroke-amber-500';
    return 'text-rose-600 stroke-rose-500';
  };

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 40) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 20) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const strokeDash = `${similarityScore}, 100`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-slate-800 text-sm tracking-tight">
            Job Match & Similarity Metrics
          </h4>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          NLP + TF-IDF
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 items-center">
        {/* Metric 1: Textual Similarity Score */}
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
              <path
                className="text-slate-100 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={getScoreColor(similarityScore)}
                strokeDasharray={strokeDash}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-slate-800">{Math.round(similarityScore)}%</span>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Resume–Job Similarity
            </div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">
              TF-IDF Cosine Match
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-tight">
              Application-generated textual similarity vector score.
            </p>
          </div>
        </div>

        {/* Metric 2: Explicit Required Skills Match */}
        <div className="flex items-center space-x-4 md:border-l md:border-slate-100 md:pl-6">
          <div className="relative w-20 h-20 shrink-0 flex flex-col items-center justify-center bg-slate-50 rounded-full border border-slate-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-0.5" />
            <span className="text-xs font-bold text-slate-800">
              {matchedCount}/{requiredCount}
            </span>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Required Skills Matched
            </div>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-lg font-bold text-slate-900">
                {matchedCount} / {requiredCount}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getScoreBg(
                  skillMatchPercentage
                )}`}
              >
                {Math.round(skillMatchPercentage)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-tight">
              Exact controlled dictionary matches against job criteria.
            </p>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
            <span className="font-semibold text-slate-700 not-italic">Notice: </span>
            The Resume–Job Similarity Score is an automated metric reflecting vocabulary overlap and technical skill alignment. It does not represent hiring probability or guarantee interview selection.
          </p>
        </div>
      )}
    </div>
  );
}
