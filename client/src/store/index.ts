import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProcessData, Equipment, Alert, KPIData, User, DashboardState } from '@/types';

// Auth slice
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialAuthState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
});

// Dashboard slice
const initialDashboardState: DashboardState = {
  processData: [],
  equipment: [],
  alerts: [],
  kpis: {
    overallEfficiency: 0,
    equipmentUptime: 0,
    qualityRate: 0,
    energyEfficiency: 0,
    yieldRate: 0,
    co2Emission: 0,
    activeAlerts: 0,
  },
  timeRange: '24h',
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: initialDashboardState,
  reducers: {
    setProcessData: (state, action: PayloadAction<ProcessData[]>) => {
      state.processData = action.payload;
    },
    addProcessData: (state, action: PayloadAction<ProcessData[]>) => {
      // Add new data and keep only last 1000 points for performance
      state.processData = [...state.processData, ...action.payload].slice(-1000);
    },
    setEquipment: (state, action: PayloadAction<Equipment[]>) => {
      state.equipment = action.payload;
    },
    updateEquipment: (state, action: PayloadAction<Equipment>) => {
      const index = state.equipment.findIndex(eq => eq.id === action.payload.id);
      if (index !== -1) {
        state.equipment[index] = action.payload;
      } else {
        state.equipment.push(action.payload);
      }
    },
    setAlerts: (state, action: PayloadAction<Alert[]>) => {
      state.alerts = action.payload;
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts = [action.payload, ...state.alerts].slice(0, 100); // Keep only last 100 alerts
    },
    acknowledgeAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.acknowledged = true;
        alert.resolvedAt = new Date();
      }
    },
    setKPIs: (state, action: PayloadAction<KPIData>) => {
      state.kpis = action.payload;
    },
    setSelectedProcess: (state, action: PayloadAction<string | undefined>) => {
      state.selectedProcess = action.payload;
    },
    setSelectedEquipment: (state, action: PayloadAction<string | undefined>) => {
      state.selectedEquipment = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<'1h' | '4h' | '24h' | '7d'>) => {
      state.timeRange = action.payload;
    },
  },
});

// WebSocket connection slice
interface WebSocketState {
  connected: boolean;
  authenticated: boolean;
  reconnecting: boolean;
  error: string | null;
}

const initialWebSocketState: WebSocketState = {
  connected: false,
  authenticated: false,
  reconnecting: false,
  error: null,
};

const webSocketSlice = createSlice({
  name: 'webSocket',
  initialState: initialWebSocketState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
      if (action.payload) {
        state.error = null;
        state.reconnecting = false;
      }
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.authenticated = action.payload;
    },
    setReconnecting: (state, action: PayloadAction<boolean>) => {
      state.reconnecting = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// UI slice for managing UI state
interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  loading: {
    [key: string]: boolean;
  };
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
}

const initialUIState: UIState = {
  sidebarCollapsed: false,
  theme: 'light',
  loading: {},
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUIState,
  reducers: {
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      duration?: number;
    }>) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

// Configure store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    dashboard: dashboardSlice.reducer,
    webSocket: webSocketSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'dashboard/addProcessData',
          'dashboard/setProcessData',
          'dashboard/addAlert',
          'dashboard/setAlerts',
        ],
        ignoredPaths: [
          'dashboard.processData',
          'dashboard.alerts',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export actions
export const authActions = authSlice.actions;
export const dashboardActions = dashboardSlice.actions;
export const webSocketActions = webSocketSlice.actions;
export const uiActions = uiSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectDashboard = (state: RootState) => state.dashboard;
export const selectWebSocket = (state: RootState) => state.webSocket;
export const selectUI = (state: RootState) => state.ui;

// Computed selectors
export const selectUnacknowledgedAlerts = (state: RootState) =>
  state.dashboard.alerts.filter(alert => !alert.acknowledged);

export const selectCriticalAlerts = (state: RootState) =>
  state.dashboard.alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged);

export const selectOperationalEquipment = (state: RootState) =>
  state.dashboard.equipment.filter(eq => eq.status === 'operational');

export const selectRecentProcessData = (state: RootState) => {
  const timeRange = state.dashboard.timeRange;
  const now = new Date();
  let cutoff: Date;

  switch (timeRange) {
    case '1h':
      cutoff = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '4h':
      cutoff = new Date(now.getTime() - 4 * 60 * 60 * 1000);
      break;
    case '24h':
      cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  return state.dashboard.processData.filter(data => new Date(data.timestamp) >= cutoff);
};

export default store;