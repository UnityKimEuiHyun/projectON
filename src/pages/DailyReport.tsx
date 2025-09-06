import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  Search, 
  Calendar, 
  FileText,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Filter
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DailyReport {
  id: string
  date: string
  author: string
  project: string
  tasks: string[]
  achievements: string[]
  issues: string[]
  nextDayPlan: string
  status: 'draft' | 'submitted' | 'approved'
}

const DailyReport = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("전체")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // 목업 데이터
  const mockReports: DailyReport[] = [
    {
      id: "1",
      date: "2025-01-06",
      author: "김철수",
      project: "웹사이트 리뉴얼",
      tasks: ["로그인 기능 개발", "데이터베이스 설계", "API 연동"],
      achievements: ["로그인 기능 80% 완료", "DB 스키마 설계 완료"],
      issues: ["인증 토큰 만료 처리 이슈"],
      nextDayPlan: "로그인 기능 완료 및 회원가입 기능 시작",
      status: "submitted"
    },
    {
      id: "2",
      date: "2025-01-05",
      author: "이영희",
      project: "모바일 앱 개발",
      tasks: ["UI/UX 디자인", "네비게이션 구현", "상태 관리 설정"],
      achievements: ["메인 화면 디자인 완료", "라우팅 구조 설계"],
      issues: [],
      nextDayPlan: "상태 관리 라이브러리 도입 및 테스트",
      status: "approved"
    },
    {
      id: "3",
      date: "2025-01-04",
      author: "박민수",
      project: "데이터 분석 시스템",
      tasks: ["데이터 수집", "전처리 파이프라인 구축", "시각화 대시보드"],
      achievements: ["데이터 수집 완료", "전처리 로직 구현"],
      issues: ["대용량 데이터 처리 성능 이슈"],
      nextDayPlan: "성능 최적화 및 대시보드 프로토타입 제작",
      status: "draft"
    }
  ]

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.tasks.some(task => task.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filter === "전체" || report.status === filter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "초안"
      case "submitted":
        return "제출됨"
      case "approved":
        return "승인됨"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileText className="h-4 w-4 text-gray-500" />
      case "submitted":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const totalReports = mockReports.length
  const approvedReports = mockReports.filter(r => r.status === 'approved').length
  const pendingReports = mockReports.filter(r => r.status === 'submitted').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">일일 보고서</h1>
          <p className="text-muted-foreground">팀원들의 일일 업무 현황을 확인하세요</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          보고서 작성
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 보고서</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">
              이번 주 작성된 보고서
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인된 보고서</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedReports}</div>
            <p className="text-xs text-muted-foreground">
              승인 완료된 보고서
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">검토 대기</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              승인 대기 중인 보고서
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="작성자, 프로젝트, 업무로 검색..."
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
            <DropdownMenuItem onClick={() => setFilter("draft")}>초안</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("submitted")}>제출됨</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("approved")}>승인됨</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 보고서 목록 */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{report.project}</CardTitle>
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusText(report.status)}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {new Date(report.date).toLocaleDateString()} • {report.author}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(report.status)}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 수행 업무 */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    수행 업무
                  </h4>
                  <ul className="text-sm space-y-1">
                    {report.tasks.map((task, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 성과 */}
                {report.achievements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      주요 성과
                    </h4>
                    <ul className="text-sm space-y-1">
                      {report.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 이슈 */}
                {report.issues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      발생 이슈
                    </h4>
                    <ul className="text-sm space-y-1">
                      {report.issues.map((issue, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 다음날 계획 */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    다음날 계획
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {report.nextDayPlan}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm || filter !== "전체" 
              ? "검색 조건에 맞는 보고서가 없습니다." 
              : "작성된 보고서가 없습니다."}
          </p>
        </div>
      )}
    </div>
  )
}

export default DailyReport
