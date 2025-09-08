export interface ProcessData {
  id: string;
  timestamp: Date;
  processType: 'pan' | 'carbon_fiber' | 'prepreg' | 'composite';
  stage: string;
  parameters: {
    [key: string]: number | string | boolean;
  };
  quality: QualityMetrics;
  environmental: EnvironmentalData;
  status: 'normal' | 'warning' | 'critical' | 'offline';
}

export interface QualityMetrics {
  tensileStrength?: number;
  elasticModulus?: number;
  diameter?: number;
  circularity?: number;
  voidContent?: number;
  fiberVolumeRatio?: number;
  defectCount?: number;
}

export interface EnvironmentalData {
  temperature: number;
  pressure: number;
  humidity: number;
  co2Emission: number;
  energyConsumption: number;
  noxEmission?: number;
  soxEmission?: number;
  particulates?: number;
  vocEmission?: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'operational' | 'maintenance' | 'offline' | 'error';
  efficiency: number;
  lastMaintenance: Date;
  nextMaintenance: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'operator' | 'quality_manager' | 'production_manager' | 'environmental_officer' | 'executive';
  department: string;
  permissions: string[];
}

export interface Alert {
  id: string;
  type: 'quality' | 'environmental' | 'equipment' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface KPIData {
  overallEfficiency: number;
  equipmentUptime: number;
  qualityRate: number;
  energyEfficiency: number;
  yieldRate: number;
  co2Emission: number;
  activeAlerts: number;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface DashboardState {
  processData: ProcessData[];
  equipment: Equipment[];
  alerts: Alert[];
  kpis: KPIData;
  selectedProcess?: string;
  selectedEquipment?: string;
  timeRange: '1h' | '4h' | '24h' | '7d';
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}