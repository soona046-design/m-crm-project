export type ChannelCategory = 'online' | 'offline' | 'db';

export interface CategoryPerformanceData {
  category: ChannelCategory;
  category_name: string;
  category_color: string;
  leads: number;
  tickets: number;
  appointments: number;
  contracts: number;
  cost: number;
  revenue: number;
  roi: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cvr: number;
  conversionRate: number;
  cpc: number;
  cpa: number;
}

export interface ChannelCategory_Type {
  id: number;
  code: ChannelCategory;
  name: string;
  color: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChannelMapping {
  id: number;
  utm_source: string;
  display_name: string;
  category_id: number;
  category_name: string;
  category_code: ChannelCategory;
  category_color: string;
  priority: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ChannelPerformanceData {
  channel: string;
  category?: ChannelCategory;
  category_name?: string;
  category_color?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  leads: number;
  cvr: number;
  tickets: number;
  appointments: number;
  contracts: number;
  conversionRate: number;
  cost: number;
  revenue: number;
  cpc: number;
  cpa: number;
  roi: number;
}

