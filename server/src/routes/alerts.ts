import express, { Request, Response } from 'express';
import { DataGenerator } from '@/services/dataGenerator';
import logger from '@/utils/logger';

const router = express.Router();

let dataGenerator: DataGenerator;

export const setDataGenerator = (generator: DataGenerator) => {
  dataGenerator = generator;
};

// Get all alerts
router.get('/', (req: Request, res: Response) => {
  try {
    const { severity, type, acknowledged, limit = '50' } = req.query;
    
    let alerts = dataGenerator.getAlerts();
    
    // Filter by severity
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    // Filter by type
    if (type) {
      alerts = alerts.filter(alert => alert.type === type);
    }
    
    // Filter by acknowledgment status
    if (acknowledged !== undefined) {
      const isAcknowledged = acknowledged === 'true';
      alerts = alerts.filter(alert => alert.acknowledged === isAcknowledged);
    }
    
    // Sort by timestamp (newest first)
    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Limit results
    alerts = alerts.slice(0, Number(limit));
    
    const summary = {
      total: alerts.length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      },
      byType: {
        quality: alerts.filter(a => a.type === 'quality').length,
        environmental: alerts.filter(a => a.type === 'environmental').length,
        equipment: alerts.filter(a => a.type === 'equipment').length,
        safety: alerts.filter(a => a.type === 'safety').length
      }
    };

    res.json({
      success: true,
      summary,
      alerts,
      filters: { severity, type, acknowledged, limit: Number(limit) }
    });

  } catch (error) {
    logger.error('Error getting alerts:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

// Get alert statistics
router.get('/statistics', (req: Request, res: Response) => {
  try {
    const { period = '24' } = req.query; // hours
    const cutoff = new Date(Date.now() - Number(period) * 60 * 60 * 1000);
    
    const alerts = dataGenerator.getAlerts();
    const periodAlerts = alerts.filter(alert => new Date(alert.timestamp) >= cutoff);
    
    const statistics = {
      period: `${period} hours`,
      total: periodAlerts.length,
      acknowledged: periodAlerts.filter(a => a.acknowledged).length,
      unacknowledged: periodAlerts.filter(a => !a.acknowledged).length,
      
      severityBreakdown: {
        critical: periodAlerts.filter(a => a.severity === 'critical').length,
        high: periodAlerts.filter(a => a.severity === 'high').length,
        medium: periodAlerts.filter(a => a.severity === 'medium').length,
        low: periodAlerts.filter(a => a.severity === 'low').length
      },
      
      typeBreakdown: {
        quality: periodAlerts.filter(a => a.type === 'quality').length,
        environmental: periodAlerts.filter(a => a.type === 'environmental').length,
        equipment: periodAlerts.filter(a => a.type === 'equipment').length,
        safety: periodAlerts.filter(a => a.type === 'safety').length
      },
      
      resolutionTime: {
        average: calculateAverageResolutionTime(periodAlerts),
        fastest: calculateFastestResolution(periodAlerts),
        slowest: calculateSlowestResolution(periodAlerts)
      },
      
      topSources: getTopAlertSources(periodAlerts),
      
      trends: calculateAlertTrends(alerts, Number(period))
    };

    res.json({
      success: true,
      timestamp: new Date(),
      statistics
    });

  } catch (error) {
    logger.error('Error getting alert statistics:', error);
    res.status(500).json({ error: 'Failed to get alert statistics' });
  }
});

// Acknowledge alert
router.post('/:alertId/acknowledge', (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { userId = 'demo-user', notes } = req.body;
    
    const alerts = dataGenerator.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    if (alert.acknowledged) {
      return res.status(400).json({ error: 'Alert already acknowledged' });
    }

    // Update alert (in production, this would update the database)
    alert.acknowledged = true;
    alert.resolvedAt = new Date();
    
    const acknowledgment = {
      alertId,
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
      notes: notes || '',
      originalSeverity: alert.severity,
      originalType: alert.type
    };

    logger.info(`Alert ${alertId} acknowledged by ${userId}`);

    res.json({
      success: true,
      message: 'Alert acknowledged',
      acknowledgment
    });

  } catch (error) {
    logger.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Bulk acknowledge alerts
router.post('/acknowledge-bulk', (req: Request, res: Response) => {
  try {
    const { alertIds, userId = 'demo-user', notes } = req.body;
    
    if (!alertIds || !Array.isArray(alertIds)) {
      return res.status(400).json({ error: 'alertIds array is required' });
    }

    const alerts = dataGenerator.getAlerts();
    const acknowledgments = [];
    
    for (const alertId of alertIds) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert && !alert.acknowledged) {
        alert.acknowledged = true;
        alert.resolvedAt = new Date();
        
        acknowledgments.push({
          alertId,
          acknowledgedBy: userId,
          acknowledgedAt: new Date(),
          notes: notes || ''
        });
      }
    }

    logger.info(`${acknowledgments.length} alerts acknowledged by ${userId}`);

    res.json({
      success: true,
      message: `${acknowledgments.length} alerts acknowledged`,
      acknowledgments
    });

  } catch (error) {
    logger.error('Error bulk acknowledging alerts:', error);
    res.status(500).json({ error: 'Failed to acknowledge alerts' });
  }
});

// Create custom alert
router.post('/', (req: Request, res: Response) => {
  try {
    const { type, severity, message, source, userId = 'demo-user' } = req.body;
    
    if (!type || !severity || !message || !source) {
      return res.status(400).json({ 
        error: 'type, severity, message, and source are required' 
      });
    }

    const validTypes = ['quality', 'environmental', 'equipment', 'safety'];
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
      });
    }
    
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ 
        error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` 
      });
    }

    const customAlert = {
      id: `CUSTOM-${Date.now()}`,
      type,
      severity,
      message,
      source,
      timestamp: new Date(),
      acknowledged: false,
      createdBy: userId,
      isCustom: true
    };

    // In production, save to database and broadcast via WebSocket
    logger.info(`Custom alert created by ${userId}:`, customAlert);

    res.status(201).json({
      success: true,
      message: 'Custom alert created',
      alert: customAlert
    });

  } catch (error) {
    logger.error('Error creating custom alert:', error);
    res.status(500).json({ error: 'Failed to create custom alert' });
  }
});

// Get alert details
router.get('/:alertId', (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const alerts = dataGenerator.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Get related equipment information
    const equipment = dataGenerator.getEquipmentList();
    const relatedEquipment = equipment.find(eq => eq.id === alert.source);
    
    // Get similar alerts (same source, within last 24 hours)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const similarAlerts = alerts.filter(a => 
      a.source === alert.source && 
      a.id !== alert.id &&
      new Date(a.timestamp) >= cutoff
    );

    const alertDetails = {
      ...alert,
      relatedEquipment,
      similarAlerts: similarAlerts.slice(0, 5), // Last 5 similar alerts
      resolutionTime: alert.resolvedAt ? 
        new Date(alert.resolvedAt).getTime() - new Date(alert.timestamp).getTime() : null
    };

    res.json({
      success: true,
      alert: alertDetails
    });

  } catch (error) {
    logger.error('Error getting alert details:', error);
    res.status(500).json({ error: 'Failed to get alert details' });
  }
});

// Utility functions
const calculateAverageResolutionTime = (alerts: any[]): number => {
  const resolvedAlerts = alerts.filter(a => a.resolvedAt);
  if (resolvedAlerts.length === 0) return 0;
  
  const totalTime = resolvedAlerts.reduce((sum, alert) => {
    return sum + (new Date(alert.resolvedAt).getTime() - new Date(alert.timestamp).getTime());
  }, 0);
  
  return Math.round(totalTime / resolvedAlerts.length / (1000 * 60)); // Return in minutes
};

const calculateFastestResolution = (alerts: any[]): number => {
  const resolvedAlerts = alerts.filter(a => a.resolvedAt);
  if (resolvedAlerts.length === 0) return 0;
  
  const resolutionTimes = resolvedAlerts.map(alert => 
    new Date(alert.resolvedAt).getTime() - new Date(alert.timestamp).getTime()
  );
  
  return Math.round(Math.min(...resolutionTimes) / (1000 * 60)); // Return in minutes
};

const calculateSlowestResolution = (alerts: any[]): number => {
  const resolvedAlerts = alerts.filter(a => a.resolvedAt);
  if (resolvedAlerts.length === 0) return 0;
  
  const resolutionTimes = resolvedAlerts.map(alert => 
    new Date(alert.resolvedAt).getTime() - new Date(alert.timestamp).getTime()
  );
  
  return Math.round(Math.max(...resolutionTimes) / (1000 * 60)); // Return in minutes
};

const getTopAlertSources = (alerts: any[], limit = 5) => {
  const sourceCounts: { [key: string]: number } = {};
  
  alerts.forEach(alert => {
    sourceCounts[alert.source] = (sourceCounts[alert.source] || 0) + 1;
  });
  
  return Object.entries(sourceCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([source, count]) => ({ source, count }));
};

const calculateAlertTrends = (allAlerts: any[], hours: number) => {
  const hourlyData = [];
  
  for (let i = hours - 1; i >= 0; i--) {
    const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
    
    const hourAlerts = allAlerts.filter(alert => {
      const alertTime = new Date(alert.timestamp);
      return alertTime >= hourStart && alertTime < hourEnd;
    });
    
    hourlyData.push({
      hour: hourStart.toISOString(),
      total: hourAlerts.length,
      critical: hourAlerts.filter(a => a.severity === 'critical').length,
      high: hourAlerts.filter(a => a.severity === 'high').length,
      medium: hourAlerts.filter(a => a.severity === 'medium').length,
      low: hourAlerts.filter(a => a.severity === 'low').length
    });
  }
  
  return hourlyData;
};

export default router;