'use client';

import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot 
} from '@mui/lab';
import EventIcon from '@mui/icons-material/Event';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface TimelineEvent {
  id: string;
  type: 'visit' | 'ticket_created' | 'communication' | 'appointment' | 'clinic_visit';
  timestamp: string;
  description: string;
  details?: string;
  utm_source?: string; // UTM 출처 칩 표시용
}

interface LeadTimelineProps {
  leadId: string;
  // TODO: 실제 타임라인 데이터를 props로 받아야 합니다. 현재는 더미 데이터를 사용합니다.
}

export default function LeadTimeline({ leadId }: LeadTimelineProps) {
  // TODO: 백엔드에서 실제 타임라인 데이터 (visits, tickets, communications, appointments, clinic_visits)를 가져와 조합해야 합니다.
  // 현재는 더미 데이터로 대체합니다.
  const dummyTimelineEvents: TimelineEvent[] = [
    {
      id: 'event-1',
      type: 'visit',
      timestamp: '2025-09-10T10:00:00Z',
      description: '웹사이트 방문',
      details: '랜딩 페이지: /promotion, Referrer: google.com',
      utm_source: 'google',
    },
    {
      id: 'event-2',
      type: 'ticket_created',
      timestamp: '2025-09-10T11:30:00Z',
      description: '문의 티켓 생성',
      details: '카테고리: 서비스 문의, 상태: 신규',
    },
    {
      id: 'event-3',
      type: 'communication',
      timestamp: '2025-09-10T14:00:00Z',
      description: '전화 상담 진행',
      details: '담당자: 홍길동, 내용: 서비스 설명',
    },
    {
      id: 'event-4',
      type: 'appointment',
      timestamp: '2025-09-12T15:00:00Z',
      description: '병원 방문 예약',
      details: '예약 시간: 2025-09-15 10:00, 담당 의사: 김의사',
    },
    {
      id: 'event-5',
      type: 'clinic_visit',
      timestamp: '2025-09-15T10:30:00Z',
      description: '병원 방문 및 진료 완료',
      details: '수납 금액: ₩50,000',
    },
    {
      id: 'event-6',
      type: 'communication',
      timestamp: '2025-09-16T10:00:00Z',
      description: '알림톡 발송: 후기 요청',
      details: '시스템 자동 발송',
      utm_source: 'system',
    },
  ];

  // 타임라인 아이콘 매핑
  const getTimelineIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'visit': return <EventIcon />;
      case 'ticket_created': return <AssignmentIcon />;
      case 'communication': return <PhoneInTalkIcon />;
      case 'appointment': return <CalendarMonthIcon />;
      case 'clinic_visit': return <MessageIcon />;
      default: return <EventIcon />;
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Timeline</Typography>
      <Timeline position="alternate" sx={{ '&.MuiTimeline-root': { py: 0 } }}>
        {dummyTimelineEvents.map((event, index) => (
          <TimelineItem key={event.id}>
            <TimelineSeparator>
              <TimelineDot color="primary">{getTimelineIcon(event.type)}</TimelineDot>
              {index < dummyTimelineEvents.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h6" component="span">
                {event.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(event.timestamp).toLocaleString()}
              </Typography>
              {event.details && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {event.details}
                </Typography>
              )}
              {event.utm_source && ( // UTM 출처 칩 표시
                <Chip label={`UTM: ${event.utm_source}`} size="small" sx={{ mt: 1 }} />
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
}
