import { useState, useEffect } from 'react';
import {
  X, User, Mail, Phone, MapPin, Briefcase, FileText,
  Upload, CheckCircle, Lock, AlertCircle, Link as LinkIcon,
  Globe, Sparkles
} from 'lucide-react';
import api from '../api/axiosConfig';
import { SEEKER } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import LocationInput from './LocationInput';

const statusConfig = {
  pending:   { label: 'قيد الانتظار', bg: '#f1f5f9', color: '#475569' },
  reviewing: { label: 'قيد المراجعة', bg: '#fff7ed', color: '#ea580c' },
  interview: { label: 'دعوة مقابلة',  bg: '#eff6ff', color: '#2563eb' },
  accepted:  { label: 'تم القبول 🎉', bg: '#f0fdf4', color: '#16a34a' },
  rejected:  { label: 'تم الاعتذار',  bg: '#fef2f2', color: '#dc2626' },
};

const ApplyJobModal = ({ job, existingApplication, onClose, onSuccess }) => {
  const { user } = useAuth();
  const isAlreadyApplied = Boolean(existingApplication);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: existingApplication?.name || user?.name || '',
    email: existingApplication?.email || user?.email || '',
    phone: existingApplication?.phone || user?.phone || '',
    location: existingApplication?.location || user?.location || '',
    experience: existingApplication?.experience || 'سنتين خبرة',
    skills: existingApplication?.skills || (Array.isArray(user?.skills) ? user.skills.join(', ') : 'مطور برمجيات'),
    linkedinUrl: existingApplication?.linkedinUrl || '',
    portfolioUrl: existingApplication?.portfolioUrl || '',
    githubUrl: existingApplication?.githubUrl || '',
    availability: existingApplication?.availability || 'فوري',
    cvFile: null,
    cvFileName: existingApplication?.cvUrl ? 'السيرة الذاتية المرفقة' : '',
    cvBase64: existingApplication?.cvUrl || user?.cvUrl || '',
    notes: existingApplication?.notes || '',
  });

  useEffect(() => {
    if (!isAlreadyApplied) {
      api.get(SEEKER.PROFILE)
        .then((res) => {
          if (res.data.success && res.data.user) {
            const u = res.data.user;
            setFormData((prev) => ({
              ...prev,
              name: u.name || prev.name,
              email: u.email || prev.email,
              phone: u.phone || prev.phone,
              location: u.location || prev.location,
              skills: Array.isArray(u.skills) && u.skills.length > 0 ? u.skills.join(', ') : prev.skills,
              cvBase64: u.cvUrl || prev.cvBase64,
            }));
          }
        })
        .catch(() => {});
    }
  }, [isAlreadyApplied]);

  const handleChange = (e) => {
    if (isAlreadyApplied) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    if (isAlreadyApplied) return;
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('حجم الملف يجب ألا يتجاوز 8 ميجابايت');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          cvFile: file,
          cvFileName: file.name,
          cvBase64: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('الاسم بالكامل إلزامي');
      return;
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('البريد الإلكتروني إلزامي وبصيغة صحيحة');
      return;
    }
    if (!formData.phone.trim()) {
      setError('رقم الهاتف إلزامي للتواصل');
      return;
    }
    if (!formData.location.trim()) {
      setError('العنوان والمدينة إلزامية');
      return;
    }
    if (!formData.skills.trim()) {
      setError('يرجى كتابة المهارات أو التخصص');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAlreadyApplied) return;
    setError('');

    if (!formData.cvBase64) {
      setError('يرجى رفع ملف السيرة الذاتية (CV) للتقديم على الوظيفة');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        experience: formData.experience,
        skills: formData.skills,
        linkedinUrl: formData.linkedinUrl,
        portfolioUrl: formData.portfolioUrl,
        githubUrl: formData.githubUrl,
        availability: formData.availability,
        cvUrl: formData.cvBase64,
        notes: formData.notes,
      };

      const res = await api.post(SEEKER.APPLY(job._id), payload);
      if (res.data.success) {
        setSuccess(true);
        if (onSuccess) onSuccess(res.data.application);
      } else {
        setError(res.data.message || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    fontFamily: 'Cairo, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#1e293b',
    background: isAlreadyApplied ? '#f8fafc' : '#ffffff',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 800,
    color: '#334155',
    textAlign: 'right',
  };

  const currentStatus = isAlreadyApplied
    ? statusConfig[existingApplication?.status || 'pending']
    : null;

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Cairo, sans-serif',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflowY: 'auto',
          animation: 'fadeInModal 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>
                {isAlreadyApplied ? 'تفاصيل الطلب المقدم (معاينة فقط)' : 'المعلومات الشخصية للتقديم على الوظيفة'}
              </h2>
              {isAlreadyApplied && (
                <span style={{ fontSize: '11px', background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} /> تم التقديم مسبقاً
                </span>
              )}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
              الوظيفة: <strong style={{ color: '#00D2B4' }}>{job?.title}</strong> لدى <strong>{job?.company}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
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
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>

          {/* حالة الطلب إن كان قد تقدم بالفعل */}
          {isAlreadyApplied && currentStatus && (
            <div
              style={{
                background: currentStatus.bg,
                color: currentStatus.color,
                padding: '12px 18px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>حالة طلبك الحالي:</span>
              <span style={{ fontSize: '15px' }}>{currentStatus.label}</span>
            </div>
          )}

          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '16px',
                fontSize: '13px',
                fontWeight: 700,
                textAlign: 'right',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {success ? (
            /* Success State */
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle size={40} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
                تم إرسال طلبك بنجاح! 🎉
              </h3>
              <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b' }}>
                تم تقديم طلبك لوظيفة <strong>{job?.title}</strong> بنجاح. يمكنك متابعة حالة طلبك وإشعارات المقابلة من صفحة طلباتي.
              </p>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#00D2B4',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                تم، العودة للوظيفة
              </button>
            </div>
          ) : (
            /* Multi-step Form */
            <form onSubmit={step === 1 ? handleNextStep : handleSubmit}>

              {step === 1 ? (
                /* Step 1: Personal Info & Professional Links */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* الاسم بالكامل */}
                  <div>
                    <label style={labelStyle}>
                      الاسم بالكامل <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      readOnly={isAlreadyApplied}
                      placeholder="أدخل اسمك بالكامل"
                      required
                      style={inputStyle}
                    />
                  </div>

                  {/* البريد الالكتروني */}
                  <div>
                    <label style={labelStyle}>
                      البريد الإلكتروني <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={isAlreadyApplied}
                      placeholder="name@example.com"
                      required
                      style={inputStyle}
                    />
                  </div>

                  {/* رقم الهاتف */}
                  <div>
                    <label style={labelStyle}>
                      رقم الهاتف <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      readOnly={isAlreadyApplied}
                      placeholder="01xxxxxxxxx أو +966..."
                      required
                      style={inputStyle}
                    />
                  </div>

                  {/* العنوان */}
                  <div>
                    <label style={labelStyle}>
                      العنوان / المحافظة والمدينة <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <LocationInput
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      readOnly={isAlreadyApplied}
                      placeholder="اختر من القائمة أو اكتب عنوانك بالتفصيل"
                      required
                    />
                  </div>

                  {/* سنوات الخبره + المهارات */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>
                        سنوات الخبرة <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        readOnly={isAlreadyApplied}
                        placeholder="مثال: 3 سنوات"
                        required
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>
                        المهارات والتخصص <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        readOnly={isAlreadyApplied}
                        placeholder="اكتب مهاراتك الأساسية"
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* الروابط المهنية */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '4px' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#00D2B4' }}>
                      🔗 الروابط المهنية (اختياري)
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>رابط حساب LinkedIn</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            name="linkedinUrl"
                            value={formData.linkedinUrl}
                            onChange={handleChange}
                            readOnly={isAlreadyApplied}
                            placeholder="https://linkedin.com/in/username"
                            style={{ ...inputStyle, paddingRight: '36px' }}
                          />
                          <LinkIcon size={16} color="#0077b5" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>رابط معرض الأعمال / البورتفوليو</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            name="portfolioUrl"
                            value={formData.portfolioUrl}
                            onChange={handleChange}
                            readOnly={isAlreadyApplied}
                            placeholder="https://myportfolio.com"
                            style={{ ...inputStyle, paddingRight: '36px' }}
                          />
                          <Globe size={16} color="#00D2B4" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Button التالي */}
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#00D2B4',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '15px',
                      cursor: 'pointer',
                      marginTop: '8px',
                      fontFamily: 'Cairo, sans-serif',
                      boxShadow: '0 4px 14px rgba(0, 210, 180, 0.35)',
                    }}
                  >
                    التالي (تفاصيل السيرة الذاتية CV) ←
                  </button>
                </div>
              ) : (
                /* Step 2: Upload CV, Salary, Availability & Final Submit */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* رفع CV / معاينة CV */}
                  <div style={{ textAlign: 'right' }}>
                    <label style={labelStyle}>
                      السيرة الذاتية (CV) <span style={{ color: '#ef4444' }}>* (مطلوب للتقديم)</span>
                    </label>
                    <div
                      style={{
                        border: formData.cvBase64 ? '2px solid #00D2B4' : '2px dashed #cbd5e1',
                        borderRadius: '14px',
                        padding: '24px',
                        textAlign: 'center',
                        background: formData.cvBase64 ? '#f0fdfa' : '#f8fafc',
                        cursor: isAlreadyApplied ? 'default' : 'pointer',
                        position: 'relative',
                      }}
                    >
                      {!isAlreadyApplied && (
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,image/*"
                          onChange={handleFileUpload}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0,
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%',
                          }}
                        />
                      )}
                      <Upload size={32} color="#00D2B4" style={{ margin: '0 auto 8px' }} />
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>
                        {formData.cvFileName || (formData.cvBase64 ? 'تم إرفاق السيرة الذاتية بنجاح' : 'اضغط هنا لرفع السيرة الذاتية (PDF, Word)')}
                      </p>

                      {formData.cvBase64 && (
                        <span style={{ display: 'inline-block', marginTop: '8px', padding: '4px 12px', background: '#00D2B4', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                          ✓ الملف جاهز ومرفق بالطلب
                        </span>
                      )}
                    </div>
                  </div>

                  {/* تاريخ البدء المتاح */}
                  <div>
                    <label style={labelStyle}>
                      تاريخ البدء المتاح للعمل <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      readOnly={isAlreadyApplied}
                      placeholder="مثال: فوري / خلال أسبوعين"
                      required
                      style={inputStyle}
                    />
                  </div>

                  {/* رسالة التقديم (Cover Letter) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ ...labelStyle, margin: 0 }}>رسالة التقديم (Cover Letter)</label>
                      {!isAlreadyApplied && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await api.post('/api/ai/generate-cover-letter', {
                                jobTitle: job?.title,
                                company: job?.company,
                                applicantName: formData.name,
                                applicantSkills: formData.skills,
                                experience: formData.experience,
                              });
                              if (res.data.success && res.data.coverLetter) {
                                setFormData((prev) => ({ ...prev, notes: res.data.coverLetter }));
                              }
                            } catch {}
                          }}
                          style={{
                            background: '#f0fdfa',
                            border: '1px solid #00D2B4',
                            borderRadius: '8px',
                            padding: '3px 10px',
                            color: '#0f766e',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontFamily: 'Cairo, sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Sparkles size={13} /> صياغة رسالة تقديم احترافية بالـ AI
                        </button>
                      )}
                    </div>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      readOnly={isAlreadyApplied}
                      rows={4}
                      placeholder="أضف أي ملاحظات ترغب بإيصالها لمدير التوظيف أو اضغط زر التوليد بالـ AI أعلاه..."
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        flex: 1,
                        padding: '13px',
                        borderRadius: '12px',
                        border: '1.5px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#475569',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontFamily: 'Cairo, sans-serif',
                      }}
                    >
                      السابق
                    </button>

                    {isAlreadyApplied ? (
                      <button
                        type="button"
                        onClick={onClose}
                        style={{
                          flex: 2,
                          padding: '13px',
                          borderRadius: '12px',
                          border: 'none',
                          background: '#64748b',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '15px',
                          cursor: 'pointer',
                          fontFamily: 'Cairo, sans-serif',
                        }}
                      >
                        إغلاق (معاينة فقط)
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          flex: 2,
                          padding: '13px',
                          borderRadius: '12px',
                          border: 'none',
                          background: '#00D2B4',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '15px',
                          cursor: loading ? 'default' : 'pointer',
                          opacity: loading ? 0.7 : 1,
                          fontFamily: 'Cairo, sans-serif',
                          boxShadow: '0 4px 14px rgba(0, 210, 180, 0.35)',
                        }}
                      >
                        {loading ? 'جاري إرسال الطلب...' : 'تأكيد وإرسال الطلب الآن 🚀'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyJobModal;
