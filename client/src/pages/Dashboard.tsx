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
  Badge,
  List,
  Progress,
  Divider,
  Tag,
  Tooltip,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  DashboardOutlined,
  LineChartOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import {
  selectDashboard,
  selectAuth,
  selectUnacknowledgedAlerts,
  selectCriticalAlerts,
  selectOperationalEquipment,
  dashboardActions,
  uiActions,
} from '@/store';
import { processAPI, equipmentAPI, alertsAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ActualRealtimeChart from '@/components/Charts/ActualRealtimeChart';
import EquipmentSchematic from '@/components/Equipment/EquipmentSchematic';
// import StatusChart from '@/components/Charts/StatusChart';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { kpis, processData, equipment, timeRange } = useAppSelector(selectDashboard);
  const { user } = useAppSelector(selectAuth);
  const unacknowledgedAlerts = useAppSelector(selectUnacknowledgedAlerts);
  const criticalAlerts = useAppSelector(selectCriticalAlerts);
  const operationalEquipment = useAppSelector(selectOperationalEquipment);

  const [loading, setLoading] = useState({
    dashboard: true,
    alerts: false,
    equipment: false,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    
    try {
      // Load initial data in parallel
      const [processStatus, equipmentStatus, alertsData] = await Promise.all([
        processAPI.getStatus(),
        equipmentAPI.getStatus(),
        alertsAPI.getAlerts({ limit: 10 }),
      ]);

      dispatch(dashboardActions.setEquipment(equipmentStatus.equipment));
      dispatch(dashboardActions.setAlerts(alertsData.alerts));

      dispatch(uiActions.addNotification({
        type: 'success',
        message: 'Dashboard data loaded successfully',
        duration: 2000,
      }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      dispatch(uiActions.addNotification({
        type: 'error',
        message: 'Failed to load dashboard data',
        duration: 5000,
      }));
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  const handleTimeRangeChange = (value: any) => {
    dispatch(dashboardActions.setTimeRange(value));
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await alertsAPI.acknowledgeAlert(alertId, { userId: user?.id });
      dispatch(dashboardActions.acknowledgeAlert(alertId));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'operational':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'critical':
      case 'error':
        return '#ff4d4f';
      case 'offline':
      case 'maintenance':
        return '#8c8c8c';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
      case 'operational':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'critical':
      case 'error':
        return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      case 'offline':
      case 'maintenance':
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const formatNumber = (value: number, decimals = 1) => {
    return Number(value).toFixed(decimals);
  };

  if (loading.dashboard) {
    return <LoadingSpinner tip={t('dashboard.loadingData')} />;
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <DashboardOutlined /> {t('dashboard.title')}
          </Title>
          <Text type="secondary">
            {t('dashboard.subtitle')}
          </Text>
        </div>
        
        <Space>
          <Text>{t('dashboard.timeRange')}:</Text>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            style={{ width: 120 }}
          >
            <Option value="1h">{t('timeRanges.1h')}</Option>
            <Option value="4h">{t('timeRanges.4h')}</Option>
            <Option value="24h">{t('timeRanges.24h')}</Option>
            <Option value="7d">{t('timeRanges.7d')}</Option>
          </Select>
          <Button onClick={loadInitialData} type="primary">
            {t('common.refresh')}
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.overallEfficiency')}
              value={kpis.overallEfficiency}
              precision={1}
              suffix="%"
              valueStyle={{ color: kpis.overallEfficiency >= 85 ? '#3f8600' : '#cf1322' }}
              prefix={
                kpis.overallEfficiency >= 85 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
              }
            />
            <Progress
              percent={kpis.overallEfficiency}
              size="small"
              showInfo={false}
              strokeColor={kpis.overallEfficiency >= 85 ? '#52c41a' : '#ff4d4f'}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.equipmentUptime')}
              value={kpis.equipmentUptime}
              precision={1}
              suffix="%"
              valueStyle={{ color: kpis.equipmentUptime >= 90 ? '#3f8600' : '#cf1322' }}
              prefix={<ThunderboltOutlined />}
            />
            <Progress
              percent={kpis.equipmentUptime}
              size="small"
              showInfo={false}
              strokeColor={kpis.equipmentUptime >= 90 ? '#52c41a' : '#ff4d4f'}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.qualityRate')}
              value={kpis.qualityRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: kpis.qualityRate >= 95 ? '#3f8600' : '#cf1322' }}
              prefix={<SafetyOutlined />}
            />
            <Progress
              percent={kpis.qualityRate}
              size="small"
              showInfo={false}
              strokeColor={kpis.qualityRate >= 95 ? '#52c41a' : '#ff4d4f'}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.activeAlerts')}
              value={kpis.activeAlerts}
              valueStyle={{ color: kpis.activeAlerts > 5 ? '#cf1322' : '#3f8600' }}
              prefix={<ExclamationCircleOutlined />}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color={criticalAlerts.length > 0 ? 'red' : 'green'}>
                {criticalAlerts.length} Critical
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title={t('dashboard.realtimeMonitoring')} extra={<LineChartOutlined />}>
            <ActualRealtimeChart
              data={processData}
              height={300}
              timeRange={timeRange}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title={t('dashboard.processStatusDistribution')}>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#52c41a', borderRadius: '50%', margin: '0 auto 8px' }}></div>
                    <div style={{ fontSize: '12px' }}>{t('dashboard.normal')}</div>
                    <div style={{ fontWeight: 'bold' }}>{processData.filter(d => d.status === 'normal').length}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#faad14', borderRadius: '50%', margin: '0 auto 8px' }}></div>
                    <div style={{ fontSize: '12px' }}>{t('dashboard.warning')}</div>
                    <div style={{ fontWeight: 'bold' }}>{processData.filter(d => d.status === 'warning').length}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#ff4d4f', borderRadius: '50%', margin: '0 auto 8px' }}></div>
                    <div style={{ fontSize: '12px' }}>{t('dashboard.critical')}</div>
                    <div style={{ fontWeight: 'bold' }}>{processData.filter(d => d.status === 'critical').length}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#8c8c8c', borderRadius: '50%', margin: '0 auto 8px' }}></div>
                    <div style={{ fontSize: '12px' }}>{t('dashboard.offline')}</div>
                    <div style={{ fontWeight: 'bold' }}>{processData.filter(d => d.status === 'offline').length}</div>
                  </div>
                </div>
                <div>Process Status Distribution</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Equipment and Alerts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={t('dashboard.equipmentOverview')}
            extra={
              <Badge
                count={operationalEquipment.length}
                style={{ backgroundColor: '#52c41a' }}
                title={`${operationalEquipment.length} operational`}
              />
            }
            style={{ height: '500px', overflowY: 'auto' }}
          >
            <EquipmentSchematic equipment={equipment} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={t('dashboard.recentAlerts')}
            extra={
              <Badge
                count={unacknowledgedAlerts.length}
                style={{ backgroundColor: '#ff4d4f' }}
              />
            }
          >
            <List
              size="small"
              dataSource={unacknowledgedAlerts.slice(0, 8)}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      size="small"
                      onClick={() => handleAcknowledgeAlert(item.id)}
                    >
                      {t('dashboard.acknowledge')}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={getStatusIcon(item.severity)}
                    title={
                      <Space>
                        <Tag color={getStatusColor(item.severity)} size="small">
                          {item.severity.toUpperCase()}
                        </Tag>
                        {item.type.replace('_', ' ').toUpperCase()}
                      </Space>
                    }
                    description={
                      <div>
                        {item.message}
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {format(new Date(item.timestamp), 'MMM dd, HH:mm')} • {item.source}
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

export default Dashboard;