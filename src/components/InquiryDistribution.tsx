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
      const key = source || '채널 미확인';
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const channels = Object.entries(channelCounts);
  const maxCount = Math.max(...channels.map(([, count]) => count), 1);

  return (
    // TDS: 평면 흰 카드 + 헤어라인, radius 16
    <Card className="rounded-2xl border border-border bg-card shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold tracking-[-0.005em]">채널별 문의 분포</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {channels.length > 0 ? (
          <div className="space-y-1">
            {channels.map(([channel, count]) => (
              // TDS list-row + bar-chart 규칙: 축·보더 없이 그레이 막대, 강조 막대만 Toss Blue
              <div key={channel} className="rounded-xl p-3 hover:bg-muted transition-colors duration-200">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[15px] font-medium tracking-[-0.005em]">{channel}</p>
                  <span className="text-[13px] font-semibold text-muted-foreground tabular-nums">{count}건</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#E5E5E5] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${count === maxCount ? 'bg-[#FF5B2C]' : 'bg-[#B5B5B5]'}`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <PieChart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-[15px] text-foreground text-center font-medium">아직 데이터가 없어요</p>
            <p className="text-[13px] text-muted-foreground mt-1">문의 데이터가 수집되면 분포를 보여드려요</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
