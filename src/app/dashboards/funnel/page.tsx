'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Card, CardContent, Icon, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MouseIcon from '@mui/icons-material/Mouse';
import PeopleIcon from '@mui/icons-material/People';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '@/lib/axios';

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
    impressions: 0,
    clicks: 0,
    leads: 0,
    tickets: 0,
    appointments: 0,
    contracts: 0,
    revenue: 0,
    overallConversionRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30days');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // 채널피벗 API에서 데이터 가져오기
  const fetchFunnelData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 기간 계산
      const now = new Date();
      let calculatedStartDate = '';
      let calculatedEndDate = now.toISOString().split('T')[0];

      if (startDate && endDate) {
        calculatedStartDate = startDate;
        calculatedEndDate = endDate;
      } else {
        let start = new Date();
        switch (selectedPeriod) {
          case '7days':
            start.setDate(now.getDate() - 7);
            break;
          case '30days':
            start.setDate(now.getDate() - 30);
            break;
          case '90days':
            start.setDate(now.getDate() - 90);
            break;
          case 'all':
            start.setFullYear(now.getFullYear() - 1);
            break;
        }
        calculatedStartDate = start.toISOString().split('T')[0];
      }

      // 채널피벗 API 호출
      const response = await api.get('/api/dashboards/channel-pivot', {
        params: {
          startDate: calculatedStartDate,
          endDate: calculatedEndDate,
        }
      });

      const { channelPerformance, pivotTable } = response.data;
      console.log('API Response:', { channelPerformance, pivotTable });

      // localStorage에서 수동 캠페인 데이터 가져오기
      const storedCampaigns = typeof window !== 'undefined' ? localStorage.getItem('mcrm_manual_campaigns') : null;
      let manualCampaigns: any[] = [];
      if (storedCampaigns) {
        manualCampaigns = JSON.parse(storedCampaigns).filter((c: any) => !c.deleted);
      }

      // pivotTable과 수동 캠페인 합치기
      const allCampaigns = [...pivotTable, ...manualCampaigns];
      console.log('All campaigns (API + Manual):', allCampaigns);

      // 기간 필터링
      const filteredCampaigns = allCampaigns.filter((campaign: any) => {
        if (!campaign.startDate) return true;
        const campaignStart = new Date(campaign.startDate);
        const campaignEnd = campaign.endDate ? new Date(campaign.endDate) : campaignStart;
        const filterStart = new Date(calculatedStartDate);
        const filterEnd = new Date(calculatedEndDate);
        return campaignStart <= filterEnd && campaignEnd >= filterStart;
      });

      // 채널별 집계
      const channelMap = new Map();
      filteredCampaigns.forEach((campaign: any) => {
        const channel = campaign.channel;
        if (!channelMap.has(channel)) {
          channelMap.set(channel, {
            channel,
            impressions: 0,
            clicks: 0,
            leads: 0,
            tickets: 0,
            appointments: 0,
            cost: 0,
            revenue: 0,
          });
        }
        const ch = channelMap.get(channel);
        ch.impressions += campaign.impressions || 0;
        ch.clicks += campaign.clicks || 0;
        ch.leads += campaign.leads || 0;
        ch.tickets += campaign.tickets || 0;
        ch.appointments += campaign.appointments || 0;
        ch.cost += campaign.cost || 0;
        ch.revenue += campaign.revenue || 0;
      });

      const aggregatedChannels = Array.from(channelMap.values());

      // 채널 필터링
      let channelData = aggregatedChannels;
      if (selectedChannel !== 'all') {
        channelData = aggregatedChannels.filter((ch: any) => ch.channel === selectedChannel);
      }

      // 전체 집계
      const totalImpressions = channelData.reduce((sum: number, ch: any) => sum + (ch.impressions || 0), 0);
      const totalClicks = channelData.reduce((sum: number, ch: any) => sum + (ch.clicks || 0), 0);
      const totalLeads = channelData.reduce((sum: number, ch: any) => sum + (ch.leads || 0), 0);
      const totalTickets = channelData.reduce((sum: number, ch: any) => sum + (ch.tickets || 0), 0);
      const totalAppointments = channelData.reduce((sum: number, ch: any) => sum + (ch.appointments || 0), 0);
      const totalRevenue = channelData.reduce((sum: number, ch: any) => sum + (ch.revenue || 0), 0);

      // 계약완료 수 계산 (리드 데이터에서 '계약완료' 상태 카운팅)
      const storedLeads = typeof window !== 'undefined' ? localStorage.getItem('mcrm_leads') : null;
      let totalContracts = 0;

      if (storedLeads) {
        const leads = JSON.parse(storedLeads);
        let filteredLeads = leads;

        if (selectedChannel !== 'all') {
          filteredLeads = leads.filter((lead: any) => lead.utm_source === selectedChannel);
        }

        totalContracts = filteredLeads.filter((lead: any) =>
          lead.status === '계약완료' || lead.status === 'closed'
        ).length;
      }

      // 전환율 계산
      const clickRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const leadConversionRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0;
      const ticketConversionRate = totalLeads > 0 ? (totalTickets / totalLeads) * 100 : 0;
      const appointmentConversionRate = totalTickets > 0 ? (totalAppointments / totalTickets) * 100 : 0;
      const contractConversionRate = totalAppointments > 0 ? (totalContracts / totalAppointments) * 100 : 0;
      const overallConversionRate = totalImpressions > 0 ? (totalContracts / totalImpressions) * 100 : 0;

      setKpiData({
        impressions: totalImpressions,
        clicks: totalClicks,
        leads: totalLeads,
        tickets: totalTickets,
        appointments: totalAppointments,
        contracts: totalContracts,
        revenue: totalRevenue,
        overallConversionRate: overallConversionRate,
      });

      // 퍼널 데이터 생성
      console.log('Funnel KPIs:', {
        totalImpressions, totalClicks, totalLeads,
        totalTickets, totalAppointments, totalContracts, totalRevenue
      });

      const colors = ['#9E9E9E', '#757575', '#1E88E5', '#2196F3', '#42A5F5', '#4CAF50'];
      const funnel: FunnelData[] = [
        {
          stage: '노출',
          value: totalImpressions,
          conversionRate: 100,
          color: colors[0],
        },
        {
          stage: '클릭',
          value: totalClicks,
          conversionRate: clickRate,
          color: colors[1],
        },
        {
          stage: '전환(문의)',
          value: totalLeads,
          conversionRate: leadConversionRate,
          color: colors[2],
        },
        {
          stage: '상담',
          value: totalTickets,
          conversionRate: ticketConversionRate,
          color: colors[3],
        },
        {
          stage: '예약',
          value: totalAppointments,
          conversionRate: appointmentConversionRate,
          color: colors[4],
        },
        {
          stage: '계약',
          value: totalContracts,
          conversionRate: contractConversionRate,
          color: colors[5],
        },
      ];

      setFunnelData(funnel);
    } catch (err) {
      console.error("Failed to fetch funnel data:", err);
      setError("퍼널 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [selectedChannel, selectedPeriod, startDate, endDate]);

  useEffect(() => {
    fetchFunnelData();
  }, [fetchFunnelData]);

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return '₩0';
    return `₩${value.toLocaleString()}`;
  };
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return '0.00%';
    return `${value.toFixed(2)}%`;
  };

  // 사용 가능한 채널 목록 가져오기
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const now = new Date();
        const start = new Date();
        start.setFullYear(now.getFullYear() - 1);

        const response = await api.get('/api/dashboards/channel-pivot', {
          params: {
            startDate: start.toISOString().split('T')[0],
            endDate: now.toISOString().split('T')[0],
          }
        });

        const { pivotTable } = response.data;

        // localStorage에서 수동 캠페인 데이터 가져오기
        const storedCampaigns = typeof window !== 'undefined' ? localStorage.getItem('mcrm_manual_campaigns') : null;
        let manualCampaigns: any[] = [];
        if (storedCampaigns) {
          manualCampaigns = JSON.parse(storedCampaigns).filter((c: any) => !c.deleted);
        }

        // 모든 캠페인에서 채널 추출
        const allCampaigns = [...pivotTable, ...manualCampaigns];
        const channelSet = new Set<string>();
        allCampaigns.forEach((campaign: any) => {
          if (campaign.channel) {
            channelSet.add(campaign.channel);
          }
        });

        const channels = Array.from(channelSet);
        setAvailableChannels(channels);
      } catch (err) {
        console.error('Failed to fetch channels:', err);
      }
    };

    fetchChannels();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          퍼널 대시보드
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>기간</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="기간"
            >
              <MenuItem value="7days">최근 7일</MenuItem>
              <MenuItem value="30days">최근 30일</MenuItem>
              <MenuItem value="90days">최근 90일</MenuItem>
              <MenuItem value="all">전체</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>채널</InputLabel>
            <Select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              label="채널"
            >
              <MenuItem value="all">전체</MenuItem>
              {availableChannels.map((channel) => (
                <MenuItem key={channel} value={channel}>{channel}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchFunnelData}
          >
            새로고침
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} mb={3}>
        {/* KPI Cards */}
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard title="노출" value={kpiData.impressions.toLocaleString()} icon={<VisibilityIcon />} color="#9E9E9E" />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard title="클릭" value={kpiData.clicks.toLocaleString()} icon={<MouseIcon />} color="#757575" />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard title="문의" value={kpiData.leads.toLocaleString()} icon={<PeopleIcon />} color="#1E88E5" />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard title="상담" value={kpiData.tickets.toLocaleString()} icon={<PhoneIcon />} color="#2196F3" />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard title="예약" value={kpiData.appointments.toLocaleString()} icon={<CalendarMonthIcon />} color="#42A5F5" />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard title="계약" value={kpiData.contracts.toLocaleString()} icon={<CheckCircleOutlineIcon />} color="#4CAF50" />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>전환 퍼널</Typography>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        {!loading && !error && funnelData.length > 0 && (
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
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(value: number) => value.toLocaleString()}
                  style={{ fontSize: '14px', fontWeight: 'bold' }}
                />
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        {!loading && !error && funnelData.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 400, gap: 2 }}>
            <Typography variant="h6" color="text.secondary">퍼널 데이터가 없습니다</Typography>
            <Typography variant="body2" color="text.secondary">
              채널 피벗 페이지에서 캠페인 데이터를 추가하거나, 다른 기간/채널을 선택해보세요.
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchFunnelData}
            >
              다시 시도
            </Button>
          </Box>
        )}
      </Paper>

      {/* 전환율 상세 정보 */}
      {!loading && !error && funnelData.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>단계별 전환율</Typography>
          <Grid container spacing={2}>
            {funnelData.map((stage, index) => (
              <Grid item xs={12} md={4} key={stage.stage}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {stage.stage}
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      {stage.value.toLocaleString()}
                    </Typography>
                    {stage.conversionRate !== undefined && (
                      <Typography variant="body2" color="text.secondary">
                        전환율: {stage.conversionRate.toFixed(1)}%
                      </Typography>
                    )}
                    {index > 0 && funnelData[index - 1] && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        이전 단계 대비: {((stage.value / funnelData[index - 1].value) * 100).toFixed(1)}%
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
