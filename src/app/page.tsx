'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Chip, List, ListItem, ListItemText, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useAuth } from '@/contexts/AuthContext';

interface Lead {
  lead_id: string;
  name: string;
  primary_phone: string;
  status: string;
  utm_source: string;
  last_contact_at: string;
  score: number;
  assignee_name: string;
  sla_status: string;
}

interface Ticket {
  ticket_id: string;
  lead_id: string;
  lead_name: string;
  title: string;
  priority: string;
  state: string;
  assignee_name: string;
  created_at: string;
  sla_timer?: {
    remaining: number;
    formatted: string;
    status: string;
  };
}

interface User {
  user_id: string;
  login_id: string;
  name: string;
  email: string;
  role: string;
  clinic_id?: string;
}

interface DashboardData {
  leads: Lead[];
  tickets: Ticket[];
  users: User[];
  loading: boolean;
}

export default function Home() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    leads: [],
    tickets: [],
    users: [],
    loading: true
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true }));

        // Load leads from localStorage
        const storedLeads = localStorage.getItem('mcrm_leads');
        const leads: Lead[] = storedLeads ? JSON.parse(storedLeads) : [];

        // Load users from localStorage
        const storedUsers = localStorage.getItem('mcrm_users');
        const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

        // Mock tickets data (티켓 데이터는 아직 localStorage에 저장되지 않으므로 Mock 데이터 사용)
        const mockTickets: Ticket[] = [
          {
            ticket_id: 'ticket_001',
            lead_id: 'lead_001',
            lead_name: '김환자',
            title: '임플란트 상담 문의',
            priority: '높음',
            assignee_name: '김상담',
            state: '진행',
            created_at: '2025-09-29T08:00:00Z',
            sla_timer: {
              remaining: 120,
              formatted: '2시간 남음',
              status: 'normal'
            }
          },
          {
            ticket_id: 'ticket_002',
            lead_id: 'lead_002',
            lead_name: '이환자',
            title: 'SLA 임박 - 교정 문의',
            priority: '긴급',
            assignee_name: '이상담',
            state: '진행',
            created_at: '2025-09-29T10:00:00Z',
            sla_timer: {
              remaining: 30,
              formatted: '30분 남음',
              status: 'warning'
            }
          },
          {
            ticket_id: 'ticket_003',
            lead_id: 'lead_003',
            lead_name: '박환자',
            title: '미응답 - 스케일링 예약',
            priority: '일반',
            assignee_name: '박상담',
            state: '신규',
            created_at: '2025-09-29T07:00:00Z'
          }
        ];

        setDashboardData({
          leads,
          tickets: mockTickets,
          users,
          loading: false
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    loadDashboardData();

    // 30초마다 데이터 새로고침
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // KPI 계산
  const totalLeads = dashboardData.leads.length;
  const activeTickets = dashboardData.tickets.filter(t => t.state !== '완료').length;
  const urgentTickets = dashboardData.tickets.filter(t => t.sla_timer?.status === 'warning').length;
  const totalUsers = dashboardData.users.length;

  // 최근 리드 (최근 3개)
  const recentLeads = dashboardData.leads
    .sort((a, b) => new Date(b.last_contact_at).getTime() - new Date(a.last_contact_at).getTime())
    .slice(0, 3);

  // 긴급 티켓
  const urgentTicketsList = dashboardData.tickets
    .filter(t => t.sla_timer?.status === 'warning' || t.priority === '긴급')
    .slice(0, 5);

  if (dashboardData.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        홈 대시보드
        {user && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            안녕하세요, {user.name}님! ({user.role})
          </Typography>
        )}
      </Typography>

      <Grid container spacing={3}>
        {/* 상단 KPI 카드 (소형) */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: 120 }}>
            <Typography variant="h6">전체 문의</Typography>
            <Typography variant="h4" color="primary">{totalLeads}</Typography>
            <Typography variant="body2" color="text.secondary">등록된 문의</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: 120 }}>
            <Typography variant="h6">진행중 상담</Typography>
            <Typography variant="h4" color="secondary">{activeTickets}</Typography>
            <Typography variant="body2" color="text.secondary">진행중인 상담</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: 120 }}>
            <Typography variant="h6">긴급 상담</Typography>
            <Typography variant="h4" sx={{ color: 'error.main' }}>{urgentTickets}</Typography>
            <Typography variant="body2" color="text.secondary">긴급/SLA 임박</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: 120 }}>
            <Typography variant="h6">전체 사용자</Typography>
            <Typography variant="h4" sx={{ color: 'success.main' }}>{totalUsers}</Typography>
            <Typography variant="body2" color="text.secondary">등록된 사용자</Typography>
          </Paper>
        </Grid>

        {/* 중단 최근 문의 목록 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>최근 문의</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              {recentLeads.length > 0 ? (
                <List sx={{
                  maxHeight: '100%',
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '4px',
                    '&:hover': {
                      background: '#a8a8a8',
                    },
                  },
                }}>
                  {recentLeads.map((lead, index) => (
                    <ListItem key={lead.lead_id} sx={{ py: 1 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">{lead.name.charAt(0) + '**'}</Typography>
                            <Chip
                              label={lead.status}
                              size="small"
                              color={lead.status === '상담완료' ? 'primary' : lead.status === '계약완료' ? 'success' : 'secondary'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              채널: {lead.utm_source} | 담당자: {lead.assignee_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              스코어: {lead.score} | {new Date(lead.last_contact_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      {index < recentLeads.length - 1 && <Divider />}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="text.secondary">등록된 문의가 없습니다</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* 중단 긴급 상담 목록 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>긴급 상담</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              {urgentTicketsList.length > 0 ? (
                <List sx={{
                  maxHeight: '100%',
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '4px',
                    '&:hover': {
                      background: '#a8a8a8',
                    },
                  },
                }}>
                  {urgentTicketsList.map((ticket, index) => (
                    <ListItem key={ticket.ticket_id} sx={{ py: 1 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">{ticket.title}</Typography>
                            <Chip
                              label={ticket.priority}
                              size="small"
                              color={ticket.priority === '긴급' ? 'error' : 'warning'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              리드: {ticket.lead_name} | 담당자: {ticket.assignee_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              상태: {ticket.state}
                              {ticket.sla_timer && (
                                <Chip
                                  label={ticket.sla_timer.formatted}
                                  size="small"
                                  color={ticket.sla_timer.status === 'warning' ? 'error' : 'info'}
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                          </Box>
                        }
                      />
                      {index < urgentTicketsList.length - 1 && <Divider />}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="text.secondary">긴급 상담이 없습니다</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* 하단 채널별 문의 분포 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>채널별 문의 분포</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              {(() => {
                const channelCounts = dashboardData.leads.reduce((acc, lead) => {
                  acc[lead.utm_source] = (acc[lead.utm_source] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                const channels = Object.entries(channelCounts);

                if (channels.length === 0) {
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography color="text.secondary">데이터가 없습니다</Typography>
                    </Box>
                  );
                }

                return (
                  <Box sx={{
                    pt: 2,
                    maxHeight: '100%',
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#c1c1c1',
                      borderRadius: '4px',
                      '&:hover': {
                        background: '#a8a8a8',
                      },
                    },
                  }}>
                    {channels.map(([channel, count]) => (
                      <Box key={channel} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">{channel}</Typography>
                        <Chip label={count} size="small" variant="outlined" />
                      </Box>
                    ))}
                  </Box>
                );
              })()}
            </Box>
          </Paper>
        </Grid>

        {/* 하단 사용자 현황 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>사용자 현황</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              {dashboardData.users.length > 0 ? (
                <List sx={{
                  maxHeight: '100%',
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '4px',
                    '&:hover': {
                      background: '#a8a8a8',
                    },
                  },
                }}>
                  {dashboardData.users.map((user, index) => (
                    <ListItem key={user.user_id} sx={{ py: 1 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">{user.name}</Typography>
                            <Chip label={user.role} size="small" variant="outlined" />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {user.login_id} | {user.email}
                          </Typography>
                        }
                      />
                      {index < dashboardData.users.length - 1 && <Divider />}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="text.secondary">등록된 사용자가 없습니다</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}