import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  History,
  Search,
  Filter,
  Eye,
  FileText,
  Calendar,
  CheckCircle2,
  Target,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AnalysisHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/analysis/history');
      setHistory(res.data);
    } catch (err) {
      setError('Failed to fetch analysis history.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.job_title?.toLowerCase().includes(q) ||
      item.company?.toLowerCase().includes(q) ||
      item.candidate_name?.toLowerCase().includes(q) ||
      item.resume_filename?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <LoadingSpinner text="Retrieving historical reports..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Match Analysis History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse previous TF-IDF similarity evaluations and skill gap reports
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-blue-600 outline-none w-56"
          />
        </div>
      </div>

      {filteredHistory.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.job_title}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-600">
                      {item.company}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{item.resume_filename}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-600 font-medium">{item.candidate_name}</span>
                    <span>•</span>
                    <span className="flex items-center text-slate-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 shrink-0">
                  {/* Scores */}
                  <div className="text-right">
                    <div className="flex items-center space-x-2 justify-end">
                      <span className="text-lg font-bold text-slate-900">
                        {Math.round(item.similarity_score)}%
                      </span>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {item.matched_skill_count}/{item.required_skill_count} skills
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                      Similarity Score
                    </div>
                  </div>

                  <Link
                    to={`/analysis/${item.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg transition-all shadow-xs"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No analysis history found. Run a job match to get started.
        </div>
      )}
    </div>
  );
}
