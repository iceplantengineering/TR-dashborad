import { Server as SocketIOServer } from 'socket.io';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import logger from '@/utils/logger';
import { ProcessData, Equipment, Alert, QualityMetrics, EnvironmentalData } from '@/types';
import { config } from '@/config';

export class DataGenerator {
  private io: SocketIOServer;
  private equipmentList: Equipment[] = [];
  private processDataHistory: ProcessData[] = [];
  private alerts: Alert[] = [];
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.initializeEquipment();
  }

  private initializeEquipment(): void {
    const equipmentTypes = [
      { type: 'polymerization_reactor', name: 'Polymerization Reactor', process: 'pan' },
      { type: 'spinning_machine', name: 'Spinning Machine', process: 'pan' },
      { type: 'stabilization_oven', name: 'Stabilization Oven', process: 'carbon_fiber' },
      { type: 'carbonization_furnace', name: 'Carbonization Furnace', process: 'carbon_fiber' },
      { type: 'surface_treatment', name: 'Surface Treatment Unit', process: 'carbon_fiber' },
      { type: 'resin_impregnation', name: 'Resin Impregnation Line', process: 'prepreg' },
      { type: 'prepreg_line', name: 'Prepreg Production Line', process: 'prepreg' },
      { type: 'autoclave', name: 'Autoclave System', process: 'composite' },
      { type: 'rtm_machine', name: 'RTM Machine', process: 'composite' },
      { type: 'quality_scanner', name: 'Quality Scanner', process: 'quality' }
    ];

    this.equipmentList = equipmentTypes.map((eq, index) => ({
      id: `EQ-${String(index + 1).padStart(3, '0')}`,
      name: `${eq.name} ${Math.floor(index / 2) + 1}`,
      type: eq.type,
      location: `Line ${Math.floor(index / 3) + 1}`,
      status: Math.random() > 0.9 ? 'maintenance' : 'operational',
      efficiency: 85 + Math.random() * 15,
      lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + (7 + Math.random() * 21) * 24 * 60 * 60 * 1000)
    }));

    logger.info(`Initialized ${this.equipmentList.length} pieces of equipment`);
  }

  private generateProcessData(): ProcessData[] {
    const processes = ['pan', 'carbon_fiber', 'prepreg', 'composite'] as const;
    const data: ProcessData[] = [];

    processes.forEach(processType => {
      const processData = this.generateProcessSpecificData(processType);
      data.push(...processData);
    });

    return data;
  }

  private generateProcessSpecificData(processType: ProcessData['processType']): ProcessData[] {
    const data: ProcessData[] = [];
    const timestamp = new Date();

    switch (processType) {
      case 'pan':
        data.push({
          id: uuidv4(),
          timestamp,
          processType,
          stage: 'polymerization',
          parameters: {
            acrylonitrile_concentration: 45 + this.addVariation(5),
            ma_content: 2.1 + this.addVariation(0.3),
            ia_content: 1.8 + this.addVariation(0.2),
            molecular_weight: 85000 + this.addVariation(5000),
            reaction_temperature: 65 + this.addVariation(3),
            reaction_pressure: 2.5 + this.addVariation(0.2)
          },
          quality: {
            tensileStrength: 800 + this.addVariation(50),
            elasticModulus: 15 + this.addVariation(2),
            diameter: 12.5 + this.addVariation(0.5)
          },
          environmental: this.generateEnvironmentalData(65, 2.5),
          status: this.getRandomStatus()
        });

        data.push({
          id: uuidv4(),
          timestamp,
          processType,
          stage: 'spinning',
          parameters: {
            dope_viscosity: 180 + this.addVariation(20),
            dope_concentration: 18.5 + this.addVariation(1),
            spinning_speed: 120 + this.addVariation(10),
            coagulation_bath_temp: 0 + this.addVariation(2),
            draw_ratio: 8.5 + this.addVariation(0.5)
          },
          quality: {
            diameter: 12.0 + this.addVariation(0.3),
            circularity: 0.98 + this.addVariation(0.02),
            defectCount: Math.floor(Math.random() * 5)
          },
          environmental: this.generateEnvironmentalData(25, 1.0),
          status: this.getRandomStatus()
        });
        break;

      case 'carbon_fiber':
        data.push({
          id: uuidv4(),
          timestamp,
          processType,
          stage: 'stabilization',
          parameters: {
            temperature_profile: 250 + this.addVariation(10),
            oxygen_concentration: 21 + this.addVariation(1),
            tension_control: 2.8 + this.addVariation(0.2),
            residence_time: 90 + this.addVariation(5)
          },
          quality: {
            tensileStrength: 1200 + this.addVariation(100),
            elasticModulus: 85 + this.addVariation(5)
          },
          environmental: this.generateEnvironmentalData(250, 1.0),
          status: this.getRandomStatus()
        });

        data.push({
          id: uuidv4(),
          timestamp,
          processType,
          stage: 'carbonization',
          parameters: {
            max_temperature: 1500 + this.addVariation(50),
            heating_rate: 5 + this.addVariation(0.5),
            nitrogen_flow: 50 + this.addVariation(5),
            carbon_content: 94.5 + this.addVariation(1)
          },
          quality: {
            tensileStrength: 3500 + this.addVariation(300),
            elasticModulus: 230 + this.addVariation(20)
          },
          environmental: this.generateEnvironmentalData(1500, 0.5),
          status: this.getRandomStatus()
        });
        break;

      case 'prepreg':
        data.push({
          id: uuidv4(),
          timestamp,
          processType,
          stage: 'resin_impregnation',
          parameters: {
            resin_temperature: 80 + this.addVariation(5),
            resin_viscosity: 2000 + this.addVariation(200),
            impregnation_pressure: 0.5 + this.addVariation(0.05),
            resin_content: 35 + this.addVariation(2)
          },
          quality: {
            fiberVolumeRatio: 60 + this.addVariation(3),
            voidContent: 0.5 + this.addVariation(0.3)
          },
          environmental: this.generateEnvironmentalData(80, 0.5),
          status: this.getRandomStatus()
        });
        break;

      case 'composite':
        data.push({
          id: uuidv4(),
          timestamp,
          processType,
          stage: 'autoclave_curing',
          parameters: {
            cure_temperature: 180 + this.addVariation(5),
            autoclave_pressure: 0.7 + this.addVariation(0.05),
            vacuum_level: -0.95 + this.addVariation(0.02),
            cure_time: 120 + this.addVariation(10)
          },
          quality: {
            tensileStrength: 2800 + this.addVariation(200),
            elasticModulus: 150 + this.addVariation(15),
            voidContent: 0.8 + this.addVariation(0.4)
          },
          environmental: this.generateEnvironmentalData(180, 0.7),
          status: this.getRandomStatus()
        });
        break;
    }

    return data;
  }

  private generateEnvironmentalData(baseTemp: number, basePressure: number): EnvironmentalData {
    return {
      temperature: baseTemp + this.addVariation(5),
      pressure: basePressure + this.addVariation(0.1),
      humidity: 45 + this.addVariation(10),
      co2Emission: 50 + this.addVariation(10),
      energyConsumption: 100 + this.addVariation(20),
      noxEmission: 0.5 + this.addVariation(0.1),
      soxEmission: 0.3 + this.addVariation(0.05),
      particulates: 10 + this.addVariation(2),
      vocEmission: 2.5 + this.addVariation(0.5)
    };
  }

  private addVariation(baseValue: number): number {
    const variation = config.simulation.processVariation;
    return (Math.random() - 0.5) * 2 * baseValue * variation;
  }

  private getRandomStatus(): ProcessData['status'] {
    const rand = Math.random();
    if (rand < 0.7) return 'normal';
    if (rand < 0.9) return 'warning';
    if (rand < 0.98) return 'critical';
    return 'offline';
  }

  private generateAlert(): Alert | null {
    if (Math.random() > 0.1) return null; // 10% chance to generate alert

    const types = ['quality', 'environmental', 'equipment', 'safety'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    
    const messages = [
      'Temperature deviation detected in carbonization furnace',
      'Quality metrics below threshold in prepreg line',
      'Equipment efficiency dropping in spinning machine',
      'Environmental emission levels approaching limits',
      'Pressure anomaly in autoclave system',
      'Fiber diameter variation exceeding tolerance'
    ];

    return {
      id: uuidv4(),
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      source: this.equipmentList[Math.floor(Math.random() * this.equipmentList.length)].id,
      timestamp: new Date(),
      acknowledged: false
    };
  }

  private updateEquipmentStatus(): void {
    this.equipmentList.forEach(equipment => {
      // Randomly update efficiency
      equipment.efficiency = Math.max(0, Math.min(100, 
        equipment.efficiency + (Math.random() - 0.5) * 5
      ));

      // Occasionally change status
      if (Math.random() < 0.02) {
        const statuses = ['operational', 'maintenance', 'offline', 'error'];
        equipment.status = statuses[Math.floor(Math.random() * statuses.length)] as any;
      }
    });
  }

  private emitRealTimeData(): void {
    const processData = this.generateProcessData();
    const alert = this.generateAlert();
    
    // Store data in memory (in production, this would go to a database)
    this.processDataHistory.push(...processData);
    if (alert) this.alerts.push(alert);

    // Keep only last 1000 records to prevent memory issues
    if (this.processDataHistory.length > 1000) {
      this.processDataHistory = this.processDataHistory.slice(-1000);
    }
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Update equipment status
    this.updateEquipmentStatus();

    // Emit to connected clients
    this.io.emit('processData', processData);
    this.io.emit('equipmentStatus', this.equipmentList);
    if (alert) {
      this.io.emit('newAlert', alert);
      logger.warn(`New alert generated: ${alert.message}`);
    }

    // Calculate and emit KPIs
    const kpis = this.calculateKPIs();
    this.io.emit('kpiUpdate', kpis);
  }

  private calculateKPIs() {
    const recentData = this.processDataHistory.slice(-20);
    const operationalEquipment = this.equipmentList.filter(eq => eq.status === 'operational');
    
    return {
      overallEfficiency: operationalEquipment.reduce((sum, eq) => sum + eq.efficiency, 0) / operationalEquipment.length,
      equipmentUptime: (operationalEquipment.length / this.equipmentList.length) * 100,
      qualityRate: recentData.filter(d => d.status === 'normal').length / Math.max(recentData.length, 1) * 100,
      energyEfficiency: 85 + Math.random() * 10,
      yieldRate: 92 + Math.random() * 5,
      co2Emission: recentData.reduce((sum, d) => sum + d.environmental.co2Emission, 0) / Math.max(recentData.length, 1),
      activeAlerts: this.alerts.filter(a => !a.acknowledged).length
    };
  }

  public getHistoricalData(hours: number = 24): ProcessData[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.processDataHistory.filter(data => data.timestamp >= cutoff);
  }

  public getEquipmentList(): Equipment[] {
    return [...this.equipmentList];
  }

  public getAlerts(): Alert[] {
    return [...this.alerts];
  }

  public start(): void {
    if (this.isRunning) {
      logger.warn('Data generator is already running');
      return;
    }

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.emitRealTimeData();
    }, config.simulation.updateInterval);

    // Also schedule periodic reports
    cron.schedule('0 */6 * * *', () => {
      this.generatePeriodicReport();
    });

    logger.info(`Data generator started with ${config.simulation.updateInterval}ms interval`);
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    logger.info('Data generator stopped');
  }

  private generatePeriodicReport(): void {
    const report = {
      timestamp: new Date(),
      summary: {
        totalProduction: Math.floor(1000 + Math.random() * 500),
        qualityMetrics: {
          averageStrength: 2800 + Math.random() * 400,
          defectRate: Math.random() * 2,
          yieldRate: 92 + Math.random() * 5
        },
        environmental: {
          totalCO2: 500 + Math.random() * 100,
          energyConsumption: 2000 + Math.random() * 400,
          waterUsage: 800 + Math.random() * 200
        },
        equipment: {
          averageUptime: 95 + Math.random() * 4,
          maintenanceEvents: Math.floor(Math.random() * 5)
        }
      }
    };

    this.io.emit('periodicReport', report);
    logger.info('Periodic report generated and emitted');
  }
}