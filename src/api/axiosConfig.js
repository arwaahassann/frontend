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
// معالجة جلسات المستخدم (401) وتنظيف أي رسائل أخطاء تقنية لتظهر كـ UX راقي ومفهوم
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // تنظيف رسائل الأخطاء لضمان عدم ظهور أي كود أو استثناء تقني للمستخدم
    if (error.response?.data?.message) {
      const raw = String(error.response.data.message);
      if (/bufferCommands|findOne|ReferenceError|TypeError|Mongoose|MongoServer|Cannot call|at Timeout|_onTimeout|econnrefused|status code 500|not defined/i.test(raw)) {
        error.response.data.message = 'حدث خطأ مؤقت أثناء معالجة الطلب، يرجى المحاولة مرة أخرى لاحقاً';
      }
    } else if (error.message === 'Network Error' || !error.response) {
      if (!error.response) error.response = {};
      if (!error.response.data) error.response.data = {};
      error.response.data.message = 'تعذر الاتصال بالخادم، يرجى التأكد من اتصال الإنترنت';
    }

    return Promise.reject(error);
  }
);

export default api;
