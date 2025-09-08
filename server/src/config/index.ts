import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'toray-monitoring-secret-key-2024',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Database configuration (for future PostgreSQL implementation)
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'toray_monitoring',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  
  // Redis configuration (for future implementation)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  
  // Real-time data simulation settings
  simulation: {
    updateInterval: parseInt(process.env.SIMULATION_INTERVAL || '5000'), // 5 seconds
    equipmentCount: parseInt(process.env.EQUIPMENT_COUNT || '20'),
    processVariation: parseFloat(process.env.PROCESS_VARIATION || '0.1') // 10% variation
  }
};