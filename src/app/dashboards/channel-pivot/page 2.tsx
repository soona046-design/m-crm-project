'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface ChannelPerformanceData {
  channel: string;
  leads: number;
  appointments: number;
  cpa: number;
  roi: number;
}

interface PivotTableData {
  id: string;
  channel: string;
  campaign: string;
  leads: number;
  appointments: number;
  revenue: number;
  cpa: number;
  roas: number;
}

export default function ChannelPivotDashboardPage() {
  const [channelPerformanceData, setChannelPerformanceData] = useState<ChannelPerformanceData[]>([]);
  const [pivotTableData, setPivotTableData] = useState<PivotTableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: 기간 필터링, 지점 필터링 등 구현
  const fetchChannelData = useCallback(async () => {
    console.log('fetchChannelData called');
    setLoading(true);
    setError(null);
    try {
      // Mock data for development
      const mockChannelPerformance: ChannelPerformanceData[] = [
        { channel: 'Google Ads', leads: 120, appointments: 45, cpa: 25000, roi: 180 },
        { channel: 'Facebook Ads', leads: 85, appointments: 32, cpa: 30000, roi: 150 },
        { channel: 'Naver Ads', leads: 95, appointments: 38, cpa: 28000, roi: 165 },
        { channel: 'Instagram', leads: 65, appointments: 25, cpa: 35000, roi: 140 },
        { channel: 'YouTube', leads: 45, appointments: 18, cpa: 40000, roi: 125 },
      ];

      const mockPivotTable: PivotTableData[] = [
        { id: '1', channel: 'Google Ads', campaign: '치과 임플란트', leads: 45, appointments: 18, revenue: 2700000, cpa: 22000, roas: 240 },
        { id: '2', channel: 'Google Ads', campaign: '치아교정', leads: 38, appointments: 15, revenue: 2250000, cpa: 26000, roas: 220 },
        { id: '3', channel: 'Google Ads', campaign: '치아미백', leads: 37, appointments: 12, revenue: 1800000, cpa: 28000, roas: 180 },
        { id: '4', channel: 'Facebook Ads', campaign: '임플란트 할인', leads: 42, appointments: 16, revenue: 2400000, cpa: 30000, roas: 200 },
        { id: '5', channel: 'Facebook Ads', campaign: '교정 상담', leads: 43, appointments: 16, revenue: 2400000, cpa: 32000, roas: 190 },
        { id: '6', channel: 'Naver Ads', campaign: '지역 치과', leads: 48, appointments: 19, revenue: 2850000, cpa: 25000, roas: 250 },
        { id: '7', channel: 'Naver Ads', campaign: '응급 치료', leads: 47, appointments: 19, revenue: 2850000, cpa: 31000, roas: 210 },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setChannelPerformanceData(mockChannelPerformance);
      setPivotTableData(mockPivotTable);

    } catch (err) {
      console.error("Failed to fetch channel data:", err);
      setError("Failed to load channel data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannelData();
  }, [fetchChannelData]);

  const formatCurrency = (value: number) => `₩${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Channel Performance Pivot
      </Typography>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && (
        <Grid container spacing={3}>
          {/* 막대그래프: 채널별 리드/예약/CPA/ROI */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>Channel Overview</Typography>
              {channelPerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip formatter={(value: number, name: string) => {
                      if (name === 'cpa' || name === 'roi') return [formatCurrency(value), name.toUpperCase()];
                      return [value.toLocaleString(), name];
                    }} />
                    <Bar dataKey="leads" fill="#1E88E5" name="Leads" />
                    <Bar dataKey="appointments" fill="#00897B" name="Appointments" />
                    <Bar dataKey="cpa" fill="#FFC107" name="CPA" />
                    <Bar dataKey="roi" fill="#9C27B0" name="ROI" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body1" color="text.secondary">No channel performance data available.</Typography>
              )}
            </Paper>
          </Grid>

          {/* 피벗테이블: 채널×캠페인×지표 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Channel & Campaign Details</Typography>
              {pivotTableData.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Channel</TableCell>
                        <TableCell>Campaign</TableCell>
                        <TableCell align="right">Leads</TableCell>
                        <TableCell align="right">Appointments</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">CPA</TableCell>
                        <TableCell align="right">ROAS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pivotTableData.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.channel}</TableCell>
                          <TableCell>{row.campaign}</TableCell>
                          <TableCell align="right">{row.leads.toLocaleString()}</TableCell>
                          <TableCell align="right">{row.appointments.toLocaleString()}</TableCell>
                          <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.cpa)}</TableCell>
                          <TableCell align="right">{formatPercentage(row.roas)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" color="text.secondary">No detailed channel data available.</Typography>
              )}
            </Paper>
          </Grid>

          {/* TODO: 평균선 표시, 캠페인 클릭 시 소재 드릴다운, CSV 내보내기 */}
        </Grid>
      )}
    </Box>
  );
}
