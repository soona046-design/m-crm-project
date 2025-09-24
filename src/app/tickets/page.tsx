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
      const response = await axios.post('/api/communications', {
        lead_id: selectedLeadId,
        ticket_id: selectedTicketId, // 선택된 티켓 ID 추가
        recipient: recipient,
        message: message,
        channel: channel,
        template_id: templateId, // 템플릿 ID (선택 사항)
      });
      alert('메시지 전송 성공!');
      // TODO: 성공 시 티켓 목록 새로고침 또는 UI 업데이트
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("메시지 전송 실패. 다시 시도해주세요.");
    }
  }, [selectedLeadId, selectedTicketId]); // selectedTicketId를 의존성 배열에 추가

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
      const filterParams: { [key: string]: string | number | boolean } = {};
      console.log('Current tab:', currentTab); // 현재 탭 로깅
      // 탭에 따라 필터링 파라미터 조정
      switch (currentTab) {
        case 0: // 내 담당
          filterParams.assignee_id = '01996643-f8fa-721c-8e2d-1b89ba1a373f'; // 실제 사용자 ID로 교체
          filterParams.state = 'open';
          break;
        case 1: // SLA 임박
          filterParams.sla_status = 'warning'; // 백엔드 sla_status 필터 사용
          filterParams.state = 'open'; // 열려있는 티켓만
          break;
        case 2: // 미응답
          filterParams.last_contact_at_null = true; // 백엔드 last_contact_at_null 필터 사용
          filterParams.state = 'open'; // 열려있는 티켓만
          break;
        case 3: // 완료
          filterParams.state = 'completed';
          break;
        // TODO: 팀 큐 탭을 위한 필터 추가
      }
      console.log('Sending filter params:', JSON.stringify(filterParams)); // 필터 파라미터 로깅

      const response = await axios.get('http://127.0.0.1:8000/api/tickets', { // 전체 URL 사용
        params: filterParams,
      });
      // 백엔드 응답 형식에 맞춰 데이터 변환 필요 (예: response.data.data가 배열일 경우)
      console.log('API response data:', response.data); // 응답 데이터 로깅
      setTickets(response.data.data || response.data); // 응답 구조에 따라 조정
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
