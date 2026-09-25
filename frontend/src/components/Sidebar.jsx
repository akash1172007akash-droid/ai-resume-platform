import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UploadCloud,
  FileCheck,
  History,
  Briefcase,
  Users,
  GitCompare,
  PlusCircle,
  FileText
} from 'lucide-react';

export default function Sidebar() {
  const { user, isRecruiter, isCandidate } = useAuth();

  if (!user) return null;

  const candidateLinks = [
    { to: '/candidate', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resumes/upload', label: 'Upload Resume', icon: UploadCloud },
    { to: '/analysis/new', label: 'Match With Job', icon: FileCheck },
    { to: '/jobs', label: 'Browse Jobs', icon: Briefcase },
    { to: '/history', label: 'Analysis History', icon: History },
  ];

  const recruiterLinks = [
    { to: '/recruiter', label: 'Recruiter Dashboard', icon: LayoutDashboard },
    { to: '/jobs/new', label: 'Create Job Post', icon: PlusCircle },
    { to: '/jobs', label: 'Manage Jobs', icon: Briefcase },
    { to: '/resumes', label: 'Candidate Resumes', icon: FileText },
    { to: '/compare', label: 'Candidate Comparison', icon: GitCompare },
    { to: '/history', label: 'All Analyses', icon: History },
  ];

  const links = isRecruiter ? recruiterLinks : candidateLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-slate-100">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
          {isRecruiter ? 'Recruiter Portal' : 'Candidate Workspace'}
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/candidate' || link.to === '/recruiter'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="text-xs font-semibold text-slate-800">
          NLP Matching Engine
        </div>
        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
          Powered by PyMuPDF text extraction, Scikit-learn TF-IDF, and taxonomy skill gap analyzer.
        </p>
      </div>
    </aside>
  );
}
