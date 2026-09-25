import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ResumeUpload from './pages/ResumeUpload';
import ResumeAnalysis from './pages/ResumeAnalysis';
import JobCreate from './pages/JobCreate';
import JobDetails from './pages/JobDetails';
import JobsList from './pages/JobsList';
import ResumesList from './pages/ResumesList';
import CandidateComparison from './pages/CandidateComparison';
import AnalysisHistory from './pages/AnalysisHistory';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

function RoleHomeRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 'RECRUITER' ? (
    <Navigate to="/recruiter" replace />
  ) : (
    <Navigate to="/candidate" replace />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Role Redirect */}
          <Route path="/" element={<RoleHomeRedirect />} />

          {/* Candidate Dashboard */}
          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'RECRUITER']}>
                <AppLayout>
                  <CandidateDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Recruiter Dashboard */}
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <AppLayout>
                  <RecruiterDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Resume Upload */}
          <Route
            path="/resumes/upload"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ResumeUpload />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Resumes List */}
          <Route
            path="/resumes"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ResumesList />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Jobs List */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <JobsList />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Job Creation */}
          <Route
            path="/jobs/new"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <AppLayout>
                  <JobCreate />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Job Details & Candidate Ranking */}
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <JobDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Resume Match Analysis (New & Detail View) */}
          <Route
            path="/analysis/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ResumeAnalysis />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ResumeAnalysis />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Candidate Comparison */}
          <Route
            path="/compare"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <AppLayout>
                  <CandidateComparison />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Analysis History */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AnalysisHistory />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<RoleHomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
