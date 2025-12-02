import { Search, Bell, HelpCircle, UserCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-primary shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="검색..." className="pl-9 bg-white border-0 shadow-sm" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
              4
            </Badge>
          </Button>

          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <HelpCircle className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 pl-3 border-l border-white/30">
            <span className="text-sm font-medium text-white">관리자님 환영합니다</span>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <UserCircle className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
