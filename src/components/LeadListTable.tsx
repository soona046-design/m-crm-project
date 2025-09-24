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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add'; // 새 리드 생성 버튼용
import Checkbox from '@mui/material/Checkbox'; // 체크박스 추가
import MoreVertIcon from '@mui/icons-material/MoreVert'; // 행 Hover 액션 메뉴용
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface Lead {
  lead_id: string; // 백엔드 모델에 맞게 id 대신 lead_id 사용
  name: string; // 이름
  primary_phone: string; // 마스킹이 필요한 전화번호
  status: string;
  utm_source: string; // 채널
  last_contact_at: string; // 최근 접점 (datetime)
  score: number;
  assignee_name: string; // 담당자 이름
  sla_status: string; // SLA 상태 (백엔드 Ticket 모델의 sla_status)
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
  onSearchChange: (searchTerm: string) => void; // 검색어 변경 핸들러
  onFilterClick: () => void; // 필터 버튼 클릭 핸들러
  onExportClick: () => void; // CSV 내보내기 버튼 클릭 핸들러
  onAddLeadClick: () => void; // 새 리드 버튼 클릭 핸들러
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
}: LeadListTableProps) {
  const [selectedLeadIds, setSelectedLeadIds] = React.useState<string[]>([]);
  const [hoveredLeadId, setHoveredLeadId] = React.useState<string | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

  // 이름 마스킹 함수 (예: 홍길동 -> 홍**동)
  const maskName = (name: string) => {
    if (!name) return 'N/A';
    if (name.length <= 1) return name;
    if (name.length === 2) return name.charAt(0) + '*';
    return name.charAt(0) + '**' + name.slice(-1);
  };

  // 전화번호 마스킹 함수 (예: 010-1234-5678 -> 010-****-5678)
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

  const getSLAChipColor = (sla: string) => {
    if (sla.includes('SLA 초과')) return 'error';
    if (sla.includes('남음')) return 'info';
    return 'success';
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search Leads..."
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
            <Button variant="outlined" sx={{ mr: 1 }}>
              {selectedLeadIds.length} 선택됨
            </Button>
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
            새 리드
          </Button>
        </Box>
      </Toolbar>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="leads table">
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
              </TableCell><TableCell>이름</TableCell><TableCell>전화번호</TableCell><TableCell>상태</TableCell><TableCell>채널</TableCell><TableCell>최근 접점</TableCell><TableCell>스코어</TableCell><TableCell>담당자</TableCell><TableCell>SLA</TableCell><TableCell align="right">액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} sx={{ textAlign: 'center', py: 5 }}> {/* colSpan 조정 */}
                  <Typography variant="h6" color="text.secondary">
                    No leads found.
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 2 }} onClick={() => onFilterClick()}> {/* 필터 초기화 버튼 클릭 시 필터 드로어 열도록 변경 */}
                    필터 초기화
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
                    onMouseEnter={() => setHoveredLeadId(lead.lead_id)}
                    onMouseLeave={() => setHoveredLeadId(null)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${lead.lead_id}` }}
                        onClick={(event) => handleClick(event, lead.lead_id)}
                      />
                    </TableCell><TableCell component="th" scope="row" id={`enhanced-table-checkbox-${lead.lead_id}`}>
                      {maskName(lead.name)}
                    </TableCell><TableCell>{maskPhoneNumber(lead.primary_phone)}</TableCell><TableCell>
                      <Chip label={lead.status} color={getStatusChipColor(lead.status)} size="small" />
                    </TableCell><TableCell>{lead.utm_source}</TableCell><TableCell>{lead.last_contact_at}</TableCell><TableCell>{lead.score}</TableCell><TableCell>{lead.assignee_name}</TableCell><TableCell>
                      <Chip label={lead.sla_status} color={getSLAChipColor(lead.sla_status)} size="small" />
                    </TableCell><TableCell align="right">
                      {hoveredLeadId === lead.lead_id && (
                        <IconButton
                          aria-label="more"
                          id="long-button"
                          aria-controls={open ? 'long-menu' : undefined}
                          aria-expanded={open ? 'true' : undefined}
                          aria-haspopup="true"
                          onClick={(event) => setAnchorEl(event.currentTarget)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      )}
                      <Menu
                        id="long-menu"
                        MenuListProps={{
                          'aria-labelledby': 'long-button',
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => setAnchorEl(null)}
                        PaperProps={{
                          style: {
                            maxHeight: 48 * 4.5,
                            width: '20ch',
                          },
                        }}
                      >
                        <MenuItem onClick={() => alert('보기')}>보기</MenuItem>
                        <MenuItem onClick={() => alert('배정')}>배정</MenuItem>
                        <MenuItem onClick={() => alert('메모')}>메모</MenuItem>
                        <MenuItem onClick={() => alert('보류')}>보류</MenuItem>
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
    </Paper>
  );
}