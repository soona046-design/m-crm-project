'use client';

import dynamic from 'next/dynamic';

const ChannelPerformanceChart = dynamic(
  () => import('@/components/ChannelPerformanceChart'),
  { ssr: false }
);

const ChannelsPage = () => {
  // Mock data for development
  const mockData = [
    { date: '2025-09-20', cost: 100000, leads: 25, appointments: 8 },
    { date: '2025-09-21', cost: 120000, leads: 30, appointments: 12 },
    { date: '2025-09-22', cost: 95000, leads: 22, appointments: 7 },
    { date: '2025-09-23', cost: 110000, leads: 28, appointments: 10 },
    { date: '2025-09-24', cost: 130000, leads: 35, appointments: 15 },
  ];

  return (
    <div>
      <ChannelPerformanceChart data={mockData} />
    </div>
  );
};

export default ChannelsPage;
