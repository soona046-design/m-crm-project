import { MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    <Card className="border border-border/50 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">최근 문의</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {recentLeads.length > 0 ? (
          <div className="space-y-3">
            {recentLeads.map((lead) => {
              const utmSourceStr = Array.isArray(lead.utm_source)
                ? lead.utm_source.join(', ')
                : lead.utm_source;

              return (
                <div
                  key={lead.lead_id}
                  className="p-3 rounded-lg border border-border/70 hover:bg-muted/50 hover:border-border transition-all duration-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{lead.name.charAt(0) + '**'}</h4>
                    <Badge
                      variant={
                        lead.status === '상담완료' ? 'default' :
                        lead.status === '계약완료' ? 'secondary' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      채널: {utmSourceStr} | 담당자: {lead.assignee_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      스코어: {lead.score} | {new Date(lead.last_contact_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted/70 p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center font-medium">등록된 문의가 없습니다</p>
            <p className="text-xs text-muted-foreground/70 mt-1">새로운 문의가 들어오면 여기에 표시됩니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
