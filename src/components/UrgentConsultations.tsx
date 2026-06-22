import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Ticket {
  ticket_id: string;
  lead_id: string;
  lead_name: string;
  title: string;
  priority: string;
  state: string;
  assignee_name: string;
  created_at: string;
  sla_timer?: {
    remaining: number;
    formatted: string;
    status: string;
  };
}

interface UrgentConsultationsProps {
  tickets: Ticket[];
}

export function UrgentConsultations({ tickets }: UrgentConsultationsProps) {
  const urgentItems = tickets
    // [SLA 기능 비활성화 2026-06-22] .filter(t => t.sla_timer?.status === 'warning' || t.priority === '긴급')
    .filter(t => t.priority === '긴급')
    .slice(0, 5);

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">긴급 상담</CardTitle>
          <Badge variant="destructive" className="gap-1 shadow-sm">
            <AlertCircle className="h-3 w-3" />
            {urgentItems.length}건
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {urgentItems.length > 0 ? (
          urgentItems.map((item) => (
            <div
              key={item.ticket_id}
              className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4 hover:bg-destructive/10 hover:border-destructive/40 transition-all duration-200 cursor-pointer shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <Badge variant="destructive" className="text-xs">
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    리드: {item.lead_name} | 담당자: {item.assignee_name}
                  </p>
                </div>

                {/* [SLA 기능 비활성화 2026-06-22]
                {item.sla_timer && (
                  <div className="flex items-center gap-1.5 text-destructive">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-semibold">{item.sla_timer.formatted}</span>
                  </div>
                )}
                */}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  상태: {item.state}
                </Badge>
                {/* [SLA 기능 비활성화 2026-06-22]
                {item.sla_timer && (
                  <Badge
                    variant={item.sla_timer.status === 'warning' ? 'destructive' : 'outline'}
                    className="text-xs"
                  >
                    {item.sla_timer.formatted}
                  </Badge>
                )}
                */}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted/70 p-4 mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center font-medium">긴급 상담이 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
