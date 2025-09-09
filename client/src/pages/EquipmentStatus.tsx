import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  DatePicker,
  Select,
  Input,
  Progress,
  Tooltip,
  Statistic,
  Badge,
} from 'antd';
import {
  ToolOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { selectDashboard, dashboardActions } from '@/store';
import { equipmentAPI } from '@/services/api';
import { Equipment } from '@/types';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import jaJP from 'antd/locale/ja_JP';

const { Title, Text } = Typography;
const { Option } = Select;

const EquipmentStatus: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { equipment } = useAppSelector(selectDashboard);
  
  // Debug log for equipment state (only once per render)
  React.useEffect(() => {
    console.log('Equipment from store:', equipment);
    console.log('Equipment array length:', equipment?.length);
    console.log('First equipment item:', equipment?.[0]);
  }, [equipment]);

  
  const [loading, setLoading] = useState(false);
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();

  useEffect(() => {
    loadEquipmentData();
  }, []);

  const loadEquipmentData = async () => {
    console.log('loadEquipmentData called');
    setLoading(true);
    try {
      const response = await equipmentAPI.getStatus();
      console.log('Equipment API response:', response);
      console.log('Response equipment array:', response.equipment);
      console.log('Response equipment length:', response.equipment?.length);
      dispatch(dashboardActions.setEquipment(response.equipment));
      console.log('Equipment data dispatched to store');
    } catch (error) {
      console.error('Error loading equipment data:', error);
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  };

  const handleScheduleMaintenance = async (values: any) => {
    if (!selectedEquipment) return;

    try {
      await equipmentAPI.scheduleMaintenance(selectedEquipment.id, {
        scheduledDate: values.scheduledDate.format('YYYY-MM-DD HH:mm:ss'),
        maintenanceType: values.maintenanceType,
        duration: values.duration,
        technician: values.technician,
        notes: values.notes,
      });
      
      setMaintenanceModalVisible(false);
      form.resetFields();
      setSelectedEquipment(null);
      loadEquipmentData();
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
    }
  };

  const handleStatusUpdate = async (equipmentId: string, newStatus: string) => {
    try {
      await equipmentAPI.updateStatus(equipmentId, {
        status: newStatus,
        reason: `Status updated to ${newStatus}`,
      });
      loadEquipmentData();
    } catch (error) {
      console.error('Error updating equipment status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'green';
      case 'maintenance': return 'orange';
      case 'offline': return 'red';
      case 'error': return 'red';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'maintenance':
        return <SettingOutlined style={{ color: '#faad14' }} />;
      case 'offline':
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const filteredEquipment = equipment.filter(eq => 
    statusFilter === 'all' || eq.status === statusFilter
  );
  
  // Debug filtered equipment
  React.useEffect(() => {
    console.log('Status filter:', statusFilter);
    console.log('Filtered equipment:', filteredEquipment);
    console.log('Filtered equipment length:', filteredEquipment?.length);
  }, [filteredEquipment, statusFilter]);

  const equipmentSummary = {
    total: equipment.length,
    operational: equipment.filter(eq => eq.status === 'operational').length,
    maintenance: equipment.filter(eq => eq.status === 'maintenance').length,
    offline: equipment.filter(eq => eq.status === 'offline').length,
    error: equipment.filter(eq => eq.status === 'error').length,
    avgEfficiency: equipment.reduce((sum, eq) => sum + eq.efficiency, 0) / equipment.length,
  };

  // Debug table rendering
  React.useEffect(() => {
    console.log('EquipmentStatus - Table columns being created with language:', i18n.language);
    console.log('EquipmentStatus - Column titles:');
    console.log('  equipment.equipment:', t('equipment.equipment'));
    console.log('  common.status:', t('common.status'));
    console.log('  dashboard.efficiency:', t('dashboard.efficiency'));
  }, [i18n.language, t]);

  // Table columns with proper dependency on language changes
  const tableColumns = React.useMemo(() => [
    {
      title: t('equipment.equipment'),
      dataIndex: 'name',
      key: 'equipment',
      render: (name: string, record: Equipment) => (
        <Space>
          {getStatusIcon(record.status)}
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.type.replace('_', ' ')} • {record.location}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: t('dashboard.operational'), value: 'operational' },
        { text: t('equipment.maintenance'), value: 'maintenance' },
        { text: t('dashboard.offline'), value: 'offline' },
        { text: t('equipment.error'), value: 'error' },
      ],
      onFilter: (value: any, record: Equipment) => record.status === value,
    },
    {
      title: t('dashboard.efficiency'),
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency: number) => (
        <div style={{ width: '80px' }}>
          <Progress
            percent={efficiency}
            size="small"
            status={efficiency >= 85 ? 'active' : efficiency >= 70 ? 'normal' : 'exception'}
            format={(percent) => `${percent?.toFixed(1)}%`}
          />
        </div>
      ),
      sorter: (a: Equipment, b: Equipment) => a.efficiency - b.efficiency,
    },
    {
      title: t('equipment.lastMaintenance'),
      dataIndex: 'lastMaintenance',
      key: 'lastMaintenance',
      render: (date: string) => format(new Date(date), 'MMM dd, yyyy'),
      sorter: (a: Equipment, b: Equipment) => 
        new Date(a.lastMaintenance).getTime() - new Date(b.lastMaintenance).getTime(),
    },
    {
      title: t('dashboard.nextMaintenance'),
      dataIndex: 'nextMaintenance',
      key: 'nextMaintenance',
      render: (date: string, record: Equipment) => {
        const daysUntil = Math.ceil(
          (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        const isOverdue = daysUntil < 0;
        const isUpcoming = daysUntil <= 7 && daysUntil >= 0;
        
        return (
          <Tooltip title={`${Math.abs(daysUntil)} days ${isOverdue ? 'overdue' : 'remaining'}`}>
            <Badge
              status={isOverdue ? 'error' : isUpcoming ? 'warning' : 'success'}
              text={format(new Date(date), 'MMM dd')}
            />
          </Tooltip>
        );
      },
    },
    {
      title: t('common.actions'),
      dataIndex: 'actions',
      key: 'actions',
      render: (_: any, record: Equipment) => (
        <Space>
          <Button
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => {
              setSelectedEquipment(record);
              setMaintenanceModalVisible(true);
            }}
          >
            {t('equipment.schedule')}
          </Button>
          <Select
            size="small"
            value={record.status}
            onChange={(value) => handleStatusUpdate(record.id, value)}
            style={{ width: 100 }}
          >
            <Option value="operational">{t('equipment.active')}</Option>
            <Option value="maintenance">{t('equipment.maintenance')}</Option>
            <Option value="offline">{t('dashboard.offline')}</Option>
          </Select>
        </Space>
      ),
    },
  ], [t, i18n.language]); // Dependency array to ensure re-calculation on language change

  return (
    <ConfigProvider locale={i18n.language === 'en' ? enUS : jaJP}>
      <div key={`equipment-page-${i18n.language}`}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ToolOutlined /> {t('equipment.title')}
        </Title>
        <Text type="secondary">
          {t('equipment.subtitle')}
        </Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('equipment.total')}
              value={equipmentSummary.total}
              prefix={<ToolOutlined />}
            />
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              Debug: Total = {equipmentSummary.total}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('dashboard.operational')}
              value={equipmentSummary.operational}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress
                percent={(equipmentSummary.operational / equipmentSummary.total) * 100}
                size="small"
                showInfo={false}
                strokeColor="#52c41a"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('dashboard.averageEfficiency')}
              value={equipmentSummary.avgEfficiency}
              precision={1}
              suffix="%"
              valueStyle={{ 
                color: equipmentSummary.avgEfficiency >= 85 ? '#3f8600' : '#cf1322' 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('equipment.needAttention')}
              value={equipmentSummary.maintenance + equipmentSummary.error + equipmentSummary.offline}
              valueStyle={{ 
                color: (equipmentSummary.maintenance + equipmentSummary.error + equipmentSummary.offline) > 0 ? '#cf1322' : '#3f8600' 
              }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>{t('equipment.filterByStatus')}:</Text>
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">{t('equipment.allEquipment')}</Option>
              <Option value="operational">{t('dashboard.operational')}</Option>
              <Option value="maintenance">{t('equipment.maintenance')}</Option>
              <Option value="offline">{t('dashboard.offline')}</Option>
              <Option value="error">{t('equipment.error')}</Option>
            </Select>
          </Col>
          <Col>
            <Button onClick={loadEquipmentData} loading={loading}>
              {t('equipment.refreshData')}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Equipment Table */}
      <Card title={`${t('dashboard.equipmentOverview')} (${filteredEquipment.length} ${t('equipment.items')})`}>
        
        {/* Direct table rendering with fallback */}
        {filteredEquipment.length > 0 ? (
          <>
            <Table
              key={`equipment-table-${i18n.language}`}
              columns={tableColumns}
              dataSource={filteredEquipment}
              rowKey="id"
              loading={loading}
                pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} ${t('equipment.equipment')}`,
          }}
          scroll={{ x: 800 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '16px' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Text strong>{t('equipment.equipmentType')}:</Text>
                    <br />
                    {record.type.replace('_', ' ').toUpperCase()}
                  </Col>
                  <Col span={8}>
                    <Text strong>{t('common.location')}:</Text>
                    <br />
                    {record.location}
                  </Col>
                  <Col span={8}>
                    <Text strong>{t('equipment.currentEfficiency')}:</Text>
                    <br />
                    <Progress
                      percent={record.efficiency}
                      size="small"
                      status={record.efficiency >= 85 ? 'active' : 'exception'}
                    />
                  </Col>
                </Row>
              </div>
            ),
          }}
            />
          </>
        ) : (
          <div style={{ padding: '20px', color: 'red', border: '1px solid red' }}>
            ❌ NO DATA: filteredEquipment.length = {filteredEquipment.length}
          </div>
        )}
      </Card>

      {/* Maintenance Schedule Modal */}
      <Modal
        title={t('equipment.scheduleMaintenance')}
        open={maintenanceModalVisible}
        onCancel={() => {
          setMaintenanceModalVisible(false);
          form.resetFields();
          setSelectedEquipment(null);
        }}
        footer={null}
        width={600}
      >
        {selectedEquipment && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <Text strong>{t('equipment.equipment')}: </Text>
            {selectedEquipment.name} ({selectedEquipment.location})
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleScheduleMaintenance}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scheduledDate"
                label={t('equipment.scheduledDateTime')}
                rules={[{ required: true, message: 'Please select date and time' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maintenanceType"
                label={t('equipment.maintenanceType')}
                rules={[{ required: true, message: 'Please select maintenance type' }]}
              >
                <Select placeholder="Select maintenance type">
                  <Option value="preventive">{t('equipment.preventive')}</Option>
                  <Option value="corrective">{t('equipment.corrective')}</Option>
                  <Option value="predictive">{t('equipment.predictive')}</Option>
                  <Option value="emergency">{t('equipment.emergency')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="duration" label={t('equipment.estimatedDuration')}>
                <Input type="number" placeholder="Enter duration" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="technician" label={t('equipment.assignedTechnician')}>
                <Select placeholder="Select technician">
                  <Option value="Tech-001">John Smith (Tech-001)</Option>
                  <Option value="Tech-002">Mike Johnson (Tech-002)</Option>
                  <Option value="Tech-003">Sarah Wilson (Tech-003)</Option>
                  <Option value="Tech-004">David Brown (Tech-004)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label={t('equipment.notes')}>
            <Input.TextArea
              placeholder="Enter maintenance notes or special instructions"
              rows={3}
            />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setMaintenanceModalVisible(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('equipment.scheduleMaintenance')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
    </ConfigProvider>
  );
};

export default EquipmentStatus;