'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Card, CardContent, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl, Alert, Snackbar } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DashboardFilters from '@/components/DashboardFilters';
import axios from 'axios';

interface AgentPerformanceData {
  user_id: string;
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
      const params = {
        start_date: startDate?.toISOString().split('T')[0],
        end_date: endDate?.toISOString().split('T')[0],
        clinic_id: selectedClinicId || undefined,
        agent_id: selectedAgentId || undefined,
      };
      const response = await axios.get('/api/dashboards/agents', { params }); // [BE-06] API 사용
      const data = response.data.data || response.data; // 예시: 배열 형태의 상담원 데이터

      setAgentPerformance(data);

    } catch (err) {
      console.error("Failed to fetch agent performance data:", err);
      setError("Failed to load agent performance data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // New function to fetch all users (agents)
  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    setUserError(null);
    try {
      const response = await axios.get('/api/users'); // [BE-07] User API 사용
      setUsers(response.data);
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
      const response = await axios.get('/api/clinics');
      setClinics(response.data);
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
    ? agentPerformance.reduce((sum, agent) => sum + agent.average_response_time ?? 0, 0) / totalAgents
    : 0;
  const avgConversionRate = totalAgents > 0
    ? agentPerformance.reduce((sum, agent) => sum + agent.clinic_visit_conversion_rate ?? 0, 0) / totalAgents
    : 0;
  const avgSlaViolationRate = totalAgents > 0
    ? agentPerformance.reduce((sum, agent) => sum + agent.sla_violation_rate ?? 0, 0) / totalAgents
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

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Agent Performance Dashboard
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
            <KpiCard title="평균 응답 시간" value={formatDuration(avgResponseTime)} icon={<AccessTimeIcon />} color="#1E88E5" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="평균 내원 전환율" value={formatPercentage(avgConversionRate)} icon={<TrendingUpIcon />} color="#4CAF50" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="평균 SLA 위반율" value={formatPercentage(avgSlaViolationRate)} icon={<ErrorOutlineIcon />} color="#EF5350" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="총 상담원 수" value={totalAgents.toLocaleString()} icon={<PeopleAltIcon />} color="#FFA726" />
          </Grid>

          {/* Agent Performance Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Individual Agent Performance</Typography>
              {agentPerformance.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>상담원</TableCell>
                        <TableCell align="right">총 상담</TableCell>
                        <TableCell align="right">평균 응답 시간</TableCell>
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
                <Typography variant="body1" color="text.secondary">No agent performance data available.</Typography>
              )}
            </Paper>
          </Grid>

          {/* User Management Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>Manage Users</Typography>
                <Button variant="contained" onClick={() => { setCurrentUser(null); setOpenUserModal(true); }}>
                  Add New User
                </Button>
              </Box>
              
              {userLoading && <CircularProgress />}
              {userError && <Typography color="error">{userError}</Typography>}

              {!userLoading && !userError && users.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Clinic ID</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Active</TableCell>
                        <TableCell align="right">Actions</TableCell>
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
                          <TableCell>{user.active ? 'Yes' : 'No'}</TableCell>
                          <TableCell align="right">
                            <Button size="small" onClick={() => { setCurrentUser(user); setOpenUserModal(true); }}>Edit</Button>
                            <Button size="small" color="error" onClick={() => handleDeleteUser(user.user_id)} sx={{ ml: 1 }}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                !userLoading && !userError && <Typography variant="body1" color="text.secondary">No user data available.</Typography>
              )}
            </Paper>
          </Grid>

          {/* User Add/Edit Modal */}
          <Dialog open={openUserModal} onClose={() => setOpenUserModal(false)}>
            <DialogTitle>{currentUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Name"
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
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={currentUser?.email || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value } as AgentPerformanceData)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                id="password"
                label="Password" 
                type="password"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                placeholder={currentUser ? 'Leave blank to keep current password' : ''}
                onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value } as AgentPerformanceData)}
              />
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={currentUser?.role || 'agent'} // Default role
                  label="Role"
                  onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value } as AgentPerformanceData)}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="agent">Agent</MenuItem>
                  <MenuItem value="client">Client</MenuItem>
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                id="clinic_id"
                label="Clinic ID (UUID)"
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
                label="Phone"
                type="text"
                fullWidth
                variant="outlined"
                value={currentUser?.phone || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value } as AgentPerformanceData)}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="active-label">Active</InputLabel>
                <Select
                  labelId="active-label"
                  id="active"
                  value={currentUser?.active === false ? 'false' : 'true'} // Default active
                  label="Active"
                  onChange={(e) => setCurrentUser({ ...currentUser, active: e.target.value === 'true' } as AgentPerformanceData)}
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenUserModal(false)}>Cancel</Button>
              <Button onClick={handleAddOrUpdateUser} variant="contained">{currentUser ? 'Update' : 'Add'}</Button>
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

  async function handleAddOrUpdateUser() {
    if (!currentUser || !currentUser.name || !currentUser.email || (!currentUser.user_id && !currentUser.password)) {
      setSnackbarMessage("이름, 이메일, 비밀번호(새 사용자일 경우)는 필수입니다.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setUserLoading(true);
    setUserError(null);
    try {
      if (currentUser.user_id) {
        // Update existing user
        await axios.put(`/api/users/${currentUser.user_id}`, currentUser);
        setSnackbarMessage("사용자 정보가 성공적으로 업데이트되었습니다.");
        setSnackbarSeverity('success');
      } else {
        // Add new user
        await axios.post('/api/users', currentUser);
        setSnackbarMessage("새 사용자가 성공적으로 추가되었습니다.");
        setSnackbarSeverity('success');
      }
      setOpenUserModal(false);
      setSnackbarOpen(true);
      fetchUsers(); // Refresh user list
    } catch (err: any) {
      console.error("Failed to add/update user:", err);
      setUserError("사용자 추가/업데이트에 실패했습니다. " + (err.response?.data?.message || err.message));
      setSnackbarMessage("사용자 추가/업데이트에 실패했습니다.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUserLoading(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("정말로 이 사용자를 삭제하시겠습니까?")) return;

    setUserLoading(true);
    setUserError(null);
    try {
      await axios.delete(`/api/users/${userId}`);
      setSnackbarMessage("사용자가 성공적으로 삭제되었습니다.");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchUsers(); // Refresh user list
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      setUserError("사용자 삭제에 실패했습니다. " + (err.response?.data?.message || err.message));
      setSnackbarMessage("사용자 삭제에 실패했습니다.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUserLoading(false);
    }
  }
}
