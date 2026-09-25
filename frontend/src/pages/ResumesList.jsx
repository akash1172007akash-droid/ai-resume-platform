import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Search,
  UploadCloud,
  Eye,
  Trash2,
  Calendar,
  Cpu,
  Target,
  ExternalLink
} from 'lucide-react';
import SkillBadge from '../components/SkillBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResumesList() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const { isRecruiter, isCandidate } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data);
    } catch (err) {
      console.error('Error fetching resumes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.delete(`/resumes/${resumeId}`);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (err) {
      alert('Failed to delete resume.');
    }
  };

  const filteredResumes = resumes.filter((r) => {
    const q = search.toLowerCase();
    const matchesQuery =
      r.filename.toLowerCase().includes(q) ||
      (r.candidate_name && r.candidate_name.toLowerCase().includes(q));

    return matchesQuery;
  });

  if (loading) {
    return <LoadingSpinner text="Retrieving resumes..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isRecruiter ? 'Candidate Resume Pool' : 'My Resumes'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse uploaded PDF resumes, extracted skill profiles, and documents
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search resumes or candidate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-blue-600 outline-none w-56"
            />
          </div>

          <Link
            to="/resumes/upload"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg transition-all shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Resume</span>
          </Link>
        </div>
      </div>

      {filteredResumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1">
                        {resume.filename}
                      </h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {resume.candidate_name || 'Candidate'} •{' '}
                        {Math.round(resume.file_size / 1024)} KB
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(resume.uploaded_at).toLocaleDateString()}</span>
                  </span>
                  <span className="font-semibold text-blue-600">
                    {resume.skills_count} Skills Detected
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`/api/resumes/${resume.id}/file`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-slate-600 hover:text-blue-600 inline-flex items-center space-x-1"
                >
                  <span>PDF Document</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <button
                  onClick={() => navigate('/analysis/new', { state: { resumeId: resume.id } })}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Match</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No resumes found.
        </div>
      )}
    </div>
  );
}
