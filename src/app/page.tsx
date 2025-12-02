'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCards } from '@/components/StatsCards';
import { RecentInquiries } from '@/components/RecentInquiries';
import { UrgentConsultations } from '@/components/UrgentConsultations';
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
  sla_status: string;
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
  sla_timer?: {
    remaining: number;
    formatted: string;
    status: string;
  };
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
  loading: boolean;
}

export default function HomePage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    leads: [],
    tickets: [],
    users: [],
    loading: true
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true }));

        // Load leads from localStorage
        const storedLeads = localStorage.getItem('mcrm_leads');
        const leads: Lead[] = storedLeads ? JSON.parse(storedLeads) : [];

        // Load users from localStorage
        const storedUsers = localStorage.getItem('mcrm_users');
        const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

        // Mock tickets data
        const mockTickets: Ticket[] = [
          {
            ticket_id: 'ticket_001',
            lead_id: 'lead_001',
            lead_name: '김환자',
            title: '임플란트 상담 문의',
            priority: '높음',
            assignee_name: '김상담',
            state: '진행',
            created_at: '2025-09-29T08:00:00Z',
            sla_timer: {
              remaining: 120,
              formatted: '2시간 남음',
              status: 'normal'
            }
          },
          {
            ticket_id: 'ticket_002',
            lead_id: 'lead_002',
            lead_name: '이환자',
            title: 'SLA 임박 - 교정 문의',
            priority: '긴급',
            assignee_name: '이상담',
            state: '진행',
            created_at: '2025-09-29T10:00:00Z',
            sla_timer: {
              remaining: 30,
              formatted: '30분 남음',
              status: 'warning'
            }
          },
          {
            ticket_id: 'ticket_003',
            lead_id: 'lead_003',
            lead_name: '박환자',
            title: '미응답 - 스케일링 예약',
            priority: '일반',
            assignee_name: '박상담',
            state: '신규',
            created_at: '2025-09-29T07:00:00Z'
          }
        ];

        setDashboardData({
          leads,
          tickets: mockTickets,
          users,
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
    <div className="space-y-6">
      <StatsCards
        totalLeads={dashboardData.leads.length}
        activeTickets={dashboardData.tickets.filter(t => t.state !== '완료').length}
        urgentTickets={dashboardData.tickets.filter(t => t.sla_timer?.status === 'warning').length}
        totalUsers={dashboardData.users.length}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentInquiries leads={dashboardData.leads} />
        <UrgentConsultations tickets={dashboardData.tickets} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InquiryDistribution leads={dashboardData.leads} />
        <UserStatus users={dashboardData.users} />
      </div>
    </div>
  );
}
