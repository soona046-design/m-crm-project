'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip as MuiTooltip,
  CircularProgress,
} from '@mui/material';
import api from '@/lib/axios';

interface Dropoff {
  lead_id: string;
  name: string;
  primary_phone: string;
  utm_source: string;
  assignee_name: string;
  status: 'pending' | 'rejected';
  last_stage: '문의' | '상담' | '예약' | '계약';
  dropped_at: string;
  memo: string | null;
}

interface Props {
  channel: string; // 'all' 이면 전체
  startDate: string;
  endDate: string;
}

const STAGE_ORDER = ['문의', '상담', '예약', '계약'];

export default function FunnelDropoffTable({ channel, startDate, endDate }: Props) {
  const [dropoffs, setDropoffs] = useState<Dropoff[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDropoffs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/dashboards/funnel-dropoffs', {
        params: { startDate: startDate || undefined, endDate: endDate || undefined },
      });
      let rows: Dropoff[] = response.data?.dropoffs || [];
      if (channel !== 'all') {
        rows = rows.filter((row) => row.utm_source === channel);
      }
      setDropoffs(rows);
    } catch (error) {
      console.error('이탈 분석 데이터 조회 실패:', error);
      setDropoffs([]);
    } finally {
      setLoading(false);
    }
  }, [channel, startDate, endDate]);

  useEffect(() => {
    fetchDropoffs();
  }, [fetchDropoffs]);

  const grouped = STAGE_ORDER.map((stage) => ({
    stage,
    rows: dropoffs.filter((d) => d.last_stage === stage),
  })).filter((group) => group.rows.length > 0);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>퍼널 단계별 이탈 분석</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        보류·거절 상태인 리드를 마지막으로 도달했던 단계 기준으로 묶어서 보여줍니다. 메모에서 이탈 사유를 확인하세요.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : grouped.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          이탈한 리드가 없습니다.
        </Typography>
      ) : (
        grouped.map((group) => (
          <Box key={group.stage} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              {group.stage} 단계 이탈 ({group.rows.length}건)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F6F6F6' }}>
                    <TableCell>채널</TableCell>
                    <TableCell>업체명</TableCell>
                    <TableCell>연락처</TableCell>
                    <TableCell>담당자</TableCell>
                    <TableCell>상태</TableCell>
                    <TableCell>이탈일시</TableCell>
                    <TableCell>메모(이탈 사유)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.rows.map((row) => (
                    <TableRow key={row.lead_id} hover>
                      <TableCell>{row.utm_source}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.primary_phone}</TableCell>
                      <TableCell>{row.assignee_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status === 'pending' ? '보류' : '거절'}
                          size="small"
                          color={row.status === 'pending' ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{new Date(row.dropped_at).toLocaleString('ko-KR')}</TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        {row.memo ? (
                          <MuiTooltip title={row.memo} arrow>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                              {row.memo}
                            </Typography>
                          </MuiTooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      )}
    </Paper>
  );
}
