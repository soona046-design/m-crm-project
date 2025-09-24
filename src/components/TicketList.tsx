'use client';

import React from 'react';
import { Box, Typography, Paper, Chip, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { styled, alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { ListItemButton } from '@mui/material';

import { Ticket } from '@/types/ticket';

interface TicketListProps {
  tickets: Ticket[];
  onTicketSelect?: (ticketId: string) => void; // 티켓 클릭 시 상세 보기 등의 액션
}

const SLABanner = styled(Box)<{ slaStatus: SLATimer['status'] }>(({ theme, slaStatus }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.common.white,
  fontWeight: 'bold',
  backgroundColor: slaStatus === 'warning'
    ? alpha(theme.palette.warning.main, 0.8) // 노란색
    : alpha(theme.palette.error.main, 0.8), // 빨간색
}));

export default function TicketList({ tickets, onTicketSelect }: TicketListProps) {
  const theme = useTheme();

  const getPriorityChipColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case '긴급': return 'error';
      case '높음': return 'warning';
      case '일반': return 'info';
      default: return 'default';
    }
  };

  const formatSLADueAt = (slaDueAt?: string) => {
    if (!slaDueAt) return 'N/A';
    const now = new Date();
    const due = new Date(slaDueAt);
    const diffMinutes = Math.round((due.getTime() - now.getTime()) / (1000 * 60));

    if (diffMinutes <= 0) return 'SLA 초과';
    if (diffMinutes <= 10) return `${diffMinutes}분 남음`;
    return `만료 예정: ${new Date(slaDueAt).toLocaleTimeString()}`;
  };

  return (
    <List disablePadding>
      {tickets.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">No tickets in this inbox.</Typography>
        </Box>
      ) : (
        tickets.map((ticket) => (
          <Paper key={ticket.ticket_id} sx={{ mb: 2, overflow: 'hidden' }}>
            {ticket.sla_timer && (ticket.sla_timer.status === 'warning' || ticket.sla_timer.status === 'violated') && (
              <SLABanner slaStatus={ticket.sla_timer.status}>
                {ticket.sla_timer.status === 'warning' && <WarningIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />} 
                {ticket.sla_timer.status === 'violated' && <ErrorIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />} 
                {ticket.sla_timer.status === 'warning' ? 'SLA 임박' : 'SLA 위반'}
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {ticket.sla_timer.formatted}
                </Typography>
              </SLABanner>
            )}
            <ListItemButton onClick={() => onTicketSelect && onTicketSelect(ticket.ticket_id)}>
              <ListItemText
                primary={ticket.title}
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {ticket.latest_message_preview || '최근 메시지 없음'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Chip
                        label={`우선순위: ${ticket.priority}`}
                        color={getPriorityChipColor(ticket.priority)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {ticket.sla_timer && (
                        <Chip
                          icon={<AccessAlarmIcon fontSize="small" />}
                          label={`${ticket.sla_timer.remaining}분 남음`}
                          color={ticket.sla_timer.status === 'violated' ? 'error' : ticket.sla_timer.status === 'warning' ? 'warning' : 'info'}
                          size="small"
                        />
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {new Date(ticket.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </React.Fragment>
                }
              />
              <ListItemIcon sx={{ minWidth: 40 }}>
                <EventIcon /> {/* 아이콘은 예시입니다 */}
              </ListItemIcon>
            </ListItemButton>
          </Paper>
        ))
      )}
    </List>
  );
}
