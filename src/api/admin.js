import api from './axiosConfig';

export const getAdminStats = async () => {
  const res = await api.get('/api/admin/stats');
  return res.data;
};

export const getAdminUsers = async (params = {}) => {
  const res = await api.get('/api/admin/users', { params });
  return res.data;
};

export const updateAdminUserStatus = async (id, status) => {
  const res = await api.put(`/api/admin/users/${id}/status`, { status });
  return res.data;
};

export const getAdminCompanies = async (params = {}) => {
  const res = await api.get('/api/admin/companies', { params });
  return res.data;
};

export const updateAdminCompanyStatus = async (id, status) => {
  const res = await api.put(`/api/admin/companies/${id}/status`, { status });
  return res.data;
};

export const getAdminJobs = async (params = {}) => {
  const res = await api.get('/api/admin/jobs', { params });
  return res.data;
};

export const getAdminJobDetails = async (id) => {
  const res = await api.get(`/api/admin/jobs/${id}`);
  return res.data;
};

export const updateAdminJobStatus = async (id, status, rejectionReason) => {
  const res = await api.put(`/api/admin/jobs/${id}/status`, { status, rejectionReason });
  return res.data;
};

export const deleteAdminJob = async (id) => {
  const res = await api.delete(`/api/admin/jobs/${id}`);
  return res.data;
};

export const getAdminApplications = async (params = {}) => {
  const res = await api.get('/api/admin/applications', { params });
  return res.data;
};

export const getAdminReports = async (params = {}) => {
  const res = await api.get('/api/admin/reports', { params });
  return res.data;
};

export const updateAdminReportStatus = async (id, payload) => {
  const res = await api.put(`/api/admin/reports/${id}/status`, payload);
  return res.data;
};
