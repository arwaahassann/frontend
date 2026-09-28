import { lazy, Suspense } from 'react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const AiChatbot = lazy(() => import('./components/AiChatbot'));

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Applications = lazy(() => import('./pages/Applications'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetail = lazy(() => import('./pages/JobDetail'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Feedback = lazy(() => import('./pages/Feedback'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ManageJobs = lazy(() => import('./pages/employer/ManageJobs'));
const CreateJob = lazy(() => import('./pages/employer/CreateJob'));
const JobApplications = lazy(() => import('./pages/employer/JobApplications'));
const AllApplicants = lazy(() => import('./pages/employer/AllApplicants'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminJobs = lazy(() => import('./pages/admin/AdminJobs'));
const AdminCompanies = lazy(() => import('./pages/admin/AdminCompanies'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));

import { ThemeProvider } from './context/ThemeContext';

const ChatbotHost = () => {
  const { user } = useAuth();
  const [chatbotLoaded, setChatbotLoaded] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isEmployer = user?.role === 'employer';

  if (user?.role === 'admin') return null;

  return (
    <>
      {!chatbotOpen && (
        <button
          type="button"
          onClick={() => {
            setChatbotLoaded(true);
            setChatbotOpen(true);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title={isEmployer ? 'مستشار التوظيف الذكي (AI)' : 'المستشار المهني الذكي (AI)'}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            background: 'linear-gradient(135deg, #1D3557 0%, #00D2B4 100%)',
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '999px',
            padding: isHovered ? '10px 18px' : '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 210, 180, 0.35)',
            fontSize: '13px',
            fontWeight: 800,
            transition: 'all 0.25s ease',
            zIndex: 9998,
          }}
        >
          <Sparkles size={18} color="#ffffff" />
          {isHovered && (
            <span style={{ whiteSpace: 'nowrap', animation: 'fadeInModal 0.2s ease-out' }}>
              {isEmployer ? 'مستشار التوظيف AI' : 'المستشار المهني AI'}
            </span>
          )}
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
        </button>
      )}
      {chatbotLoaded && (
        <Suspense fallback={null}>
          <AiChatbot isOpen={chatbotOpen} hideLauncher onClose={() => setChatbotOpen(false)} />
        </Suspense>
      )}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ChatbotHost />
          <Suspense fallback={<div role="status" style={{ padding: '48px', textAlign: 'center', fontFamily: 'Cairo, sans-serif' }}>جاري تحميل الصفحة...</div>}>
            <Routes>

            {/* 1. صفحات عامة بدون تسجيل دخول */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 2. صفحات رئيسية محمية تتطلب تسجيل دخول أياً كان نوع الحساب */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/"              element={<Home />} />
                <Route path="/jobs"          element={<Jobs />} />
                <Route path="/jobs/:id"      element={<JobDetail />} />
                <Route path="/profile"       element={<Profile />} />
                <Route path="/edit-profile"  element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings"      element={<Settings />} />
                <Route path="/feedback"      element={<Feedback />} />
              </Route>
            </Route>

            {/* 3. مسارات الباحث عن عمل فقط (Job Seeker Only) */}
            <Route element={<ProtectedRoute allowedRoles={['job_seeker', 'admin']} />}>
              <Route element={<Layout />}>
                <Route path="/applications" element={<Applications />} />
                <Route path="/favorites"    element={<Favorites />} />
              </Route>
            </Route>

            {/* 4. مسارات صاحب العمل والشركات فقط (Employer Only) */}
            <Route element={<ProtectedRoute allowedRoles={['employer', 'admin']} />}>
              <Route element={<Layout />}>
                <Route path="/manage"                  element={<ManageJobs />} />
                <Route path="/manage/new"              element={<CreateJob />} />
                <Route path="/manage/:id/edit"         element={<CreateJob />} />
                <Route path="/manage/:id/applications" element={<JobApplications />} />
                <Route path="/manage/applicants"       element={<AllApplicants />} />
              </Route>
            </Route>

            {/* 5. لوحة تحكم المشرف العام (Admin Dashboard) */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin"              element={<AdminDashboard />} />
                <Route path="/admin/jobs"         element={<AdminJobs />} />
                <Route path="/admin/companies"    element={<AdminCompanies />} />
                <Route path="/admin/users"        element={<AdminUsers />} />
                <Route path="/admin/applications" element={<AdminApplications />} />
                <Route path="/admin/reports"      element={<AdminReports />} />
              </Route>
            </Route>

            {/* 6. شاشة 404 مخصصة عند كتابة مسار غير معروف */}
            <Route element={<Layout />}>
              <Route path="*" element={<NotFound />} />
            </Route>

          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
