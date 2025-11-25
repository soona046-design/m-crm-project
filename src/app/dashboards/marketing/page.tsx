'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import api from '@/lib/axios';

interface AdMetricData {
  id: string;
  period_label: string;
  period_type: string;
  date_start: string;
  date_end: string;
  impressions: number;
  clicks: number;
  ctr: number | null;
  conversions: number;
  cost: number;
  cpl: number | null;
  cpa: number | null;
}

interface ChannelData {
  channel_type: string;
  channel_label: string;
  summary: {
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    total_cost: number;
    avg_ctr: number;
    avg_cpl: number;
    avg_cpa: number;
  };
  periods: AdMetricData[];
}

interface PlatformData {
  platform: string;
  platform_label: string;
  data: ChannelData[];
}

type Platform = 'naver' | 'google' | 'meta';

const PLATFORM_TABS = [
  { value: 'naver' as Platform, label: '네이버 광고' },
  { value: 'google' as Platform, label: '구글 광고' },
  { value: 'meta' as Platform, label: 'SNS 광고 (Meta)' },
];

// 주차 레이블을 읽기 쉬운 형식으로 변환
const formatPeriodLabel = (label: string, type: string): string => {
  if (type === 'week') {
    // 2025-W42 -> 2025년 42주차
    const match = label.match(/(\d{4})-W(\d+)/);
    if (match) {
      return `${match[1]}년 ${match[2]}주차`;
    }
  } else if (type === 'month') {
    // 2025-10 -> 2025년 10월
    const match = label.match(/(\d{4})-(\d+)/);
    if (match) {
      return `${match[1]}년 ${match[2]}월`;
    }
  }
  return label;
};

// 숫자 포맷팅 (천단위 구분)
const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('ko-KR').format(num);
};

// 통화 포맷팅
const formatCurrency = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(num);
};

// 퍼센트 포맷팅
const formatPercent = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '-';
  return `${num.toFixed(2)}%`;
};

export default function MarketingDashboardPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('naver');
  const [platformData, setPlatformData] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 플랫폼 데이터 로드
  useEffect(() => {
    fetchPlatformData(selectedPlatform);
  }, [selectedPlatform]);

  const fetchPlatformData = async (platform: Platform) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/marketing-stats/${platform}`, {
        params: {
          period_type: 'week',
          from: '2025-08-01',
          to: '2025-10-31',
        },
      });

      setPlatformData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch platform data:', err);
      setError(err.response?.data?.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformChange = (_event: React.SyntheticEvent, newValue: Platform) => {
    setSelectedPlatform(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          📊 온라인 마케팅 운영 대시보드
        </Typography>
        <Typography variant="body2" color="text.secondary">
          플랫폼별 광고 성과 및 주차별 집계 데이터
        </Typography>
      </Box>

      {/* 플랫폼 탭 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedPlatform}
          onChange={handlePlatformChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          {PLATFORM_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* 로딩 상태 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 에러 상태 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 플랫폼 데이터 */}
      {!loading && !error && platformData && (
        <Box>
          {/* 요약 카드 */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    총 노출 수
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatNumber(
                      platformData.data.reduce((sum, ch) => sum + ch.summary.total_impressions, 0)
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    총 클릭 수
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatNumber(
                      platformData.data.reduce((sum, ch) => sum + ch.summary.total_clicks, 0)
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    총 전환 수
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatNumber(
                      platformData.data.reduce((sum, ch) => sum + ch.summary.total_conversions, 0)
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    총 비용
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(
                      platformData.data.reduce((sum, ch) => sum + ch.summary.total_cost, 0)
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 채널별 테이블 */}
          {platformData.data.map((channelData) => (
            <Paper key={channelData.channel_type} sx={{ mb: 4, p: 3 }}>
              {/* 채널 헤더 */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
                  {channelData.channel_label}
                </Typography>
                <Chip
                  label={`총 ${formatNumber(channelData.summary.total_conversions)}건 전환`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {/* 주차별 데이터 테이블 */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
                      <TableCell><strong>기간</strong></TableCell>
                      <TableCell align="right"><strong>노출</strong></TableCell>
                      <TableCell align="right"><strong>클릭</strong></TableCell>
                      <TableCell align="right"><strong>CTR(%)</strong></TableCell>
                      <TableCell align="right"><strong>전환</strong></TableCell>
                      <TableCell align="right"><strong>비용</strong></TableCell>
                      <TableCell align="right"><strong>CPL/CPA</strong></TableCell>
                      <TableCell><strong>비고</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {channelData.periods.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography color="text.secondary">데이터가 없습니다.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      channelData.periods.map((period, index) => (
                        <TableRow key={period.id} hover>
                          <TableCell>
                            {formatPeriodLabel(period.period_label, period.period_type)}
                          </TableCell>
                          <TableCell align="right">{formatNumber(period.impressions)}</TableCell>
                          <TableCell align="right">{formatNumber(period.clicks)}</TableCell>
                          <TableCell align="right">{formatPercent(period.ctr)}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              {formatNumber(period.conversions)}
                              {index > 0 && period.conversions > channelData.periods[index - 1].conversions && (
                                <TrendingUp fontSize="small" color="success" sx={{ ml: 0.5 }} />
                              )}
                              {index > 0 && period.conversions < channelData.periods[index - 1].conversions && (
                                <TrendingDown fontSize="small" color="error" sx={{ ml: 0.5 }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{formatCurrency(period.cost)}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(period.cpl || period.cpa)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {period.date_start} ~ {period.date_end}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {/* 합계 행 */}
                    <TableRow sx={{ backgroundColor: (theme) => theme.palette.grey[50] }}>
                      <TableCell><strong>합계</strong></TableCell>
                      <TableCell align="right">
                        <strong>{formatNumber(channelData.summary.total_impressions)}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatNumber(channelData.summary.total_clicks)}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatPercent(channelData.summary.avg_ctr)}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatNumber(channelData.summary.total_conversions)}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(channelData.summary.total_cost)}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(channelData.summary.avg_cpl || channelData.summary.avg_cpa)}</strong>
                      </TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))}

          {/* 데이터가 없는 경우 */}
          {platformData.data.length === 0 && (
            <Alert severity="info">
              선택한 플랫폼에 대한 데이터가 없습니다.
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
