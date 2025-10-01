import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Calendar, Filter, Download, ZoomIn, ZoomOut } from "lucide-react"

export default function Timeline() {
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [zoomLevel, setZoomLevel] = useState<number>(1)

  // 임시 데이터 - 이미지의 실제 프로젝트 데이터를 반영
  const projects = [
    { id: "1", name: "물류 창고 시뮬레이션 프로젝트", status: "진행중" },
    { id: "2", name: "웹사이트 리뉴얼 프로젝트", status: "진행중" },
    { id: "3", name: "모바일 앱 개발", status: "계획중" },
  ]

  // 여러 프로젝트의 Lv1 작업들만 표시
  const projectTasks = [
    // 물류 창고 시뮬레이션 프로젝트
    {
      id: "1",
      project: "물류 창고 시뮬레이션 프로젝트",
      name: "1. 프로젝트 기획",
      startDate: "2025-09-01",
      endDate: "2025-09-31",
      progress: 100,
      assignee: "프로젝트 매니저",
      status: "완료",
      color: "bg-blue-200",
      level: 1
    },
    {
      id: "2",
      project: "물류 창고 시뮬레이션 프로젝트",
      name: "2. Parameter 설계",
      startDate: "2025-09-01",
      endDate: "2025-10-31",
      progress: 85,
      assignee: "설계팀",
      status: "진행중",
      color: "bg-green-200",
      level: 2
    },
    {
      id: "3",
      project: "물류 창고 시뮬레이션 프로젝트",
      name: "3. 지표 계산 로직 개발",
      startDate: "2025-11-01",
      endDate: "2025-12-31",
      progress: 60,
      assignee: "개발팀",
      status: "진행중",
      color: "bg-orange-200",
      level: 3
    },
    {
      id: "4",
      project: "물류 창고 시뮬레이션 프로젝트",
      name: "4. 어댑터 개발",
      startDate: "2025-10-01",
      endDate: "2026-01-31",
      progress: 45,
      assignee: "개발팀",
      status: "진행중",
      color: "bg-pink-200",
      level: 4
    },

    // 웹사이트 리뉴얼 프로젝트
    {
      id: "5",
      project: "웹사이트 리뉴얼 프로젝트",
      name: "1. 프로젝트 기획",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      progress: 100,
      assignee: "프로젝트 매니저",
      status: "완료",
      color: "bg-blue-200",
      level: 1
    },
    {
      id: "6",
      project: "웹사이트 리뉴얼 프로젝트",
      name: "2. 디자인",
      startDate: "2024-02-01",
      endDate: "2024-02-28",
      progress: 100,
      assignee: "디자인팀",
      status: "완료",
      color: "bg-green-200",
      level: 2
    },
    {
      id: "7",
      project: "웹사이트 리뉴얼 프로젝트",
      name: "3. 개발",
      startDate: "2024-03-01",
      endDate: "2024-05-31",
      progress: 80,
      assignee: "개발팀",
      status: "진행중",
      color: "bg-orange-200",
      level: 3
    },

    // 모바일 앱 개발
    {
      id: "8",
      project: "모바일 앱 개발",
      name: "1. 프로젝트 기획",
      startDate: "2024-06-01",
      endDate: "2024-06-30",
      progress: 0,
      assignee: "프로젝트 매니저",
      status: "계획중",
      color: "bg-blue-200",
      level: 1
    },
    {
      id: "9",
      project: "모바일 앱 개발",
      name: "2. UI/UX 디자인",
      startDate: "2024-07-01",
      endDate: "2024-08-31",
      progress: 0,
      assignee: "디자인팀",
      status: "계획중",
      color: "bg-green-200",
      level: 2
    },
    {
      id: "10",
      project: "모바일 앱 개발",
      name: "3. 앱 개발",
      startDate: "2024-09-01",
      endDate: "2024-12-31",
      progress: 0,
      assignee: "개발팀",
      status: "계획중",
      color: "bg-orange-200",
      level: 3
    }
  ]

  // 연도별 월 표시 (2024년 1월부터 2026년 1월까지)
  const months = [
    { year: 2024, month: 1, label: "2024년 1월" },
    { year: 2024, month: 2, label: "2024년 2월" },
    { year: 2024, month: 3, label: "2024년 3월" },
    { year: 2024, month: 4, label: "2024년 4월" },
    { year: 2024, month: 5, label: "2024년 5월" },
    { year: 2024, month: 6, label: "2024년 6월" },
    { year: 2024, month: 7, label: "2024년 7월" },
    { year: 2024, month: 8, label: "2024년 8월" },
    { year: 2024, month: 9, label: "2024년 9월" },
    { year: 2024, month: 10, label: "2024년 10월" },
    { year: 2024, month: 11, label: "2024년 11월" },
    { year: 2024, month: 12, label: "2024년 12월" },
    { year: 2025, month: 1, label: "2025년 1월" },
    { year: 2025, month: 2, label: "2025년 2월" },
    { year: 2025, month: 3, label: "2025년 3월" },
    { year: 2025, month: 4, label: "2025년 4월" },
    { year: 2025, month: 5, label: "2025년 5월" },
    { year: 2025, month: 6, label: "2025년 6월" },
    { year: 2025, month: 7, label: "2025년 7월" },
    { year: 2025, month: 8, label: "2025년 8월" },
    { year: 2025, month: 9, label: "2025년 9월" },
    { year: 2025, month: 10, label: "2025년 10월" },
    { year: 2025, month: 11, label: "2025년 11월" },
    { year: 2025, month: 12, label: "2025년 12월" },
    { year: 2026, month: 1, label: "2026년 1월" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료": return "bg-green-100 text-green-800"
      case "진행중": return "bg-blue-100 text-blue-800"
      case "계획중": return "bg-yellow-100 text-yellow-800"
      case "지연": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-blue-500"
    if (progress >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const calculateTaskPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // 2024년 1월을 기준점(0)으로 설정
    const baseDate = new Date('2024-01-01')
    const startDiff = start.getTime() - baseDate.getTime()
    const endDiff = end.getTime() - baseDate.getTime()
    
    const startMonth = Math.floor(startDiff / (1000 * 60 * 60 * 24 * 30.44))
    const endMonth = Math.floor(endDiff / (1000 * 60 * 60 * 24 * 30.44))
    const duration = endMonth - startMonth + 1
    
    return {
      left: `${startMonth * 100}%`,
      width: `${duration * 100}%`
    }
  }

  const isTaskInMonth = (task: any, month: any) => {
    const taskStart = new Date(task.startDate)
    const taskEnd = new Date(task.endDate)
    const monthStart = new Date(month.year, month.month - 1, 1)
    const monthEnd = new Date(month.year, month.month, 0)
    
    return taskStart <= monthEnd && taskEnd >= monthStart
  }

  // 프로젝트별로 작업 그룹화
  const groupedTasks = projectTasks.reduce((acc, task) => {
    if (!acc[task.project]) {
      acc[task.project] = []
    }
    acc[task.project].push(task)
    return acc
  }, {} as Record<string, typeof projectTasks>)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">프로젝트 타임라인</h1>
          <p className="text-muted-foreground">선택된 프로젝트의 전체 일정을 간트 차트로 확인할 수 있습니다.</p>
        </div>
      </div>

      {/* 컨트롤 패널 */}
      <Card>
        <CardHeader>
          <CardTitle>타임라인 설정</CardTitle>
          <CardDescription>프로젝트 선택 및 차트 옵션을 설정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">프로젝트:</span>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="프로젝트 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 프로젝트</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">줌:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 간트 차트 */}
      <Card>
        <CardHeader>
          <CardTitle>전체 프로젝트 계획</CardTitle>
          <CardDescription>여러 프로젝트의 Lv1 작업들을 통합하여 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div 
              className="inline-block" 
              style={{ 
                width: `${64 + (months.length * 32)}rem`,
                transform: `scale(${zoomLevel})`, 
                transformOrigin: 'top left' 
              }}
            >
              {/* 헤더 - 연도별 월 구분 */}
              <div className="flex border-b border-gray-200">
                <div className="w-64 p-3 font-medium bg-gray-50 border-r border-gray-200 flex-shrink-0">
                  프로젝트명
                </div>
                {months.map((month, index) => (
                  <div 
                    key={`${month.year}-${month.month}`} 
                    className={`w-32 p-3 text-center font-medium bg-gray-50 flex-shrink-0 ${
                      index < months.length - 1 ? 'border-r border-gray-200' : ''
                    }`}
                  >
                    <div className="text-sm">{month.label}</div>
                    <div className="text-xs text-muted-foreground">{month.year}</div>
                  </div>
                ))}
              </div>

              {/* 카테고리별 작업 행 */}
              {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
                <div key={category}>
                  {/* 카테고리 헤더 */}
                  <div className="flex border-b border-gray-200 bg-gray-100">
                    <div className="w-64 p-3 font-semibold border-r border-gray-200 flex-shrink-0">
                      {category}
                    </div>
                    {months.map((month, index) => (
                      <div 
                        key={`${month.year}-${month.month}`} 
                        className={`w-32 p-3 flex-shrink-0 ${
                          index < months.length - 1 ? 'border-r border-gray-200' : ''
                        }`}
                      >
                      </div>
                    ))}
                  </div>

                  {/* 카테고리 내 작업들 */}
                  {categoryTasks.map((task) => (
                    <div key={task.id} className="flex border-b border-gray-200 hover:bg-gray-50">
                      {/* 작업 정보 */}
                      <div className="w-64 p-3 border-r border-gray-200 flex-shrink-0">
                        <div className="font-medium text-sm">{task.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          담당: {task.assignee}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getStatusColor(task.status)} variant="secondary">
                            {task.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {task.progress}%
                          </div>
                        </div>
                      </div>

                      {/* 타임라인 바 */}
                      {months.map((month, index) => (
                        <div 
                          key={`${month.year}-${month.month}`} 
                          className={`w-32 p-1 relative flex-shrink-0 ${
                            index < months.length - 1 ? 'border-r border-gray-200' : ''
                          }`}
                        >
                          {isTaskInMonth(task, month) && (
                            <div className="relative h-8">
                              <div
                                className={`absolute top-1 left-1 right-1 h-6 rounded ${task.color} opacity-80`}
                                style={{
                                  left: month.month === new Date(task.startDate).getMonth() + 1 && month.year === new Date(task.startDate).getFullYear() ? '4px' : '0px',
                                  right: month.month === new Date(task.endDate).getMonth() + 1 && month.year === new Date(task.endDate).getFullYear() ? '4px' : '0px'
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs text-gray-800 font-medium">
                                  {month.month === new Date(task.startDate).getMonth() + 1 && month.year === new Date(task.startDate).getFullYear() ? task.name.substring(0, 15) + '...' : ''}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 범례 - Lv1 작업 단계별 색상 */}
      <Card>
        <CardHeader>
          <CardTitle>범례</CardTitle>
          <CardDescription>Lv1 작업 단계별 색상 구분</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 rounded"></div>
              <span className="text-sm">1단계: 프로젝트 기획</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span className="text-sm">2단계: 설계/디자인</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 rounded"></div>
              <span className="text-sm">3단계: 개발/구현</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-200 rounded"></div>
              <span className="text-sm">4단계: 테스트/배포</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
