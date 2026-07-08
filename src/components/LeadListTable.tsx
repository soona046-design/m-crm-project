'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TablePagination,
  Toolbar,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Popover,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add'; // 새 리드 생성 버튼용
import DeleteIcon from '@mui/icons-material/Delete'; // 삭제 버튼용
import Checkbox from '@mui/material/Checkbox'; // 체크박스 추가
import MoreVertIcon from '@mui/icons-material/MoreVert'; // 행 Hover 액션 메뉴용
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { getPriorityInfoFromScore } from '@/lib/leadPriority';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { STATUS_KR_TO_EN } from '@/lib/leadStatus';

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
}

interface Lead {
  lead_id: string; // 백엔드 모델에 맞게 id 대신 lead_id 사용
  name: string; // 업체명
  primary_phone: string; // 마스킹이 필요한 전화번호
  status: string;
  utm_source: string | string[]; // 인입경로 (단일 또는 다중)
  utm_campaign?: string; // 캠페인
  last_contact_at: string; // 날짜
  score: number;
  assignee_name: string; // 담당자 이름
  sla_status: string; // SLA 상태 (백엔드 Ticket 모델의 sla_status)
  communication_count: number; // 커뮤니케이션 횟수 (호환성 유지)
  tickets_count?: number; // 티켓(문의) 수
  appointments_count?: number; // 예약 수
  revenue?: number; // 매출
  treatment?: string | string[]; // 문의서비스 (단일 또는 다중)
  consultation_notes?: string; // 상담 메모
  notes?: Note[]; // 메모 목록
  // 추가 필드들을 여기에 포함할 수 있습니다.
}

interface LeadListTableProps {
  leads: Lead[];
  totalLeads: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  onSearchChange: (searchTerm: string) => void;
  onFilterClick: () => void;
  onExportClick: () => void;
  onAddLeadClick: () => void;
  onLeadUpdate?: (leadId: string, updates: Partial<Lead>) => void; // 특정 리드 로컬 상태 업데이트
  onEditLead?: (lead: Lead) => void; // 수정 모달 열기
  availableChannels?: string[]; // 채널관리(/settings/channels)에서 활성화된 채널 목록
}

export default function LeadListTable({
  leads,
  totalLeads,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onRefresh,
  onSearchChange,
  onFilterClick,
  onExportClick,
  onAddLeadClick,
  onLeadUpdate,
  onEditLead,
  availableChannels = [],
}: LeadListTableProps) {
  const router = useRouter();
  const [selectedLeadIds, setSelectedLeadIds] = React.useState<string[]>([]);
  const [openMenus, setOpenMenus] = React.useState<{[key: string]: HTMLElement | null}>({});

  // 메모 추가 다이얼로그 상태
  const [noteDialogOpen, setNoteDialogOpen] = React.useState(false);
  const [selectedLeadForNote, setSelectedLeadForNote] = React.useState<Lead | null>(null);
  const [noteContent, setNoteContent] = React.useState('');

  // 배정 다이얼로그 상태
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [selectedLeadForAssign, setSelectedLeadForAssign] = React.useState<Lead | null>(null);
  const [selectedAssignee, setSelectedAssignee] = React.useState('');

  // 채널 선택 Popover 상태
  const [channelPopoverAnchor, setChannelPopoverAnchor] = React.useState<{[key: string]: HTMLElement | null}>({});
  const [selectedLeadForChannel, setSelectedLeadForChannel] = React.useState<string | null>(null);
  const [tempChannels, setTempChannels] = React.useState<string[]>([]);

  // 사용 가능한 담당자 목록
  const availableAssignees = [
    '김상담',
    '이매니저',
    '박상담',
    '최상담',
    '정매니저'
  ];

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = leads.map((n) => n.lead_id);
      setSelectedLeadIds(newSelecteds);
      return;
    }
    setSelectedLeadIds([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selectedLeadIds.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedLeadIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedLeadIds.slice(1));
    } else if (selectedIndex === selectedLeadIds.length - 1) {
      newSelected = newSelected.concat(selectedLeadIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedLeadIds.slice(0, selectedIndex),
        selectedLeadIds.slice(selectedIndex + 1),
      );
    }
    setSelectedLeadIds(newSelected);
  };

  const isSelected = (id: string) => selectedLeadIds.indexOf(id) !== -1;

  // 일괄 삭제 핸들러
  const handleBulkDelete = async () => {
    if (selectedLeadIds.length === 0) return;

    if (confirm(`선택한 ${selectedLeadIds.length}개의 문의를 휴지통으로 이동하시겠습니까?`)) {
      try {
        // 1. 먼저 백엔드 API 삭제 시도
        try {
          // 각 리드에 대해 DELETE 요청
          const deletePromises = selectedLeadIds.map(leadId =>
            api.delete(`/api/leads/${leadId}`)
          );
          await Promise.all(deletePromises);

          // API 성공 시
          setSelectedLeadIds([]);
          onRefresh();
          alert(`${selectedLeadIds.length}개의 문의가 삭제되었습니다.`);
          return; // API 성공하면 여기서 종료
        } catch (apiError) {
          console.warn('API 삭제 실패, localStorage fallback 사용:', apiError);
          // API 실패 시 localStorage로 fallback
        }

        // 2. API 실패 시 localStorage 사용 (기존 로직)
        const leadsToTrash = leads.filter(lead => selectedLeadIds.includes(lead.lead_id));

        // localStorage에 휴지통 데이터 추가
        if (typeof window !== 'undefined') {
          const existingTrash = localStorage.getItem('mcrm_deleted_leads');
          const trashLeads = existingTrash ? JSON.parse(existingTrash) : [];

          // 삭제된 시간 추가
          const leadsWithDeleteTime = leadsToTrash.map(lead => ({
            ...lead,
            deleted_at: new Date().toISOString(),
          }));

          localStorage.setItem('mcrm_deleted_leads', JSON.stringify([...trashLeads, ...leadsWithDeleteTime]));

          // 원본 리드 목록에서 제거
          const currentLeads = localStorage.getItem('mcrm_leads');
          if (currentLeads) {
            const allLeads = JSON.parse(currentLeads);
            const updatedLeads = allLeads.filter((lead: Lead) => !selectedLeadIds.includes(lead.lead_id));
            localStorage.setItem('mcrm_leads', JSON.stringify(updatedLeads));
          }
        }

        // 선택 해제 및 새로고침
        setSelectedLeadIds([]);
        onRefresh();
        alert(`${selectedLeadIds.length}개의 문의가 휴지통으로 이동되었습니다. (로컬 저장)`);
      } catch (err) {
        console.error('Failed to delete leads:', err);
        alert('삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 이름 마스킹 함수 (예: 홍길동 -> 홍**동)
  const maskName = (name: string) => {
    if (!name) return '-';
    if (name.length <= 1) return name;
    if (name.length === 2) return name.charAt(0) + '*';
    return name.charAt(0) + '**' + name.slice(-1);
  };

  // 전화번호 마스킹 함수 (예: 010-1234-5678 -> 010-****-5678)
  const maskPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return '-';
    return phoneNumber.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
  };

  // 날짜 포맷 함수 (YY/MM/DD)
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = String(date.getFullYear()).slice(-2); // 마지막 2자리만
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case '상담완료':
      case '예약완료':
        return 'primary'; // 진행 단계 — Toss Blue
      case '계약완료':
        return 'success';
      case '거절':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSLAChipColor = (sla: string) => {
    if (sla.includes('SLA 초과')) return 'error';
    if (sla.includes('남음')) return 'info';
    return 'success';
  };

  const handleMenuClick = (leadId: string, event: React.MouseEvent<HTMLElement>) => {
    setOpenMenus(prev => ({
      ...prev,
      [leadId]: event.currentTarget
    }));
  };

  const handleMenuClose = (leadId: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [leadId]: null
    }));
  };

  const isMenuOpen = (leadId: string) => Boolean(openMenus[leadId]);

  // 상태 변경 핸들러 (페이지 새로고침 없이)
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    // 1. 백엔드 API 호출 시도
    try {
      await api.put(`/api/leads/${leadId}`, {
        status: STATUS_KR_TO_EN[newStatus] || 'new',
      });
      onRefresh();
      return;
    } catch (apiError) {
      console.warn('API 상태 업데이트 실패, localStorage fallback:', apiError);
    }

    // 2. API 실패 시 localStorage fallback
    if (typeof window !== 'undefined') {
      const storedLeads = localStorage.getItem('mcrm_leads');
      if (storedLeads) {
        const allLeads: Lead[] = JSON.parse(storedLeads);
        const updatedLeads = allLeads.map(lead =>
          lead.lead_id === leadId ? { ...lead, status: newStatus } : lead
        );
        localStorage.setItem('mcrm_leads', JSON.stringify(updatedLeads));
        onRefresh();
      }
    }
  };

  // 채널 Popover 열기
  const handleOpenChannelPopover = (event: React.MouseEvent<HTMLElement>, lead: Lead) => {
    setChannelPopoverAnchor(prev => ({
      ...prev,
      [lead.lead_id]: event.currentTarget
    }));
    setSelectedLeadForChannel(lead.lead_id);
    // 현재 선택된 채널들을 임시 상태로 설정
    const currentChannels = Array.isArray(lead.utm_source)
      ? lead.utm_source.filter(Boolean)
      : (lead.utm_source ? [lead.utm_source] : []);
    setTempChannels(currentChannels);
  };

  // 채널 Popover 닫기
  const handleCloseChannelPopover = (leadId: string) => {
    setChannelPopoverAnchor(prev => ({
      ...prev,
      [leadId]: null
    }));
    setSelectedLeadForChannel(null);
    setTempChannels([]);
  };

  // 채널 체크박스 토글
  const handleToggleChannel = (channel: string) => {
    setTempChannels(prev => {
      if (prev.includes(channel)) {
        return prev.filter(c => c !== channel);
      } else {
        return [...prev, channel];
      }
    });
  };

  // 채널 변경 적용
  const handleApplyChannelChange = async (leadId: string) => {
    const updatedChannels = tempChannels.length > 0 ? tempChannels : ['기타'];
    const utmSourceValue = updatedChannels.join(', ');

    // 1. 부모 상태 즉시 반영 (UI 반응성)
    if (onLeadUpdate) {
      onLeadUpdate(leadId, { utm_source: updatedChannels });
    }
    handleCloseChannelPopover(leadId);

    // 2. 백엔드 API에 저장
    try {
      await api.put(`/api/leads/${leadId}`, { utm_source: utmSourceValue });
    } catch (apiError) {
      console.warn('채널 API 저장 실패:', apiError);
    }
  };

  // 메모 추가 다이얼로그 열기
  const handleOpenNoteDialog = (lead: Lead) => {
    setSelectedLeadForNote(lead);
    setNoteContent('');
    setNoteDialogOpen(true);
  };

  // 메모 추가 다이얼로그 닫기
  const handleCloseNoteDialog = () => {
    setNoteDialogOpen(false);
    setSelectedLeadForNote(null);
    setNoteContent('');
  };

  // 메모 추가 처리
  const handleAddNote = async () => {
    if (!noteContent.trim() || !selectedLeadForNote) return;

    const existingMemo = (selectedLeadForNote as any).memo || '';
    const updatedMemo = existingMemo ? `${existingMemo}\n---\n${noteContent}` : noteContent;

    // 1. 백엔드 API 호출 시도
    try {
      await api.put(`/api/leads/${selectedLeadForNote.lead_id}`, { memo: updatedMemo });
      alert('메모가 추가되었습니다.');
      handleCloseNoteDialog();
      onRefresh();
      return;
    } catch (apiError) {
      console.warn('메모 API 저장 실패, localStorage fallback:', apiError);
    }

    // 2. API 실패 시 localStorage fallback
    if (typeof window !== 'undefined') {
      const note: Note = {
        id: `note_${Date.now()}`,
        content: noteContent,
        created_at: new Date().toISOString(),
        created_by: '현재 사용자',
      };
      const storedLeads = localStorage.getItem('mcrm_leads');
      if (storedLeads) {
        const allLeads: Lead[] = JSON.parse(storedLeads);
        const updatedLeads = allLeads.map(l => {
          if (l.lead_id === selectedLeadForNote.lead_id) {
            return {
              ...l,
              notes: [...(l.notes || []), note],
            };
          }
          return l;
        });
        localStorage.setItem('mcrm_leads', JSON.stringify(updatedLeads));
        alert('메모가 추가되었습니다. (로컬 저장)');
        handleCloseNoteDialog();
        onRefresh();
        return;
      }
    }

    alert('메모 저장에 실패했습니다.');
  };

  // 배정 다이얼로그 열기
  const handleOpenAssignDialog = (lead: Lead) => {
    setSelectedLeadForAssign(lead);
    setSelectedAssignee(lead.assignee_name || '');
    setAssignDialogOpen(true);
  };

  // 배정 다이얼로그 닫기
  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedLeadForAssign(null);
    setSelectedAssignee('');
  };

  // 배정 처리
  const handleAssign = () => {
    if (!selectedAssignee || !selectedLeadForAssign) return;

    // localStorage 업데이트
    if (typeof window !== 'undefined') {
      const storedLeads = localStorage.getItem('mcrm_leads');
      if (storedLeads) {
        const allLeads: Lead[] = JSON.parse(storedLeads);
        const updatedLeads = allLeads.map(l => {
          if (l.lead_id === selectedLeadForAssign.lead_id) {
            return {
              ...l,
              assignee_name: selectedAssignee,
            };
          }
          return l;
        });
        localStorage.setItem('mcrm_leads', JSON.stringify(updatedLeads));
        alert(`${selectedLeadForAssign.name} 문의가 ${selectedAssignee}에게 배정되었습니다.`);
        handleCloseAssignDialog();
        onRefresh(); // 목록 새로고침
      }
    }
  };

  return (
    // TDS: 평면 흰 카드 + 1px 헤어라인 (그림자 없음)
    <Paper variant="outlined" sx={{ width: '100%', overflow: 'hidden', borderRadius: '16px' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', p: 2, gap: 1, flexWrap: 'wrap' }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="문의 검색..."
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 'auto' }, mb: { xs: 2, sm: 0 } }}
        />
        <Box>
          {selectedLeadIds.length > 0 && (
            <>
              <Button variant="outlined" sx={{ mr: 1 }}>
                {selectedLeadIds.length} 선택됨
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
                sx={{ mr: 1 }}
              >
                선택 항목 삭제
              </Button>
            </>
          )}
          <IconButton onClick={onRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={onFilterClick} color="primary">
            <FilterListIcon />
          </IconButton>
          <IconButton onClick={onExportClick} color="primary">
            <DownloadIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ ml: 1 }} onClick={onAddLeadClick}>
            새 문의
          </Button>
        </Box>
      </Toolbar>
      <TableContainer sx={{ maxHeight: 600 }} className="scroll-x">
        <Table stickyHeader aria-label="leads table" sx={{ minWidth: 820 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selectedLeadIds.length > 0 && selectedLeadIds.length < leads.length}
                  checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all leads' }}
                />
              </TableCell><TableCell align="center">날짜</TableCell><TableCell align="center">채널</TableCell><TableCell align="center">업체명</TableCell><TableCell align="center">문의서비스</TableCell><TableCell align="center">상태</TableCell><TableCell align="center">담당자</TableCell><TableCell align="center">액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, borderBottom: 'none' }}> {/* 8개 열: 체크박스, 날짜, 채널, 업체명, 문의서비스, 상태, 담당자, 액션 */}
                  <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    조건에 맞는 문의가 없어요
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    필터를 바꾸면 다른 문의를 볼 수 있어요
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 2 }} onClick={() => onFilterClick()}> {/* 필터 초기화 버튼 클릭 시 필터 드로어 열도록 변경 */}
                    필터 바꾸기
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => {
                const isItemSelected = isSelected(lead.lead_id);
                return (
                  <TableRow
                    key={lead.lead_id}
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${lead.lead_id}` }}
                        onClick={(event) => handleClick(event, lead.lead_id)}
                      />
                    </TableCell><TableCell align="center">{formatDate(lead.last_contact_at)}</TableCell><TableCell align="center">
                      <Button
                        size="small"
                        onClick={(e) => handleOpenChannelPopover(e, lead)}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.8125rem',
                          py: 0.5,
                          px: 1,
                          minWidth: 150,
                          justifyContent: 'flex-start',
                          color: 'text.primary',
                        }}
                      >
                        {(() => {
                          const channels = Array.isArray(lead.utm_source)
                            ? lead.utm_source.filter(Boolean)
                            : (lead.utm_source ? [lead.utm_source] : []);
                          return channels.length > 0 ? channels.join(', ') : '-';
                        })()}
                      </Button>
                      <Popover
                        open={Boolean(channelPopoverAnchor[lead.lead_id])}
                        anchorEl={channelPopoverAnchor[lead.lead_id]}
                        onClose={() => handleCloseChannelPopover(lead.lead_id)}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'left',
                        }}
                      >
                        <Box sx={{ p: 2, minWidth: 200 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>인입경로 선택</Typography>
                          <FormGroup>
                            {availableChannels.map((channel) => (
                              <FormControlLabel
                                key={channel}
                                control={
                                  <Checkbox
                                    checked={tempChannels.includes(channel)}
                                    onChange={() => handleToggleChannel(channel)}
                                  />
                                }
                                label={channel}
                              />
                            ))}
                          </FormGroup>
                          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              onClick={() => handleCloseChannelPopover(lead.lead_id)}
                            >
                              취소
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleApplyChannelChange(lead.lead_id)}
                            >
                              적용
                            </Button>
                          </Box>
                        </Box>
                      </Popover>
                    </TableCell><TableCell align="center" component="th" scope="row" id={`enhanced-table-checkbox-${lead.lead_id}`}>
                      {lead.name}
                    </TableCell><TableCell align="center">
                      {(() => {
                        const services = Array.isArray(lead.treatment) ? lead.treatment : (lead.treatment ? [lead.treatment] : []);
                        return services.length > 0 ? services.join(', ') : '-';
                      })()}
                    </TableCell><TableCell align="center">
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.lead_id, e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none'
                            },
                            '& .MuiSelect-select': {
                              py: 0.5,
                              px: 1.25,
                              borderRadius: '999px', // TDS: 상태 칩은 full pill
                              fontSize: '13px',
                              // TDS 시맨틱: 진행 단계는 blue-50/Toss Blue, 완료는 green, 보류는 grey, 거절은 washed red
                              backgroundColor:
                                lead.status === '신규' ? 'var(--blue-50)' :
                                lead.status === '상담완료' ? 'var(--blue-50)' :
                                lead.status === '예약완료' ? 'var(--blue-50)' :
                                lead.status === '계약완료' ? '#E5F5EE' :
                                lead.status === '보류' ? 'var(--grey-100)' :
                                lead.status === '거절' ? '#FDEBEC' :
                                'var(--grey-100)',
                              color:
                                lead.status === '신규' ? 'var(--blue-500)' :
                                lead.status === '상담완료' ? 'var(--blue-500)' :
                                lead.status === '예약완료' ? 'var(--blue-500)' :
                                lead.status === '계약완료' ? 'var(--green-500)' :
                                lead.status === '보류' ? 'var(--grey-600)' :
                                lead.status === '거절' ? 'var(--red-500)' :
                                'var(--grey-600)',
                              fontWeight: 600,
                            }
                          }}
                        >
                          <MenuItem value="신규">신규</MenuItem>
                          <MenuItem value="상담완료">상담완료</MenuItem>
                          <MenuItem value="예약완료">예약완료</MenuItem>
                          <MenuItem value="계약완료">계약완료</MenuItem>
                          <MenuItem value="보류">보류</MenuItem>
                          <MenuItem value="거절">거절</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell><TableCell align="center">{lead.assignee_name}</TableCell><TableCell align="center">
                      <IconButton
                        aria-label="more"
                        id={`action-button-${lead.lead_id}`}
                        aria-controls={isMenuOpen(lead.lead_id) ? `action-menu-${lead.lead_id}` : undefined}
                        aria-expanded={isMenuOpen(lead.lead_id) ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={(event) => handleMenuClick(lead.lead_id, event)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        id={`action-menu-${lead.lead_id}`}
                        MenuListProps={{
                          'aria-labelledby': `action-button-${lead.lead_id}`,
                        }}
                        anchorEl={openMenus[lead.lead_id]}
                        open={isMenuOpen(lead.lead_id)}
                        onClose={() => handleMenuClose(lead.lead_id)}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        PaperProps={{
                          style: {
                            maxHeight: 48 * 4.5,
                            width: '150px',
                          },
                        }}
                      >
                        <MenuItem onClick={() => { handleMenuClose(lead.lead_id); onEditLead?.(lead); }}>
                          ✏️ 수정
                        </MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(lead.lead_id); handleOpenAssignDialog(lead); }}>
                          👤 배정
                        </MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(lead.lead_id); handleOpenNoteDialog(lead); }}>
                          📝 메모
                        </MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(lead.lead_id); alert(`${lead.name} 문의 보류 기능은 곧 구현됩니다.`); }}>
                          ⏸️ 보류
                        </MenuItem>
                        <MenuItem onClick={async () => {
                          handleMenuClose(lead.lead_id);
                          if (confirm(`정말로 ${lead.name} 문의를 휴지통으로 이동하시겠습니까?`)) {
                            try {
                              // 1. 먼저 백엔드 API 삭제 시도
                              try {
                                await api.delete(`/api/leads/${lead.lead_id}`);
                                // API 성공 시
                                alert('문의가 삭제되었습니다.');
                                onRefresh();
                                return; // API 성공하면 여기서 종료
                              } catch (apiError) {
                                console.warn('API 삭제 실패, localStorage fallback 사용:', apiError);
                                // API 실패 시 localStorage로 fallback
                              }

                              // 2. API 실패 시 localStorage 사용 (기존 로직)
                              if (typeof window !== 'undefined') {
                                const storedLeads = localStorage.getItem('mcrm_leads');
                                const storedDeletedLeads = localStorage.getItem('mcrm_deleted_leads');

                                if (storedLeads) {
                                  const allLeads = JSON.parse(storedLeads);
                                  const deletedLeads = storedDeletedLeads ? JSON.parse(storedDeletedLeads) : [];

                                  // 삭제할 리드 찾기
                                  const leadToDelete = allLeads.find((l: Lead) => l.lead_id === lead.lead_id);

                                  if (leadToDelete) {
                                    // 삭제 시간 추가
                                    const deletedLead = {
                                      ...leadToDelete,
                                      deleted_at: new Date().toISOString(),
                                    };

                                    // 활성 리드 목록에서 제거
                                    const updatedLeads = allLeads.filter((l: Lead) => l.lead_id !== lead.lead_id);

                                    // 휴지통에 추가
                                    deletedLeads.push(deletedLead);

                                    localStorage.setItem('mcrm_leads', JSON.stringify(updatedLeads));
                                    localStorage.setItem('mcrm_deleted_leads', JSON.stringify(deletedLeads));

                                    alert('문의가 휴지통으로 이동되었습니다. (로컬 저장)');
                                    onRefresh();
                                  }
                                }
                              }
                            } catch (err) {
                              console.error('Failed to delete lead:', err);
                              alert('삭제에 실패했습니다. 다시 시도해주세요.');
                            }
                          }
                        }}>
                          🗑️ 휴지통으로 이동
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalLeads}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />

      {/* 메모 추가 다이얼로그 */}
      <Dialog open={noteDialogOpen} onClose={handleCloseNoteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>메모 추가 - {selectedLeadForNote?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="메모 내용"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="메모를 입력하세요..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoteDialog}>취소</Button>
          <Button onClick={handleAddNote} variant="contained" disabled={!noteContent.trim()}>
            추가
          </Button>
        </DialogActions>
      </Dialog>

      {/* 배정 다이얼로그 */}
      <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>담당자 배정 - {selectedLeadForAssign?.name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>담당자</InputLabel>
            <Select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              label="담당자"
            >
              {availableAssignees.map((assignee) => (
                <MenuItem key={assignee} value={assignee}>
                  {assignee}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>취소</Button>
          <Button onClick={handleAssign} variant="contained" disabled={!selectedAssignee}>
            배정
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}