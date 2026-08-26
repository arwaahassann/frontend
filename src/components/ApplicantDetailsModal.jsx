import { useState, useEffect } from 'react';
import {
  X, User, Mail, Phone, MapPin, Briefcase, Calendar,
  FileText, Globe, Link as LinkIcon, DollarSign, Clock,
  CheckCircle, XCircle, MessageSquare, AlertCircle, Eye, Download,
  Sparkles, Check, ChevronRight, Award, Loader2, Video, Send, Building
} from 'lucide-react';
import api from '../api/axiosConfig';
import { EMPLOYER } from '../api/endpoints';

import ChatModal from './ChatModal';

const statusConfig = {
  pending:   { label: 'قيد الانتظار', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  reviewing: { label: 'قيد المراجعة', bg: '#fff7ed', color: '#ea580c', border: '#ffedd5' },
  interview: { label: 'دعوة مقابلة',  bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  accepted:  { label: 'تم القبول',    bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  rejected:  { label: 'تم الاعتذار',  bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const ApplicantDetailsModal = ({ application, onClose, onStatusUpdated }) => {
  if (!application) return null;

  const [currentStatus, setCurrentStatus] = useState(application.status || 'pending');
  const [updating, setUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // حالة التحكم في نوع الإجراء المفتوح حالياً (interview / rejected / accepted / null)
  const [activeAction, setActiveAction] = useState(null);

  // بيانات المقابلة
  const [interviewForm, setInterviewForm] = useState({
    date: application.interviewDetails?.date || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: application.interviewDetails?.time || '14:00',
    format: application.interviewDetails?.format || 'in_person',
    location: application.interviewDetails?.location || (application.job?.location ? `مقر الشركة في ${application.job.location}` : 'مقر الشركة الرئيسي'),
    notes: application.interviewDetails?.notes || 'يرجى إحضار بطاقة الهوية ونسخة مطبوعة من السيرة الذاتية (CV).',
  });

  // بيانات رسالة الرفض الذوقية
  const [rejectionMessage, setRejectionMessage] = useState(
    application.decisionMessage ||
    `نشكرك جزيلاً على وقتك واهتمامك بالتقديم على وظيفة (${application.job?.title || 'المعلنة'}). لقد كان ملفك مميزاً، ولكن نظراً لكثرة المتقدمين ومتطلبات المرحلة الحالية، نعتذر عن المضي قدماً في طلبك الآن، ويسعدنا الاحتفاظ بسيرتك الذاتية لفرصنا القادمة. نتمنى لك دوام التوفيق والنجاح!`
  );

  // بيانات رسالة القبول
  const [acceptanceMessage, setAcceptanceMessage] = useState(
    application.decisionMessage ||
    `تهانينا الحارة! يسعدنا إبلاغك بقبولك رسمياً لوظيفة (${application.job?.title || ''}) لدى شركتنا. سنتواصل معك هاتفياً وعبر البريد الإلكتروني خلال 48 ساعة لمناقشة تفاصيل العقد وتاريخ بدء العمل.`
  );

  const applicantName = application.name || application.user?.name || 'متقدم للوظيفة';
  const applicantEmail = application.email || application.user?.email || 'غير متوفر';
  const applicantPhone = application.phone || application.user?.phone || 'غير متوفر';
  const applicantLocation = application.location || application.user?.location || 'غير محدد';
  const applicantTitle = application.user?.jobTitle || application.experience || 'مطور برمجيات';
  const applicantExp = application.experience || 'سنتين خبرة';
  const applicantSkills = application.skills || (Array.isArray(application.user?.skills) ? application.user.skills.join('، ') : '');
  const cvUrl = application.cvUrl || application.user?.cvUrl;
  const jobTitle = application.job?.title || 'الوظيفة المعلنة';
  const companyName = application.job?.company || '';
  const appliedDate = application.createdAt
    ? new Date(application.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'اليوم';

  // دالة تنزيل ومعاينة الـ CV المضمونة بدون حظر المتصفح
  const handleDownloadCv = (e) => {
    e.preventDefault();
    if (!cvUrl) {
      alert('لم يتم إرفاق ملف سيرة ذاتية لهذا المتقدم.');
      return;
    }

    try {
      if (cvUrl.startsWith('data:')) {
        const arr = cvUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        
        const isPdf = mime.includes('pdf');
        const ext = isPdf ? 'pdf' : mime.includes('png') ? 'png' : mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : 'pdf';
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `CV_${applicantName.replace(/\s+/g, '_')}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      } else {
        window.open(cvUrl, '_blank');
      }
    } catch (err) {
      console.error('CV Download error:', err);
      window.open(cvUrl, '_blank');
    }
  };

  // تشغيل التحليل بالذكاء الاصطناعي تلقائياً
  useEffect(() => {
    const fetchAiScreening = async () => {
      setLoadingAi(true);
      try {
        const res = await api.post('/api/ai/screen-candidate', {
          jobTitle,
          jobRequirements: application.job?.description || '',
          applicantSkills,
          applicantExp,
          applicantTitle,
          notes: application.notes || '',
        });
        if (res.data.success) {
          setAiAnalysis(res.data.data);
        }
      } catch (e) {
        /* fallback */
      } finally {
        setLoadingAi(false);
      }
    };
    fetchAiScreening();
  }, [application]);

  const matchScore = aiAnalysis?.matchScore || 88;

  // إرسال قرار التوظيف مع كافة التفاصيل والإيميل
  const handleExecuteDecision = async (status, extraData = {}) => {
    setUpdating(true);
    setFeedbackMsg('');
    try {
      const payload = {
        status,
        ...extraData,
      };

      const res = await api.put(EMPLOYER.UPDATE_STATUS(application._id), payload);
      if (res.data.success) {
        setCurrentStatus(status);
        setActiveAction(null);
        setFeedbackMsg(`تم بنجاح تحديث حالة المتقدم إلى "${statusConfig[status]?.label}" وإرسال إشعار وبريد إلكتروني رسمي للمتقدم ✉️🎉`);
        if (onStatusUpdated) onStatusUpdated(application._id, status);
      }
    } catch (err) {
      setFeedbackMsg('حدث خطأ أثناء تحديث حالة الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setUpdating(false);
    }
  };

  const currentBadge = statusConfig[currentStatus] || statusConfig.pending;

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: 'Cairo, sans-serif',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          animation: 'fadeInModal 0.2s ease-out',
        }}
      >
        
        {/* 1. Header العلوي الأنيق */}
        <div
          style={{
            padding: '20px 26px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1D3557, #00D2B4)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
              }}
            >
              <User size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#1D3557' }}>
                ملف المتقدم للوظيفة
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                متقدم على: <strong style={{ color: '#00D2B4' }}>{jobTitle}</strong> {companyName ? `لدى ${companyName}` : ''}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* زر فتح المحادثة المباشرة */}
            <button
              type="button"
              onClick={() => setShowChat(true)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                background: '#eff6ff',
                color: '#2563eb',
                border: '1.5px solid #bfdbfe',
                cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MessageSquare size={14} /> محادثة مباشرة 💬
            </button>

            <span
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                background: currentBadge.bg,
                color: currentBadge.color,
                border: `1px solid ${currentBadge.border}`,
              }}
            >
              {currentBadge.label}
            </span>

            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                transition: 'all 0.15s',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. جسم النافذة والتفاصيل */}
        <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* تنبيه نجاح الإجراء */}
          {feedbackMsg && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '14px',
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                color: '#16a34a',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 2px 10px rgba(22, 163, 74, 0.1)',
              }}
            >
              <CheckCircle size={20} /> {feedbackMsg}
            </div>
          )}

          {/* 3. كارت هوية المتقدم + نسبة التطابق المتقدمة (AI Match Card) */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              padding: '22px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '18px',
            }}
          >
            {/* معلومات المتقدم الأساسية */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {application.user?.avatar || application.avatar ? (
                <img
                  src={application.user?.avatar || application.avatar}
                  alt={applicantName}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #00D2B4',
                    flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(0, 210, 180, 0.3)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1D3557 0%, #00D2B4 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '26px',
                    flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(0, 210, 180, 0.3)',
                  }}
                >
                  {applicantName.charAt(0)}
                </div>
              )}

              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#1D3557' }}>
                  {applicantName}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#00D2B4', fontWeight: 800 }}>
                  {applicantTitle}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> تاريخ التقديم: {appliedDate}
                </p>
              </div>
            </div>

            {/* بطاقة نسبة التطابق الذكية */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #ccfbf1',
                borderRadius: '16px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 4px 12px rgba(0, 210, 180, 0.1)',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#f0fdfa',
                  border: '3px solid #00D2B4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '15px',
                  color: '#0f766e',
                }}
              >
                {matchScore}%
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0f766e', fontWeight: 800, fontSize: '13px' }}>
                  <Sparkles size={14} color="#00D2B4" /> نسبة تطابق الملف بالـ AI
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                  {matchScore >= 85 ? '🌟 تطابق ممتاز مع متطلبات الوظيفة' : '👍 تطابق جيد جداً'}
                </p>
              </div>
            </div>
          </div>

          {/* 3.5. بطاقة التحليل والتوصية الذكية للمتقدم */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
              border: '1.5px solid #99f6e4',
              borderRadius: '18px',
              padding: '18px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#00D2B4" />
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#0f766e' }}>
                تحليل الذكاء الاصطناعي لملف المتقدم (AI Candidate Screening):
              </h4>
            </div>

            {loadingAi ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                <Loader2 size={16} className="animate-spin" /> جاري تدقيق ومطابقة السيرة الذاتية بالذكاء الاصطناعي...
              </div>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                  {aiAnalysis?.summary || `ملف مهني واعد لـ (${applicantName})، يمتلك مقومات ملائمة لشغل وظيفة (${jobTitle}).`}
                </p>

                {/* نقاط القوة والمهارات المطابقة */}
                {Array.isArray(aiAnalysis?.strengths) && aiAnalysis.strengths.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    {aiAnalysis.strengths.map((str, i) => (
                      <div key={i} style={{ fontSize: '12px', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={14} color="#10b981" /> {str}
                      </div>
                    ))}
                  </div>
                )}

                {aiAnalysis?.recommendation && (
                  <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #ccfbf1', fontSize: '12px', fontWeight: 800, color: '#047857' }}>
                    💡 <strong>توصية الـ AI: </strong>{aiAnalysis.recommendation}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 4. شبكة بيانات الاتصال والعنوان */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            
            {/* البريد الإلكتروني */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Mail size={14} color="#00D2B4" /> البريد الإلكتروني
              </span>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1E293B', direction: 'ltr', textAlign: 'right', wordBreak: 'break-all' }}>
                {applicantEmail}
              </p>
            </div>

            {/* رقم الهاتف */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Phone size={14} color="#00D2B4" /> رقم الهاتف
              </span>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1E293B', direction: 'ltr', textAlign: 'right' }}>
                {applicantPhone}
              </p>
            </div>

            {/* العنوان */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={14} color="#00D2B4" /> العنوان / المحافظة
              </span>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>
                {applicantLocation}
              </p>
            </div>

            {/* سنوات الخبرة */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Briefcase size={14} color="#00D2B4" /> سنوات الخبرة
              </span>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>
                {applicantExp}
              </p>
            </div>

          </div>

          {/* 5. تفاصيل الراتب والمباشرة */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={14} /> الراتب المتوقع
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 900, color: '#065f46' }}>
                  {application.expectedSalary || 'قابل للمفاوضة'}
                </p>
              </div>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> إمكانية بدء العمل
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 900, color: '#1e40af' }}>
                  {application.availability || 'فوري'}
                </p>
              </div>
            </div>
          </div>

          {/* 6. المهارات والتقنيات */}
          {applicantSkills && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1D3557', display: 'block', marginBottom: '8px' }}>
                🛠️ المهارات والتقنيات:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {applicantSkills.split(/[،,]/).map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      background: '#f0fdfa',
                      color: '#00D2B4',
                      border: '1px solid #ccfbf1',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 7. كارت السيرة الذاتية (CV) مع دالة التنزيل المباشرة */}
          <div
            style={{
              background: '#f0fdfa',
              border: '1.5px solid #00D2B4',
              borderRadius: '16px',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#00D2B4',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#1D3557' }}>
                  السيرة الذاتية للمتقدم (CV)
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                  {cvUrl ? 'الملف متوفر ومكتمل للتحميل والمعاينة المباشرة' : 'لم يتم إرفاق ملف CV من قبل المتقدم'}
                </p>
              </div>
            </div>

            {cvUrl ? (
              <button
                type="button"
                onClick={handleDownloadCv}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 24px',
                  borderRadius: '12px',
                  background: '#1D3557',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(29, 53, 87, 0.3)',
                  transition: 'all 0.2s',
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                <Download size={16} /> تنزيل وفتح الـ CV
              </button>
            ) : (
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, padding: '6px 14px', background: '#e2e8f0', borderRadius: '8px' }}>
                غير مرفق
              </span>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* 8. مركز قرارات التوظيف التفاعلي (Decision Center)           */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              borderTop: '2px dashed #e2e8f0',
              paddingTop: '20px',
              marginTop: '6px',
            }}
          >
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 900, color: '#1D3557' }}>
              ⚖️ اتخاذ قرار بشأن المرشح:
            </h4>

            {/* الأزرار الرئيسية لاختيار نوع الإجراء */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              
              {/* 1. زر دعوة مقابلة */}
              <button
                type="button"
                onClick={() => setActiveAction(activeAction === 'interview' ? null : 'interview')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: activeAction === 'interview' || currentStatus === 'interview' ? '2px solid #2563eb' : '1.5px solid #bfdbfe',
                  background: activeAction === 'interview' || currentStatus === 'interview' ? '#2563eb' : '#eff6ff',
                  color: activeAction === 'interview' || currentStatus === 'interview' ? '#ffffff' : '#1e40af',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
                  transition: 'all 0.15s',
                }}
              >
                <Calendar size={18} /> دعوة لمقابلة عمل
              </button>

              {/* 2. زر قبول */}
              <button
                type="button"
                onClick={() => setActiveAction(activeAction === 'accepted' ? null : 'accepted')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: activeAction === 'accepted' || currentStatus === 'accepted' ? '2px solid #16a34a' : '1.5px solid #bbf7d0',
                  background: activeAction === 'accepted' || currentStatus === 'accepted' ? '#16a34a' : '#f0fdf4',
                  color: activeAction === 'accepted' || currentStatus === 'accepted' ? '#ffffff' : '#15803d',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.15)',
                  transition: 'all 0.15s',
                }}
              >
                <CheckCircle size={18} /> قبول المتقدم
              </button>

              {/* 3. زر قيد المراجعة */}
              <button
                type="button"
                onClick={() => handleExecuteDecision('reviewing')}
                disabled={updating}
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: currentStatus === 'reviewing' ? '2px solid #ea580c' : '1.5px solid #fed7aa',
                  background: currentStatus === 'reviewing' ? '#ea580c' : '#fff7ed',
                  color: currentStatus === 'reviewing' ? '#ffffff' : '#c2410c',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s',
                }}
              >
                <Clock size={18} /> قيد المراجعة
              </button>

              {/* 4. زر اعتذار / رفض */}
              <button
                type="button"
                onClick={() => setActiveAction(activeAction === 'rejected' ? null : 'rejected')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: activeAction === 'rejected' || currentStatus === 'rejected' ? '2px solid #dc2626' : '1.5px solid #fecaca',
                  background: activeAction === 'rejected' || currentStatus === 'rejected' ? '#dc2626' : '#fef2f2',
                  color: activeAction === 'rejected' || currentStatus === 'rejected' ? '#ffffff' : '#b91c1c',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.15)',
                  transition: 'all 0.15s',
                }}
              >
                <XCircle size={18} /> اعتذار / رفض
              </button>

            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* أ. لوحة جدولة وتفاصيل المقابلة (Interview Scheduler Box)    */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeAction === 'interview' && (
              <div
                style={{
                  marginTop: '18px',
                  padding: '22px',
                  borderRadius: '18px',
                  background: '#f8fafc',
                  border: '2px solid #93c5fd',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  animation: 'fadeInModal 0.2s ease-out',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: 900, fontSize: '15px' }}>
                    <Calendar size={20} /> تحديد موعد وتفاصيل مقابلة العمل:
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b', background: '#e0f2fe', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
                    ✉️ سيتم إرسال إيميل رسمي للمتقدم فوراً
                  </span>
                </div>

                {/* تاريخ ووقت المقابلة */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                      تاريخ المقابلة 📅
                    </label>
                    <input
                      type="date"
                      value={interviewForm.date}
                      onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                      توقيت المقابلة ⏰
                    </label>
                    <input
                      type="time"
                      value={interviewForm.time}
                      onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* نوع المقابلة (حضوري / أونلاين) */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    طريقة المقابلة ومكانها 📍
                  </label>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setInterviewForm({ ...interviewForm, format: 'in_person' })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: interviewForm.format === 'in_person' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: interviewForm.format === 'in_person' ? '#eff6ff' : '#ffffff',
                        color: interviewForm.format === 'in_person' ? '#1e40af' : '#64748b',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Building size={16} /> حضوري بمقر الشركة
                    </button>

                    <button
                      type="button"
                      onClick={() => setInterviewForm({ ...interviewForm, format: 'online' })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: interviewForm.format === 'online' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: interviewForm.format === 'online' ? '#eff6ff' : '#ffffff',
                        color: interviewForm.format === 'online' ? '#1e40af' : '#64748b',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Video size={16} /> أونلاين (Google Meet / Zoom)
                    </button>
                  </div>

                  <input
                    type="text"
                    value={interviewForm.location}
                    onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })}
                    placeholder={interviewForm.format === 'online' ? 'ضع رابط الاجتماع (مثال: https://meet.google.com/xyz)' : 'اكتب عنوان المقر أو رابط خريطة Google Maps'}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box' }}
                  />
                </div>

                {/* ملاحظات إضافية */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    ملاحظات أو متطلبات للمقابلة
                  </label>
                  <textarea
                    rows={2}
                    value={interviewForm.notes}
                    onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                    placeholder="أي تعليمات للمتقدم قبل الحضور..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>

                {/* تأكيد إرسال الدعوة */}
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleExecuteDecision('interview', { interviewDetails: interviewForm })}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '14px',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    opacity: updating ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    fontFamily: 'Cairo, sans-serif',
                  }}
                >
                  {updating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {updating ? 'جاري إرسال الدعوة والإيميل...' : 'تأكيد وإرسال دعوة المقابلة عبر الإيميل والإشعار'}
                </button>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* ب. لوحة رسالة الرفض الذوقية (Polite Rejection Message)       */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeAction === 'rejected' && (
              <div
                style={{
                  marginTop: '18px',
                  padding: '22px',
                  borderRadius: '18px',
                  background: '#fef2f2',
                  border: '2px solid #fecaca',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  animation: 'fadeInModal 0.2s ease-out',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 900, fontSize: '15px' }}>
                    <XCircle size={20} /> رسالة اعتذار ذوقية وتشجيعية للمتقدم:
                  </div>
                  <span style={{ fontSize: '12px', color: '#7f1d1d', background: '#fee2e2', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
                    ✉️ ستصل للمتقدم عبر الإيميل والإشعار
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '12px', color: '#7f1d1d' }}>
                  يمكنك استخدام هذا القالب الراقي أو تعديله وكتابة رسالة مخصصة بالكلمات التي تفضلها:
                </p>

                <textarea
                  rows={4}
                  value={rejectionMessage}
                  onChange={(e) => setRejectionMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #fca5a5',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    fontFamily: 'Cairo, sans-serif',
                    background: '#ffffff',
                    color: '#1E293B',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />

                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleExecuteDecision('rejected', { decisionMessage: rejectionMessage })}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '14px',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    opacity: updating ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                    fontFamily: 'Cairo, sans-serif',
                  }}
                >
                  {updating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {updating ? 'جاري إرسال الاعتذار...' : 'تأكيد الاعتذار وإرسال الرسالة للمتقدم'}
                </button>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* ج. لوحة رسالة القبول (Acceptance Box)                       */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeAction === 'accepted' && (
              <div
                style={{
                  marginTop: '18px',
                  padding: '22px',
                  borderRadius: '18px',
                  background: '#f0fdf4',
                  border: '2px solid #bbf7d0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  animation: 'fadeInModal 0.2s ease-out',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 900, fontSize: '15px' }}>
                    <CheckCircle size={20} /> رسالة التهنئة والخطوات القادمة بالقبول:
                  </div>
                  <span style={{ fontSize: '12px', color: '#14532d', background: '#dcfce7', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
                    ✉️ ستصل للمتقدم عبر الإيميل والإشعار
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={acceptanceMessage}
                  onChange={(e) => setAcceptanceMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #86efac',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    fontFamily: 'Cairo, sans-serif',
                    background: '#ffffff',
                    color: '#1E293B',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />

                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleExecuteDecision('accepted', { decisionMessage: acceptanceMessage })}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '14px',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    opacity: updating ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                    fontFamily: 'Cairo, sans-serif',
                  }}
                >
                  {updating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {updating ? 'جاري إرسال القبول...' : 'تأكيد قبول المتقدم وإرسال التهنئة'}
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* نافذة المحادثة المباشرة */}
      {showChat && (
        <ChatModal
          applicationId={application._id}
          jobTitle={jobTitle}
          otherPartyName={applicantName}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default ApplicantDetailsModal;
