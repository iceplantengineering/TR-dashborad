import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Tooltip,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
} from 'antd';
import {
  ExperimentOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { selectDashboard, selectAuth, dashboardActions } from '@/store';
import { processAPI } from '@/services/api';
import RealtimeChart from '@/components/Charts/RealtimeChart';
import { ProcessData } from '@/types';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Option } = Select;

const ProcessMonitoring: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { processData, timeRange } = useAppSelector(selectDashboard);
  const { user } = useAppSelector(selectAuth);
  
  const [selectedProcess, setSelectedProcess] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [controlModalVisible, setControlModalVisible] = useState(false);
  const [processParameters, setProcessParameters] = useState<any>({});
  const [form] = Form.useForm();

  useEffect(() => {
    loadProcessData();
  }, [selectedProcess, selectedStage, timeRange]);

  const loadProcessData = async () => {
    setLoading(true);
    try {
      const params: any = { hours: getHoursFromTimeRange(timeRange) };
      if (selectedProcess !== 'all') {
        params.processType = selectedProcess;
      }
      if (selectedStage !== 'all') {
        params.stage = selectedStage;
      }

      const response = await processAPI.getHistory(params);
      dispatch(dashboardActions.setProcessData(response.data));
    } catch (error) {
      console.error('Error loading process data:', error);
      message.error('Failed to load process data');
    } finally {
      setLoading(false);
    }
  };

  const getHoursFromTimeRange = (range: string): number => {
    switch (range) {
      case '1h': return 1;
      case '4h': return 4;
      case '24h': return 24;
      case '7d': return 24 * 7;
      default: return 24;
    }
  };

  const processTypes = [
    { value: 'all', label: t('process.allProcesses') },
    { value: 'pan', label: t('process.panPrecursor') },
    { value: 'carbon_fiber', label: t('process.carbonFiber') },
    { value: 'prepreg', label: t('process.prepreg') },
    { value: 'composite', label: t('process.composite') },
  ];

  const stages = [
    { value: 'all', label: t('process.allStages') },
    { value: 'polymerization', label: t('process.polymerization') },
    { value: 'spinning', label: t('process.spinning') },
    { value: 'stabilization', label: t('process.stabilization') },
    { value: 'carbonization', label: t('process.carbonization') },
    { value: 'resin_impregnation', label: t('process.resinImpregnation') },
    { value: 'autoclave_curing', label: t('process.autoclaveCuring') },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'green';
      case 'warning': return 'orange';
      case 'critical': return 'red';
      case 'offline': return 'default';
      default: return 'default';
    }
  };

  const handleProcessControl = async (values: any) => {
    try {
      await processAPI.executeControl({
        processType: selectedProcess,
        stage: selectedStage,
        action: values.action,
        parameters: values.parameters,
        reason: values.reason,
      });
      message.success('Process control command executed successfully');
      setControlModalVisible(false);
      form.resetFields();
      loadProcessData();
    } catch (error) {
      console.error('Error executing process control:', error);
      message.error('Failed to execute process control');
    }
  };

  const filteredData = processData.filter(data => {
    if (selectedProcess !== 'all' && data.processType !== selectedProcess) return false;
    if (selectedStage !== 'all' && data.stage !== selectedStage) return false;
    return true;
  });

  const tableColumns = [
    {
      title: t('process.timestamp'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => format(new Date(timestamp), 'MMM dd, HH:mm:ss'),
      sorter: (a: ProcessData, b: ProcessData) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: t('process.processType'),
      dataIndex: 'processType',
      key: 'processType',
      render: (processType: string) => (
        <Tag color="blue">{processType.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: t('process.stage'),
      dataIndex: 'stage',
      key: 'stage',
      render: (stage: string) => (
        <Tag color="geekblue">{stage.replace('_', ' ')}</Tag>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: t('process.temperature'),
      key: 'temperature',
      render: (record: ProcessData) => `${record.environmental.temperature.toFixed(1)}°C`,
    },
    {
      title: t('process.pressure'),
      key: 'pressure',
      render: (record: ProcessData) => `${record.environmental.pressure.toFixed(2)} MPa`,
    },
    {
      title: t('process.qualityScore'),
      key: 'qualityScore',
      render: (record: ProcessData) => {
        const score = record.quality.tensileStrength ? 
          Math.min(100, (record.quality.tensileStrength / 3500) * 100) : 95;
        return (
          <Tooltip title={`${t('process.tensileStrength')}: ${record.quality.tensileStrength?.toFixed(0) || 'N/A'} MPa`}>
            <Tag color={score >= 90 ? 'green' : score >= 75 ? 'orange' : 'red'}>
              {score.toFixed(1)}%
            </Tag>
          </Tooltip>
        );
      },
    },
  ];

  const canControlProcess = user?.permissions.includes('control_process') || 
                           user?.role === 'operator' || 
                           user?.role === 'production_manager';

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ExperimentOutlined /> {t('process.title')}
        </Title>
        <Text type="secondary">
          {t('process.subtitle')}
        </Text>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>{t('process.processType')}:</Text>
          </Col>
          <Col>
            <Select
              value={selectedProcess}
              onChange={setSelectedProcess}
              style={{ width: 200 }}
            >
              {processTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Text strong>{t('process.stage')}:</Text>
          </Col>
          <Col>
            <Select
              value={selectedStage}
              onChange={setSelectedStage}
              style={{ width: 200 }}
            >
              {stages.map(stage => (
                <Option key={stage.value} value={stage.value}>
                  {stage.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadProcessData} loading={loading}>
                {t('common.refresh')}
              </Button>
              {canControlProcess && (
                <Button
                  type="primary"
                  icon={<SettingOutlined />}
                  onClick={() => setControlModalVisible(true)}
                  disabled={selectedProcess === 'all'}
                >
                  {t('process.processControl')}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Real-time Chart */}
      <Card title={t('process.realtimeProcessData')} style={{ marginBottom: '24px' }}>
        <RealtimeChart
          data={filteredData}
          height={400}
          timeRange={timeRange}
          showControls={true}
        />
      </Card>

      {/* Data Table */}
      <Card title={`${t('process.processData')} (${filteredData.length} ${t('process.records')})`}>
        <Table
          columns={tableColumns}
          dataSource={filteredData.slice(0, 100)} // Limit to last 100 records for performance
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} ${t('process.records')}`,
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>

      {/* Process Control Modal */}
      <Modal
        title={t('process.processControl')}
        open={controlModalVisible}
        onCancel={() => {
          setControlModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleProcessControl}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="action"
                label={t('process.controlAction')}
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select placeholder="Select action">
                  <Option value="start">{t('process.startProcess')}</Option>
                  <Option value="stop">{t('process.stopProcess')}</Option>
                  <Option value="pause">{t('process.pauseProcess')}</Option>
                  <Option value="adjust_temperature">{t('process.adjustTemperature')}</Option>
                  <Option value="adjust_pressure">{t('process.adjustPressure')}</Option>
                  <Option value="adjust_speed">{t('process.adjustSpeed')}</Option>
                  <Option value="emergency_stop">{t('process.emergencyStop')}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="target_value" label={t('process.targetValue')}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter target value"
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="reason" label={t('process.reason')}>
            <Input.TextArea
              placeholder="Enter reason for this control action"
              rows={3}
            />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setControlModalVisible(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('process.executeControl')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProcessMonitoring;