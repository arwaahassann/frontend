import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { EMPLOYER } from '../../api/endpoints';
import {
  Mail, Phone, MapPin, Briefcase, Calendar,
  FileText, CheckCircle, Clock, ChevronDown, Eye, Download, MessageSquare
} from 'lucide-react';
import ApplicantDetailsModal from '../../components/ApplicantDetailsModal';
import ChatModal from '../../components/ChatModal';
import ProfileImage from '../../components/ProfileImage';
import { exportApplicantsToCSV } from '../../utils/exportCsv';

const statusConfig = {
  pending: { label: 'قيد الانتظار', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  reviewing: { label: 'قيد المراجعة', bg: '#fff7ed', color: '#ea580c', border: '#ffedd5' },
  interview: { label: 'دعوة مقابلة', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  accepted: { label: 'تم القبول', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  rejected: { label: 'تم الاعتذار', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const AllApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [chatApp, setChatApp] = useState(null);

  const fetchApplicants = async () => {
    try {
      const res = await api.get(EMPLOYER.ALL_APPLICANTS);
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af', fontFamily: 'Cairo, sans-serif' }}>
        جاري تحميل المتقدمين...
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ maxWidth: '980px', margin: '0 auto', padding: '24px 20px', fontFamily: 'Cairo, sans-serif' }}>
      <div style={{ marginBottom: '28px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#1D3557', margin: 0 }}>
            جميع المتقدمين 👥
          </h2>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            استعرض كافة بيانات المتقدمين، السير الذاتية (CV)، واتخذ قرارات القبول والرفض والمقابلات | الإجمالي: <strong style={{ color: '#00D2B4' }}>{applications.length}</strong>
          </p>
        </div>

        {applications.length > 0 && (
          <button
            type="button"
            onClick={() => exportApplicantsToCSV(applications, 'جميع_المتقدمين')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              border: '1.5px solid #10b981',
              background: '#ecfdf5',
              color: '#047857',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'Cairo, sans-serif',
              transition: 'all 0.15s',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
            }}
          >
            <Download size={16} /> تصدير المتقدمين Excel 📥
          </button>
        )}
      </div>

      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <p style={{ color: '#64748b', fontSize: '15px', fontWeight: 700, margin: 0 }}>لا يوجد متقدمين حتى الآن على وظائفك المعلنة</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {applications.map((app) => {
            const currentConfig = statusConfig[app.status] || statusConfig.pending;
            const applicantName = app.name || app.user?.name || 'متقدم';
            const applicantEmail = app.email || app.user?.email;
            const applicantPhone = app.phone || app.user?.phone;

            return (
              <div
                key={app._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1.5px solid #e2e8f0',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                    <ProfileImage
                      src={app.user?.avatar || app.avatar}
                      alt={applicantName}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #00D2B4',
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1D3557' }}>
                          {applicantName}
                        </h3>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 800,
                            background: currentConfig.bg,
                            color: currentConfig.color,
                            border: `1px solid ${currentConfig.border}`,
                          }}
                        >
                          {currentConfig.label}
                        </span>
                        {app.decisionEmailSent === true && (
                          <span style={{ padding: '4px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                            تم إرسال البريد
                          </span>
                        )}
                        {app.status !== 'pending' && app.decisionEmailSent === false && (
                          <span style={{ padding: '4px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                            البريد لم يُرسل
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#00D2B4', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Briefcase size={13} /> الوظيفة: {app.job?.title || 'وظيفة معلنة'} {app.job?.company ? `(${app.job.company})` : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', margin: '12px 0', fontSize: '13px', color: '#475569' }}>
                    {applicantEmail && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={14} color="#94a3b8" /> {applicantEmail}
                      </span>
                    )}
                    {applicantPhone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} color="#94a3b8" /> {applicantPhone}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} color="#94a3b8" /> {app.location || app.user?.location || 'غير محدد'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} color="#94a3b8" /> {new Date(app.createdAt || Date.now()).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setSelectedApp(app)} style={{ border: '1px solid #00bfa6', background: '#f0fdfa', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 800, fontFamily: 'Cairo, sans-serif', boxShadow: '0 2px 8px rgba(0, 191, 166, 0.15)' }}>
                    <Eye size={15} /> التفاصيل واتخاذ قرار
                  </button>
                  <button type="button" onClick={() => setChatApp(app)} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
                    <MessageSquare size={15} /> مراسلة
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedApp && (
        <ApplicantDetailsModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusUpdated={(appId, newStatus, deliveryStatus) => {
            setApplications((prev) => prev.map((app) => (
              app._id === appId
                ? {
                    ...app,
                    status: newStatus,
                    decisionEmailSent: deliveryStatus.emailSent,
                    decisionNotificationSent: deliveryStatus.notificationSent,
                  }
                : app
            )));
            setSelectedApp((prev) => prev?._id === appId
              ? {
                  ...prev,
                  status: newStatus,
                  decisionEmailSent: deliveryStatus.emailSent,
                  decisionNotificationSent: deliveryStatus.notificationSent,
                }
              : prev);
          }}
        />
      )}

      {chatApp && (
        <ChatModal app={chatApp} onClose={() => setChatApp(null)} />
      )}
    </div>
  );
};

export default AllApplicants;
