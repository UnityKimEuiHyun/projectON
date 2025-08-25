import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  MoreVertical,
  Filter
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockProjects = [
  {
    id: 1,
    name: "웹사이트 리뉴얼",
    description: "회사 홈페이지 전면 리뉴얼 프로젝트",
    status: "진행중",
    progress: 65,
    dueDate: "2024-01-15",
    teamSize: 5,
    priority: "높음"
  },
  {
    id: 2,
    name: "모바일 앱 개발",
    description: "크로스 플랫폼 모바일 애플리케이션",
    status: "진행중",
    progress: 40,
    dueDate: "2024-02-28",
    teamSize: 8,
    priority: "중간"
  },
  {
    id: 3,
    name: "데이터베이스 최적화",
    description: "시스템 성능 개선 및 DB 최적화",
    status: "대기중",
    progress: 20,
    dueDate: "2024-01-30",
    teamSize: 3,
    priority: "높음"
  },
  {
    id: 4,
    name: "마케팅 캠페인",
    description: "신제품 런칭 마케팅 전략 수립",
    status: "완료",
    progress: 100,
    dueDate: "2023-12-20",
    teamSize: 4,
    priority: "중간"
  },
  {
    id: 5,
    name: "API 문서화",
    description: "개발자를 위한 API 가이드 작성",
    status: "진행중",
    progress: 80,
    dueDate: "2024-01-10",
    teamSize: 2,
    priority: "낮음"
  },
  {
    id: 6,
    name: "보안 강화",
    description: "시스템 보안 점검 및 강화 작업",
    status: "계획중",
    progress: 5,
    dueDate: "2024-03-15",
    teamSize: 6,
    priority: "높음"
  }
]

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("전체")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "진행중":
        return <Badge variant="default">진행중</Badge>
      case "완료":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">완료</Badge>
      case "대기중":
        return <Badge variant="secondary">대기중</Badge>
      case "계획중":
        return <Badge variant="outline">계획중</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "높음":
        return "text-red-600"
      case "중간":
        return "text-yellow-600"
      case "낮음":
        return "text-green-600"
      default:
        return "text-muted-foreground"
    }
  }

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === "전체" || project.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">프로젝트</h1>
          <p className="text-muted-foreground">모든 프로젝트를 관리하고 추적하세요</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          새 프로젝트
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="프로젝트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {filter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter("전체")}>전체</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("진행중")}>진행중</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("완료")}>완료</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("대기중")}>대기중</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("계획중")}>계획중</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {project.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>편집</DropdownMenuItem>
                    <DropdownMenuItem>복제</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">삭제</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center justify-between">
                {getStatusBadge(project.status)}
                <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority} 우선순위
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">진행률</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(project.dueDate).toLocaleDateString('ko-KR')}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {project.teamSize}명
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                프로젝트 보기
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">검색 조건에 맞는 프로젝트가 없습니다.</p>
        </div>
      )}
    </div>
  )
}

export default Projects