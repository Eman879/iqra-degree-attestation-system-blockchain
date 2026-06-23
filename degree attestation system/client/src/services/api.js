import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  adminLogin: async (email, password) => {
    const response = await api.post('/auth/admin-login', { email, password });
    return response.data;
  },
};

export const ocrService = {
  verifyCnic: async (file, expectedCnic) => {
    const formData = new FormData();
    formData.append('cnicOcrImage', file);
    formData.append('expectedCnic', expectedCnic);
    const response = await api.post('/ocr/cnic', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const applicationService = {
  submit: async (formData) => {
    // Expects a FormData object containing the fields and files
    const response = await api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },
  getByStudent: async (email) => {
    const response = await api.get(`/applications/student/${email}`);
    return response.data;
  },
};

export const adminService = {
  getRequests: async () => {
    const response = await api.get('/admin/requests');
    return response.data;
  },
  approveRequest: async (id) => {
    const response = await api.post(`/admin/requests/${id}/approve`);
    return response.data;
  },
  rejectRequest: async (id, reason) => {
    const response = await api.post(`/admin/requests/${id}/reject`, { reason });
    return response.data;
  },
};

export default api;
export { API_BASE_URL };
