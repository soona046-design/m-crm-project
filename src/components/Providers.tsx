'use client';

import React from 'react';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/lib/echo';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeRegistry>
      <AuthProvider>
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
      </AuthProvider>
    </ThemeRegistry>
  );
}
