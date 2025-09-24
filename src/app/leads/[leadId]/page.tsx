'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Grid, Paper, Tabs, Tab } from '@mui/material';
import axios from 'axios';
import LeadProfileCard from '@/components/LeadProfileCard'; // LeadProfileCard 컴포넌트 import
import LeadTimeline from '@/components/LeadTimeline'; // LeadTimeline 컴포넌트 import
import LeadSupportingPanel from '@/components/LeadSupportingPanel'; // LeadSupportingPanel 컴포넌트 import

interface LeadDetailProps {
  params: { leadId: string };
}

interface Lead {
  lead_id: string;
  name: string;
  primary_phone: string;
  email_hash?: string;
  status: string;
  utm_source: string;
  utm_medium?: string;
  utm_campaign?: string;
  last_contact_at: string;
  score: number;
  assignee_name?: string;
  sla_status: string;
  memo?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  city?: string;
  created_at: string;
  updated_at: string;
}

// TODO: Timeline 및 Supporting Panel 컴포넌트 분리 필요

export default function LeadDetailPage({ params }: LeadDetailProps) {
  const { leadId } = params;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const fetchLeadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/leads/${leadId}`);
        setLead(response.data);
      } catch (err) {
        console.error("Failed to fetch lead detail:", err);
        setError("Failed to load lead details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLeadDetail();
    }
  }, [leadId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // CTA 핸들러 (현재는 placeholder)
  const handleOpenTicket = (leadId: string) => {
    alert(`티켓 열기: ${leadId}`);
    // TODO: 실제 티켓 상세 페이지로 이동 또는 티켓 생성 모달 열기 로직 구현
  };

  const handleCreateAppointment = (leadId: string) => {
    alert(`예약 생성: ${leadId}`);
    // TODO: 실제 예약 생성 페이지로 이동 또는 예약 생성 모달 열기 로직 구현
  };

  const handleSendMessage = (leadId: string) => {
    alert(`메시지 보내기: ${leadId}`);
    // TODO: 실제 메시지 발송 기능 구현
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!lead) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Lead not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Lead Detail: {lead.name}
      </Typography>

      <Grid container spacing={3}>
        {/* 좌측: Profile Card */}
        <Grid item xs={12} md={4}>
          <LeadProfileCard
            lead={lead}
            onOpenTicket={handleOpenTicket}
            onCreateAppointment={handleCreateAppointment}
            onSendMessage={handleSendMessage}
          />
        </Grid>

        {/* 중앙: Timeline */}
        <Grid item xs={12} md={5}>
          <LeadTimeline leadId={leadId} />
        </Grid>

        {/* 우측: Supporting Panel (Tabs: 티켓/메모/첨부) */}
        <Grid item xs={12} md={3}>
          <LeadSupportingPanel leadId={leadId} />
        </Grid>
      </Grid>
    </Box>
  );
}
