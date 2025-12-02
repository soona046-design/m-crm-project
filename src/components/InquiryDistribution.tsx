import { PieChart } from "lucide-react"
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

interface InquiryDistributionProps {
  leads: Lead[];
}

export function InquiryDistribution({ leads }: InquiryDistributionProps) {
  const channelCounts = leads.reduce((acc, lead) => {
    const sources = Array.isArray(lead.utm_source) ? lead.utm_source : [lead.utm_source];
    sources.forEach(source => {
      acc[source] = (acc[source] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const channels = Object.entries(channelCounts);

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">채널별 문의 분포</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {channels.length > 0 ? (
          <div className="space-y-3">
            {channels.map(([channel, count]) => (
              <div key={channel} className="flex justify-between items-center p-3 rounded-lg border border-border/70 hover:bg-muted/50 transition-all">
                <p className="text-sm font-medium">{channel}</p>
                <Badge variant="outline" className="text-xs">
                  {count}건
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted/70 p-4 mb-4">
              <PieChart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center font-medium">데이터가 없습니다</p>
            <p className="text-xs text-muted-foreground/70 mt-1">문의 데이터가 수집되면 분포 차트가 표시됩니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
