'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface PivotTableData {
  id: string;
  channel: string;
  campaign: string;
  year: number;
  month: number;
  week: number;
  impressions: number;
  clicks: number;
  ctr: number;
  leads: number;
  appointments: number;
  cost: number;
  revenue: number;
  cpc: number;
  cpl: number;
  cpa: number;
  conversionRate: number;
  roi: number;
  roas: number;
  source?: 'api' | 'manual';
  startDate?: string;
  endDate?: string;
  deletedAt?: string;
}

export default function ChannelPivotTrashPage() {
  const [pivotTableData, setPivotTableData] = useState<PivotTableData[]>([]);
  const [loading, setLoading] = useState(true);

  // localStorage에서 데이터 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('mcrm_manual_campaigns');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setPivotTableData(parsedData);
        console.log('📦 Loaded manual campaigns from localStorage:', parsedData.length);
      }
    }
    setLoading(false);
  }, []);

  // 30일 경과 항목 자동 삭제
  useEffect(() => {
    cleanupOldDeletedItems();
  }, []);

  const cleanupOldDeletedItems = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const updatedData = pivotTableData.filter(item => {
      if (item.deletedAt) {
        const deletedDate = new Date(item.deletedAt);
        return deletedDate > thirtyDaysAgo;
      }
      return true;
    });

    if (updatedData.length < pivotTableData.length) {
      setPivotTableData(updatedData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mcrm_manual_campaigns', JSON.stringify(updatedData));
        console.log('🗑️ Old deleted items cleaned up');
      }
    }
  };

  // 복원
  const handleRestore = (id: string) => {
    if (!confirm('이 캠페인을 복원하시겠습니까?')) {
      return;
    }

    const updatedData = pivotTableData.map(item => {
      if (item.id === id) {
        const { deletedAt, ...rest } = item;
        return rest as PivotTableData;
      }
      return item;
    });

    setPivotTableData(updatedData);

    if (typeof window !== 'undefined') {
      localStorage.setItem('mcrm_manual_campaigns', JSON.stringify(updatedData));
      console.log('💾 Campaign restored');
    }

    alert('캠페인이 복원되었습니다.');
    window.location.reload();
  };

  // 영구 삭제
  const handlePermanentDelete = (id: string) => {
    if (!confirm('이 캠페인을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    const updatedData = pivotTableData.filter(item => item.id !== id);
    setPivotTableData(updatedData);

    if (typeof window !== 'undefined') {
      localStorage.setItem('mcrm_manual_campaigns', JSON.stringify(updatedData));
      console.log('💾 Campaign permanently deleted');
    }

    alert('캠페인이 영구적으로 삭제되었습니다.');
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return '₩0';
    return `₩${value.toLocaleString()}`;
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    return value.toLocaleString();
  };

  const deletedItems = pivotTableData.filter(item => item.deletedAt);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        휴지통 (채널피벗)
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        삭제된 캠페인은 30일 후 자동으로 영구 삭제됩니다
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">휴지통 (30일 후 자동 삭제)</Typography>
          <Typography variant="body2" color="text.secondary">
            총 {deletedItems.length}개의 삭제된 캠페인
          </Typography>
        </Box>
        {deletedItems.length > 0 ? (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>채널</strong></TableCell>
                  <TableCell><strong>캠페인</strong></TableCell>
                  <TableCell align="right"><strong>노출</strong></TableCell>
                  <TableCell align="right"><strong>클릭</strong></TableCell>
                  <TableCell align="right"><strong>비용(원)</strong></TableCell>
                  <TableCell align="right"><strong>삭제일시</strong></TableCell>
                  <TableCell align="right"><strong>남은 기간</strong></TableCell>
                  <TableCell align="center"><strong>작업</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deletedItems
                  .sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime())
                  .map((campaign) => {
                    const deletedDate = new Date(campaign.deletedAt!);
                    const now = new Date();
                    const daysLeft = 30 - Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
                    const isExpiringSoon = daysLeft <= 7;

                    return (
                      <TableRow key={campaign.id} hover sx={{ backgroundColor: isExpiringSoon ? '#fff3e0' : '#fafafa' }}>
                        <TableCell>{campaign.channel}</TableCell>
                        <TableCell>{campaign.campaign}</TableCell>
                        <TableCell align="right">{formatNumber(campaign.impressions)}</TableCell>
                        <TableCell align="right">{formatNumber(campaign.clicks)}</TableCell>
                        <TableCell align="right">{formatCurrency(campaign.cost)}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {deletedDate.toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={daysLeft > 0 ? `${daysLeft}일` : '오늘 삭제'}
                            size="small"
                            color={isExpiringSoon ? 'warning' : 'default'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleRestore(campaign.id)}
                              sx={{ minWidth: '60px' }}
                            >
                              복원
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handlePermanentDelete(campaign.id)}
                              sx={{ minWidth: '80px' }}
                            >
                              영구삭제
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body1" color="text.secondary">
              휴지통이 비어있습니다
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
