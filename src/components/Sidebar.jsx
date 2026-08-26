import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Home, Briefcase, FileText, Bookmark, Bell, X,
  PlusCircle, List, Users, Settings, LogOut, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  // جلب عدد الإشعارات غير المقروءة
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');

    const fetchUnread = () => {
      fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    };

    fetchUnread();
    // تحديث كل دقيقة
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // ================ قائمة الباحث عن عمل ================
  const seekerItems = [
    { name: 'الرئيسية',       icon: Home,      path: '/' },
    { name: 'جميع الوظائف',   icon: Briefcase, path: '/jobs' },
    { name: 'طلباتي',         icon: FileText,  path: '/applications' },
    { name: 'قائمة المفضلات', icon: Bookmark,  path: '/favorites' },
    { name: 'الاشعارات',      icon: Bell,      path: '/notifications', badge: unreadCount },
  ];

  // ================ قائمة مدير التوظيف ================
  const employerItems = [
    { name: 'الرئيسية',      icon: Home,       path: '/' },
    { name: 'نشر وظيفة',     icon: PlusCircle, path: '/manage/new' },
    { name: 'إدارة الوظائف', icon: List,       path: '/manage' },
    { name: 'المتقدمين',     icon: Users,      path: '/manage/applicants' },
    { name: 'الاشعارات',      icon: Bell,      path: '/notifications', badge: unreadCount },
    { name: 'الإعدادات',     icon: Settings,   path: '/settings' },
  ];

  const menuItems = user?.role === 'employer' ? employerItems : seekerItems;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 40,
          }}
        />
      )}

      <aside
        dir="rtl"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '240px',
          height: '100vh',
          background: '#1D3557',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          fontFamily: 'Cairo, sans-serif',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '18px', margin: 0 }}>
            وظيفة العمر
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isDarkMode ? '#f59e0b' : '#00D2B4',
                transition: 'all 0.2s',
              }}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={onClose}
              className="sidebar-close"
              style={{
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                display: 'none',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto',
        }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path + item.name}
              to={item.path}
              onClick={() => {
                // لما يفتح الإشعارات يصفر العداد مؤقتاً (الـ real count هيتحدث من الـ API)
                if (item.path === '/notifications') setUnreadCount(0);
                onClose();
              }}
              end
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? 700 : 500,
                fontFamily: 'Cairo, sans-serif',
                background: isActive ? '#00D2B4' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                transition: 'all 0.2s',
                position: 'relative',
              })}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} />
                  <span style={{ flex: 1 }}>{item.name}</span>

                  {/* Badge عدد الإشعارات */}
                  {item.badge > 0 && (
                    <span style={{
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '999px',
                      background: isActive ? 'rgba(255,255,255,0.3)' : '#ef4444',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 6px',
                      lineHeight: 1,
                      boxShadow: isActive ? 'none' : '0 0 0 2px rgba(239,68,68,0.25)',
                      animation: 'badgePulse 2s ease-in-out infinite',
                    }}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: 'space-between',
        }}>
          {/* كارت المستخدم قابل للضغط للانتقال لملفي الشخصي */}
          <NavLink
            to="/profile"
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              overflow: 'hidden', textDecoration: 'none', flex: 1,
              padding: '6px 8px', borderRadius: '10px',
              transition: 'background 0.2s', cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: '#00D2B4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: '#fff', fontSize: '15px', flexShrink: 0,
              overflow: 'hidden', border: '1.5px solid #00D2B4',
            }}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0) || 'أ'
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{
                color: '#fff', fontWeight: 700, fontSize: '13px',
                margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.name || 'أحمد محمد'}
              </p>
              <p style={{
                color: '#00D2B4', fontSize: '11px', margin: 0,
                fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.role === 'employer'
                  ? (user?.company || user?.jobTitle || 'مسؤول التوظيف')
                  : (user?.jobTitle || 'باحث عن عمل')}
              </p>
            </div>
          </NavLink>

          <button
            onClick={logout}
            title="تسجيل الخروج"
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer',
              color: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          aside { transform: translateX(${isOpen ? '0' : '100%'}) !important; }
          .sidebar-close { display: flex !important; }
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
