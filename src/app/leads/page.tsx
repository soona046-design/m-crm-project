'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import LeadListTable from '@/components/LeadListTable'; // LeadListTable 컴포넌트 import
import axios from 'axios'; // API 호출을 위해 axios import

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
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 추가

  // 실제 백엔드 API 엔드포인트와 연동
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/leads', { // 백엔드 API 엔드포인트 호출
        params: {
          page: page + 1, // Laravel 페이지네이션은 1부터 시작
          per_page: rowsPerPage,
          search: searchTerm, // 검색어 파라미터 추가
          // TODO: 필터링, 정렬 파라미터 추가
        },
      });
      setLeads(response.data.data); // Laravel paginate 응답 형식에 맞춰 data 속성 접근
      setTotalLeads(response.data.total); // 전체 리드 수 설정
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]); // searchTerm을 의존성 배열에 추가

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handlePageChange = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // rowsPerPage 변경 시 첫 페이지로 이동
  }, []);

  const handleRefresh = useCallback(() => {
    // 필터/검색 조건 초기화 후 다시 fetchLeads 호출 (현재는 더미 데이터라 효과 미미)
    setPage(0);
    setSearchTerm(''); // 검색어 초기화
    // TODO: 필터 상태도 초기화 필요
    fetchLeads();
  }, [fetchLeads]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(0); // 검색어 변경 시 첫 페이지로 이동
  }, []);

  const handleFilterClick = useCallback(() => {
    alert('필터 드로어 열기'); // 실제 필터 드로어 로직으로 교체 필요
  }, []);

  const handleExportClick = useCallback(() => {
    alert('CSV 내보내기 기능'); // 실제 CSV 내보내기 로직 (백엔드 API 호출)으로 교체 필요
  }, []);

  const handleAddLeadClick = useCallback(() => {
    alert('새 리드 생성 페이지/모달 열기'); // 실제 새 리드 생성 페이지 또는 모달 로직으로 교체 필요
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Leads List
      </Typography>

      {loading && <Typography>Loading leads...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <LeadListTable
        leads={leads}
        totalLeads={totalLeads}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRefresh={handleRefresh}
        onSearchChange={handleSearchChange}
        onFilterClick={handleFilterClick}
        onExportClick={handleExportClick}
        onAddLeadClick={handleAddLeadClick}
      />
    </Box>
  );
}