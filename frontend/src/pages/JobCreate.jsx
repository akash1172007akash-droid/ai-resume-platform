import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Briefcase,
  Building,
  Layers,
  Plus,
  X,
  Sparkles,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import SkillBadge from '../components/SkillBadge';

export default function JobCreate() {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry-level');

  const [requiredSkills, setRequiredSkills] = useState([]);
  const [currentReqSkill, setCurrentReqSkill] = useState('');

  const [preferredSkills, setPreferredSkills] = useState([]);
  const [currentPrefSkill, setCurrentPrefSkill] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAddRequiredSkill = (e) => {
    e.preventDefault();
    const clean = currentReqSkill.trim();
    if (clean && !requiredSkills.includes(clean)) {
      setRequiredSkills([...requiredSkills, clean]);
      setCurrentReqSkill('');
    }
  };

  const handleRemoveRequiredSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  const handleAddPreferredSkill = (e) => {
    e.preventDefault();
    const clean = currentPrefSkill.trim();
    if (clean && !preferredSkills.includes(clean)) {
      setPreferredSkills([...preferredSkills, clean]);
      setCurrentPrefSkill('');
    }
  };

  const handleRemovePreferredSkill = (skillToRemove) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !company.trim() || !description.trim()) {
      setError('Please fill in Job Title, Company, and Job Description.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        experience_level: experienceLevel,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
      };

      const res = await api.post('/jobs', payload);
      navigate(`/jobs/${res.data.id}`);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to create job posting. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create New Job Posting
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Define position specifications and criteria for automated candidate TF-IDF matching and skill-gap detection.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Python Machine Learning Intern"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Organization <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex AI Technologies"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-300 focus:border-blue-600 outline-none bg-white cursor-pointer"
            >
              <option value="Internship">Internship</option>
              <option value="Entry-level">Entry-level (0-2 yrs)</option>
              <option value="Mid-level">Mid-level (3-5 yrs)</option>
              <option value="Senior">Senior (5+ yrs)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Job Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={6}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe role responsibilities, deliverables, tech stack, and ideal background..."
            className="w-full p-3 text-xs font-mono rounded-lg border border-slate-300 focus:border-blue-600 outline-none"
          />
        </div>

        {/* Required Skills Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Required Technical Skills
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentReqSkill}
              onChange={(e) => setCurrentReqSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRequiredSkill(e)}
              placeholder="e.g. Python, SQL, Machine Learning"
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-600 outline-none"
            />
            <button
              type="button"
              onClick={handleAddRequiredSkill}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3 min-h-[32px]">
            {requiredSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRequiredSkill(skill)}
                  className="ml-1.5 text-blue-400 hover:text-blue-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {requiredSkills.length === 0 && (
              <span className="text-xs text-slate-400 italic">
                No explicit skills entered yet (will be auto-extracted from description if empty).
              </span>
            )}
          </div>
        </div>

        {/* Preferred Skills Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Preferred / Nice-to-Have Skills
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentPrefSkill}
              onChange={(e) => setCurrentPrefSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPreferredSkill(e)}
              placeholder="e.g. FastAPI, Docker, Git"
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-600 outline-none"
            />
            <button
              type="button"
              onClick={handleAddPreferredSkill}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Add Preferred
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3 min-h-[32px]">
            {preferredSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePreferredSkill(skill)}
                  className="ml-1.5 text-purple-400 hover:text-purple-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {preferredSkills.length === 0 && (
              <span className="text-xs text-slate-400 italic">Optional.</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <span>{loading ? 'Publishing Job Posting...' : 'Publish Job Posting'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
