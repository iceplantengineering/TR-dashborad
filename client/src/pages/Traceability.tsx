import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Table,
  Badge,
  Descriptions,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Tag,
  Image,
  Timeline,
  message,
  Alert,
  Progress,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface ProductData {
  productName: string;
  manufacturingNumber: string;
  manufacturingDate: string;
  status: 'certified' | 'conventional';
  ghgEmissions: number;
  carbonIntensity: {
    en: string;
    ja: string;
  };
  compliance: string[];
  batchInfo: {
    totalInput: number;
    bioInput: number;
    bioPercentage: number;
    productionAmount: number;
    creditAllocation: number;
    creditRate: number;
    remainingCredit: number;
  };
  processFlow: Array<{
    step: {
      en: string;
      ja: string;
    };
    details: {
      en: string;
      ja: string;
    };
    layer: string;
  }>;
}

const Traceability: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<ProductData | null>(null);

  // Sample data with multiple products
  const sampleDataMap: Record<string, ProductData> = {
    'FB-20250910-001': {
      productName: 'TORAYCA™ T700S',
      manufacturingNumber: 'FB-20250910-001',
      manufacturingDate: '2025-09-10',
      status: 'certified',
      ghgEmissions: 15.2,
      carbonIntensity: {
        en: 'Low (A Rank)',
        ja: '低 (Aランク)'
      },
      compliance: ['ISCC PLUS', 'APS v5.0'],
      batchInfo: {
        totalInput: 1000,
        bioInput: 100,
        bioPercentage: 10,
        productionAmount: 95,
        creditAllocation: 95,
        creditRate: 100,
        remainingCredit: 5,
      },
      processFlow: [
        {
          step: {
            en: 'Raw Material Receiving',
            ja: '原材料受入'
          },
          details: {
            en: 'Manufacturer: Shinwa, Manufacturer Lot: SH-20250815, Classification: Bio-based',
            ja: 'メーカー: Shinwa, メーカーロット: SH-20250815, 分類: バイオ由来'
          },
          layer: 'L1/L2',
        },
        {
          step: {
            en: 'Manufacturing Order Issue',
            ja: '製造オーダー発行'
          },
          details: {
            en: 'Order Number: PO-1138',
            ja: 'オーダー番号: PO-1138'
          },
          layer: 'L4 ERP',
        },
        {
          step: {
            en: 'Batch Creation & Input',
            ja: 'バッチ作成・投入'
          },
          details: {
            en: 'Batch ID: BATCH-451',
            ja: 'バッチID: BATCH-451'
          },
          layer: 'L3 MES',
        },
        {
          step: {
            en: 'Manufacturing Condition Recording',
            ja: '製造コンディション記録'
          },
          details: {
            en: 'Temperature: 1800°C, Speed: 1.5m/s',
            ja: '温度: 1800°C, 速度: 1.5m/s'
          },
          layer: 'L2 SCADA',
        },
        {
          step: {
            en: 'Product (Bobbin) Completion',
            ja: '製品（ボビン）完成'
          },
          details: {
            en: 'Manufacturing Number: FB-20250910-001, Quantity: 95 t',
            ja: '製造番号: FB-20250910-001, 数量: 95 t'
          },
          layer: 'L1/L2',
        },
      ],
    },
    'FB-20250910-002': {
      productName: 'TORAYCA™ T800S',
      manufacturingNumber: 'FB-20250910-002',
      manufacturingDate: '2025-09-10',
      status: 'conventional',
      ghgEmissions: 18.5,
      carbonIntensity: {
        en: 'Medium (B Rank)',
        ja: '中 (Bランク)'
      },
      compliance: ['ISO 14040', 'REACH'],
      batchInfo: {
        totalInput: 1000,
        bioInput: 0,
        bioPercentage: 0,
        productionAmount: 100,
        creditAllocation: 0,
        creditRate: 0,
        remainingCredit: 100,
      },
      processFlow: [
        {
          step: {
            en: 'Raw Material Receiving',
            ja: '原材料受入'
          },
          details: {
            en: 'Manufacturer: Standard Chemical, Manufacturer Lot: SC-20250815, Classification: Conventional Material',
            ja: 'メーカー: Standard Chemical, メーカーロット: SC-20250815, 分類: 従来原料'
          },
          layer: 'L1/L2',
        },
        {
          step: {
            en: 'Manufacturing Order Issue',
            ja: '製造オーダー発行'
          },
          details: {
            en: 'Order Number: PO-1139',
            ja: 'オーダー番号: PO-1139'
          },
          layer: 'L4 ERP',
        },
        {
          step: {
            en: 'Batch Creation & Input',
            ja: 'バッチ作成・投入'
          },
          details: {
            en: 'Batch ID: BATCH-452',
            ja: 'バッチID: BATCH-452'
          },
          layer: 'L3 MES',
        },
        {
          step: {
            en: 'Manufacturing Condition Recording',
            ja: '製造コンディション記録'
          },
          details: {
            en: 'Temperature: 1850°C, Speed: 1.8m/s',
            ja: '温度: 1850°C, 速度: 1.8m/s'
          },
          layer: 'L2 SCADA',
        },
        {
          step: {
            en: 'Product (Bobbin) Completion',
            ja: '製品（ボビン）完成'
          },
          details: {
            en: 'Manufacturing Number: FB-20250910-002, Quantity: 100 t',
            ja: '製造番号: FB-20250910-002, 数量: 100 t'
          },
          layer: 'L1/L2',
        },
      ],
    },
    'FB-20250910-003': {
      productName: 'TORAYCA™ M40J',
      manufacturingNumber: 'FB-20250910-003',
      manufacturingDate: '2025-09-10',
      status: 'certified',
      ghgEmissions: 14.8,
      carbonIntensity: {
        en: 'Low (A Rank)',
        ja: '低 (Aランク)'
      },
      compliance: ['ISCC PLUS', 'APS v5.0', 'RSB'],
      batchInfo: {
        totalInput: 1000,
        bioInput: 100,
        bioPercentage: 10,
        productionAmount: 100,
        creditAllocation: 50,
        creditRate: 50,
        remainingCredit: 50,
      },
      processFlow: [
        {
          step: {
            en: 'Raw Material Receiving',
            ja: '原材料受入'
          },
          details: {
            en: 'Manufacturer: Bio Materials Co., Manufacturer Lot: BM-20250815, Classification: Bio-based',
            ja: 'メーカー: Bio Materials Co., メーカーロット: BM-20250815, 分類: バイオ由来'
          },
          layer: 'L1/L2',
        },
        {
          step: {
            en: 'Manufacturing Order Issue',
            ja: '製造オーダー発行'
          },
          details: {
            en: 'Order Number: PO-1140',
            ja: 'オーダー番号: PO-1140'
          },
          layer: 'L4 ERP',
        },
        {
          step: {
            en: 'Batch Creation & Input',
            ja: 'バッチ作成・投入'
          },
          details: {
            en: 'Batch ID: BATCH-453',
            ja: 'バッチID: BATCH-453'
          },
          layer: 'L3 MES',
        },
        {
          step: {
            en: 'Manufacturing Condition Recording',
            ja: '製造コンディション記録'
          },
          details: {
            en: 'Temperature: 1750°C, Speed: 1.2m/s',
            ja: '温度: 1750°C, 速度: 1.2m/s'
          },
          layer: 'L2 SCADA',
        },
        {
          step: {
            en: 'Product (Bobbin) Completion',
            ja: '製品（ボビン）完成'
          },
          details: {
            en: 'Manufacturing Number: FB-20250910-003, Quantity: 100 t',
            ja: '製造番号: FB-20250910-003, 数量: 100 t'
          },
          layer: 'L1/L2',
        },
      ],
    },
  };

  // Credit allocation table data
  const allocationData = [
    {
      key: '1',
      lotNumber: 'FB-20250910-001',
      production: 95,
      currentAllocation: 95,
      allocationRate: 100,
      status: 'confirmed',
    },
    {
      key: '2',
      lotNumber: 'FB-20250910-002',
      production: 100,
      currentAllocation: 0,
      allocationRate: 0,
      status: 'pending',
    },
    {
      key: '3',
      lotNumber: 'FB-20250910-003',
      production: 100,
      currentAllocation: 0,
      allocationRate: 0,
      status: 'pending',
    },
  ];

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      message.warning(t('traceability.searchWarning'));
      return;
    }

    setLoading(true);
    
    // Simulate API call with multiple sample data
    setTimeout(() => {
      const foundData = sampleDataMap[value];
      if (foundData) {
        setSearchResult(foundData);
        message.success(t('traceability.searchSuccess'));
      } else if (value.includes('FB-') || value.includes('TC-') || value.includes('TM-')) {
        // Provide alternative suggestion
        setSearchResult(null);
        message.error(t('traceability.searchNotFound') + ' 利用可能なサンプル: FB-20250910-001, FB-20250910-002, FB-20250910-003');
      } else {
        setSearchResult(null);
        message.error(t('traceability.searchNotFound'));
      }
      setLoading(false);
    }, 1000);
  };

  const allocationColumns = [
    {
      title: t('traceability.lotNumber'),
      dataIndex: 'lotNumber',
      key: 'lotNumber',
    },
    {
      title: `${t('traceability.production')} (${t('traceability.tons')})`,
      dataIndex: 'production',
      key: 'production',
    },
    {
      title: `${t('traceability.currentAllocation')} (${t('traceability.tons')})`,
      dataIndex: 'currentAllocation',
      key: 'currentAllocation',
    },
    {
      title: `${t('traceability.allocationRate')} (${t('traceability.percent')})`,
      dataIndex: 'allocationRate',
      key: 'allocationRate',
      render: (rate: number) => `${rate}${t('traceability.percent')}`,
    },
    {
      title: t('traceability.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'confirmed' ? 'success' : 'processing'}
          text={status === 'confirmed' ? t('traceability.confirmed') : t('traceability.editable')}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HistoryOutlined />
          {t('traceability.title')}
        </Title>
        <Text type="secondary">
          {t('traceability.subtitle')}
        </Text>
      </div>

      {/* Search Section */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          <SearchOutlined /> {t('traceability.productLotSearch')}
        </Title>
        <Paragraph>
          {t('traceability.searchDescription')}
        </Paragraph>
        <Search
          placeholder={t('traceability.searchPlaceholder')}
          allowClear
          enterButton={t('traceability.searchButton')}
          size="large"
          loading={loading}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{ maxWidth: 400 }}
        />
      </Card>

      {/* Search Results */}
      {searchResult && (
        <>
          <Card title={`${t('traceability.searchResults')}: ${searchResult.manufacturingNumber}`} style={{ marginBottom: 24 }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card size="small" title={t('traceability.productOverview')}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label={t('traceability.productName')}>
                      {searchResult.productName}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('traceability.manufacturingNumber')}>
                      {searchResult.manufacturingNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('traceability.manufacturingDate')}>
                      {searchResult.manufacturingDate}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('traceability.status')}>
                      <Tag
                        color={searchResult.status === 'certified' ? 'green' : 'default'}
                        icon={<SafetyCertificateOutlined />}
                      >
                        {searchResult.status === 'certified' ? 'ISCC+ 100%クレジット製品' : '従来製品'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card size="small" title={t('traceability.sustainabilityInfo')}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label={t('traceability.ghgEmissions')}>
                      {searchResult.ghgEmissions} t-CO2e/t-{currentLanguage === 'ja' ? '製品' : 'product'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('traceability.carbonIntensity')}>
                      {currentLanguage === 'ja' ? searchResult.carbonIntensity.ja : searchResult.carbonIntensity.en}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('traceability.compliance')}>
                      {searchResult.compliance.map(item => (
                        <Tag key={item} color="blue">{item}</Tag>
                      ))}
                    </Descriptions.Item>
                  </Descriptions>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    style={{ marginTop: 16 }}
                  >
                    {t('traceability.downloadSD')}
                  </Button>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Mass Balance Flow */}
          <Card title={t('traceability.massBalanceAllocation')} style={{ marginBottom: 24 }}>
            <Alert
              message={t('traceability.massBalanceAllocation')}
              description={
                <div>
                  {t('traceability.massBalanceDescription')}
                  <a
                    href="https://www.iscc-system.org/certification/traceability-and-chain-of-custody/mass-balance/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: 4 }}
                  >
                    ISCC PLUSのマスバランス方式
                  </a>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card size="small" title={`${t('traceability.massBalanceDetails')} (${t('traceability.rawMaterialBatch')}: RM-20250820-A)`}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>{t('traceability.totalInput')}: </Text>
                      <Text>{searchResult.batchInfo.totalInput} {t('traceability.tons')}</Text>
                    </div>
                    <div>
                      <Text strong>{t('traceability.bioInput')}: </Text>
                      <Text>{searchResult.batchInfo.bioInput} {t('traceability.tons')} ({searchResult.batchInfo.bioPercentage}{t('traceability.percent')})</Text>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                    <div>
                      <Text strong>{t('traceability.currentLotProduction')}: </Text>
                      <Text>{searchResult.batchInfo.productionAmount} {t('traceability.tons')}</Text>
                    </div>
                    <div>
                      <Text strong style={{ color: '#52c41a' }}>{t('traceability.creditAllocation')}: </Text>
                      <Text strong style={{ color: '#52c41a' }}>{searchResult.batchInfo.creditAllocation} {t('traceability.tons')}</Text>
                    </div>
                    <div>
                      <Text strong>{t('traceability.creditRate')}: </Text>
                      <Progress
                        percent={searchResult.batchInfo.creditRate}
                        size="small"
                        status="success"
                        format={() => `${searchResult.batchInfo.creditRate}${t('traceability.percent')}`}
                      />
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                    <div>
                      <Text strong>{t('traceability.remainingCredit')}: </Text>
                      <Text>{searchResult.batchInfo.remainingCredit} {t('traceability.tons')}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card size="small" title={t('traceability.processFlow')}>
                  <Timeline
                    items={searchResult.processFlow.map((item, index) => ({
                      dot: <ExperimentOutlined style={{ fontSize: '16px' }} />,
                      children: (
                        <div key={index}>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>
                            {currentLanguage === 'ja' ? item.step.ja : item.step.en}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666', marginBottom: 4 }}>
                            {currentLanguage === 'ja' ? item.details.ja : item.details.en}
                          </div>
                          <Tag color="blue">
                            {item.layer}
                          </Tag>
                        </div>
                      ),
                    }))}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Credit Allocation Management */}
          <Card title={`${t('traceability.creditAllocationManagement')} (${t('traceability.rawMaterialBatch')}: RM-20250820-A)`} style={{ marginBottom: 24 }}>
            <Alert
              message={t('traceability.batchOverview')}
              description={t('traceability.batchSummary', {
                totalInput: searchResult.batchInfo.totalInput,
                availableCredit: searchResult.batchInfo.bioInput,
                allocatedCredit: searchResult.batchInfo.creditAllocation,
                remainingCredit: searchResult.batchInfo.remainingCredit
              })}
              type="success"
              style={{ marginBottom: 16 }}
            />
            <Paragraph>
              {t('traceability.batchDescription')}
            </Paragraph>
            <Table
              columns={allocationColumns}
              dataSource={allocationData}
              pagination={false}
              size="small"
            />
            <Text type="secondary" style={{ fontSize: '12px', marginTop: 8, display: 'block' }}>
              {t('traceability.allocationNote')}
            </Text>
          </Card>

          {/* System Architecture */}
          <Card title={t('traceability.systemArchitecture')} style={{ marginBottom: 24 }}>
            <Alert
              message={t('traceability.systemArchitecture')}
              description={
                <div>
                  {t('traceability.architectureDescription')}
                  <a
                    href="https://www.iscc-system.org/certification/iscc-plus/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: 4 }}
                  >
                    ISCC+
                  </a>
                </div>
              }
              type="info"
              showIcon
            />
          </Card>
        </>
      )}

      {!searchResult && !loading && (
        <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
          <ExperimentOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
          <Title level={4} type="secondary">
            {t('traceability.noResults')}
          </Title>
          <Text type="secondary">
            {t('traceability.noResultsSubtitle')}
            <br />
            {t('traceability.noResultsExample')}
          </Text>
        </Card>
      )}
    </div>
  );
};

export default Traceability;