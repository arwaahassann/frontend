import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { EMPLOYER, PUBLIC_JOBS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Loader2, CheckCircle, ChevronDown } from 'lucide-react';
import LocationInput from '../../components/LocationInput';

const CreateJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    jobTitle: '',
    company: user?.company || '',
    logoUrl: '',
    category: 'عام',
    description: '',
    level: 'متوسط',
    experience: '1-3 سنوات',
    qualifications: '',
    jobType: 'دوام كامل',
    specialty: '',
    degree: 'بكالوريوس',
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
  const [submitted, setSubmitted] = useState(false);

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
              logoUrl: j.logoUrl || '',
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
      setErrorMessage('تعذر التوليد بالذكاء الاصطناعي حالياً');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setErrorMessage('');
    setSuccessMessage('');

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
      } else {
        await api.post(EMPLOYER.CREATE_JOB, payload);
        setSuccessMessage('تم نشر إعلان الوظيفة الجديد بنجاح! 🎉');
      }

      setTimeout(() => {
        navigate('/manage');
      }, 1200);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'حدث خطأ أثناء حفظ الوظيفة');
    } finally {
      setSaving(false);
    }
  };

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

            {/* صف: اسم الشركة | لوجو وصورة الشركة */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
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

              <div>
                <label style={labelStyle}>
                  لوجو / صورة الشركة (اختياري)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {formData.logoUrl ? (
                    <div style={{ position: 'relative', width: '46px', height: '46px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #00D2B4', flexShrink: 0 }}>
                      <img src={formData.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logoUrl: '' }))}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(239, 68, 68, 0.7)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900 }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData((prev) => ({ ...prev, logoUrl: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ ...inputStyle, padding: '9px 12px', fontSize: '12px' }}
                  />
                </div>
              </div>
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
                <label style={labelStyle}>
                  المؤهلات المطلوبة <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  placeholder="مثال: بكالوريوس في التخصص / شهادة مزاولة مهنة"
                  required
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
                  placeholder="التخصص الدقيق إن وجد"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>الشهادة المطلوبة</label>
                <div style={selectContainerStyle}>
                  <select name="degree" value={formData.degree} onChange={handleChange} style={selectStyle}>
                    <option value="بكالوريوس">بكالوريوس</option>
                    <option value="ماجستير">ماجستير</option>
                    <option value="دبلوم">دبلوم</option>
                    <option value="شهادة مهنية">شهادة مهنية</option>
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
          disabled={saving}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            background: '#00D2B4',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 900,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
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
