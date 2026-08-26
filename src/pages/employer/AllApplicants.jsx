import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { EMPLOYER } from '../../api/endpoints';
import {
  User, Mail, Phone, MapPin, Briefcase, Calendar,
  FileText, CheckCircle, Clock, ChevronDown, Eye, Download, MessageSquare
} from 'lucide-react';
import ApplicantDetailsModal from '../../components/ApplicantDetailsModal';
import ChatModal from '../../components/ChatModal';
import { exportApplicantsToCSV } from '../../utils/exportCsv';

const statusConfig = {
  pending:   { label: 'قيد الانتظار', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  reviewing: { label: 'قيد المراجعة', bg: '#fff7ed', color: '#ea580c', border: '#ffedd5' },
  interview: { label: 'دعوة مقابلة',  bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  accepted:  { label: 'تم القبول',    bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  rejected:  { label: 'تم الاعتذار',  bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const AllApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedApp, setSelectedApp]   = useState(null);
  const [chatApp, setChatApp]           = useState(null);

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
      
      {/* الهيدر مع زر تصدير Excel */}
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
                {/* التفاصيل المعروضة للمتقدم */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                    {app.user?.avatar || app.avatar ? (
                      <img
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
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1D3557', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '20px', flexShrink: 0 }}>
                        {applicantName.charAt(0)}
                      </div>
                    )}
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
                      <Calendar size={14} color="#94a3b8" /> {new Date(app.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>

                  {/* المهارات */}
                  {app.skills && (
                    <div style={{ fontSize: '12px', color: '#334155', marginTop: '6px' }}>
                      <strong>المهارات: </strong>
                      <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                        {app.skills}
                      </span>
                    </div>
                  )}
                </div>

                {/* أزرار الإجراءات والمحادثة */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                  <button
                    onClick={() => setSelectedApp(app)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      background: '#00D2B4',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif',
                      boxShadow: '0 4px 14px rgba(0, 210, 180, 0.35)',
                      transition: 'all 0.15s',
                      width: '100%',
                    }}
                  >
                    <Eye size={16} /> عرض الملف والقرار
                  </button>

                  <button
                    onClick={() => setChatApp(app)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1.5px solid #bfdbfe',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif',
                      transition: 'all 0.15s',
                      width: '100%',
                    }}
                  >
                    <MessageSquare size={14} /> محادثة المرشح 💬
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal عرض بيانات المتقدم الكاملة مع أزرار القبول والرفض والمقابلة */}
      {selectedApp && (
        <ApplicantDetailsModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusUpdated={(appId, newStatus) => {
            setApplications((prev) =>
              prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
            );
            if (selectedApp && selectedApp._id === appId) {
              setSelectedApp((prev) => ({ ...prev, status: newStatus }));
            }
          }}
        />
      )}

      {/* 💬 Modal المحادثة المباشرة مع المرشح */}
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

export default AllApplicants;
