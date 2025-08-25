import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Search, 
  Mail,
  Phone,
  MoreVertical,
  UserPlus
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockTeamMembers = [
  {
    id: 1,
    name: "김개발",
    email: "kim.dev@company.com",
    role: "개발자",
    status: "활성",
    avatar: null,
    department: "개발팀",
    joinDate: "2023-01-15"
  },
  {
    id: 2,
    name: "이디자인",
    email: "lee.design@company.com",
    role: "디자이너",
    status: "활성",
    avatar: null,
    department: "디자인팀",
    joinDate: "2023-02-20"
  },
  {
    id: 3,
    name: "박기획",
    email: "park.plan@company.com",
    role: "기획자",
    status: "활성",
    avatar: null,
    department: "기획팀",
    joinDate: "2023-03-10"
  },
  {
    id: 4,
    name: "최테스트",
    email: "choi.test@company.com",
    role: "테스터",
    status: "활성",
    avatar: null,
    department: "QA팀",
    joinDate: "2023-04-05"
  },
  {
    id: 5,
    name: "정관리",
    email: "jung.manage@company.com",
    role: "프로젝트 매니저",
    status: "활성",
    avatar: null,
    department: "관리팀",
    joinDate: "2023-01-01"
  }
]

const Team = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMembers = mockTeamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "활성":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">활성</Badge>
      case "휴가":
        return <Badge variant="secondary">휴가</Badge>
      case "비활성":
        return <Badge variant="outline">비활성</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">팀 관리</h1>
          <p className="text-muted-foreground">팀 멤버를 관리하고 조직도를 확인하세요</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          멤버 초대
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="멤버 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar || undefined} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>프로필 보기</DropdownMenuItem>
                    <DropdownMenuItem>편집</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">제거</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-2" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  {member.department}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                {getStatusBadge(member.status)}
                <span className="text-xs text-muted-foreground">
                  {member.joinDate}
                </span>
              </div>
              
              <Button variant="outline" className="w-full">
                연락하기
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">검색 조건에 맞는 멤버가 없습니다.</p>
        </div>
      )}
    </div>
  )
}

export default Team 