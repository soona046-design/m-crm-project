'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Button, ButtonGroup, CircularProgress, Grid } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { ko } from 'date-fns/locale';
import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 로케일 임포트
import axios from 'axios';

dayjs.locale('ko'); // dayjs 전역 로케일 설정

interface Appointment {
  apt_id: string;
  lead_id: string;
  lead_name: string; // 리드 이름 (프론트엔드 표시용)
  clinic_id: string;
  doctor_id?: string;
  doctor_name?: string; // 의사 이름 (프론트엔드 표시용)
  slot_at: string; // ISO 8601 형식의 날짜/시간 스트링
  status: 'booked' | 'noshow' | 'done' | 'cancelled';
  reminder_sent: boolean;
}

export default function AppointmentsPage() {
  const [view, setView] = useState<'week' | 'day'>('week'); // 주간/일간 뷰 전환
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: 필터 상태 (지점, 의사, 장비) 추가

  const fetchAppointments = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const startDate = view === 'week' ? dayjs(date).startOf('week').toDate() : date; // 주간 뷰 시작
      const endDate = view === 'week' ? dayjs(date).endOf('week').toDate() : date;     // 주간 뷰 종료

      const response = await axios.get('/api/appointments', { // TODO: 실제 API 엔드포인트 및 필터 파라미터 추가
        params: {
          start_date: dayjs(startDate).format('YYYY-MM-DD'),
          end_date: dayjs(endDate).format('YYYY-MM-DD'),
          // TODO: clinicId, doctorId, equipmentId 필터 파라미터 추가
        },
      });
      // 백엔드 응답 형식에 맞춰 데이터 변환 필요
      setAppointments(response.data.data || response.data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointments(selectedDate);
    }
  }, [selectedDate, fetchAppointments]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const getFilteredAppointments = (date: Date) => {
    return appointments.filter(apt => dayjs(apt.slot_at).isSame(dayjs(date), 'day'));
  };

  // TODO: 노쇼 처리 모달 컴포넌트 추가
  const handleNoShow = (aptId: string) => {
    alert(`노쇼 처리: ${aptId}`);
    // TODO: 백엔드 API 호출로 예약 상태 업데이트
  };

  const renderDayView = (date: Date) => (
    <Box key={dayjs(date).format('YYYY-MM-DD')} sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>{dayjs(date).format('YYYY년 MM월 DD일 (ddd)')}</Typography>
      <Grid container spacing={2}>
        {getFilteredAppointments(date).length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">예약이 없습니다.</Typography>
          </Grid>
        ) : (
          getFilteredAppointments(date).map(apt => (
            <Grid item xs={12} sm={6} md={4} key={apt.apt_id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">환자: {apt.lead_name || 'N/A'}</Typography>
                <Typography variant="body2">시간: {dayjs(apt.slot_at).format('HH:mm')}</Typography>
                <Typography variant="body2">의사: {apt.doctor_name || '미정'}</Typography>
                <Typography variant="body2">상태: {apt.status}</Typography>
                {apt.reminder_sent && <Typography variant="caption" color="text.secondary">리마인드 발송됨</Typography>}
                <Button size="small" onClick={() => handleNoShow(apt.apt_id)} sx={{ mt: 1 }}>노쇼 처리</Button>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );

  const renderWeekView = () => {
    if (!selectedDate) return null;
    const start = dayjs(selectedDate).startOf('week');
    const days = Array.from({ length: 7 }).map((_, i) => start.add(i, 'day').toDate());
    return (
      <Box>
        {days.map(day => renderDayView(day))}
      </Box>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Appointments Calendar
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}> 
              <DateCalendar
                value={dayjs(selectedDate)} // dayjs 객체로 전달
                onChange={(newValue) => setSelectedDate(newValue ? newValue.toDate() : null)} // Date 객체로 변환하여 저장
                views={['day']}
                // `DateCalendar`는 직접적인 주간/일간 뷰 전환 버튼을 제공하지 않으므로, 외부 버튼으로 제어
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <ButtonGroup variant="outlined" aria-label="calendar view toggle">
                <Button onClick={() => setView('week')} variant={view === 'week' ? 'contained' : 'outlined'}>주간</Button>
                <Button onClick={() => setView('day')} variant={view === 'day' ? 'contained' : 'outlined'}>일간</Button>
              </ButtonGroup>
              {/* TODO: 지점/의사/장비 필터 드롭다운 */}
              <Button variant="contained">새 예약</Button>
            </Box>
            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}
            {!loading && !error && (
              <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                {view === 'week' ? renderWeekView() : selectedDate && renderDayView(selectedDate)}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
