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

import { isDemoMode, authenticateDemo } from './demoData';
import { demoApiResponses, simulateApiDelay } from './demoApiData';

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log('Login attempt - API URL:', apiUrl);
    console.log('Login attempt - is Demo Mode:', isDemoMode());
    console.log('Login attempt - username:', username);
    
    // Check if we're in demo mode (no API URL configured)
    if (isDemoMode()) {
      console.log('Demo mode: Using local authentication');
      const demoAuth = authenticateDemo(username, password);
      console.log('Demo authentication result:', demoAuth);
      if (demoAuth) {
        // Store token in localStorage for demo mode
        localStorage.setItem('authToken', demoAuth.token);
        localStorage.setItem('user', JSON.stringify(demoAuth.user));
        return demoAuth;
      } else {
        console.error('Invalid demo credentials for username:', username);
        throw new Error('Invalid demo credentials. Try: admin/admin123, operator1/demo, quality_mgr/demo, executive/demo');
      }
    }

    console.log('Normal API mode - attempting to connect to:', API_BASE_URL);
    // Normal API mode
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
    if (isDemoMode()) {
      console.log('Demo mode: Using local process status data');
      await simulateApiDelay(200);
      return demoApiResponses['/api/process/status']();
    }
    const response = await api.get('/process/status');
    return response.data;
  },

  getHistory: async (params: {
    hours?: number;
    processType?: string;
    stage?: string;
  }): Promise<{ data: ProcessData[]; count: number }> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local process history data');
      await simulateApiDelay(300);
      return demoApiResponses['/api/process/history'](params);
    }
    const response = await api.get('/process/history', { params });
    return response.data;
  },

  getAnalytics: async (period?: number): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local process analytics data');
      await simulateApiDelay(400);
      return {
        efficiency: {
          current: 92.5,
          average: 89.2,
          trend: [88, 90, 91, 89, 92, 93, 92]
        },
        throughput: {
          current: 150,
          target: 160,
          trend: [145, 148, 152, 149, 150, 155, 150]
        },
        quality: {
          defectRate: 0.8,
          target: 1.0,
          trend: [1.2, 1.1, 0.9, 1.0, 0.8, 0.7, 0.8]
        }
      };
    }
    const response = await api.get('/process/analytics', { params: { period } });
    return response.data;
  },

  getParameters: async (processType: string, stage: string): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local process parameters data');
      await simulateApiDelay(150);
      return {
        temperature: { current: 175, setpoint: 180, min: 170, max: 190 },
        pressure: { current: 12.5, setpoint: 12.0, min: 10.0, max: 15.0 },
        speed: { current: 110, setpoint: 105, min: 95, max: 120 }
      };
    }
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
    if (isDemoMode()) {
      console.log('Demo mode: Simulating quality inspection submission');
      await simulateApiDelay(500);
      return {
        success: true,
        inspectionId: `demo-inspection-${Date.now()}`,
        message: 'Quality inspection submitted successfully (demo mode)'
      };
    }
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
    if (isDemoMode()) {
      console.log('Demo mode: Simulating process control execution');
      await simulateApiDelay(600);
      return {
        success: true,
        controlId: `demo-control-${Date.now()}`,
        message: `Process control "${data.action}" executed successfully (demo mode)`
      };
    }
    const response = await api.post('/process/control', data);
    return response.data;
  },
};

// Equipment API
export const equipmentAPI = {
  getStatus: async (): Promise<{ summary: any; equipment: Equipment[] }> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local equipment status data');
      await simulateApiDelay(250);
      return demoApiResponses['/api/equipment/status']();
    }
    const response = await api.get('/equipment/status');
    return response.data;
  },

  getDetails: async (equipmentId: string): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local equipment details data');
      await simulateApiDelay(200);
      return {
        id: equipmentId,
        name: `Equipment ${equipmentId}`,
        type: 'Extruder',
        location: 'Line A',
        status: 'operational',
        efficiency: 92.5,
        uptime: 98.2,
        lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        parameters: {
          temperature: 175,
          pressure: 12.5,
          speed: 110
        },
        alerts: [],
        maintenanceHistory: []
      };
    }
    const response = await api.get(`/equipment/${equipmentId}`);
    return response.data;
  },

  getEfficiencyAnalytics: async (period?: number): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local equipment efficiency analytics');
      await simulateApiDelay(300);
      return {
        overall: {
          average: 87.5,
          trend: [85, 86, 88, 87, 89, 88, 87],
          target: 90
        },
        byEquipment: [
          { name: 'Extruder 1', efficiency: 92.5 },
          { name: 'Spinning Unit 1', efficiency: 88.3 },
          { name: 'Oven 1', efficiency: 85.7 },
          { name: 'Winding Machine 1', efficiency: 89.2 }
        ]
      };
    }
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
    if (isDemoMode()) {
      console.log('Demo mode: Simulating maintenance scheduling');
      await simulateApiDelay(400);
      return {
        success: true,
        maintenanceId: `demo-maintenance-${Date.now()}`,
        message: 'Maintenance scheduled successfully (demo mode)',
        scheduledDate: data.scheduledDate
      };
    }
    const response = await api.post(`/equipment/${equipmentId}/maintenance`, data);
    return response.data;
  },

  updateStatus: async (equipmentId: string, data: {
    status: string;
    reason?: string;
  }): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Simulating equipment status update');
      await simulateApiDelay(300);
      return {
        success: true,
        equipmentId,
        newStatus: data.status,
        message: `Equipment status updated to "${data.status}" (demo mode)`
      };
    }
    const response = await api.patch(`/equipment/${equipmentId}/status`, data);
    return response.data;
  },

  getMaintenanceHistory: async (equipmentId: string, limit?: number): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local maintenance history data');
      await simulateApiDelay(250);
      const historyCount = limit || 10;
      return {
        history: Array.from({ length: historyCount }, (_, i) => ({
          id: `maintenance-${i + 1}`,
          date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000),
          type: ['Preventive', 'Corrective', 'Predictive'][i % 3],
          technician: `Tech${i % 3 + 1}`,
          duration: 2 + Math.random() * 4,
          notes: `Routine maintenance completed successfully`
        }))
      };
    }
    const response = await api.get(`/equipment/${equipmentId}/maintenance/history`, { params: { limit } });
    return response.data;
  },

  getOEE: async (equipmentId: string, period?: number): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local OEE data');
      await simulateApiDelay(200);
      return {
        overall: 87.5,
        availability: 95.2,
        performance: 92.8,
        quality: 99.1,
        trend: [85, 86, 88, 87, 89, 88, 87],
        target: 90
      };
    }
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
    if (isDemoMode()) {
      console.log('Demo mode: Using local alerts data');
      await simulateApiDelay(150);
      return demoApiResponses['/api/alerts'](params);
    }
    const response = await api.get('/alerts', { params });
    return response.data;
  },

  getStatistics: async (period?: number): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local alert statistics');
      await simulateApiDelay(200);
      return {
        total: 45,
        byType: {
          quality: 15,
          environmental: 12,
          equipment: 10,
          safety: 8
        },
        bySeverity: {
          critical: 3,
          high: 8,
          medium: 20,
          low: 14
        },
        trends: {
          daily: [5, 3, 7, 4, 6, 8, 5],
          weekly: [35, 42, 38, 45]
        },
        acknowledgedRate: 78.5
      };
    }
    const response = await api.get('/alerts/statistics', { params: { period } });
    return response.data;
  },

  acknowledgeAlert: async (alertId: string, data?: {
    userId?: string;
    notes?: string;
  }): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Simulating alert acknowledgment');
      await simulateApiDelay(300);
      return {
        success: true,
        alertId,
        acknowledgedAt: new Date(),
        acknowledgedBy: data?.userId || 'demo-user',
        message: 'Alert acknowledged successfully (demo mode)'
      };
    }
    const response = await api.post(`/alerts/${alertId}/acknowledge`, data);
    return response.data;
  },

  bulkAcknowledge: async (data: {
    alertIds: string[];
    userId?: string;
    notes?: string;
  }): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Simulating bulk alert acknowledgment');
      await simulateApiDelay(500);
      return {
        success: true,
        acknowledgedCount: data.alertIds.length,
        acknowledgedAt: new Date(),
        acknowledgedBy: data?.userId || 'demo-user',
        message: `${data.alertIds.length} alerts acknowledged successfully (demo mode)`
      };
    }
    const response = await api.post('/alerts/acknowledge-bulk', data);
    return response.data;
  },

  createCustomAlert: async (data: {
    type: string;
    severity: string;
    message: string;
    source: string;
  }): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Simulating custom alert creation');
      await simulateApiDelay(400);
      return {
        success: true,
        alertId: `demo-alert-${Date.now()}`,
        alert: {
          ...data,
          id: `demo-alert-${Date.now()}`,
          timestamp: new Date(),
          acknowledged: false
        },
        message: 'Custom alert created successfully (demo mode)'
      };
    }
    const response = await api.post('/alerts', data);
    return response.data;
  },

  getAlertDetails: async (alertId: string): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local alert details data');
      await simulateApiDelay(200);
      return {
        id: alertId,
        type: 'equipment',
        severity: 'medium',
        message: 'Equipment efficiency below threshold',
        source: 'Line A',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: false,
        details: {
          equipmentId: 'eq-1',
          currentEfficiency: 75.2,
          threshold: 80.0,
          duration: '2 hours'
        },
        history: [
          { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), action: 'Alert Created', user: 'System' },
          { timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), action: 'Notification Sent', user: 'System' }
        ]
      };
    }
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
    if (isDemoMode()) {
      console.log('Demo mode: Using local production summary data');
      await simulateApiDelay(350);
      return {
        totalProduction: 1250.5,
        targetProduction: 1200.0,
        efficiency: 95.8,
        qualityRate: 99.2,
        byProcessType: {
          pan: { production: 425.2, efficiency: 96.1 },
          carbon_fiber: { production: 380.8, efficiency: 94.5 },
          prepreg: { production: 290.5, efficiency: 97.2 },
          composite: { production: 154.0, efficiency: 95.8 }
        },
        trends: {
          daily: [180, 195, 175, 205, 190, 185, 200],
          weekly: [1150, 1200, 1180, 1250]
        },
        downtime: {
          total: 4.2,
          planned: 2.8,
          unplanned: 1.4
        }
      };
    }
    const response = await api.get('/reports/production-summary', { params });
    return response.data;
  },

  getEnvironmentalCompliance: async (period?: number): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local environmental compliance data');
      await simulateApiDelay(400);
      return {
        overallScore: 92.5,
        emissions: {
          co2: { current: 145.2, target: 150.0, compliance: true },
          nox: { current: 12.8, target: 15.0, compliance: true },
          so2: { current: 3.2, target: 5.0, compliance: true }
        },
        wasteManagement: {
          recyclingRate: 87.5,
          wasteReduction: 12.3,
          hazardousWasteCompliance: true
        },
        energyConsumption: {
          total: 2845.6,
          renewable: 45.2,
          efficiency: 94.8
        },
        waterUsage: {
          consumption: 1250.4,
          recycled: 65.8,
          compliance: true
        }
      };
    }
    const response = await api.get('/reports/environmental-compliance', { params: { period } });
    return response.data;
  },

  getQualityAssurance: async (params?: {
    period?: number;
    processType?: string;
  }): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local quality assurance data');
      await simulateApiDelay(300);
      return {
        overallQuality: 99.2,
        defectRate: 0.8,
        firstPassYield: 96.5,
        customerComplaints: 2,
        byProcessType: {
          pan: { quality: 99.5, defectRate: 0.5 },
          carbon_fiber: { quality: 98.8, defectRate: 1.2 },
          prepreg: { quality: 99.3, defectRate: 0.7 },
          composite: { quality: 99.0, defectRate: 1.0 }
        },
        inspections: {
          total: 1250,
          passed: 1240,
          failed: 10,
          passRate: 99.2
        },
        certifications: {
          iso9001: { status: 'compliant', expiryDate: '2024-12-31' },
          as9100: { status: 'compliant', expiryDate: '2024-08-15' }
        }
      };
    }
    const response = await api.get('/reports/quality-assurance', { params });
    return response.data;
  },

  getEquipmentPerformance: async (period?: number): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local equipment performance data');
      await simulateApiDelay(350);
      return {
        overallOEE: 87.5,
        availability: 95.2,
        performance: 92.8,
        quality: 99.1,
        byEquipment: [
          { name: 'Extruder 1', oee: 92.5, availability: 98.2, performance: 94.8, quality: 99.5 },
          { name: 'Spinning Unit 1', oee: 88.3, availability: 94.5, performance: 93.2, quality: 98.8 },
          { name: 'Oven 1', oee: 85.7, availability: 92.8, performance: 92.1, quality: 99.2 },
          { name: 'Winding Machine 1', oee: 89.2, availability: 96.5, performance: 91.8, quality: 99.0 }
        ],
        maintenance: {
          planned: 85.2,
          unplanned: 14.8,
          mtbf: 156.8,
          mttr: 4.2
        },
        trends: {
          oee: [85, 86, 88, 87, 89, 88, 87],
          availability: [94, 95, 96, 95, 96, 95, 95],
          performance: [91, 92, 93, 92, 93, 92, 93]
        }
      };
    }
    const response = await api.get('/reports/equipment-performance', { params: { period } });
    return response.data;
  },

  getESGSustainability: async (period?: number): Promise<any> => {
    if (isDemoMode()) {
      console.log('Demo mode: Using local ESG sustainability data');
      await simulateApiDelay(450);
      return {
        overallScore: 88.5,
        environmental: {
          score: 92.3,
          carbonFootprint: 2.45,
          energyEfficiency: 94.8,
          wasteReduction: 87.5,
          waterConservation: 78.2
        },
        social: {
          score: 86.7,
          employeeSafety: 99.2,
          trainingHours: 45.6,
          diversityIndex: 0.68,
          communityEngagement: 72.5
        },
        governance: {
          score: 86.5,
          complianceRate: 100.0,
          ethicsTraining: 98.5,
          riskManagement: 89.2,
          transparencyScore: 82.8
        },
        targets: {
          carbonReduction: { target: 15, achieved: 12.3, onTrack: true },
          renewableEnergy: { target: 50, achieved: 45.2, onTrack: true },
          wasteReduction: { target: 25, achieved: 28.5, onTrack: true },
          safetyIncidents: { target: 0, achieved: 1, onTrack: false }
        }
      };
    }
    const response = await api.get('/reports/esg-sustainability', { params: { period } });
    return response.data;
  },
};

export default api;