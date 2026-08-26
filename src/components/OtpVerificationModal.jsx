import { useState, useRef, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

const OtpVerificationModal = ({ email, isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [demoCode, setDemoCode] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  // إرسال الرمز تلقائياً عند فتح النافذة
  useEffect(() => {
    if (isOpen && email) {
      handleSendOtp();
    }
  }, [isOpen, email]);

  const handleSendOtp = async () => {
    setResending(true);
    setError('');
    try {
      const res = await api.post('/api/auth/send-otp', { email });
      if (res.data?.otpCode) {
        setDemoCode(res.data.otpCode);
      }
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إرسال رمز التحقق');
    } finally {
      setResending(false);
    }
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (error) setError('');

    // الانتقال للخانة التالية تلقائياً
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام كاملة');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/verify-otp', { email, otp: fullOtp });
      if (res.data?.success) {
        login(res.data.user, res.data.token);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'رمز التحقق غير صحيح، حاول مجدداً');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
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
          padding: '36px 32px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        {/* أيقونة الأمان */}
        <div
          style={{
            width: '64px',
            height: '64px',
            background: '#e6fffa',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '2px solid #b2f5ea',
          }}
        >
          <ShieldCheck size={32} color="#00D2B4" />
        </div>

        <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
          التحقق من رمز OTP
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.6 }}>
          أدخل رمز التحقق المكون من 6 أرقام المرسل إلى بريدك:
          <br />
          <strong style={{ color: '#00D2B4', direction: 'ltr', display: 'inline-block' }}>{email}</strong>
        </p>

        {/* رمز تجريبي في بيئة العمل للتجربة المباشرة */}
        {demoCode && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>💡 رمز التحقق السريع:</span>
            <span style={{ fontSize: '16px', letterSpacing: '3px', fontWeight: 900, color: '#00D2B4' }}>{demoCode}</span>
          </div>
        )}

        {/* أخطاء */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* خانات الـ 6 أرقام */}
        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', direction: 'ltr', marginBottom: '24px' }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{
                  width: '46px',
                  height: '54px',
                  border: `2px solid ${digit ? '#00D2B4' : '#e2e8f0'}`,
                  borderRadius: '14px',
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#1E293B',
                  background: digit ? '#f0fdfa' : '#f8fafc',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxShadow: digit ? '0 0 0 3px rgba(0, 210, 180, 0.15)' : 'none',
                }}
              />
            ))}
          </div>

          {/* زر التأكيد */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#00D2B4',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '15px',
              border: 'none',
              borderRadius: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'Cairo, sans-serif',
              boxShadow: '0 4px 20px rgba(0, 210, 180, 0.35)',
              marginBottom: '16px',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'جاري التأكيد...' : 'تأكيد الحساب'}
          </button>
        </form>

        {/* زر إعادة الإرسال ومؤقت العد التنازلي */}
        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <span>لم يصلك الرمز؟</span>
          {canResend ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={resending}
              style={{
                background: 'none',
                border: 'none',
                color: '#00D2B4',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
              {resending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
            </button>
          ) : (
            <span style={{ fontWeight: 700, color: '#1E293B' }}>
              إعادة الإرسال بعد ({timer} ثانية)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;
