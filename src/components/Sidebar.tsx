'use client';

import {
  Home,
  Users as PeopleIcon,
  MessageSquare as TicketIcon,
  Calendar,
  TrendingUp,
  BarChart3,
  Share2,
  FolderTree,
  Trash2,
  User,
  Settings,
  Activity,
  Menu,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: Home, label: "홈", href: "/" },
  { icon: PeopleIcon, label: "문의", href: "/leads" },
  { icon: TicketIcon, label: "상담", href: "/tickets" },
  { icon: Calendar, label: "예약", href: "/appointments" },
  { icon: TrendingUp, label: "채널 피벗", href: "/channel-pivot" },
  { icon: PeopleIcon, label: "에이전트 성과", href: "/agent-performance" },
  { icon: BarChart3, label: "퍼널 분석", href: "/funnel" },
  { icon: Share2, label: "채널", href: "/channels" },
  { icon: FolderTree, label: "채널 관리", href: "/settings/channels" },
  { icon: Trash2, label: "휴지통", href: "/trash" },
  { icon: User, label: "프로필", href: "/profiles" },
  { icon: Settings, label: "설정", href: "/settings/channels" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar shadow-lg">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Menu className="h-5 w-5 text-sidebar-foreground" />
        <span className="text-xl font-bold text-sidebar-foreground">MCRM</span>
      </div>

      <nav className="space-y-1 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
