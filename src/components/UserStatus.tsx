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
    <Card className="border border-border/50 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">사용자 현황</CardTitle>
          <Badge variant="secondary" className="gap-1 shadow-sm">
            <Users className="h-3 w-3" />
            {users.length}명
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.user_id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/50 hover:border-border transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">{user.name[0]}</AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="font-semibold text-sm">{user.name}</h4>
                  <p className="text-xs text-muted-foreground">{user.login_id} | {user.email}</p>
                </div>
              </div>

              <Badge variant="outline" className="text-xs">
                {user.role}
              </Badge>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted/70 p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center font-medium">등록된 사용자가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
