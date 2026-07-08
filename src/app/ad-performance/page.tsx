'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress, Button,
  FormControl, InputLabel, Select, MenuItem, TextField, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, Alert, Card, CardContent,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '@/lib/axios';

export default function AdPerformancePage() {
  const [rawData, setRawData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [platform, setPlatform] = useState('');
  const [periodType, setPeriodType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (platform)   params.platform    = platform;
      if (periodType) params.period_type = periodType;
      if (from)       params.from        = from;
      if (to)         params.to          = to;

      const [statsRes, summaryRes] = await Promise.all([
        api.get('/api/marketing-stats', { params }),
        api.get('/api/marketing-stats/summary', {
          params: from && to ? { from, to } : {},
        }),
      ]);

      setRawData(statsRes.data);
      setSummary(summaryRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [platform, periodType, from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fmt = (v: any) => (v === null || v === undefined) ? '—' : v;
  const fmtNum = (v: any) => (v === null || v === undefined) ? '—' : Number(v).toLocaleString();
  const fmtCur = (v: any) => (v === null || v === undefined) ? '—' : `₩${Number(v).toLocaleString()}`;
  const fmtPct = (v: any) => (v === null || v === undefined) ? '—' : `${Number(v).toFixed(3)}%`;

  const platforms = rawData?.data ?? [];
  const total = rawData?.meta?.total ?? 0;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>

      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">광고 실적</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            API: GET /api/marketing-stats — 데이터 {total}건
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>
          새로고침
        </Button>
      </Box>

      {/* 필터 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>플랫폼</InputLabel>
              <Select value={platform} label="플랫폼" onChange={e => setPlatform(e.target.value)}>
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="naver">네이버</MenuItem>
                <MenuItem value="google">구글</MenuItem>
                <MenuItem value="meta">메타</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>기간 유형</InputLabel>
              <Select value={periodType} label="기간 유형" onChange={e => setPeriodType(e.target.value)}>
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="week">주별</MenuItem>
                <MenuItem value="month">월별</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth size="small" label="시작일" type="date"
              value={from} onChange={e => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth size="small" label="종료일" type="date"
              value={to} onChange={e => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" size="small" onClick={fetchData}>조회</Button>
              <Button variant="outlined" size="small" onClick={() => { setPlatform(''); setPeriodType(''); setFrom(''); setTo(''); }}>
                초기화
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <>
          {/* 요약 카드 (summary API) */}
          {summary?.summary && (
            <Paper sx={{ p: 2.5, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                요약 — /api/marketing-stats/summary
                {summary.period && (
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({summary.period.from} ~ {summary.period.to})
                  </Typography>
                )}
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'total_impressions', value: fmtNum(summary.summary.total_impressions) },
                  { label: 'total_clicks',      value: fmtNum(summary.summary.total_clicks) },
                  { label: 'total_conversions', value: fmtNum(summary.summary.total_conversions) },
                  { label: 'total_cost',        value: fmtCur(summary.summary.total_cost) },
                  { label: 'avg_ctr',           value: fmtPct(summary.summary.avg_ctr) },
                  { label: 'avg_cpl',           value: fmtCur(summary.summary.avg_cpl) },
                  { label: 'avg_cpa',           value: fmtCur(summary.summary.avg_cpa) },
                ].map(item => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={item.label}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.label}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">{item.value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* 플랫폼별 요약 */}
              {summary.summary.by_platform?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" sx={{ mb: 1 }}>
                    by_platform
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {summary.summary.by_platform.map((p: any) => (
                      <Chip
                        key={p.platform}
                        label={`${p.platform} | 전환 ${fmtNum(p.total_conversions)} | 비용 ${fmtCur(p.total_cost)} | CPL ${fmtCur(p.avg_cpl)}`}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          )}

          {/* 데이터 없음 */}
          {platforms.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                광고 실적 데이터가 없습니다
              </Typography>
              <Typography variant="body2" color="text.secondary">
                네이버·구글·메타 광고 API 연동 또는 데이터 임포트 후 조회하세요.
              </Typography>
              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F6F6F6', borderRadius: 1, display: 'inline-block', textAlign: 'left' }}>
                <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                  POST /api/ad-webhook/{'{platform}'}<br />
                  GET  /api/marketing-stats?platform=naver&period_type=week<br />
                  GET  /api/marketing-stats/summary
                </Typography>
              </Box>
            </Paper>
          )}

          {/* 플랫폼별 데이터 테이블 */}
          {platforms.map((platformData: any) => (
            <Paper key={platformData.platform} sx={{ mb: 3 }}>
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {platformData.platform_label}
                </Typography>
                <Chip label={platformData.platform} size="small" variant="outlined" />
              </Box>

              {platformData.channels?.map((ch: any) => (
                <Accordion key={ch.channel_type} defaultExpanded disableGutters elevation={0}
                  sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #f0f0f0' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, bgcolor: '#F6F6F6' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">{ch.channel_label}</Typography>
                      <Chip label={ch.channel_type} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      <Chip label={`${ch.data?.length ?? 0}건`} size="small" color="primary" sx={{ fontSize: '0.7rem' }} />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                            {['period_label', 'period_type', 'date_start', 'date_end',
                              'impressions', 'clicks', 'ctr', 'conversions', 'cost', 'cpl', 'cpa'].map(col => (
                              <TableCell key={col} align={['impressions','clicks','ctr','conversions','cost','cpl','cpa'].includes(col) ? 'right' : 'left'}
                                sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                {col}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ch.data?.map((row: any) => (
                            <TableRow key={row.id} hover>
                              <TableCell>{fmt(row.period_label)}</TableCell>
                              <TableCell>{fmt(row.period_type)}</TableCell>
                              <TableCell>{fmt(row.date_start)}</TableCell>
                              <TableCell>{fmt(row.date_end)}</TableCell>
                              <TableCell align="right">{fmtNum(row.impressions)}</TableCell>
                              <TableCell align="right">{fmtNum(row.clicks)}</TableCell>
                              <TableCell align="right">{fmtPct(row.ctr)}</TableCell>
                              <TableCell align="right">{fmtNum(row.conversions)}</TableCell>
                              <TableCell align="right">{fmtCur(row.cost)}</TableCell>
                              <TableCell align="right">{fmtCur(row.cpl)}</TableCell>
                              <TableCell align="right">{fmtCur(row.cpa)}</TableCell>
                            </TableRow>
                          ))}
                          {/* 채널 소계 */}
                          {ch.data?.length > 1 && (() => {
                            const d = ch.data;
                            const sumImpr = d.reduce((s: number, r: any) => s + (r.impressions ?? 0), 0);
                            const sumClk  = d.reduce((s: number, r: any) => s + (r.clicks ?? 0), 0);
                            const sumConv = d.reduce((s: number, r: any) => s + (r.conversions ?? 0), 0);
                            const sumCost = d.reduce((s: number, r: any) => s + (r.cost ?? 0), 0);
                            return (
                              <TableRow sx={{ bgcolor: '#F1F1F1' }}>
                                <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>소계</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{fmtNum(sumImpr)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{fmtNum(sumClk)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                  {sumImpr > 0 ? fmtPct((sumClk / sumImpr) * 100) : '—'}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{fmtNum(sumConv)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{fmtCur(sumCost)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                  {sumConv > 0 ? fmtCur(Math.round(sumCost / sumConv)) : '—'}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                  {sumConv > 0 ? fmtCur(Math.round(sumCost / sumConv)) : '—'}
                                </TableCell>
                              </TableRow>
                            );
                          })()}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          ))}

          {/* API 응답 메타 정보 */}
          {rawData && (
            <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                API 응답 meta
              </Typography>
              <Box component="pre" sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary', overflow: 'auto', m: 0 }}>
                {JSON.stringify(rawData.meta, null, 2)}
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
