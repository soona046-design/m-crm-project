'use client';

import React from 'react';
import { Alert, Snackbar, Stack } from '@mui/material';
import { useTicketUpdates } from '@/hooks/useTicketUpdates';

interface RealtimeUpdatesProps {
  ticketId?: string;
}

export default function RealtimeUpdates({ ticketId }: RealtimeUpdatesProps) {
  const updates = useTicketUpdates(ticketId);

  return (
    <Stack spacing={1} sx={{ position: 'fixed', bottom: 16, right: 16, maxWidth: 400 }}>
      {updates.map((update, index) => (
        <Snackbar
          key={index}
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ position: 'static', mb: 1 }}
        >
          <Alert
            severity={
              update.type === 'warning'
                ? 'warning'
                : update.type === 'violated'
                ? 'error'
                : 'info'
            }
            variant="filled"
            sx={{ width: '100%' }}
          >
            {update.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
}
