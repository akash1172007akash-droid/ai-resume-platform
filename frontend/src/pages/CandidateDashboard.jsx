import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  Layers,
  Briefcase
} from 'lucide-react';
import SkillBadge from '../components/SkillBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CandidateDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/candidate');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching candidate dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading candidate workspace..." size="lg" />;
  }

  const latestResume = stats?.latest_resume;
  const recentAnalyses = stats?.recent_analyses || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-3 py-1 rounded-full text-blue-100">
            Candidate Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
            Welcome to Your AI Career Compass
          </h1>
          <p className="text-sm text-blue-100 mt-2 leading-relaxed">
            Extract skills automatically from your PDF resume, calculate TF-IDF similarity against live job roles, and discover personalized learning recommendations to bridge skill gaps.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/resumes/upload"
              className="inline-flex items-center space-x-2 bg-white text-blue-700 font-semibold text-xs px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-all shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New Resume</span>
            </Link>
            <Link
              to="/analysis/new"
              className="inline-flex items-center space-x-2 bg-blue-500/30 hover:bg-blue-500/40 text-white font-semibold text-xs px-4 py-2.5 rounded-lg border border-white/20 transition-all"
            >
              <Target className="w-4 h-4" />
              <span>Run Job Match</span>
            </Link>
          </div>
        </div>

        {/* Decorative backdrop graphics */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Uploaded Resumes</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats?.total_resumes || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Active profile document</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Detected Skills</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats?.detected_skills_count || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">From controlled taxonomy</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Job Analyses Run</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats?.total_analyses || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Similarity evaluations</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Current Resume & Extracted Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1-col: Active Resume Details */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>My Active Resume</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Processed
              </span>
            </div>

            {latestResume ? (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {latestResume.filename}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Size: {Math.round(latestResume.file_size / 1024)} KB • Uploaded:{' '}
                    {new Date(latestResume.uploaded_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Extracted Skills ({latestResume.skills?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {latestResume.skills && latestResume.skills.length > 0 ? (
                      latestResume.skills.map((skill, idx) => (
                        <SkillBadge key={idx} skill={skill} variant="default" />
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No skills detected yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <UploadCloud className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No resume uploaded yet.</p>
                <Link
                  to="/resumes/upload"
                  className="mt-3 inline-block text-xs font-semibold text-blue-600 hover:underline"
                >
                  Upload your first resume
                </Link>
              </div>
            )}
          </div>

          {latestResume && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`/api/resumes/${latestResume.id}/file`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-slate-600 hover:text-blue-600"
              >
                View PDF File
              </a>
              <Link
                to="/analysis/new"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <span>Compare with Job</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Right 2-col: Recent Job Matches */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Recent Job Match Analyses</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated similarity scores and skill-gap evaluations
              </p>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4">
            {recentAnalyses.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentAnalyses.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/analysis/${item.id}`)}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800 text-sm">
                          {item.job_title}
                        </span>
                        <span className="text-xs text-slate-400">• {item.company}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <span className="flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                          Skills: {item.matched_skill_count} / {item.required_skill_count} matched
                        </span>
                        <span>•</span>
                        <span className="flex items-center text-slate-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-base font-bold text-slate-900">
                          {Math.round(item.similarity_score)}%
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Match Score
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No match analyses performed yet.</p>
                <Link
                  to="/analysis/new"
                  className="mt-3 inline-flex items-center space-x-1 text-xs font-semibold text-white bg-blue-600 px-3.5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Against a Job Description</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
