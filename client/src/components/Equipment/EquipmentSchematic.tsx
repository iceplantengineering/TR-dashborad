import React from 'react';
import { Card, Progress, Badge, Typography, Tooltip } from 'antd';
import { Equipment } from '@/types';
import { useTranslation } from 'react-i18next';
import {
  ThunderboltOutlined,
  ExperimentOutlined,
  FireOutlined,
  SettingOutlined,
  DatabaseOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface EquipmentSchematicProps {
  equipment: Equipment[];
}

const EquipmentSchematic: React.FC<EquipmentSchematicProps> = ({ equipment }) => {
  const { t } = useTranslation();
  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'polymerization_reactor':
        return <ExperimentOutlined style={{ fontSize: '24px' }} />;
      case 'spinning_machine':
        return <SettingOutlined style={{ fontSize: '24px' }} />;
      case 'stabilization_oven':
        return <FireOutlined style={{ fontSize: '24px' }} />;
      case 'carbonization_furnace':
        return <FireOutlined style={{ fontSize: '24px' }} />;
      case 'surface_treatment':
        return <ThunderboltOutlined style={{ fontSize: '24px' }} />;
      case 'resin_impregnation':
        return <DatabaseOutlined style={{ fontSize: '24px' }} />;
      case 'prepreg_line':
        return <SettingOutlined style={{ fontSize: '24px' }} />;
      case 'autoclave':
        return <FireOutlined style={{ fontSize: '24px' }} />;
      case 'rtm_machine':
        return <ToolOutlined style={{ fontSize: '24px' }} />;
      case 'quality_scanner':
        return <CheckCircleOutlined style={{ fontSize: '24px' }} />;
      default:
        return <SettingOutlined style={{ fontSize: '24px' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#52c41a';
      case 'maintenance': return '#faad14';
      case 'offline': return '#ff4d4f';
      case 'error': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />;
      case 'maintenance':
        return <SettingOutlined style={{ color: '#faad14', fontSize: '16px' }} />;
      case 'offline':
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9', fontSize: '16px' }} />;
    }
  };

  const getEquipmentCardStyle = (status: string) => ({
    border: `2px solid ${getStatusColor(status)}`,
    borderRadius: '12px',
    backgroundColor: status === 'operational' ? '#f6ffed' : 
                    status === 'maintenance' ? '#fff7e6' : 
                    status === 'offline' || status === 'error' ? '#fff2f0' : '#fafafa',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '140px',
  });

  const groupedEquipment = equipment.reduce((acc, eq) => {
    const processType = getProcessType(eq.type);
    if (!acc[processType]) acc[processType] = [];
    acc[processType].push(eq);
    return acc;
  }, {} as { [key: string]: Equipment[] });

  function getProcessType(type: string): string {
    if (['polymerization_reactor', 'spinning_machine'].includes(type)) return t('equipment.panPrecursor');
    if (['stabilization_oven', 'carbonization_furnace', 'surface_treatment'].includes(type)) return t('equipment.carbonFiber');
    if (['resin_impregnation', 'prepreg_line'].includes(type)) return t('equipment.prepreg');
    if (['autoclave', 'rtm_machine'].includes(type)) return t('equipment.composite');
    if (['quality_scanner'].includes(type)) return t('equipment.qualityInspection');
    return t('equipment.other');
  }

  const renderProcessFlow = () => {
    const processOrder = ['PAN前駆体', '炭素繊維', 'プリプレグ', '複合材', '品質検査'];
    const processTranslations = {
      'PAN前駆体': t('equipment.panPrecursor'),
      '炭素繊維': t('equipment.carbonFiber'),
      'プリプレグ': t('equipment.prepreg'),
      '複合材': t('equipment.composite'),
      '品質検査': t('equipment.qualityInspection')
    };

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f2ff 100%)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #d9e7ff'
      }}>
        {processOrder.map((processKey, processIndex) => {
          const equipmentList = groupedEquipment[processKey] || [];
          const processName = processTranslations[processKey] || processKey;
          
          if (equipmentList.length === 0) return null;

          return (
            <div key={processKey} style={{ position: 'relative' }}>
              {/* Process Title with Flow Arrow */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '16px',
                gap: '12px'
              }}>
                <div style={{
                  background: 'linear-gradient(45deg, #1890ff, #40a9ff)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(24,144,255,0.3)'
                }}>
                  {processName}{t('equipment.manufacturingLine')}
                </div>
                {processIndex < processOrder.length - 1 && (
                  <div style={{
                    fontSize: '20px',
                    color: '#1890ff',
                    transform: 'rotate(90deg)'
                  }}>
                    ↓
                  </div>
                )}
              </div>

              {/* Equipment Flow */}
              <div style={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
                marginLeft: '20px',
                padding: '16px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                border: '2px dashed #40a9ff'
              }}>
                {equipmentList.map((eq, index) => (
                  <React.Fragment key={eq.id}>
                    <Tooltip title={`${eq.location} | ${t('equipment.lastMaintenance')}: ${new Date(eq.lastMaintenance).toLocaleDateString()}`}>
                      <div style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                        background: getStatusColor(eq.status) === '#52c41a' ? 'rgba(82,196,26,0.1)' :
                                   getStatusColor(eq.status) === '#faad14' ? 'rgba(250,173,20,0.1)' :
                                   'rgba(255,77,79,0.1)',
                        border: `3px solid ${getStatusColor(eq.status)}`,
                        borderRadius: '16px',
                        minWidth: '120px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: `0 8px 25px ${getStatusColor(eq.status)}33`
                        }
                      }}>
                        {/* Equipment Icon */}
                        <div style={{ 
                          fontSize: '32px',
                          color: getStatusColor(eq.status),
                          marginBottom: '8px'
                        }}>
                          {getEquipmentIcon(eq.type)}
                        </div>

                        {/* Equipment Name */}
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          marginBottom: '6px',
                          color: '#262626',
                          lineHeight: '1.2'
                        }}>
                          {eq.name}
                        </div>

                        {/* Status Indicator */}
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginBottom: '6px'
                        }}>
                          {getStatusIcon(eq.status)}
                          <span style={{ 
                            fontSize: '10px',
                            color: getStatusColor(eq.status),
                            fontWeight: 'bold'
                          }}>
                            {eq.status === 'operational' ? t('dashboard.operational') : 
                             eq.status === 'maintenance' ? t('equipment.maintenance') : 
                             eq.status === 'offline' ? t('dashboard.offline') : t('equipment.error')}
                          </span>
                        </div>

                        {/* Efficiency Bar */}
                        <div style={{ width: '100%', marginTop: '4px' }}>
                          <div style={{ 
                            fontSize: '10px', 
                            color: '#8c8c8c', 
                            marginBottom: '2px',
                            textAlign: 'center'
                          }}>
                            {t('dashboard.efficiency')}: {eq.efficiency.toFixed(0)}%
                          </div>
                          <Progress
                            percent={eq.efficiency}
                            size="small"
                            strokeColor={getStatusColor(eq.status)}
                            showInfo={false}
                            strokeWidth={4}
                          />
                        </div>

                        {/* Pulse Animation for Active Equipment */}
                        {eq.status === 'operational' && (
                          <div style={{
                            position: 'absolute',
                            top: '-3px',
                            right: '-3px',
                            width: '12px',
                            height: '12px',
                            background: '#52c41a',
                            borderRadius: '50%',
                            animation: 'pulse 2s infinite',
                          }} />
                        )}
                      </div>
                    </Tooltip>
                    
                    {/* Process Flow Arrow */}
                    {index < equipmentList.length - 1 && (
                      <div style={{
                        fontSize: '16px',
                        color: '#1890ff',
                        margin: '0 4px'
                      }}>
                        →
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Connecting Line to Next Process */}
              {processIndex < processOrder.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: '-24px',
                  transform: 'translateX(-50%)',
                  width: '3px',
                  height: '24px',
                  background: 'linear-gradient(to bottom, #1890ff, #40a9ff)',
                  borderRadius: '2px'
                }} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(82, 196, 26, 0); }
          100% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0); }
        }
      `}</style>
      {renderProcessFlow()}
    </div>
  );
};

export default EquipmentSchematic;