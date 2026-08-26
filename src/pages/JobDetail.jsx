import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Bookmark, BookmarkCheck, CheckCircle } from 'lucide-react';
import api from '../api/axiosConfig';
import { PUBLIC_JOBS, SEEKER } from '../api/endpoints';
import ApplyJobModal from '../components/ApplyJobModal';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [existingApp, setExistingApp] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // جلب بيانات الوظيفة الحقيقية
    api.get(PUBLIC_JOBS.BY_ID(id))
      .then((res) => {
        if (res.data.success) setJob(res.data.job);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // فحص إن كانت محفوظة بالمفضلة
    api.get(SEEKER.SAVED_JOBS)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.savedJobs)) {
          setIsSaved(res.data.savedJobs.some((j) => j._id === id));
        }
      })
      .catch(() => {});

    // فحص إن كان المتقدم قد تقدم لهذه الوظيفة بالفعل
    api.get(SEEKER.MY_APPLICATIONS)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.applications)) {
          const found = res.data.applications.find(
            (app) => app.job?._id === id || app.job === id
          );
          if (found) {
            setApplied(true);
            setExistingApp(found);
          }
        }
      })
      .catch(() => {});
  }, [id]);

  const handleToggleSave = async () => {
    try {
      const res = await api.post(SEEKER.TOGGLE_SAVE(id));
      if (res.data.success) setIsSaved(res.data.saved);
    } catch {
      /* ignore */
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'اليوم';
    const diff = Math.floor((Date.now() - new Date(dateString)) / 86400000);
    if (diff === 0) return 'منذ اليوم';
    if (diff === 1) return 'منذ يوم';
    return `منذ ${diff} أيام`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8', fontFamily: 'Cairo, sans-serif' }}>
        جاري تحميل تفاصيل الوظيفة...
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#ef4444', fontFamily: 'Cairo, sans-serif' }}>
        الوظيفة غير موجودة أو تم حذفها
      </div>
    );
  }

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, sans-serif', maxWidth: '1050px', margin: '0 auto', paddingBottom: '40px' }}>

      {/* رسالة نجاح أو خطأ */}
      {message.text && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: message.type === 'success' ? '#16a34a' : '#dc2626',
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={18} />
          {message.text}
        </div>
      )}

      {/* 1. كارت رأس الوظيفة */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* أزرار الإجراءات */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleToggleSave}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'Cairo, sans-serif',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isSaved ? (
              <>
                <BookmarkCheck size={18} color="#f59e0b" /> تم الحفظ
              </>
            ) : (
              <>
                <Bookmark size={18} color="#64748b" /> حفظ الوظيفه
              </>
            )}
          </button>

          <button
            onClick={() => setShowApplyModal(true)}
            style={{
              padding: '10px 28px',
              borderRadius: '10px',
              border: 'none',
              background: applied ? '#22c55e' : '#00FF66',
              color: applied ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 800,
              fontFamily: 'Cairo, sans-serif',
              boxShadow: applied ? 'none' : '0 4px 14px rgba(0, 255, 102, 0.4)',
            }}
          >
            {applied ? 'تم التقديم ✓ (عرض الطلب)' : 'التقديم الان'}
          </button>
        </div>

        {/* تفاصيل اللوجو والعنوان */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
              {job.title}
            </h1>
            <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 700, color: '#64748b' }}>
              {job.company || 'الشركة المعلنة'}
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: '#94a3b8' }}>
              <span>{job.location || 'غير محدد'}</span>
              <span>•</span>
              <span>{job.jobType || 'دوام كامل'}</span>
              <span>•</span>
              <span>{formatDate(job.createdAt)}</span>
            </div>
          </div>

          {/* Logo Circle */}
          {job.logoUrl ? (
            <img
              src={job.logoUrl}
              alt={job.company}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                objectFit: 'cover',
                border: '2px solid #e2e8f0',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
            />
          ) : (
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #1D3557, #00D2B4)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '26px',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(0, 210, 180, 0.3)',
              }}
            >
              {job.company?.charAt(0) || 'ش'}
            </div>
          )}
        </div>

      </div>

      {/* 2. الشبكة الرئيسية للتفاصيل */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>

        {/* العمود الأيمن الرئيسي (تفاصيل الوظيفة) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* نبذه عن الوظيفه */}
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
              نبذه عن الوظيفه
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.9' }}>
              {job.description || 'لم يتم إضافة وصف مفصل للوظيفة.'}
            </p>
          </div>

          {/* المهام والمسؤوليات */}
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
              المهام والمسؤوليات
            </h2>
            {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {job.requirements.map((req, index) => (
                  <div key={index} style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7' }}>
                    • {req}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                موضحة ضمن الوصف الوظيفي أعلاه.
              </p>
            )}
          </div>

          {/* المتطلبات والمؤهلات */}
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
              المتطلبات والمؤهلات
            </h2>
            {job.qualifications ? (
              <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.8' }}>
                {job.qualifications}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                الخبرة والمؤهلات موضحة في بطاقة معلومات الوظيفة.
              </p>
            )}
          </div>

        </div>

        {/* العمود الأيسر الجانبي */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* معلومات الوظيفه */}
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 18px', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
              معلومات الوظيفه
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>نوع الدوام</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{job.jobType || 'دوام كامل'}</p>
              </div>

              <div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>الموقع</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{job.location || 'غير محدد'}</p>
              </div>

              <div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>الخبره المطلوبة</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{job.experience || 'غير محدد'}</p>
              </div>

              <div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>المرتب</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{job.salary || 'قابل للمفاوضة'}</p>
              </div>

              <div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>القسم / المجال</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{job.category || 'تطوير البرمجيات'}</p>
              </div>
            </div>
          </div>

          {/* نبذه عن الشركه */}
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
              نبذه عن الشركه
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>اسم الشركه</label>
              <input
                type="text"
                readOnly
                value={job.company || 'الشركة المعلنة'}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'Cairo, sans-serif',
                  background: '#ffffff',
                  color: '#64748b',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#475569', lineHeight: '1.7' }}>
                {job.postedBy?.name ? `تم النشر بواسطة: ${job.postedBy.name}` : 'جهة توظيف معتمدة في المنصة'}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Modal التقديم على الوظيفه */}
      {showApplyModal && (
        <ApplyJobModal
          job={job}
          isAlreadyApplied={applied}
          existingApplication={existingApp}
          onClose={() => setShowApplyModal(false)}
          onSuccess={(newApp) => {
            setApplied(true);
            setExistingApp(newApp);
            setMessage({ text: 'تم إرسال طلب التقديم بنجاح! 🎉', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
          }}
        />
      )}

    </div>
  );
};

export default JobDetail;
