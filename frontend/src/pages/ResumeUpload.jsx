import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import SkillBadge from '../components/SkillBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    setError('');
    // Client-side extension validation
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file type: Please upload a PDF file (.pdf).');
      return;
    }
    // Size validation: 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB maximum limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume file.');
      return;
    }

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        'Unable to process the resume. Please ensure it is a valid text-based PDF.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Resume Parser & Skill Detector
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload text-based PDF resumes for PyMuPDF text extraction, technical preprocessing, and controlled taxonomy skill recognition.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Extraction Error</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!result ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="font-bold text-slate-800 text-base">
                {file ? file.name : 'Choose a PDF resume or drag & drop here'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Standard text-based PDF files up to 10MB
              </p>

              {file && (
                <div className="mt-4 inline-flex items-center space-x-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{file.name}</span>
                  <span className="text-slate-400">({Math.round(file.size / 1024)} KB)</span>
                </div>
              )}
            </div>

            {/* Note box */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 flex items-start space-x-3">
              <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <span className="font-bold">Text Extraction Notice: </span>
                Our pipeline uses PyMuPDF for native digital text extraction. Please avoid image-scanned resumes without an embedded text layer.
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Text & Detecting Skills...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Parse & Analyze Resume</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Results View after Successful Upload */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Resume Successfully Processed
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {result.filename} ({Math.round(result.file_size / 1024)} KB)
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setResult(null);
                setFile(null);
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              Upload Another
            </button>
          </div>

          {/* Detected Skills Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-800 text-sm">
                  Detected Technical Skills ({result.skills?.length || 0})
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Matched against controlled dictionary
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 min-h-[100px]">
              {result.skills && result.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((s, idx) => (
                    <SkillBadge
                      key={idx}
                      skill={s.skill_name}
                      category={s.category}
                      variant="default"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  No technical skills matched from the predefined dictionary.
                </div>
              )}
            </div>
          </div>

          {/* Extracted Clean Text Preview */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-2">
              Cleaned Text Preview
            </h4>
            <div className="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {result.clean_text || result.extracted_text || 'No text extracted.'}
            </div>
          </div>

          {/* Next Step CTA */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Ready to calculate cosine similarity against a job opening?
            </span>
            <button
              onClick={() => navigate('/analysis/new', { state: { resumeId: result.id } })}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <span>Proceed to Job Matching</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
