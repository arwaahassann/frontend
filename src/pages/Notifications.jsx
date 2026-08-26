import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
  Bell, CheckCheck, X, Calendar, Clock, MapPin, Video,
  Briefcase, CheckCircle, XCircle, ExternalLink, Sparkles,
  ChevronRight, Trash2, CheckSquare, Square, MessageSquare, User, Eye
} from 'lucide-react';
import ChatModal from '../components/ChatModal';

// ========================================================
// 🌟 مودال تفاصيل الإشعار الموسع (Rich Notification Modal)
// ========================================================
const NotificationDetailModal = ({ notification, isEmployer, onClose, onDelete, onOpenChat }) => {
  const navigate = useNavigate();
  if (!notification) return null;

  const dateStr = notification.createdAt
    ? new Date(notification.createdAt).toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const { interviewDetails, decisionMessage, job } = notification;
  const isInterview = notification.type === 'interview';
  const isAccepted = notification.type === 'accepted';
  const isRejected = notification.type === 'rejected';
  const isMessage = notification.type === 'message';
  const isPendingApp = notification.type === 'pending';
  const appId = typeof notification.application === 'object' ? notification.application?._id : notification.application;

  // إعدادات الشارة والأيقونة
  let label = 'إشعار من المنصة 🔔';
  let badgeBg = '#f0fdfa';
  let badgeColor = '#00D2B4';
  let Icon = Bell;

  if (isMessage) {
    label = isEmployer ? 'رسالة من متقدم 💬' : 'رسالة من الشركة 💬';
    badgeBg = '#eff6ff';
    badgeColor = '#2563eb';
    Icon = MessageSquare;
  } else if (isPendingApp) {
    label = isEmployer ? 'طلب تقديم جديد 👤' : 'طلب قيد الانتظار 📋';
    badgeBg = '#f0fdfa';
    badgeColor = '#0f766e';
    Icon = User;
  } else if (isInterview) {
    label = 'دعوة مقابلة 📅';
    badgeBg = '#eff6ff';
    badgeColor = '#2563eb';
    Icon = Calendar;
  } else if (isAccepted) {
    label = 'تم القبول 🎉';
    badgeBg = '#f0fdf4';
    badgeColor = '#16a34a';
    Icon = CheckCircle;
  } else if (isRejected) {
    label = 'تحديث بشأن الطلب';
    badgeBg = '#fef2f2';
    badgeColor = '#dc2626';
    Icon = XCircle;
  }

  const googleCalendarUrl = isInterview && interviewDetails?.date
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`مقابلة عمل: ${job?.title || 'وظيفة'} لدى ${job?.company || 'الشركة'}`)}&dates=${interviewDetails.date.replace(/-/g, '')}T${(interviewDetails.time || '10:00').replace(':', '')}00Z/${interviewDetails.date.replace(/-/g, '')}T${(interviewDetails.time || '11:00').replace(':', '')}00Z&details=${encodeURIComponent(notification.message)}&location=${encodeURIComponent(interviewDetails.location || '')}`
    : null;

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 15, 23, 0.8)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: 'Cairo, sans-serif',
      }}
    >
      <div
        className="notification-modal-card"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: badgeBg,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#ffffff',
                color: badgeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <Icon size={20} color={badgeColor} />
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: badgeColor, background: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                {label}
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 900, color: '#1D3557' }}>
                {notification.title || 'تفاصيل الإشعار'}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onDelete(notification._id)}
              title="حذف هذا الإشعار"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
              }}
            >
              <Trash2 size={15} />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
            <Clock size={13} /> وصلك في: {dateStr}
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px 18px',
              fontSize: '13.5px',
              lineHeight: '1.7',
              color: '#1E293B',
              fontWeight: 600,
            }}
          >
            {decisionMessage || notification.message}
          </div>

          {/* 🌟 زر مخصص لصاحب العمل عند وصول متقدم جديد */}
          {isEmployer && (isPendingApp || appId) && (
            <div
              style={{
                background: 'linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%)',
                border: '1.5px solid #99f6e4',
                borderRadius: '16px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#0f766e" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#0f766e' }}>
                  إجراء بخصوص طلب التقديم 👤
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                يمكنك الاطلاع على السيرة الذاتية (CV)، بيانات الاتصال، واتخاذ قرار القبول أو دعوة المقابلة فوراً:
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/manage/applicants');
                  }}
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    background: '#00D2B4',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(0, 210, 180, 0.35)',
                    fontFamily: 'Cairo, sans-serif',
                  }}
                >
                  <Eye size={16} /> عرض ملفات المتقدمين
                </button>

                {appId && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenChat({
                        applicationId: appId,
                        jobTitle: job?.title || 'الوظيفة',
                        otherPartyName: notification.title?.replace('رسالة من ', '') || 'المرشح',
                      });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1.5px solid #bfdbfe',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif',
                    }}
                  >
                    <MessageSquare size={15} /> محادثة المرشح 💬
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 🌟 كارت المحادثة والرد السريع للباحث أو صاحب العمل */}
          {isMessage && appId && (
            <div
              style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdfa 100%)',
                border: '1.5px solid #93c5fd',
                borderRadius: '16px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="#2563eb" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#1e40af' }}>
                  {isEmployer ? 'محادثة مباشرة مع المرشح 💬' : `محادثة مباشرة مع ${job?.company || 'الشركة'} 💬`}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                يمكنك التحدث مباشرة والرد الفوري للتنسيق المباشر:
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChat({
                    applicationId: appId,
                    jobTitle: job?.title || 'الوظيفة',
                    otherPartyName: isEmployer ? 'المرشح' : (job?.company || 'الشركة'),
                  });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00D2B4 0%, #00b09b 100%)',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(0, 210, 180, 0.4)',
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                <MessageSquare size={16} /> فتح المحادثة والرد الآن 💬
              </button>
            </div>
          )}

          {/* تفاصيل المقابلة (تظهر فقط للباحث) */}
          {!isEmployer && isInterview && (
            <div
              style={{
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '16px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> موعد وتفاصيل المقابلة:
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '10px 12px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>📅 التاريخ</span>
                  <strong style={{ fontSize: '13px', color: '#1e3a8a' }}>{interviewDetails?.date || 'قريباً'}</strong>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '10px 12px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>⏰ التوقيت</span>
                  <strong style={{ fontSize: '13px', color: '#1e3a8a' }}>{interviewDetails?.time ? `الساعة ${interviewDetails.time}` : 'سيحدد لاحقاً'}</strong>
                </div>
              </div>

              {/* المقر أو الرابط */}
              <div style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {interviewDetails?.format === 'online' ? <Video size={13} color="#2563eb" /> : <MapPin size={13} color="#2563eb" />}
                  {interviewDetails?.format === 'online' ? 'رابط المقابلة أونلاين' : 'مقر ومكان المقابلة'}
                </span>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1E293B', wordBreak: 'break-all' }}>
                  {interviewDetails?.location || (job?.location ? `مقر الشركة في ${job.location}` : 'مقر الشركة الرئيسي')}
                </p>
                {interviewDetails?.location && interviewDetails.location.startsWith('http') && (
                  <a href={interviewDetails.location} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: '11.5px', fontWeight: 800, marginTop: '2px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    الانتقال لرابط المقابلة <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {googleCalendarUrl && (
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    background: '#1D3557',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Calendar size={14} /> إضافة إلى تقويم Google
                </a>
              )}
            </div>
          )}

          {/* حالة القبول (تظهر فقط للباحث) */}
          {!isEmployer && isAccepted && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '13.5px', fontWeight: 900, color: '#16a34a' }}>🎉 تهانينا! الخطوات القادمة:</h4>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#14532d', lineHeight: 1.6 }}>
                سيتواصل معك فريق الموارد البشرية بالشركة لإتمام إجراءات التعاقد واستلام العمل.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              background: '#1D3557',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 🌟 الصفحة الرئيسية للإشعارات المخصصة والمنطقية للدورين
// ========================================================
const Notifications = () => {
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);

  const fetchNotifications = () => {
    api.get('/api/notifications')
      .then((res) => setNotifications(res.data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleOpenNotification = async (notification) => {
    setSelectedNotification(notification);

    if (!notification.isRead) {
      try {
        await api.put(`/api/notifications/${notification._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  // قراءة كل الإشعارات بضغطة زر
  const handleMarkAll = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  // حذف إشعار منفرد
  const handleDeleteSingle = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الإشعار؟')) return;

    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (selectedNotification?._id === id) {
        setSelectedNotification(null);
      }
    } catch (err) {
      alert('حدث خطأ أثناء حذف الإشعار');
    }
  };

  // تحديد / إلغاء تحديد إشعار
  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // تحديد الكل / إلغاء تحديد الكل
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n._id)));
    }
  };

  // حذف الإشعارات المحددة جماعياً (Bulk Delete)
  const handleDeleteSelected = async () => {
    const idsArray = Array.from(selectedIds);
    if (idsArray.length === 0) return;

    if (!window.confirm(`هل أنت متأكد من حذف ${idsArray.length} إشعار محدد؟`)) return;

    setDeleting(true);
    try {
      await api.post('/api/notifications/bulk-delete', { ids: idsArray });
      setNotifications((prev) => prev.filter((n) => !selectedIds.has(n._id)));
      setSelectedIds(new Set());
      if (selectedNotification && selectedIds.has(selectedNotification._id)) {
        setSelectedNotification(null);
      }
    } catch (err) {
      alert('حدث خطأ أثناء حذف الإشعارات المحددة');
    } finally {
      setDeleting(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const messagesCount = notifications.filter((n) => n.type === 'message').length;
  const pendingAppsCount = notifications.filter((n) => n.type === 'pending').length;
  const interviewCount = notifications.filter((n) => n.type === 'interview').length;
  const acceptedCount = notifications.filter((n) => n.type === 'accepted').length;

  // تبويبات منطقية مخصصة لصاحب العمل مقابل الباحث
  const tabs = isEmployer
    ? [
        { id: 'all', label: 'كل الإشعارات', count: notifications.length },
        { id: 'unread', label: 'غير المقروءة', count: unreadCount, color: '#00D2B4' },
        { id: 'pending', label: 'متقدمين جدد 👤', count: pendingAppsCount, color: '#0f766e' },
        { id: 'message', label: 'رسائل المحادثات 💬', count: messagesCount, color: '#2563eb' },
      ]
    : [
        { id: 'all', label: 'كل الإشعارات', count: notifications.length },
        { id: 'unread', label: 'غير المقروءة', count: unreadCount, color: '#00D2B4' },
        { id: 'message', label: 'الرسائل والمحادثات 💬', count: messagesCount, color: '#2563eb' },
        { id: 'interview', label: 'دعوات المقابلة 📅', count: interviewCount, color: '#2563eb' },
        { id: 'accepted', label: 'تم القبول 🎉', count: acceptedCount, color: '#16a34a' },
      ];

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === 'unread') return !n.isRead;
    if (filterTab === 'pending') return n.type === 'pending';
    if (filterTab === 'message') return n.type === 'message';
    if (filterTab === 'interview') return n.type === 'interview';
    if (filterTab === 'accepted') return n.type === 'accepted';
    return true;
  });

  const isAllSelected = filteredNotifications.length > 0 && selectedIds.size === filteredNotifications.length;

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, sans-serif', paddingBottom: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#1D3557' }}>
              الاشعارات والتنبيهات 🔔
            </h1>
            {unreadCount > 0 && (
              <span style={{ background: '#00D2B4', color: '#ffffff', borderRadius: '999px', padding: '2px 10px', fontSize: '11px', fontWeight: 800 }}>
                {unreadCount} جديد
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            {isEmployer
              ? 'متابعة طلبات التقديم الجديدة ورسائل المحادثات من المتقدمين لحظة بلحظة'
              : 'متابعة حالة طلباتك ورسائل المحادثة ومواعيد المقابلات والتحديثات أولاً بأول'}
          </p>
        </div>

        {/* أزرار الإجراءات السريعة (قراءة الكل / حذف المحدد) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={deleting}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '8px 14px',
                cursor: deleting ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 800,
                fontFamily: 'Cairo, sans-serif',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(220, 38, 38, 0.1)',
                transition: 'all 0.15s',
              }}
            >
              <Trash2 size={15} />
              حذف المحدد ({selectedIds.size})
            </button>
          )}

          <button
            type="button"
            onClick={unreadCount > 0 ? handleMarkAll : undefined}
            disabled={unreadCount === 0}
            style={{
              background: unreadCount > 0 ? '#ffffff' : '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '8px 16px',
              cursor: unreadCount > 0 ? 'pointer' : 'default',
              fontSize: '12px',
              fontWeight: 800,
              fontFamily: 'Cairo, sans-serif',
              color: unreadCount > 0 ? '#475569' : '#b0bec5',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: unreadCount > 0 ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              opacity: unreadCount > 0 ? 1 : 0.55,
              transition: 'all 0.15s',
            }}
          >
            <CheckCheck size={16} color={unreadCount > 0 ? '#00D2B4' : '#b0bec5'} />
            {unreadCount > 0 ? `تعيين الكل كمقروء (${unreadCount})` : 'تم قراءة كل الإشعارات'}
          </button>
        </div>
      </div>

      {/* 🌟 شريط التبويبات المنطقي */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tabs.map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: isActive ? '#00D2B4' : '#e2e8f0',
                  background: isActive ? '#00D2B4' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: isActive ? '#ffffff' : tab.color || '#64748b',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 900,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* زر تحديد كل المعروض */}
        {filteredNotifications.length > 0 && (
          <button
            type="button"
            onClick={handleToggleSelectAll}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 800,
              fontFamily: 'Cairo, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isAllSelected ? <CheckSquare size={16} color="#00D2B4" /> : <Square size={16} />}
            {isAllSelected ? 'إلغاء تحديد الكل' : 'تحديد كل المعروض'}
          </button>
        )}
      </div>

      {/* قائمة الإشعارات */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '50px', color: '#9ca3af', margin: 0 }}>جاري تحميل الإشعارات...</p>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Bell size={24} color="#94a3b8" />
            </div>
            <p style={{ margin: 0, color: '#475569', fontWeight: 800, fontSize: '14.5px' }}>
              {filterTab === 'unread'
                ? 'رائع! لا توجد إشعارات غير مقروءة'
                : filterTab === 'pending'
                ? 'لا توجد طلبات تقديم جديدة حالياً'
                : filterTab === 'message'
                ? 'لا توجد رسائل محادثة جديدة'
                : filterTab === 'interview'
                ? 'لا توجد دعوات مقابلات حالياً'
                : filterTab === 'accepted'
                ? 'لا توجد إشعارات قبول حالياً'
                : 'لا توجد إشعارات'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n, idx) => {
            const isChecked = selectedIds.has(n._id);
            const timeAgo = n.createdAt
              ? new Date(n.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
              : '';
            const appId = typeof n.application === 'object' ? n.application?._id : n.application;

            let badgeLabel = 'إشعار 🔔';
            let badgeBg = '#f0fdfa';
            let badgeColor = '#00D2B4';
            let ItemIcon = Bell;

            if (n.type === 'message') {
              badgeLabel = isEmployer ? 'رسالة من متقدم 💬' : 'رسالة من الشركة 💬';
              badgeBg = '#eff6ff';
              badgeColor = '#2563eb';
              ItemIcon = MessageSquare;
            } else if (n.type === 'pending') {
              badgeLabel = isEmployer ? 'متقدم جديد 👤' : 'طلب جديد 📋';
              badgeBg = '#f0fdfa';
              badgeColor = '#0f766e';
              ItemIcon = User;
            } else if (n.type === 'interview') {
              badgeLabel = 'دعوة مقابلة 📅';
              badgeBg = '#eff6ff';
              badgeColor = '#2563eb';
              ItemIcon = Calendar;
            } else if (n.type === 'accepted') {
              badgeLabel = 'تم القبول 🎉';
              badgeBg = '#f0fdf4';
              badgeColor = '#16a34a';
              ItemIcon = CheckCircle;
            } else if (n.type === 'rejected') {
              badgeLabel = 'تحديث بشأن الطلب';
              badgeBg = '#fef2f2';
              badgeColor = '#dc2626';
              ItemIcon = XCircle;
            }

            return (
              <div
                key={n._id}
                onClick={() => handleOpenNotification(n)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderBottom: idx === filteredNotifications.length - 1 ? 'none' : '1px solid #f1f5f9',
                  cursor: 'pointer',
                  background: isChecked ? 'rgba(0, 210, 180, 0.08)' : n.isRead ? '#ffffff' : '#f0fdfa',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isChecked ? 'rgba(0, 210, 180, 0.12)' : n.isRead ? '#fafafa' : '#e6fffa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = isChecked ? 'rgba(0, 210, 180, 0.08)' : n.isRead ? '#ffffff' : '#f0fdfa')}
              >
                {/* Checkbox لتحديد الإشعار */}
                <button
                  type="button"
                  onClick={(e) => handleToggleSelect(n._id, e)}
                  title="تحديد هذا الإشعار"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: isChecked ? '#00D2B4' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {isChecked ? <CheckSquare size={18} color="#00D2B4" /> : <Square size={18} />}
                </button>

                {/* Icon */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: badgeBg,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ItemIcon size={18} color={badgeColor} />
                </div>

                {/* Text */}
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: badgeColor }}>
                      {badgeLabel}
                    </span>
                    {!n.isRead && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00D2B4', display: 'inline-block' }} />
                    )}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      fontWeight: n.isRead ? 600 : 800,
                      color: n.isRead ? '#475569' : '#1D3557',
                      lineHeight: '1.5',
                    }}
                  >
                    {n.message}
                  </p>
                </div>

                {/* Date & Actions */}
                <div style={{ flexShrink: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{timeAgo}</span>

                  {/* 💬 زر فتح المحادثة السريع والمباشر من نفس الصف */}
                  {(n.type === 'message' || appId) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatInfo({
                          applicationId: appId,
                          jobTitle: n.job?.title || 'الوظيفة',
                          otherPartyName: isEmployer ? 'المرشح' : (n.job?.company || 'الشركة'),
                        });
                      }}
                      title="فتح المحادثة والرد"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        border: '1.5px solid #bfdbfe',
                        color: '#2563eb',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        fontFamily: 'Cairo, sans-serif',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#2563eb';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#eff6ff';
                        e.currentTarget.style.color = '#2563eb';
                      }}
                    >
                      <MessageSquare size={13} /> رد
                    </button>
                  )}

                  {/* زر حذف الإشعار الفردي */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSingle(n._id, e)}
                    title="حذف الإشعار"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>

                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <ChevronRight size={13} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* المودال الموسع للتفاصيل */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          isEmployer={isEmployer}
          onClose={() => setSelectedNotification(null)}
          onDelete={(id) => handleDeleteSingle(id)}
          onOpenChat={(info) => setChatInfo(info)}
        />
      )}

      {/* 💬 مودال المحادثة المباشرة */}
      {chatInfo && (
        <ChatModal
          applicationId={chatInfo.applicationId}
          jobTitle={chatInfo.jobTitle}
          otherPartyName={chatInfo.otherPartyName}
          onClose={() => setChatInfo(null)}
        />
      )}

    </div>
  );
};

export default Notifications;
