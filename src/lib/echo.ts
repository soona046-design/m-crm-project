import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Echo: Echo<any>;
    Pusher: typeof Pusher;
  }
}

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PUSHER_APP_KEY) {
  window.Pusher = Pusher;

  window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authorizer: (channel: any) => ({
      authorize: async (socketId: string, callback: Function) => {
        try {
          const response = await fetch('/api/broadcasting/auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
            credentials: 'include',
          });

          const data = await response.json();
          callback(null, data);
        } catch (error) {
          callback(error);
        }
      },
    }),
  });
}
