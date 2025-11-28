'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Card, CardContent, Icon } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import axios from 'axios';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface FunnelData {
  stage: string;
  value: number;
  conversionRate?: number;
  color: string; // 각 단계별 색상
}

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function KpiCard({ title, value, icon, color }: KpiCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, backgroundColor: color }}>
      <CardContent sx={{ flexGrow: 1, p: 0, '&:last-child': { pb: 0 } }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>{title}</Typography>
        <Typography variant="h5" component="div" fontWeight="bold">{value}</Typography>
      </CardContent>
      <Icon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.7)' }}>{icon}</Icon>
    </Card>
  );
}

export default function FunnelDashboardPage() {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [kpiData, setKpiData] = useState({
    leads: 0,
    appointments: 0,
    clinicVisits: 0,
    revenue: 0,
    overallConversionRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: 기간 필터링, 지점 필터링 등 구현
  const fetchFunnelData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/dashboards/funnel'); // TODO: 실제 API 엔드포인트 구현 필요
      // 백엔드 응답 형식에 맞춰 데이터 변환 필요
      const data = response.data.data || response.data; // 예시: { kpi: {...}, funnel: [...] }

      setKpiData(data.kpi);

      // 퍼널 데이터에 색상 동적으로 할당 (UI/UX 가이드에 따라 조정 필요)
      const colors = ['#1E88E5', '#2196F3', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB'];
      const formattedFunnelData = data.funnel.map((item: any, index: number) => ({
        ...item,
        color: colors[index % colors.length],
      }));
      setFunnelData(formattedFunnelData);

    } catch (err) {
      console.error("Failed to fetch funnel data:", err);
      setError("Failed to load funnel data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFunnelData();
  }, [fetchFunnelData]);

  const formatCurrency = (value: number) => `₩${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Funnel Dashboard
      </Typography>

      <Grid container spacing={3} mb={3}>
        {/* KPI Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="총 리드" value={kpiData.leads.toLocaleString()} icon={<PeopleIcon />} color="#1E88E5" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="총 예약" value={kpiData.appointments.toLocaleString()} icon={<CalendarMonthIcon />} color="#00897B" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="총 내원" value={kpiData.clinicVisits.toLocaleString()} icon={<CheckCircleOutlineIcon />} color="#4CAF50" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="총 매출" value={formatCurrency(kpiData.revenue)} icon={<AttachMoneyIcon />} color="#FFC107" />
        </Grid>
        {/* <Grid item xs={12} sm={6} md={2}> */}
          {/* <KpiCard title="전환율" value={formatPercentage(kpiData.overallConversionRate)} icon={<TrendingUpIcon />} color="#9C27B0" /> */}
        {/* </Grid> */}
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Conversion Funnel</Typography>
        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && funnelData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="stage" width={100} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value: number, name: string, props: any) => [
                name === 'value' ? value.toLocaleString() : `${value.toFixed(2)}%`,
                props.payload.stage
              ]} />
              <Bar dataKey="value" barSize={50}>
                <LabelList dataKey="stage" position="left" />
                <LabelList dataKey="value" position="right" formatter={(value: number) => value.toLocaleString()} />
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              {/* TODO: 단계별 전환율을 별도로 표시할 수 있습니다. */}
            </BarChart>
          </ResponsiveContainer>
        ) : !loading && !error && (
          <Typography variant="body1" color="text.secondary">No funnel data available.</Typography>
        )}
      </Paper>
      {/* TODO: 단계 클릭 시 세부 캠페인 테이블 팝업 */}
    </Box>
  );
}
