'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Menu,
  MenuItem,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RestoreIcon from '@mui/icons-material/Restore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getPriorityInfoFromScore } from '@/lib/leadPriority';
import { useRouter } from 'next/navigation';

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
}

interface DeletedLead {
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
  notes?: Note[];
  deleted_at: string; // 삭제 시간
}

export default function TrashPage() {
  const router = useRouter();
  const [deletedLeads, setDeletedLeads] = useState<DeletedLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<DeletedLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [openMenus, setOpenMenus] = useState<{[key: string]: HTMLElement | null}>({});

  // 페이지네이션 상태
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 휴지통 데이터 로드
  const loadTrashData = useCallback(() => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const storedDeletedLeads = localStorage.getItem('mcrm_deleted_leads');
        if (storedDeletedLeads) {
          const parsed: DeletedLead[] = JSON.parse(storedDeletedLeads);
          // 최근 삭제된 순으로 정렬
          const sorted = parsed.sort((a, b) =>
            new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
          );
          setDeletedLeads(sorted);
          setFilteredLeads(sorted);
        } else {
          setDeletedLeads([]);
          setFilteredLeads([]);
        }
      }
    } catch (error) {
      console.error('Failed to load trash data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrashData();
  }, [loadTrashData]);

  // 검색 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLeads(deletedLeads);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = deletedLeads.filter(lead =>
        lead.name.toLowerCase().includes(lowercaseSearch) ||
        lead.primary_phone.includes(searchTerm) ||
        lead.utm_source.toLowerCase().includes(lowercaseSearch) ||
        lead.assignee_name.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredLeads(filtered);
    }
    setPage(0); // 검색 시 첫 페이지로 이동
  }, [searchTerm, deletedLeads]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = filteredLeads.map((n) => n.lead_id);
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

  // 복원 기능
  const handleRestore = (lead: DeletedLead) => {
    if (!confirm(`${lead.name} 문의를 복원하시겠습니까?`)) {
      return;
    }

    if (typeof window !== 'undefined') {
      const storedLeads = localStorage.getItem('mcrm_leads');
      const storedDeletedLeads = localStorage.getItem('mcrm_deleted_leads');

      if (storedDeletedLeads) {
        const allLeads = storedLeads ? JSON.parse(storedLeads) : [];
        const deletedLeads: DeletedLead[] = JSON.parse(storedDeletedLeads);

        // deleted_at 필드 제거
        const { deleted_at, ...restoredLead } = lead;

        // 활성 리드 목록에 추가
        allLeads.push(restoredLead);

        // 휴지통에서 제거
        const updatedDeletedLeads = deletedLeads.filter((l: DeletedLead) => l.lead_id !== lead.lead_id);

        localStorage.setItem('mcrm_leads', JSON.stringify(allLeads));
        localStorage.setItem('mcrm_deleted_leads', JSON.stringify(updatedDeletedLeads));

        alert('문의가 복원되었습니다.');
        loadTrashData();
      }
    }
  };

  // 영구 삭제 기능
  const handlePermanentDelete = (lead: DeletedLead) => {
    if (!confirm(`${lead.name} 문의를 영구적으로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!`)) {
      return;
    }

    if (typeof window !== 'undefined') {
      const storedDeletedLeads = localStorage.getItem('mcrm_deleted_leads');

      if (storedDeletedLeads) {
        const deletedLeads: DeletedLead[] = JSON.parse(storedDeletedLeads);

        // 휴지통에서 영구 제거
        const updatedDeletedLeads = deletedLeads.filter((l: DeletedLead) => l.lead_id !== lead.lead_id);

        localStorage.setItem('mcrm_deleted_leads', JSON.stringify(updatedDeletedLeads));

        alert('문의가 영구적으로 삭제되었습니다.');
        loadTrashData();
      }
    }
  };

  // 전체 휴지통 비우기
  const handleEmptyTrash = () => {
    if (!confirm(`휴지통을 비우시겠습니까?\n\n${deletedLeads.length}개의 문의가 영구적으로 삭제됩니다.\n이 작업은 되돌릴 수 없습니다!`)) {
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('mcrm_deleted_leads', JSON.stringify([]));
      alert('휴지통이 비워졌습니다.');
      loadTrashData();
    }
  };

  // 이름 마스킹 함수
  const maskName = (name: string) => {
    if (!name) return 'N/A';
    if (name.length <= 1) return name;
    if (name.length === 2) return name.charAt(0) + '*';
    return name.charAt(0) + '**' + name.slice(-1);
  };

  // 전화번호 마스킹 함수
  const maskPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return 'N/A';
    return phoneNumber.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'primary';
      case 'contacted':
        return 'secondary';
      case 'pending':
        return 'warning';
      case 'converted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDeletedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes}분 전`;
      }
      return `${diffInHours}시간 전`;
    }
    if (diffInDays === 1) return '어제';
    if (diffInDays < 7) return `${diffInDays}일 전`;

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const paginatedLeads = filteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            휴지통
          </Typography>
          <Typography variant="body2" color="text.secondary">
            삭제된 문의는 30일 후 자동으로 영구 삭제됩니다
          </Typography>
        </Box>
        {deletedLeads.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={handleEmptyTrash}
          >
            휴지통 비우기
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="문의 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <Button variant="outlined" sx={{ mr: 1 }}>
                  {selectedLeadIds.length} 선택됨
                </Button>
              )}
              <IconButton onClick={loadTrashData} color="primary">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Toolbar>

          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="trash table">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={selectedLeadIds.length > 0 && selectedLeadIds.length < filteredLeads.length}
                      checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                      onChange={handleSelectAllClick}
                      inputProps={{ 'aria-label': 'select all deleted leads' }}
                    />
                  </TableCell>
                  <TableCell>이름</TableCell>
                  <TableCell>전화번호</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>채널</TableCell>
                  <TableCell>우선순위</TableCell>
                  <TableCell>담당자</TableCell>
                  <TableCell>삭제 시간</TableCell>
                  <TableCell align="right">액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 5 }}>
                      <Typography variant="h6" color="text.secondary">
                        휴지통이 비어있습니다
                      </Typography>
                      <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => router.push('/leads')}
                      >
                        문의 목록으로 이동
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLeads.map((lead) => {
                    const isItemSelected = isSelected(lead.lead_id);
                    return (
                      <TableRow
                        key={lead.lead_id}
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        selected={isItemSelected}
                        sx={{ opacity: 0.7 }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{ 'aria-labelledby': `trash-checkbox-${lead.lead_id}` }}
                            onClick={(event) => handleClick(event, lead.lead_id)}
                          />
                        </TableCell>
                        <TableCell component="th" scope="row" id={`trash-checkbox-${lead.lead_id}`}>
                          {maskName(lead.name)}
                        </TableCell>
                        <TableCell>{maskPhoneNumber(lead.primary_phone)}</TableCell>
                        <TableCell>
                          <Chip label={lead.status} color={getStatusChipColor(lead.status)} size="small" />
                        </TableCell>
                        <TableCell>{lead.utm_source}</TableCell>
                        <TableCell>
                          {(() => {
                            const priorityInfo = getPriorityInfoFromScore(lead.score);
                            return (
                              <Chip
                                label={priorityInfo.priority}
                                color={priorityInfo.color}
                                size="small"
                                sx={{
                                  backgroundColor: priorityInfo.backgroundColor,
                                  color: priorityInfo.textColor,
                                  fontWeight: 600,
                                }}
                              />
                            );
                          })()}
                        </TableCell>
                        <TableCell>{lead.assignee_name}</TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {formatDeletedAt(lead.deleted_at)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
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
                            <MenuItem onClick={() => { handleMenuClose(lead.lead_id); handleRestore(lead); }}>
                              <RestoreIcon fontSize="small" sx={{ mr: 1 }} /> 복원
                            </MenuItem>
                            <MenuItem onClick={() => { handleMenuClose(lead.lead_id); handlePermanentDelete(lead); }} sx={{ color: 'error.main' }}>
                              <DeleteForeverIcon fontSize="small" sx={{ mr: 1 }} /> 영구 삭제
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
            count={filteredLeads.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelRowsPerPage="페이지당 행 수:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 총 ${count}개`}
          />
        </Paper>
      )}
    </Box>
  );
}
