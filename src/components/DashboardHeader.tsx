import { Search, Bell, HelpCircle, UserCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function DashboardHeader() {
  return (
    // Insight 헤더: 흰 배경 + 헤어라인 보더 (primary 비중 30% 제한 — 풀컬러 배경 금지)
    <header className="sticky top-0 z-10 border-b border-border bg-white">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="검색..."
              className="pl-9 h-10 rounded-full bg-[#F7F7F7] border-0 shadow-none placeholder:text-[#737373]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative text-[#2E2E2E] hover:bg-[#F8F9FA]">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
              4
            </Badge>
          </Button>

          <Button variant="ghost" size="icon" className="text-[#2E2E2E] hover:bg-[#F8F9FA]">
            <HelpCircle className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 pl-3 border-l border-[rgba(5,5,5,0.06)]">
            <span className="text-sm font-medium text-[#2E2E2E]">관리자님 환영합니다</span>
            <Button variant="ghost" size="icon" className="text-[#2E2E2E] hover:bg-[#F8F9FA]">
              <UserCircle className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
