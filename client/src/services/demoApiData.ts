import { ProcessData, Equipment, Alert } from '@/types';

// Generate demo process data
export const generateDemoProcessData = (): ProcessData[] => {
  const processTypes = ['pan', 'carbon_fiber', 'prepreg', 'composite'] as const;
  const stages = ['preparation', 'processing', 'finishing', 'quality_check'];
  const statuses = ['normal', 'warning', 'critical', 'offline'] as const;
  
  const data: ProcessData[] = [];
  
  for (let i = 0; i < 50; i++) {
    const now = new Date();
    const timestamp = new Date(now.getTime() - (i * 60000)); // Every minute
    
    data.push({
      id: `process-${i}`,
      timestamp,
      processType: processTypes[Math.floor(Math.random() * processTypes.length)],
      stage: stages[Math.floor(Math.random() * stages.length)],
      parameters: {
        temperature: 150 + Math.random() * 50,
        pressure: 10 + Math.random() * 5,
        speed: 100 + Math.random() * 20,
      },
      quality: {
        tensileStrength: 3500 + Math.random() * 500,
        elasticModulus: 230 + Math.random() * 20,
        diameter: 7.0 + Math.random() * 0.5,
        defectCount: Math.floor(Math.random() * 3),
      },
      environmental: {
        temperature: 20 + Math.random() * 10,
        pressure: 1.0 + Math.random() * 0.1,
        humidity: 45 + Math.random() * 10,
        co2Emission: 50 + Math.random() * 20,
        energyConsumption: 100 + Math.random() * 50,
      },
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  
  return data;
};

// Generate demo equipment data
export const generateDemoEquipment = (): Equipment[] => {
  const equipmentTypes = ['Extruder', 'Spinning Unit', 'Oven', 'Winding Machine', 'Testing Equipment'];
  const locations = ['Line A', 'Line B', 'Line C', 'Lab', 'Storage'];
  const statuses = ['operational', 'maintenance', 'offline', 'error'] as const;
  
  return Array.from({ length: 12 }, (_, i) => ({
    id: `eq-${i + 1}`,
    name: `${equipmentTypes[i % equipmentTypes.length]} ${Math.floor(i / equipmentTypes.length) + 1}`,
    type: equipmentTypes[i % equipmentTypes.length],
    location: locations[Math.floor(Math.random() * locations.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    efficiency: 75 + Math.random() * 25,
    lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within 30 days
    nextMaintenance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Next 30 days
  }));
};

// Generate demo alerts
export const generateDemoAlerts = (): Alert[] => {
  const types = ['quality', 'environmental', 'equipment', 'safety'] as const;
  const severities = ['low', 'medium', 'high', 'critical'] as const;
  const messages = [
    'Temperature exceeded normal range',
    'Equipment efficiency below threshold',
    'Quality parameters out of specification',
    'Maintenance required for optimal performance',
    'Environmental limits approaching',
    'Safety protocols need attention',
  ];
  const sources = ['Line A', 'Line B', 'Quality Lab', 'Environmental Monitor', 'Safety System'];
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `alert-${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within 7 days
    acknowledged: Math.random() > 0.3,
    resolvedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : undefined,
  }));
};

// Demo API responses
export const demoApiResponses = {
  '/api/alerts': (params?: { limit?: number; severity?: string }) => {
    const alerts = generateDemoAlerts();
    const filtered = params?.severity ? alerts.filter(a => a.severity === params.severity) : alerts;
    const limited = params?.limit ? filtered.slice(0, params.limit) : filtered;
    
    return {
      summary: {
        total: alerts.length,
        unacknowledged: alerts.filter(a => !a.acknowledged).length,
        critical: alerts.filter(a => a.severity === 'critical').length,
      },
      alerts: limited,
    };
  },
  
  '/api/process/status': () => {
    const processes = generateDemoProcessData();
    return {
      summary: {
        total_processes: 4,
        active: 3,
        warning: 1,
        critical: 0,
        average_efficiency: 92.5,
      },
      processes: processes.slice(0, 20),
    };
  },
  
  '/api/process/history': (params?: { hours?: number; processType?: string }) => {
    const data = generateDemoProcessData();
    const filtered = params?.processType ? data.filter(p => p.processType === params.processType) : data;
    return {
      data: filtered,
      count: filtered.length,
    };
  },
  
  '/api/equipment/status': () => {
    const equipment = generateDemoEquipment();
    return {
      summary: {
        total: equipment.length,
        operational: equipment.filter(e => e.status === 'operational').length,
        maintenance: equipment.filter(e => e.status === 'maintenance').length,
        offline: equipment.filter(e => e.status === 'offline').length,
        average_efficiency: equipment.reduce((sum, e) => sum + e.efficiency, 0) / equipment.length,
      },
      equipment,
    };
  },
};

// Helper function to simulate API delay
export const simulateApiDelay = (ms: number = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));