import { MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { STATUS_EN_TO_KR } from "@/lib/leadStatus"

interface Lead {
  lead_id: string;
  name: string;
  primary_phone: string;
  status: string;
  utm_source: string | string[];
  last_contact_at: string;
  score: number;
  assignee_name: string;
  sla_status: string;
}

interface RecentInquiriesProps {
  leads: Lead[];
}

export function RecentInquiries({ leads }: RecentInquiriesProps) {
  const recentLeads = leads
    .sort((a, b) => new Date(b.last_contact_at).getTime() - new Date(a.last_contact_at).getTime())
    .slice(0, 3);

  return (
    // TDS: 평면 흰 카드 + 헤어라인, radius 16
    <Card className="rounded-2xl border border-border bg-card shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold tracking-[-0.005em]">최근 문의</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {recentLeads.length > 0 ? (
          // TDS list-row: 행 보더 없이 hover 배경만 — 구분은 여백으로
          <div className="space-y-1">
            {recentLeads.map((lead) => {
              const utmSourceStr = Array.isArray(lead.utm_source)
                ? lead.utm_source.join(', ')
                : lead.utm_source;
              const statusKr = STATUS_EN_TO_KR[lead.status] ?? lead.status;

              return (
                <div
                  key={lead.lead_id}
                  className="rounded-xl p-3 hover:bg-muted transition-colors duration-200"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-semibold text-[15px] tracking-[-0.005em]">{lead.name.charAt(0) + '**'}</h4>
                    <Badge
                      variant={
                        statusKr === '상담완료' ? 'default' :
                        statusKr === '계약완료' ? 'secondary' :
                        'outline'
                      }
                      className="text-xs rounded-full"
                    >
                      {statusKr}
                    </Badge>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[13px] text-muted-foreground">
                      채널: {utmSourceStr || '채널 미확인'} · 담당자: {lead.assignee_name || '미배정'}
                    </p>
                    <p className="text-[13px] text-muted-foreground tabular-nums">
                      스코어: {lead.score} · {new Date(lead.last_contact_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-[15px] text-foreground text-center font-medium">아직 등록된 문의가 없어요</p>
            <p className="text-[13px] text-muted-foreground mt-1">새로운 문의가 들어오면 여기에 보여드려요</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
