import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StatusChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const StatusChart: React.FC<StatusChartProps> = ({
  data,
  height = 300,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
}) => {
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = payload[0].payload.total || 
                   data.value + (payload[0].payload.parent?.data?.reduce((sum: number, item: any) => sum + item.value, 0) || 0);
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';
      
      return (
        <div className="recharts-default-tooltip" style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ 
            color: data.color, 
            margin: 0,
            fontWeight: 'bold'
          }}>
            {data.name}
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px' }}>
            Count: {data.value}
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px' }}>
            Percentage: {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const customLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  const renderCustomizedLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul style={{ 
        listStyle: 'none', 
        padding: 0, 
        margin: '20px 0 0 0',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '12px'
      }}>
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} style={{ 
            display: 'flex', 
            alignItems: 'center',
            fontSize: '13px'
          }}>
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                backgroundColor: entry.color,
                borderRadius: '50%',
                marginRight: '6px',
              }}
            />
            <span style={{ color: '#333' }}>
              {entry.value}: {entry.payload.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Filter out items with zero values
  const filteredData = data.filter(item => item.value > 0);

  if (filteredData.length === 0) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <span style={{ color: '#8c8c8c', fontSize: '16px' }}>No data available</span>
        <span style={{ color: '#bfbfbf', fontSize: '12px' }}>
          All processes are currently offline or no data has been received
        </span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={customLabel}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={customTooltip} />
        {showLegend && <Legend content={renderCustomizedLegend} />}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StatusChart;