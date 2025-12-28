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
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  { icon: Home, label: "홈", href: "/" },
  { icon: PeopleIcon, label: "문의", href: "/leads" },
  { icon: TicketIcon, label: "상담", href: "/tickets" },
  { icon: Calendar, label: "예약", href: "/appointments" },
  { icon: TrendingUp, label: "채널 피벗", href: "/channel-pivot" },
  { icon: PeopleIcon, label: "에이전트 성과", href: "/agent-performance" },
  { icon: BarChart3, label: "퍼널 분석", href: "/funnel" },
  { icon: Activity, label: "채널-진료 분석", href: "/dashboards/channel-treatment-matrix" },
  { icon: Share2, label: "채널", href: "/channels" },
  { icon: FolderTree, label: "채널 관리", href: "/settings/channels" },
  {
    icon: Trash2,
    label: "휴지통",
    href: "/trash",
    children: [
      { label: "휴지통(채널피벗)", href: "/trash/channel-pivot" }
    ]
  },
  { icon: User, label: "프로필", href: "/profiles" },
  { icon: Settings, label: "설정", href: "/settings/channels" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar shadow-lg flex flex-col h-screen">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Menu className="h-5 w-5 text-sidebar-foreground" />
        <span className="text-xl font-bold text-sidebar-foreground">MCRM</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expandedItems.includes(item.label)
          const isChildActive = item.children?.some(child => pathname === child.href)

          return (
            <div key={item.label}>
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive || isChildActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="ml-7 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm transition-all duration-200",
                            pathname === child.href
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-medium"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
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
              )}
            </div>
          )
        })}
      </nav>

      {user && (
        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-lg bg-sidebar-accent/50 px-3 py-2 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-sidebar-foreground/70" />
              <span className="text-sm font-medium text-sidebar-foreground">
                {user.name || user.email}
              </span>
            </div>
            {user.role && (
              <p className="text-xs text-sidebar-foreground/60 ml-6">
                {user.role}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      )}
    </aside>
  )
}
