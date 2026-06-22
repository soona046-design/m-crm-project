'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Card, CardContent, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl, Alert, Snackbar } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DashboardFilters from '@/components/DashboardFilters';
import api from '@/lib/axios';

interface AgentPerformanceData {
  user_id: string;
  login_id?: string; // 로그인 아이디 추가
  name: string;
  total_tickets?: number;
  average_response_time?: number; // 분 단위
  clinic_visit_conversion_rate?: number; // % 단위
  sla_violation_rate?: number; // % 단위
  total_appointments?: number;
  total_clinic_visits?: number;
  total_revenue?: number;
  email?: string; // Added for user management
  role?: string; // Added for user management
  clinic_id?: string; // Added for user management
  phone?: string; // Added for user management
  active?: boolean; // Added for user management
  password?: string; // Added for user management
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
      <Box sx={{ fontSize: 40, color: 'rgba(255,255,255,0.7)' }}>{icon}</Box>
    </Card>
  );
}

export default function AgentPerformanceDashboardPage() {
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for user management
  const [users, setUsers] = useState<AgentPerformanceData[]>([]); // 모든 상담원 (사용자) 데이터
  const [openUserModal, setOpenUserModal] = useState(false); // 상담원 관리 모달 상태
  const [currentUser, setCurrentUser] = useState<AgentPerformanceData | null>(null); // 현재 편집 중인 상담원
  const [userLoading, setUserLoading] = useState(false); // 사용자 API 로딩 상태
  const [userError, setUserError] = useState<string | null>(null); // 사용자 API 오류 상태
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  // 필터 상태 관리
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 30))); // 기본값: 30일 전
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [clinics, setClinics] = useState<Array<{ clinic_id: string; name: string }>>([]);

  // 필터 적용
  const fetchAgentPerformance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // localStorage에서 리드 데이터 가져오기
      let leadsData: any[] = [];
      if (typeof window !== 'undefined') {
        const storedLeads = localStorage.getItem('mcrm_leads');
        if (storedLeads) {
          leadsData = JSON.parse(storedLeads);
        }
      }

      // 담당자별 매출 집계
      const agentStats: { [key: string]: { revenue: number; count: number } } = {};
      leadsData.forEach((lead: any) => {
        const assignee = lead.assignee_name || '미배정';
        if (!agentStats[assignee]) {
          agentStats[assignee] = { revenue: 0, count: 0 };
        }
        agentStats[assignee].revenue += lead.revenue || 0;
        agentStats[assignee].count += 1;
      });

      // Mock data for development (실제 리드 데이터의 매출 반영)
      const mockAgentPerformance: AgentPerformanceData[] = [
        {
          user_id: '1',
          login_id: 'kim_agent',
          name: '김상담',
          total_tickets: 45,
          average_response_time: 12,
          clinic_visit_conversion_rate: 78.5,
          sla_violation_rate: 5.2,
          total_appointments: 28,
          total_clinic_visits: 22,
          total_revenue: agentStats['김상담']?.revenue || 3300000,
          email: 'kim.agent@clinic.com',
          role: '상담매니저',
          clinic_id: 'clinic1',
          active: true
        },
        {
          user_id: '2',
          login_id: 'lee_agent',
          name: '이상담',
          total_tickets: 38,
          average_response_time: 15,
          clinic_visit_conversion_rate: 82.1,
          sla_violation_rate: 3.1,
          total_appointments: 25,
          total_clinic_visits: 21,
          total_revenue: agentStats['이상담']?.revenue || 3150000,
          email: 'lee.agent@clinic.com',
          role: '상담매니저',
          clinic_id: 'clinic1',
          active: true
        },
        {
          user_id: '3',
          login_id: 'park_agent',
          name: '박상담',
          total_tickets: 52,
          average_response_time: 8,
          clinic_visit_conversion_rate: 74.3,
          sla_violation_rate: 7.8,
          total_appointments: 32,
          total_clinic_visits: 24,
          total_revenue: agentStats['박상담']?.revenue || 3600000,
          email: 'park.agent@clinic.com',
          role: '상담매니저',
          clinic_id: 'clinic2',
          active: true
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setAgentPerformance(mockAgentPerformance);

    } catch (err) {
      console.error("Failed to fetch agent performance data:", err);
      setError("Failed to load agent performance data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 실제 사용자 목록을 백엔드 API에서 가져오기 (관리 화면이므로 마스킹 해제 + 전체 페이지 조회)
  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    setUserError(null);
    try {
      const response = await api.get('/api/users', {
        params: { mask_sensitive: false, per_page: 200 },
      });
      const usersData = response.data?.data || response.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUserError("Failed to load user data. Please try again.");
      setSnackbarMessage("사용자 데이터를 불러오는데 실패했습니다.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUserLoading(false);
    }
  }, []);

  // 지점 목록 가져오기
  const fetchClinics = useCallback(async () => {
    try {
      // Mock clinics data for development
      const mockClinics = [
        { clinic_id: 'clinic1', name: '강남점' },
        { clinic_id: 'clinic2', name: '종로점' },
        { clinic_id: 'clinic3', name: '홍대점' },
        { clinic_id: 'clinic4', name: '신촌점' }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setClinics(mockClinics);
    } catch (err) {
      console.error("Failed to fetch clinics:", err);
      setSnackbarMessage("지점 목록을 불러오는데 실패했습니다.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, []);

  // 필터 초기화
  const handleResetFilters = useCallback(() => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
    setEndDate(new Date());
    setSelectedClinicId('');
    setSelectedAgentId('');
  }, []);

  useEffect(() => {
    fetchAgentPerformance();
    fetchUsers();
    fetchClinics();
  }, [fetchAgentPerformance, fetchUsers, fetchClinics]);

  // KPI 계산 (전체 상담원 대상)
  const totalAgents = agentPerformance.length;
  const avgResponseTime = totalAgents > 0
    ? agentPerformance.reduce((sum, agent) => sum + (agent.average_response_time || 0), 0) / totalAgents
    : 0;
  const avgConversionRate = totalAgents > 0
    ? agentPerformance.reduce((sum, agent) => sum + (agent.clinic_visit_conversion_rate || 0), 0) / totalAgents
    : 0;
  const avgSlaViolationRate = totalAgents > 0
    ? agentPerformance.reduce((sum, agent) => sum + (agent.sla_violation_rate || 0), 0) / totalAgents
    : 0;

  const formatDuration = (minutes: number | undefined) => {
    if (typeof minutes !== 'number' || isNaN(minutes)) return '0분';
    if (minutes < 60) return `${minutes.toFixed(0)}분`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}시간 ${remainingMinutes.toFixed(0)}분`;
  };

  const formatPercentage = (value: number | undefined) => {
    if (typeof value !== 'number' || isNaN(value)) return '0.00%';
    return `${value.toFixed(2)}%`;
  };
  const formatCurrency = (value: number | undefined) => {
    if (typeof value !== 'number' || isNaN(value)) return '₩0';
    return `₩${value.toLocaleString()}`;
  };

  const handleAddOrUpdateUser = useCallback(async () => {
    if (!currentUser || !currentUser.name || !currentUser.email || !currentUser.login_id || (!currentUser.user_id && !currentUser.password)) {
      setSnackbarMessage("이름, 이메일, 로그인 아이디, 비밀번호(새 사용자일 경우)는 필수입니다.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setUserLoading(true);
    setUserError(null);
    try {
      const payload: Record<string, unknown> = {
        login_id: currentUser.login_id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role || '상담매니저',
        clinic_id: currentUser.clinic_id || null,
        phone: currentUser.phone || null,
        active: currentUser.active ?? true, // 명시적으로 보내지 않으면 신규 사용자가 비활성으로 저장되던 버그 방지
      };
      if (currentUser.password) {
        payload.password = currentUser.password;
      }

      if (currentUser.user_id) {
        await api.put(`/api/users/${currentUser.user_id}`, payload);
        setSnackbarMessage("사용자 정보가 성공적으로 업데이트되었습니다.");
      } else {
        await api.post('/api/users', payload);
        setSnackbarMessage("새 사용자가 성공적으로 추가되었습니다.");
      }
      setSnackbarSeverity('success');
      setOpenUserModal(false);
      setSnackbarOpen(true);
      await fetchUsers(); // 서버 상태로 다시 동기화 (목록에 즉시 정확하게 반영)
    } catch (err: any) {
      console.error("Failed to add/update user:", err);
      const validationErrors = err.response?.data?.errors;
      const message = validationErrors
        ? Object.values(validationErrors).flat().join(' ')
        : (err.response?.data?.message || err.message);
      setUserError("사용자 추가/업데이트에 실패했습니다. " + message);
      setSnackbarMessage("사용자 추가/업데이트에 실패했습니다: " + message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUserLoading(false);
    }
  }, [currentUser, fetchUsers]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    if (!confirm("정말로 이 사용자를 삭제하시겠습니까?")) return;

    setUserLoading(true);
    setUserError(null);
    try {
      await api.delete(`/api/users/${userId}`);
      setSnackbarMessage("사용자가 성공적으로 삭제되었습니다.");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      await fetchUsers();
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      const message = err.response?.data?.message || err.message;
      setUserError("사용자 삭제에 실패했습니다. " + message);
      setSnackbarMessage("사용자 삭제에 실패했습니다.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUserLoading(false);
    }
  }, [fetchUsers]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        상담원 성과 대시보드
      </Typography>

      <DashboardFilters
        startDate={startDate}
        endDate={endDate}
        clinicId={selectedClinicId}
        agentId={selectedAgentId}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClinicChange={setSelectedClinicId}
        onAgentChange={setSelectedAgentId}
        onApplyFilters={fetchAgentPerformance}
        onResetFilters={handleResetFilters}
        clinics={clinics}
        agents={users}
      />

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && (
        <Grid container spacing={3}>
          {/* Top KPI Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="평균 응답속도" value={formatDuration(avgResponseTime)} icon={<AccessTimeIcon />} color="#1E88E5" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="평균 내원 전환율" value={formatPercentage(avgConversionRate)} icon={<TrendingUpIcon />} color="#4CAF50" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="평균 SLA 위반율" value={formatPercentage(avgSlaViolationRate)} icon={<ErrorOutlineIcon />} color="#EF5350" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="총 상담자 수" value={totalAgents.toLocaleString()} icon={<PeopleAltIcon />} color="#FFA726" />
          </Grid>

          {/* Agent Performance Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>개별 상담자 성과</Typography>
              {agentPerformance.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>상담자</TableCell>
                        <TableCell align="right">총 상담 건</TableCell>
                        <TableCell align="right">평균 응답속도</TableCell>
                        <TableCell align="right">내원 전환율</TableCell>
                        <TableCell align="right">SLA 위반율</TableCell>
                        <TableCell align="right">총 예약</TableCell>
                        <TableCell align="right">총 내원</TableCell>
                        <TableCell align="right">총 매출</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {agentPerformance.map((agent) => (
                        <TableRow key={agent.user_id}>
                          <TableCell>{agent.name}</TableCell>
                          <TableCell align="right">{(agent.total_tickets ?? 0).toLocaleString()}</TableCell>
                          <TableCell align="right">{formatDuration(agent.average_response_time)}</TableCell>
                          <TableCell align="right">{formatPercentage(agent.clinic_visit_conversion_rate)}</TableCell>
                          <TableCell align="right">{formatPercentage(agent.sla_violation_rate)}</TableCell>
                          <TableCell align="right">{(agent.total_appointments ?? 0).toLocaleString()}</TableCell>
                          <TableCell align="right">{(agent.total_clinic_visits ?? 0).toLocaleString()}</TableCell>
                          <TableCell align="right">{formatCurrency(agent.total_revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" color="text.secondary">상담자 성과 데이터가 없습니다.</Typography>
              )}
            </Paper>
          </Grid>

          {/* User Management Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>사용자 관리</Typography>
                <Button variant="contained" onClick={() => { setCurrentUser({ role: '상담매니저', active: true } as AgentPerformanceData); setOpenUserModal(true); }}>
                  새 사용자 추가
                </Button>
              </Box>
              
              {userLoading && <CircularProgress />}
              {userError && <Typography color="error">{userError}</Typography>}

              {!userLoading && !userError && users.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>이름</TableCell>
                        <TableCell>이메일</TableCell>
                        <TableCell>역할</TableCell>
                        <TableCell>지점 ID</TableCell>
                        <TableCell>전화번호</TableCell>
                        <TableCell>활성화</TableCell>
                        <TableCell align="right">작업</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>{user.clinic_id ?? 'N/A'}</TableCell>
                          <TableCell>{user.phone ?? 'N/A'}</TableCell>
                          <TableCell>{user.active ? '예' : '아니오'}</TableCell>
                          <TableCell align="right">
                            <Button size="small" onClick={() => { setCurrentUser(user); setOpenUserModal(true); }}>수정</Button>
                            <Button size="small" color="error" onClick={() => handleDeleteUser(user.user_id)} sx={{ ml: 1 }}>삭제</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                !userLoading && !userError && <Typography variant="body1" color="text.secondary">사용자 데이터가 없습니다.</Typography>
              )}
            </Paper>
          </Grid>

          {/* User Add/Edit Modal */}
          <Dialog open={openUserModal} onClose={() => setOpenUserModal(false)}>
            <DialogTitle>{currentUser?.user_id ? '사용자 수정' : '새 사용자 추가'}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="이름"
                type="text"
                fullWidth
                variant="outlined"
                value={currentUser?.name || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value } as AgentPerformanceData)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                id="email"
                label="이메일"
                type="email"
                fullWidth
                variant="outlined"
                value={currentUser?.email || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value } as AgentPerformanceData)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                id="login_id"
                label="로그인 아이디"
                type="text"
                fullWidth
                variant="outlined"
                value={currentUser?.login_id || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, login_id: e.target.value } as AgentPerformanceData)}
                sx={{ mb: 2 }}
                helperText="시스템 로그인 시 사용할 아이디입니다"
              />
              <TextField
                margin="dense"
                id="password"
                label="비밀번호"
                type="password"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                placeholder={currentUser ? '변경하지 않으려면 비워두세요' : ''}
                onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value } as AgentPerformanceData)}
              />
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="role-label">역할</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={currentUser?.role || '상담매니저'} // Default role
                  label="역할"
                  onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value } as AgentPerformanceData)}
                >
                  <MenuItem value="슈퍼관리자">슈퍼관리자</MenuItem>
                  <MenuItem value="지점관리자">지점관리자</MenuItem>
                  <MenuItem value="상담매니저">상담매니저</MenuItem>
                  <MenuItem value="마케터">마케터</MenuItem>
                  <MenuItem value="의사">의사</MenuItem>
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                id="clinic_id"
                label="지점 ID"
                type="text"
                fullWidth
                variant="outlined"
                value={currentUser?.clinic_id || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, clinic_id: e.target.value } as AgentPerformanceData)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                id="phone"
                label="전화번호"
                type="text"
                fullWidth
                variant="outlined"
                value={currentUser?.phone || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value } as AgentPerformanceData)}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="active-label">활성화</InputLabel>
                <Select
                  labelId="active-label"
                  id="active"
                  value={currentUser?.active === false ? 'false' : 'true'} // Default active
                  label="활성화"
                  onChange={(e) => setCurrentUser({ ...currentUser, active: e.target.value === 'true' } as AgentPerformanceData)}
                >
                  <MenuItem value="true">예</MenuItem>
                  <MenuItem value="false">아니오</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenUserModal(false)}>취소</Button>
              <Button onClick={handleAddOrUpdateUser} variant="contained">{currentUser?.user_id ? '수정' : '추가'}</Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>

          {/* TODO: 기간/지점/상담원 필터링, 차트 시각화 (예: 응답 시간 분포) */}
        </Grid>
      )}
    </Box>
  );
}
