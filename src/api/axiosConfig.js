import axios from 'axios';

// 1. إنشاء نسخة مخصصة من Axios متصلة بعنوان الـ Backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://wazeftel3omr-backend.vercel.app' : 'http://localhost:5000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor: قبل كل طلب يتم إرساله للـ Backend
//    يجلب التوكن من الذاكرة المحلية ويضيفه تلقائياً للـ Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Interceptor: بعد كل رد من الـ Backend
//    لو التوكن انتهت صلاحيته (401)، احذف البيانات المحلية وأعد توجيه المستخدم لتسجيل الدخول
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
