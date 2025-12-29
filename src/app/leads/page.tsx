'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import LeadListTable from '@/components/LeadListTable'; // LeadListTable 컴포넌트 import
import LeadFilterDrawer from '@/components/LeadFilterDrawer'; // 필터 드로어 import
import axios from 'axios'; // API 호출을 위해 axios import
import api from '@/lib/axios'; // 채널 관리 API 호출용
import { useAuth } from '@/contexts/AuthContext';
import { getPriorityInfoFromScore } from '@/lib/leadPriority';

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
  communication_count: number; // 커뮤니케이션 카운트 (호환성 유지)
  tickets_count?: number; // 티켓(문의) 수
  appointments_count?: number; // 예약 수
  revenue?: number; // 매출 (선택)
  treatment?: string | string[]; // 문의서비스 (단일 또는 다중)
  consultation_notes?: string; // 상담 메모 (선택)
}

interface NewLead {
  name: string;
  primary_phone: string;
  status: string;
  utm_source: string[]; // 인입경로 (다중 선택)
  utm_campaign?: string; // 캠페인 추가
  score: number;
  assignee_name: string;
  revenue?: number;
  treatment: string[]; // 문의서비스 (다중 선택)
  consultation_notes?: string;
  inquiry_date?: string; // 문의 날짜
}

interface FilterState {
  status: string[];
  channel: string[];
  assignee: string[];
  slaStatus: string[];
  scoreRange: [number, number];
  dateRange: { start: string; end: string };
}

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 추가
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false); // 필터 드로어 상태
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    status: [],
    channel: [],
    assignee: [],
    slaStatus: [],
    scoreRange: [0, 100],
    dateRange: { start: '', end: '' },
  }); // 적용된 필터

  // 사용 가능한 담당자 목록을 가져오는 함수 (클라이언트에서만 실행)
  const getAvailableAssignees = useCallback(() => {
    const defaultAssignees = [
      { user_id: '1', name: '김상담', role: '상담매니저' },
      { user_id: '2', name: '이상담', role: '상담매니저' },
      { user_id: '3', name: '박상담', role: '상담매니저' },
      { user_id: '4', name: '최관리자', role: '지점관리자' }
    ];

    // 클라이언트에서만 localStorage 접근
    if (typeof window === 'undefined') {
      return defaultAssignees;
    }

    try {
      const storedUsers = localStorage.getItem('mcrm_users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        return users.filter((user: any) => user.active !== false).map((user: any) => ({
          user_id: user.user_id,
          name: user.name,
          role: user.role || '상담매니저'
        }));
      }
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
    }

    return defaultAssignees;
  }, []);

  const [availableAssignees, setAvailableAssignees] = useState<Array<{user_id: string; name: string; role: string}>>([
    { user_id: '1', name: '김상담', role: '상담매니저' },
    { user_id: '2', name: '이상담', role: '상담매니저' },
    { user_id: '3', name: '박상담', role: '상담매니저' },
    { user_id: '4', name: '최관리자', role: '지점관리자' }
  ]);

  // 채널 관리에서 가져온 활성 채널 목록
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);

  // 새 리드 등록 모달 상태
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
  const [newLead, setNewLead] = useState<NewLead>({
    name: '',
    primary_phone: '',
    status: '상담완료',
    utm_source: [], // 인입경로 초기값 (빈 배열)
    utm_campaign: '', // 캠페인 초기값
    score: 50,
    assignee_name: user?.name || '김상담', // 현재 로그인된 사용자를 기본값으로 설정
    revenue: 0,
    treatment: [], // 문의서비스 초기값 (빈 배열)
    consultation_notes: '',
    inquiry_date: new Date().toISOString().split('T')[0] // 오늘 날짜를 기본값으로 설정
  });

  // 사용 가능한 캠페인 목록 상태
  const [availableCampaigns, setAvailableCampaigns] = useState<string[]>([]);

  // API 연동 (localStorage fallback)
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let allLeads: Lead[];

      // 1. 먼저 백엔드 API 호출 시도
      try {
        const response = await api.get('/api/leads', {
          params: {
            page: page + 1, // Laravel은 1-based pagination
            per_page: rowsPerPage,
            search: searchTerm || undefined,
            status: appliedFilters.status.length > 0 ? appliedFilters.status.join(',') : undefined,
            channel: appliedFilters.channel.length > 0 ? appliedFilters.channel.join(',') : undefined,
            assignee: appliedFilters.assignee.length > 0 ? appliedFilters.assignee.join(',') : undefined,
            sla_status: appliedFilters.slaStatus.length > 0 ? appliedFilters.slaStatus.join(',') : undefined,
            score_min: appliedFilters.scoreRange[0] !== 0 ? appliedFilters.scoreRange[0] : undefined,
            score_max: appliedFilters.scoreRange[1] !== 100 ? appliedFilters.scoreRange[1] : undefined,
            date_from: appliedFilters.dateRange.start || undefined,
            date_to: appliedFilters.dateRange.end || undefined,
            sort: 'created_at',
            order: 'desc', // 최신순 정렬
          }
        });

        // API 성공 시
        if (response.data && response.data.data) {
          allLeads = response.data.data;
          setTotalLeads(response.data.total || allLeads.length);
          setLeads(allLeads);
          setLoading(false);
          return; // API 성공하면 여기서 종료
        }
      } catch (apiError) {
        console.warn('API 호출 실패, localStorage fallback 사용:', apiError);
        // API 실패 시 localStorage로 fallback
      }

      // 2. API 실패 시 localStorage 사용 (기존 로직)
      // Mock leads data (default data)
      const mockLeads: Lead[] = [
        {
          lead_id: 'lead_001',
          name: '김환자',
          primary_phone: '010-1234-****',
          status: '상담완료',
          utm_source: 'Google Ads',
          last_contact_at: '2025-09-29T09:00:00Z',
          score: 85,
          assignee_name: '김상담',
          sla_status: '정상',
          communication_count: 3
        },
        {
          lead_id: 'lead_002',
          name: '이환자',
          primary_phone: '010-5678-****',
          status: '미팅완료',
          utm_source: 'Facebook Ads',
          last_contact_at: '2025-09-29T11:00:00Z',
          score: 78,
          assignee_name: '이상담',
          sla_status: '경고',
          communication_count: 5
        },
        {
          lead_id: 'lead_003',
          name: '박환자',
          primary_phone: '010-9012-****',
          status: '상담완료',
          utm_source: '네이버',
          last_contact_at: '2025-09-29T07:00:00Z',
          score: 92,
          assignee_name: '박상담',
          sla_status: '정상',
          communication_count: 1
        },
        {
          lead_id: 'lead_004',
          name: '최환자',
          primary_phone: '010-3456-****',
          status: '계약완료',
          utm_source: 'Instagram',
          last_contact_at: '2025-09-28T16:00:00Z',
          score: 95,
          assignee_name: '김상담',
          sla_status: '완료',
          communication_count: 8
        },
        {
          lead_id: 'lead_005',
          name: '정환자',
          primary_phone: '010-7890-****',
          status: '미팅완료',
          utm_source: 'YouTube',
          last_contact_at: '2025-09-29T13:30:00Z',
          score: 72,
          assignee_name: '이상담',
          sla_status: '정상',
          communication_count: 4
        },
        {
          lead_id: 'lead_006',
          name: '강환자',
          primary_phone: '010-2468-****',
          status: '상담완료',
          utm_source: 'Google Ads',
          last_contact_at: '2025-09-29T14:15:00Z',
          score: 88,
          assignee_name: '박상담',
          sla_status: '정상',
          communication_count: 2
        },
        {
          lead_id: 'lead_007',
          name: '조환자',
          primary_phone: '010-1357-****',
          status: '미팅완료',
          utm_source: 'Facebook Ads',
          last_contact_at: '2025-09-29T08:45:00Z',
          score: 83,
          assignee_name: '김상담',
          sla_status: '경고',
          communication_count: 6
        },
        {
          lead_id: 'lead_008',
          name: '윤환자',
          primary_phone: '010-8642-****',
          status: '계약완료',
          utm_source: '네이버',
          last_contact_at: '2025-09-28T17:20:00Z',
          score: 91,
          assignee_name: '이상담',
          sla_status: '완료',
          communication_count: 7
        },
        {
          lead_id: 'lead_009',
          name: '임환자',
          primary_phone: '010-9753-****',
          status: '상담완료',
          utm_source: 'Instagram',
          last_contact_at: '2025-09-29T12:10:00Z',
          score: 76,
          assignee_name: '박상담',
          sla_status: '정상',
          communication_count: 2
        },
        {
          lead_id: 'lead_010',
          name: '한환자',
          primary_phone: '010-1470-****',
          status: '미팅완료',
          utm_source: 'YouTube',
          last_contact_at: '2025-09-29T15:25:00Z',
          score: 89,
          assignee_name: '김상담',
          sla_status: '정상',
          communication_count: 5
        },
        {
          lead_id: 'lead_011',
          name: '오환자',
          primary_phone: '010-2581-****',
          status: '상담완료',
          utm_source: 'Google Ads',
          last_contact_at: '2025-09-29T10:30:00Z',
          score: 94,
          assignee_name: '이상담',
          sla_status: '정상',
          communication_count: 1
        },
        {
          lead_id: 'lead_012',
          name: '서환자',
          primary_phone: '010-3692-****',
          status: '계약완료',
          utm_source: 'Facebook Ads',
          last_contact_at: '2025-09-28T14:45:00Z',
          score: 87,
          assignee_name: '박상담',
          sla_status: '완료',
          communication_count: 9
        }
      ];

      if (typeof window !== 'undefined') {
        const storedLeads = localStorage.getItem('mcrm_leads');

        if (storedLeads) {
          allLeads = JSON.parse(storedLeads);
        } else {
          // Store initial data to localStorage
          localStorage.setItem('mcrm_leads', JSON.stringify(mockLeads));
          allLeads = mockLeads;
        }
      } else {
        // SSR 환경에서는 기본 Mock 데이터 사용
        allLeads = mockLeads;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Apply search filter if searchTerm exists
      let filteredLeads = allLeads;
      if (searchTerm) {
        filteredLeads = filteredLeads.filter(lead => {
          const utmSourceStr = Array.isArray(lead.utm_source)
            ? lead.utm_source.join(' ')
            : (lead.utm_source || '');

          return lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.primary_phone.includes(searchTerm) ||
            utmSourceStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.assignee_name.toLowerCase().includes(searchTerm.toLowerCase());
        });
      }

      // Apply filters
      if (appliedFilters.status.length > 0) {
        filteredLeads = filteredLeads.filter(lead => appliedFilters.status.includes(lead.status));
      }
      if (appliedFilters.channel.length > 0) {
        filteredLeads = filteredLeads.filter(lead => {
          const channels = Array.isArray(lead.utm_source) ? lead.utm_source : [lead.utm_source];
          return channels.some(channel => appliedFilters.channel.includes(channel));
        });
      }
      if (appliedFilters.assignee.length > 0) {
        filteredLeads = filteredLeads.filter(lead => appliedFilters.assignee.includes(lead.assignee_name));
      }
      if (appliedFilters.slaStatus.length > 0) {
        filteredLeads = filteredLeads.filter(lead => appliedFilters.slaStatus.includes(lead.sla_status));
      }
      if (appliedFilters.scoreRange[0] !== 0 || appliedFilters.scoreRange[1] !== 100) {
        filteredLeads = filteredLeads.filter(lead =>
          lead.score >= appliedFilters.scoreRange[0] && lead.score <= appliedFilters.scoreRange[1]
        );
      }
      if (appliedFilters.dateRange.start || appliedFilters.dateRange.end) {
        filteredLeads = filteredLeads.filter(lead => {
          const leadDate = new Date(lead.last_contact_at);
          const startDate = appliedFilters.dateRange.start ? new Date(appliedFilters.dateRange.start) : null;
          const endDate = appliedFilters.dateRange.end ? new Date(appliedFilters.dateRange.end) : null;

          if (startDate && endDate) {
            return leadDate >= startDate && leadDate <= endDate;
          } else if (startDate) {
            return leadDate >= startDate;
          } else if (endDate) {
            return leadDate <= endDate;
          }
          return true;
        });
      }

      // Sort by last_contact_at in descending order (newest first)
      filteredLeads.sort((a, b) => {
        const dateA = new Date(a.last_contact_at).getTime();
        const dateB = new Date(b.last_contact_at).getTime();
        return dateB - dateA; // 내림차순 정렬 (최신이 먼저)
      });

      // Simulate pagination
      const startIndex = page * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

      setLeads(paginatedLeads);
      setTotalLeads(filteredLeads.length);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, appliedFilters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // 클라이언트에서 assignees 업데이트
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAvailableAssignees(getAvailableAssignees());
    }
  }, [getAvailableAssignees]);

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
    setFilterDrawerOpen(true);
  }, []);

  const handleApplyFilters = useCallback((filters: FilterState) => {
    setAppliedFilters(filters);
    setPage(0); // 필터 적용 시 첫 페이지로 이동
  }, []);

  const handleExportClick = useCallback(() => {
    try {
      // localStorage에서 모든 리드 데이터 가져오기
      let allLeads: Lead[] = [];

      if (typeof window !== 'undefined') {
        const storedLeads = localStorage.getItem('mcrm_leads');
        if (storedLeads) {
          allLeads = JSON.parse(storedLeads);
        }
      }

      if (allLeads.length === 0) {
        alert('내보낼 리드가 없습니다.');
        return;
      }

      // CSV 헤더
      const headers = [
        '리드ID',
        '이름',
        '전화번호',
        '상태',
        '채널',
        '최근접점',
        '스코어',
        '우선순위',
        'C.C',
        '담당자',
        'SLA상태'
      ];

      // CSV 데이터 행 생성
      const csvRows = allLeads.map(lead => {
        const priorityInfo = getPriorityInfoFromScore(lead.score);
        const formattedDate = new Date(lead.last_contact_at).toLocaleString('ko-KR');

        return [
          lead.lead_id,
          lead.name,
          lead.primary_phone,
          lead.status,
          lead.utm_source,
          formattedDate,
          lead.score.toString(),
          priorityInfo.priority,
          lead.communication_count.toString(),
          lead.assignee_name,
          lead.sla_status
        ].map(field => `"${field}"`).join(',');
      });

      // CSV 문자열 생성 (UTF-8 BOM 추가로 한글 깨짐 방지)
      const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\n');

      // Blob 생성
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      // 다운로드 링크 생성
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      // 현재 날짜를 파일명에 포함
      const today = new Date().toISOString().split('T')[0];
      const filename = `leads_export_${today}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      // 다운로드 실행
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`CSV exported: ${allLeads.length} leads`);
    } catch (err) {
      console.error('CSV export failed:', err);
      alert('CSV 내보내기에 실패했습니다. 다시 시도해주세요.');
    }
  }, []);

  // 채널별 캠페인 목록 로드
  const loadCampaignsForChannel = useCallback((channel: string) => {
    if (typeof window !== 'undefined') {
      const storedCampaigns = localStorage.getItem('mcrm_campaign_costs');
      if (storedCampaigns) {
        const campaigns = JSON.parse(storedCampaigns);
        const channelCampaigns = campaigns
          .filter((c: any) => c.channel === channel)
          .map((c: any) => c.campaign);
        setAvailableCampaigns(channelCampaigns);

        // 첫 번째 캠페인을 기본값으로 설정
        if (channelCampaigns.length > 0) {
          setNewLead(prev => ({
            ...prev,
            utm_campaign: channelCampaigns[0]
          }));
        } else {
          setNewLead(prev => ({
            ...prev,
            utm_campaign: ''
          }));
        }
      } else {
        setAvailableCampaigns([]);
        setNewLead(prev => ({
          ...prev,
          utm_campaign: ''
        }));
      }
    }
  }, []);

  // 채널 관리 API에서 활성 채널 목록 가져오기
  const fetchChannels = useCallback(async () => {
    try {
      const response = await api.get('/api/channel-management/mappings');
      // active한 채널의 display_name만 추출
      const activeChannels = response.data
        .filter((mapping: any) => mapping.active)
        .map((mapping: any) => mapping.display_name);
      setAvailableChannels(activeChannels);
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      // 실패 시 기본 채널 목록 사용
      setAvailableChannels(['Google Ads', 'Facebook Ads', 'Naver Ads', 'Instagram', 'YouTube']);
    }
  }, []);

  // 컴포넌트 마운트 시 채널 목록 로드
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleNewLeadChange = useCallback((field: keyof NewLead, value: string | number) => {
    setNewLead(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 인입경로 체크박스 토글
  const handleToggleChannel = useCallback((channel: string) => {
    setNewLead(prev => {
      const currentChannels = prev.utm_source;
      if (currentChannels.includes(channel)) {
        return {
          ...prev,
          utm_source: currentChannels.filter(c => c !== channel)
        };
      } else {
        return {
          ...prev,
          utm_source: [...currentChannels, channel]
        };
      }
    });
  }, []);

  // 문의서비스 체크박스 토글
  const handleToggleService = useCallback((service: string) => {
    setNewLead(prev => {
      const currentServices = prev.treatment;
      if (currentServices.includes(service)) {
        return {
          ...prev,
          treatment: currentServices.filter(s => s !== service)
        };
      } else {
        return {
          ...prev,
          treatment: [...currentServices, service]
        };
      }
    });
  }, []);

  const handleAddLeadClick = useCallback(() => {
    // 모달을 열 때마다 최신 담당자 목록 업데이트
    setAvailableAssignees(getAvailableAssignees());
    setAddLeadModalOpen(true);
  }, [getAvailableAssignees]);

  const handleCloseAddLeadModal = useCallback(() => {
    setAddLeadModalOpen(false);
    setNewLead({
      name: '',
      primary_phone: '',
      status: '신규',
      utm_source: [], // 인입경로 초기값 (빈 배열)
      utm_campaign: '',
      score: 50,
      assignee_name: user?.name || '김상담', // 현재 로그인된 사용자를 기본값으로 설정
      revenue: 0,
      treatment: [], // 문의서비스 초기값 (빈 배열)
      consultation_notes: '',
      inquiry_date: new Date().toISOString().split('T')[0] // 오늘 날짜를 기본값으로 설정
    });
    setAvailableCampaigns([]);
  }, [user?.name]);

  const handleSaveNewLead = useCallback(async () => {
    try {
      setLoading(true);

      // 1. 먼저 백엔드 API 호출 시도
      try {
        // 상태 값을 백엔드 형식으로 변환
        const statusMap: { [key: string]: string } = {
          '신규': 'new',
          '상담완료': 'contacted',
          '미팅완료': 'converted',
          '계약완료': 'closed',
          '보류': 'pending',
          '거절': 'rejected',
        };

        const response = await api.post('/api/leads', {
          name: newLead.name,
          primary_phone: newLead.primary_phone,
          status: statusMap[newLead.status] || 'new',
          score: newLead.score,
          memo: [
            newLead.consultation_notes,
            newLead.treatment.length > 0 ? `문의서비스: ${newLead.treatment.join(', ')}` : '',
            newLead.inquiry_date ? `문의날짜: ${newLead.inquiry_date}` : '',
          ].filter(Boolean).join('\n'),
          // assigned_user_id는 일단 null (사용자 매핑 필요)
          // utm_source는 Visit을 통해 연결되어야 하므로 일단 생략
        });

        // API 성공 시
        if (response.data) {
          console.log('New lead created via API:', response.data);

          // 모달 닫기
          handleCloseAddLeadModal();

          // 첫 페이지로 이동 (새로 등록된 항목 확인을 위해)
          if (page === 0) {
            // 이미 첫 페이지면 수동으로 새로고침
            fetchLeads();
          } else {
            // 다른 페이지면 첫 페이지로 이동 (useEffect가 자동으로 fetchLeads 호출)
            setPage(0);
          }

          alert('새 리드가 성공적으로 등록되었습니다!');
          return; // API 성공하면 여기서 종료
        }
      } catch (apiError: any) {
        console.error('❌ API 호출 실패:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message,
        });

        // 401 에러인 경우 로그인 페이지로 리다이렉트
        if (apiError.response?.status === 401) {
          alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
          if (typeof window !== 'undefined') {
            window.location.href = '/login?redirect=/leads';
          }
          return;
        }

        // 400 에러 (Validation 오류)
        if (apiError.response?.status === 400 || apiError.response?.status === 422) {
          const errors = apiError.response?.data?.errors;
          const message = apiError.response?.data?.message;
          console.error('📝 Validation 오류:', { message, errors });
          alert(`입력 오류: ${message || '입력값을 확인해주세요'}`);
          return;
        }

        // 다른 에러는 localStorage로 fallback
        console.warn('⚠️ localStorage fallback 사용');
      }

      // 2. API 실패 시 localStorage 사용 (기존 로직)
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      let existingLeads: Lead[] = [];

      if (typeof window !== 'undefined') {
        const storedLeads = localStorage.getItem('mcrm_leads');
        if (storedLeads) {
          existingLeads = JSON.parse(storedLeads);
        }
      }

      const newLeadId = `lead_${String(existingLeads.length + 1).padStart(3, '0')}`;

      const createdLead: Lead = {
        lead_id: newLeadId,
        name: newLead.name,
        primary_phone: newLead.primary_phone.includes('****')
          ? newLead.primary_phone
          : newLead.primary_phone.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3'),
        status: newLead.status,
        utm_source: newLead.utm_source,
        utm_campaign: newLead.utm_campaign,
        last_contact_at: newLead.inquiry_date
          ? new Date(newLead.inquiry_date).toISOString()
          : new Date().toISOString(),
        score: newLead.score,
        assignee_name: newLead.assignee_name,
        sla_status: '정상',
        communication_count: 0,
        revenue: newLead.revenue,
        treatment: newLead.treatment,
        consultation_notes: newLead.consultation_notes
      };

      console.log('New lead created (localStorage):', createdLead);

      const updatedLeads = [...existingLeads, createdLead];

      if (typeof window !== 'undefined') {
        localStorage.setItem('mcrm_leads', JSON.stringify(updatedLeads));
      }

      // 모달 닫기
      handleCloseAddLeadModal();

      // 첫 페이지로 이동 (새로 등록된 항목 확인을 위해)
      if (page === 0) {
        // 이미 첫 페이지면 수동으로 새로고침
        fetchLeads();
      } else {
        // 다른 페이지면 첫 페이지로 이동 (useEffect가 자동으로 fetchLeads 호출)
        setPage(0);
      }

      alert('새 리드가 성공적으로 등록되었습니다! (로컬 저장)');
    } catch (err) {
      console.error('Failed to create new lead:', err);
      alert('리드 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [newLead, fetchLeads, handleCloseAddLeadModal, page]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        문의 목록
      </Typography>

      {loading && <Typography>문의 불러오는 중...</Typography>}
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

      {/* 새 문의 등록 모달 */}
      <Dialog open={addLeadModalOpen} onClose={handleCloseAddLeadModal} maxWidth="sm" fullWidth>
        <DialogTitle>새 문의 등록</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="업체명"
              value={newLead.name}
              onChange={(e) => handleNewLeadChange('name', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="전화번호"
              value={newLead.primary_phone}
              onChange={(e) => handleNewLeadChange('primary_phone', e.target.value)}
              placeholder="010-1234-5678"
              fullWidth
              required
            />
            <TextField
              label="문의 날짜"
              type="date"
              value={newLead.inquiry_date}
              onChange={(e) => handleNewLeadChange('inquiry_date', e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              helperText="문의가 들어온 날짜를 선택하세요"
            />
            <FormControl fullWidth>
              <InputLabel>상태</InputLabel>
              <Select
                value={newLead.status}
                label="상태"
                onChange={(e) => handleNewLeadChange('status', e.target.value)}
              >
                <MenuItem value="신규">신규</MenuItem>
                <MenuItem value="상담완료">상담완료</MenuItem>
                <MenuItem value="미팅완료">미팅완료</MenuItem>
                <MenuItem value="계약완료">계약완료</MenuItem>
                <MenuItem value="보류">보류</MenuItem>
                <MenuItem value="거절">거절</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>인입경로 (다중 선택 가능)</Typography>
              <FormGroup>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {availableChannels.map((channel) => (
                    <FormControlLabel
                      key={channel}
                      control={
                        <Checkbox
                          checked={newLead.utm_source.includes(channel)}
                          onChange={() => handleToggleChannel(channel)}
                        />
                      }
                      label={channel}
                    />
                  ))}
                </Box>
              </FormGroup>
            </Box>
            <TextField
              label="스코어 (우선순위 자동 계산)"
              type="number"
              value={newLead.score}
              onChange={(e) => handleNewLeadChange('score', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 100 }}
              fullWidth
              helperText="0-50: 일반응대 | 51-70: 우선 응대 | 71-85: 매우 우선응대 | 86-100: 최우선 응대"
            />
            <FormControl fullWidth>
              <InputLabel>담당자</InputLabel>
              <Select
                value={newLead.assignee_name}
                label="담당자"
                onChange={(e) => handleNewLeadChange('assignee_name', e.target.value)}
              >
                {availableAssignees.map((assignee) => (
                  <MenuItem key={assignee.user_id} value={assignee.name}>
                    {assignee.name} ({assignee.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>문의서비스 (다중 선택 가능)</Typography>
              <FormGroup>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {['CI(간판)', '온라인마케팅', '오프라인마케팅', '웹사이트', 'LED', '인쇄물디자인'].map((service) => (
                    <FormControlLabel
                      key={service}
                      control={
                        <Checkbox
                          checked={newLead.treatment.includes(service)}
                          onChange={() => handleToggleService(service)}
                        />
                      }
                      label={service}
                    />
                  ))}
                </Box>
              </FormGroup>
            </Box>
            <TextField
              label="예상 매출 (원)"
              type="number"
              value={newLead.revenue}
              onChange={(e) => handleNewLeadChange('revenue', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
              fullWidth
              helperText="예상되는 매출 금액을 입력하세요"
            />
            <TextField
              label="상담 메모"
              value={newLead.consultation_notes}
              onChange={(e) => handleNewLeadChange('consultation_notes', e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="상담 내용이나 특이사항을 입력하세요"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddLeadModal}>취소</Button>
          <Button
            onClick={handleSaveNewLead}
            variant="contained"
            disabled={!newLead.name || !newLead.primary_phone}
          >
            등록
          </Button>
        </DialogActions>
      </Dialog>

      {/* 필터 드로어 */}
      <LeadFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApplyFilters={handleApplyFilters}
        availableStatuses={['문의중', '상담완료', '미팅완료', '계약완료', '보류']}
        availableChannels={availableChannels}
        availableAssignees={availableAssignees}
      />
    </Box>
  );
}