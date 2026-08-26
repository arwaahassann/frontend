// ===================================================
// 📌 API Endpoints — وظيفة العمر
// ===================================================

export const AUTH = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',
  LOGOUT: '/api/auth/logout',
  GOOGLE: '/api/auth/google',
  SEND_OTP: '/api/auth/send-otp',
  VERIFY_OTP: '/api/auth/verify-otp',
  RESET_PASSWORD_OTP: '/api/auth/reset-password-otp',
};

export const PUBLIC_JOBS = {
  ALL: '/api/jobs',
  BY_ID: (id) => `/api/jobs/${id}`,
};

export const SEEKER = {
  PROFILE: '/api/seeker/profile',
  CHANGE_PASSWORD: '/api/seeker/profile/change-password',
  SAVED_JOBS: '/api/seeker/profile/saved',
  TOGGLE_SAVE: (jobId) => `/api/seeker/profile/saved/${jobId}`,

  APPLY: (jobId) => `/api/seeker/applications/${jobId}`,
  MY_APPLICATIONS: '/api/seeker/applications',
  APPLICATION_STATS: '/api/seeker/applications/stats',

  NOTIFICATIONS: '/api/seeker/notifications',
  MARK_ALL_READ: '/api/seeker/notifications/read-all',
  MARK_READ: (id) => `/api/seeker/notifications/${id}/read`,
};

export const EMPLOYER = {
  MY_JOBS: '/api/employer/jobs/mine',
  CREATE_JOB: '/api/employer/jobs',
  UPDATE_JOB: (id) => `/api/employer/jobs/${id}`,
  DELETE_JOB: (id) => `/api/employer/jobs/${id}`,

  ALL_APPLICANTS: '/api/employer/applicants/all',
  JOB_APPLICANTS: (jobId) => `/api/employer/applicants/job/${jobId}`,
  UPDATE_STATUS: (appId) => `/api/employer/applicants/${appId}/status`,
};
