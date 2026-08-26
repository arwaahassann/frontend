import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, Lock, CheckCircle2, ArrowRight, Eye, EyeOff, RefreshCw } from 'lucide-react';

const ForgotPasswordModal = ({ isOpen, onClose, defaultEmail = '' }) => {
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('يرجى إدخال بريد إلكتروني صالح');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.post('/api/auth/send-otp', { email: email.trim().toLowerCase() });
      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح!');
        setStep(2);
        setResendTimer(60); // 60 seconds countdown
      }
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إرسال رمز OTP، تأكد من صحة البريد المسجل');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }
    const isStrongPass =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[^A-Za-z0-9]/.test(newPassword);

    if (!newPassword || !isStrongPass) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف كبير (A-Z)، وحرف صغير (a-z)، ورقم (0-9)، ورمز خاص (مثل: @$!%*?&#)');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/reset-password-otp', {
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
        newPassword,
        confirmPassword,
      });

      if (res.data?.success) {
        login(res.data.user, res.data.token);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'رمز OTP غير صحيح أو انتهت صلاحيته');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
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
          padding: '36px 30px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          textAlign: 'center',
          position: 'relative',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* زر إغلاق */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            left: '18px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontWeight: 800,
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>

        {/* أيقونة الهيدر */}
        <div
          style={{
            width: '60px',
            height: '60px',
            background: '#e6fffa',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '2px solid #b2f5ea',
          }}
        >
          <KeyRound size={30} color="#00D2B4" />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1D3557', marginBottom: '6px' }}>
          {step === 1 ? 'استعادة كلمة المرور' : 'إدخال رمز التحقق وكلمة المرور'}
        </h3>
        <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
          {step === 1
            ? 'أدخل بريدك الإلكتروني المسجل ليصلك رمز التحقق الحقيقي (OTP)'
            : `تم إرسال رمز التحقق إلى: ${email}`}
        </p>

        {/* رسائل التنبيه والخطأ والنجاح */}
        {successMsg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '12px', fontSize: '12.5px', fontWeight: 700, marginBottom: '16px', textAlign: 'right' }}>
            ✅ {successMsg}
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, marginBottom: '16px', textAlign: 'right' }}>
            ⚠️ {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'right' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif',
                    color: '#334155',
                    outline: 'none',
                    boxSizing: 'border-box',
                    direction: 'ltr',
                    textAlign: 'right',
                  }}
                />
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: '#00D2B4',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '14px',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Cairo, sans-serif',
                boxShadow: '0 4px 16px rgba(0, 210, 180, 0.35)',
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'جاري إرسال الرمز...' : 'إرسال رمز التحقق (OTP) 📩'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'right' }}>
            
            {/* رمز الـ OTP */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                رمز التحقق المكون من 6 أرقام (OTP)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1.5px solid #00D2B4',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 900,
                  textAlign: 'center',
                  letterSpacing: '6px',
                  fontFamily: 'Cairo, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#f0fdfa',
                }}
              />
            </div>

            {/* كلمة المرور الجديدة */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                كلمة المرور الجديدة (8 أحرف على الأقل)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif',
                    color: '#334155',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <Lock size={17} color="#94a3b8" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={17} color="#94a3b8" /> : <Eye size={17} color="#94a3b8" />}
                </button>
              </div>
            </div>

            {/* تأكيد كلمة المرور */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                تأكيد كلمة المرور الجديدة
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif',
                    color: '#334155',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <Lock size={17} color="#94a3b8" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showConfirm ? <EyeOff size={17} color="#94a3b8" /> : <Eye size={17} color="#94a3b8" />}
                </button>
              </div>
            </div>

            {/* زر إعادة الإرسال ومؤقت الثواني */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748b' }}>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={resendTimer > 0 || loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendTimer > 0 ? '#94a3b8' : '#00D2B4',
                  fontWeight: 800,
                  cursor: resendTimer > 0 ? 'default' : 'pointer',
                  padding: 0,
                  fontFamily: 'Cairo, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={12} />
                {resendTimer > 0 ? `إعادة الإرسال بعد (${resendTimer} ثانية)` : 'إعادة إرسال رمز الـ OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                تغيير البريد ✏️
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: '#00D2B4',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '14px',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Cairo, sans-serif',
                boxShadow: '0 4px 16px rgba(0, 210, 180, 0.35)',
                marginTop: '4px',
              }}
            >
              {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور والدخول 🚀'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
