import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const isLocalApiUrl = /^https?:\/\/(localhost|127(?:\.\d{1,3}){3})(:\d+)?(?:\/|$)/i.test(configuredApiUrl || '');
const apiBaseUrl = import.meta.env.PROD
  ? (configuredApiUrl && !isLocalApiUrl ? configuredApiUrl : 'https://wazeftel3omr-backend.vercel.app')
  : (configuredApiUrl || 'http://localhost:5000');

// 1. إنشاء نسخة مخصصة من Axios متصلة بعنوان الـ Backend
const api = axios.create({
  baseURL: apiBaseUrl,
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
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || '');
    const isAuthAttempt = /\/api\/auth\/(login|register|google|send-otp|verify-otp|reset-password)/.test(requestUrl);

    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
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
