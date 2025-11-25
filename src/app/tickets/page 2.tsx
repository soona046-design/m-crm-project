'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress, Paper, Grid } from '@mui/material';
import RealtimeUpdates from '@/components/RealtimeUpdates';
import axios from 'axios';
import TicketList from '@/components/TicketList'; // TicketList 컴포넌트 import
import ReplyPanel from '@/components/ReplyPanel'; // ReplyPanel 컴포넌트 import
import { useRouter } from 'next/navigation'; // 라우팅을 위해 추가

import { Ticket } from '@/types/ticket';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TicketInboxPage() {
  const [currentTab, setCurrentTab] = useState(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null); // 선택된 티켓 ID 상태 추가
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);     // 선택된 리드 ID 상태 추가

  const router = useRouter();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId); // 선택된 티켓 ID 업데이트
    const selectedTicket = tickets.find(ticket => ticket.ticket_id === ticketId);
    if (selectedTicket) {
      setSelectedLeadId(selectedTicket.lead_id); // 선택된 리드의 lead_id 업데이트
    }
    router.push(`/tickets/${ticketId}`); // TODO: 실제 티켓 상세 페이지로 이동 로직
  };

  const handleSendMessage = useCallback(async (message: string, channel: 'sms' | 'kakaotalk' | 'call', templateId?: string, recipient?: string, ticketId?: string | null) => {
    if (!selectedLeadId) {
      alert('메시지를 보낼 리드를 선택해주세요.');
      return;
    }
    if (!selectedTicketId) {
      alert('메시지를 보낼 티켓을 선택해주세요.');
      return;
    }
    if (!recipient) {
      alert('수신자 정보를 입력해주세요.');
      return;
    }
    console.log(`Sending message via ${channel}: ${message} to ${recipient} (Lead: ${selectedLeadId}, Ticket: ${selectedTicketId}, Template: ${templateId || 'N/A'})`);

    try {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Mock successful message sending
      console.log('Mock message sent successfully:', {
        lead_id: selectedLeadId,
        ticket_id: selectedTicketId,
        recipient: recipient,
        message: message,
        channel: channel,
        template_id: templateId,
        sent_at: new Date().toISOString()
      });

      alert('메시지 전송 성공!');
      // TODO: 성공 시 티켓 목록 새로고침 또는 UI 업데이트
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("메시지 전송 실패. 다시 시도해주세요.");
    }
  }, [selectedLeadId, selectedTicketId]);

  // 단축키 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) { // Ctrl 또는 Cmd 키와 함께
        if (event.key === 'n') { // 새 티켓 (New Ticket)
          event.preventDefault();
          alert('새 티켓 생성 (단축키: n)');
          // TODO: 새 티켓 생성 모달 또는 페이지로 이동
        } else if (event.key === 's') { // 검색 (Search)
          event.preventDefault();
          alert('검색 기능 (단축키: s)');
          // TODO: 검색 필드 포커스 또는 검색 모달 열기
        } else if (event.key === 'f') { // 필터 (Filter)
          event.preventDefault();
          alert('필터 기능 (단축키: f)');
          // TODO: 필터 드로어 열기
        } else if (event.key === 'Enter') { // 메시지 전송
          event.preventDefault();
          // TODO: ReplyPanel의 메시지 전송 로직 호출
          // 이 부분은 ReplyPanel 컴포넌트 내부에서 처리하는 것이 더 적절할 수 있습니다.
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // 의존성 배열 비워 단 한 번만 등록/해제

  // TODO: 각 탭에 따른 필터링 로직 구현 필요
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

      // Mock tickets data
      const mockTickets: Ticket[] = [
        {
          ticket_id: 'ticket_001',
          lead_id: 'lead_001',
          lead_name: '김환자',
          title: '임플란트 상담 문의',
          notes: '상담 예약 요청',
          latest_message_preview: '안녕하세요, 임플란트 상담을 받고 싶습니다.',
          sla_timer: {
            remaining: 120,
            formatted: '2시간 남음',
            status: 'normal'
          },
          sla_due_at: '2025-09-29T18:00:00Z',
          priority: '높음',
          assignee_id: '1',
          assignee_name: '김상담',
          state: '진행',
          created_at: '2025-09-29T08:00:00Z',
          tags: ['임플란트', '상담'],
          last_contact_at: '2025-09-29T09:00:00Z'
        },
        {
          ticket_id: 'ticket_002',
          lead_id: 'lead_002',
          lead_name: '이환자',
          title: 'SLA 임박 - 교정 문의',
          notes: '교정 상담 요청',
          latest_message_preview: '교정 치료 비용과 기간이 궁금합니다.',
          sla_timer: {
            remaining: 30,
            formatted: '30분 남음',
            status: 'warning'
          },
          sla_due_at: '2025-09-29T15:30:00Z',
          priority: '긴급',
          assignee_id: '2',
          assignee_name: '이상담',
          state: '진행',
          created_at: '2025-09-29T10:00:00Z',
          tags: ['교정', 'SLA임박'],
          last_contact_at: '2025-09-29T11:00:00Z'
        },
        {
          ticket_id: 'ticket_003',
          lead_id: 'lead_003',
          lead_name: '박환자',
          title: '미응답 - 스케일링 예약',
          notes: '스케일링 예약 요청 - 응답 대기',
          latest_message_preview: '스케일링 예약 가능한 시간 문의드립니다.',
          sla_timer: {
            remaining: 240,
            formatted: '4시간 남음',
            status: 'normal'
          },
          sla_due_at: '2025-09-29T19:00:00Z',
          priority: '일반',
          assignee_id: '3',
          assignee_name: '박상담',
          state: '신규',
          created_at: '2025-09-29T07:00:00Z',
          tags: ['스케일링', '미응답']
        },
        {
          ticket_id: 'ticket_004',
          lead_id: 'lead_004',
          lead_name: '최환자',
          title: '완료 - 치아미백 상담',
          notes: '치아미백 상담 완료',
          latest_message_preview: '예약이 완료되었습니다. 감사합니다.',
          priority: '일반',
          assignee_id: '1',
          assignee_name: '김상담',
          state: '완료',
          created_at: '2025-09-28T14:00:00Z',
          tags: ['치아미백', '완료'],
          last_contact_at: '2025-09-28T16:00:00Z'
        }
      ];

      // Filter tickets based on current tab
      let filteredTickets = mockTickets;
      switch (currentTab) {
        case 0: // 내 담당
          filteredTickets = mockTickets.filter(ticket =>
            ticket.assignee_id === '1' && ticket.state !== '완료'
          );
          break;
        case 1: // SLA 임박
          filteredTickets = mockTickets.filter(ticket =>
            ticket.sla_timer?.status === 'warning' && ticket.state !== '완료'
          );
          break;
        case 2: // 미응답
          filteredTickets = mockTickets.filter(ticket =>
            ticket.state === '신규' && ticket.state !== '완료'
          );
          break;
        case 3: // 완료
          filteredTickets = mockTickets.filter(ticket =>
            ticket.state === '완료'
          );
          break;
      }

      console.log('Filtered tickets for tab', currentTab, ':', filteredTickets);
      setTickets(filteredTickets);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentTab]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ticket Inbox
      </Typography>
      <RealtimeUpdates />

      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="ticket inbox tabs">
            <Tab label="내 담당" {...a11yProps(0)} />
            <Tab label="SLA 임박" {...a11yProps(1)} />
            <Tab label="미응답" {...a11yProps(2)} />
            <Tab label="완료" {...a11yProps(3)} />
            {/* TODO: "팀 큐" 탭 추가 */}
          </Tabs>
        </Box>
        <CustomTabPanel value={currentTab} index={0}>
          <TicketList tickets={tickets} onTicketSelect={(id) => handleTicketSelect(id)} />
        </CustomTabPanel>
        <CustomTabPanel value={currentTab} index={1}>
          <TicketList tickets={tickets} onTicketSelect={(id) => handleTicketSelect(id)} />
        </CustomTabPanel>
        <CustomTabPanel value={currentTab} index={2}>
          <TicketList tickets={tickets} onTicketSelect={(id) => handleTicketSelect(id)} />
        </CustomTabPanel>
        <CustomTabPanel value={currentTab} index={3}>
          <TicketList tickets={tickets} onTicketSelect={(id) => handleTicketSelect(id)} />
        </CustomTabPanel>
      </Paper>

      {/* Reply Panel 컴포넌트 */}
      {selectedLeadId && <ReplyPanel onSendMessage={handleSendMessage} leadId={selectedLeadId} ticketId={selectedTicketId} />}
    </Box>
  );
}
