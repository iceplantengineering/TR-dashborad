import { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '@/utils/logger';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const setupSocketHandlers = (io: SocketIOServer): void => {
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Authentication handler
    socket.on('authenticate', (token: string) => {
      try {
        // In a real implementation, verify JWT token here
        // For demo purposes, we'll accept any token
        socket.userId = 'demo-user';
        socket.userRole = 'operator';
        
        socket.emit('authenticated', { 
          success: true, 
          message: 'Successfully authenticated' 
        });
        
        // Join role-based room
        socket.join(`role:${socket.userRole}`);
        logger.info(`Client ${socket.id} authenticated as ${socket.userRole}`);
      } catch (error) {
        socket.emit('authenticated', { 
          success: false, 
          message: 'Authentication failed' 
        });
        logger.error(`Authentication failed for client ${socket.id}:`, error);
      }
    });

    // Subscribe to specific process types
    socket.on('subscribeToProcess', (processType: string) => {
      socket.join(`process:${processType}`);
      logger.info(`Client ${socket.id} subscribed to process: ${processType}`);
      
      socket.emit('subscriptionConfirmed', { processType });
    });

    // Unsubscribe from process types
    socket.on('unsubscribeFromProcess', (processType: string) => {
      socket.leave(`process:${processType}`);
      logger.info(`Client ${socket.id} unsubscribed from process: ${processType}`);
    });

    // Subscribe to equipment updates
    socket.on('subscribeToEquipment', (equipmentId: string) => {
      socket.join(`equipment:${equipmentId}`);
      logger.info(`Client ${socket.id} subscribed to equipment: ${equipmentId}`);
    });

    // Subscribe to alerts
    socket.on('subscribeToAlerts', (severity?: string) => {
      const room = severity ? `alerts:${severity}` : 'alerts:all';
      socket.join(room);
      logger.info(`Client ${socket.id} subscribed to alerts: ${room}`);
    });

    // Handle alert acknowledgment
    socket.on('acknowledgeAlert', (alertId: string) => {
      logger.info(`Alert ${alertId} acknowledged by client ${socket.id}`);
      
      // Broadcast to all clients that alert was acknowledged
      io.emit('alertAcknowledged', { 
        alertId, 
        acknowledgedBy: socket.userId,
        timestamp: new Date() 
      });
    });

    // Handle process control commands (for authorized users only)
    socket.on('processControl', (command) => {
      if (socket.userRole !== 'operator' && socket.userRole !== 'production_manager') {
        socket.emit('error', { message: 'Insufficient permissions for process control' });
        return;
      }

      logger.info(`Process control command from ${socket.id}:`, command);
      
      // In a real implementation, this would interface with actual process control systems
      socket.emit('processControlResult', { 
        command, 
        status: 'executed', 
        timestamp: new Date() 
      });

      // Broadcast to relevant subscribers
      io.to(`process:${command.processType}`).emit('processControlUpdate', {
        command,
        executedBy: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle equipment maintenance requests
    socket.on('scheduleMaintenanceRequest', (data) => {
      logger.info(`Maintenance request from ${socket.id}:`, data);
      
      // Broadcast to maintenance team
      io.to('role:maintenance').emit('maintenanceRequestReceived', {
        ...data,
        requestedBy: socket.userId,
        timestamp: new Date()
      });

      socket.emit('maintenanceRequestConfirmed', { 
        requestId: data.equipmentId + '_' + Date.now(),
        message: 'Maintenance request submitted successfully' 
      });
    });

    // Handle quality inspection results
    socket.on('qualityInspectionResult', (data) => {
      if (socket.userRole !== 'quality_manager' && socket.userRole !== 'operator') {
        socket.emit('error', { message: 'Insufficient permissions for quality data submission' });
        return;
      }

      logger.info(`Quality inspection result from ${socket.id}:`, data);
      
      // Broadcast to relevant stakeholders
      io.to('role:quality_manager').emit('qualityDataReceived', {
        ...data,
        inspector: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle client heartbeat
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Handle client requesting historical data
    socket.on('requestHistoricalData', (params) => {
      logger.info(`Historical data request from ${socket.id}:`, params);
      
      // In a real implementation, query database for historical data
      // For demo, we'll emit a placeholder response
      socket.emit('historicalData', {
        requestId: params.requestId,
        data: [],
        message: 'Historical data feature will be implemented with database integration'
      });
    });

    // Handle user status updates
    socket.on('updateUserStatus', (status) => {
      logger.info(`User status update from ${socket.id}: ${status}`);
      
      // Broadcast user status to supervisors
      io.to('role:production_manager').emit('userStatusUpdate', {
        userId: socket.userId,
        status,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Client ${socket.id} disconnected: ${reason}`);
      
      // Clean up any user-specific data or notify relevant parties
      if (socket.userId) {
        io.to('role:production_manager').emit('userDisconnected', {
          userId: socket.userId,
          lastSeen: new Date()
        });
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error(`Socket error for client ${socket.id}:`, error);
    });

    // Welcome message
    socket.emit('welcome', {
      message: 'Connected to Toray Manufacturing Monitoring System',
      timestamp: new Date(),
      serverVersion: '1.0.0'
    });
  });

  // Handle server-level events
  io.engine.on('connection_error', (err) => {
    logger.error('WebSocket connection error:', err);
  });

  logger.info('WebSocket handlers initialized');
};

// Utility functions for broadcasting to specific groups
export const broadcastToRole = (io: SocketIOServer, role: string, event: string, data: any) => {
  io.to(`role:${role}`).emit(event, data);
};

export const broadcastToProcess = (io: SocketIOServer, processType: string, event: string, data: any) => {
  io.to(`process:${processType}`).emit(event, data);
};

export const broadcastToEquipment = (io: SocketIOServer, equipmentId: string, event: string, data: any) => {
  io.to(`equipment:${equipmentId}`).emit(event, data);
};