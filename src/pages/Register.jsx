import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Briefcase, Building, Eye, EyeOff } from 'lucide-react';
import api from '../api/axiosConfig';
import GoogleAuthButton from '../components/GoogleAuthButton';
import OtpVerificationModal from '../components/OtpVerificationModal';

const Register = () => {
  const [role, setRole] = useState('job_seeker');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    jobTitle: '',
    company: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getBorder = (fieldName) => {
    if (submitted) {
      if (fieldName === 'confirmPassword' && formData.password !== formData.confirmPassword) return '#ef4444';
      if (fieldName === 'email' && (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))) return '#ef4444';
      if (fieldName === 'name' && (!formData.name || formData.name.trim().length < 3)) return '#ef4444';
      if (fieldName === 'phone' && (!formData.phone || formData.phone.trim().length < 8)) return '#ef4444';
      if (fieldName === 'password' && (!formData.password || formData.password.length < 8)) return '#ef4444';
      if (role === 'employer' && fieldName === 'company' && (!formData.company || formData.company.trim().length < 2)) return '#ef4444';
    }
    return '#e2e8f0';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setErrors([]);

    const newErrors = [];
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.push({ message: 'الاسم بالكامل إلزامي (3 أحرف على الأقل)' });
    }
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.push({ message: 'البريد الإلكتروني إلزامي وبصيغة صحيحة' });
    }
    if (!formData.phone || formData.phone.trim().length < 8) {
      newErrors.push({ message: 'رقم الهاتف إلزامي للتواصل (8 أرقام على الأقل)' });
    }
    if (role === 'employer' && (!formData.company || formData.company.trim().length < 2)) {
      newErrors.push({ message: 'اسم الشركة إلزامي لحسابات أصحاب العمل' });
    }
    const isStrongPass =
      formData.password.length >= 8 &&
      /[A-Z]/.test(formData.password) &&
      /[a-z]/.test(formData.password) &&
      /[0-9]/.test(formData.password) &&
      /[^A-Za-z0-9]/.test(formData.password);

    if (!formData.password || !isStrongPass) {
      newErrors.push({
        message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف كبير (A-Z)، وحرف صغير (a-z)، ورقم (0-9)، ورمز خاص (مثل: @$!%*?&#)',
      });
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.push({ message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقتين' });
    }
    if (!agreeTerms) {
      newErrors.push({ message: 'يرجى الموافقة على الشروط والأحكام وسياسة الخصوصية للمتابعة' });
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { ...formData, role });
      if (res.data?.success) {
        setShowOtpModal(true);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
      } else {
        const errorMsg = data?.message || (
          err.message === 'Network Error' || !err.response
            ? 'تعذر الاتصال بالسيرفر، يرجى التأكد من اتصال الإنترنت وضبط رابط الـ Backend في Vercel'
            : 'حدث خطأ غير متوقع، يرجى المحاولة مجدداً'
        );
        setErrors([{ message: errorMsg }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '12px 40px 12px 14px',
    border: `1.5px solid ${getBorder(fieldName)}`,
    borderRadius: '12px',
    fontSize: '13px',
    fontFamily: 'Cairo, sans-serif',
    color: '#334155',
    background: '#ffffff',
    outline: 'none',
    direction: 'rtl',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  });

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '6px', textAlign: 'right' };

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 50%, #0052D4 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        fontFamily: 'Cairo, sans-serif',
      }}
    >
      {/* الكارت الأبيض المعتمد */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '40px 36px',
          width: '100%',
          maxWidth: '640px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#1E293B', marginBottom: '4px' }}>إنشاء حساب جديد</h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px', fontWeight: 500 }}>انضم إلينا وابدأ رحلتك المهنية اليوم</p>

        {/* تبديل نوع الحساب */}
        <div style={{ background: '#f1f5f9', borderRadius: '14px', padding: '4px', display: 'flex', marginBottom: '24px' }}>
          {[
            { val: 'job_seeker', label: 'باحث عن عمل' },
            { val: 'employer', label: 'مدير توظيف / شركة' },
          ].map((r) => (
            <button
              key={r.val}
              type="button"
              onClick={() => setRole(r.val)}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif',
                background: role === r.val ? '#ffffff' : 'transparent',
                color: role === r.val ? '#00D2B4' : '#94a3b8',
                boxShadow: role === r.val ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* قائمة الأخطاء */}
        {errors.length > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '12px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, marginBottom: '20px', textAlign: 'right' }}>
            {errors.map((err, i) => (
              <p key={i} style={{ margin: '2px 0' }}>• {err.message}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'right' }}>
          
          {/* الصف الأول: الاسم الكامل + البريد الإلكتروني */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                الاسم الكامل <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="الاسم الكامل"
                  required
                  style={inputStyle('name')}
                />
                <User size={18} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                البريد الإلكتروني <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="example@email.com"
                  required
                  style={inputStyle('email')}
                />
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          {/* الصف الثاني: رقم الهاتف + المسمى الوظيفي الحالي / اسم الشركة */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                رقم الهاتف <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text" name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="01xxxxxxxxx أو +966..."
                  required
                  style={inputStyle('phone')}
                />
                <Phone size={18} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              {role === 'job_seeker' ? (
                <>
                  <label style={labelStyle}>
                    المسمى الوظيفي الحالي <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange}
                      placeholder="مثال: محاسب عام / مهندس"
                      required
                      style={inputStyle('jobTitle')}
                    />
                    <Briefcase size={18} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </>
              ) : (
                <>
                  <label style={labelStyle}>
                    اسم الشركة / المنشأة <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text" name="company" value={formData.company} onChange={handleChange}
                      placeholder="اسم الشركة الرسمي"
                      required
                      style={inputStyle('company')}
                    />
                    <Building size={18} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* الصف الثالث: كلمة المرور + تأكيد كلمة المرور */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                كلمة المرور <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  placeholder="8 أحرف على الأقل"
                  required
                  style={{ ...inputStyle('password'), paddingLeft: '40px' }}
                />
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                تأكيد كلمة المرور <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  placeholder="أعد كتابة كلمة المرور"
                  required
                  style={{ ...inputStyle('confirmPassword'), paddingLeft: '40px' }}
                />
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <button
                  type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showConfirm ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                </button>
              </div>
            </div>
          </div>

          {/* الموافقة على الشروط */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', justifyContent: 'center' }}>
            <input
              type="checkbox" id="agreeTerms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
              required
              style={{ accentColor: '#00D2B4', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="agreeTerms" style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>
              أوافق على <a href="#" style={{ color: '#00D2B4', textDecoration: 'none', fontWeight: 700 }}>الشروط والأحكام</a> و <a href="#" style={{ color: '#00D2B4', textDecoration: 'none', fontWeight: 700 }}>سياسة الخصوصية</a> <span style={{ color: '#ef4444' }}>*</span>
            </label>
          </div>

          {/* زر إنشاء حساب */}
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#00D2B4',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '15px',
              border: 'none',
              borderRadius: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'Cairo, sans-serif',
              boxShadow: '0 4px 20px rgba(0,210,180,0.35)',
              marginTop: '8px',
            }}
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        {/* فاصل */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>أو</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {/* زر Google */}
        <div style={{ marginBottom: '20px' }}>
          <GoogleAuthButton role={role} onError={(msg) => setErrors([{ message: msg }])} />
        </div>

        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
          لديك حساب بالفعل؟{' '}
          <Link to="/login" style={{ color: '#00D2B4', fontWeight: 700, textDecoration: 'none' }}>
            سجل الدخول
          </Link>
        </p>
      </div>

      {/* نافذة التحقق عبر OTP */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        email={formData.email}
        onClose={() => setShowOtpModal(false)}
      />
    </div>
  );
};

export default Register;
