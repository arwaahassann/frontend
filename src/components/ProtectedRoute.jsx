import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Forbidden from '../pages/Forbidden';

// 🔒 الحارس الأمني للراوتس: ينفذ التحقق من الدخول والتحقق من الـ Roles الصارمة
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // 1. شاشة التحميل عند استرجاع الجلسة
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Cairo, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #00D2B4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>جاري التحقق من الجلسة الأمنية...</p>
        </div>
      </div>
    );
  }

  // 2. إذا لم يكن مسجلاً الدخول ← التوجيه لصفحة تسجيل الدخول
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. إذا كان المسار يتطلب رتبة معينة (مثلاً employer فقط) والـ User ليس لديه الصلاحية ← إظهار شاشة Forbidden 403
  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
    return <Forbidden requiredRole={allowedRoles[0]} />;
  }

  // 4. كل الصلاحيات سليمة ← إظهار المحتوى المطلوب
  return <Outlet />;
};

export default ProtectedRoute;
