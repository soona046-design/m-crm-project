'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Card, CardContent, Chip, TextField, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Collapse } from '@mui/material';
import api from '@/lib/axios';

interface ChannelPerformanceData {
  channel: string;
  category_code?: string;
  category_name?: string;
  category_color?: string;
  leads: number;
  appointments: number;
  cost: number; // 총 광고 비용
  revenue: number; // 총 수익
  cpl: number; // Cost Per Lead (리드당 비용)
  cpa: number; // Cost Per Appointment (예약당 비용)
  conversionRate: number; // 전환율 (예약/리드 * 100)
  roi: number; // ROI % ((수익-비용)/비용 * 100)
  roas: number; // ROAS (수익/비용)
}

interface ChannelDetailData {
  channel: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  leads: number;
  cvr: number;
  tickets: number;
  appointments: number;
  contracts: number;
  conversionRate: number;
  cost: number;
  revenue: number;
  cpa: number;
  roi: number;
}

interface CategoryPerformanceData {
  category_code: string; // 'online', 'offline', 'db'
  category_name: string; // '온라인', '오프라인', 'DB'
  category_color: string; // '#2196F3', '#FF9800', '#4CAF50'
  impressions: number;
  clicks: number;
  ctr: number; // 클릭률
  leads: number;
  cvr: number; // 전환율
  tickets: number; // 상담 수
  appointments: number; // 예약 수
  contracts: number; // 계약 수
  conversionRate: number; // 리드 → 예약 전환율
  cost: number;
  revenue: number;
  cpc: number; // Cost Per Click
  cpa: number; // Cost Per Acquisition
  roi: number; // ROI %
  channels?: ChannelDetailData[]; // 세부 채널 데이터
}

interface PivotTableData {
  id: string;
  channel: string;
  campaign: string;
  year: number;
  month: number;
  week: number;
  leads: number;
  appointments: number;
  cost: number;
  revenue: number;
  cpl: number;
  cpa: number;
  conversionRate: number;
  roi: number;
  roas: number;
  source?: 'api' | 'manual'; // API 데이터 vs 수동 입력 데이터
  startDate?: string; // 캠페인 시작일 (YYYY-MM-DD)
  endDate?: string; // 캠페인 종료일 (YYYY-MM-DD)
}

interface MonthlyData {
  yearMonth: string; // 'YYYY-MM' 형식
  year: number;
  month: number;
  weeks: WeekData[];
  totalLeads: number;
  totalAppointments: number;
  totalCost: number;
  totalRevenue: number;
  cpl: number;
  cpa: number;
  conversionRate: number;
  roi: number;
  roas: number;
}

interface WeekData {
  weekNumber: number; // 1~5 (해당 월의 몇번째 주)
  weekLabel: string; // "첫번째주", "두번째주"...
  dateRange: string; // "11/1-11/7"
  campaigns: CampaignData[];
  totalLeads: number;
  totalAppointments: number;
  totalCost: number;
  totalRevenue: number;
  cpl: number;
  cpa: number;
  conversionRate: number;
  roi: number;
  roas: number;
}

interface CampaignData {
  id: string;
  channel: string;
  campaign: string;
  leads: number;
  appointments: number;
  cost: number;
  revenue: number;
  cpl: number;
  cpa: number;
  conversionRate: number;
  roi: number;
  roas: number;
  source?: 'api' | 'manual'; // API 데이터 vs 수동 입력 데이터
  startDate?: string; // 캠페인 시작일 (YYYY-MM-DD)
  endDate?: string; // 캠페인 종료일 (YYYY-MM-DD)
}

interface SummaryMetrics {
  totalCost: number;
  totalRevenue: number;
  totalLeads: number;
  totalAppointments: number;
  averageROI: number;
  averageConversionRate: number;
}

export default function ChannelPivotDashboardPage() {
  // 날짜 범위 state (기본값: 최근 3개월)
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 2); // 3개월 전
    date.setDate(1); // 해당 월의 첫날
    return date;
  };

  const [startDate, setStartDate] = useState<Date | null>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [channelPerformanceData, setChannelPerformanceData] = useState<ChannelPerformanceData[]>([]);
  const [categoryPerformanceData, setCategoryPerformanceData] = useState<CategoryPerformanceData[]>([]);
  const [pivotTableData, setPivotTableData] = useState<PivotTableData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetrics>({
    totalCost: 0,
    totalRevenue: 0,
    totalLeads: 0,
    totalAppointments: 0,
    averageROI: 0,
    averageConversionRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 인라인 편집 상태
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // 새 캠페인 추가 다이얼로그 상태
  const [addCampaignDialogOpen, setAddCampaignDialogOpen] = useState(false);
  // 오늘 날짜를 YYYY-MM-DD 형식으로 반환
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [newCampaign, setNewCampaign] = useState({
    channel: '',
    campaign: '',
    leads: 0,
    appointments: 0,
    cost: 0,
    revenue: 0,
    startDate: getTodayDate(),
    endDate: getTodayDate(),
  });

  // 채널 카테고리 및 매핑 데이터
  const [channelCategories, setChannelCategories] = useState<any[]>([]);
  const [channelMappings, setChannelMappings] = useState<any[]>([]);
  const [selectedCategoryForCampaign, setSelectedCategoryForCampaign] = useState<string>('');

  // ROI 계산 헬퍼 함수
  const calculateROI = (revenue: number, cost: number): number => {
    if (cost === 0) return 0;
    return ((revenue - cost) / cost) * 100;
  };

  const calculateROAS = (revenue: number, cost: number): number => {
    if (cost === 0) return 0;
    return revenue / cost;
  };

  const calculateConversionRate = (appointments: number, leads: number): number => {
    if (leads === 0) return 0;
    return (appointments / leads) * 100;
  };

  // 인라인 편집 핸들러
  const handleCellClick = (id: string, field: string, currentValue: number, source?: 'api' | 'manual') => {
    // API 데이터는 편집 불가
    if (source === 'api') {
      alert('API에서 가져온 데이터는 수정할 수 없습니다.');
      return;
    }
    setEditingCell({ id, field });
    setEditValue(currentValue.toString());
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    const numericValue = parseFloat(editValue);
    if (isNaN(numericValue)) {
      alert('올바른 숫자를 입력해주세요.');
      return;
    }

    // pivotTableData 업데이트
    const updatedData = pivotTableData.map(row => {
      if (row.id === editingCell.id) {
        const updated = { ...row, [editingCell.field]: numericValue };
        // 관련 지표 재계산
        updated.cpl = updated.leads > 0 ? Math.round(updated.cost / updated.leads) : 0;
        updated.cpa = updated.appointments > 0 ? Math.round(updated.cost / updated.appointments) : 0;
        updated.conversionRate = calculateConversionRate(updated.appointments, updated.leads);
        updated.roi = calculateROI(updated.revenue, updated.cost);
        updated.roas = calculateROAS(updated.revenue, updated.cost);
        return updated;
      }
      return row;
    });

    setPivotTableData(updatedData);

    // localStorage에 수동 캠페인 업데이트 (수정된 데이터가 manual인 경우)
    if (typeof window !== 'undefined') {
      const manualCampaigns = updatedData.filter(item => item.source === 'manual');
      localStorage.setItem('mcrm_manual_campaigns', JSON.stringify(manualCampaigns));
      console.log('💾 Manual campaigns updated in localStorage after edit');
    }

    // 채널별 집계 재계산
    recalculateChannelData(updatedData);

    setEditingCell(null);
    setEditValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // 채널별 데이터 재계산
  const recalculateChannelData = (campaignData: PivotTableData[]) => {
    const channelMap = new Map<string, ChannelPerformanceData>();

    campaignData.forEach(campaign => {
      if (!channelMap.has(campaign.channel)) {
        // 기존 channelPerformanceData에서 카테고리 정보 찾기
        const existingChannel = channelPerformanceData.find(ch => ch.channel === campaign.channel);

        channelMap.set(campaign.channel, {
          channel: campaign.channel,
          // 카테고리 정보 보존
          category_code: existingChannel?.category_code,
          category_name: existingChannel?.category_name,
          category_color: existingChannel?.category_color,
          leads: 0,
          appointments: 0,
          cost: 0,
          revenue: 0,
          cpl: 0,
          cpa: 0,
          conversionRate: 0,
          roi: 0,
          roas: 0,
        });
      }

      const channelData = channelMap.get(campaign.channel)!;
      channelData.leads += campaign.leads;
      channelData.appointments += campaign.appointments;
      channelData.cost += campaign.cost;
      channelData.revenue += campaign.revenue;
    });

    const updatedChannelData = Array.from(channelMap.values()).map(channel => ({
      ...channel,
      cpl: channel.leads > 0 ? Math.round(channel.cost / channel.leads) : 0,
      cpa: channel.appointments > 0 ? Math.round(channel.cost / channel.appointments) : 0,
      conversionRate: calculateConversionRate(channel.appointments, channel.leads),
      roi: calculateROI(channel.revenue, channel.cost),
      roas: calculateROAS(channel.revenue, channel.cost),
    }));

    setChannelPerformanceData(updatedChannelData);

    // 요약 지표 재계산
    const totalCost = updatedChannelData.reduce((sum, ch) => sum + ch.cost, 0);
    const totalRevenue = updatedChannelData.reduce((sum, ch) => sum + ch.revenue, 0);
    const totalLeads = updatedChannelData.reduce((sum, ch) => sum + ch.leads, 0);
    const totalAppointments = updatedChannelData.reduce((sum, ch) => sum + ch.appointments, 0);

    setSummaryMetrics({
      totalCost,
      totalRevenue,
      totalLeads,
      totalAppointments,
      averageROI: calculateROI(totalRevenue, totalCost),
      averageConversionRate: calculateConversionRate(totalAppointments, totalLeads),
    });
  };

  // 주차 레이블 생성 헬퍼 함수
  const getWeekLabel = (weekNumber: number): string => {
    return `${weekNumber}주차`;
  };

  // 날짜 범위 계산 헬퍼 함수
  const getDateRange = (year: number, month: number, weekNumber: number): string => {
    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = Math.min(weekNumber * 7, new Date(year, month, 0).getDate());
    return `${month}/${startDay}-${month}/${endDay}`;
  };

  // 월별 데이터 그룹화 (3단계 구조: 월 → 주 → 캠페인)
  const groupByMonth = (campaignData: PivotTableData[]): MonthlyData[] => {
    const monthlyMap = new Map<string, MonthlyData>();

    campaignData.forEach(campaign => {
      const yearMonth = `${campaign.year}-${String(campaign.month).padStart(2, '0')}`;

      if (!monthlyMap.has(yearMonth)) {
        monthlyMap.set(yearMonth, {
          yearMonth,
          year: campaign.year,
          month: campaign.month,
          weeks: [],
          totalLeads: 0,
          totalAppointments: 0,
          totalCost: 0,
          totalRevenue: 0,
          cpl: 0,
          cpa: 0,
          conversionRate: 0,
          roi: 0,
          roas: 0,
        });
      }

      const monthData = monthlyMap.get(yearMonth)!;

      // 주차별로 그룹화
      let weekData = monthData.weeks.find(w => w.weekNumber === campaign.week);
      if (!weekData) {
        weekData = {
          weekNumber: campaign.week,
          weekLabel: getWeekLabel(campaign.week),
          dateRange: getDateRange(campaign.year, campaign.month, campaign.week),
          campaigns: [],
          totalLeads: 0,
          totalAppointments: 0,
          totalCost: 0,
          totalRevenue: 0,
          cpl: 0,
          cpa: 0,
          conversionRate: 0,
          roi: 0,
          roas: 0,
        };
        monthData.weeks.push(weekData);
      }

      // 캠페인 데이터 추가
      weekData.campaigns.push({
        id: campaign.id,
        channel: campaign.channel,
        campaign: campaign.campaign,
        leads: campaign.leads,
        appointments: campaign.appointments,
        cost: campaign.cost,
        revenue: campaign.revenue,
        cpl: campaign.cpl,
        cpa: campaign.cpa,
        conversionRate: campaign.conversionRate,
        roi: campaign.roi,
        roas: campaign.roas,
        source: campaign.source, // source 필드 전달
      });

      // 주차 집계
      weekData.totalLeads += campaign.leads;
      weekData.totalAppointments += campaign.appointments;
      weekData.totalCost += campaign.cost;
      weekData.totalRevenue += campaign.revenue;

      // 월 집계
      monthData.totalLeads += campaign.leads;
      monthData.totalAppointments += campaign.appointments;
      monthData.totalCost += campaign.cost;
      monthData.totalRevenue += campaign.revenue;
    });

    // 월별/주별 지표 재계산
    const result = Array.from(monthlyMap.values()).map(month => {
      // 주별 지표 계산
      month.weeks = month.weeks.map(week => ({
        ...week,
        cpl: week.totalLeads > 0 ? Math.round(week.totalCost / week.totalLeads) : 0,
        cpa: week.totalAppointments > 0 ? Math.round(week.totalCost / week.totalAppointments) : 0,
        conversionRate: calculateConversionRate(week.totalAppointments, week.totalLeads),
        roi: calculateROI(week.totalRevenue, week.totalCost),
        roas: calculateROAS(week.totalRevenue, week.totalCost),
      })).sort((a, b) => a.weekNumber - b.weekNumber);

      // 월별 지표 계산
      return {
        ...month,
        cpl: month.totalLeads > 0 ? Math.round(month.totalCost / month.totalLeads) : 0,
        cpa: month.totalAppointments > 0 ? Math.round(month.totalCost / month.totalAppointments) : 0,
        conversionRate: calculateConversionRate(month.totalAppointments, month.totalLeads),
        roi: calculateROI(month.totalRevenue, month.totalCost),
        roas: calculateROAS(month.totalRevenue, month.totalCost),
      };
    });

    return result.sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
  };

  // 월 확장/축소 토글
  const toggleMonth = (yearMonth: string) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(yearMonth)) {
        newSet.delete(yearMonth);
      } else {
        newSet.add(yearMonth);
      }
      return newSet;
    });
  };

  // 주 확장/축소 토글
  const toggleWeek = (weekKey: string) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekKey)) {
        newSet.delete(weekKey);
      } else {
        newSet.add(weekKey);
      }
      return newSet;
    });
  };

  // 카테고리 확장/축소 토글
  const toggleCategory = (categoryCode: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryCode)) {
        newSet.delete(categoryCode);
      } else {
        newSet.add(categoryCode);
      }
      return newSet;
    });
  };

  // 새 캠페인 추가 핸들러
  const handleAddCampaign = () => {
    if (!newCampaign.channel || !newCampaign.campaign) {
      alert('채널과 캠페인명을 입력해주세요.');
      return;
    }

    if (!newCampaign.startDate || !newCampaign.endDate) {
      alert('캠페인 기간을 입력해주세요.');
      return;
    }

    // 시작일을 기준으로 year, month, week 계산
    const startDate = new Date(newCampaign.startDate);
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;
    const day = startDate.getDate();

    // 월 내부 주차 계산 (1-7일: 1주차, 8-14일: 2주차, ...)
    const week = Math.ceil(day / 7);

    const campaign: PivotTableData = {
      id: `campaign_${Date.now()}`,
      channel: newCampaign.channel,
      campaign: newCampaign.campaign,
      year,
      month,
      week,
      leads: newCampaign.leads,
      appointments: newCampaign.appointments,
      cost: newCampaign.cost,
      revenue: newCampaign.revenue,
      cpl: newCampaign.leads > 0 ? Math.round(newCampaign.cost / newCampaign.leads) : 0,
      cpa: newCampaign.appointments > 0 ? Math.round(newCampaign.cost / newCampaign.appointments) : 0,
      conversionRate: calculateConversionRate(newCampaign.appointments, newCampaign.leads),
      roi: calculateROI(newCampaign.revenue, newCampaign.cost),
      roas: calculateROAS(newCampaign.revenue, newCampaign.cost),
      source: 'manual', // 수동으로 추가한 데이터는 편집 가능
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate,
    };

    const updatedData = [...pivotTableData, campaign];
    setPivotTableData(updatedData);

    // localStorage에 수동 캠페인 저장
    if (typeof window !== 'undefined') {
      const manualCampaigns = updatedData.filter(item => item.source === 'manual');
      localStorage.setItem('mcrm_manual_campaigns', JSON.stringify(manualCampaigns));
      console.log('💾 Manual campaign saved to localStorage');
    }

    // 채널별 집계 및 월별 데이터 재계산
    recalculateChannelData(updatedData);
    setMonthlyData(groupByMonth(updatedData));

    // 다이얼로그 닫고 초기화
    setAddCampaignDialogOpen(false);
    setNewCampaign({
      channel: '',
      campaign: '',
      leads: 0,
      appointments: 0,
      cost: 0,
      revenue: 0,
      startDate: getTodayDate(),
      endDate: getTodayDate(),
    });

    alert('캠페인이 추가되었습니다.');
  };

  // 캠페인 삭제 핸들러
  const handleDeleteCampaign = (id: string) => {
    if (!confirm('이 캠페인을 삭제하시겠습니까?')) {
      return;
    }

    const updatedData = pivotTableData.filter(row => row.id !== id);
    setPivotTableData(updatedData);

    // localStorage에서 수동 캠페인 업데이트
    if (typeof window !== 'undefined') {
      const manualCampaigns = updatedData.filter(item => item.source === 'manual');
      localStorage.setItem('mcrm_manual_campaigns', JSON.stringify(manualCampaigns));
      console.log('💾 Manual campaigns updated in localStorage');
    }

    // 채널별 집계 및 월별 데이터 재계산
    recalculateChannelData(updatedData);
    setMonthlyData(groupByMonth(updatedData));

    alert('캠페인이 삭제되었습니다.');
  };

  // TODO: 지점 필터링 등 구현
  const fetchChannelData = useCallback(async () => {
    console.log('fetchChannelData called');
    setLoading(true);
    setError(null);
    try {
      // 날짜 범위 설정 (state에서 가져옴)
      const startDateStr = startDate ? startDate.toISOString().split('T')[0] : new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0];
      const endDateStr = endDate ? endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      console.log('Fetching from backend API', { startDate: startDateStr, endDate: endDateStr });

      // 백엔드 API 호출
      const response = await api.get('/api/dashboards/channel-pivot', {
        params: { startDate: startDateStr, endDate: endDateStr }
      });

      if (response.data && response.data.pivotTable && response.data.pivotTable.length > 0) {
        console.log('✅ Backend API response received', response.data);

        // 카테고리 성과 데이터 처리
        if (response.data.categoryPerformance) {
          setCategoryPerformanceData(response.data.categoryPerformance);
          console.log('📊 Category Performance Data:', response.data.categoryPerformance);
        }

        // 채널 성과 데이터 처리 (카테고리 정보 포함)
        if (response.data.channelPerformance && response.data.channelPerformance.length > 0) {
          setChannelPerformanceData(response.data.channelPerformance);
          console.log('📊 Channel Performance Data:', response.data.channelPerformance);
        }

        const backendPivotTable = response.data.pivotTable;

        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const transformedPivotTable = backendPivotTable.map((item: any, index: number) => {
          const now = new Date();
          return {
            id: item.id || `backend_${index}`,
            channel: item.channel || '알 수 없음',
            campaign: item.campaign || '알 수 없음',
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            week: Math.ceil(now.getDate() / 7), // 현재 날짜 기준 주차
            leads: item.leads || 0,
            appointments: item.appointments || 0,
            cost: item.cpa * item.leads || 0, // cpa * leads로 cost 계산
            revenue: item.revenue || 0,
            cpl: item.cpa || 0,
            cpa: item.cpa || 0,
            conversionRate: calculateConversionRate(item.appointments, item.leads),
            roi: item.roi || 0,
            roas: item.roas || 0,
            source: 'api' as const, // API에서 가져온 데이터는 읽기 전용
          };
        });

        // localStorage에서 수동으로 추가한 캠페인 불러오기
        let manualCampaigns: PivotTableData[] = [];
        if (typeof window !== 'undefined') {
          const storedManualCampaigns = localStorage.getItem('mcrm_manual_campaigns');
          if (storedManualCampaigns) {
            manualCampaigns = JSON.parse(storedManualCampaigns);
            console.log('📦 Loaded manual campaigns from localStorage:', manualCampaigns.length);
          }
        }

        // API 데이터와 수동 캠페인 합치기
        const combinedData = [...transformedPivotTable, ...manualCampaigns];
        console.log('📊 Using combined data (API + Manual):', {
          api: transformedPivotTable.length,
          manual: manualCampaigns.length,
          total: combinedData.length
        });

        setPivotTableData(combinedData);

        // 백엔드에서 channelPerformance가 없으면 수동으로 계산
        if (!response.data.channelPerformance || response.data.channelPerformance.length === 0) {
          recalculateChannelData(combinedData);
        }

        setMonthlyData(groupByMonth(combinedData));

        // localStorage의 더미 데이터 삭제
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mcrm_campaign_costs_v2');
          localStorage.removeItem('mcrm_campaign_costs');
          console.log('🗑️ Dummy data removed from localStorage');
        }
      } else {
        console.warn('⚠️ No data received from API');

        // localStorage에서 수동으로 추가한 캠페인 불러오기
        let manualCampaigns: PivotTableData[] = [];
        if (typeof window !== 'undefined') {
          const storedManualCampaigns = localStorage.getItem('mcrm_manual_campaigns');
          if (storedManualCampaigns) {
            manualCampaigns = JSON.parse(storedManualCampaigns);
            console.log('📦 Loaded manual campaigns from localStorage (API empty):', manualCampaigns.length);
          }
        }

        if (manualCampaigns.length > 0) {
          // 수동 캠페인이 있으면 표시
          setPivotTableData(manualCampaigns);
          recalculateChannelData(manualCampaigns);
          setMonthlyData(groupByMonth(manualCampaigns));
        } else {
          // 아무 데이터도 없으면 빈 상태 표시
          setPivotTableData([]);
          setChannelPerformanceData([]);
          setSummaryMetrics({
            totalCost: 0,
            totalRevenue: 0,
            totalLeads: 0,
            totalAppointments: 0,
            averageROI: 0,
            averageConversionRate: 0,
          });
          setMonthlyData([]);
        }
      }

    } catch (err: any) {
      console.error("❌ Failed to fetch channel data:", err);
      setError(`API 연결에 실패했습니다: ${err.message || '알 수 없는 오류'}`);

      // 오류 시 빈 데이터 표시
      setPivotTableData([]);
      setChannelPerformanceData([]);
      setSummaryMetrics({
        totalCost: 0,
        totalRevenue: 0,
        totalLeads: 0,
        totalAppointments: 0,
        averageROI: 0,
        averageConversionRate: 0,
      });
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // 채널 카테고리 및 매핑 데이터 로드
  const fetchChannelManagementData = async () => {
    try {
      const [categoriesRes, mappingsRes] = await Promise.all([
        api.get('/api/channel-management/categories'),
        api.get('/api/channel-management/mappings'),
      ]);
      setChannelCategories(categoriesRes.data);
      setChannelMappings(mappingsRes.data);
    } catch (error) {
      console.error('Failed to fetch channel management data:', error);
    }
  };

  useEffect(() => {
    fetchChannelData();
    fetchChannelManagementData();
  }, [fetchChannelData]);

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return '₩0';
    return `₩${value.toLocaleString()}`;
  };
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return '0.0%';
    return `${value.toFixed(1)}%`;
  };
  const formatNumber = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    return value.toLocaleString();
  };

  // 파이 차트 색상
  const COLORS = ['#1E88E5', '#00897B', '#FFC107', '#E53935', '#9C27B0'];

  const getROIColor = (roi: number | undefined) => {
    if (roi === undefined || roi === null || isNaN(roi)) return '#9e9e9e'; // 회색
    if (roi >= 100) return '#4caf50'; // 녹색
    if (roi >= 50) return '#ff9800'; // 주황
    return '#f44336'; // 빨강
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        채널별 ROI 분석 대시보드
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        광고 비용, 리드 유입량, 전환율을 기반으로 채널별 ROI를 측정합니다
      </Typography>

      {/* 날짜 범위 선택 UI */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon sx={{ color: '#1976d2' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              조회 기간
            </Typography>
          </Box>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
            <DatePicker
              label="시작일"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { bgcolor: 'white', minWidth: 160 }
                }
              }}
            />
            <Typography variant="body1" sx={{ mx: 1 }}>
              ~
            </Typography>
            <DatePicker
              label="종료일"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { bgcolor: 'white', minWidth: 160 }
                }
              }}
            />
          </LocalizationProvider>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const today = new Date();
                const lastWeek = new Date();
                lastWeek.setDate(today.getDate() - 7);
                setStartDate(lastWeek);
                setEndDate(today);
              }}
            >
              최근 1주
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const today = new Date();
                const lastMonth = new Date();
                lastMonth.setMonth(today.getMonth() - 1);
                setStartDate(lastMonth);
                setEndDate(today);
              }}
            >
              최근 1개월
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const today = new Date();
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(today.getMonth() - 2);
                threeMonthsAgo.setDate(1);
                setStartDate(threeMonthsAgo);
                setEndDate(today);
              }}
            >
              최근 3개월
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const today = new Date();
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(today.getMonth() - 6);
                sixMonthsAgo.setDate(1);
                setStartDate(sixMonthsAgo);
                setEndDate(today);
              }}
            >
              최근 6개월
            </Button>
          </Box>
          {startDate && endDate && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}일간의 데이터
            </Typography>
          )}
        </Box>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && (
        <Grid container spacing={3}>
          {/* 요약 지표 카드 */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      총 광고비
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {formatCurrency(summaryMetrics.totalCost)}
                    </Typography>
                  </Box>
                  <AttachMoneyIcon sx={{ fontSize: 40, color: '#e53935' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      총 수익
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {formatCurrency(summaryMetrics.totalRevenue)}
                    </Typography>
                  </Box>
                  <AttachMoneyIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      평균 ROI
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1, color: getROIColor(summaryMetrics.averageROI) }}>
                      {formatPercentage(summaryMetrics.averageROI)}
                    </Typography>
                  </Box>
                  {summaryMetrics.averageROI >= 0 ? (
                    <TrendingUpIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 40, color: '#f44336' }} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      평균 전환율
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {formatPercentage(summaryMetrics.averageConversionRate)}
                    </Typography>
                  </Box>
                  <EventAvailableIcon sx={{ fontSize: 40, color: '#1e88e5' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 카테고리별 성과 카드 */}
          {categoryPerformanceData.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                채널 카테고리별 성과
              </Typography>
              {categoryPerformanceData.map((category, index) => (
                <Paper key={index} sx={{ mb: 2, borderLeft: `4px solid ${category.category_color}` }}>
                  {/* 카테고리 요약 카드 - 클릭 가능 */}
                  <Box
                    onClick={() => toggleCategory(category.category_code)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f5f5f5' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton size="small">
                          {expandedCategories.has(category.category_code) ? (
                            <KeyboardArrowDownIcon />
                          ) : (
                            <KeyboardArrowRightIcon />
                          )}
                        </IconButton>
                        <Typography variant="h6">
                          {category.category_name}
                        </Typography>
                        <Chip
                          label={formatPercentage(category.roi)}
                          sx={{
                            bgcolor: getROIColor(category.roi),
                            color: '#fff',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            문의
                          </Typography>
                          <Typography variant="h6">{category.leads}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            상담
                          </Typography>
                          <Typography variant="h6">{category.tickets}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            예약
                          </Typography>
                          <Typography variant="h6">{category.appointments}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            계약
                          </Typography>
                          <Typography variant="h6">{category.contracts}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            비용
                          </Typography>
                          <Typography variant="h6">{formatCurrency(category.cost)}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            매출
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {formatCurrency(category.revenue)}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            전환율
                          </Typography>
                          <Typography variant="h6">
                            {formatPercentage(category.conversionRate)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* 세부 채널 데이터 표 - 확장 시 표시 */}
                  <Collapse in={expandedCategories.has(category.category_code)}>
                    {category.channels && category.channels.length > 0 ? (
                      <TableContainer sx={{ maxHeight: 400 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                              <TableCell sx={{ fontWeight: 'bold' }}>채널</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>노출수</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>클릭수</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>CTR</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>CPC</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>문의</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>CVR</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>상담</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>예약</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>계약</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>전환율</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>비용</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>매출</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>CPA</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>ROI</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {category.channels.map((channel, idx) => (
                              <TableRow key={idx} hover>
                                <TableCell>{channel.channel}</TableCell>
                                <TableCell align="right">{formatNumber(channel.impressions)}</TableCell>
                                <TableCell align="right">{formatNumber(channel.clicks)}</TableCell>
                                <TableCell align="right">{formatPercentage(channel.ctr)}</TableCell>
                                <TableCell align="right">{formatCurrency(channel.cpc)}</TableCell>
                                <TableCell align="right">{formatNumber(channel.leads)}</TableCell>
                                <TableCell align="right">{formatPercentage(channel.cvr)}</TableCell>
                                <TableCell align="right">{formatNumber(channel.tickets)}</TableCell>
                                <TableCell align="right">{formatNumber(channel.appointments)}</TableCell>
                                <TableCell align="right">{formatNumber(channel.contracts)}</TableCell>
                                <TableCell align="right">{formatPercentage(channel.conversionRate)}</TableCell>
                                <TableCell align="right">{formatCurrency(channel.cost)}</TableCell>
                                <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                  {formatCurrency(channel.revenue)}
                                </TableCell>
                                <TableCell align="right">{formatCurrency(channel.cpa)}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={formatPercentage(channel.roi)}
                                    size="small"
                                    sx={{
                                      bgcolor: channel.roi >= 100 ? '#e8f5e9' : channel.roi >= 50 ? '#fff3e0' : '#ffebee',
                                      color: getROIColor(channel.roi),
                                      fontWeight: 'bold',
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                        세부 채널 데이터가 없습니다.
                      </Box>
                    )}
                  </Collapse>
                </Paper>
              ))}
            </Grid>
          )}

          {/* 카테고리별 ROI 비교 막대 차트 */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>카테고리별 ROI 비교 (온라인/오프라인/DB)</Typography>
              {categoryPerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={categoryPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category_name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'ROI') return [formatPercentage(value), name];
                        if (name === '문의' || name === '상담' || name === '예약' || name === '계약') {
                          return [value, name];
                        }
                        return [formatNumber(value), name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="leads" fill="#2196F3" name="문의" />
                    <Bar dataKey="tickets" fill="#FF9800" name="상담" />
                    <Bar dataKey="appointments" fill="#4CAF50" name="예약" />
                    <Bar dataKey="contracts" fill="#9C27B0" name="계약" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body1" color="text.secondary">카테고리 성과 데이터가 없습니다.</Typography>
              )}
            </Paper>
          </Grid>

          {/* 카테고리별 문의 비율 파이 차트 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>카테고리별 문의 분포</Typography>
              {categoryPerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={categoryPerformanceData}
                      dataKey="leads"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.category_name}: ${entry.leads}`}
                    >
                      {categoryPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.category_color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body1" color="text.secondary">No data available.</Typography>
              )}
            </Paper>
          </Grid>

          {/* 비용 vs 수익 비교 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>채널별 비용 vs 수익</Typography>
              {channelPerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={channelPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="cost" fill="#e53935" name="비용" />
                    <Bar dataKey="revenue" fill="#4caf50" name="수익" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body1" color="text.secondary">No data available.</Typography>
              )}
            </Paper>
          </Grid>

          {/* 채널별 성과 요약 테이블 - 카테고리별로 그룹화 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              채널별 성과 요약
            </Typography>
            {channelPerformanceData.length > 0 ? (
              <>
                {/* 카테고리별로 그룹화 */}
                {['online', 'offline', 'db', null].map((categoryCode) => {
                  const channelsInCategory = channelPerformanceData.filter(
                    (ch) => ch.category_code === categoryCode
                  );

                  if (channelsInCategory.length === 0) return null;

                  const categoryName = channelsInCategory[0]?.category_name || '분류 안 됨';
                  const categoryColor = channelsInCategory[0]?.category_color || '#9E9E9E';

                  return (
                    <Paper key={categoryCode || 'uncategorized'} sx={{ mb: 2, borderLeft: `4px solid ${categoryColor}` }}>
                      <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: categoryColor,
                            }}
                          />
                          {categoryName}
                        </Typography>
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                              <TableCell><strong>채널</strong></TableCell>
                              <TableCell align="right"><strong>문의 수</strong></TableCell>
                              <TableCell align="right"><strong>예약 수</strong></TableCell>
                              <TableCell align="right"><strong>전환율</strong></TableCell>
                              <TableCell align="right"><strong>총 비용</strong></TableCell>
                              <TableCell align="right"><strong>총 수익</strong></TableCell>
                              <TableCell align="right"><strong>CPL</strong></TableCell>
                              <TableCell align="right"><strong>CPA</strong></TableCell>
                              <TableCell align="right"><strong>ROI</strong></TableCell>
                              <TableCell align="right"><strong>ROAS</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {channelsInCategory.map((row, index) => (
                              <TableRow key={index} hover>
                                <TableCell><strong>{row.channel}</strong></TableCell>
                                <TableCell align="right">{formatNumber(row.leads)}</TableCell>
                                <TableCell align="right">{formatNumber(row.appointments)}</TableCell>
                                <TableCell align="right">{formatPercentage(row.conversionRate)}</TableCell>
                                <TableCell align="right">{formatCurrency(row.cost)}</TableCell>
                                <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 600 }}>
                                  {formatCurrency(row.revenue)}
                                </TableCell>
                                <TableCell align="right">{formatCurrency(row.cpl)}</TableCell>
                                <TableCell align="right">{formatCurrency(row.cpa)}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={formatPercentage(row.roi)}
                                    size="small"
                                    sx={{
                                      backgroundColor: row.roi >= 100 ? '#e8f5e9' : row.roi >= 50 ? '#fff3e0' : '#ffebee',
                                      color: getROIColor(row.roi),
                                      fontWeight: 600,
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="right">{row.roas.toFixed(2)}x</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  );
                })}
              </>
            ) : (
              <Paper sx={{ p: 3 }}>
                <Typography variant="body1" color="text.secondary">데이터가 없습니다.</Typography>
              </Paper>
            )}
          </Grid>

          {/* 월별/주별/캠페인별 상세 데이터 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">기간별 상세 성과</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddCampaignDialogOpen(true)}
                  size="small"
                >
                  캠페인 추가
                </Button>
              </Box>
              {monthlyData.length > 0 ? (
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell width={50}></TableCell>
                        <TableCell><strong>기간</strong></TableCell>
                        <TableCell><strong>채널</strong></TableCell>
                        <TableCell align="right"><strong>문의</strong></TableCell>
                        <TableCell align="right"><strong>예약</strong></TableCell>
                        <TableCell align="right"><strong>전환율</strong></TableCell>
                        <TableCell align="right"><strong>비용</strong></TableCell>
                        <TableCell align="right"><strong>수익</strong></TableCell>
                        <TableCell align="right"><strong>CPL</strong></TableCell>
                        <TableCell align="right"><strong>CPA</strong></TableCell>
                        <TableCell align="right"><strong>ROI</strong></TableCell>
                        <TableCell align="right"><strong>ROAS</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthlyData.map((monthRow) => (
                        <React.Fragment key={monthRow.yearMonth}>
                          {/* Level 1: 월별 행 */}
                          <TableRow
                            hover
                            sx={{
                              backgroundColor: '#e3f2fd',
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: '#bbdefb' }
                            }}
                            onClick={() => toggleMonth(monthRow.yearMonth)}
                          >
                            <TableCell>
                              <IconButton size="small">
                                {expandedMonths.has(monthRow.yearMonth) ? (
                                  <KeyboardArrowDownIcon fontSize="small" />
                                ) : (
                                  <KeyboardArrowRightIcon fontSize="small" />
                                )}
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                {monthRow.yearMonth}
                              </Typography>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell align="right"><strong>{formatNumber(monthRow.totalLeads)}</strong></TableCell>
                            <TableCell align="right"><strong>{formatNumber(monthRow.totalAppointments)}</strong></TableCell>
                            <TableCell align="right"><strong>{formatPercentage(monthRow.conversionRate)}</strong></TableCell>
                            <TableCell align="right"><strong>{formatCurrency(monthRow.totalCost)}</strong></TableCell>
                            <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 700 }}>
                              <strong>{formatCurrency(monthRow.totalRevenue)}</strong>
                            </TableCell>
                            <TableCell align="right"><strong>{formatCurrency(monthRow.cpl)}</strong></TableCell>
                            <TableCell align="right"><strong>{formatCurrency(monthRow.cpa)}</strong></TableCell>
                            <TableCell align="right">
                              <Chip
                                label={formatPercentage(monthRow.roi)}
                                size="small"
                                sx={{
                                  backgroundColor: monthRow.roi >= 100 ? '#e8f5e9' : monthRow.roi >= 50 ? '#fff3e0' : '#ffebee',
                                  color: getROIColor(monthRow.roi),
                                  fontWeight: 700,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right"><strong>{monthRow.roas.toFixed(2)}x</strong></TableCell>
                          </TableRow>

                          {/* Level 2: 주별 행 */}
                          {expandedMonths.has(monthRow.yearMonth) && monthRow.weeks.map((weekRow) => {
                            const weekKey = `${monthRow.yearMonth}_W${weekRow.weekNumber}`;
                            return (
                              <React.Fragment key={weekKey}>
                                <TableRow
                                  hover
                                  sx={{
                                    backgroundColor: '#f5f5f5',
                                    cursor: 'pointer',
                                    '&:hover': { backgroundColor: '#eeeeee' }
                                  }}
                                  onClick={() => toggleWeek(weekKey)}
                                >
                                  <TableCell>
                                    <IconButton size="small" sx={{ ml: 2 }}>
                                      {expandedWeeks.has(weekKey) ? (
                                        <KeyboardArrowDownIcon fontSize="small" />
                                      ) : (
                                        <KeyboardArrowRightIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  </TableCell>
                                  <TableCell sx={{ pl: 4 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {weekRow.weekLabel} ({weekRow.dateRange})
                                    </Typography>
                                  </TableCell>
                                  <TableCell></TableCell>
                                  <TableCell align="right"><strong>{formatNumber(weekRow.totalLeads)}</strong></TableCell>
                                  <TableCell align="right"><strong>{formatNumber(weekRow.totalAppointments)}</strong></TableCell>
                                  <TableCell align="right"><strong>{formatPercentage(weekRow.conversionRate)}</strong></TableCell>
                                  <TableCell align="right"><strong>{formatCurrency(weekRow.totalCost)}</strong></TableCell>
                                  <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 600 }}>
                                    <strong>{formatCurrency(weekRow.totalRevenue)}</strong>
                                  </TableCell>
                                  <TableCell align="right"><strong>{formatCurrency(weekRow.cpl)}</strong></TableCell>
                                  <TableCell align="right"><strong>{formatCurrency(weekRow.cpa)}</strong></TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      label={formatPercentage(weekRow.roi)}
                                      size="small"
                                      sx={{
                                        backgroundColor: weekRow.roi >= 100 ? '#e8f5e9' : weekRow.roi >= 50 ? '#fff3e0' : '#ffebee',
                                        color: getROIColor(weekRow.roi),
                                        fontWeight: 600,
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell align="right"><strong>{weekRow.roas.toFixed(2)}x</strong></TableCell>
                                </TableRow>

                                {/* Level 3: 캠페인별 행 */}
                                {expandedWeeks.has(weekKey) && weekRow.campaigns.map((campaign) => {
                                  const isEditable = campaign.source === 'manual';
                                  const isApiData = campaign.source === 'api';

                                  return (
                                    <TableRow key={campaign.id} hover sx={{ backgroundColor: '#fafafa' }}>
                                      <TableCell></TableCell>
                                      <TableCell></TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography variant="body2" sx={{ color: '#666' }}>
                                            {campaign.channel} - {campaign.campaign}
                                          </Typography>
                                          {isApiData && (
                                            <LockIcon sx={{ fontSize: 14, color: '#999' }} titleAccess="API 데이터 (읽기 전용)" />
                                          )}
                                        </Box>
                                      </TableCell>

                                      {/* 문의 수 - 편집 가능 */}
                                      <TableCell
                                        align="right"
                                        onClick={() => isEditable && handleCellClick(campaign.id, 'leads', campaign.leads, campaign.source)}
                                        sx={{
                                          cursor: isEditable ? 'pointer' : 'default',
                                          '&:hover': isEditable ? { backgroundColor: '#f0f0f0' } : {}
                                        }}
                                      >
                                        {editingCell?.id === campaign.id && editingCell?.field === 'leads' ? (
                                          <TextField
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            size="small"
                                            autoFocus
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleCellSave();
                                              if (e.key === 'Escape') handleCellCancel();
                                            }}
                                            InputProps={{
                                              endAdornment: (
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                  <IconButton size="small" onClick={handleCellSave}>
                                                    <SaveIcon fontSize="small" />
                                                  </IconButton>
                                                  <IconButton size="small" onClick={handleCellCancel}>
                                                    <CancelIcon fontSize="small" />
                                                  </IconButton>
                                                </Box>
                                              ),
                                            }}
                                            sx={{ width: '120px' }}
                                          />
                                        ) : (
                                          formatNumber(campaign.leads)
                                        )}
                                      </TableCell>

                                      {/* 예약 수 - 편집 가능 */}
                                      <TableCell
                                        align="right"
                                        onClick={() => isEditable && handleCellClick(campaign.id, 'appointments', campaign.appointments, campaign.source)}
                                        sx={{
                                          cursor: isEditable ? 'pointer' : 'default',
                                          '&:hover': isEditable ? { backgroundColor: '#f0f0f0' } : {}
                                        }}
                                      >
                                        {editingCell?.id === campaign.id && editingCell?.field === 'appointments' ? (
                                          <TextField
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            size="small"
                                            autoFocus
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleCellSave();
                                              if (e.key === 'Escape') handleCellCancel();
                                            }}
                                            InputProps={{
                                              endAdornment: (
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                  <IconButton size="small" onClick={handleCellSave}>
                                                    <SaveIcon fontSize="small" />
                                                  </IconButton>
                                                  <IconButton size="small" onClick={handleCellCancel}>
                                                    <CancelIcon fontSize="small" />
                                                  </IconButton>
                                                </Box>
                                              ),
                                            }}
                                            sx={{ width: '120px' }}
                                          />
                                        ) : (
                                          formatNumber(campaign.appointments)
                                        )}
                                      </TableCell>

                                      {/* 전환율 - 계산 값 (읽기 전용) */}
                                      <TableCell align="right">{formatPercentage(campaign.conversionRate)}</TableCell>

                                      {/* 비용 - 편집 가능 */}
                                      <TableCell
                                        align="right"
                                        onClick={() => isEditable && handleCellClick(campaign.id, 'cost', campaign.cost, campaign.source)}
                                        sx={{
                                          cursor: isEditable ? 'pointer' : 'default',
                                          '&:hover': isEditable ? { backgroundColor: '#f0f0f0' } : {}
                                        }}
                                      >
                                        {editingCell?.id === campaign.id && editingCell?.field === 'cost' ? (
                                          <TextField
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            size="small"
                                            autoFocus
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleCellSave();
                                              if (e.key === 'Escape') handleCellCancel();
                                            }}
                                            InputProps={{
                                              endAdornment: (
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                  <IconButton size="small" onClick={handleCellSave}>
                                                    <SaveIcon fontSize="small" />
                                                  </IconButton>
                                                  <IconButton size="small" onClick={handleCellCancel}>
                                                    <CancelIcon fontSize="small" />
                                                  </IconButton>
                                                </Box>
                                              ),
                                            }}
                                            sx={{ width: '150px' }}
                                          />
                                        ) : (
                                          formatCurrency(campaign.cost)
                                        )}
                                      </TableCell>

                                      {/* 수익 - 편집 가능 */}
                                      <TableCell
                                        align="right"
                                        onClick={() => isEditable && handleCellClick(campaign.id, 'revenue', campaign.revenue, campaign.source)}
                                        sx={{
                                          color: '#4caf50',
                                          cursor: isEditable ? 'pointer' : 'default',
                                          '&:hover': isEditable ? { backgroundColor: '#f0f0f0' } : {}
                                        }}
                                      >
                                        {editingCell?.id === campaign.id && editingCell?.field === 'revenue' ? (
                                          <TextField
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            size="small"
                                            autoFocus
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleCellSave();
                                              if (e.key === 'Escape') handleCellCancel();
                                            }}
                                            InputProps={{
                                              endAdornment: (
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                  <IconButton size="small" onClick={handleCellSave}>
                                                    <SaveIcon fontSize="small" />
                                                  </IconButton>
                                                  <IconButton size="small" onClick={handleCellCancel}>
                                                    <CancelIcon fontSize="small" />
                                                  </IconButton>
                                                </Box>
                                              ),
                                            }}
                                            sx={{ width: '150px' }}
                                          />
                                        ) : (
                                          formatCurrency(campaign.revenue)
                                        )}
                                      </TableCell>

                                      {/* CPL, CPA - 계산 값 (읽기 전용) */}
                                      <TableCell align="right">{formatCurrency(campaign.cpl)}</TableCell>
                                      <TableCell align="right">{formatCurrency(campaign.cpa)}</TableCell>

                                      {/* ROI - 계산 값 (읽기 전용) */}
                                      <TableCell align="right">
                                        <Chip
                                          label={formatPercentage(campaign.roi)}
                                          size="small"
                                          sx={{
                                            backgroundColor: campaign.roi >= 100 ? '#e8f5e9' : campaign.roi >= 50 ? '#fff3e0' : '#ffebee',
                                            color: getROIColor(campaign.roi),
                                          }}
                                        />
                                      </TableCell>

                                      {/* ROAS - 계산 값 (읽기 전용) */}
                                      <TableCell align="right">{campaign.roas.toFixed(2)}x</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" color="text.secondary">월별 데이터가 없습니다.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* 캠페인 추가 다이얼로그 */}
      <Dialog
        open={addCampaignDialogOpen}
        onClose={() => {
          setAddCampaignDialogOpen(false);
          setSelectedCategoryForCampaign('');
          setNewCampaign({
            channel: '',
            campaign: '',
            leads: 0,
            appointments: 0,
            cost: 0,
            revenue: 0,
            startDate: getTodayDate(),
            endDate: getTodayDate(),
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>새 캠페인 추가</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>채널 카테고리</InputLabel>
              <Select
                value={selectedCategoryForCampaign}
                onChange={(e) => {
                  setSelectedCategoryForCampaign(e.target.value);
                  setNewCampaign({ ...newCampaign, channel: '' }); // 카테고리 변경 시 채널 초기화
                }}
                label="채널 카테고리"
              >
                {channelCategories.map((category) => (
                  <MenuItem key={category.id} value={category.code}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: category.color,
                        }}
                      />
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={!selectedCategoryForCampaign}>
              <InputLabel>채널</InputLabel>
              <Select
                value={newCampaign.channel}
                onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}
                label="채널"
              >
                {channelMappings
                  .filter((mapping) => {
                    if (!selectedCategoryForCampaign) return false;
                    const category = channelCategories.find((c) => c.code === selectedCategoryForCampaign);
                    return category && mapping.category_id === category.id && mapping.active;
                  })
                  .map((mapping) => (
                    <MenuItem key={mapping.id} value={mapping.utm_source}>
                      {mapping.display_name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              label="캠페인명"
              value={newCampaign.campaign}
              onChange={(e) => setNewCampaign({ ...newCampaign, campaign: e.target.value })}
              fullWidth
            />
            <TextField
              label="시작일"
              type="date"
              value={newCampaign.startDate}
              onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="종료일"
              type="date"
              value={newCampaign.endDate}
              onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="문의 수"
              type="number"
              value={newCampaign.leads}
              onChange={(e) => setNewCampaign({ ...newCampaign, leads: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <TextField
              label="예약 수"
              type="number"
              value={newCampaign.appointments}
              onChange={(e) => setNewCampaign({ ...newCampaign, appointments: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <TextField
              label="비용 (원)"
              type="number"
              value={newCampaign.cost}
              onChange={(e) => setNewCampaign({ ...newCampaign, cost: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <TextField
              label="수익 (원)"
              type="number"
              value={newCampaign.revenue}
              onChange={(e) => setNewCampaign({ ...newCampaign, revenue: parseInt(e.target.value) || 0 })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCampaignDialogOpen(false)}>취소</Button>
          <Button onClick={handleAddCampaign} variant="contained" color="primary">추가</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

