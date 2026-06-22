'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RealtimeContextType {
  unreadNotifications: number;
  ticketUpdates: any[];
  clearTicketUpdates: () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  unreadNotifications: 0,
  ticketUpdates: [],
  clearTicketUpdates: () => {},
});

export const useRealtime = () => useContext(RealtimeContext);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [ticketUpdates, setTicketUpdates] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || typeof window === 'undefined' || !window.Echo) return;

    // 개인 채널 구독
    const privateChannel = window.Echo.private(`user.${user.user_id}`);

    // 알림 수신
    privateChannel.notification((notification: any) => {
      setUnreadNotifications((prev) => prev + 1);
    });

    // [SLA 기능 비활성화 2026-06-22]
    // privateChannel.listen('.sla.warning', (e: any) => {
    //   setTicketUpdates((prev) => [...prev, { type: 'warning', ...e }]);
    // });
    // privateChannel.listen('.sla.violated', (e: any) => {
    //   setTicketUpdates((prev) => [...prev, { type: 'violated', ...e }]);
    // });

    // 티켓 업데이트 수신
    privateChannel.listen('.ticket.updated', (e: any) => {
      setTicketUpdates((prev) => [...prev, { type: 'updated', ...e }]);
    });

    return () => {
      window.Echo.leave(`user.${user.user_id}`);
    };
  }, [user]);

  const clearTicketUpdates = () => {
    setTicketUpdates([]);
  };

  return (
    <RealtimeContext.Provider
      value={{
        unreadNotifications,
        ticketUpdates,
        clearTicketUpdates,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}
