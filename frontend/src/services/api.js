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
  if (token && !token.startsWith('mock-')) {
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
      console.warn('Session expired or unauthorized request.');
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authApi = {
  forgotPassword: async (email) => {
    const res = await apiClient.post('/auth/forgot-password/', { email });
    return res.data;
  },
  validateResetToken: async (uidb64, token) => {
    const res = await apiClient.post('/auth/validate-reset-token/', { uidb64, token });
    return res.data;
  },
  resetPassword: async ({ uidb64, token, new_password, confirm_new_password }) => {
    const res = await apiClient.post('/auth/reset-password/', {
      uidb64,
      token,
      new_password,
      confirm_new_password
    });
    return res.data;
  }
};

export const clubsApi = {

  getAll: async () => {
    const res = await apiClient.get('/clubs/');
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/clubs/${id}/`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/clubs/', data);
    return res.data;
  }
};

export const membershipApi = {
  purchase: async (data) => {
    const res = await apiClient.post('/membership/purchase/', data);
    return res.data;
  },
  renew: async (data) => {
    const res = await apiClient.post('/membership/renew/', data);
    return res.data;
  },
  getMyStatus: async () => {
    const res = await apiClient.get('/membership/my-status/');
    return res.data;
  },
  adminGetMembers: async (params = {}) => {
    const res = await apiClient.get('/admin/members/', { params });
    return res.data;
  },
  getAdminMembers: async (params = {}) => {
    const res = await apiClient.get('/admin/members/', { params });
    return res.data;
  },
  adminUpdateMembership: async (id, data) => {
    const res = await apiClient.put(`/admin/members/${id}/membership/`, data);
    return res.data;
  },
  adminUpdateMember: async (id, data) => {
    const res = await apiClient.put(`/admin/members/${id}/membership/`, data);
    return res.data;
  },
  adminRenew: async (id, data = {}) => {
    const res = await apiClient.post(`/admin/members/${id}/renew/`, data);
    return res.data;
  },
  adminRenewMember: async (id, data = {}) => {
    const res = await apiClient.post(`/admin/members/${id}/renew/`, data);
    return res.data;
  },
  adminDiscardMember: async (id, data = {}) => {
    const res = await apiClient.post(`/admin/members/${id}/discard/`, data);
    return res.data;
  }
};

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
  buyTicket: async (id, data = {}) => {
    const res = await apiClient.post(`/events/${id}/buy-ticket/`, data);
    return res.data;
  },
};

export const paymentsApi = {
  createEventPayment: async (eventId, data = {}) => {
    const res = await apiClient.post(`/events/${eventId}/create-payment/`, data);
    return res.data;
  },
  verifyRazorpayPayment: async (data) => {
    const res = await apiClient.post('/payments/razorpay/verify/', data);
    return res.data;
  },
  // Dedicated Demo Payment Endpoints
  createDemoPayment: async (payload) => {
    const res = await apiClient.post('/payments/demo/create/', payload);
    return res.data;
  },
  processDemoPayment: async (payload) => {
    const res = await apiClient.post('/payments/demo/process/', payload);
    return res.data;
  },
  completeDemoPayment: async (payload) => {
    const res = await apiClient.post('/payments/demo/complete/', payload);
    return res.data;
  },
  getUserTransactions: async () => {
    const res = await apiClient.get('/payments/transactions/');
    return res.data;
  },
};


export const ticketsApi = {
  getMyTickets: async (params = {}) => {
    const res = await apiClient.get('/tickets/my-tickets/', { params });
    return res.data;
  },
  getById: async (ticketId) => {
    const res = await apiClient.get(`/tickets/${ticketId}/`);
    return res.data;
  },
  getPdfUrl: (ticketId) => {
    const baseURL = apiClient.defaults.baseURL || 'http://127.0.0.1:8000/api';
    return `${baseURL}/tickets/${ticketId}/pdf/`;
  },
  downloadPdf: async (ticketId) => {
    const res = await apiClient.get(`/tickets/${ticketId}/pdf/`, { responseType: 'blob' });
    return res.data;
  },
  verifyPublicTicket: async (ticketUuid) => {
    const res = await apiClient.get(`/tickets/verify/${ticketUuid}/`);
    return res.data;
  },
  verifyQr: async (qrToken, eventId = null) => {
    const res = await apiClient.post('/tickets/verify-qr/', { qr_token: qrToken, event_id: eventId });
    return res.data;
  },
  checkIn: async (ticketId) => {
    const res = await apiClient.post(`/tickets/${ticketId}/check-in/`);
    return res.data;
  },
  buyTicket: async (eventId, data = {}) => {
    const res = await apiClient.post(`/events/${eventId}/buy-ticket/`, data);
    return res.data;
  },
  transferTicket: async (ticketId, data) => {
    const res = await apiClient.post(`/tickets/${ticketId}/transfer/`, data);
    return res.data;
  },
  cancelTicket: async (ticketId) => {
    const res = await apiClient.post(`/tickets/${ticketId}/cancel/`);
    return res.data;
  }
};

export const merchandiseApi = {
  getProducts: async () => {
    const res = await apiClient.get('/merchandise/products/');
    return res.data;
  },
  getOrders: async (params = {}) => {
    const res = await apiClient.get('/merchandise/orders/', { params });
    return res.data;
  },
  createPayment: async (data) => {
    const res = await apiClient.post('/merchandise/orders/create-payment/', data);
    return res.data;
  },
  getById: async (orderId) => {
    const res = await apiClient.get(`/merchandise/orders/${orderId}/`);
    return res.data;
  },
  getPdfUrl: (orderId) => {
    const baseURL = apiClient.defaults.baseURL || 'http://127.0.0.1:8000/api';
    return `${baseURL}/merchandise/orders/${orderId}/pdf/`;
  },
  downloadPdf: async (orderId) => {
    const res = await apiClient.get(`/merchandise/orders/${orderId}/pdf/`, { responseType: 'blob' });
    return res.data;
  },
  verifyQr: async (qrToken) => {
    const res = await apiClient.post('/merchandise/orders/verify-qr/', { qr_token: qrToken });
    return res.data;
  },
  collect: async (orderId) => {
    const res = await apiClient.post(`/merchandise/orders/${orderId}/collect/`);
    return res.data;
  }
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

export const financeApi = {
  getDashboard: async (params = {}) => {
    const res = await apiClient.get('/finance/dashboard/', { params });
    return res.data;
  },
  getTransactions: async (params = {}) => {
    const res = await apiClient.get('/finance/transactions/', { params });
    return res.data;
  },
  createTransaction: async (data) => {
    const res = await apiClient.post('/finance/transactions/', data);
    return res.data;
  },
  getIncome: async (params = {}) => {
    const res = await apiClient.get('/finance/income/', { params });
    return res.data;
  },
  createIncome: async (data) => {
    const res = await apiClient.post('/finance/income/', data);
    return res.data;
  },
  getExpenses: async (params = {}) => {
    const res = await apiClient.get('/finance/expenses/', { params });
    return res.data;
  },
  createExpense: async (data) => {
    const res = await apiClient.post('/finance/expenses/', data);
    return res.data;
  },
  recordPayment: async (data) => {
    const res = await apiClient.post('/finance/payments/record/', data);
    return res.data;
  },
  getReports: async (params = {}) => {
    const res = await apiClient.get('/finance/reports/', { params });
    return res.data;
  },
  getReimbursements: async (params = {}) => {
    const res = await apiClient.get('/finance/reimbursements/', { params });
    return res.data;
  },
  createReimbursement: async (data, isFormData = false) => {
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await apiClient.post('/finance/reimbursements/', data, config);
    return res.data;
  },
  approveReimbursement: async (id) => {
    const res = await apiClient.post(`/finance/reimbursements/${id}/approve/`);
    return res.data;
  },
  rejectReimbursement: async (id, treasurerNotes = '') => {
    const res = await apiClient.post(`/finance/reimbursements/${id}/reject/`, {
      treasurer_notes: treasurerNotes,
    });
    return res.data;
  },
  markPaidReimbursement: async (id) => {
    const res = await apiClient.post(`/finance/reimbursements/${id}/mark-paid/`);
    return res.data;
  },
  refundTransaction: async (id, reason = '') => {
    const res = await apiClient.post(`/finance/transactions/${id}/refund/`, { reason });
    return res.data;
  },
};

export default apiClient;

