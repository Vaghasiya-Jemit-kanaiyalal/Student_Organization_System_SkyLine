import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token into all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('connectu_jwt_token') || sessionStorage.getItem('connectu_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      console.warn('Session expired or unauthorized request.');
    }
    return Promise.reject(error);
  }
);

export const eventsApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get('/events/', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/events/${id}/`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/events/create/', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/events/${id}/`, data);
    return res.data;
  },
  patch: async (id, data) => {
    const res = await apiClient.patch(`/events/${id}/`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/events/${id}/`);
    return res.data;
  },
};

export const volunteerApi = {
  apply: async (data) => {
    const res = await apiClient.post('/volunteers/apply/', data);
    return res.data;
  },
  getApplications: async (params = {}) => {
    const res = await apiClient.get('/volunteers/applications/', { params });
    return res.data;
  },
  approve: async (id, data) => {
    const res = await apiClient.put(`/volunteers/approve/${id}/`, data);
    return res.data;
  },
  reject: async (id, data = {}) => {
    const res = await apiClient.put(`/volunteers/reject/${id}/`, data);
    return res.data;
  },
  getActive: async (params = {}) => {
    const res = await apiClient.get('/volunteers/active/', { params });
    return res.data;
  },
  completeAssignment: async (id) => {
    const res = await apiClient.put(`/volunteers/assignment/${id}/complete/`);
    return res.data;
  },
  deleteAssignment: async (id) => {
    const res = await apiClient.delete(`/volunteers/assignment/${id}/`);
    return res.data;
  },
  getAnalytics: async () => {
    const res = await apiClient.get('/volunteers/analytics/');
    return res.data;
  },
};

export const certificateApi = {
  generate: async (data) => {
    const res = await apiClient.post('/certificates/generate/', data);
    return res.data;
  },
  getStudentCertificates: async () => {
    const res = await apiClient.get('/certificates/student/');
    return res.data;
  },
  getById: async (certificateId) => {
    const res = await apiClient.get(`/certificates/${certificateId}/`);
    return res.data;
  },
};

export const announcementsApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get('/announcements/', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/announcements/${id}/`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/announcements/', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/announcements/${id}/`, data);
    return res.data;
  },
  patch: async (id, data) => {
    const res = await apiClient.patch(`/announcements/${id}/`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/announcements/${id}/`);
    return res.data;
  },
};

export default apiClient;

