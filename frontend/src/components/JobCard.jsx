import React from 'react';
import { Briefcase, Building, Layers, ArrowRight } from 'lucide-react';
import SkillBadge from './SkillBadge';

export default function JobCard({ job, onSelect, actionLabel = 'Match Resume', onAction, isSelected = false }) {
  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-xl border p-5 transition-all relative flex flex-col justify-between ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 inline-block mb-1.5">
              {job.experience_level || 'Open Level'}
            </span>
            <h3 className="font-bold text-slate-800 text-base leading-snug">
              {job.title}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span className="flex items-center font-medium">
                <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {job.company}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Required skills */}
        <div className="mt-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Required Skills ({job.required_skills?.length || 0})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.required_skills && job.required_skills.length > 0 ? (
              job.required_skills.map((skill, idx) => (
                <SkillBadge key={idx} skill={skill} variant="default" />
              ))
            ) : (
              <span className="text-xs text-slate-400">None specified</span>
            )}
          </div>
        </div>

        {/* Preferred skills if present */}
        {job.preferred_skills && job.preferred_skills.length > 0 && (
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider mb-2">
              Preferred
            </div>
            <div className="flex flex-wrap gap-1.5">
              {job.preferred_skills.map((skill, idx) => (
                <SkillBadge key={idx} skill={skill} variant="preferred" />
              ))}
            </div>
          </div>
        )}
      </div>

      {onAction && (
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction(job);
            }}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
