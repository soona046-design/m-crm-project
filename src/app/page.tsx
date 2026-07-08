'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { StatsCards } from '@/components/StatsCards';
import { RecentInquiries } from '@/components/RecentInquiries';
// [SLA 기능 비활성화 2026-06-22] import { UrgentConsultations } from '@/components/UrgentConsultations';
import { InquiryDistribution } from '@/components/InquiryDistribution';
import { UserStatus } from '@/components/UserStatus';

interface Lead {
  lead_id: string;
  name: string;
  primary_phone: string;
  status: string;
  utm_source: string;
  last_contact_at: string;
  score: number;
  assignee_name: string;
  sla_status: string; // 타입 전용 — RecentInquiries/InquiryDistribution이 구조적으로 요구. 실제 표시는 안 함
}

interface Ticket {
  ticket_id: string;
  lead_id: string;
  lead_name: string;
  title: string;
  priority: string;
  state: string;
  assignee_name: string;
  created_at: string;
  // [SLA 기능 비활성화 2026-06-22]
  // sla_timer?: {
  //   remaining: number;
  //   formatted: string;
  //   status: string;
  // };
}

interface User {
  user_id: string;
  login_id: string;
  name: string;
  email: string;
  role: string;
  clinic_id?: string;
}

interface DashboardData {
  leads: Lead[];
  tickets: Ticket[];
  users: User[];
  totalLeadsCount: number;
  totalUsersCount: number;
  loading: boolean;
}

export default function HomePage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    leads: [],
    tickets: [],
    users: [],
    totalLeadsCount: 0,
    totalUsersCount: 0,
    loading: true
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true }));

        const [leadsRes, ticketsRes, usersRes] = await Promise.all([
          api.get('/api/leads', { params: { per_page: 50, sort_by: 'created_at', sort_order: 'desc' } }),
          api.get('/api/tickets', { params: { per_page: 200, sort_by: 'created_at', sort_order: 'desc' } }),
          api.get('/api/users', { params: { per_page: 200 } }),
        ]);

        const leadsPayload = leadsRes.data;
        const ticketsPayload = ticketsRes.data;
        const usersPayload = usersRes.data;

        const leadsData: any[] = leadsPayload?.data ?? leadsPayload ?? [];
        const ticketsData: any[] = ticketsPayload?.data ?? ticketsPayload ?? [];
        const usersData: any[] = usersPayload?.data ?? usersPayload ?? [];

        const leads: Lead[] = leadsData.map((l) => ({
          lead_id: l.lead_id,
          name: l.name,
          primary_phone: l.primary_phone,
          status: l.status,
          utm_source: l.utm_source,
          last_contact_at: l.last_contact_at ?? l.created_at,
          score: l.score,
          assignee_name: l.assignee_name,
          sla_status: '-', // [SLA 기능 비활성화 2026-06-22] 백엔드가 더 이상 내려주지 않음, 타입 호환용 자리값(미표시)
        }));

        const tickets: Ticket[] = ticketsData.map((t) => ({
          ticket_id: t.ticket_id,
          lead_id: t.lead_id,
          lead_name: t.lead_name,
          title: t.title ?? t.notes ?? '',
          priority: t.priority,
          state: t.state,
          assignee_name: t.assignee_name,
          created_at: t.created_at,
        }));

        const users: User[] = usersData.map((u) => ({
          user_id: u.user_id,
          login_id: u.login_id,
          name: u.name,
          email: u.email,
          role: u.role,
          clinic_id: u.clinic_id,
        }));

        setDashboardData({
          leads,
          tickets,
          users,
          totalLeadsCount: leadsPayload?.total ?? leads.length,
          totalUsersCount: usersPayload?.total ?? users.length,
          loading: false
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    loadDashboardData();

    // 30초마다 데이터 새로고침
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (dashboardData.loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StatsCards
        totalLeads={dashboardData.totalLeadsCount}
        activeTickets={dashboardData.tickets.filter(t => t.state !== '완료').length}
        totalUsers={dashboardData.totalUsersCount}
      />

      {/* [SLA 기능 비활성화 2026-06-22] UrgentConsultations 제거로 RecentInquiries가 단독이라 전체 폭으로 표시 */}
      <RecentInquiries leads={dashboardData.leads} />

      <div className="grid gap-4 lg:grid-cols-2">
        <InquiryDistribution leads={dashboardData.leads} />
        <UserStatus users={dashboardData.users} />
      </div>
    </div>
  );
}
