'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SelectChangeEvent } from '@mui/material/Select';

interface FilterState {
  status: string[];
  channel: string[];
  assignee: string[];
  slaStatus: string[];
  scoreRange: [number, number];
  dateRange: { start: string; end: string };
}

interface LeadFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  availableStatuses: string[];
  availableChannels: string[];
  availableAssignees: Array<{ user_id: string; name: string }>;
}

export default function LeadFilterDrawer({
  open,
  onClose,
  onApplyFilters,
  availableStatuses,
  availableChannels,
  availableAssignees,
}: LeadFilterDrawerProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    channel: [],
    assignee: [],
    slaStatus: [],
    scoreRange: [0, 100],
    dateRange: { start: '', end: '' },
  });

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      status: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleChannelChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      channel: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleAssigneeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      assignee: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSlaStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      slaStatus: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleScoreRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    setFilters(prev => ({
      ...prev,
      scoreRange: type === 'min' ? [numValue, prev.scoreRange[1]] : [prev.scoreRange[0], numValue],
    }));
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, [type]: value },
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: [],
      channel: [],
      assignee: [],
      slaStatus: [],
      scoreRange: [0, 100],
      dateRange: { start: '', end: '' },
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.channel.length > 0) count++;
    if (filters.assignee.length > 0) count++;
    if (filters.slaStatus.length > 0) count++;
    if (filters.scoreRange[0] !== 0 || filters.scoreRange[1] !== 100) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">필터</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {getActiveFilterCount() > 0 && (
          <Chip
            label={`${getActiveFilterCount()}개 필터 적용됨`}
            size="small"
            color="primary"
            sx={{ mb: 2 }}
          />
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Filters */}
        <Stack spacing={3}>
          {/* 상태 필터 */}
          <FormControl fullWidth size="small">
            <InputLabel>상태</InputLabel>
            <Select
              multiple
              value={filters.status}
              onChange={handleStatusChange}
              label="상태"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 채널 필터 */}
          <FormControl fullWidth size="small">
            <InputLabel>채널</InputLabel>
            <Select
              multiple
              value={filters.channel}
              onChange={handleChannelChange}
              label="채널"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableChannels.map((channel) => (
                <MenuItem key={channel} value={channel}>
                  {channel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 담당자 필터 */}
          <FormControl fullWidth size="small">
            <InputLabel>담당자</InputLabel>
            <Select
              multiple
              value={filters.assignee}
              onChange={handleAssigneeChange}
              label="담당자"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const assignee = availableAssignees.find((a) => a.name === value);
                    return <Chip key={value} label={assignee?.name || value} size="small" />;
                  })}
                </Box>
              )}
            >
              {availableAssignees.map((assignee) => (
                <MenuItem key={assignee.user_id} value={assignee.name}>
                  {assignee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* [SLA 기능 비활성화 2026-06-22] SLA 상태 필터
          <FormControl fullWidth size="small">
            <InputLabel>SLA 상태</InputLabel>
            <Select
              multiple
              value={filters.slaStatus}
              onChange={handleSlaStatusChange}
              label="SLA 상태"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="정상">정상</MenuItem>
              <MenuItem value="경고">경고</MenuItem>
              <MenuItem value="위반">위반</MenuItem>
            </Select>
          </FormControl>
          */}

          {/* 우선순위 점수 범위 */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              우선순위 점수
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="최소"
                type="number"
                size="small"
                value={filters.scoreRange[0]}
                onChange={(e) => handleScoreRangeChange('min', e.target.value)}
                inputProps={{ min: 0, max: 100 }}
              />
              <TextField
                label="최대"
                type="number"
                size="small"
                value={filters.scoreRange[1]}
                onChange={(e) => handleScoreRangeChange('max', e.target.value)}
                inputProps={{ min: 0, max: 100 }}
              />
            </Box>
          </Box>

          {/* 날짜 범위 */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              최근 접점 날짜
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="시작일"
                type="date"
                size="small"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="종료일"
                type="date"
                size="small"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </Stack>

        {/* Actions */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button variant="outlined" fullWidth onClick={handleReset}>
            초기화
          </Button>
          <Button variant="contained" fullWidth onClick={handleApply}>
            적용
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
