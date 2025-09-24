'use client';

import { useEffect, useState } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';

interface TicketUpdate {
  type: 'warning' | 'violated' | 'updated';
  ticket_id: string;
  message: string;
  timestamp: string;
}

export function useTicketUpdates(ticketId?: string) {
  const { ticketUpdates, clearTicketUpdates } = useRealtime();
  const [updates, setUpdates] = useState<TicketUpdate[]>([]);

  useEffect(() => {
    if (ticketId) {
      // 특정 티켓의 업데이트만 필터링
      setUpdates(
        ticketUpdates.filter((update) => update.ticket_id === ticketId)
      );
    } else {
      // 모든 업데이트 표시
      setUpdates(ticketUpdates);
    }
  }, [ticketUpdates, ticketId]);

  useEffect(() => {
    // 컴포넌트가 언마운트될 때 업데이트 목록 초기화
    return () => {
      clearTicketUpdates();
    };
  }, [clearTicketUpdates]);

  return updates;
}
