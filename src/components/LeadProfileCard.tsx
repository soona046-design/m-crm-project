'use client';

import React from 'react';
import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ScoreIcon from '@mui/icons-material/Score';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useRouter } from 'next/navigation';

interface LeadProfileCardProps {
  lead: {
    lead_id: string;
    name: string;
    primary_phone: string;
    email_hash?: string;
    status: string;
    utm_source: string;
    score: number;
    assignee_name?: string;
    created_at: string;
    // 기타 필요한 리드 상세 정보
  };
  // 액션 핸들러
  onOpenTicket: (leadId: string) => void;
  onCreateAppointment: (leadId: string) => void;
  onSendMessage: (leadId: string) => void;
}

export default function LeadProfileCard({
  lead,
  onOpenTicket,
  onCreateAppointment,
  onSendMessage,
}: LeadProfileCardProps) {
  const router = useRouter();

  // 이름 마스킹 (예: 홍길동 -> 홍**동)
  const maskName = (name: string) => {
    if (!name) return 'N/A';
    if (name.length <= 1) return name;
    if (name.length === 2) return name.charAt(0) + '*';
    return name.charAt(0) + '**' + name.slice(-1);
  };

  // 전화번호 마스킹 (예: 010-1234-5678 -> 010-****-5678)
  const maskPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return 'N/A';
    return phoneNumber.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="h2">{maskName(lead.name)}</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Lead ID: {lead.lead_id.substring(0, 8)}...
      </Typography>

      <Box mb={2}>
        <Chip label={lead.status} color="info" size="small" sx={{ mr: 1 }} />
        <Chip label={`Score: ${lead.score}`} color="warning" size="small" />
      </Box>

      <Box mb={1} display="flex" alignItems="center">
        <PhoneIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="body2">{maskPhoneNumber(lead.primary_phone)}</Typography>
      </Box>
      {lead.email_hash && (
        <Box mb={1} display="flex" alignItems="center">
          <EmailIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2">{lead.email_hash ? `Email Hash: ${lead.email_hash.substring(0, 8)}...` : 'N/A'}</Typography>
        </Box>
      )}
      <Box mb={1} display="flex" alignItems="center">
        <AssignmentIndIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="body2">Assignee: {lead.assignee_name || '미정'}</Typography>
      </Box>
      <Box mb={2} display="flex" alignItems="center">
        <EventNoteIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="body2">Created: {new Date(lead.created_at).toLocaleDateString()}</Typography>
      </Box>

      <Box display="flex" gap={1} mt={3}>
        <Button variant="outlined" size="small" onClick={() => onOpenTicket(lead.lead_id)}>티켓 열기</Button>
        <Button variant="outlined" size="small" onClick={() => onCreateAppointment(lead.lead_id)}>예약 생성</Button>
        <Button variant="contained" size="small" onClick={() => onSendMessage(lead.lead_id)}>메시지 보내기</Button>
      </Box>
    </Paper>
  );
}
