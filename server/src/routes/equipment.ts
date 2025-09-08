import express, { Request, Response } from 'express';
import { DataGenerator } from '@/services/dataGenerator';
import logger from '@/utils/logger';

const router = express.Router();

let dataGenerator: DataGenerator;

export const setDataGenerator = (generator: DataGenerator) => {
  dataGenerator = generator;
};

// Get all equipment status
router.get('/status', (req: Request, res: Response) => {
  try {
    const equipment = dataGenerator.getEquipmentList();
    
    const statusSummary = {
      total: equipment.length,
      operational: equipment.filter(eq => eq.status === 'operational').length,
      maintenance: equipment.filter(eq => eq.status === 'maintenance').length,
      offline: equipment.filter(eq => eq.status === 'offline').length,
      error: equipment.filter(eq => eq.status === 'error').length
    };

    res.json({
      success: true,
      timestamp: new Date(),
      summary: statusSummary,
      equipment
    });

  } catch (error) {
    logger.error('Error getting equipment status:', error);
    res.status(500).json({ error: 'Failed to get equipment status' });
  }
});

// Get specific equipment details
router.get('/:equipmentId', (req: Request, res: Response) => {
  try {
    const { equipmentId } = req.params;
    const equipment = dataGenerator.getEquipmentList();
    
    const targetEquipment = equipment.find(eq => eq.id === equipmentId);
    
    if (!targetEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Get recent performance data (in production, this would come from historical database)
    const performanceHistory = generatePerformanceHistory(equipmentId);

    res.json({
      success: true,
      equipment: targetEquipment,
      performance: performanceHistory,
      maintenanceSchedule: {
        lastMaintenance: targetEquipment.lastMaintenance,
        nextMaintenance: targetEquipment.nextMaintenance,
        maintenanceType: getMaintenanceType(targetEquipment.type),
        estimatedDuration: getEstimatedMaintenanceDuration(targetEquipment.type)
      }
    });

  } catch (error) {
    logger.error('Error getting equipment details:', error);
    res.status(500).json({ error: 'Failed to get equipment details' });
  }
});

// Get equipment efficiency analytics
router.get('/analytics/efficiency', (req: Request, res: Response) => {
  try {
    const { period = '7' } = req.query; // days
    const equipment = dataGenerator.getEquipmentList();
    
    const efficiencyAnalytics = equipment.map(eq => ({
      id: eq.id,
      name: eq.name,
      type: eq.type,
      currentEfficiency: eq.efficiency,
      targetEfficiency: 90,
      trend: generateEfficiencyTrend(eq.id, Number(period)),
      utilizationRate: calculateUtilizationRate(eq),
      performanceIndex: calculatePerformanceIndex(eq)
    }));

    const summary = {
      averageEfficiency: efficiencyAnalytics.reduce((sum, eq) => sum + eq.currentEfficiency, 0) / equipment.length,
      bestPerformer: efficiencyAnalytics.reduce((best, current) => 
        current.currentEfficiency > best.currentEfficiency ? current : best
      ),
      improvementOpportunities: efficiencyAnalytics.filter(eq => eq.currentEfficiency < eq.targetEfficiency)
    };

    res.json({
      success: true,
      period: `${period} days`,
      summary,
      equipment: efficiencyAnalytics
    });

  } catch (error) {
    logger.error('Error getting efficiency analytics:', error);
    res.status(500).json({ error: 'Failed to get efficiency analytics' });
  }
});

// Schedule maintenance
router.post('/:equipmentId/maintenance', (req: Request, res: Response) => {
  try {
    const { equipmentId } = req.params;
    const { scheduledDate, maintenanceType, duration, technician, notes } = req.body;
    
    const equipment = dataGenerator.getEquipmentList();
    const targetEquipment = equipment.find(eq => eq.id === equipmentId);
    
    if (!targetEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const maintenanceSchedule = {
      id: `MAINT-${equipmentId}-${Date.now()}`,
      equipmentId,
      scheduledDate: new Date(scheduledDate),
      maintenanceType: maintenanceType || 'preventive',
      estimatedDuration: duration || getEstimatedMaintenanceDuration(targetEquipment.type),
      technician: technician || 'TBD',
      notes: notes || '',
      status: 'scheduled',
      createdAt: new Date(),
      createdBy: 'demo-user' // In production, get from authenticated user
    };

    // In production, save to database
    logger.info(`Maintenance scheduled for equipment ${equipmentId}:`, maintenanceSchedule);

    res.status(201).json({
      success: true,
      message: 'Maintenance scheduled successfully',
      maintenance: maintenanceSchedule
    });

  } catch (error) {
    logger.error('Error scheduling maintenance:', error);
    res.status(500).json({ error: 'Failed to schedule maintenance' });
  }
});

// Update equipment status
router.patch('/:equipmentId/status', (req: Request, res: Response) => {
  try {
    const { equipmentId } = req.params;
    const { status, reason } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['operational', 'maintenance', 'offline', 'error'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const statusUpdate = {
      equipmentId,
      previousStatus: 'operational', // In production, get from current state
      newStatus: status,
      reason: reason || 'Manual update',
      timestamp: new Date(),
      updatedBy: 'demo-user' // In production, get from authenticated user
    };

    // In production, update database and notify relevant systems
    logger.info(`Equipment ${equipmentId} status updated:`, statusUpdate);

    res.json({
      success: true,
      message: 'Equipment status updated',
      update: statusUpdate
    });

  } catch (error) {
    logger.error('Error updating equipment status:', error);
    res.status(500).json({ error: 'Failed to update equipment status' });
  }
});

// Get maintenance history
router.get('/:equipmentId/maintenance/history', (req: Request, res: Response) => {
  try {
    const { equipmentId } = req.params;
    const { limit = '10' } = req.query;
    
    // In production, query from database
    const maintenanceHistory = generateMaintenanceHistory(equipmentId, Number(limit));

    res.json({
      success: true,
      equipmentId,
      history: maintenanceHistory,
      count: maintenanceHistory.length
    });

  } catch (error) {
    logger.error('Error getting maintenance history:', error);
    res.status(500).json({ error: 'Failed to get maintenance history' });
  }
});

// Get equipment OEE (Overall Equipment Effectiveness)
router.get('/:equipmentId/oee', (req: Request, res: Response) => {
  try {
    const { equipmentId } = req.params;
    const { period = '24' } = req.query; // hours
    
    const equipment = dataGenerator.getEquipmentList();
    const targetEquipment = equipment.find(eq => eq.id === equipmentId);
    
    if (!targetEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const oeeData = calculateOEE(targetEquipment, Number(period));

    res.json({
      success: true,
      equipmentId,
      period: `${period} hours`,
      oee: oeeData
    });

  } catch (error) {
    logger.error('Error calculating OEE:', error);
    res.status(500).json({ error: 'Failed to calculate OEE' });
  }
});

// Utility functions
const generatePerformanceHistory = (equipmentId: string) => {
  const history = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    history.push({
      timestamp,
      efficiency: 85 + Math.random() * 15,
      throughput: 100 + Math.random() * 50,
      energyConsumption: 80 + Math.random() * 40,
      uptime: Math.random() > 0.1 ? 100 : 0
    });
  }
  
  return history;
};

const getMaintenanceType = (equipmentType: string): string => {
  const maintenanceTypes = {
    'polymerization_reactor': 'Chemical cleaning and catalyst replacement',
    'spinning_machine': 'Spindle maintenance and tension calibration',
    'stabilization_oven': 'Temperature profile calibration',
    'carbonization_furnace': 'Heating element inspection',
    'autoclave': 'Pressure system check and seal replacement'
  };
  
  return maintenanceTypes[equipmentType as keyof typeof maintenanceTypes] || 'General maintenance';
};

const getEstimatedMaintenanceDuration = (equipmentType: string): number => {
  const durations = {
    'polymerization_reactor': 8,
    'spinning_machine': 4,
    'stabilization_oven': 6,
    'carbonization_furnace': 12,
    'autoclave': 10
  };
  
  return durations[equipmentType as keyof typeof durations] || 6;
};

const generateEfficiencyTrend = (equipmentId: string, days: number) => {
  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    trend.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      efficiency: 85 + Math.random() * 15
    });
  }
  return trend;
};

const calculateUtilizationRate = (equipment: any): number => {
  // In production, calculate based on actual operating time vs available time
  return equipment.status === 'operational' ? 85 + Math.random() * 15 : 0;
};

const calculatePerformanceIndex = (equipment: any): number => {
  // Composite score based on efficiency, uptime, and quality
  const efficiency = equipment.efficiency;
  const uptime = equipment.status === 'operational' ? 95 : 0;
  const quality = 98 + Math.random() * 2;
  
  return (efficiency * 0.4 + uptime * 0.4 + quality * 0.2) / 100;
};

const generateMaintenanceHistory = (equipmentId: string, limit: number) => {
  const history = [];
  
  for (let i = 0; i < limit; i++) {
    const daysAgo = (i + 1) * 30 + Math.random() * 30;
    history.push({
      id: `MAINT-${equipmentId}-${i + 1}`,
      date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      type: ['preventive', 'corrective', 'predictive'][Math.floor(Math.random() * 3)],
      duration: 4 + Math.random() * 8,
      technician: `Tech-${Math.floor(Math.random() * 5) + 1}`,
      cost: 1000 + Math.random() * 5000,
      description: 'Routine maintenance and inspection',
      status: 'completed'
    });
  }
  
  return history.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const calculateOEE = (equipment: any, hours: number) => {
  // OEE = Availability × Performance × Quality
  const availability = equipment.status === 'operational' ? 0.95 : 0;
  const performance = equipment.efficiency / 100;
  const quality = 0.98;
  
  const oee = availability * performance * quality;
  
  return {
    overall: oee * 100,
    availability: availability * 100,
    performance: performance * 100,
    quality: quality * 100,
    targetOEE: 85,
    improvement: {
      availability: Math.max(0, 100 - availability * 100),
      performance: Math.max(0, 100 - performance * 100),
      quality: Math.max(0, 100 - quality * 100)
    }
  };
};

export default router;