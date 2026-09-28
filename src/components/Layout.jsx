import { useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProfileCompletionReminder from './ProfileCompletionReminder';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Cairo, sans-serif' }}>
      {/* هيدر الموبايل */}
      <header
        className="mobile-header"
        style={{
          display: 'none',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: '#1D3557',
          color: '#fff',
          padding: '14px 20px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" aria-label="العودة إلى الصفحة الرئيسية" style={{ color: 'inherit', fontWeight: 900, fontSize: '16px', margin: 0, textDecoration: 'none' }}>
          وظيفة العمر
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: '#fff',
          }}
        >
          <Menu size={20} />
        </button>
      </header>

      {/* الشريط الجانبي */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* المحتوى الرئيسي */}
      <main
        className="main-content"
        style={{
          marginRight: '240px',
          padding: '36px 40px',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
          <ProfileCompletionReminder />
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
          .main-content { margin-right: 0 !important; padding: 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
