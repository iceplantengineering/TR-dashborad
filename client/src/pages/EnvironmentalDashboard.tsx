import React from 'react';
import { Card, Typography } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const EnvironmentalDashboard: React.FC = () => {
  return (
    <Card>
      <Title level={2}>
        <GlobalOutlined /> Environmental Dashboard
      </Title>
      <Paragraph>
        Environmental monitoring features will be implemented here, including:
      </Paragraph>
      <ul>
        <li>CO₂ emissions tracking</li>
        <li>Energy consumption monitoring</li>
        <li>Water usage optimization</li>
        <li>Waste management tracking</li>
        <li>Environmental compliance reporting</li>
        <li>Sustainability metrics and KPIs</li>
      </ul>
    </Card>
  );
};

export default EnvironmentalDashboard;