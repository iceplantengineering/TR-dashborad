import React, { useMemo, useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ProcessData } from '@/types';
import { format, subHours, isAfter } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface RealtimeChartProps {
  data: ProcessData[];
  height?: number;
  timeRange: '1h' | '4h' | '24h' | '7d';
}

const ActualRealtimeChart: React.FC<RealtimeChartProps> = ({
  data,
  height = 300,
  timeRange,
}) => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<any[]>([]);

  const processedData = useMemo(() => {
    const now = new Date();
    let cutoffTime: Date;
    
    switch (timeRange) {
      case '1h':
        cutoffTime = subHours(now, 1);
        break;
      case '4h':
        cutoffTime = subHours(now, 4);
        break;
      case '24h':
        cutoffTime = subHours(now, 24);
        break;
      case '7d':
        cutoffTime = subHours(now, 7 * 24);
        break;
      default:
        cutoffTime = subHours(now, 24);
    }

    const filteredData = data.filter(d => isAfter(new Date(d.timestamp), cutoffTime));
    
    // データを時間でグループ化
    const groupedData = filteredData.reduce((acc, item) => {
      const timestamp = new Date(item.timestamp);
      
      // 時間間隔を決定
      let roundedTime: Date;
      if (timeRange === '1h') {
        roundedTime = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 
          timestamp.getHours(), Math.floor(timestamp.getMinutes() / 2) * 2, 0, 0);
      } else if (timeRange === '4h') {
        roundedTime = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 
          timestamp.getHours(), Math.floor(timestamp.getMinutes() / 5) * 5, 0, 0);
      } else if (timeRange === '24h') {
        roundedTime = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 
          timestamp.getHours(), Math.floor(timestamp.getMinutes() / 15) * 15, 0, 0);
      } else {
        roundedTime = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 
          Math.floor(timestamp.getHours() / 2) * 2, 0, 0, 0);
      }

      const timeKey = roundedTime.getTime();
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          timestamp: timeKey,
          time: roundedTime,
          temperature: [],
          efficiency: [],
          quality: [],
          co2Emission: [],
        };
      }

      // データを蓄積
      acc[timeKey].temperature.push(item.environmental.temperature);
      acc[timeKey].co2Emission.push(item.environmental.co2Emission);
      
      // 効率スコアを計算
      const efficiencyScore = item.status === 'normal' ? 95 + Math.random() * 5 : 
                             item.status === 'warning' ? 80 + Math.random() * 10 :
                             item.status === 'critical' ? 60 + Math.random() * 15 : 30;
      acc[timeKey].efficiency.push(efficiencyScore);
      
      // 品質スコアを計算
      let qualityScore = 95;
      if (item.quality.defectCount && item.quality.defectCount > 0) {
        qualityScore -= item.quality.defectCount * 5;
      }
      if (item.status === 'warning') qualityScore -= 5;
      if (item.status === 'critical') qualityScore -= 15;
      
      acc[timeKey].quality.push(Math.max(70, Math.min(100, qualityScore)));

      return acc;
    }, {} as any);

    // 配列に変換して平均を計算
    const chartData = Object.values(groupedData).map((group: any) => ({
      timestamp: group.timestamp,
      time: format(group.time, timeRange === '7d' ? 'MM/dd HH:mm' : 'HH:mm'),
      temperature: Math.round(group.temperature.reduce((sum: number, val: number) => sum + val, 0) / group.temperature.length),
      efficiency: Math.round(group.efficiency.reduce((sum: number, val: number) => sum + val, 0) / group.efficiency.length),
      quality: Math.round(group.quality.reduce((sum: number, val: number) => sum + val, 0) / group.quality.length),
      co2Emission: Math.round(group.co2Emission.reduce((sum: number, val: number) => sum + val, 0) / group.co2Emission.length),
    }));

    return chartData.sort((a, b) => a.timestamp - b.timestamp);
  }, [data, timeRange]);

  useEffect(() => {
    setChartData(processedData);
  }, [processedData]);

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '13px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#262626' }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              color: entry.color, 
              margin: '2px 0',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>
                {entry.value}
                {entry.name === 'Temperature' && '°C'}
                {(entry.name === 'Efficiency' || entry.name === 'Quality') && '%'}
                {entry.name === 'CO₂ Emission' && ' kg/h'}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value: number) => {
    return Math.round(value / 10) * 10; // 10の倍数で表示
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        border: '2px dashed #d9d9d9'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }}>📊</div>
          <div style={{ color: '#8c8c8c', fontSize: '16px' }}>{t('dashboard.loadingData')}</div>
          <div style={{ color: '#bfbfbf', fontSize: '12px', marginTop: '4px' }}>
            {t('dashboard.dataAccumulation')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12, fill: '#8c8c8c' }}
          stroke="#d9d9d9"
          interval="preserveStartEnd"
        />
        
        <YAxis 
          tick={{ fontSize: 12, fill: '#8c8c8c' }}
          stroke="#d9d9d9"
          tickFormatter={formatYAxisTick}
          domain={['dataMin - 5', 'dataMax + 5']}
        />
        
        <Tooltip content={customTooltip} />
        <Legend />
        
        <Line
          type="monotone"
          dataKey="efficiency"
          stroke="#1890ff"
          strokeWidth={3}
          name="Efficiency"
          dot={{ r: 4, fill: '#1890ff' }}
          activeDot={{ r: 6, fill: '#1890ff' }}
        />
        
        <Line
          type="monotone"
          dataKey="quality"
          stroke="#52c41a"
          strokeWidth={3}
          name="Quality"
          dot={{ r: 4, fill: '#52c41a' }}
          activeDot={{ r: 6, fill: '#52c41a' }}
        />
        
        <Line
          type="monotone"
          dataKey="temperature"
          stroke="#fa8c16"
          strokeWidth={2}
          name="Temperature"
          dot={{ r: 3, fill: '#fa8c16' }}
          strokeDasharray="5 5"
        />
        
        <Line
          type="monotone"
          dataKey="co2Emission"
          stroke="#f5222d"
          strokeWidth={2}
          name="CO₂ Emission"
          dot={{ r: 3, fill: '#f5222d' }}
          strokeDasharray="3 3"
        />

        {/* 参考線 */}
        <ReferenceLine y={90} stroke="#52c41a" strokeDasharray="2 2" strokeOpacity={0.5} />
        <ReferenceLine y={80} stroke="#faad14" strokeDasharray="2 2" strokeOpacity={0.5} />
        <ReferenceLine y={70} stroke="#ff4d4f" strokeDasharray="2 2" strokeOpacity={0.5} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ActualRealtimeChart;