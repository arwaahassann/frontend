import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <h1 style={{ fontWeight: 900, fontSize: '16px', margin: 0 }}>وظيفة العمر</h1>
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
