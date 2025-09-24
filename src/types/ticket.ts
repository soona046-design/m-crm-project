export interface Ticket {
  ticket_id: string;
  lead_id: string;
  lead_name: string;
  title?: string;
  notes: string;
  latest_message_preview?: string;
  sla_timer?: {
    remaining: number;
    formatted: string;
    status: 'normal' | 'warning' | 'violated';
  };
  sla_due_at?: string;
  priority: '긴급' | '높음' | '일반' | '낮음';
  assignee_id?: string;
  assignee_name?: string;
  state: '신규' | '진행' | '보류' | '완료';
  created_at: string;
  tags?: string[];
  last_contact_at?: string;
}
