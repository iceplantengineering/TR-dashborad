import { io, Socket } from 'socket.io-client';
import { ProcessData, Equipment, Alert, KPIData } from '@/types';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  // Event listeners
  private listeners: {
    [event: string]: ((data: any) => void)[];
  } = {};

  connect(url: string = 'http://localhost:5000'): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(url, {
      transports: ['websocket'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.authenticate();
      this.emit('connected', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.emit('disconnected', { reason });
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('error', { error: error.message });
      this.attemptReconnect();
    });

    // Authentication
    this.socket.on('authenticated', (data) => {
      console.log('WebSocket authenticated:', data);
      this.emit('authenticated', data);
      
      if (data.success) {
        // Subscribe to default channels
        this.subscribeToAlerts();
        this.subscribeToAllProcesses();
      }
    });

    // Real-time data events
    this.socket.on('processData', (data: ProcessData[]) => {
      this.emit('processData', data);
    });

    this.socket.on('equipmentStatus', (data: Equipment[]) => {
      this.emit('equipmentStatus', data);
    });

    this.socket.on('newAlert', (data: Alert) => {
      this.emit('newAlert', data);
    });

    this.socket.on('kpiUpdate', (data: KPIData) => {
      this.emit('kpiUpdate', data);
    });

    // Alert events
    this.socket.on('alertAcknowledged', (data) => {
      this.emit('alertAcknowledged', data);
    });

    // Process control events
    this.socket.on('processControlUpdate', (data) => {
      this.emit('processControlUpdate', data);
    });

    this.socket.on('processControlResult', (data) => {
      this.emit('processControlResult', data);
    });

    // Maintenance events
    this.socket.on('maintenanceRequestReceived', (data) => {
      this.emit('maintenanceRequestReceived', data);
    });

    this.socket.on('maintenanceRequestConfirmed', (data) => {
      this.emit('maintenanceRequestConfirmed', data);
    });

    // Quality events
    this.socket.on('qualityDataReceived', (data) => {
      this.emit('qualityDataReceived', data);
    });

    // Periodic reports
    this.socket.on('periodicReport', (data) => {
      this.emit('periodicReport', data);
    });

    // User events
    this.socket.on('userStatusUpdate', (data) => {
      this.emit('userStatusUpdate', data);
    });

    this.socket.on('userDisconnected', (data) => {
      this.emit('userDisconnected', data);
    });

    // Server messages
    this.socket.on('welcome', (data) => {
      console.log('Welcome message:', data.message);
      this.emit('welcome', data);
    });

    // Historical data
    this.socket.on('historicalData', (data) => {
      this.emit('historicalData', data);
    });

    // Subscription confirmations
    this.socket.on('subscriptionConfirmed', (data) => {
      console.log('Subscription confirmed:', data);
    });

    // Generic error handler
    this.socket.on('error', (data) => {
      console.error('WebSocket error:', data);
      this.emit('error', data);
    });

    // Heartbeat
    this.socket.on('pong', () => {
      this.emit('pong', {});
    });
  }

  private authenticate(): void {
    const token = localStorage.getItem('authToken');
    if (token && this.socket) {
      this.socket.emit('authenticate', token);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached', {});
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.socket?.connected) {
        this.socket?.connect();
      }
    }, this.reconnectInterval);
  }

  // Subscription methods
  subscribeToProcess(processType: string): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribeToProcess', processType);
    }
  }

  unsubscribeFromProcess(processType: string): void {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribeFromProcess', processType);
    }
  }

  subscribeToAllProcesses(): void {
    const processTypes = ['pan', 'carbon_fiber', 'prepreg', 'composite'];
    processTypes.forEach(type => this.subscribeToProcess(type));
  }

  subscribeToEquipment(equipmentId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribeToEquipment', equipmentId);
    }
  }

  subscribeToAlerts(severity?: string): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribeToAlerts', severity);
    }
  }

  // Control methods
  acknowledgeAlert(alertId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('acknowledgeAlert', alertId);
    }
  }

  sendProcessControl(command: {
    processType: string;
    stage?: string;
    action: string;
    parameters?: any;
    reason?: string;
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('processControl', command);
    }
  }

  scheduleMaintenanceRequest(data: {
    equipmentId: string;
    scheduledDate: string;
    maintenanceType: string;
    priority: string;
    notes?: string;
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('scheduleMaintenanceRequest', data);
    }
  }

  submitQualityInspection(data: {
    processType: string;
    stage: string;
    batchId: string;
    measurements: any;
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('qualityInspectionResult', data);
    }
  }

  updateUserStatus(status: string): void {
    if (this.socket?.connected) {
      this.socket.emit('updateUserStatus', status);
    }
  }

  requestHistoricalData(params: {
    requestId: string;
    processType?: string;
    startDate: string;
    endDate: string;
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('requestHistoricalData', params);
    }
  }

  // Utility methods
  sendHeartbeat(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners = {};
  }

  // Event listener management
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!this.listeners[event]) return;
    
    if (callback) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    } else {
      this.listeners[event] = [];
    }
  }

  private emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Start periodic heartbeat
  startHeartbeat(interval: number = 30000): void {
    setInterval(() => {
      if (this.isConnected()) {
        this.sendHeartbeat();
      }
    }, interval);
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;