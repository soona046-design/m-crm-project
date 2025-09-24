'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, TextField, Button, Grid, IconButton, Menu, MenuItem, Fab, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmsIcon from '@mui/icons-material/Sms';
import ChatIcon from '@mui/icons-material/Chat';
import CallIcon from '@mui/icons-material/Call';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // 템플릿 메뉴용
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios'; // axios 추가

interface ReplyPanelProps {
  leadId: string; // 리드 ID 추가
  ticketId?: string | null; // 티켓 ID 추가 (선택 사항)
  onSendMessage: (message: string, channel: 'sms' | 'kakaotalk' | 'call', templateId?: string, recipient?: string, ticketId?: string | null) => void;
  // TODO: 리드/티켓 ID를 받아와 API 호출에 사용해야 합니다.
}

// TODO: 실제 템플릿 데이터 가져오는 로직 필요
const dummyTemplates = [
  { id: 'temp-1', name: '진료 안내', content: '[고객명]님, 진료 안내입니다.' },
  { id: 'temp-2', name: '예약 확인', content: '[고객명]님, 예약이 확인되었습니다.' },
  { id: 'temp-3', name: '노쇼 방지', content: '[고객명]님, 예약 시간 30분 전 알림입니다.' },
];

export default function ReplyPanel({ onSendMessage, leadId, ticketId }: ReplyPanelProps) {
  const [message, setMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'kakaotalk' | 'call'>('kakaotalk');
  const [templateAnchorEl, setTemplateAnchorEl] = useState<null | HTMLElement>(null);
  const openTemplateMenu = Boolean(templateAnchorEl);
  const [recipient, setRecipient] = useState(''); // 수신자 상태 추가

  // leadId가 변경될 때 리드 정보를 가져와 수신자 필드를 채웁니다.
  useEffect(() => {
    if (leadId) {
      axios.get(`/api/leads/${leadId}`)
        .then(response => {
          setRecipient(response.data.phone_number || ''); // 리드 전화번호로 초기화
        })
        .catch(error => {
          console.error("Failed to fetch lead details for recipient:", error);
          setRecipient('');
        });
    } else {
      setRecipient('');
    }
  }, [leadId]);

  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleRecipientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(event.target.value);
  };

  const handleChannelChange = (channel: 'sms' | 'kakaotalk' | 'call') => {
    setSelectedChannel(channel);
  };

  const handleSendClick = () => {
    if (message.trim() && recipient.trim()) { // 수신자도 필수로 체크
      // TODO: 템플릿 가드 체크 로직 추가
      onSendMessage(message, selectedChannel, undefined, recipient, ticketId); // 수신자 및 티켓 ID 정보 전달
      setMessage('');
    }
  };

  const handleOpenTemplateMenu = (event: React.MouseEvent<HTMLElement>) => {
    setTemplateAnchorEl(event.currentTarget);
  };

  const handleCloseTemplateMenu = () => {
    setTemplateAnchorEl(null);
  };

  const handleSelectTemplate = (templateContent: string) => {
    setMessage(templateContent);
    handleCloseTemplateMenu();
  };

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="수신자 (전화번호)"
            value={recipient}
            onChange={handleRecipientChange}
            sx={{ mb: 2 }}
          />
        </Grid>
        <Grid item xs={12} sm={9}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="메시지를 입력하세요..."
            value={message}
            onChange={handleMessageChange}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Button
              variant={selectedChannel === 'kakaotalk' ? 'contained' : 'outlined'}
              startIcon={<ChatIcon />}
              onClick={() => handleChannelChange('kakaotalk')}
              fullWidth
            >
              알림톡
            </Button>
            <Button
              variant={selectedChannel === 'sms' ? 'contained' : 'outlined'}
              startIcon={<SmsIcon />}
              onClick={() => handleChannelChange('sms')}
              fullWidth
            >
              SMS
            </Button>
            <Button
              variant={selectedChannel === 'call' ? 'contained' : 'outlined'}
              startIcon={<CallIcon />}
              onClick={() => handleChannelChange('call')}
              fullWidth
            >
              콜
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleOpenTemplateMenu}
              endIcon={<MoreVertIcon />}
            >
              템플릿
            </Button>
            <Menu
              anchorEl={templateAnchorEl}
              open={openTemplateMenu}
              onClose={handleCloseTemplateMenu}
              MenuListProps={{
                'aria-labelledby': 'template-button',
              }}
            >
              {dummyTemplates.map((template) => (
                <MenuItem key={template.id} onClick={() => handleSelectTemplate(template.content)}>
                  {template.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Tooltip title="메시지 전송 (단축키: Ctrl/Cmd + Enter)">
          <span>
            <Fab color="primary" aria-label="send" onClick={handleSendClick} disabled={!message.trim()}> 
              <SendIcon />
            </Fab>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}
