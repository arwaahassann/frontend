import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Bookmark,
  FileSpreadsheet,
  LogOut,
  Menu,
  ShieldCheck,
  Bell,
  AlertTriangle,
  X,
  Check,
  CheckCheck,
  Trash2,
  Square,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import { searchAdminAccounts } from '../../api/admin';
import ProfileImage from '../ProfileImage';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
  const accountSearchRef = useRef(null);
  const notifRequestRef = useRef(false);
  const notifCountRequestRef = useRef(false);
  const notifCountRefreshPendingRef = useRef(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [accountSearch, setAccountSearch] = useState('');
  const [accountSearchOpen, setAccountSearchOpen] = useState(false);
  const [accountSearchLoading, setAccountSearchLoading] = useState(false);
  const [accountSearchError, setAccountSearchError] = useState('');
  const [accountSearchResults, setAccountSearchResults] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const navItems = [
    { to: '/admin', end: true, label: 'الرئيسية', icon: LayoutDashboard },
    { to: '/admin/seekers', label: 'الباحثون عن عمل', icon: Users },
    { to: '/admin/jobs', label: 'الوظائف', icon: Briefcase },
    { to: '/admin/companies', label: 'الشركات', icon: Building2 },
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
      if (res.data?.unreadCount !== undefined) {
        setNotificationCount(res.data.unreadCount);
      }
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
        setNotificationCount(res.data.unreadCount ?? res.data.totalPending ?? 0);
      } catch (error) {
        console.error('Failed to load admin notification count:', error.message);
      }
    } while (notifCountRefreshPendingRef.current);
    notifCountRequestRef.current = false;
  }, []);

  const openAdminSection = (section, notificationKey, searchText) => {
    const [type, id] = (notificationKey || '').split(':');
    const destinations = {
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
  }, [location.pathname, fetchNotificationCount]);

  useEffect(() => {
    const query = accountSearch.trim();
    if (!accountSearchOpen || query.length < 2) {
      setAccountSearchResults([]);
      setAccountSearchError('');
      setAccountSearchLoading(false);
      return undefined;
    }

    let active = true;
    const timeoutId = setTimeout(async () => {
      try {
        setAccountSearchLoading(true);
        setAccountSearchError('');
        const res = await searchAdminAccounts(query);
        if (active) {
          if (!res.success) throw new Error(res.message || 'تعذر البحث عن الحسابات');
          setAccountSearchResults(res.users || []);
        }
      } catch (error) {
        if (active) {
          setAccountSearchResults([]);
          setAccountSearchError(error.response?.data?.message || error.message || 'تعذر البحث عن الحسابات');
        }
      } finally {
        if (active) setAccountSearchLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [accountSearch, accountSearchOpen]);

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

  useEffect(() => {
    const handler = (event) => {
      if (accountSearchRef.current && !accountSearchRef.current.contains(event.target)) {
        setAccountSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setAccountSearchOpen(false);
  }, [location.pathname]);

  const openAccount = (account) => {
    setAccountSearchOpen(false);
    setSelectedAccount(account);
  };

  useEffect(() => {
    if (!selectedAccount) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedAccount(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedAccount]);

  const totalPending = notificationCount;

  const tabs = [
    { key: 'all', label: 'الكل', icon: Bell },
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
        style={{ padding: '13px 18px', borderBottom: '1px solid #e2e8f0', background: isSelected ? '#e0f2fe' : item.isRead ? '#fff' : '#e6fffa', borderRight: isSelected ? '4px solid #0284c7' : item.isRead ? '4px solid transparent' : '4px solid #00D2B4', display: 'flex', alignItems: 'center', gap: '12px' }}
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
              setNotifTab(({ company: 'companies', job: 'jobs', report: 'reports' })[item.section] || 'all');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setBellOpen((open) => !open)}
            aria-label="إشعارات المشرف"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Bell size={18} />
            {totalPending > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', direction: 'ltr', borderRadius: '999px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', boxSizing: 'border-box', border: '2px solid #1D3557' }}>
                {totalPending > 99 ? '99+' : totalPending}
              </span>
            )}
          </button>
          <button type="button" onClick={() => setSidebarOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#fff' }}>
            <Menu size={20} />
          </button>
        </div>
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
        <div ref={accountSearchRef} className="admin-account-search">
          <div className="admin-account-search__bar">
            <div className="admin-account-search__intro">
              <span className="admin-account-search__icon"><Search size={18} /></span>
              <span>
                <span className="admin-account-search__title">بحث عن حساب</span>
                <span className="admin-account-search__hint">بالاسم أو رقم الهاتف أو البريد الإلكتروني</span>
              </span>
            </div>
            <div className="admin-account-search__field">
              <input
                id="admin-account-search"
                type="search"
                value={accountSearch}
                onChange={(event) => setAccountSearch(event.target.value)}
                onFocus={() => setAccountSearchOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setAccountSearchOpen(false);
                }}
                placeholder="ابدأ بكتابة بيانات الحساب..."
                autoComplete="off"
                aria-label="بحث عام عن حساب بالاسم أو الهاتف أو البريد الإلكتروني"
                aria-expanded={accountSearchOpen && accountSearch.trim().length >= 2}
                aria-controls="admin-account-search-results"
              />
              {accountSearch ? (
                <button
                  type="button"
                  className="admin-account-search__clear"
                  onClick={() => {
                    setAccountSearch('');
                    setAccountSearchOpen(true);
                  }}
                  aria-label="مسح البحث"
                >
                  <X size={16} />
                </button>
              ) : (
                <kbd className="admin-account-search__shortcut">بحث سريع</kbd>
              )}
            </div>
          </div>
          {accountSearchOpen && accountSearch.trim().length < 2 && (
            <div className="admin-account-search__popover admin-account-search__empty">
              اكتبي حرفين على الأقل لبدء البحث
            </div>
          )}
          {accountSearchOpen && accountSearch.trim().length >= 2 && (
            <div id="admin-account-search-results" role="listbox" aria-label="نتائج البحث عن الحسابات" className="admin-account-search__popover">
              <div className="admin-account-search__results-heading">
                <span>نتائج الحسابات</span>
                {!accountSearchLoading && !accountSearchError && accountSearchResults.length > 0 && (
                  <span>{accountSearchResults.length} نتائج</span>
                )}
              </div>
              {accountSearchLoading ? (
                <p role="status" className="admin-account-search__message">جاري البحث عن الحسابات...</p>
              ) : accountSearchError ? (
                <p role="alert" className="admin-account-search__message admin-account-search__message--error">{accountSearchError}</p>
              ) : accountSearchResults.length === 0 ? (
                <p className="admin-account-search__message">لا توجد حسابات مطابقة، جرّبي الاسم أو البريد أو رقم الهاتف.</p>
              ) : (
                accountSearchResults.map((account) => (
                  <button
                    key={account._id}
                    type="button"
                    role="option"
                    aria-selected="false"
                    onClick={() => openAccount(account)}
                    className="admin-account-search__result"
                  >
                    <ProfileImage src={account.avatar} alt={account.name || 'الحساب'} className="admin-account-search__avatar" />
                    <span className="admin-account-search__details">
                      <span className="admin-account-search__name">
                        {account.name || account.company || 'حساب بدون اسم'}
                        <span className={`admin-account-search__badge ${account.role === 'employer' ? 'is-employer' : 'is-seeker'}`}>
                          {account.role === 'employer' ? 'شركة' : 'باحث عن عمل'}
                        </span>
                      </span>
                      {account.role === 'employer' && account.company && account.company !== account.name && (
                        <span className="admin-account-search__company">{account.company}</span>
                      )}
                      <span className="admin-account-search__contact">
                        {[account.email, account.phone].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    <span className="admin-account-search__open">عرض الحساب</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <Outlet />
      </main>

      {selectedAccount && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedAccount(null);
          }}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-account-details-title"
            dir="rtl"
            style={{ width: '100%', maxWidth: '480px', borderRadius: '20px', background: '#fff', padding: '24px', boxShadow: '0 24px 64px rgba(15,23,42,0.25)', fontFamily: 'Cairo, sans-serif' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h2 id="admin-account-details-title" style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 900 }}>بيانات الحساب</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px' }}>عرض فقط، إدارة الحسابات غير متاحة من هذه اللوحة</p>
              </div>
              <button type="button" onClick={() => setSelectedAccount(null)} aria-label="إغلاق بيانات الحساب" style={{ display: 'grid', placeItems: 'center', width: '34px', height: '34px', border: 0, borderRadius: '10px', background: '#f1f5f9', color: '#475569', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <ProfileImage src={selectedAccount.avatar} alt={selectedAccount.name || 'الحساب'} className="admin-account-search__avatar" />
              <div>
                <strong style={{ display: 'block', color: '#1e293b', fontSize: '15px' }}>{selectedAccount.name || selectedAccount.company || 'حساب بدون اسم'}</strong>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{selectedAccount.role === 'employer' ? 'شركة' : 'باحث عن عمل'}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gap: '12px', color: '#334155', fontSize: '13px' }}>
              {selectedAccount.company && <p style={{ margin: 0 }}><strong>الشركة:</strong> {selectedAccount.company}</p>}
              {selectedAccount.email && <p style={{ margin: 0, overflowWrap: 'anywhere' }}><strong>البريد الإلكتروني:</strong> {selectedAccount.email}</p>}
              {selectedAccount.phone && <p style={{ margin: 0 }}><strong>رقم الهاتف:</strong> {selectedAccount.phone}</p>}
              {selectedAccount.accountStatus && <p style={{ margin: 0 }}><strong>الحالة:</strong> {selectedAccount.accountStatus}</p>}
            </div>
          </section>
        </div>
      )}

      <style>{`
        .admin-account-search {
          position: sticky;
          top: 12px;
          z-index: 30;
          max-width: 760px;
          margin: 0 0 28px auto;
        }
        .admin-account-search__bar {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 14px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: rgba(255,255,255,0.96);
          box-shadow: 0 5px 18px rgba(15,23,42,0.06);
          backdrop-filter: blur(12px);
        }
        .admin-account-search__intro {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 0 0 auto;
          min-width: 185px;
        }
        .admin-account-search__icon {
          display: grid;
          width: 38px;
          height: 38px;
          place-items: center;
          border-radius: 12px;
          color: #0f766e;
          background: #e6fffa;
        }
        .admin-account-search__title,
        .admin-account-search__hint {
          display: block;
        }
        .admin-account-search__title {
          color: #1e293b;
          font-size: 13px;
          font-weight: 900;
        }
        .admin-account-search__hint {
          margin-top: 2px;
          color: #64748b;
          font-size: 10px;
          font-weight: 600;
        }
        .admin-account-search__field {
          position: relative;
          flex: 1;
          min-width: 0;
        }
        .admin-account-search__field input {
          width: 100%;
          box-sizing: border-box;
          height: 44px;
          padding: 0 14px 0 82px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          background: #f8fafc;
          color: #1e293b;
          font-family: Cairo, sans-serif;
          font-size: 13px;
          transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;
        }
        .admin-account-search__field input:focus {
          border-color: #00b89c;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0,210,180,0.13);
        }
        .admin-account-search__field input::placeholder {
          color: #94a3b8;
        }
        .admin-account-search__shortcut,
        .admin-account-search__clear {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
        }
        .admin-account-search__shortcut {
          padding: 3px 7px;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          background: #fff;
          color: #94a3b8;
          font-family: Cairo, sans-serif;
          font-size: 10px;
        }
        .admin-account-search__clear {
          display: grid;
          width: 28px;
          height: 28px;
          place-items: center;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #64748b;
          cursor: pointer;
        }
        .admin-account-search__clear:hover {
          background: #f1f5f9;
          color: #334155;
        }
        .admin-account-search__popover {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          left: 0;
          max-height: min(60vh, 480px);
          overflow-y: auto;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 18px 48px rgba(15,23,42,0.16);
        }
        .admin-account-search__empty,
        .admin-account-search__message {
          margin: 0;
          padding: 16px;
          color: #64748b;
          font-size: 12px;
          text-align: center;
        }
        .admin-account-search__results-heading {
          display: flex;
          justify-content: space-between;
          padding: 11px 14px;
          border-bottom: 1px solid #f1f5f9;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
        }
        .admin-account-search__message--error {
          color: #b91c1c;
        }
        .admin-account-search__result {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border: 0;
          border-bottom: 1px solid #f1f5f9;
          background: #fff;
          text-align: right;
          cursor: pointer;
          font-family: Cairo, sans-serif;
          transition: background 120ms ease;
        }
        .admin-account-search__result:last-child {
          border-bottom: 0;
        }
        .admin-account-search__result:hover,
        .admin-account-search__result:focus-visible {
          outline: none;
          background: #f8fafc;
        }
        .admin-account-search__avatar {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          object-fit: cover;
        }
        .admin-account-search__details {
          display: block;
          min-width: 0;
          flex: 1;
        }
        .admin-account-search__name {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
          color: #1e293b;
          font-size: 13px;
          font-weight: 900;
        }
        .admin-account-search__badge {
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
        }
        .admin-account-search__badge.is-employer {
          background: #ecfdf5;
          color: #047857;
        }
        .admin-account-search__badge.is-seeker {
          background: #eff6ff;
          color: #1d4ed8;
        }
        .admin-account-search__company {
          display: block;
          margin-top: 2px;
          color: #475569;
          font-size: 12px;
        }
        .admin-account-search__contact {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 11px;
          overflow-wrap: anywhere;
        }
        .admin-account-search__open {
          flex: 0 0 auto;
          color: #0f766e;
          font-size: 11px;
          font-weight: 800;
        }
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(${sidebarOpen ? '0' : '100%'}); transition: transform 0.3s ease; }
          .admin-main { margin-right: 0 !important; padding: 16px 12px !important; }
          .mobile-header { display: flex !important; }
          .admin-account-search {
            top: 60px;
            max-width: none;
            margin-bottom: 20px;
          }
          .admin-account-search__bar {
            display: block;
            padding: 10px;
            border-radius: 15px;
          }
          .admin-account-search__intro {
            min-width: 0;
            margin-bottom: 8px;
          }
          .admin-account-search__icon {
            width: 32px;
            height: 32px;
          }
          .admin-account-search__hint {
            font-size: 9px;
          }
          .admin-account-search__field input {
            height: 42px;
            font-size: 12px;
          }
          .admin-account-search__open {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
