import express, { Request, Response } from 'express';
import { DataGenerator } from '@/services/dataGenerator';
import logger from '@/utils/logger';
import { format } from 'date-fns';

const router = express.Router();

let dataGenerator: DataGenerator;

export const setDataGenerator = (generator: DataGenerator) => {
  dataGenerator = generator;
};

// Generate production summary report
router.get('/production-summary', (req: Request, res: Response) => {
  try {
    const { startDate, endDate, processType } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    const historicalData = dataGenerator.getHistoricalData(24);
    let filteredData = historicalData.filter(d => {
      const dataTime = new Date(d.timestamp);
      return dataTime >= start && dataTime <= end;
    });
    
    if (processType) {
      filteredData = filteredData.filter(d => d.processType === processType);
    }

    const report = {
      reportId: `PROD-${Date.now()}`,
      generatedAt: new Date(),
      period: {
        startDate: start,
        endDate: end,
        duration: `${Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))} hours`
      },
      summary: {
        totalDataPoints: filteredData.length,
        processTypes: getProcessTypeSummary(filteredData),
        overallStatus: getOverallStatus(filteredData),
        qualityMetrics: getQualitySummary(filteredData),
        environmentalMetrics: getEnvironmentalSummary(filteredData),
        alerts: getAlertsSummary(start, end)
      },
      trends: generateProductionTrends(filteredData),
      recommendations: generateRecommendations(filteredData)
    };

    res.json({
      success: true,
      report
    });

  } catch (error) {
    logger.error('Error generating production summary report:', error);
    res.status(500).json({ error: 'Failed to generate production summary report' });
  }
});

// Generate environmental compliance report
router.get('/environmental-compliance', (req: Request, res: Response) => {
  try {
    const { period = '24' } = req.query; // hours
    const historicalData = dataGenerator.getHistoricalData(Number(period));
    
    const environmentalData = historicalData.map(d => d.environmental);
    const alerts = dataGenerator.getAlerts().filter(a => a.type === 'environmental');
    
    const report = {
      reportId: `ENV-${Date.now()}`,
      generatedAt: new Date(),
      period: `${period} hours`,
      compliance: {
        co2Emissions: {
          total: environmentalData.reduce((sum, env) => sum + env.co2Emission, 0),
          average: environmentalData.reduce((sum, env) => sum + env.co2Emission, 0) / environmentalData.length,
          limit: 1000, // kg/day
          status: 'compliant'
        },
        noxEmissions: {
          total: environmentalData.reduce((sum, env) => sum + (env.noxEmission || 0), 0),
          average: environmentalData.reduce((sum, env) => sum + (env.noxEmission || 0), 0) / environmentalData.length,
          limit: 50, // kg/day
          status: 'compliant'
        },
        soxEmissions: {
          total: environmentalData.reduce((sum, env) => sum + (env.soxEmission || 0), 0),
          average: environmentalData.reduce((sum, env) => sum + (env.soxEmission || 0), 0) / environmentalData.length,
          limit: 30, // kg/day
          status: 'compliant'
        },
        particulates: {
          average: environmentalData.reduce((sum, env) => sum + (env.particulates || 0), 0) / environmentalData.length,
          limit: 20, // mg/m³
          status: 'compliant'
        },
        vocEmissions: {
          total: environmentalData.reduce((sum, env) => sum + (env.vocEmission || 0), 0),
          average: environmentalData.reduce((sum, env) => sum + (env.vocEmission || 0), 0) / environmentalData.length,
          limit: 100, // kg/day
          status: 'compliant'
        }
      },
      energyConsumption: {
        total: environmentalData.reduce((sum, env) => sum + env.energyConsumption, 0),
        average: environmentalData.reduce((sum, env) => sum + env.energyConsumption, 0) / environmentalData.length,
        renewablePercentage: 25 + Math.random() * 10,
        efficiency: calculateEnergyEfficiency(environmentalData)
      },
      violations: alerts.filter(a => a.severity === 'critical' || a.severity === 'high'),
      certifications: {
        iso14001: { status: 'valid', expiryDate: '2025-12-31' },
        isccPlus: { status: 'valid', expiryDate: '2024-08-15' }
      }
    };

    res.json({
      success: true,
      report
    });

  } catch (error) {
    logger.error('Error generating environmental compliance report:', error);
    res.status(500).json({ error: 'Failed to generate environmental compliance report' });
  }
});

// Generate quality assurance report
router.get('/quality-assurance', (req: Request, res: Response) => {
  try {
    const { period = '24', processType } = req.query;
    let historicalData = dataGenerator.getHistoricalData(Number(period));
    
    if (processType) {
      historicalData = historicalData.filter(d => d.processType === processType);
    }

    const qualityData = historicalData.map(d => d.quality).filter(q => q);
    const qualityAlerts = dataGenerator.getAlerts().filter(a => a.type === 'quality');
    
    const report = {
      reportId: `QA-${Date.now()}`,
      generatedAt: new Date(),
      period: `${period} hours`,
      processType: processType || 'all',
      qualityMetrics: {
        tensileStrength: {
          average: calculateAverage(qualityData, 'tensileStrength'),
          min: calculateMin(qualityData, 'tensileStrength'),
          max: calculateMax(qualityData, 'tensileStrength'),
          standardDeviation: calculateStdDev(qualityData, 'tensileStrength'),
          specification: { min: 2800, max: 4000, unit: 'MPa' }
        },
        elasticModulus: {
          average: calculateAverage(qualityData, 'elasticModulus'),
          min: calculateMin(qualityData, 'elasticModulus'),
          max: calculateMax(qualityData, 'elasticModulus'),
          standardDeviation: calculateStdDev(qualityData, 'elasticModulus'),
          specification: { min: 200, max: 300, unit: 'GPa' }
        },
        diameter: {
          average: calculateAverage(qualityData, 'diameter'),
          min: calculateMin(qualityData, 'diameter'),
          max: calculateMax(qualityData, 'diameter'),
          standardDeviation: calculateStdDev(qualityData, 'diameter'),
          specification: { min: 11.5, max: 13.5, unit: 'μm' }
        },
        defectRate: {
          average: calculateAverage(qualityData, 'defectCount'),
          total: qualityData.reduce((sum, q) => sum + (q.defectCount || 0), 0),
          trend: 'decreasing'
        }
      },
      qualityGrades: generateQualityGrades(qualityData),
      cpkAnalysis: calculateCpkAnalysis(qualityData),
      qualityTrends: generateQualityTrends(historicalData),
      nonConformances: qualityAlerts,
      corrective_actions: generateCorrectiveActions(qualityAlerts)
    };

    res.json({
      success: true,
      report
    });

  } catch (error) {
    logger.error('Error generating quality assurance report:', error);
    res.status(500).json({ error: 'Failed to generate quality assurance report' });
  }
});

// Generate equipment performance report
router.get('/equipment-performance', (req: Request, res: Response) => {
  try {
    const { period = '168' } = req.query; // Default 1 week in hours
    const equipment = dataGenerator.getEquipmentList();
    
    const performanceReport = equipment.map(eq => ({
      id: eq.id,
      name: eq.name,
      type: eq.type,
      location: eq.location,
      currentStatus: eq.status,
      currentEfficiency: eq.efficiency,
      metrics: {
        uptime: eq.status === 'operational' ? 95 + Math.random() * 5 : 0,
        mtbf: 720 + Math.random() * 480, // Mean Time Between Failures (hours)
        mttr: 4 + Math.random() * 8, // Mean Time To Repair (hours)
        oee: calculateEquipmentOEE(eq),
        energyEfficiency: 85 + Math.random() * 15
      },
      maintenance: {
        lastMaintenance: eq.lastMaintenance,
        nextMaintenance: eq.nextMaintenance,
        maintenanceCost: 1000 + Math.random() * 5000,
        predictedFailure: getPredictedFailure(eq)
      },
      trends: generateEquipmentTrends(eq.id, Number(period))
    }));

    const summary = {
      totalEquipment: equipment.length,
      operational: equipment.filter(eq => eq.status === 'operational').length,
      averageEfficiency: equipment.reduce((sum, eq) => sum + eq.efficiency, 0) / equipment.length,
      totalMaintenanceCost: performanceReport.reduce((sum, eq) => sum + eq.maintenance.maintenanceCost, 0),
      upcomingMaintenance: equipment.filter(eq => {
        const daysUntil = (new Date(eq.nextMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return daysUntil <= 7;
      }).length
    };

    res.json({
      success: true,
      report: {
        reportId: `EQ-${Date.now()}`,
        generatedAt: new Date(),
        period: `${period} hours`,
        summary,
        equipment: performanceReport
      }
    });

  } catch (error) {
    logger.error('Error generating equipment performance report:', error);
    res.status(500).json({ error: 'Failed to generate equipment performance report' });
  }
});

// Generate ESG/sustainability report
router.get('/esg-sustainability', (req: Request, res: Response) => {
  try {
    const { period = '720' } = req.query; // Default 30 days in hours
    const historicalData = dataGenerator.getHistoricalData(Number(period));
    
    const environmentalData = historicalData.map(d => d.environmental);
    const totalProduction = Math.floor(1000 + Math.random() * 2000); // kg
    
    const report = {
      reportId: `ESG-${Date.now()}`,
      generatedAt: new Date(),
      period: `${period} hours`,
      environmental: {
        carbonFootprint: {
          scope1: environmentalData.reduce((sum, env) => sum + env.co2Emission, 0) * 0.6,
          scope2: environmentalData.reduce((sum, env) => sum + env.co2Emission, 0) * 0.3,
          scope3: environmentalData.reduce((sum, env) => sum + env.co2Emission, 0) * 0.1,
          total: environmentalData.reduce((sum, env) => sum + env.co2Emission, 0),
          intensity: environmentalData.reduce((sum, env) => sum + env.co2Emission, 0) / totalProduction
        },
        energyConsumption: {
          total: environmentalData.reduce((sum, env) => sum + env.energyConsumption, 0),
          renewable: environmentalData.reduce((sum, env) => sum + env.energyConsumption, 0) * 0.25,
          intensity: environmentalData.reduce((sum, env) => sum + env.energyConsumption, 0) / totalProduction
        },
        waterUsage: {
          total: 800 + Math.random() * 400,
          recycled: 200 + Math.random() * 100,
          intensity: (800 + Math.random() * 400) / totalProduction
        },
        wasteGeneration: {
          total: 50 + Math.random() * 30,
          recycled: 40 + Math.random() * 20,
          hazardous: 5 + Math.random() * 5
        }
      },
      social: {
        safetyMetrics: {
          incidentRate: Math.random() * 2,
          nearMisses: Math.floor(Math.random() * 5),
          safetyTrainingHours: 120 + Math.random() * 80,
          daysWithoutIncident: Math.floor(Math.random() * 365)
        },
        employeeMetrics: {
          totalEmployees: 150 + Math.floor(Math.random() * 100),
          diversityRatio: 0.35 + Math.random() * 0.15,
          trainingHoursPerEmployee: 40 + Math.random() * 20,
          satisfactionScore: 7.5 + Math.random() * 1.5
        }
      },
      governance: {
        compliance: {
          iso9001: { status: 'compliant', lastAudit: '2024-06-01' },
          iso14001: { status: 'compliant', lastAudit: '2024-05-15' },
          ohsas18001: { status: 'compliant', lastAudit: '2024-07-20' }
        },
        risks: generateRiskAssessment(),
        auditResults: generateAuditResults()
      },
      targets: {
        carbonReduction: { target: 20, achieved: 15, unit: 'percentage' },
        energyEfficiency: { target: 15, achieved: 12, unit: 'percentage' },
        wasteReduction: { target: 30, achieved: 25, unit: 'percentage' }
      }
    };

    res.json({
      success: true,
      report
    });

  } catch (error) {
    logger.error('Error generating ESG sustainability report:', error);
    res.status(500).json({ error: 'Failed to generate ESG sustainability report' });
  }
});

// Utility functions
const getProcessTypeSummary = (data: any[]) => {
  return {
    pan: data.filter(d => d.processType === 'pan').length,
    carbon_fiber: data.filter(d => d.processType === 'carbon_fiber').length,
    prepreg: data.filter(d => d.processType === 'prepreg').length,
    composite: data.filter(d => d.processType === 'composite').length
  };
};

const getOverallStatus = (data: any[]) => {
  const statusCounts = {
    normal: data.filter(d => d.status === 'normal').length,
    warning: data.filter(d => d.status === 'warning').length,
    critical: data.filter(d => d.status === 'critical').length,
    offline: data.filter(d => d.status === 'offline').length
  };
  
  const total = data.length;
  return {
    ...statusCounts,
    normalPercentage: (statusCounts.normal / total) * 100,
    issuesPercentage: ((statusCounts.warning + statusCounts.critical) / total) * 100
  };
};

const getQualitySummary = (data: any[]) => {
  const qualityData = data.map(d => d.quality).filter(q => q);
  return {
    averageTensileStrength: calculateAverage(qualityData, 'tensileStrength'),
    averageElasticModulus: calculateAverage(qualityData, 'elasticModulus'),
    averageDiameter: calculateAverage(qualityData, 'diameter'),
    totalDefects: qualityData.reduce((sum, q) => sum + (q.defectCount || 0), 0)
  };
};

const getEnvironmentalSummary = (data: any[]) => {
  const envData = data.map(d => d.environmental);
  return {
    totalCO2: envData.reduce((sum, env) => sum + env.co2Emission, 0),
    totalEnergy: envData.reduce((sum, env) => sum + env.energyConsumption, 0),
    averageTemperature: envData.reduce((sum, env) => sum + env.temperature, 0) / envData.length
  };
};

const getAlertsSummary = (startDate: Date, endDate: Date) => {
  // This would query alerts from the data generator or database
  return {
    total: Math.floor(Math.random() * 20),
    critical: Math.floor(Math.random() * 5),
    resolved: Math.floor(Math.random() * 15)
  };
};

const calculateAverage = (data: any[], field: string): number => {
  const values = data.map(item => item[field]).filter(v => v !== undefined && v !== null);
  return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
};

const calculateMin = (data: any[], field: string): number => {
  const values = data.map(item => item[field]).filter(v => v !== undefined && v !== null);
  return values.length > 0 ? Math.min(...values) : 0;
};

const calculateMax = (data: any[], field: string): number => {
  const values = data.map(item => item[field]).filter(v => v !== undefined && v !== null);
  return values.length > 0 ? Math.max(...values) : 0;
};

const calculateStdDev = (data: any[], field: string): number => {
  const values = data.map(item => item[field]).filter(v => v !== undefined && v !== null);
  if (values.length === 0) return 0;
  
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / squaredDiffs.length);
};

const generateQualityGrades = (qualityData: any[]) => {
  return {
    gradeA: Math.floor(qualityData.length * 0.7),
    gradeB: Math.floor(qualityData.length * 0.2),
    gradeC: Math.floor(qualityData.length * 0.08),
    reject: Math.floor(qualityData.length * 0.02)
  };
};

const calculateCpkAnalysis = (qualityData: any[]) => {
  // Process capability index calculation
  return {
    tensileStrength: { cpk: 1.33, status: 'capable' },
    elasticModulus: { cpk: 1.67, status: 'highly_capable' },
    diameter: { cpk: 1.25, status: 'marginally_capable' }
  };
};

const generateProductionTrends = (data: any[]) => {
  // Generate hourly trends
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    dataPoints: Math.floor(Math.random() * 20) + 5,
    efficiency: 85 + Math.random() * 15,
    quality: 95 + Math.random() * 5
  }));
};

const generateQualityTrends = (data: any[]) => {
  return data.slice(-24).map(d => ({
    timestamp: d.timestamp,
    tensileStrength: d.quality.tensileStrength,
    elasticModulus: d.quality.elasticModulus,
    defectCount: d.quality.defectCount
  }));
};

const generateCorrectiveActions = (alerts: any[]) => {
  return alerts.slice(0, 5).map(alert => ({
    alertId: alert.id,
    action: 'Investigate and adjust process parameters',
    assignedTo: 'Quality Team',
    dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
    status: 'in_progress'
  }));
};

const calculateEquipmentOEE = (equipment: any) => {
  const availability = equipment.status === 'operational' ? 0.95 : 0;
  const performance = equipment.efficiency / 100;
  const quality = 0.98;
  return (availability * performance * quality) * 100;
};

const getPredictedFailure = (equipment: any) => {
  const daysUntilFailure = Math.floor(Math.random() * 365) + 30;
  return {
    predictedDate: new Date(Date.now() + daysUntilFailure * 24 * 60 * 60 * 1000),
    confidence: 0.75 + Math.random() * 0.2,
    riskLevel: daysUntilFailure < 90 ? 'high' : daysUntilFailure < 180 ? 'medium' : 'low'
  };
};

const generateEquipmentTrends = (equipmentId: string, hours: number) => {
  return Array.from({ length: Math.min(hours, 168) }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
    efficiency: 85 + Math.random() * 15,
    uptime: Math.random() > 0.1 ? 100 : 0,
    throughput: 90 + Math.random() * 20
  })).reverse();
};

const calculateEnergyEfficiency = (environmentalData: any[]) => {
  // Simple efficiency calculation
  const totalEnergy = environmentalData.reduce((sum, env) => sum + env.energyConsumption, 0);
  const avgEnergy = totalEnergy / environmentalData.length;
  const baselineEfficiency = 100;
  return Math.min(100, (baselineEfficiency / avgEnergy) * 100);
};

const generateRecommendations = (data: any[]) => {
  return [
    {
      priority: 'high',
      category: 'quality',
      recommendation: 'Optimize spinning parameters to reduce diameter variation',
      impact: 'Reduce defect rate by 15%',
      implementation: 'Adjust tension control settings'
    },
    {
      priority: 'medium',
      category: 'efficiency',
      recommendation: 'Schedule preventive maintenance for carbonization furnace',
      impact: 'Prevent unplanned downtime',
      implementation: 'Contact maintenance team'
    },
    {
      priority: 'low',
      category: 'environmental',
      recommendation: 'Consider energy recovery system installation',
      impact: 'Reduce energy consumption by 8%',
      implementation: 'Capital investment required'
    }
  ];
};

const generateRiskAssessment = () => {
  return [
    { risk: 'Equipment failure', probability: 'low', impact: 'high', mitigation: 'Preventive maintenance' },
    { risk: 'Quality deviation', probability: 'medium', impact: 'medium', mitigation: 'Process monitoring' },
    { risk: 'Environmental violation', probability: 'low', impact: 'high', mitigation: 'Continuous monitoring' }
  ];
};

const generateAuditResults = () => {
  return [
    { date: '2024-06-01', type: 'ISO 9001', result: 'passed', findings: 2, corrective_actions: 1 },
    { date: '2024-05-15', type: 'ISO 14001', result: 'passed', findings: 1, corrective_actions: 0 },
    { date: '2024-07-20', type: 'OHSAS 18001', result: 'passed', findings: 3, corrective_actions: 2 }
  ];
};

export default router;