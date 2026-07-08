import { MessageSquare, Users, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardsProps {
  totalLeads: number;
  activeTickets: number;
  totalUsers: number;
}

export function StatsCards({ totalLeads, activeTickets, totalUsers }: StatsCardsProps) {
  const stats = [
    {
      title: "전체 문의",
      value: totalLeads.toLocaleString(),
      subtitle: "등록된 문의",
      icon: MessageSquare,
    },
    {
      title: "진행중 상담",
      value: activeTickets.toLocaleString(),
      subtitle: "진행중인 상담",
      icon: Users,
    },
    {
      title: "전체 사용자",
      value: totalUsers.toLocaleString(),
      subtitle: "등록된 사용자",
      icon: UserCheck,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          // TDS: 평면 흰 카드 + 1px 헤어라인, 그림자 없음, radius 16
          <Card
            key={stat.title}
            className="rounded-2xl border border-border bg-card shadow-none"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[13px] font-medium text-muted-foreground">{stat.title}</p>
                  {/* 수치는 grey-900 Bold + tabular figure — 색은 강조에 예약 */}
                  <h3 className="text-[24px] font-bold leading-[1.3] tracking-[-0.02em] text-foreground tabular-nums">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
                {/* 아이콘 칩: blue-50 배경 + Toss Blue — 화면 단일 강조색 */}
                <div className="rounded-[10px] bg-[#E8F3FF] p-2.5 text-[#3182F6]">
                  <Icon className="h-[18px] w-[18px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
