import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Forbidden = ({ requiredRole = 'employer' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEmployerNeeded = requiredRole === 'employer';

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        fontFamily: 'Cairo, sans-serif',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #fee2e2',
          padding: '48px 36px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(220, 38, 38, 0.08)',
        }}
      >
        {/* Shield Icon */}
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: '#fef2f2',
            border: '2px dashed #f87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <ShieldAlert size={44} color="#dc2626" />
        </div>

        <span
          style={{
            background: '#fef2f2',
            color: '#991b1b',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 800,
            display: 'inline-block',
            marginBottom: '14px',
          }}
        >
          خطأ 403 - غير مصرح بالدخول
        </span>

        <h1
          style={{
            margin: '0 0 10px',
            fontSize: '22px',
            fontWeight: 800,
            color: '#1D3557',
            lineHeight: 1.4,
          }}
        >
          {isEmployerNeeded
            ? 'عفواً! هذه الصفحة مخصصة لأصحاب الأعمال والشركات فقط 🏢'
            : 'عفواً! هذه الصفحة مخصصة للباحثين عن عمل فقط 💼'}
        </h1>

        <p
          style={{
            margin: '0 0 28px',
            fontSize: '14px',
            color: '#64748b',
            lineHeight: 1.7,
          }}
        >
          حسابك الحالي ({user?.role === 'employer' ? 'صاحب عمل' : 'باحث عن عمل'}) لا يمتلك الصلاحية المطلوبة لعرض هذه الصفحة.
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '13px 28px',
            borderRadius: '12px',
            border: 'none',
            background: '#1D3557',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'Cairo, sans-serif',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(29, 53, 87, 0.3)',
          }}
        >
          <Home size={18} /> العودة للصفحة الرئيسية
        </button>
      </div>
    </div>
  );
};

export default Forbidden;
