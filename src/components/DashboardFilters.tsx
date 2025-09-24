import React from 'react';
import { Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="시작일"
              value={startDate}
              onChange={onStartDateChange}
              format="yyyy-MM-dd"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small"
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="종료일"
              value={endDate}
              onChange={onEndDateChange}
              format="yyyy-MM-dd"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small"
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
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
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
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
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={onApplyFilters}
              sx={{ height: '40px' }}
            >
              필터 적용
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onResetFilters}
              sx={{ height: '40px' }}
            >
              필터 초기화
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
