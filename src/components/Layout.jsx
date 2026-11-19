import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProfileCompletionReminder from './ProfileCompletionReminder';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/api/notifications?countOnly=true');
        if (active && res.data?.success) setUnreadCount(res.data.unreadCount || 0);
      } catch {
        if (active) setUnreadCount(0);
      }
    };
    fetchUnread();
    const interval = window.setInterval(fetchUnread, 15000);
    const refreshOnFocus = () => fetchUnread();
    const handleNotificationUpdate = () => fetchUnread();
    window.addEventListener('focus', refreshOnFocus);
    window.addEventListener('notificationUpdated', handleNotificationUpdate);
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshOnFocus);
      window.removeEventListener('notificationUpdated', handleNotificationUpdate);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [user]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to="/notifications"
            aria-label={`الإشعارات${unreadCount > 0 ? `، ${unreadCount} غير مقروءة` : ''}`}
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span dir="ltr" style={{
                position: 'absolute',
                top: '-7px',
                right: '-7px',
                minWidth: '20px',
                height: '20px',
                borderRadius: '999px',
                background: '#ef4444',
                color: '#fff',
                border: '2px solid #1D3557',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 900,
                padding: '0 4px',
                boxSizing: 'border-box',
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="فتح القائمة"
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
        </div>
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
