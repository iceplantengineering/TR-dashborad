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
  Progress,
  Divider,
  Tag,
  Tooltip,
  List,
  Badge,
} from 'antd';
import {
  GlobalOutlined,
  ThunderboltOutlined,
  DropboxOutlined,
  ReloadOutlined,
  FireOutlined,
  LineChartOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
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

const { Title, Text } = Typography;
const { Option } = Select;

const COLORS = ['#52c41a', '#1890ff', '#faad14', '#f5222d', '#722ed1'];

const EnvironmentalDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector(selectAuth);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<number>(7);
  const [environmentalData, setEnvironmentalData] = useState<any>(null);

  // Mock data for charts
  const emissionsData = [
    { time: '00:00', co2: 145, nox: 12, so2: 3.2 },
    { time: '04:00', co2: 142, nox: 11.5, so2: 3.1 },
    { time: '08:00', co2: 148, nox: 13.2, so2: 3.4 },
    { time: '12:00', co2: 151, nox: 13.8, so2: 3.6 },
    { time: '16:00', co2: 149, nox: 13.1, so2: 3.3 },
    { time: '20:00', co2: 146, nox: 12.4, so2: 3.2 },
  ];

  const energyData = [
    { hour: '00:00', consumption: 2800, renewable: 1260 },
    { hour: '04:00', consumption: 2650, renewable: 1195 },
    { hour: '08:00', consumption: 3200, renewable: 1440 },
    { hour: '12:00', consumption: 3400, renewable: 1530 },
    { hour: '16:00', consumption: 3300, renewable: 1485 },
    { hour: '20:00', consumption: 2900, renewable: 1305 },
  ];

  const wasteData = [
    { name: 'Recycled', value: 65.8, color: '#52c41a' },
    { name: 'Landfill', value: 20.2, color: '#faad14' },
    { name: 'Incinerated', value: 14.0, color: '#f5222d' },
  ];

  useEffect(() => {
    const fetchEnvironmentalData = async () => {
      try {
        setLoading(true);
        const data = await reportsAPI.getEnvironmentalCompliance(period);
        setEnvironmentalData(data);
      } catch (error) {
        console.error('Error fetching environmental data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnvironmentalData();
  }, [period]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <GlobalOutlined style={{ color: '#52c41a' }} />
            {t('environmental.title', 'Environmental Dashboard')}
          </Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 120 }}
            >
              <Option value={7}>7 Days</Option>
              <Option value={30}>30 Days</Option>
              <Option value={90}>90 Days</Option>
            </Select>
            <Button type="primary" icon={<DownloadOutlined />}>
              Export Report
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Overall Environmental Score"
              value={environmentalData?.overallScore || 92.5}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
            <Progress 
              percent={environmentalData?.overallScore || 92.5} 
              strokeColor="#52c41a"
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="CO₂ Emissions"
              value={environmentalData?.emissions?.co2?.current || 145.2}
              precision={1}
              suffix="t/day"
              valueStyle={{ color: environmentalData?.emissions?.co2?.compliance ? '#52c41a' : '#f5222d' }}
              prefix={<FireOutlined />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Target: {environmentalData?.emissions?.co2?.target || 150.0} t/day
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Energy Efficiency"
              value={environmentalData?.energyConsumption?.efficiency || 94.8}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              prefix={<ThunderboltOutlined />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Renewable: {environmentalData?.energyConsumption?.renewable || 45.2}%
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Water Recycled"
              value={environmentalData?.waterUsage?.recycled || 65.8}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#13c2c2' }}
              prefix={<DropboxOutlined />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Usage: {environmentalData?.waterUsage?.consumption || 1250.4} L/day
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Emissions Monitoring" extra={<Tag color="green">Real-time</Tag>}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emissionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="co2" 
                  stroke="#f5222d" 
                  strokeWidth={2}
                  name="CO₂ (t/day)"
                />
                <Line 
                  type="monotone" 
                  dataKey="nox" 
                  stroke="#faad14" 
                  strokeWidth={2}
                  name="NOx (kg/day)"
                />
                <Line 
                  type="monotone" 
                  dataKey="so2" 
                  stroke="#722ed1" 
                  strokeWidth={2}
                  name="SO₂ (kg/day)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Energy Consumption" extra={<Badge status="success" text="Efficient" />}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Area 
                  type="monotone" 
                  dataKey="consumption" 
                  stackId="1" 
                  stroke="#1890ff" 
                  fill="#1890ff" 
                  fillOpacity={0.6}
                  name="Total (kWh)"
                />
                <Area 
                  type="monotone" 
                  dataKey="renewable" 
                  stackId="2" 
                  stroke="#52c41a" 
                  fill="#52c41a" 
                  fillOpacity={0.8}
                  name="Renewable (kWh)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="Waste Management" extra={<ReloadOutlined style={{ color: '#52c41a' }} />}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={wasteData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {wasteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              {wasteData.map((item, index) => (
                <Tag key={index} color={item.color} style={{ margin: '4px' }}>
                  {item.name}: {item.value}%
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Compliance Status">
            <List
              size="small"
              dataSource={[
                { name: 'Air Quality', status: 'compliant', value: '98.5%' },
                { name: 'Water Discharge', status: 'compliant', value: '100%' },
                { name: 'Noise Levels', status: 'compliant', value: '95.2%' },
                { name: 'Waste Disposal', status: 'warning', value: '88.7%' },
                { name: 'Chemical Storage', status: 'compliant', value: '100%' },
              ]}
              renderItem={item => (
                <List.Item>
                  <Space>
                    {item.status === 'compliant' ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                    )}
                    <Text>{item.name}</Text>
                  </Space>
                  <Text strong style={{ 
                    color: item.status === 'compliant' ? '#52c41a' : '#faad14' 
                  }}>
                    {item.value}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Sustainability Targets">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Carbon Reduction</Text>
                <Text strong>12.3% / 15%</Text>
              </div>
              <Progress percent={82} strokeColor="#52c41a" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Renewable Energy</Text>
                <Text strong>45.2% / 50%</Text>
              </div>
              <Progress percent={90.4} strokeColor="#1890ff" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Waste Reduction</Text>
                <Text strong>28.5% / 25%</Text>
              </div>
              <Progress percent={100} strokeColor="#52c41a" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Water Conservation</Text>
                <Text strong>18.2% / 20%</Text>
              </div>
              <Progress percent={91} strokeColor="#13c2c2" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EnvironmentalDashboard;