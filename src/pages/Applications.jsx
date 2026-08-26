import { useEffect, useState } from 'react';
import { MapPin, Calendar, ChevronDown, ChevronUp, Briefcase, ChevronRight, ChevronLeft, MessageSquare } from 'lucide-react';
import api from '../api/axiosConfig';
import { SEEKER } from '../api/endpoints';
import ChatModal from '../components/ChatModal';

const APPS_PER_PAGE = 6;

const statusMap = {
  pending: { label: 'قيد الانتظار', bg: '#fff7ed', color: '#f97316' },
  reviewing: { label: 'قيد المراجعة', bg: '#fef3c7', color: '#d97706' },
  interview: { label: 'مقابلة 📅', bg: '#eff6ff', color: '#2563eb' },
  accepted: { label: 'مقبول 🎉', bg: '#f0fdf4', color: '#16a34a' },
  rejected: { label: 'مرفوض', bg: '#fef2f2', color: '#dc2626' },
};

const tabs = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'قيد الانتظار' },
  { key: 'reviewing', label: 'قيد المراجعة' },
  { key: 'interview', label: 'مقابلة' },
  { key: 'accepted', label: 'مقبول' },
  { key: 'rejected', label: 'مرفوض' },
];

const ApplicationCard = ({ app, onOpenChat }) => {
  const [expanded, setExpanded] = useState(false);
  const status = statusMap[app.status] || statusMap.pending;
  const job = app.job;

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '18px 22px',
          gap: '16px',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Company Logo */}
        {job?.logoUrl ? (
          <img
            src={job.logoUrl}
            alt={job?.company}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              objectFit: 'cover',
              border: '1.5px solid #e2e8f0',
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1D3557, #00D2B4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            {job?.company?.charAt(0) || 'ش'}
          </div>
        )}

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '15px', color: '#1D3557', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {job?.title || 'وظيفة'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            {job?.company || 'شركة'}
          </p>
        </div>

        {/* Status + Chat + Date + Expand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span
            style={{
              background: status.bg,
              color: status.color,
              padding: '5px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            {status.label}
          </span>

          {/* زر المحادثة المباشرة — ظاهر دايماً في الصف */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenChat(app); }}
            title="محادثة مباشرة مع الشركة"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: '1.5px solid #bfdbfe',
              background: '#eff6ff',
              color: '#2563eb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
          >
            <MessageSquare size={16} />
          </button>

          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            {formatDate(app.createdAt || app.appliedAt)}
          </span>
          {expanded ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div
          style={{
            borderTop: '1px solid #f1f5f9',
            padding: '18px 22px',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {job?.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px' }}>
                <MapPin size={14} color="#00D2B4" />
                <span>{job.location}</span>
              </div>
            )}
            {job?.jobType && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px' }}>
                <Briefcase size={14} color="#00D2B4" />
                <span>{job.jobType}</span>
              </div>
            )}
            {app.appliedAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px' }}>
                <Calendar size={14} color="#00D2B4" />
                <span>تاريخ التقديم: {formatDate(app.appliedAt)}</span>
              </div>
            )}
          </div>

          {/* تفاصيل المقابلة إن وجدت */}
          {app.status === 'interview' && app.interviewDetails?.date && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: '#1e40af' }}>
              <strong>📅 موعد المقابلة: </strong> {app.interviewDetails.date} {app.interviewDetails.time ? `الساعة ${app.interviewDetails.time}` : ''}
              {app.interviewDetails.location ? ` — المكان/الرابط: ${app.interviewDetails.location}` : ''}
            </div>
          )}

          {app.notes && (
            <div
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 14px',
              }}
            >
              <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
                <strong style={{ color: '#1D3557' }}>ملاحظات التقديم: </strong>{app.notes}
              </p>
            </div>
          )}

          {/* زر فتح المحادثة المباشرة مع صاحب العمل */}
          <div style={{ marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => onOpenChat(app)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '10px',
                border: '1.5px solid #2563eb',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif',
                transition: 'all 0.15s',
              }}
            >
              <MessageSquare size={15} /> محادثة مباشرة مع مسؤولي التوظيف 💬
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [chatApp, setChatApp] = useState(null);

  useEffect(() => {
    setLoading(true);
    const url = activeTab === 'all'
      ? SEEKER.MY_APPLICATIONS
      : `${SEEKER.MY_APPLICATIONS}?status=${activeTab}`;

    api.get(url)
      .then((res) => {
        if (res.data?.success) {
          setApplications(res.data.applications || []);
          setCurrentPage(1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  const totalPages = Math.ceil(applications.length / APPS_PER_PAGE);
  const paginatedApps = applications.slice(
    (currentPage - 1) * APPS_PER_PAGE,
    currentPage * APPS_PER_PAGE
  );

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, sans-serif', maxWidth: '900px', margin: '0 auto', paddingBottom: '50px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#1D3557' }}>طلباتي 📋</h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748b' }}>
          تتبع حالة طلباتك ومواعيد المقابلات والتواصل المباشر مع الشركات
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 800,
              fontFamily: 'Cairo, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              background: activeTab === tab.key ? '#1D3557' : '#f1f5f9',
              color: activeTab === tab.key ? '#ffffff' : '#64748b',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
          <p>جاري تحميل الطلبات...</p>
        </div>
      ) : applications.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#9ca3af',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px dashed #e2e8f0',
          }}
        >
          <Briefcase size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#475569' }}>لا توجد طلبات في هذه الفئة</p>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#94a3b8' }}>ابدأ بالبحث عن وظائف والتقدم عليها الآن</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {paginatedApps.map((app) => (
            <ApplicationCard key={app._id} app={app} onOpenChat={(targetApp) => setChatApp(targetApp)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: currentPage === 1 ? 0.4 : 1,
              fontFamily: 'Cairo, sans-serif',
              fontSize: '13px',
              fontWeight: 800,
              color: '#334155',
            }}
          >
            <ChevronRight size={16} /> السابق
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                border: currentPage === pageNumber ? '2px solid #00D2B4' : '1.5px solid #cbd5e1',
                fontFamily: 'Cairo, sans-serif',
                background: currentPage === pageNumber ? '#00D2B4' : '#ffffff',
                color: currentPage === pageNumber ? '#ffffff' : '#334155',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '14px',
                boxShadow: currentPage === pageNumber ? '0 4px 12px rgba(0, 210, 180, 0.35)' : 'none',
              }}
            >
              {pageNumber}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: currentPage === totalPages ? 0.4 : 1,
              fontFamily: 'Cairo, sans-serif',
              fontSize: '13px',
              fontWeight: 800,
              color: '#334155',
            }}
          >
            التالي <ChevronLeft size={16} />
          </button>
        </div>
      )}

      {/* Chat Modal للباحث */}
      {chatApp && (
        <ChatModal
          applicationId={chatApp._id}
          jobTitle={chatApp.job?.title || 'الوظيفة'}
          otherPartyName={chatApp.job?.company || 'مسؤول التوظيف'}
          onClose={() => setChatApp(null)}
        />
      )}
    </div>
  );
};

export default Applications;
