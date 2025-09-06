import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Calendar, 
  Users,
  Clock,
  FileText,
  Edit,
  Trash2,
  Filter,
  Video,
  MapPin,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  duration: number
  type: 'in-person' | 'online' | 'hybrid'
  location: string
  organizer: string
  attendees: string[]
  status: 'scheduled' | 'completed' | 'cancelled'
  agenda: string[]
  decisions: string[]
  actionItems: string[]
  project: string
}

const Meetings = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("전체")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // 목업 데이터
  const mockMeetings: Meeting[] = [
    {
      id: "1",
      title: "프로젝트 킥오프 미팅",
      date: "2025-01-06",
      time: "14:00",
      duration: 60,
      type: "online",
      location: "Zoom",
      organizer: "김철수",
      attendees: ["김철수", "이영희", "박민수", "정수진"],
      status: "completed",
      agenda: ["프로젝트 목표 설정", "역할 분담", "일정 계획", "예산 검토"],
      decisions: ["프로젝트 기간: 3개월", "주간 미팅: 매주 월요일", "사용 기술 스택 확정"],
      actionItems: ["요구사항 정의서 작성", "기술 스택 문서화", "개발 환경 구축"],
      project: "웹사이트 리뉴얼"
    },
    {
      id: "2",
      title: "주간 진행 상황 점검",
      date: "2025-01-08",
      time: "10:00",
      duration: 30,
      type: "in-person",
      location: "회의실 A",
      organizer: "이영희",
      attendees: ["이영희", "박민수", "정수진"],
      status: "scheduled",
      agenda: ["지난 주 진행 상황", "이번 주 계획", "이슈 및 블로커", "다음 주 목표"],
      decisions: [],
      actionItems: [],
      project: "모바일 앱 개발"
    },
    {
      id: "3",
      title: "기술 검토 미팅",
      date: "2025-01-05",
      time: "15:30",
      duration: 90,
      type: "hybrid",
      location: "회의실 B + Teams",
      organizer: "박민수",
      attendees: ["박민수", "김철수", "이영희", "정수진", "외부 컨설턴트"],
      status: "completed",
      agenda: ["아키텍처 검토", "성능 최적화 방안", "보안 요구사항", "데이터베이스 설계"],
      decisions: ["마이크로서비스 아키텍처 채택", "Redis 캐싱 도입", "OAuth 2.0 인증 적용"],
      actionItems: ["아키텍처 다이어그램 작성", "성능 테스트 계획 수립", "보안 가이드라인 문서화"],
      project: "데이터 분석 시스템"
    },
    {
      id: "4",
      title: "클라이언트 미팅",
      date: "2025-01-10",
      time: "16:00",
      duration: 45,
      type: "online",
      location: "Google Meet",
      organizer: "김철수",
      attendees: ["김철수", "이영희", "클라이언트 A", "클라이언트 B"],
      status: "scheduled",
      agenda: ["진행 상황 보고", "요구사항 변경사항", "다음 단계 계획", "질의응답"],
      decisions: [],
      actionItems: [],
      project: "웹사이트 리뉴얼"
    }
  ]

  const filteredMeetings = mockMeetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.attendees.some(attendee => attendee.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filter === "전체" || meeting.status === filter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "예정"
      case "completed":
        return "완료"
      case "cancelled":
        return "취소"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "in-person":
        return <MapPin className="h-4 w-4 text-blue-500" />
      case "online":
        return <Video className="h-4 w-4 text-green-500" />
      case "hybrid":
        return <Users className="h-4 w-4 text-purple-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "in-person":
        return "대면"
      case "online":
        return "온라인"
      case "hybrid":
        return "하이브리드"
      default:
        return type
    }
  }

  const totalMeetings = mockMeetings.length
  const completedMeetings = mockMeetings.filter(m => m.status === 'completed').length
  const scheduledMeetings = mockMeetings.filter(m => m.status === 'scheduled').length
  const totalAttendees = mockMeetings.reduce((sum, m) => sum + m.attendees.length, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">회의록</h1>
          <p className="text-muted-foreground">프로젝트 회의를 체계적으로 관리하세요</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          회의 등록
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 회의</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMeetings}</div>
            <p className="text-xs text-muted-foreground">
              전체 회의 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 회의</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedMeetings}</div>
            <p className="text-xs text-muted-foreground">
              진행 완료된 회의
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예정된 회의</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{scheduledMeetings}</div>
            <p className="text-xs text-muted-foreground">
              예정된 회의
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 참석자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendees}</div>
            <p className="text-xs text-muted-foreground">
              전체 참석자 수
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="제목, 주최자, 프로젝트로 검색..."
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
            <DropdownMenuItem onClick={() => setFilter("scheduled")}>예정</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("completed")}>완료</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("cancelled")}>취소</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 회의 목록 */}
      <div className="space-y-4">
        {filteredMeetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                    <Badge className={getStatusColor(meeting.status)}>
                      {getStatusText(meeting.status)}
                    </Badge>
                    <Badge variant="outline">
                      {getTypeText(meeting.type)}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {new Date(meeting.date).toLocaleDateString()} {meeting.time} • {meeting.duration}분 • {meeting.organizer}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(meeting.status)}
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
                {/* 기본 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      {getTypeIcon(meeting.type)}
                      <span className="text-muted-foreground">장소:</span>
                      <span className="font-medium">{meeting.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">참석자:</span>
                      <span className="font-medium">{meeting.attendees.join(", ")}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">프로젝트:</span>
                      <span className="font-medium ml-2">{meeting.project}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">주최자:</span>
                      <span className="font-medium ml-2">{meeting.organizer}</span>
                    </div>
                  </div>
                </div>

                {/* 안건 */}
                {meeting.agenda.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      안건
                    </h4>
                    <ul className="text-sm space-y-1">
                      {meeting.agenda.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 결정사항 */}
                {meeting.decisions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      결정사항
                    </h4>
                    <ul className="text-sm space-y-1">
                      {meeting.decisions.map((decision, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                          {decision}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 액션 아이템 */}
                {meeting.actionItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      액션 아이템
                    </h4>
                    <ul className="text-sm space-y-1">
                      {meeting.actionItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMeetings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm || filter !== "전체" 
              ? "검색 조건에 맞는 회의가 없습니다." 
              : "등록된 회의가 없습니다."}
          </p>
        </div>
      )}
    </div>
  )
}

export default Meetings
