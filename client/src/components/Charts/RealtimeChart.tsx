import React, { useMemo } from 'react';
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

interface RealtimeChartProps {
  data: ProcessData[];
  height?: number;
  timeRange: '1h' | '4h' | '24h' | '7d';
  showControls?: boolean;
}

const RealtimeChart: React.FC<RealtimeChartProps> = ({
  data,
  height = 300,
  timeRange,
  showControls = false,
}) => {
  // Debug props
  React.useEffect(() => {
    console.log('RealtimeChart - data prop updated:', data.length, 'items');
    console.log('RealtimeChart - timeRange:', timeRange);
    console.log('RealtimeChart - latest data:', data.slice(-2));
  }, [data, timeRange]);

  const chartData = useMemo(() => {
    console.log('RealtimeChart - useMemo recalculating with', data.length, 'items');
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
    console.log('RealtimeChart - after time filtering:', filteredData.length, 'items');
    console.log('RealtimeChart - cutoffTime:', cutoffTime.toISOString());
    
    // Group data by time intervals and process type
    const groupedData = filteredData.reduce((acc, item) => {
      const timestamp = new Date(item.timestamp);
      
      // Round to appropriate interval based on time range
      let roundedTime: Date;
      if (timeRange === '1h') {
        // 1-minute intervals
        roundedTime = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 
          timestamp.getHours(), timestamp.getMinutes(), 0, 0);
      } else if (timeRange === '4h') {
        // 5-minute intervals
        roundedTime = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 
          timestamp.getHours(), Math.floor(timestamp.getMinutes() / 5) * 5, 0, 0);
      } else if (timeRange === '24h') {
        // 30-minute intervals
        roundedTime = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 
          timestamp.getHours(), Math.floor(timestamp.getMinutes() / 30) * 30, 0, 0);
      } else {
        // 4-hour intervals
        roundedTime = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 
          Math.floor(timestamp.getHours() / 4) * 4, 0, 0, 0);
      }

      const timeKey = roundedTime.toISOString();
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          timestamp: timeKey,
          time: roundedTime,
          temperature: [],
          pressure: [],
          efficiency: [],
          co2Emission: [],
          qualityScore: [],
        };
      }

      acc[timeKey].temperature.push(item.environmental.temperature);
      acc[timeKey].pressure.push(item.environmental.pressure);
      acc[timeKey].co2Emission.push(item.environmental.co2Emission);
      
      // Calculate efficiency based on status
      const efficiencyScore = item.status === 'normal' ? 100 : 
                             item.status === 'warning' ? 85 :
                             item.status === 'critical' ? 60 : 0;
      acc[timeKey].efficiency.push(efficiencyScore);
      
      // Calculate quality score based on metrics
      let qualityScore = 95;
      if (item.quality.defectCount && item.quality.defectCount > 0) {
        qualityScore -= item.quality.defectCount * 5;
      }
      if (item.status === 'warning') qualityScore -= 10;
      if (item.status === 'critical') qualityScore -= 25;
      
      acc[timeKey].qualityScore.push(Math.max(0, qualityScore));

      return acc;
    }, {} as any);

    // Convert to array and calculate averages
    const chartData = Object.values(groupedData).map((group: any) => {
      const avgTemp = group.temperature.reduce((sum: number, val: number) => sum + val, 0) / group.temperature.length;
      const avgCO2 = group.co2Emission.reduce((sum: number, val: number) => sum + val, 0) / group.co2Emission.length;
      
      return {
        timestamp: group.timestamp,
        time: format(group.time, timeRange === '7d' ? 'MMM dd HH:mm' : 'HH:mm'),
        // Normalize temperature (assume 0-500°C range) to 0-100 scale
        temperature: Math.min(100, (avgTemp / 500) * 100),
        // Keep pressure as is (usually 0-10 MPa, multiply by 10 to fit 0-100 scale)
        pressure: (group.pressure.reduce((sum: number, val: number) => sum + val, 0) / group.pressure.length) * 10,
        efficiency: group.efficiency.reduce((sum: number, val: number) => sum + val, 0) / group.efficiency.length,
        // Normalize CO2 emission (assume 0-100 kg/h range) to 0-100 scale  
        co2Emission: Math.min(100, avgCO2),
        qualityScore: group.qualityScore.reduce((sum: number, val: number) => sum + val, 0) / group.qualityScore.length,
        // Store original values for tooltip
        originalTemp: avgTemp,
        originalCO2: avgCO2,
        originalPressure: group.pressure.reduce((sum: number, val: number) => sum + val, 0) / group.pressure.length,
      };
    });

    const sortedData = chartData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    console.log('RealtimeChart - final chartData:', sortedData.length, 'items');
    console.log('RealtimeChart - latest chart points:', sortedData.slice(-2));
    return sortedData;
  }, [data, timeRange]);

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="recharts-default-tooltip" style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p className="recharts-tooltip-label" style={{ margin: 0, marginBottom: '5px', fontWeight: 'bold' }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => {
            const data = payload[0]?.payload;
            let displayValue = entry.value;
            let unit = '';
            
            // Show original values in tooltip
            if (entry.name === 'Temperature' && data?.originalTemp) {
              displayValue = data.originalTemp.toFixed(1);
              unit = '°C';
            } else if (entry.name === 'Pressure' && data?.originalPressure) {
              displayValue = data.originalPressure.toFixed(2);
              unit = ' MPa';
            } else if (entry.name === 'CO₂ Emission' && data?.originalCO2) {
              displayValue = data.originalCO2.toFixed(1);
              unit = ' kg/h';
            } else if (entry.name === 'Efficiency' || entry.name === 'Quality Score') {
              displayValue = typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value;
              unit = '%';
            } else {
              displayValue = typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value;
            }
            
            return (
              <p key={index} style={{ 
                color: entry.color, 
                margin: 0,
                fontSize: '13px'
              }}>
                {entry.name}: {displayValue}{unit}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#8c8c8c' }}>No data available for the selected time range</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          domain={[0, 100]}
          tickCount={6}
          tickFormatter={(value) => `${value}`}
          label={{ value: 'Normalized Values (0-100)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '12px' } }}
        />
        <Tooltip content={customTooltip} />
        <Legend />
        
        <Line
          type="monotone"
          dataKey="efficiency"
          stroke="#1890ff"
          strokeWidth={2}
          name="Efficiency"
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        
        <Line
          type="monotone"
          dataKey="qualityScore"
          stroke="#52c41a"
          strokeWidth={2}
          name="Quality Score"
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        
        <Line
          type="monotone"
          dataKey="temperature"
          stroke="#fa8c16"
          strokeWidth={1.5}
          name="Temperature"
          dot={{ r: 2 }}
          strokeDasharray="5 5"
        />
        
        <Line
          type="monotone"
          dataKey="co2Emission"
          stroke="#f5222d"
          strokeWidth={1.5}
          name="CO₂ Emission"
          dot={{ r: 2 }}
          strokeDasharray="3 3"
        />

        {/* Reference lines for targets */}
        <ReferenceLine y={90} stroke="#52c41a" strokeDasharray="2 2" opacity={0.5} />
        <ReferenceLine y={80} stroke="#faad14" strokeDasharray="2 2" opacity={0.5} />
        <ReferenceLine y={70} stroke="#ff4d4f" strokeDasharray="2 2" opacity={0.5} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RealtimeChart;