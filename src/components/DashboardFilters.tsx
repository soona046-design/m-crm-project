import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

interface DashboardFiltersProps {
  startDate: Date | null;
  endDate: Date | null;
  clinicId: string;
  agentId: string;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onClinicChange: (clinicId: string) => void;
  onAgentChange: (agentId: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  clinics: Array<{ clinic_id: string; name: string }>;
  agents: Array<{ user_id: string; name: string }>;
}

export default function DashboardFilters({
  startDate,
  endDate,
  clinicId,
  agentId,
  onStartDateChange,
  onEndDateChange,
  onClinicChange,
  onAgentChange,
  onApplyFilters,
  onResetFilters,
  clinics,
  agents,
}: DashboardFiltersProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flexBasis: { xs: '100%', sm: '45%', md: '15%' } }}>
            <DatePicker
              label="시작일"
              value={startDate ? dayjs(startDate) : null}
              onChange={(newValue) => onStartDateChange(newValue ? newValue.toDate() : null)}
              format="YYYY-MM-DD"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small"
                }
              }}
            />
          </Box>
          <Box sx={{ flexBasis: { xs: '100%', sm: '45%', md: '15%' } }}>
            <DatePicker
              label="종료일"
              value={endDate ? dayjs(endDate) : null}
              onChange={(newValue) => onEndDateChange(newValue ? newValue.toDate() : null)}
              format="YYYY-MM-DD"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small"
                }
              }}
            />
          </Box>
          <Box sx={{ flexBasis: { xs: '100%', sm: '45%', md: '15%' } }}>
            <FormControl fullWidth size="small">
              <InputLabel id="clinic-select-label">지점</InputLabel>
              <Select
                labelId="clinic-select-label"
                id="clinic-select"
                value={clinicId}
                label="지점"
                onChange={(e) => onClinicChange(e.target.value)}
              >
                <MenuItem value="">전체</MenuItem>
                {clinics.map((clinic) => (
                  <MenuItem key={clinic.clinic_id} value={clinic.clinic_id}>
                    {clinic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flexBasis: { xs: '100%', sm: '45%', md: '15%' } }}>
            <FormControl fullWidth size="small">
              <InputLabel id="agent-select-label">상담원</InputLabel>
              <Select
                labelId="agent-select-label"
                id="agent-select"
                value={agentId}
                label="상담원"
                onChange={(e) => onAgentChange(e.target.value)}
              >
                <MenuItem value="">전체</MenuItem>
                {agents.map((agent) => (
                  <MenuItem key={agent.user_id} value={agent.user_id}>
                    {agent.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flexBasis: { xs: '100%', sm: '45%', md: '15%' } }}>
            <Button
              variant="contained"
              fullWidth
              onClick={onApplyFilters}
              sx={{ height: '40px' }}
            >
              필터 적용
            </Button>
          </Box>
          <Box sx={{ flexBasis: { xs: '100%', sm: '45%', md: '15%' } }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onResetFilters}
              sx={{ height: '40px' }}
            >
              필터 초기화
            </Button>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
