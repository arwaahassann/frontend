import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  Bookmark,
  FileSpreadsheet,
  LogOut,
  Menu,
  ShieldCheck,
  Bell,
  User,
  AlertTriangle,
  X,
  Check,
  CheckCheck,
  Trash2,
  Square,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import ProfileImage from '../ProfileImage';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifTab, setNotifTab] = useState('all');
  const [notifData, setNotifData] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const [selectedNotifKeys, setSelectedNotifKeys] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [notifActionLoading, setNotifActionLoading] = useState(false);
  const bellRef = useRef(null);
  const notifRequestRef = useRef(false);
  const notifCountRequestRef = useRef(false);
  const notifCountRefreshPendingRef = useRef(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const navItems = [
    { to: '/admin', end: true, label: 'الرئيسية', icon: LayoutDashboard },
    { to: '/admin/jobs', label: 'الوظائف', icon: Briefcase },
    { to: '/admin/companies', label: 'الشركات', icon: Building2 },
    { to: '/admin/users', label: 'المستخدمين', icon: Users },
    { to: '/admin/applications', label: 'طلبات المتقدم', icon: Bookmark },
    { to: '/admin/reports', label: 'الشكاوي والمقترحات', icon: FileSpreadsheet },
  ];

  const fetchNotifs = useCallback(async () => {
    if (notifRequestRef.current) return;
    notifRequestRef.current = true;
    try {
      setNotifLoading(true);
      setNotifError('');
      const res = await api.get('/api/admin/notifications');
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'تعذر تحميل إشعارات الإدارة');
      }
      setNotifData(res.data);
    } catch (error) {
      setNotifError(error.response?.data?.message || error.message || 'تعذر تحميل إشعارات الإدارة');
    }
    finally {
      notifRequestRef.current = false;
      setNotifLoading(false);
    }
  }, []);

  const fetchNotificationCount = useCallback(async () => {
    if (notifCountRequestRef.current) {
      notifCountRefreshPendingRef.current = true;
      return;
    }
    notifCountRequestRef.current = true;
    do {
      notifCountRefreshPendingRef.current = false;
      try {
        const res = await api.get('/api/admin/notifications/count');
        if (!res.data?.success) {
          throw new Error(res.data?.message || 'تعذر تحميل عدد الإشعارات');
        }
        setNotificationCount(res.data.totalPending || 0);
      } catch (error) {
        console.error('Failed to load admin notification count:', error.message);
      }
    } while (notifCountRefreshPendingRef.current);
    notifCountRequestRef.current = false;
  }, []);

  const openAdminSection = (section, notificationKey, searchText) => {
    const [type, id] = (notificationKey || '').split(':');
    const destinations = {
      user: { path: '/admin/users', params: { role: 'job_seeker' } },
      company: { path: '/admin/companies', params: { status: 'reviewing' } },
      job: { path: '/admin/jobs', params: { status: 'reviewing' } },
      report: { path: '/admin/reports', params: { status: 'all' } },
    };
    if (type === 'job' && id) {
      const job = notifData?.pendingJobs?.find(item => String(item._id) === id);
      if (job?.status === 'deletion_pending') destinations.job.params.status = 'deletion_pending';
    }
    const destination = destinations[section] || { path: '/admin', params: {} };
    const params = new URLSearchParams(destination.params);
    if (searchText) params.set('search', searchText);
    setBellOpen(false);
    setSelectionMode(false);
    setSelectedNotifKeys([]);
    navigate(`${destination.path}${params.size ? `?${params.toString()}` : ''}`);
  };

  useEffect(() => {
    fetchNotificationCount();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchNotificationCount();
    };
    const interval = setInterval(refreshWhenVisible, 60000);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [fetchNotificationCount]);

  useEffect(() => {
    if (!bellOpen) return undefined;

    fetchNotifs();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchNotifs();
    };
    const interval = setInterval(refreshWhenVisible, 60000);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [bellOpen, fetchNotifs]);

  // Close bell on outside click
  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalPending = notificationCount;

  const tabs = [
    { key: 'all', label: 'الكل', icon: Bell },
    { key: 'users', label: 'مستخدمون جدد', icon: User },
    { key: 'companies', label: 'شركات تحتاج موافقة', icon: Building2 },
    { key: 'jobs', label: 'وظائف معلقة', icon: Briefcase },
    { key: 'reports', label: 'شكاوي', icon: AlertTriangle },
  ];

  const formatDate = (d) => new Date(d).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });

  const getTabItems = () => {
    if (!notifData) return [];
    if (notifTab === 'all') {
      return (notifData.recentAll || []).map(item => ({
        key: item.notificationKey,
        title: item.text,
        date: item.date,
        section: item.type,
        entityId: item.entityId,
        searchText: item.searchText,
        isRead: item.isRead,
      }));
    }

    const categoryItems = {
      users: (notifData.newUsers || []).map(item => ({
        key: item.notificationKey,
        title: item.name,
        description: item.email,
        date: item.createdAt,
        section: 'user',
        entityId: item._id,
        searchText: item.name,
        isRead: item.isRead,
      })),
      companies: (notifData.newCompanies || []).map(item => ({
        key: item.notificationKey,
        title: item.company || item.name,
        description: 'تحتاج موافقة',
        date: item.createdAt,
        section: 'company',
        entityId: item._id,
        searchText: item.company || item.name,
        isRead: item.isRead,
      })),
      jobs: (notifData.pendingJobs || []).map(item => ({
        key: item.notificationKey,
        title: item.title,
        description: item.status === 'deletion_pending' ? 'طلب حذف' : 'تنتظر الموافقة',
        date: item.createdAt,
        section: 'job',
        entityId: item._id,
        searchText: item.title,
        isRead: item.isRead,
      })),
      reports: (notifData.reports || []).map(item => ({
        key: item.notificationKey,
        title: item.subject,
        description: item.type === 'complaint' ? 'شكوى' : 'مقترح',
        date: item.createdAt,
        section: 'report',
        entityId: item._id,
        searchText: item.subject,
        isRead: item.isRead,
      })),
    };
    return categoryItems[notifTab] || [];
  };

  const allTabItems = getTabItems();
  const filteredTabItems = allTabItems;
  const selectedVisibleKeys = filteredTabItems.map(item => item.key).filter(Boolean);
  const allVisibleSelected = selectedVisibleKeys.length > 0
    && selectedVisibleKeys.every(key => selectedNotifKeys.includes(key));

  const updateNotificationStates = async (keys, action, keepSelection = false) => {
    if (!keys.length) return;
    try {
      setNotifActionLoading(true);
      setNotifError('');
      await api.put('/api/admin/notifications/state', { keys, action });
      if (!keepSelection) {
        setSelectedNotifKeys([]);
        setSelectionMode(false);
      }
      await fetchNotifs();
      await fetchNotificationCount();
    } catch (error) {
      setNotifError(error.response?.data?.message || error.message || 'تعذر تحديث الإشعارات');
    } finally {
      setNotifActionLoading(false);
    }
  };

  const toggleNotifSelection = (key) => {
    setSelectedNotifKeys(current => current.includes(key)
      ? current.filter(selectedKey => selectedKey !== key)
      : [...current, key]);
  };

  const markAllVisibleAsRead = () => {
    const keys = allTabItems.map(item => item.key).filter(Boolean);
    setSelectedNotifKeys(keys);
    setSelectionMode(true);
    updateNotificationStates(keys, 'read', true);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(current => !current);
    setSelectedNotifKeys([]);
  };

  const renderTabContent = () => {
    if (notifLoading) return <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>جاري التحميل...</div>;
    if (!notifData) return <div role="alert" style={{ padding: '24px', textAlign: 'center', color: '#dc2626', fontSize: '13px' }}>{notifError || 'لا توجد إشعارات'}</div>;

    if (!filteredTabItems.length) {
      return <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '15px' }}>
        {allTabItems.length ? 'لا توجد إشعارات في هذا التصنيف' : 'لا توجد إشعارات'}
      </div>;
    }
    return filteredTabItems.map(item => {
      const isSelected = selectedNotifKeys.includes(item.key);
      return (
      <div
        key={item.key}
        style={{ padding: '13px 18px', borderBottom: '1px solid #e2e8f0', background: isSelected ? '#e0f2fe' : item.isRead ? '#fff' : '#effaf8', borderRight: isSelected ? '4px solid #0284c7' : item.isRead ? '4px solid transparent' : '4px solid #00b89c', display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        {selectionMode && (
          <input
            type="checkbox"
            aria-label={`تحديد الإشعار: ${item.title}`}
            checked={isSelected}
            onChange={() => toggleNotifSelection(item.key)}
            style={{ width: '21px', height: '21px', accentColor: '#0284c7', flexShrink: 0, cursor: 'pointer' }}
          />
        )}
        <button
          type="button"
          onClick={event => {
            if (selectionMode) {
              event.preventDefault();
              toggleNotifSelection(item.key);
            } else {
              if (!item.isRead) updateNotificationStates([item.key], 'read');
              setNotifTab(({ user: 'users', company: 'companies', job: 'jobs', report: 'reports' })[item.section] || 'all');
              openAdminSection(item.section, item.key, item.searchText);
            }
          }}
          style={{ flex: 1, minWidth: 0, padding: 0, border: 0, background: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', textAlign: 'right', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}
        >
          <span style={{ display: 'block', minWidth: 0, flex: 1 }}>
            <span style={{ display: 'block', overflowWrap: 'anywhere', fontSize: '14px', color: '#1e293b', fontWeight: item.isRead ? 600 : 800, lineHeight: 1.6 }}>{item.title}</span>
            {item.description && <span style={{ display: 'block', marginTop: '3px', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{item.description}</span>}
          </span>
          <span style={{ flexShrink: 0, borderRadius: '8px', background: '#f1f5f9', padding: '4px 7px', fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>{formatDate(item.date)}</span>
        </button>
      </div>
      );
    });
  };

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Cairo, sans-serif' }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      )}

      <header className="mobile-header" style={{ display: 'none', position: 'sticky', top: 0, zIndex: 30, background: '#1D3557', color: '#fff', padding: '14px 20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <NavLink to="/admin" aria-label="العودة إلى الصفحة الرئيسية للوحة المشرف" style={{ color: 'inherit', fontWeight: 900, fontSize: '16px', margin: 0, textDecoration: 'none' }}>
          وظيفة العمر
        </NavLink>
        <button type="button" onClick={() => setSidebarOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#fff' }}>
          <Menu size={20} />
        </button>
      </header>

      <aside style={{ position: 'fixed', top: 0, right: 0, width: '260px', height: '100vh', background: '#1D3557', display: 'flex', flexDirection: 'column', zIndex: 50, fontFamily: 'Cairo, sans-serif' }} className="admin-sidebar">
        <div style={{ padding: '22px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <NavLink
              to="/admin"
              onClick={() => { setBellOpen(false); setSidebarOpen(false); }}
              aria-label="العودة إلى الصفحة الرئيسية للوحة المشرف"
              style={{ display: 'inline-block', color: '#fff', fontWeight: 900, fontSize: '18px', margin: 0, textDecoration: 'none' }}
            >
              وظيفة العمر
            </NavLink>
            <p style={{ color: '#00D2B4', fontSize: '12px', margin: '6px 0 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} /> لوحة المشرف
            </p>
          </div>

          {/* 🔔 زر الجرس */}
          <div ref={bellRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setBellOpen((open) => !open)}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Bell size={18} />
              {totalPending > 0 && (
                <span style={{ position: 'absolute', top: '-7px', right: '-7px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', direction: 'ltr', borderRadius: '999px', minWidth: '19px', height: '19px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', boxSizing: 'border-box', border: '2px solid #1D3557' }}>
                  {totalPending > 99 ? '99+' : totalPending}
                </span>
              )}
            </button>

            {/* Dropdown Panel */}
            {bellOpen && (
              <div className="admin-notification-panel" style={{ position: 'fixed', top: '6vh', right: '50%', transform: 'translateX(50%)', width: '860px', maxWidth: '94vw', height: '88vh', background: '#fff', borderRadius: '18px', boxShadow: '0 24px 72px rgba(0,0,0,0.22)', border: '1px solid #e2e8f0', zIndex: 200, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: '#1e293b' }}>إشعارات المشرف</span>
                  <button onClick={() => setBellOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}><X size={16} /></button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #f1f5f9', padding: '0 8px', gap: '2px' }}>
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setNotifTab(tab.key)}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px 10px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', border: 'none', background: 'transparent', cursor: 'pointer', color: notifTab === tab.key ? '#00a990' : '#64748b', borderBottom: notifTab === tab.key ? '2px solid #00D2B4' : '2px solid transparent', fontFamily: 'Cairo, sans-serif' }}
                    >
                      <tab.icon size={15} />
                      {tab.label}
                      <span dir="ltr" style={{ display: 'inline-flex', minWidth: '21px', height: '21px', alignItems: 'center', justifyContent: 'center', background: notifTab === tab.key ? '#d1fae5' : '#f1f5f9', color: '#475569', borderRadius: '999px', padding: '0 5px', boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums', fontSize: '10px' }}>
                        {notifData?.counts?.[tab.key] ?? 0}
                      </span>
                      {(notifData?.unreadCounts?.[tab.key] || 0) > 0 && (
                        <span dir="ltr" style={{ display: 'inline-flex', minWidth: '19px', height: '19px', alignItems: 'center', justifyContent: 'center', background: '#ef4444', color: '#fff', borderRadius: '999px', padding: '0 5px', boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums', fontSize: '9px' }}>
                          {notifData.unreadCounts[tab.key]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={toggleSelectionMode}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '9px', padding: '7px 13px', background: selectionMode ? '#e0f2fe' : '#fff', color: selectionMode ? '#0369a1' : '#475569', fontFamily: 'Cairo, sans-serif', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {selectionMode ? 'إلغاء التحديد' : 'تحديد'}
                      </button>
                      {selectionMode && (
                        <button
                          type="button"
                          onClick={() => setSelectedNotifKeys(current => allVisibleSelected
                            ? current.filter(key => !selectedVisibleKeys.includes(key))
                            : [...new Set([...current, ...selectedVisibleKeys])])}
                          style={{ border: '1px solid #cbd5e1', borderRadius: '9px', padding: '7px 13px', background: '#fff', color: '#475569', fontFamily: 'Cairo, sans-serif', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          {allVisibleSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                    <button
                      type="button"
                      disabled={notifActionLoading || allTabItems.every(item => item.isRead)}
                      onClick={markAllVisibleAsRead}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '6px 10px', background: '#ecfdf5', color: '#047857', fontFamily: 'Cairo, sans-serif', fontSize: '12px', fontWeight: 700, cursor: notifActionLoading ? 'wait' : 'pointer', opacity: allTabItems.every(item => item.isRead) ? 0.5 : 1 }}
                    >
                      <CheckCheck size={14} /> قراءة الكل
                    </button>
                    {selectedNotifKeys.length > 0 && (
                      <>
                        <button type="button" disabled={notifActionLoading} onClick={() => updateNotificationStates(selectedNotifKeys, 'read')} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', background: '#fff', color: '#475569', fontFamily: 'Cairo, sans-serif', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          <Check size={14} /> مقروء
                        </button>
                        <button type="button" disabled={notifActionLoading} onClick={() => updateNotificationStates(selectedNotifKeys, 'unread')} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', background: '#fff', color: '#475569', fontFamily: 'Cairo, sans-serif', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          <Square size={14} /> غير مقروء
                        </button>
                        <button type="button" disabled={notifActionLoading} onClick={() => updateNotificationStates(selectedNotifKeys, 'delete')} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 10px', background: '#fef2f2', color: '#b91c1c', fontFamily: 'Cairo, sans-serif', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          <Trash2 size={14} /> حذف المحدد ({selectedNotifKeys.length})
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="admin-notification-content" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {notifError && notifData && <p role="alert" style={{ margin: 0, padding: '8px 12px', color: '#dc2626', background: '#fef2f2', fontSize: '11px' }}>{notifError}</p>}
                  {renderTabContent()}
                </div>

                {/* Footer */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                  <button onClick={fetchNotifs} style={{ fontSize: '14px', color: '#00D2B4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>تحديث</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                  borderRadius: '12px', textDecoration: 'none', marginBottom: '6px',
                  fontSize: '14px', fontWeight: 700,
                  color: isActive ? '#fff' : '#cbd5e1',
                  background: isActive ? '#00D2B4' : 'transparent',
                  boxShadow: isActive ? '0 6px 16px rgba(0,210,180,0.28)' : 'none',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <ProfileImage
                src={user?.avatar}
                alt={user?.name || 'المشرف'}
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ overflow: 'hidden' }}>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: '13px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'المشرف'}</p>
                <p style={{ color: '#00D2B4', fontSize: '11px', margin: 0, fontWeight: 700 }}>مشرف</p>
              </div>
            </div>
            <button type="button" onClick={logout} title="تسجيل الخروج" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main" style={{ marginRight: '260px', padding: '32px 36px', minHeight: '100vh', boxSizing: 'border-box' }}>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(${sidebarOpen ? '0' : '100%'}); transition: transform 0.3s ease; }
          .admin-main { margin-right: 0 !important; padding: 16px 12px !important; }
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
