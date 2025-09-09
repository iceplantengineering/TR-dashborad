import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Typography,
  Row,
  Col,
  Table,
  Progress,
  Statistic,
  Tag,
  Select,
  Button,
  Space,
  Tabs,
  Badge,
  Tooltip,
  DatePicker,
  Alert,
} from 'antd';
import {
  SafetyOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  BarChartOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, subHours } from 'date-fns';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface QualityData {
  id: string;
  timestamp: Date;
  processLine: string;
  product: string;
  batch: string;
  tensileStrength: number;
  fiberAlignment: number;
  voidContent: number;
  surfaceQuality: number;
  dimensionalAccuracy: number;
  overallGrade: 'A' | 'B' | 'C' | 'D';
  inspector: string;
  status: 'pass' | 'fail' | 'rework';
  defects: string[];
}

interface KPICorrelationData {
  efficiency: number;
  quality: number;
  temperature: number;
  pressure: number;
  speed: number;
  timestamp: Date;
}

const QualityManagement: React.FC = () => {
  const { t } = useTranslation();
  const [qualityData, setQualityData] = useState<QualityData[]>([]);
  const [correlationData, setCorrelationData] = useState<KPICorrelationData[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');

  // Generate dummy quality data
  useEffect(() => {
    const generateQualityData = () => {
      const processes = ['PAN前駆体', '炭素繊維', 'プリプレグ', '複合材'];
      const products = ['T700S-12K', 'T800S-24K', 'M55J-6K', 'T1100G-12K'];
      const inspectors = ['佐藤', '田中', '山田', '鈴木', '高橋'];
      const defectTypes = ['気泡', '繊維切れ', '樹脂不足', '寸法不良', '表面荒れ'];
      
      const data: QualityData[] = [];
      
      for (let i = 0; i < 150; i++) {
        const timestamp = subHours(new Date(), Math.random() * 72);
        const tensileStrength = 3500 + Math.random() * 1500 + (Math.random() - 0.5) * 200;
        const fiberAlignment = 88 + Math.random() * 10 + (Math.random() - 0.5) * 5;
        const voidContent = 1 + Math.random() * 3 + (Math.random() - 0.5) * 1;
        const surfaceQuality = 85 + Math.random() * 12 + (Math.random() - 0.5) * 8;
        const dimensionalAccuracy = 90 + Math.random() * 8 + (Math.random() - 0.5) * 4;
        
        const avgScore = (fiberAlignment + surfaceQuality + dimensionalAccuracy + (100 - voidContent * 10)) / 4;
        
        const overallGrade: 'A' | 'B' | 'C' | 'D' = 
          avgScore >= 92 ? 'A' :
          avgScore >= 85 ? 'B' :
          avgScore >= 75 ? 'C' : 'D';
        
        const status: 'pass' | 'fail' | 'rework' = 
          overallGrade === 'A' || overallGrade === 'B' ? 'pass' :
          overallGrade === 'C' ? 'rework' : 'fail';
        
        const defects = status !== 'pass' ? 
          defectTypes.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1) : [];

        data.push({
          id: `QC-${String(i + 1).padStart(4, '0')}`,
          timestamp,
          processLine: processes[Math.floor(Math.random() * processes.length)],
          product: products[Math.floor(Math.random() * products.length)],
          batch: `B${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          tensileStrength: Math.round(tensileStrength),
          fiberAlignment: Math.round(fiberAlignment * 10) / 10,
          voidContent: Math.round(voidContent * 100) / 100,
          surfaceQuality: Math.round(surfaceQuality * 10) / 10,
          dimensionalAccuracy: Math.round(dimensionalAccuracy * 10) / 10,
          overallGrade,
          inspector: inspectors[Math.floor(Math.random() * inspectors.length)],
          status,
          defects,
        });
      }
      
      setQualityData(data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    };

    const generateCorrelationData = () => {
      const data: KPICorrelationData[] = [];
      
      for (let i = 0; i < 200; i++) {
        const baseEfficiency = 85 + Math.random() * 15;
        const temperature = 180 + Math.random() * 40;
        const pressure = 5 + Math.random() * 3;
        const speed = 10 + Math.random() * 15;
        
        // Create correlations
        const qualityScore = Math.min(100, Math.max(60,
          baseEfficiency + 
          (temperature > 200 ? -5 : 5) +
          (pressure > 6.5 ? -3 : 2) +
          (speed > 20 ? -8 : 3) +
          (Math.random() - 0.5) * 10
        ));
        
        data.push({
          efficiency: Math.round(baseEfficiency * 10) / 10,
          quality: Math.round(qualityScore * 10) / 10,
          temperature: Math.round(temperature * 10) / 10,
          pressure: Math.round(pressure * 100) / 100,
          speed: Math.round(speed * 10) / 10,
          timestamp: subHours(new Date(), Math.random() * 48),
        });
      }
      
      setCorrelationData(data);
    };

    generateQualityData();
    generateCorrelationData();
  }, []);

  // Filter data based on selections
  const filteredQualityData = useMemo(() => {
    let filtered = qualityData;
    
    if (selectedProcess !== 'all') {
      filtered = filtered.filter(item => item.processLine === selectedProcess);
    }
    
    const now = new Date();
    let cutoffTime: Date;
    
    switch (timeRange) {
      case '1h': cutoffTime = subHours(now, 1); break;
      case '4h': cutoffTime = subHours(now, 4); break;
      case '24h': cutoffTime = subHours(now, 24); break;
      case '7d': cutoffTime = subDays(now, 7); break;
      default: cutoffTime = subHours(now, 24);
    }
    
    return filtered.filter(item => item.timestamp >= cutoffTime);
  }, [qualityData, selectedProcess, timeRange]);

  // Calculate quality metrics
  const qualityMetrics = useMemo(() => {
    const total = filteredQualityData.length;
    const passed = filteredQualityData.filter(item => item.status === 'pass').length;
    const failed = filteredQualityData.filter(item => item.status === 'fail').length;
    const rework = filteredQualityData.filter(item => item.status === 'rework').length;
    
    const avgTensile = filteredQualityData.reduce((sum, item) => sum + item.tensileStrength, 0) / total;
    const avgAlignment = filteredQualityData.reduce((sum, item) => sum + item.fiberAlignment, 0) / total;
    const avgVoid = filteredQualityData.reduce((sum, item) => sum + item.voidContent, 0) / total;
    
    const gradeDistribution = {
      A: filteredQualityData.filter(item => item.overallGrade === 'A').length,
      B: filteredQualityData.filter(item => item.overallGrade === 'B').length,
      C: filteredQualityData.filter(item => item.overallGrade === 'C').length,
      D: filteredQualityData.filter(item => item.overallGrade === 'D').length,
    };
    
    return {
      total,
      passRate: total > 0 ? Math.round((passed / total) * 1000) / 10 : 0,
      failRate: total > 0 ? Math.round((failed / total) * 1000) / 10 : 0,
      reworkRate: total > 0 ? Math.round((rework / total) * 1000) / 10 : 0,
      avgTensile: Math.round(avgTensile),
      avgAlignment: Math.round(avgAlignment * 10) / 10,
      avgVoid: Math.round(avgVoid * 100) / 100,
      gradeDistribution,
    };
  }, [filteredQualityData]);

  // Quality trend data for chart
  const qualityTrendData = useMemo(() => {
    const hourlyData = filteredQualityData.reduce((acc, item) => {
      const hour = format(item.timestamp, 'HH:mm');
      if (!acc[hour]) {
        acc[hour] = { 
          time: hour, 
          passRate: 0, 
          avgQuality: 0, 
          count: 0,
          passed: 0 
        };
      }
      
      acc[hour].count++;
      if (item.status === 'pass') acc[hour].passed++;
      acc[hour].avgQuality += (item.fiberAlignment + item.surfaceQuality + item.dimensionalAccuracy) / 3;
      
      return acc;
    }, {} as any);
    
    return Object.values(hourlyData).map((item: any) => ({
      time: item.time,
      passRate: Math.round((item.passed / item.count) * 100),
      avgQuality: Math.round((item.avgQuality / item.count) * 10) / 10,
    })).sort((a: any, b: any) => a.time.localeCompare(b.time));
  }, [filteredQualityData]);

  const gradeColors = {
    A: '#52c41a',
    B: '#1890ff',
    C: '#faad14',
    D: '#ff4d4f',
  };

  const statusColors = {
    pass: '#52c41a',
    rework: '#faad14',
    fail: '#ff4d4f',
  };

  const columns = [
    {
      title: t('quality.inspectionId'),
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: t('equipment.manufacturingLine'),
      dataIndex: 'processLine',
      key: 'processLine',
    },
    {
      title: t('quality.product'),
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: t('quality.batch'),
      dataIndex: 'batch',
      key: 'batch',
      width: 80,
    },
    {
      title: t('quality.tensileStrength'),
      dataIndex: 'tensileStrength',
      key: 'tensileStrength',
      render: (value: number) => `${value} ${t('units.mpa')}`,
      width: 100,
    },
    {
      title: t('quality.fiberAlignment'),
      dataIndex: 'fiberAlignment',
      key: 'fiberAlignment',
      render: (value: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Progress 
            percent={value} 
            size="small" 
            format={() => `${value}${t('units.percent')}`}
            strokeColor={value >= 90 ? '#52c41a' : value >= 85 ? '#faad14' : '#ff4d4f'}
          />
        </div>
      ),
      width: 120,
    },
    {
      title: t('quality.overallGrade'),
      dataIndex: 'overallGrade',
      key: 'overallGrade',
      render: (grade: 'A' | 'B' | 'C' | 'D') => (
        <Tag color={gradeColors[grade]} style={{ fontWeight: 'bold' }}>
          {grade}
        </Tag>
      ),
      width: 80,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: 'pass' | 'fail' | 'rework') => (
        <Badge 
          status={status === 'pass' ? 'success' : status === 'rework' ? 'warning' : 'error'}
          text={status === 'pass' ? t('quality.pass') : status === 'rework' ? t('quality.rework') : t('quality.fail')}
        />
      ),
    },
    {
      title: t('quality.inspectionDate'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: Date) => format(date, 'MM/dd HH:mm'),
      width: 100,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <SafetyOutlined /> {t('quality.title')}
          </Title>
          <Text type="secondary">{t('quality.subtitle')}</Text>
        </div>
        
        <Space>
          <Select value={selectedProcess} onChange={setSelectedProcess} style={{ width: 120 }}>
            <Option value="all">{t('quality.allProcesses')}</Option>
            <Option value="PAN前駆体">{t('equipment.panPrecursor')}</Option>
            <Option value="炭素繊維">{t('equipment.carbonFiber')}</Option>
            <Option value="プリプレグ">{t('equipment.prepreg')}</Option>
            <Option value="複合材">{t('equipment.composite')}</Option>
          </Select>
          <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}>
            <Option value="1h">{t('timeRanges.1h')}</Option>
            <Option value="4h">{t('timeRanges.4h')}</Option>
            <Option value="24h">{t('timeRanges.24h')}</Option>
            <Option value="7d">{t('timeRanges.7d')}</Option>
          </Select>
          <Button icon={<ReloadOutlined />}>{t('quality.update')}</Button>
        </Space>
      </div>

      {/* Quality KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title={t('quality.passRate')}
              value={qualityMetrics.passRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: qualityMetrics.passRate >= 95 ? '#3f8600' : '#cf1322' }}
              prefix={<CheckCircleOutlined />}
            />
            <Progress
              percent={qualityMetrics.passRate}
              size="small"
              showInfo={false}
              strokeColor={qualityMetrics.passRate >= 95 ? '#52c41a' : '#ff4d4f'}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title={t('quality.averageTensileStrength')}
              value={qualityMetrics.avgTensile}
              suffix="MPa"
              valueStyle={{ color: qualityMetrics.avgTensile >= 4000 ? '#3f8600' : '#cf1322' }}
              prefix={<TrophyOutlined />}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t('quality.target')}: 4000+ MPa
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title={t('quality.reworkRate')}
              value={qualityMetrics.reworkRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: qualityMetrics.reworkRate <= 5 ? '#3f8600' : '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
            <Progress
              percent={qualityMetrics.reworkRate}
              size="small"
              showInfo={false}
              strokeColor={qualityMetrics.reworkRate <= 5 ? '#52c41a' : '#ff4d4f'}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title={t('quality.inspected')}
              value={qualityMetrics.total}
              suffix="件"
              valueStyle={{ color: '#1890ff' }}
              prefix={<LineChartOutlined />}
            />
            <div style={{ marginTop: '8px' }}>
              <Space size="small">
                <Tag color="green">{qualityMetrics.gradeDistribution.A} {t('quality.aGrade')}</Tag>
                <Tag color="blue">{qualityMetrics.gradeDistribution.B} {t('quality.bGrade')}</Tag>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1">
        <TabPane tab={t('quality.qualityMonitoring')} key="1">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title={t('quality.qualityTrendAnalysis')} extra={<LineChartOutlined />}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={qualityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="passRate" stroke="#52c41a" name={t('quality.passRatePercent')} />
                    <Line type="monotone" dataKey="avgQuality" stroke="#1890ff" name={t('quality.averageQualityScore')} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card title={t('quality.qualityGradeDistribution')}>
                <div style={{ textAlign: 'center' }}>
                  {Object.entries(qualityMetrics.gradeDistribution).map(([grade, count]) => (
                    <div key={grade} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Tag color={gradeColors[grade as keyof typeof gradeColors]} style={{ minWidth: '40px' }}>
                          {grade}
                        </Tag>
                        <div>{count}{t('quality.items')}</div>
                      </div>
                      <Progress
                        percent={qualityMetrics.total > 0 ? Math.round((count / qualityMetrics.total) * 100) : 0}
                        strokeColor={gradeColors[grade as keyof typeof gradeColors]}
                        size="small"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={t('quality.kpiCorrelation')} key="2">
          <Alert
            message={t('quality.correlationAnalysis')}
            description={t('quality.correlationDescription')}
            type="info"
            style={{ marginBottom: '16px' }}
            showIcon
          />
          
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={t('quality.efficiencyVsQuality')} extra={<BarChartOutlined />}>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={correlationData}>
                    <CartesianGrid />
                    <XAxis dataKey="efficiency" name={t('quality.efficiency')} unit={t('units.percent')} />
                    <YAxis dataKey="quality" name={t('quality.qualityShort')} unit={t('units.percent')} />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name={t('quality.efficiencyQuality')} fill="#1890ff" />
                  </ScatterChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title={t('quality.temperaturePressureAnalysis')}>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={correlationData}>
                    <CartesianGrid />
                    <XAxis dataKey="temperature" name={t('quality.temperature')} unit={t('units.celsius')} />
                    <YAxis dataKey="quality" name={t('quality.qualityShort')} unit={t('units.percent')} />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name={t('quality.temperatureQuality')} fill="#ff4d4f" />
                  </ScatterChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={t('quality.inspectionRecords')} key="3">
          <Card>
            <Table
              columns={columns}
              dataSource={filteredQualityData.slice(0, 50)}
              rowKey="id"
              size="small"
              scroll={{ x: 1000 }}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${t('quality.items')}`,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default QualityManagement;