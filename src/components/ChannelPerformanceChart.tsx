import React from 'react';
import { Box, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DataPoint {
  date: string;
  cost: number;
  leads: number;
  appointments: number;
}

interface ChannelPerformanceChartProps {
  data: DataPoint[];
}

const ChannelPerformanceChart: React.FC<ChannelPerformanceChartProps> = ({ data }) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
          />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value: number, name: string) => {
              switch (name) {
                case 'cost':
                  return [`${value.toLocaleString()}원`, '광고비'];
                case 'leads':
                  return [`${value}건`, '리드'];
                case 'appointments':
                  return [`${value}건`, '예약'];
                default:
                  return [value, name];
              }
            }}
            labelFormatter={(label) => new Date(label).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cost"
            name="광고비"
            stroke={theme.palette.primary.main}
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="leads"
            name="리드"
            stroke={theme.palette.secondary.main}
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="appointments"
            name="예약"
            stroke={theme.palette.success.main}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ChannelPerformanceChart;
