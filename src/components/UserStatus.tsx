import { Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface User {
  user_id: string;
  login_id: string;
  name: string;
  email: string;
  role: string;
  clinic_id?: string;
}

interface UserStatusProps {
  users: User[];
}

export function UserStatus({ users }: UserStatusProps) {
  return (
    // TDS: 평면 흰 카드 + 헤어라인, radius 16
    <Card className="rounded-2xl border border-border bg-card shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold tracking-[-0.005em]">사용자 현황</CardTitle>
          {/* brand chip: primary-50 tint 배경 + primary-700 텍스트 (옅은 배경 위 대비 확보) */}
          <Badge className="gap-1 rounded-full border-0 bg-[#FFF5F2] text-[#8C3218] shadow-none hover:bg-[#FFF5F2]">
            <Users className="h-3 w-3" />
            {users.length}명
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-0.5 px-4 pb-4">
        {users.length > 0 ? (
          users.map((user) => (
            // TDS list-row: 행 보더 없이 hover 배경, 44px 아바타 + 타이틀/서브 + 우측 슬롯
            <div
              key={user.user_id}
              className="flex items-center justify-between rounded-xl p-3 hover:bg-muted transition-colors duration-200"
            >
              <div className="flex items-center gap-3.5">
                <Avatar className="h-11 w-11 rounded-[14px]">
                  <AvatarFallback className="rounded-[14px] bg-[#FFF5F2] text-[#8C3218] font-semibold">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="font-semibold text-[15px] tracking-[-0.005em]">{user.name}</h4>
                  <p className="text-[13px] text-muted-foreground">{user.login_id} · {user.email}</p>
                </div>
              </div>

              <Badge variant="outline" className="text-xs rounded-full">
                {user.role}
              </Badge>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-[15px] text-foreground text-center font-medium">아직 등록된 사용자가 없어요</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
