import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Button,
  Select,
  Table,
  Tag,
  Tooltip,
  Tabs,
  DatePicker,
  List,
  Progress,
  Divider,
  Badge,
  Avatar,
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAppSelector } from '@/hooks/redux';
import { selectAuth } from '@/store';
import { reportsAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector(selectAuth);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('production');
  const [period, setPeriod] = useState<number>(7);
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  
  const [productionData, setProductionData] = useState<any>(null);
  const [qualityData, setQualityData] = useState<any>(null);
  const [environmentalData, setEnvironmentalData] = useState<any>(null);
  const [equipmentData, setEquipmentData] = useState<any>(null);
  const [esgData, setESGData] = useState<any>(null);

  // Mock chart data
  const productionTrendData = [
    { date: '2024-01-01', production: 1150, target: 1200, efficiency: 95.8 },
    { date: '2024-01-02', production: 1200, target: 1200, efficiency: 100.0 },
    { date: '2024-01-03', production: 1180, target: 1200, efficiency: 98.3 },
    { date: '2024-01-04', production: 1250, target: 1200, efficiency: 104.2 },
    { date: '2024-01-05', production: 1220, target: 1200, efficiency: 101.7 },
    { date: '2024-01-06', production: 1190, target: 1200, efficiency: 99.2 },
    { date: '2024-01-07', production: 1280, target: 1200, efficiency: 106.7 },
  ];

  const processTypeData = [
    { name: 'PAN', value: 425.2, color: '#1890ff' },
    { name: 'Carbon Fiber', value: 380.8, color: '#52c41a' },
    { name: 'Prepreg', value: 290.5, color: '#faad14' },
    { name: 'Composite', value: 154.0, color: '#f5222d' },
  ];

  const qualityTrendData = [
    { date: '2024-01-01', defectRate: 1.2, firstPassYield: 95.5, customerComplaints: 3 },
    { date: '2024-01-02', defectRate: 1.1, firstPassYield: 96.0, customerComplaints: 2 },
    { date: '2024-01-03', defectRate: 0.9, firstPassYield: 96.8, customerComplaints: 1 },
    { date: '2024-01-04', defectRate: 1.0, firstPassYield: 96.5, customerComplaints: 2 },
    { date: '2024-01-05', defectRate: 0.8, firstPassYield: 97.2, customerComplaints: 1 },
    { date: '2024-01-06', defectRate: 0.7, firstPassYield: 97.5, customerComplaints: 0 },
    { date: '2024-01-07', defectRate: 0.8, firstPassYield: 97.0, customerComplaints: 1 },
  ];

  const recentReports = [
    {
      id: '1',
      name: 'Monthly Production Summary',
      type: 'Production',
      createdAt: new Date('2024-01-07T10:30:00'),
      status: 'completed',
      size: '2.4 MB'
    },
    {
      id: '2',
      name: 'Quality Assurance Report',
      type: 'Quality',
      createdAt: new Date('2024-01-07T08:15:00'),
      status: 'completed',
      size: '1.8 MB'
    },
    {
      id: '3',
      name: 'Environmental Compliance',
      type: 'Environmental',
      createdAt: new Date('2024-01-06T16:45:00'),
      status: 'completed',
      size: '3.2 MB'
    },
    {
      id: '4',
      name: 'Equipment Performance',
      type: 'Equipment',
      createdAt: new Date('2024-01-06T14:20:00'),
      status: 'processing',
      size: '1.5 MB'
    },
    {
      id: '5',
      name: 'ESG Sustainability Report',
      type: 'ESG',
      createdAt: new Date('2024-01-05T11:30:00'),
      status: 'completed',
      size: '4.1 MB'
    }
  ];

  useEffect(() => {
    const fetchAllReportsData = async () => {
      try {
        setLoading(true);
        const [production, quality, environmental, equipment, esg] = await Promise.all([
          reportsAPI.getProductionSummary(),
          reportsAPI.getQualityAssurance({ period }),
          reportsAPI.getEnvironmentalCompliance(period),
          reportsAPI.getEquipmentPerformance(period),
          reportsAPI.getESGSustainability(period)
        ]);
        
        setProductionData(production);
        setQualityData(quality);
        setEnvironmentalData(environmental);
        setEquipmentData(equipment);
        setESGData(esg);
      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReportsData();
  }, [period]);

  const handleDownloadReport = (reportId: string) => {
    console.log('Downloading report:', reportId);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const getTranslatedType = (type: string) => {
    switch (type) {
      case 'Production': return t('reports.production');
      case 'Quality': return t('reports.quality');
      case 'Environmental': return t('reports.environmental');
      case 'Equipment': return 'Equipment';
      case 'ESG': return 'ESG';
      default: return type;
    }
  };

  const getTranslatedStatus = (status: string) => {
    switch (status) {
      case 'completed': return t('reports.completed');
      case 'processing': return t('reports.processing');
      default: return status;
    }
  };

  const getTranslatedReportName = (name: string) => {
    switch (name) {
      case 'Monthly Production Summary': return t('reports.monthlyProductionSummary');
      case 'Quality Assurance Report': return t('reports.qualityAssuranceReport');
      case 'Environmental Compliance': return t('reports.environmentalCompliance');
      case 'Equipment Performance': return t('reports.equipmentPerformance');
      case 'ESG Sustainability Report': return t('reports.esgSustainabilityReport');
      default: return name;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const ProductionTab = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('reports.totalProduction')}
              value={productionData?.totalProduction || 1250.5}
              precision={1}
              suffix={t('reports.tons')}
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('reports.overallEfficiency')}
              value={productionData?.efficiency || 95.8}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('reports.qualityRate')}
              value={productionData?.qualityRate || 99.2}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('reports.downtime')}
              value={productionData?.downtime?.total || 4.2}
              precision={1}
              suffix={t('reports.hrs')}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={t('reports.productionTrend')} extra={<Tag color="blue">7 {t('reports.days')}</Tag>}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MM/dd')} />
                <YAxis />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#1890ff" 
                  strokeWidth={3}
                  name={`${t('reports.production')} (${t('reports.tons')})`}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name={`Target (${t('reports.tons')})`}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('reports.productionByProcessType')}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {processTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value} ${t('reports.tons')}`, t('reports.production')]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Tag color="#1890ff" style={{ margin: '4px' }}>
                PAN: 425.2{t('reports.tons')}
              </Tag>
              <Tag color="#52c41a" style={{ margin: '4px' }}>
                Carbon Fiber: 380.8{t('reports.tons')}
              </Tag>
              <Tag color="#faad14" style={{ margin: '4px' }}>
                Prepreg: 290.5{t('reports.tons')}
              </Tag>
              <Tag color="#f5222d" style={{ margin: '4px' }}>
                Composite: 154.0{t('reports.tons')}
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const QualityTab = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('reports.overallQuality')}
              value={qualityData?.overallQuality || 99.2}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('reports.defectRate')}
              value={qualityData?.defectRate || 0.8}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('reports.firstPassYield')}
              value={qualityData?.firstPassYield || 96.5}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('reports.customerComplaints')}
              value={qualityData?.customerComplaints || 2}
              valueStyle={{ color: '#f5222d' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title={t('reports.qualityTrendAnalysis')}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={qualityTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MM/dd')} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <RechartsTooltip />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="defectRate" 
              stroke="#f5222d" 
              strokeWidth={2}
              name="Defect Rate (%)"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="firstPassYield" 
              stroke="#52c41a" 
              strokeWidth={2}
              name="First Pass Yield (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const EnvironmentalTab = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('reports.environmentalScore')}
              value={environmentalData?.overallScore || 92.5}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="CO₂ Emissions"
              value={environmentalData?.emissions?.co2?.current || 145.2}
              precision={1}
              suffix="t/day"
              valueStyle={{ color: '#52c41a' }}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('environmental.energyEfficiency')}
              value={environmentalData?.energyConsumption?.efficiency || 94.8}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('environmental.waterRecycled')}
              value={environmentalData?.wasteManagement?.recyclingRate || 87.5}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title={t('reports.environmentalComplianceStatus')}>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
          dataSource={[
            { name: 'Air Quality', status: 'compliant', value: '98.5%', icon: <CheckCircleOutlined /> },
            { name: 'Water Discharge', status: 'compliant', value: '100%', icon: <CheckCircleOutlined /> },
            { name: 'Noise Levels', status: 'compliant', value: '95.2%', icon: <CheckCircleOutlined /> },
            { name: 'Waste Management', status: 'warning', value: '88.7%', icon: <ExclamationCircleOutlined /> },
            { name: 'Energy Consumption', status: 'compliant', value: '94.8%', icon: <CheckCircleOutlined /> },
            { name: 'Chemical Storage', status: 'compliant', value: '100%', icon: <CheckCircleOutlined /> },
          ]}
          renderItem={item => (
            <List.Item>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '24px', 
                    color: item.status === 'compliant' ? '#52c41a' : '#faad14',
                    marginBottom: 8
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.name}</div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: item.status === 'compliant' ? '#52c41a' : '#faad14'
                  }}>
                    {item.value}
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            {t('reports.title', 'Reports Dashboard')}
          </Title>
        </Col>
        <Col>
          <Space>
            <RangePicker 
              value={dateRange}
              onChange={setDateRange}
              style={{ width: 240 }}
            />
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 120 }}
            >
              <Option value={7}>7 {t('reports.days')}</Option>
              <Option value={30}>30 {t('reports.days')}</Option>
              <Option value={90}>90 {t('reports.days')}</Option>
            </Select>
            <Button icon={<PrinterOutlined />} onClick={handlePrintReport}>
              {t('reports.print')}
            </Button>
            <Button type="primary" icon={<DownloadOutlined />}>
              {t('reports.exportAll')}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Recent Reports Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={t('reports.production')} key="production" icon={<BarChartOutlined />}>
              <ProductionTab />
            </TabPane>
            <TabPane tab={t('reports.quality')} key="quality" icon={<SafetyOutlined />}>
              <QualityTab />
            </TabPane>
            <TabPane tab={t('reports.environmental')} key="environmental" icon={<GlobalOutlined />}>
              <EnvironmentalTab />
            </TabPane>
          </Tabs>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('reports.recentReports')} extra={<CalendarOutlined />}>
            <List
              size="small"
              dataSource={recentReports}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownloadReport(item.id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          backgroundColor: item.status === 'completed' ? '#52c41a' : '#faad14' 
                        }}
                      >
                        <FileTextOutlined />
                      </Avatar>
                    }
                    title={
                      <div>
                        <Text strong>{getTranslatedReportName(item.name)}</Text>
                        <Badge 
                          status={item.status === 'completed' ? 'success' : 'processing'}
                          style={{ marginLeft: 8 }}
                        />
                      </div>
                    }
                    description={
                      <div>
                        <Tag color="blue">{getTranslatedType(item.type)}</Tag>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {format(item.createdAt, 'MMM dd, yyyy HH:mm')} • {item.size}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;