import React from 'react';
import { FileText, Calendar, Download, Trash2, ArrowUpRight, Cpu } from 'lucide-react';
import SkillBadge from './SkillBadge';

export default function ResumeCard({ resume, onSelect, onDelete, isSelected = false }) {
  const formattedDate = new Date(resume.uploaded_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const fileSizeKB = Math.round(resume.file_size / 1024);

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-xl border p-5 transition-all cursor-pointer relative ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm hover:text-blue-600 transition-colors line-clamp-1">
              {resume.filename}
            </h4>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
              <span>{fileSizeKB} KB</span>
              <span>•</span>
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formattedDate}
              </span>
              {resume.candidate_name && (
                <>
                  <span>•</span>
                  <span className="text-slate-600 font-medium">{resume.candidate_name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(resume.id);
            }}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
            title="Delete Resume"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-slate-600 font-medium">
          <Cpu className="w-3.5 h-3.5 text-blue-500" />
          <span>{resume.skills_count || resume.skills?.length || 0} Skills Detected</span>
        </div>
        <a
          href={`/api/resumes/${resume.id}/file`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center space-x-1"
        >
          <span>View PDF</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {resume.skills && resume.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {resume.skills.slice(0, 5).map((s, idx) => (
            <SkillBadge key={idx} skill={typeof s === 'string' ? s : s.skill_name} />
          ))}
          {resume.skills.length > 5 && (
            <span className="text-[11px] text-slate-400 self-center">
              +{resume.skills.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
