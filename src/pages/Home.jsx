import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase, Users, Calendar, CheckCircle, Clock,
  MessageSquare, XCircle, TrendingUp, Search, Eye, PlusCircle, Building
} from 'lucide-react';
import api from '../api/axiosConfig';
import { PUBLIC_JOBS, SEEKER, EMPLOYER } from '../api/endpoints';
import ApplicantDetailsModal from '../components/ApplicantDetailsModal';
import ChatModal from '../components/ChatModal';

// ======================================================
// Job Seeker Dashboard (Home)
// ======================================================
const SeekerHome = ({ user, stats, loading }) => {
  const navigate = useNavigate();

  const StatCard = ({ label, value, color, icon: Icon }) => (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '22px 18px',
        textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={22} color={color} />
      </div>
      <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#1D3557' }}>{value}</p>
    </div>
  );

  const seekerLinks = [
    { label: 'جميع الوظائف', path: '/jobs', icon: Briefcase, color: '#00D2B4' },
    { label: 'طلباتي', path: '/applications', icon: MessageSquare, color: '#3b82f6' },
    { label: 'المفضلة', path: '/favorites', icon: TrendingUp, color: '#f59e0b' },
    { label: 'الإشعارات', path: '/notifications', icon: Clock, color: '#8b5cf6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* بنر ترحيبي */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1D3557 0%, #2a4d7d 100%)',
          borderRadius: '18px',
          padding: '28px 24px',
          color: '#ffffff',
          boxShadow: '0 4px 16px rgba(29, 53, 87, 0.12)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>
          مرحباً بك، {user?.name || 'أحمد'} 👋
        </h1>
        <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '13px' }}>
          منصة وظيفة العمر - ابحث عن وظيفة أحلامك وتتبع طلباتك وتواصل مع الشركات بكل سهولة وسرعة
        </p>
      </div>

      {/* الإحصائيات */}
      {loading ? (
        <p style={{ color: '#9ca3af', textAlign: 'center' }}>جاري تحميل إحصائياتك...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
          <StatCard label="إجمالي طلباتي" value={stats.applications} color="#00D2B4" icon={TrendingUp} />
          <StatCard label="مقبول" value={stats.accepted} color="#22c55e" icon={CheckCircle} />
          <StatCard label="قيد المراجعة" value={stats.reviewing} color="#f59e0b" icon={Clock} />
          <StatCard label="مقابلة" value={stats.interviews} color="#3b82f6" icon={MessageSquare} />
          <StatCard label="مرفوض" value={stats.rejected} color="#ef4444" icon={XCircle} />
        </div>
      )}

      {/* وصول سريع */}
      <div>
        <h2 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#1D3557' }}>
          وصول سريع ⚡
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {seekerLinks.map(({ label, path, icon: Icon, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '18px 14px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', fontFamily: 'Cairo, sans-serif' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ======================================================
// Employer Dashboard (matching Figma media_1786229990258.png 100%)
// ======================================================
const EmployerHome = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ interviews: 0, applicants: 0, activeJobs: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [chatApp, setChatApp] = useState(null);

  const fetchEmployerData = () => {
    // 1. جلب عدد الوظائف النشطة
    api.get(EMPLOYER.MY_JOBS)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.jobs)) {
          const active = res.data.jobs.filter((j) => j.status === 'active' || !j.status).length;
          setStats((prev) => ({ ...prev, activeJobs: active }));
        }
      })
      .catch(() => {});

    // 2. جلب كل المتقدمين
    api.get(EMPLOYER.ALL_APPLICANTS)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.applications)) {
          const apps = res.data.applications;
          const interviews = apps.filter((a) => a.status === 'interview').length;
          setStats((prev) => ({
            ...prev,
            applicants: apps.length,
            interviews,
          }));
          setRecentApps(apps.slice(0, 8));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
      case 'active':
        return { label: 'تم القبول', bg: '#dcfce7', color: '#16a34a' };
      case 'interview':
        return { label: 'مقابلة', bg: '#dbeafe', color: '#2563eb' };
      case 'reviewing':
        return { label: 'قيد المراجعة', bg: '#fef3c7', color: '#d97706' };
      case 'rejected':
      case 'closed':
        return { label: 'مرفوض', bg: '#fee2e2', color: '#ef4444' };
      default:
        return { label: 'قيد الانتظار', bg: '#f1f5f9', color: '#475569' };
    }
  };

  const statCardStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '22px 18px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  };

  const employerQuickLinks = [
    { label: 'نشر وظيفة جديدة', path: '/manage/new', icon: PlusCircle, color: '#00D2B4' },
    { label: 'إدارة وظائفي', path: '/manage', icon: Briefcase, color: '#3b82f6' },
    { label: 'جميع المتقدمين', path: '/manage/applicants', icon: Users, color: '#10b981' },
    { label: 'الرسائل والإشعارات', path: '/notifications', icon: MessageSquare, color: '#8b5cf6' },
  ];

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Cairo, sans-serif' }}>
      
      {/* 1. ترحيب مطابق للفيجما */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 900,
              color: '#1D3557',
            }}
          >
            أهلاً بك، {user?.name || user?.company || 'المدير'}! إليك ملخص اليوم 🏢
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            لوحة الإدارة والتوظيف — متابعة الوظائف النشطة والمتقدمين والمقابلات الفورية
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/manage/new')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00D2B4, #00b09b)',
            color: '#ffffff',
            fontSize: '13.5px',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Cairo, sans-serif',
            boxShadow: '0 4px 14px rgba(0, 210, 180, 0.35)',
            transition: 'all 0.15s',
          }}
        >
          <PlusCircle size={17} /> نشر وظيفة جديدة 🚀
        </button>
      </div>

      {/* 2. بطاقات الإحصائيات الثلاث المطابقة للفيجما 100% */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        {/* كارت 1: وظائف متاحة جديدة */}
        <div style={statCardStyle}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: '#e6fffa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2px',
            }}
          >
            <Briefcase size={24} color="#00D2B4" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
            الوظائف النشطة المعلنة
          </span>
          <span style={{ fontSize: '32px', fontWeight: 900, color: '#1D3557', lineHeight: 1 }}>
            {stats.activeJobs}
          </span>
        </div>

        {/* كارت 2: إجمالي المتقدمين */}
        <div style={statCardStyle}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2px',
            }}
          >
            <Users size={24} color="#3b82f6" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
            إجمالي المتقدمين
          </span>
          <span style={{ fontSize: '32px', fontWeight: 900, color: '#1D3557', lineHeight: 1 }}>
            {stats.applicants}
          </span>
        </div>

        {/* كارت 3: إجمالي المقابلات */}
        <div style={statCardStyle}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2px',
            }}
          >
            <Calendar size={24} color="#16a34a" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
            إجمالي المقابلات المحددة
          </span>
          <span style={{ fontSize: '32px', fontWeight: 900, color: '#1D3557', lineHeight: 1 }}>
            {stats.interviews}
          </span>
        </div>

      </div>

      {/* 3. وصول سريع للناشر */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {employerQuickLinks.map(({ label, path, icon: Icon, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px 14px',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color={color} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', fontFamily: 'Cairo, sans-serif' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* 4. جدول أحدث الطلبات الحالية المطابق للفيجما 100% */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {/* عنوان الجدول */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 900,
              color: '#1D3557',
            }}
          >
            أحدث الطلبات الحالية
          </h2>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            {recentApps.length} طلبات
          </span>
        </div>

        {/* محتوى الجدول */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            جاري تحميل الطلبات...
          </div>
        ) : recentApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>لا توجد طلبات تقديم حتى الآن</p>
            <button
              onClick={() => navigate('/manage/new')}
              style={{
                marginTop: '12px',
                padding: '9px 18px',
                background: '#00D2B4',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif',
              }}
            >
              نشر وظيفة جديدة الآن
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', fontSize: '12.5px', fontWeight: 800, color: '#64748b' }}>اسم المتقدم</th>
                  <th style={{ padding: '12px 18px', fontSize: '12.5px', fontWeight: 800, color: '#64748b' }}>المحافظة / العنوان</th>
                  <th style={{ padding: '12px 18px', fontSize: '12.5px', fontWeight: 800, color: '#64748b' }}>الوظيفة</th>
                  <th style={{ padding: '12px 18px', fontSize: '12.5px', fontWeight: 800, color: '#64748b', textAlign: 'center' }}>الحالة</th>
                  <th style={{ padding: '12px 18px', fontSize: '12.5px', fontWeight: 800, color: '#64748b', textAlign: 'center' }}>الإجراء والمحادثة</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app, index) => {
                  const badge = getStatusBadge(app.status);
                  const applicantName = app.name || app.user?.name || 'متقدم';
                  const location = app.location || app.user?.location || 'غير محدد';
                  const jobTitle = app.job?.title || 'وظيفة معلنة';
                  const applicantAvatar = app.user?.avatar || app.avatar;

                  return (
                    <tr
                      key={app._id || index}
                      style={{
                        borderBottom: index === recentApps.length - 1 ? 'none' : '1px solid #f1f5f9',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    >
                      {/* اسم وصورة المتقدم */}
                      <td style={{ padding: '14px 18px', fontSize: '13.5px', fontWeight: 800, color: '#1E293B' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {applicantAvatar ? (
                            <img
                              src={applicantAvatar}
                              alt={applicantName}
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #00D2B4' }}
                            />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1D3557', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>
                              {applicantName.charAt(0)}
                            </div>
                          )}
                          <span>{applicantName}</span>
                        </div>
                      </td>

                      {/* المحافظة */}
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                        {location}
                      </td>

                      {/* الوظيفة */}
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#334155', fontWeight: 700 }}>
                        {jobTitle}
                      </td>

                      {/* الحالة */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 14px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 800,
                            background: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* الإجراءات: عرض الملف والمحادثة */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedApp(app)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #00D2B4',
                              background: '#f0fdfa',
                              color: '#00A890',
                              fontSize: '12px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              fontFamily: 'Cairo, sans-serif',
                            }}
                          >
                            <Eye size={14} /> الملف والقرار
                          </button>

                          <button
                            type="button"
                            onClick={() => setChatApp(app)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #bfdbfe',
                              background: '#eff6ff',
                              color: '#2563eb',
                              fontSize: '12px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              fontFamily: 'Cairo, sans-serif',
                            }}
                          >
                            <MessageSquare size={13} /> محادثة 💬
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal عرض بيانات المتقدم الكاملة */}
      {selectedApp && (
        <ApplicantDetailsModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusUpdated={(appId, newStatus) => {
            setRecentApps((prev) =>
              prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
            );
            fetchEmployerData();
          }}
        />
      )}

      {/* 💬 Modal المحادثة المباشرة من الداشبورد */}
      {chatApp && (
        <ChatModal
          applicationId={chatApp._id}
          jobTitle={chatApp.job?.title || 'الوظيفة'}
          otherPartyName={chatApp.name || chatApp.user?.name || 'المرشح'}
          otherPartyAvatar={chatApp.user?.avatar || chatApp.avatar}
          onClose={() => setChatApp(null)}
        />
      )}

    </div>
  );
};

// ======================================================
// Main Home Router
// ======================================================
const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ applications: 0, accepted: 0, reviewing: 0, interviews: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'employer') {
      api.get(SEEKER.APPLICATION_STATS)
        .then((res) => {
          if (res.data.success && res.data.stats) {
            setStats(res.data.stats);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, sans-serif', paddingBottom: '30px' }}>
      {user?.role === 'employer' ? (
        <EmployerHome user={user} />
      ) : (
        <SeekerHome user={user} stats={stats} loading={loading} />
      )}
    </div>
  );
};

export default Home;
