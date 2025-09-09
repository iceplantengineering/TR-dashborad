import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import '@/i18n';
import { store } from '@/store';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { authActions, webSocketActions, dashboardActions, uiActions, selectAuth, selectUI } from '@/store';
import webSocketService from '@/services/websocket';

// Import components
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ProcessMonitoring from '@/pages/ProcessMonitoring';
import EquipmentStatus from '@/pages/EquipmentStatus';
import QualityManagement from '@/pages/QualityManagement';
import EnvironmentalDashboard from '@/pages/EnvironmentalDashboard';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import NotificationManager from '@/components/NotificationManager';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector(selectAuth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Main App content
const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const { theme: uiTheme } = useAppSelector(selectUI);

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      dispatch(uiActions.setTheme(savedTheme));
    }

    // Initialize language from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (window as any).i18n) {
      (window as any).i18n.changeLanguage(savedLanguage);
    }

    // Initialize user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser && !user) {
      try {
        const parsedUser = JSON.parse(savedUser);
        dispatch(authActions.updateUser(parsedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (isAuthenticated) {
      // Connect to WebSocket when authenticated
      webSocketService.connect();
      
      // Set up WebSocket event listeners
      const handleWebSocketConnected = () => {
        dispatch(webSocketActions.setConnected(true));
        dispatch(uiActions.addNotification({
          type: 'success',
          message: 'Connected to real-time monitoring system',
          duration: 3000,
        }));
      };

      const handleWebSocketDisconnected = () => {
        dispatch(webSocketActions.setConnected(false));
        dispatch(uiActions.addNotification({
          type: 'warning',
          message: 'Disconnected from real-time monitoring system',
          duration: 5000,
        }));
      };

      const handleWebSocketAuthenticated = (data: any) => {
        dispatch(webSocketActions.setAuthenticated(data.success));
        if (data.success) {
          webSocketService.startHeartbeat();
        }
      };

      const handleWebSocketError = (error: any) => {
        dispatch(webSocketActions.setError(error.message || 'WebSocket connection error'));
        dispatch(uiActions.addNotification({
          type: 'error',
          message: `Connection error: ${error.message || 'Unknown error'}`,
          duration: 5000,
        }));
      };

      const handleProcessData = (data: any) => {
        console.log('WebSocket received processData:', data);
        console.log('processData array length:', data?.length);
        console.log('Dispatching addProcessData to Redux store...');
        dispatch(dashboardActions.addProcessData(data));
        console.log('addProcessData dispatched successfully');
      };

      const handleEquipmentStatus = (data: any) => {
        console.log('WebSocket received equipmentStatus:', data);
        console.log('equipment array length:', data?.length);
        dispatch(dashboardActions.setEquipment(data));
      };

      const handleNewAlert = (data: any) => {
        dispatch(dashboardActions.addAlert(data));
        dispatch(uiActions.addNotification({
          type: data.severity === 'critical' ? 'error' : 'warning',
          message: `New ${data.severity} alert: ${data.message}`,
          duration: data.severity === 'critical' ? 10000 : 5000,
        }));
      };

      const handleKPIUpdate = (data: any) => {
        console.log('WebSocket received kpiUpdate:', data);
        dispatch(dashboardActions.setKPIs(data));
      };

      const handleAlertAcknowledged = (data: any) => {
        dispatch(dashboardActions.acknowledgeAlert(data.alertId));
      };

      // Register event listeners
      webSocketService.on('connected', handleWebSocketConnected);
      webSocketService.on('disconnected', handleWebSocketDisconnected);
      webSocketService.on('authenticated', handleWebSocketAuthenticated);
      webSocketService.on('error', handleWebSocketError);
      webSocketService.on('processData', handleProcessData);
      webSocketService.on('equipmentStatus', handleEquipmentStatus);
      webSocketService.on('newAlert', handleNewAlert);
      webSocketService.on('kpiUpdate', handleKPIUpdate);
      webSocketService.on('alertAcknowledged', handleAlertAcknowledged);

      // Cleanup function
      return () => {
        webSocketService.off('connected', handleWebSocketConnected);
        webSocketService.off('disconnected', handleWebSocketDisconnected);
        webSocketService.off('authenticated', handleWebSocketAuthenticated);
        webSocketService.off('error', handleWebSocketError);
        webSocketService.off('processData', handleProcessData);
        webSocketService.off('equipmentStatus', handleEquipmentStatus);
        webSocketService.off('newAlert', handleNewAlert);
        webSocketService.off('kpiUpdate', handleKPIUpdate);
        webSocketService.off('alertAcknowledged', handleAlertAcknowledged);
      };
    } else {
      // Disconnect WebSocket when not authenticated
      webSocketService.disconnect();
    }
  }, [isAuthenticated, dispatch]);

  const themeConfig = {
    algorithm: uiTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      colorBgContainer: uiTheme === 'dark' ? '#141414' : '#ffffff',
    },
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <AntdApp>
        <Router>
          <Routes>
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/process-monitoring"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProcessMonitoring />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipment"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EquipmentStatus />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quality"
              element={
                <ProtectedRoute>
                  <Layout>
                    <QualityManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/environmental"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EnvironmentalDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <NotificationManager />
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
};

// Root App component with Redux Provider
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;