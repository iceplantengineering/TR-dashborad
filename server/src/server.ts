import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from '@/config';
import logger from '@/utils/logger';
import { setupSocketHandlers } from '@/websockets';
import { DataGenerator } from '@/services/dataGenerator';

// Import routes
import authRoutes from '@/routes/auth';
import processRoutes, { setDataGenerator as setProcessDataGenerator } from '@/routes/process';
import equipmentRoutes, { setDataGenerator as setEquipmentDataGenerator } from '@/routes/equipment';
import alertsRoutes, { setDataGenerator as setAlertsDataGenerator } from '@/routes/alerts';
import reportsRoutes, { setDataGenerator as setReportsDataGenerator } from '@/routes/reports';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/process', processRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/reports', reportsRoutes);

// WebSocket setup
setupSocketHandlers(io);

// Initialize data generator
const dataGenerator = new DataGenerator(io);

// Set data generator for routes
setProcessDataGenerator(dataGenerator);
setEquipmentDataGenerator(dataGenerator);
setAlertsDataGenerator(dataGenerator);
setReportsDataGenerator(dataGenerator);

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Starting graceful shutdown...');
  dataGenerator.stop();
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
server.listen(config.port, () => {
  logger.info(`🚀 Toray Monitoring Server running on port ${config.port}`);
  logger.info(`📊 Dashboard available at ${config.corsOrigin}`);
  logger.info(`🔧 Environment: ${config.nodeEnv}`);
  
  // Start data generation
  dataGenerator.start();
});

export { app, io };