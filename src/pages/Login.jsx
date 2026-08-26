import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const Login = () => {
  const { login } = useAuth();
  const [role, setRole]             = useState('job_seeker');
  const [showPassword, setShowPass] = useState(false);
  const [formData, setFormData]     = useState({ email: '', password: '' });
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [authError, setAuthError]   = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail]         = useState('');

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
    if (authError) setAuthError(false);
  };

  const getEmailBorder = () => {
    if (authError) return '#ef4444';
    if (submitted && (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))) {
      return '#ef4444'; // أحمر عند الضغط والبيانات فارغة أو خاطئة
    }
    return '#e2e8f0'; // رصاصي طبيعي
  };

  const getPasswordBorder = () => {
    if (authError) return '#ef4444';
    if (submitted && (!formData.password || formData.password.length < 8)) {
      return '#ef4444'; // أحمر عند الضغط والبيانات فارغة أو خاطئة
    }
    return '#e2e8f0'; // رصاصي طبيعي
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    setAuthError(false);

    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('يرجى إدخال بريد إلكتروني صالح');
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { ...formData, role });
      login(res.data.user, res.data.token);
    } catch (err) {
      setAuthError(true);
      const msg = err.response?.data?.message || (
        err.message === 'Network Error' || !err.response
          ? 'تعذر الاتصال بالسيرفر، يرجى التأكد من اتصال الإنترنت وضبط رابط الـ Backend في Vercel'
          : 'البريد الإلكتروني أو كلمة المرور غير صحيحة!'
      );
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      style={{ minHeight: '100vh', background: '#1D3557', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Cairo, sans-serif' }}
    >
      {/* شعار المنصة */}
      <div style={{ background: '#fff', borderRadius: '999px', padding: '10px 32px', marginBottom: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <span style={{ fontWeight: 900, fontSize: '15px', color: '#1D3557' }}>وظيفة العمر</span>
      </div>

      {/* الكارت */}
      <div style={{ background: '#fff', borderRadius: '28px', padding: '40px 36px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', textAlign: 'center' }}>

        <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#1D3557', marginBottom: '6px' }}>تسجيل الدخول</h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '28px' }}>مرحباً بك مرة أخرى! سجل دخولك للمتابعة</p>

        {/* تبديل الدور */}
        <div style={{ background: '#f1f5f9', borderRadius: '14px', padding: '4px', display: 'flex', marginBottom: '28px' }}>
          {[{ val: 'job_seeker', label: 'باحث عن عمل' }, { val: 'employer', label: 'مدير توظيف' }].map((r) => (
            <button
              key={r.val}
              type="button"
              onClick={() => setRole(r.val)}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                background: role === r.val ? '#fff' : 'transparent',
                color: role === r.val ? '#00D2B4' : '#94a3b8',
                boxShadow: role === r.val ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >{r.label}</button>
          ))}
        </div>

        {/* الخطأ */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, marginBottom: '18px', textAlign: 'right' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'right' }}>

          {/* البريد */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email" name="email"
                value={formData.email} onChange={handleChange}
                placeholder="أدخل بريدك الإلكتروني"
                style={{ width: '100%', padding: '14px 16px 14px 44px', border: `2px solid ${getEmailBorder()}`, borderRadius: '12px', fontSize: '13px', fontFamily: 'Cairo, sans-serif', color: '#334155', background: '#f8fafc', outline: 'none', direction: 'rtl', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              />
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
            {submitted && (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) && (
              <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: 600 }}>بريد إلكتروني غير صالح</span>
            )}
          </div>

          {/* كلمة المرور */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'} name="password"
                value={formData.password} onChange={handleChange}
                placeholder="أدخل كلمة المرور"
                style={{ width: '100%', padding: '14px 44px 14px 44px', border: `2px solid ${getPasswordBorder()}`, borderRadius: '12px', fontSize: '13px', fontFamily: 'Cairo, sans-serif', color: '#334155', background: '#f8fafc', outline: 'none', direction: 'rtl', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              />
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <button type="button" onClick={() => setShowPass(!showPassword)} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
              </button>
            </div>
            {submitted && (!formData.password || formData.password.length < 8) && (
              <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: 600 }}>كلمة المرور يجب أن تكون 8 أحرف على الأقل</span>
            )}
            <div style={{ textAlign: 'right', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(formData.email || '');
                  setShowForgotModal(true);
                }}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: '12px', color: '#00D2B4', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>

          {/* زر الدخول */}
          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '15px', background: '#00D2B4', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'Cairo, sans-serif', boxShadow: '0 4px 20px rgba(0,210,180,0.35)', transition: 'opacity 0.2s', marginTop: '6px' }}
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        {/* فاصل */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>أو</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {/* Google */}
        <div style={{ marginBottom: '20px' }}>
          <GoogleAuthButton role={role} onError={(msg) => setError(msg)} />
        </div>

        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          ليس لديك حساب؟{' '}
          <Link to="/register" style={{ color: '#00D2B4', fontWeight: 700, textDecoration: 'none' }}>سجل الآن</Link>
        </p>
      </div>

      {/* نافذة استعادة كلمة المرور عبر OTP */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        defaultEmail={forgotEmail}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
};

export default Login;
