'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Psychology as AiIcon,
  Delete as DeleteIcon,
  BarChart as ChartIcon,
} from '@mui/icons-material';
import api from '@/lib/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 날짜 유틸리티 함수
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const subDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

interface TreatmentType {
  id: number;
  code: string;
  name: string;
  category: string;
  color: string;
}

interface ChannelCategory {
  id: number;
  code: string;
  name: string;
  color: string;
}

interface Record {
  id: number;
  record_date: string;
  channel_category_id: number;
  treatment_type_id: number;
  count: number;
  revenue: number | null;
  notes: string | null;
  input_type: 'manual' | 'auto';
  channelCategory?: ChannelCategory;
  treatmentType?: TreatmentType;
}

interface MatrixData {
  [channelName: string]: {
    [treatmentName: string]: {
      count: number;
      revenue: number;
    };
  };
}

interface MarketingInsight {
  id: number;
  title: string;
  insight_type: string;
  analysis_period_start: string;
  analysis_period_end: string;
  content: {
    summary: string;
    key_findings: string[];
    detailed_analysis: any;
  };
  recommendations: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
    expected_impact: string;
  }>;
  confidence_score: number;
  is_published: boolean;
  created_at: string;
}

export default function ChannelTreatmentMatrixPage() {
  const [startDate, setStartDate] = useState<string>(formatDate(subDays(new Date(), 30)));
  const [endDate, setEndDate] = useState<string>(formatDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [matrix, setMatrix] = useState<MatrixData>({});
  const [treatmentTypes, setTreatmentTypes] = useState<TreatmentType[]>([]);
  const [channelCategories, setChannelCategories] = useState<ChannelCategory[]>([]);
  const [insights, setInsights] = useState<MarketingInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 입력 다이얼로그
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    record_date: formatDate(new Date()),
    channel_category_id: '',
    treatment_type_id: '',
    count: 0,
    revenue: '',
    notes: '',
  });

  // 탭 상태
  const [tabValue, setTabValue] = useState(0);

  // 초기 데이터 로드
  useEffect(() => {
    loadMasterData();
    loadData();
    loadInsights();
  }, []);

  // 날짜 변경 시 데이터 재로드
  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadMasterData = async () => {
    try {
      const [typesRes, categoriesRes] = await Promise.all([
        api.get('/channel-treatment-matrix/treatment-types'),
        api.get('/channel-treatment-matrix/channel-categories'),
      ]);
      setTreatmentTypes(typesRes.data);
      setChannelCategories(categoriesRes.data);
    } catch (err: any) {
      setError('마스터 데이터 로드 실패');
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/channel-treatment-matrix', {
        params: {
          start_date: startDate,
          end_date: endDate,
          input_type: 'all',
        },
      });
      setRecords(response.data.records);
      setMatrix(response.data.matrix);
    } catch (err: any) {
      setError(err.response?.data?.message || '데이터 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await api.get('/marketing-insights', {
        params: {
          is_published: true,
        },
      });
      setInsights(response.data.data || []);
    } catch (err) {
      console.error('인사이트 로드 실패', err);
    }
  };

  const handleAutoCollect = async () => {
    if (!confirm('기존 데이터를 분석하여 자동으로 집계하시겠습니까?')) return;

    setLoading(true);
    try {
      await api.post('/channel-treatment-matrix/auto-collect', {
        start_date: startDate,
        end_date: endDate,
      });
      alert('자동 집계가 완료되었습니다.');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || '자동 집계 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsight = async () => {
    setLoading(true);
    try {
      await api.post('/marketing-insights/generate', {
        start_date: startDate,
        end_date: endDate,
        insight_type: 'recommendation',
      });
      alert('AI 분석이 완료되었습니다.');
      loadInsights();
    } catch (err: any) {
      alert(err.response?.data?.message || 'AI 분석 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecord = async () => {
    try {
      await api.post('/channel-treatment-matrix', {
        ...formData,
        channel_category_id: parseInt(formData.channel_category_id),
        treatment_type_id: parseInt(formData.treatment_type_id),
        revenue: formData.revenue ? parseFloat(formData.revenue) : null,
      });
      alert('저장되었습니다.');
      setOpenDialog(false);
      loadData();
      // 폼 초기화
      setFormData({
        record_date: formatDate(new Date()),
        channel_category_id: '',
        treatment_type_id: '',
        count: 0,
        revenue: '',
        notes: '',
      });
    } catch (err: any) {
      alert(err.response?.data?.message || '저장 실패');
    }
  };

  const handleDeleteRecord = async (id: number, inputType: string) => {
    if (inputType === 'auto') {
      alert('자동 수집 데이터는 삭제할 수 없습니다.');
      return;
    }
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/channel-treatment-matrix/${id}`);
      alert('삭제되었습니다.');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제 실패');
    }
  };

  // 차트 데이터 준비
  const prepareChartData = () => {
    const channelNames = Object.keys(matrix);
    const treatmentNames = new Set<string>();

    Object.values(matrix).forEach(channelData => {
      Object.keys(channelData).forEach(treatment => treatmentNames.add(treatment));
    });

    const datasets = Array.from(treatmentNames).map((treatmentName, index) => {
      const treatmentType = treatmentTypes.find(t => t.name === treatmentName);
      return {
        label: treatmentName,
        data: channelNames.map(channel => matrix[channel][treatmentName]?.count || 0),
        backgroundColor: treatmentType?.color || `hsl(${index * 40}, 70%, 60%)`,
      };
    });

    return {
      labels: channelNames,
      datasets,
    };
  };

  return (
    <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">채널별 진료 내용 분석</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleAutoCollect}
              disabled={loading}
            >
              자동 집계
            </Button>
            <Button
              variant="outlined"
              startIcon={<AiIcon />}
              onClick={handleGenerateInsight}
              disabled={loading}
            >
              AI 분석
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              직접 입력
            </Button>
          </Box>
        </Box>

        {/* 날짜 선택 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="시작일"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <Typography>~</Typography>
              <TextField
                label="종료일"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="outlined" onClick={loadData}>
                조회
              </Button>
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 탭 */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="매트릭스 표" />
            <Tab label="그래프" />
            <Tab label="상세 기록" />
            <Tab label="AI 인사이트" />
          </Tabs>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* 탭 패널 0: 매트릭스 표 */}
            {tabValue === 0 && (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>내원경로</TableCell>
                      {treatmentTypes.map(type => (
                        <TableCell key={type.id} align="center">
                          <Chip
                            label={type.name}
                            size="small"
                            sx={{ backgroundColor: type.color, color: 'white' }}
                          />
                        </TableCell>
                      ))}
                      <TableCell align="right">합계</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(matrix).map(([channelName, treatments]) => {
                      const rowTotal = Object.values(treatments).reduce((sum, t) => sum + t.count, 0);
                      return (
                        <TableRow key={channelName}>
                          <TableCell component="th" scope="row">
                            <strong>{channelName}</strong>
                          </TableCell>
                          {treatmentTypes.map(type => {
                            const data = treatments[type.name];
                            return (
                              <TableCell key={type.id} align="center">
                                {data ? (
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      {data.count}건
                                    </Typography>
                                    {data.revenue > 0 && (
                                      <Typography variant="caption" color="text.secondary">
                                        {new Intl.NumberFormat('ko-KR').format(data.revenue)}원
                                      </Typography>
                                    )}
                                  </Box>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                            );
                          })}
                          <TableCell align="right">
                            <strong>{rowTotal}건</strong>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* 탭 패널 1: 그래프 */}
            {tabValue === 1 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  채널별 진료 건수
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Bar
                    data={prepareChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            )}

            {/* 탭 패널 2: 상세 기록 */}
            {tabValue === 2 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>날짜</TableCell>
                      <TableCell>내원경로</TableCell>
                      <TableCell>진료유형</TableCell>
                      <TableCell align="right">건수</TableCell>
                      <TableCell align="right">매출</TableCell>
                      <TableCell>입력방식</TableCell>
                      <TableCell>메모</TableCell>
                      <TableCell align="center">작업</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map(record => (
                      <TableRow key={record.id}>
                        <TableCell>{record.record_date}</TableCell>
                        <TableCell>{record.channelCategory?.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={record.treatmentType?.name}
                            size="small"
                            sx={{
                              backgroundColor: record.treatmentType?.color,
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{record.count}</TableCell>
                        <TableCell align="right">
                          {record.revenue
                            ? new Intl.NumberFormat('ko-KR').format(record.revenue) + '원'
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.input_type === 'manual' ? '수동' : '자동'}
                            color={record.input_type === 'manual' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{record.notes || '-'}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRecord(record.id, record.input_type)}
                            disabled={record.input_type === 'auto'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* 탭 패널 3: AI 인사이트 */}
            {tabValue === 3 && (
              <Grid container spacing={2}>
                {insights.length === 0 ? (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      아직 생성된 인사이트가 없습니다. AI 분석 버튼을 클릭하여 인사이트를 생성하세요.
                    </Alert>
                  </Grid>
                ) : (
                  insights.map(insight => (
                    <Grid item xs={12} md={6} key={insight.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {insight.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {insight.content.summary}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              주요 발견사항:
                            </Typography>
                            <ul>
                              {insight.content.key_findings.map((finding, idx) => (
                                <li key={idx}>
                                  <Typography variant="body2">{finding}</Typography>
                                </li>
                              ))}
                            </ul>
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              마케팅 제안:
                            </Typography>
                            {insight.recommendations.map((rec, idx) => (
                              <Card key={idx} variant="outlined" sx={{ mt: 1, p: 1 }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {rec.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {rec.description}
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  <Chip label={rec.priority} size="small" color="warning" />
                                  <Typography variant="caption" sx={{ ml: 1 }}>
                                    예상 효과: {rec.expected_impact}
                                  </Typography>
                                </Box>
                              </Card>
                            ))}
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Chip
                              label={`신뢰도: ${insight.confidence_score}%`}
                              size="small"
                              color="success"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            )}
          </>
        )}

        {/* 직접 입력 다이얼로그 */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>데이터 직접 입력</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="날짜"
                type="date"
                value={formData.record_date}
                onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                select
                label="내원경로"
                value={formData.channel_category_id}
                onChange={(e) => setFormData({ ...formData, channel_category_id: e.target.value })}
                fullWidth
              >
                {channelCategories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="진료유형"
                value={formData.treatment_type_id}
                onChange={(e) => setFormData({ ...formData, treatment_type_id: e.target.value })}
                fullWidth
              >
                {treatmentTypes.map(type => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name} ({type.category})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="건수"
                type="number"
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 0 })}
                fullWidth
              />
              <TextField
                label="매출 (선택)"
                type="number"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                fullWidth
              />
              <TextField
                label="메모 (선택)"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>취소</Button>
            <Button onClick={handleSaveRecord} variant="contained">
              저장
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
}
