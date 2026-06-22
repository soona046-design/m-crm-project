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
      value: totalLeads.toString(),
      subtitle: "등록된 문의",
      icon: MessageSquare,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "진행중 상담",
      value: activeTickets.toString(),
      subtitle: "진행중인 상담",
      icon: Users,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    // [SLA 기능 비활성화 2026-06-22] "긴급 상담"(SLA 임박/위반 기반) 카드 제거
    // {
    //   title: "긴급 상담",
    //   value: urgentTickets.toString(),
    //   subtitle: "긴급 문의",
    //   icon: AlertCircle,
    //   color: "text-destructive",
    //   bgColor: "bg-destructive/10",
    // },
    {
      title: "전체 사용자",
      value: totalUsers.toString(),
      subtitle: "등록된 사용자",
      icon: UserCheck,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.title}
            className="border border-border/50 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className={`text-4xl font-bold ${stat.color}`}>{stat.value}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
