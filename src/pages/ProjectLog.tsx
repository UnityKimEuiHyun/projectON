import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter,
  Clock,
  User,
  FileText,
  GitCommit,
  AlertCircle,
  CheckCircle,
  Info,
  Bug,
  Plus,
  Calendar
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProjectLog {
  id: string
  timestamp: string
  author: string
  action: string
  category: 'commit' | 'deploy' | 'issue' | 'feature' | 'bug' | 'info'
  description: string
  project: string
  details?: string
}

const ProjectLog = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("전체")
  
  // 목업 데이터
  const mockLogs: ProjectLog[] = [
    {
      id: "1",
      timestamp: "2025-01-06 14:30:25",
      author: "김철수",
      action: "코드 커밋",
      category: "commit",
      description: "로그인 기능 구현 완료",
      project: "웹사이트 리뉴얼",
      details: "사용자 인증 로직 및 JWT 토큰 처리 구현"
    },
    {
      id: "2",
      timestamp: "2025-01-06 13:15:10",
      author: "이영희",
      action: "이슈 해결",
      category: "bug",
      description: "로그인 버튼 클릭 시 오류 수정",
      project: "모바일 앱 개발",
      details: "버튼 이벤트 핸들러에서 null 참조 오류 수정"
    },
    {
      id: "3",
      timestamp: "2025-01-06 11:45:30",
      author: "박민수",
      action: "배포 완료",
      category: "deploy",
      description: "데이터 분석 시스템 v1.2.0 배포",
      project: "데이터 분석 시스템",
      details: "성능 최적화 및 새로운 차트 기능 추가"
    },
    {
      id: "4",
      timestamp: "2025-01-06 10:20:15",
      author: "김철수",
      action: "새 기능 추가",
      category: "feature",
      description: "사용자 프로필 편집 기능 구현",
      project: "웹사이트 리뉴얼",
      details: "프로필 이미지 업로드 및 기본 정보 수정 기능"
    },
    {
      id: "5",
      timestamp: "2025-01-06 09:30:45",
      author: "이영희",
      action: "이슈 등록",
      category: "issue",
      description: "API 응답 속도 개선 필요",
      project: "모바일 앱 개발",
      details: "특정 API 엔드포인트의 응답 시간이 3초 이상 소요됨"
    },
    {
      id: "6",
      timestamp: "2025-01-05 16:45:20",
      author: "박민수",
      action: "정보 업데이트",
      category: "info",
      description: "데이터베이스 백업 완료",
      project: "데이터 분석 시스템",
      details: "일일 자동 백업이 성공적으로 완료됨"
    },
    {
      id: "7",
      timestamp: "2025-01-05 15:10:30",
      author: "김철수",
      action: "코드 커밋",
      category: "commit",
      description: "API 문서 업데이트",
      project: "웹사이트 리뉴얼",
      details: "새로운 엔드포인트 문서화 및 예제 코드 추가"
    },
    {
      id: "8",
      timestamp: "2025-01-05 14:25:10",
      author: "이영희",
      action: "이슈 해결",
      category: "bug",
      description: "메모리 누수 문제 해결",
      project: "모바일 앱 개발",
      details: "이미지 캐싱에서 발생한 메모리 누수 수정"
    }
  ]

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.project.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === "전체" || log.category === filter
    return matchesSearch && matchesFilter
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "commit":
        return <GitCommit className="h-4 w-4 text-blue-500" />
      case "deploy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "issue":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "feature":
        return <Plus className="h-4 w-4 text-purple-500" />
      case "bug":
        return <Bug className="h-4 w-4 text-red-500" />
      case "info":
        return <Info className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "commit":
        return "bg-blue-100 text-blue-800"
      case "deploy":
        return "bg-green-100 text-green-800"
      case "issue":
        return "bg-orange-100 text-orange-800"
      case "feature":
        return "bg-purple-100 text-purple-800"
      case "bug":
        return "bg-red-100 text-red-800"
      case "info":
        return "bg-gray-100 text-gray-800"
      default:
        return "text-muted-foreground"
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "commit":
        return "커밋"
      case "deploy":
        return "배포"
      case "issue":
        return "이슈"
      case "feature":
        return "기능"
      case "bug":
        return "버그"
      case "info":
        return "정보"
      default:
        return category
    }
  }

  const totalLogs = mockLogs.length
  const commits = mockLogs.filter(log => log.category === 'commit').length
  const deployments = mockLogs.filter(log => log.category === 'deploy').length
  const issues = mockLogs.filter(log => log.category === 'issue').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">프로젝트 로그</h1>
        <p className="text-muted-foreground">프로젝트의 모든 활동과 변경사항을 추적하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 로그</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
            <p className="text-xs text-muted-foreground">
              전체 활동 로그
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">커밋</CardTitle>
            <GitCommit className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{commits}</div>
            <p className="text-xs text-muted-foreground">
              코드 커밋 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">배포</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deployments}</div>
            <p className="text-xs text-muted-foreground">
              배포 횟수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이슈</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{issues}</div>
            <p className="text-xs text-muted-foreground">
              등록된 이슈
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="작성자, 액션, 설명으로 검색..."
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
            <DropdownMenuItem onClick={() => setFilter("commit")}>커밋</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("deploy")}>배포</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("issue")}>이슈</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("feature")}>기능</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("bug")}>버그</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("info")}>정보</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 로그 목록 */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getCategoryIcon(log.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(log.category)}>
                      {getCategoryText(log.category)}
                    </Badge>
                    <span className="text-sm font-medium">{log.action}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{log.project}</span>
                  </div>
                  
                  <h3 className="text-sm font-semibold mb-1">{log.description}</h3>
                  
                  {log.details && (
                    <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {log.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm || filter !== "전체" 
              ? "검색 조건에 맞는 로그가 없습니다." 
              : "기록된 로그가 없습니다."}
          </p>
        </div>
      )}
    </div>
  )
}

export default ProjectLog
