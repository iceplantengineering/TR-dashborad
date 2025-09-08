import express, { Request, Response } from 'express';
import { DataGenerator } from '@/services/dataGenerator';
import { ProcessData } from '@/types';
import logger from '@/utils/logger';

const router = express.Router();

// This would be injected in a real application
let dataGenerator: DataGenerator;

// Initialize with data generator instance
export const setDataGenerator = (generator: DataGenerator) => {
  dataGenerator = generator;
};

// Get current process status
router.get('/status', (req: Request, res: Response) => {
  try {
    const recentData = dataGenerator.getHistoricalData(1); // Last hour
    const processTypes = ['pan', 'carbon_fiber', 'prepreg', 'composite'];
    
    const status = processTypes.map(type => {
      const typeData = recentData.filter(d => d.processType === type);
      const latestData = typeData[typeData.length - 1];
      
      return {
        processType: type,
        status: latestData?.status || 'offline',
        lastUpdate: latestData?.timestamp || null,
        activeStages: [...new Set(typeData.map(d => d.stage))],
        dataPoints: typeData.length
      };
    });

    res.json({
      success: true,
      timestamp: new Date(),
      processes: status
    });

  } catch (error) {
    logger.error('Error getting process status:', error);
    res.status(500).json({ error: 'Failed to get process status' });
  }
});

// Get historical process data
router.get('/history', (req: Request, res: Response) => {
  try {
    const { hours = '24', processType, stage } = req.query;
    
    let data = dataGenerator.getHistoricalData(Number(hours));
    
    // Filter by process type if specified
    if (processType) {
      data = data.filter(d => d.processType === processType);
    }
    
    // Filter by stage if specified
    if (stage) {
      data = data.filter(d => d.stage === stage);
    }

    // Sort by timestamp
    data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    res.json({
      success: true,
      data,
      filters: { hours: Number(hours), processType, stage },
      count: data.length
    });

  } catch (error) {
    logger.error('Error getting historical data:', error);
    res.status(500).json({ error: 'Failed to get historical data' });
  }
});

// Get process analytics
router.get('/analytics', (req: Request, res: Response) => {
  try {
    const { period = '24' } = req.query;
    const data = dataGenerator.getHistoricalData(Number(period));
    
    const analytics = {
      totalDataPoints: data.length,
      processTypes: {
        pan: data.filter(d => d.processType === 'pan').length,
        carbon_fiber: data.filter(d => d.processType === 'carbon_fiber').length,
        prepreg: data.filter(d => d.processType === 'prepreg').length,
        composite: data.filter(d => d.processType === 'composite').length
      },
      statusDistribution: {
        normal: data.filter(d => d.status === 'normal').length,
        warning: data.filter(d => d.status === 'warning').length,
        critical: data.filter(d => d.status === 'critical').length,
        offline: data.filter(d => d.status === 'offline').length
      },
      qualityMetrics: {
        averageTensileStrength: calculateAverage(data, d => d.quality.tensileStrength),
        averageElasticModulus: calculateAverage(data, d => d.quality.elasticModulus),
        averageDiameter: calculateAverage(data, d => d.quality.diameter),
        defectRate: calculateDefectRate(data)
      },
      environmental: {
        averageTemperature: calculateAverage(data, d => d.environmental.temperature),
        totalCO2Emission: data.reduce((sum, d) => sum + d.environmental.co2Emission, 0),
        totalEnergyConsumption: data.reduce((sum, d) => sum + d.environmental.energyConsumption, 0),
        averageEmissions: {
          nox: calculateAverage(data, d => d.environmental.noxEmission),
          sox: calculateAverage(data, d => d.environmental.soxEmission),
          particulates: calculateAverage(data, d => d.environmental.particulates),
          voc: calculateAverage(data, d => d.environmental.vocEmission)
        }
      }
    };

    res.json({
      success: true,
      period: `${period} hours`,
      analytics
    });

  } catch (error) {
    logger.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics data' });
  }
});

// Get process parameters for a specific process type and stage
router.get('/:processType/:stage/parameters', (req: Request, res: Response) => {
  try {
    const { processType, stage } = req.params;
    const data = dataGenerator.getHistoricalData(24);
    
    const filteredData = data.filter(d => 
      d.processType === processType && d.stage === stage
    );

    if (filteredData.length === 0) {
      return res.status(404).json({ 
        error: `No data found for ${processType}/${stage}` 
      });
    }

    const latestData = filteredData[filteredData.length - 1];
    const parameters = latestData.parameters;
    
    // Calculate parameter statistics
    const parameterStats = Object.keys(parameters).reduce((stats, paramName) => {
      const values = filteredData
        .map(d => d.parameters[paramName])
        .filter(v => typeof v === 'number') as number[];
      
      if (values.length > 0) {
        stats[paramName] = {
          current: parameters[paramName],
          average: values.reduce((sum, v) => sum + v, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          standardDeviation: calculateStandardDeviation(values)
        };
      } else {
        stats[paramName] = {
          current: parameters[paramName],
          type: typeof parameters[paramName]
        };
      }
      
      return stats;
    }, {} as any);

    res.json({
      success: true,
      processType,
      stage,
      timestamp: latestData.timestamp,
      status: latestData.status,
      parameters: parameterStats,
      dataPoints: filteredData.length
    });

  } catch (error) {
    logger.error('Error getting process parameters:', error);
    res.status(500).json({ error: 'Failed to get process parameters' });
  }
});

// Submit quality inspection data
router.post('/quality-inspection', (req: Request, res: Response) => {
  try {
    const { processType, stage, batchId, inspector, measurements } = req.body;
    
    if (!processType || !stage || !batchId || !inspector || !measurements) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const inspectionRecord = {
      id: `QI-${Date.now()}`,
      timestamp: new Date(),
      processType,
      stage,
      batchId,
      inspector,
      measurements,
      status: 'completed'
    };

    // In production, save to database
    logger.info(`Quality inspection recorded:`, inspectionRecord);

    res.status(201).json({
      success: true,
      message: 'Quality inspection data recorded',
      inspection: inspectionRecord
    });

  } catch (error) {
    logger.error('Error recording quality inspection:', error);
    res.status(500).json({ error: 'Failed to record quality inspection' });
  }
});

// Process control endpoint
router.post('/control', (req: Request, res: Response) => {
  try {
    const { processType, stage, action, parameters, reason } = req.body;
    
    if (!processType || !action) {
      return res.status(400).json({ error: 'Process type and action are required' });
    }

    const controlAction = {
      id: `PC-${Date.now()}`,
      timestamp: new Date(),
      processType,
      stage,
      action,
      parameters: parameters || {},
      reason: reason || 'Manual adjustment',
      operator: 'demo-user' // In production, get from authenticated user
    };

    // In production, this would interface with process control systems
    logger.info(`Process control action executed:`, controlAction);

    res.json({
      success: true,
      message: 'Process control action executed',
      action: controlAction
    });

  } catch (error) {
    logger.error('Error executing process control:', error);
    res.status(500).json({ error: 'Failed to execute process control' });
  }
});

// Utility functions
const calculateAverage = (data: ProcessData[], getValue: (d: ProcessData) => number | undefined): number => {
  const values = data.map(getValue).filter((v): v is number => v !== undefined);
  return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
};

const calculateStandardDeviation = (values: number[]): number => {
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / squaredDiffs.length;
  return Math.sqrt(avgSquaredDiff);
};

const calculateDefectRate = (data: ProcessData[]): number => {
  const qualityData = data.filter(d => d.quality.defectCount !== undefined);
  if (qualityData.length === 0) return 0;
  
  const totalDefects = qualityData.reduce((sum, d) => sum + (d.quality.defectCount || 0), 0);
  return (totalDefects / qualityData.length) * 100;
};

export default router;