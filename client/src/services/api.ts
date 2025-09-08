import axios, { AxiosResponse } from 'axios';
import { APIResponse, ProcessData, Equipment, Alert, User } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    department: string;
  }): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data.user;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};

// Process API
export const processAPI = {
  getStatus: async (): Promise<any> => {
    const response = await api.get('/process/status');
    return response.data;
  },

  getHistory: async (params: {
    hours?: number;
    processType?: string;
    stage?: string;
  }): Promise<{ data: ProcessData[]; count: number }> => {
    const response = await api.get('/process/history', { params });
    return response.data;
  },

  getAnalytics: async (period?: number): Promise<any> => {
    const response = await api.get('/process/analytics', { params: { period } });
    return response.data;
  },

  getParameters: async (processType: string, stage: string): Promise<any> => {
    const response = await api.get(`/process/${processType}/${stage}/parameters`);
    return response.data;
  },

  submitQualityInspection: async (data: {
    processType: string;
    stage: string;
    batchId: string;
    inspector: string;
    measurements: any;
  }): Promise<any> => {
    const response = await api.post('/process/quality-inspection', data);
    return response.data;
  },

  executeControl: async (data: {
    processType: string;
    stage?: string;
    action: string;
    parameters?: any;
    reason?: string;
  }): Promise<any> => {
    const response = await api.post('/process/control', data);
    return response.data;
  },
};

// Equipment API
export const equipmentAPI = {
  getStatus: async (): Promise<{ summary: any; equipment: Equipment[] }> => {
    const response = await api.get('/equipment/status');
    return response.data;
  },

  getDetails: async (equipmentId: string): Promise<any> => {
    const response = await api.get(`/equipment/${equipmentId}`);
    return response.data;
  },

  getEfficiencyAnalytics: async (period?: number): Promise<any> => {
    const response = await api.get('/equipment/analytics/efficiency', { params: { period } });
    return response.data;
  },

  scheduleMaintenance: async (equipmentId: string, data: {
    scheduledDate: string;
    maintenanceType?: string;
    duration?: number;
    technician?: string;
    notes?: string;
  }): Promise<any> => {
    const response = await api.post(`/equipment/${equipmentId}/maintenance`, data);
    return response.data;
  },

  updateStatus: async (equipmentId: string, data: {
    status: string;
    reason?: string;
  }): Promise<any> => {
    const response = await api.patch(`/equipment/${equipmentId}/status`, data);
    return response.data;
  },

  getMaintenanceHistory: async (equipmentId: string, limit?: number): Promise<any> => {
    const response = await api.get(`/equipment/${equipmentId}/maintenance/history`, { params: { limit } });
    return response.data;
  },

  getOEE: async (equipmentId: string, period?: number): Promise<any> => {
    const response = await api.get(`/equipment/${equipmentId}/oee`, { params: { period } });
    return response.data;
  },
};

// Alerts API
export const alertsAPI = {
  getAlerts: async (params?: {
    severity?: string;
    type?: string;
    acknowledged?: boolean;
    limit?: number;
  }): Promise<{ summary: any; alerts: Alert[] }> => {
    const response = await api.get('/alerts', { params });
    return response.data;
  },

  getStatistics: async (period?: number): Promise<any> => {
    const response = await api.get('/alerts/statistics', { params: { period } });
    return response.data;
  },

  acknowledgeAlert: async (alertId: string, data?: {
    userId?: string;
    notes?: string;
  }): Promise<any> => {
    const response = await api.post(`/alerts/${alertId}/acknowledge`, data);
    return response.data;
  },

  bulkAcknowledge: async (data: {
    alertIds: string[];
    userId?: string;
    notes?: string;
  }): Promise<any> => {
    const response = await api.post('/alerts/acknowledge-bulk', data);
    return response.data;
  },

  createCustomAlert: async (data: {
    type: string;
    severity: string;
    message: string;
    source: string;
  }): Promise<any> => {
    const response = await api.post('/alerts', data);
    return response.data;
  },

  getAlertDetails: async (alertId: string): Promise<any> => {
    const response = await api.get(`/alerts/${alertId}`);
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getProductionSummary: async (params?: {
    startDate?: string;
    endDate?: string;
    processType?: string;
  }): Promise<any> => {
    const response = await api.get('/reports/production-summary', { params });
    return response.data;
  },

  getEnvironmentalCompliance: async (period?: number): Promise<any> => {
    const response = await api.get('/reports/environmental-compliance', { params: { period } });
    return response.data;
  },

  getQualityAssurance: async (params?: {
    period?: number;
    processType?: string;
  }): Promise<any> => {
    const response = await api.get('/reports/quality-assurance', { params });
    return response.data;
  },

  getEquipmentPerformance: async (period?: number): Promise<any> => {
    const response = await api.get('/reports/equipment-performance', { params: { period } });
    return response.data;
  },

  getESGSustainability: async (period?: number): Promise<any> => {
    const response = await api.get('/reports/esg-sustainability', { params: { period } });
    return response.data;
  },
};

export default api;