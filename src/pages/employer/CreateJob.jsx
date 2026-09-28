import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { EMPLOYER, PUBLIC_JOBS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Loader2, CheckCircle, ChevronDown, Bell } from 'lucide-react';
import LocationInput from '../../components/LocationInput';

const CreateJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    jobTitle: '',
    company: user?.company || '',
    category: 'عام',
    description: '',
    level: 'متوسط',
    experience: '1-3 سنوات',
    qualifications: '',
    jobType: 'دوام كامل',
    specialty: '',
    degree: 'لا يشترط شهادة / بدون مؤهل',
    workTime: 'صباحي',
    location: user?.location || '',
    salary: '10,000 - 20,000 ج.م',
    closingDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [createdJobTitle, setCreatedJobTitle] = useState('');
  const normalizedCompanyPhone = String(user?.phone || '')
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06f0))
    .trim();
  const phoneDigits = normalizedCompanyPhone.replace(/\D/g, '');
  const hasValidCompanyPhone = /^[+\d\s().-]+$/.test(normalizedCompanyPhone)
    && phoneDigits.length >= 8
    && phoneDigits.length <= 15;

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.get(PUBLIC_JOBS.BY_ID(id))
        .then((res) => {
          if (res.data.success && res.data.job) {
            const j = res.data.job;
            setFormData({
              title: j.title || '',
              jobTitle: j.jobTitle || j.title || '',
              company: j.company || user?.company || '',
              category: j.category || 'عام',
              description: j.description || '',
              level: j.level || 'متوسط',
              experience: j.experience || '1-3 سنوات',
              qualifications: j.qualifications || '',
              jobType: j.jobType || 'دوام كامل',
              specialty: j.specialty || '',
              degree: j.degree || 'بكالوريوس',
              workTime: j.workTime || 'صباحي',
              location: j.location || '',
              salary: j.salary || 'قابل للمفاوضة',
              closingDate: j.closingDate ? j.closingDate.split('T')[0] : '',
            });
          }
        })
        .catch(() => setErrorMessage('تعذر جلب تفاصيل الوظيفة'))
        .finally(() => setLoading(false));
    }
  }, [id, user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAiGenerate = async () => {
    if (!formData.title.trim()) {
      setErrorMessage('يرجى إدخال عنوان الإعلان أولاً للتمكن من توليد التفاصيل (مثال: طبيب أسنان / محاسب / مطور برمجيات)');
      return;
    }

    setGeneratingAi(true);
    setErrorMessage('');
    try {
      const res = await api.post('/api/ai/generate-job', {
        title: formData.title,
        category: formData.category,
        level: formData.level,
        experience: formData.experience,
        specialty: formData.specialty,
      });

      if (res.data.success && res.data.data) {
        const { description, qualifications, suggestedSalary } = res.data.data;
        setFormData((prev) => ({
          ...prev,
          description: description || prev.description,
          qualifications: qualifications || prev.qualifications,
          salary: suggestedSalary || prev.salary,
        }));
        setSuccessMessage('✨ تم توليد الوصف والمؤهلات والراتب المقترح بالذكاء الاصطناعي بنجاح!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'تعذر التوليد بالذكاء الاصطناعي حالياً');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (user?.role === 'employer' && !hasValidCompanyPhone) {
      setErrorMessage('لن يتم إرسال إعلان الوظيفة للمراجعة قبل إضافة رقم التواصل الأساسي للشركة في إعدادات الحساب. سيظهر هذا الرقم لإدارة المنصة.');
      return;
    }

    if (user?.role === 'employer' && user.accountStatus !== 'active') {
      setErrorMessage('حساب شركتك قيد المراجعة حالياً. يمكنك نشر الوظائف بعد موافقة إدارة المنصة.');
      return;
    }

    if (!formData.title.trim()) {
      setErrorMessage('عنوان الإعلان الوظيفي إلزامي');
      return;
    }
    if (!formData.location.trim()) {
      setErrorMessage('موقع ومقر الوظيفة إلزامي');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 15) {
      setErrorMessage('وصف الوظيفة ومسؤولياتها إلزامي (15 حرفاً على الأقل)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        jobTitle: formData.jobTitle || formData.title,
        company: formData.company || user?.company || 'الشركة الناشرة',
      };

      if (id) {
        await api.put(EMPLOYER.UPDATE_JOB(id), payload);
        setSuccessMessage('تم تحديث إعلان الوظيفة بنجاح! 🎉');
        setTimeout(() => {
          navigate('/manage');
        }, 1200);
      } else {
        await api.post(EMPLOYER.CREATE_JOB, payload);
        setCreatedJobTitle(formData.title);
        setShowSuccessScreen(true);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'حدث خطأ أثناء حفظ الوظيفة');
    } finally {
      setSaving(false);
    }
  };

  // شاشة تأكيد إرسال الوظيفة للمراجعة
  if (showSuccessScreen) {
    return (
      <div dir="rtl" style={{ maxWidth: '650px', margin: '40px auto', padding: '0 20px', fontFamily: 'Cairo, sans-serif' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '48px 36px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
            border: '1.5px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#ecfdf5',
              border: '2px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <CheckCircle size={44} color="#10b981" />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1D3557', margin: '0 0 12px' }}>
            تم إرسال الوظيفة للمراجعة بنجاح! 🎉
          </h2>

          <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.8', margin: '0 0 24px' }}>
            شكراً لك! إعلان وظيفة <strong style={{ color: '#1D3557' }}>"{createdJobTitle}"</strong> تم استلامه بنجاح وهو الآن قيد المراجعة والتدقيق من قبل إدارة المنصة لضمان الجودة والتوافق مع المعايير.
          </p>

          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '16px',
              padding: '16px 20px',
              margin: '0 0 32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'right',
            }}
          >
            <Bell size={22} color="#2563eb" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', fontWeight: 600, lineHeight: '1.6' }}>
              سنرسل لك إشعاراً فورياً على حسابك وبريدك الإلكتروني فور اعتماد الوظيفة من الإدارة ونشرها للباحثين عن عمل.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: '#00D2B4',
                color: '#ffffff',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,210,180,0.3)',
                transition: 'all 0.2s',
              }}
            >
              العودة للرئيسية
            </button>

            <button
              onClick={() => navigate('/manage')}
              style={{
                background: '#f8fafc',
                color: '#1D3557',
                border: '1.5px solid #cbd5e1',
                padding: '12px 30px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              إدارة الوظائف
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontFamily: 'Cairo, sans-serif' }}>
        جاري تحميل بيانات الوظيفة...
      </div>
    );
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 800,
    fontSize: '13px',
    color: '#334155',
    textAlign: 'right',
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'Cairo, sans-serif',
    color: '#1E293B',
    background: '#ffffff',
    outline: 'none',
    direction: 'rtl',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const selectContainerStyle = {
    position: 'relative',
    width: '100%',
  };

  const selectStyle = {
    ...inputStyle,
    paddingLeft: '38px',
    cursor: 'pointer',
    appearance: 'none',
  };

  return (
    <div dir="rtl" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '50px', fontFamily: 'Cairo, sans-serif' }}>
      
      {/* 1. عنوان الصفحة */}
      <h1
        style={{
          margin: '0 0 24px 0',
          fontSize: '26px',
          fontWeight: 900,
          color: '#1D3557',
          textAlign: 'center',
        }}
      >
        {id ? 'تعديل إعلان الوظيفة' : 'نشر إعلان وظيفة جديد'}
      </h1>

      {user?.role === 'employer' && user.accountStatus !== 'active' && (
        <div role="status" style={{ marginBottom: '20px', padding: '14px 20px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '14px', fontWeight: 700 }}>
          حساب شركتك قيد المراجعة. ستتمكن من نشر الوظائف بعد موافقة إدارة المنصة.
        </div>
      )}

      {user?.role === 'employer' && !hasValidCompanyPhone && (
        <div
          role="status"
          style={{
            marginBottom: '20px',
            padding: '14px 20px',
            borderRadius: '12px',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            color: '#9a3412',
            fontSize: '14px',
            fontWeight: 700,
          }}
        >
          لن يتم إرسال إعلانك للمراجعة قبل تسجيل رقم التواصل الأساسي للشركة؛ يجب أن يكون الرقم موجودًا ليظهر لإدارة المنصة.
          <button
            type="button"
            onClick={() => navigate('/settings')}
            style={{ display: 'block', marginTop: '8px', padding: 0, border: 0, background: 'none', color: '#c2410c', font: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
          >
            أضيفي رقم الشركة من إعدادات الحساب
          </button>
        </div>
      )}

      {/* تنبيهات النجاح والخطأ */}
      {successMessage && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: '12px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            fontSize: '14px',
            fontWeight: 800,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={18} /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: 800,
            marginBottom: '20px',
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* 2. كارت النموذج الأبيض */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1.5px solid #e2e8f0',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >

        {/* قسم 1: المعلومات الأساسية مع زر توليد الذكاء الاصطناعي */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#1D3557' }}>
              المعلومات الأساسية
            </h2>

            {/* 🤖 زر التوليد السحري بالذكاء الاصطناعي */}
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={generatingAi}
              style={{
                padding: '8px 18px',
                borderRadius: '12px',
                border: '1.5px solid #00D2B4',
                background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
                color: '#0f766e',
                fontSize: '13px',
                fontWeight: 800,
                cursor: generatingAi ? 'not-allowed' : 'pointer',
                fontFamily: 'Cairo, sans-serif',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0, 210, 180, 0.15)',
                transition: 'all 0.2s',
              }}
            >
              {generatingAi ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> جاري التوليد بالذكاء الاصطناعي...
                </>
              ) : (
                <>
                  <Sparkles size={16} color="#00D2B4" /> ✨ كتابة الإعلان بالذكاء الاصطناعي
                </>
              )}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* صف: عنوان الإعلان | المسمى الوظيفي */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div>
                <label style={labelStyle}>
                  عنوان الإعلان <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="مثال: طبيب باطنة / محاسب عام / مهندس موقع"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  المسمى الوظيفي <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="المسمى الوظيفي المعتمد"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            {/* اسم الشركة */}
            <div>
              <label style={labelStyle}>
                اسم الشركة / المنشأة <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="مثال: شركة النور القابضة / مستشفى الشفاء"
                required
                style={inputStyle}
              />
            </div>

            {/* صف: الوصف (Full Width) */}
            <div>
              <label style={labelStyle}>
                الوصف الوظيفي والمسؤوليات <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="اكتب تفاصيل ومسؤوليات الوظيفة أو اضغط زر 'كتابة الإعلان بالذكاء الاصطناعي' أعلاه..."
                required
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* قسم 2: مواصفات الوظيفة */}
        <div>
          <h2 style={{ margin: '0 0 18px 0', fontSize: '17px', fontWeight: 900, color: '#1D3557' }}>
            مواصفات الوظيفة
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* صف 1: المستوى | الخبرة */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div>
                <label style={labelStyle}>
                  المستوى المهني <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={selectContainerStyle}>
                  <select name="level" value={formData.level} onChange={handleChange} required style={selectStyle}>
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="متوسط">متوسط</option>
                    <option value="خبير">خبير</option>
                    <option value="مدير">مدير</option>
                  </select>
                  <ChevronDown size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  سنوات الخبرة المطلوبة <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={selectContainerStyle}>
                  <select name="experience" value={formData.experience} onChange={handleChange} required style={selectStyle}>
                    <option value="بدون خبرة">بدون خبرة</option>
                    <option value="1-3 سنوات">1-3 سنوات</option>
                    <option value="3-5 سنوات">3-5 سنوات</option>
                    <option value="5+ سنوات">5+ سنوات</option>
                  </select>
                  <ChevronDown size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* صف 2: المؤهلات | النوع */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div>
                <label style={labelStyle}>المؤهلات المطلوبة</label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  placeholder="مثال: لا يشترط مؤهل محدد / خبرة عملية فقط / بكالوريوس"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  نوع الدوام <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={selectContainerStyle}>
                  <select name="jobType" value={formData.jobType} onChange={handleChange} required style={selectStyle}>
                    <option value="دوام كامل">دوام كامل</option>
                    <option value="دوام جزئي">دوام جزئي</option>
                    <option value="عن بُعد">عن بُعد</option>
                    <option value="عقد">عقد</option>
                  </select>
                  <ChevronDown size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* صف 3: التخصص | الشهادة */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div>
                <label style={labelStyle}>التخصص الدقيق</label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="التخصص الدقيق إن وجد (اختياري)"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>الشهادة المطلوبة</label>
                <div style={selectContainerStyle}>
                  <select name="degree" value={formData.degree} onChange={handleChange} style={selectStyle}>
                    <option value="لا يشترط شهادة / بدون مؤهل">لا يشترط شهادة / بدون مؤهل</option>
                    <option value="ثانوية عامة / ما يعادلها">ثانوية عامة / ما يعادلها</option>
                    <option value="دبلوم متوسط / فني">دبلوم متوسط / فني</option>
                    <option value="بكالوريوس / ليسانس">بكالوريوس / ليسانس</option>
                    <option value="ماجستير">ماجستير</option>
                    <option value="دكتوراه">دكتوراه</option>
                    <option value="شهادة مهنية / احترافية">شهادة مهنية / احترافية</option>
                  </select>
                  <ChevronDown size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* قسم 3: الوقت والتفاصيل */}
        <div>
          <h2 style={{ margin: '0 0 18px 0', fontSize: '17px', fontWeight: 900, color: '#1D3557' }}>
            الوقت والتفاصيل
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* صف 1: الوقت | الموقع */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div>
                <label style={labelStyle}>
                  فترة وساعات العمل <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={selectContainerStyle}>
                  <select name="workTime" value={formData.workTime} onChange={handleChange} required style={selectStyle}>
                    <option value="صباحي">صباحي</option>
                    <option value="مسائي">مسائي</option>
                    <option value="مرن">مرن</option>
                  </select>
                  <ChevronDown size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  الموقع ومقر العمل <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <LocationInput
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="اختر من القائمة أو اكتب الدولة / المحافظة المخصصة"
                  required
                />
              </div>
            </div>

            {/* صف 2: الراتب المتوقع | تاريخ الإغلاق */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div>
                <label style={labelStyle}>
                  الراتب المتوقع <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={selectContainerStyle}>
                  <select name="salary" value={formData.salary} onChange={handleChange} required style={selectStyle}>
                    <option value="قابل للمفاوضة">قابل للمفاوضة</option>
                    <option value="5,000 - 10,000 ج.م">5,000 - 10,000 ج.م</option>
                    <option value="10,000 - 20,000 ج.م">10,000 - 20,000 ج.م</option>
                    <option value="20,000 - 35,000 ج.م">20,000 - 35,000 ج.م</option>
                    <option value="35,000+ ج.م">35,000+ ج.م</option>
                  </select>
                  <ChevronDown size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>تاريخ إغلاق التقديم</label>
                <div style={selectContainerStyle}>
                  <input
                    type="date"
                    name="closingDate"
                    value={formData.closingDate}
                    onChange={handleChange}
                    style={{ ...selectStyle, paddingLeft: '14px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* زر نشر الإعلان */}
        <button
          type="submit"
          disabled={saving || (user?.role === 'employer' && !hasValidCompanyPhone)}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            background: '#00D2B4',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 900,
            cursor: saving || (user?.role === 'employer' && !hasValidCompanyPhone) ? 'not-allowed' : 'pointer',
            opacity: saving || (user?.role === 'employer' && !hasValidCompanyPhone) ? 0.7 : 1,
            fontFamily: 'Cairo, sans-serif',
            boxShadow: '0 4px 20px rgba(0, 210, 180, 0.35)',
            marginTop: '10px',
          }}
        >
          {saving ? 'جاري الحفظ والرفع...' : id ? 'حفظ التعديلات' : 'نشر الإعلان الآن'}
        </button>

      </form>
    </div>
  );
};

export default CreateJob;
