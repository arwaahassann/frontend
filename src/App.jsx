import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Applications from './pages/Applications';
import Notifications from './pages/Notifications';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';

import ManageJobs from './pages/employer/ManageJobs';
import CreateJob from './pages/employer/CreateJob';
import JobApplications from './pages/employer/JobApplications';
import AllApplicants from './pages/employer/AllApplicants';
import AiChatbot from './components/AiChatbot';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1082264669294-demo.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AiChatbot />
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

            {/* 5. شاشة 404 مخصصة عند كتابة مسار غير معروف */}
            <Route element={<Layout />}>
              <Route path="*" element={<NotFound />} />
            </Route>

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </GoogleOAuthProvider>
  );
}

export default App;
