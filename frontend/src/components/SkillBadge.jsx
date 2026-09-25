import React from 'react';
import { Check, X, Plus, Sparkles } from 'lucide-react';

export default function SkillBadge({ skill, variant = 'default', category }) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
    matched: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    missing: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    additional: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    preferred: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  };

  const icons = {
    matched: <Check className="w-3.5 h-3.5 mr-1 text-emerald-600 stroke-[2.5]" />,
    missing: <X className="w-3.5 h-3.5 mr-1 text-rose-600 stroke-[2.5]" />,
    additional: <Plus className="w-3.5 h-3.5 mr-1 text-blue-600 stroke-[2.5]" />,
    preferred: <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors shadow-xs ${
        variantStyles[variant] || variantStyles.default
      }`}
    >
      {icons[variant]}
      <span>{skill}</span>
      {category && (
        <span className="ml-1.5 pl-1.5 border-l border-current/20 text-[10px] opacity-75 font-normal">
          {category}
        </span>
      )}
    </span>
  );
}
