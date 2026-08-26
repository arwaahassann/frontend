import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

// 1. إنشاء الـ Context (البطاقة الإذاعية)
const AuthContext = createContext(null);

// 2. الـ Provider: يلف التطبيق بالكامل ويبث البيانات لكل الصفحات
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // عند أول تشغيل للتطبيق: استرجاع البيانات المحفوظة ومزامنتها فوراً مع السيرفر
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // جلب أحدث نسخة من بيانات المستخدم (بما فيها الصورة الشخصية) من السيرفر
        api.get('/api/auth/me')
          .then((res) => {
            if (res.data?.user) {
              const u = res.data.user;
              const freshUser = {
                ...parsedUser,
                ...u,
                id: u._id || u.id || parsedUser.id || parsedUser._id,
                avatar: u.avatar !== undefined ? u.avatar : parsedUser.avatar,
              };
              setUser(freshUser);
              localStorage.setItem('user', JSON.stringify(freshUser));
            }
          })
          .catch(() => {
            /* ignore network error on initial load */
          });
      } catch {
        /* ignore parsing error */
      }
    }

    // انتهى التحقق، أوقف شاشة التحميل
    setLoading(false);
  }, []);

  // دالة تسجيل الدخول: تحفظ البيانات وتوجه للصفحة الرئيسية
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    navigate('/');
  };

  // دالة تسجيل الخروج: تمسح كل شيء وترجع لتسجيل الدخول
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // دالة تحديث بيانات المستخدم في الـ Context و LocalStorage فورياً
  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      // نحتفظ دايماً بالـ id سواء جاء كـ _id أو id
      const newUser = {
        ...prevUser,
        ...updatedData,
        id: updatedData.id || updatedData._id || prevUser?.id || prevUser?._id,
      };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  // القيم التي ستكون متاحة لكل الصفحات
  const value = { user, loading, login, logout, setUser, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook مخصص لسهولة استخدام الـ Context في أي صفحة
//    بدلاً من: const { user } = useContext(AuthContext)
//    نكتب:    const { user } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth يجب استخدامه داخل AuthProvider');
  }
  return context;
};
