'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  IconButton,
  Tab,
  Tabs,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getPriorityInfoFromScore } from '@/lib/leadPriority';

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
  communication_count: number;
  revenue?: number;
  treatment?: string;
  consultation_notes?: string;
  timeline?: TimelineEvent[];
  consultations?: Consultation[];
  appointments?: Appointment[];
  notes?: Note[];
}

interface TimelineEvent {
  id: string;
  type: string;
  content: string;
  created_at: string;
  created_by: string;
}

interface Consultation {
  id: string;
  date: string;
  counselor: string;
  content: string;
  status: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  treatment: string;
  status: string;
  revenue?: number;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
}

interface Ticket {
  ticket_id: string;
  lead_id: string;
  lead_name: string;
  title?: string;
  notes: string;
  latest_message_preview?: string;
  sla_timer?: {
    remaining: number;
    formatted: string;
    status: 'normal' | 'warning' | 'violated';
  };
  sla_due_at?: string;
  priority: '긴급' | '높음' | '일반' | '낮음';
  assignee_id?: string;
  assignee_name?: string;
  state: '신규' | '진행' | '보류' | '완료';
  created_at: string;
  tags?: string[];
  last_contact_at?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.leadId as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [newNote, setNewNote] = useState('');
  const [relatedTickets, setRelatedTickets] = useState<Ticket[]>([]);

  // 상담내역 추가 다이얼로그 상태
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  const [newConsultation, setNewConsultation] = useState({
    date: new Date().toISOString().split('T')[0],
    counselor: '',
    content: '',
    status: '완료',
  });

  // 예약내역 추가 다이얼로그 상태
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    treatment: '',
    status: '예정',
    revenue: 0,
  });

  // 리드 수정 다이얼로그 상태
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedLead, setEditedLead] = useState({
    name: '',
    primary_phone: '',
    status: '',
    assignee_name: '',
    score: 0,
    consultation_notes: '',
    utm_source: '',
  });

  useEffect(() => {
    const fetchLeadDetail = async () => {
      setLoading(true);
      try {
        if (typeof window !== 'undefined') {
          const storedLeads = localStorage.getItem('mcrm_leads');
          if (storedLeads) {
            const allLeads: Lead[] = JSON.parse(storedLeads);
            const foundLead = allLeads.find(l => l.lead_id === leadId);
            if (foundLead) {
              // 타임라인, 상담, 예약, 메모 데이터 초기화
              if (!foundLead.timeline) foundLead.timeline = [];
              if (!foundLead.consultations) foundLead.consultations = [];
              if (!foundLead.appointments) foundLead.appointments = [];
              if (!foundLead.notes) foundLead.notes = [];
              
              setLead(foundLead);

              // 관련 Ticket 가져오기
              const storedTickets = localStorage.getItem('mcrm_tickets');
              if (storedTickets) {
                const allTickets: Ticket[] = JSON.parse(storedTickets);
                const leadTickets = allTickets.filter(ticket => ticket.lead_id === leadId);
                setRelatedTickets(leadTickets);
              }
            } else {
              alert('문의를 찾을 수 없습니다.');
              router.push('/leads');
            }
          } else {
            alert('문의 데이터가 없습니다.');
            router.push('/leads');
          }
        }
      } catch (error) {
        console.error('Error fetching lead detail:', error);
        alert('문의 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLeadDetail();
    }
  }, [leadId, router]);

  const handleBack = () => {
    router.push('/leads');
  };

  const handleEdit = () => {
    if (!lead) return;

    // 현재 리드 정보로 초기화
    setEditedLead({
      name: lead.name,
      primary_phone: lead.primary_phone,
      status: lead.status,
      assignee_name: lead.assignee_name,
      score: lead.score,
      consultation_notes: lead.consultation_notes || '',
      utm_source: lead.utm_source || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!lead || !editedLead.name || !editedLead.primary_phone) {
      alert('이름과 전화번호는 필수입니다.');
      return;
    }

    const updatedLead = {
      ...lead,
      name: editedLead.name,
      primary_phone: editedLead.primary_phone,
      status: editedLead.status,
      assignee_name: editedLead.assignee_name,
      score: editedLead.score,
      consultation_notes: editedLead.consultation_notes,
      utm_source: editedLead.utm_source,
    };

    // localStorage 업데이트
    if (typeof window !== 'undefined') {
      const storedLeads = localStorage.getItem('mcrm_leads');
      if (storedLeads) {
        const allLeads: Lead[] = JSON.parse(storedLeads);
        const updatedLeads = allLeads.map(l =>
          l.lead_id === leadId ? updatedLead : l
        );
        localStorage.setItem('mcrm_leads', JSON.stringify(updatedLeads));
      }
    }

    setLead(updatedLead);
    setEditDialogOpen(false);
    alert('리드 정보가 업데이트되었습니다.');
  };

  const handleDelete = () => {
    if (confirm(`정말로 ${lead?.name} 문의를 삭제하시겠습니까?`)) {
      try {
        if (typeof window !== 'undefined') {
          const storedLeads = localStorage.getItem('mcrm_leads');
          if (storedLeads) {
            const allLeads: Lead[] = JSON.parse(storedLeads);
            const updatedLeads = allLeads.filter(l => l.lead_id !== leadId);
            localStorage.setItem('mcrm_leads', JSON.stringify(updatedLeads));
            alert('문의가 삭제되었습니다.');
            router.push('/leads');
          }
        }
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('문의 삭제에 실패했습니다.');
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !lead) return;

    const note: Note = {
      id: `note_${Date.now()}`,
      content: newNote,
      created_at: new Date().toISOString(),
      created_by: '현재 사용자',
    };

    const updatedLead = {
      ...lead,
      notes: [...(lead.notes || []), note],
    };

    // localStorage 업데이트
    if (typeof window !== 'undefined') {
      const storedLeads = localStorage.getItem('mcrm_leads');
      if (storedLeads) {
        const allLeads: Lead[] = JSON.parse(storedLeads);
        const updatedLeads = allLeads.map(l =>
          l.lead_id === leadId ? updatedLead : l
        );
        localStorage.setItem('mcrm_leads', JSON.stringify(updatedLeads));
      }
    }

    setLead(updatedLead);
    setNewNote('');
    alert('메모가 추가되었습니다.');
  };

  // 상담내역 추가
  const handleAddConsultation = () => {
    if (!newConsultation.counselor || !newConsultation.content || !lead) return;

    const consultation: Consultation = {
      id: `consultation_${Date.now()}`,
      date: newConsultation.date,
      counselor: newConsultation.counselor,
      content: newConsultation.content,
      status: newConsultation.status,
    };

    const updatedLead = {
      ...lead,
      consultations: [...(lead.consultations || []), consultation],
    };

    // localStorage 업데이트
    if (typeof window !== 'undefined') {
      const storedLeads = localStorage.getItem('mcrm_leads');
      if (storedLeads) {
        const allLeads: Lead[] = JSON.parse(storedLeads);
        const updatedLeads = allLeads.map(l =>
          l.lead_id === leadId ? updatedLead : l
        );
        localStorage.setItem('mcrm_leads', JSON.stringify(updatedLeads));
      }
    }

    setLead(updatedLead);
    setConsultationDialogOpen(false);
    setNewConsultation({
      date: new Date().toISOString().split('T')[0],
      counselor: '',
      content: '',
      status: '완료',
    });
    alert('상담내역이 추가되었습니다.');
  };

  // 예약내역 추가
  const handleAddAppointment = () => {
    if (!newAppointment.treatment || !lead) return;

    const appointment: Appointment = {
      id: `appointment_${Date.now()}`,
      date: newAppointment.date,
      time: newAppointment.time,
      treatment: newAppointment.treatment,
      status: newAppointment.status,
      revenue: newAppointment.revenue,
    };

    const updatedLead = {
      ...lead,
      appointments: [...(lead.appointments || []), appointment],
    };

    // localStorage 업데이트
    if (typeof window !== 'undefined') {
      const storedLeads = localStorage.getItem('mcrm_leads');
      if (storedLeads) {
        const allLeads: Lead[] = JSON.parse(storedLeads);
        const updatedLeads = allLeads.map(l =>
          l.lead_id === leadId ? updatedLead : l
        );
        localStorage.setItem('mcrm_leads', JSON.stringify(updatedLeads));
      }
    }

    setLead(updatedLead);
    setAppointmentDialogOpen(false);
    setNewAppointment({
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      treatment: '',
      status: '예정',
      revenue: 0,
    });
    alert('예약내역이 추가되었습니다.');
  };

  // 타임라인 데이터 생성 (메모, 상담내역, 예약내역 통합)
  const getTimelineEvents = () => {
    if (!lead) return [];

    const events: Array<{
      id: string;
      type: string;
      content: string;
      created_at: string;
      created_by?: string;
    }> = [];

    // 메모 추가
    if (lead.notes) {
      lead.notes.forEach(note => {
        events.push({
          id: note.id,
          type: '메모',
          content: note.content,
          created_at: note.created_at,
          created_by: note.created_by,
        });
      });
    }

    // 상담내역 추가
    if (lead.consultations) {
      lead.consultations.forEach(consultation => {
        events.push({
          id: consultation.id,
          type: '상담',
          content: `[${consultation.status}] ${consultation.content} (상담자: ${consultation.counselor})`,
          created_at: new Date(consultation.date).toISOString(),
          created_by: consultation.counselor,
        });
      });
    }

    // 예약내역 추가
    if (lead.appointments) {
      lead.appointments.forEach(appointment => {
        events.push({
          id: appointment.id,
          type: '예약',
          content: `[${appointment.status}] ${appointment.treatment} - ${appointment.date} ${appointment.time}${appointment.revenue ? ` (₩${appointment.revenue.toLocaleString()})` : ''}`,
          created_at: new Date(`${appointment.date}T${appointment.time}`).toISOString(),
          created_by: '시스템',
        });
      });
    }

    // 시간순으로 정렬 (최신순)
    return events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!lead) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          문의를 찾을 수 없습니다.
        </Typography>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          문의 목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  const priorityInfo = getPriorityInfoFromScore(lead.score);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            문의 상세
          </Typography>
        </Box>
        <Box>
          <Button startIcon={<EditIcon />} onClick={handleEdit} sx={{ mr: 1 }}>
            수정
          </Button>
          <Button startIcon={<DeleteIcon />} color="error" onClick={handleDelete}>
            삭제
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">이름</Typography>
            <Typography variant="h6">{lead.name}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">전화번호</Typography>
            <Typography variant="h6">{lead.primary_phone}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">상태</Typography>
            <Chip label={lead.status} color="primary" sx={{ mt: 1 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">채널</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{lead.utm_source}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">담당자</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{lead.assignee_name}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">우선순위 점수</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography variant="body1">{lead.score}</Typography>
              <Chip label={priorityInfo.priority} size="small" sx={{ backgroundColor: priorityInfo.backgroundColor, color: priorityInfo.textColor }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">SLA 상태</Typography>
            <Chip label={lead.sla_status} color="info" sx={{ mt: 1 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">커뮤니케이션 횟수</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{lead.communication_count}회</Typography>
          </Grid>
          {lead.revenue !== undefined && lead.revenue > 0 && (
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">예상 매출</Typography>
              <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                ₩{lead.revenue.toLocaleString()}
              </Typography>
            </Grid>
          )}
          {lead.treatment && (
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" color="text.secondary">시술 내역</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>{lead.treatment}</Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">최근 접점</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{new Date(lead.last_contact_at).toLocaleString('ko-KR')}</Typography>
          </Grid>
          {lead.consultation_notes && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">상담 메모</Typography>
              <Typography variant="body1" sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                {lead.consultation_notes}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* 관련 상담 티켓 */}
      {relatedTickets.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>관련 상담 티켓</Typography>
          <Grid container spacing={2}>
            {relatedTickets.map((ticket) => (
              <Grid item xs={12} md={6} key={ticket.ticket_id}>
                <Card
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => router.push('/tickets')}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6">{ticket.title || '상담 티켓'}</Typography>
                      <Chip
                        label={ticket.state}
                        size="small"
                        color={
                          ticket.state === '완료' ? 'success' :
                          ticket.state === '진행' ? 'primary' :
                          ticket.state === '보류' ? 'warning' :
                          'default'
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {ticket.notes}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={ticket.priority}
                        size="small"
                        color={
                          ticket.priority === '긴급' ? 'error' :
                          ticket.priority === '높음' ? 'warning' :
                          'default'
                        }
                      />
                      {ticket.sla_timer && (
                        <Chip
                          label={ticket.sla_timer.formatted}
                          size="small"
                          color={
                            ticket.sla_timer.status === 'violated' ? 'error' :
                            ticket.sla_timer.status === 'warning' ? 'warning' :
                            'info'
                          }
                        />
                      )}
                      {ticket.assignee_name && (
                        <Chip label={`담당: ${ticket.assignee_name}`} size="small" variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      생성일: {new Date(ticket.created_at).toLocaleString('ko-KR')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="타임라인" />
          <Tab label="상담 내역" />
          <Tab label="예약 내역" />
          <Tab label={`메모 (${lead.notes?.length || 0})`} />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Typography variant="h6" gutterBottom>타임라인</Typography>
          {getTimelineEvents().length > 0 ? (
            <List>
              {getTimelineEvents().map((event) => (
                <React.Fragment key={event.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={event.type}
                            size="small"
                            color={
                              event.type === '메모' ? 'default' :
                              event.type === '상담' ? 'primary' :
                              'secondary'
                            }
                          />
                          <Typography variant="body1">{event.content}</Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          {new Date(event.created_at).toLocaleString('ko-KR')}
                          {event.created_by && ` by ${event.created_by}`}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              타임라인 이벤트가 없습니다.
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">상담 내역</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setConsultationDialogOpen(true)}
            >
              상담내역 추가
            </Button>
          </Box>
          {lead.consultations && lead.consultations.length > 0 ? (
            <Grid container spacing={2}>
              {lead.consultations.map((consultation) => (
                <Grid item xs={12} key={consultation.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">{consultation.date}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        상담자: {consultation.counselor}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {consultation.content}
                      </Typography>
                      <Chip label={consultation.status} size="small" sx={{ mt: 1 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">
              상담 내역이 없습니다.
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">예약 내역</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAppointmentDialogOpen(true)}
            >
              예약내역 추가
            </Button>
          </Box>
          {lead.appointments && lead.appointments.length > 0 ? (
            <Grid container spacing={2}>
              {lead.appointments.map((appointment) => (
                <Grid item xs={12} md={6} key={appointment.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{appointment.treatment}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.date} {appointment.time}
                      </Typography>
                      {appointment.revenue && (
                        <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                          매출: ₩{appointment.revenue.toLocaleString()}
                        </Typography>
                      )}
                      <Chip label={appointment.status} size="small" sx={{ mt: 1 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">
              예약 내역이 없습니다.
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>메모</Typography>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="새 메모를 입력하세요..."
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNote}
              disabled={!newNote.trim()}
            >
              메모 추가
            </Button>
          </Box>
          {lead.notes && lead.notes.length > 0 ? (
            <List>
              {lead.notes.map((note) => (
                <React.Fragment key={note.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={note.content}
                      secondary={
                        <>
                          {new Date(note.created_at).toLocaleString('ko-KR')} by {note.created_by}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              메모가 없습니다.
            </Typography>
          )}
        </TabPanel>
      </Paper>

      {/* 상담내역 추가 다이얼로그 */}
      <Dialog open={consultationDialogOpen} onClose={() => setConsultationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>상담내역 추가</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="날짜"
            type="date"
            fullWidth
            value={newConsultation.date}
            onChange={(e) => setNewConsultation({ ...newConsultation, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="상담자"
            type="text"
            fullWidth
            value={newConsultation.counselor}
            onChange={(e) => setNewConsultation({ ...newConsultation, counselor: e.target.value })}
            placeholder="상담자 이름을 입력하세요"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="상담 내용"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newConsultation.content}
            onChange={(e) => setNewConsultation({ ...newConsultation, content: e.target.value })}
            placeholder="상담 내용을 입력하세요"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>상태</InputLabel>
            <Select
              value={newConsultation.status}
              onChange={(e) => setNewConsultation({ ...newConsultation, status: e.target.value })}
              label="상태"
            >
              <MenuItem value="예정">예정</MenuItem>
              <MenuItem value="진행중">진행중</MenuItem>
              <MenuItem value="완료">완료</MenuItem>
              <MenuItem value="취소">취소</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConsultationDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleAddConsultation}
            variant="contained"
            disabled={!newConsultation.counselor || !newConsultation.content}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>

      {/* 예약내역 추가 다이얼로그 */}
      <Dialog open={appointmentDialogOpen} onClose={() => setAppointmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>예약내역 추가</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="날짜"
            type="date"
            fullWidth
            value={newAppointment.date}
            onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="시간"
            type="time"
            fullWidth
            value={newAppointment.time}
            onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="시술명"
            type="text"
            fullWidth
            value={newAppointment.treatment}
            onChange={(e) => setNewAppointment({ ...newAppointment, treatment: e.target.value })}
            placeholder="시술명을 입력하세요"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="매출 (원)"
            type="number"
            fullWidth
            value={newAppointment.revenue}
            onChange={(e) => setNewAppointment({ ...newAppointment, revenue: parseInt(e.target.value) || 0 })}
            placeholder="예상 매출을 입력하세요"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>상태</InputLabel>
            <Select
              value={newAppointment.status}
              onChange={(e) => setNewAppointment({ ...newAppointment, status: e.target.value })}
              label="상태"
            >
              <MenuItem value="예정">예정</MenuItem>
              <MenuItem value="확정">확정</MenuItem>
              <MenuItem value="완료">완료</MenuItem>
              <MenuItem value="취소">취소</MenuItem>
              <MenuItem value="노쇼">노쇼</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAppointmentDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleAddAppointment}
            variant="contained"
            disabled={!newAppointment.treatment}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>

      {/* 리드 정보 수정 다이얼로그 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>리드 정보 수정</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="이름"
                type="text"
                fullWidth
                required
                value={editedLead.name}
                onChange={(e) => setEditedLead({ ...editedLead, name: e.target.value })}
                placeholder="이름을 입력하세요"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="전화번호"
                type="tel"
                fullWidth
                required
                value={editedLead.primary_phone}
                onChange={(e) => setEditedLead({ ...editedLead, primary_phone: e.target.value })}
                placeholder="전화번호를 입력하세요"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select
                  value={editedLead.status}
                  onChange={(e) => setEditedLead({ ...editedLead, status: e.target.value })}
                  label="상태"
                >
                  <MenuItem value="신규">신규</MenuItem>
                  <MenuItem value="상담완료">상담완료</MenuItem>
                  <MenuItem value="예약완료">예약완료</MenuItem>
                  <MenuItem value="계약완료">계약완료</MenuItem>
                  <MenuItem value="보류">보류</MenuItem>
                  <MenuItem value="거절">거절</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="담당자"
                type="text"
                fullWidth
                value={editedLead.assignee_name}
                onChange={(e) => setEditedLead({ ...editedLead, assignee_name: e.target.value })}
                placeholder="담당자 이름을 입력하세요"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="우선순위 점수"
                type="number"
                fullWidth
                value={editedLead.score}
                onChange={(e) => setEditedLead({ ...editedLead, score: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0, max: 100 }}
                helperText="0-100 사이의 점수"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="채널 경로"
                type="text"
                fullWidth
                value={editedLead.utm_source}
                onChange={(e) => setEditedLead({ ...editedLead, utm_source: e.target.value })}
                placeholder="예: 네이버, Google Ads, Facebook Ads"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="상담 메모"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={editedLead.consultation_notes}
                onChange={(e) => setEditedLead({ ...editedLead, consultation_notes: e.target.value })}
                placeholder="상담 관련 메모를 입력하세요"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!editedLead.name || !editedLead.primary_phone}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
