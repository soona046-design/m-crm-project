'use client';

import dynamic from 'next/dynamic';

const ChannelPerformanceChart = dynamic(
  () => import('@/components/ChannelPerformanceChart'),
  { ssr: false }
);

const ChannelsPage = () => {
  return (
    <div>
      <ChannelPerformanceChart />
    </div>
  );
};

export default ChannelsPage;
