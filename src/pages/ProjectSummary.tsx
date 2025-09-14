import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Target,
  Building2,
  FileText,
  ClipboardList,
  MessageSquare,
  AlertTriangle,
  CalendarDays,
  TrendingDown
} from "lucide-react"
import { ProjectService } from "@/services/projectService"
import { useAuth } from "@/hooks/useAuth"

// 간단한 타입 정의
interface Project {
  id: string
  name: string
  status: string
  progress: number
  team_size: number
  group_id: string | null
  description: string | null
  created_at: string | null
  updated_at: string | null
}

// 관리 측면 데이터 타입
interface ProjectManagementData {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  delayedTasks: number
  dailyReports: number
  weeklyReports: number
  meetings: number
  delayRate: number
  completionRate: number
}

const ProjectSummary = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [managementData, setManagementData] = useState<ProjectManagementData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadActiveProject()
  }, [])

  // 프로젝트가 로드되면 관리 데이터도 로드
  useEffect(() => {
    if (activeProject) {
      loadManagementData()
    }
  }, [activeProject])

  // 페이지 이동 감지 - F5와 동일한 처리
  useEffect(() => {
    console.log('🔄 프로젝트 요약 페이지 이동 감지:', location.pathname)
    loadActiveProject()
  }, [location.pathname])

  // 페이지 포커스 시 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 프로젝트 요약 페이지 포커스 감지 - 데이터 새로고침')
      loadActiveProject()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const loadActiveProject = async () => {
    try {
      setIsLoading(true)
      console.log('프로젝트 요약 페이지 로드 시작')
      
      // localStorage에서 활성화된 프로젝트 가져오기
      const savedOpenProject = localStorage.getItem('openProject')
      console.log('localStorage openProject:', savedOpenProject)
      
      if (savedOpenProject) {
        try {
          const project = JSON.parse(savedOpenProject)
          console.log('활성화된 프로젝트:', project)
          
          // 프로젝트 데이터 유효성 검사
          if (project && project.id && project.name) {
            setActiveProject(project)
            console.log('프로젝트 설정 완료')
          } else {
            console.log('유효하지 않은 프로젝트 데이터')
            throw new Error('Invalid project data')
          }
        } catch (parseError) {
          console.error('프로젝트 데이터 파싱 실패:', parseError)
          // 파싱 실패 시 첫 번째 프로젝트 로드
          try {
            const projectsData = await ProjectService.getProjects()
            console.log('프로젝트 목록 로드:', projectsData)
            if (projectsData && projectsData.length > 0) {
              setActiveProject(projectsData[0])
            }
          } catch (apiError) {
            console.error('API 호출 실패:', apiError)
          }
        }
      } else {
        console.log('localStorage에 openProject 없음')
        // 활성화된 프로젝트가 없으면 첫 번째 프로젝트 로드
        try {
          const projectsData = await ProjectService.getProjects()
          console.log('프로젝트 목록 로드:', projectsData)
          if (projectsData && projectsData.length > 0) {
            setActiveProject(projectsData[0])
          }
        } catch (apiError) {
          console.error('API 호출 실패:', apiError)
        }
      }
    } catch (error) {
      console.error('프로젝트 로드 실패:', error)
    } finally {
      setIsLoading(false)
      console.log('프로젝트 로드 완료')
    }
  }

  const loadManagementData = async () => {
    try {
      console.log('관리 데이터 로드 시작')
      
      // 실제로는 API에서 데이터를 가져와야 하지만, 
      // 현재는 임시 데이터로 시뮬레이션
      const mockData: ProjectManagementData = {
        totalTasks: 25,
        completedTasks: 18,
        pendingTasks: 5,
        delayedTasks: 2,
        dailyReports: 12,
        weeklyReports: 3,
        meetings: 8,
        delayRate: 8, // 2/25 * 100
        completionRate: 72 // 18/25 * 100
      }
      
      setManagementData(mockData)
      console.log('관리 데이터 로드 완료:', mockData)
    } catch (error) {
      console.error('관리 데이터 로드 실패:', error)
    }
  }

  // 프로젝트 정보가 없을 때 처리
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!activeProject) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">활성화된 프로젝트가 없습니다</h2>
          <p className="text-muted-foreground">프로젝트를 선택하거나 새 프로젝트를 생성해주세요.</p>
        </div>
      </div>
    )
  }

  // 프로젝트 데이터의 기본값 설정
  const projectData = {
    name: activeProject.name || '이름 없음',
    status: activeProject.status || '대기중',
    progress: activeProject.progress || 0,
    team_size: activeProject.team_size || 0,
    group_id: activeProject.group_id || null,
    description: activeProject.description || null,
    created_at: activeProject.created_at || null,
    updated_at: activeProject.updated_at || null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "완료":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "진행중":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "대기중":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "계획중":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료":
        return "bg-green-100 text-green-800"
      case "진행중":
        return "bg-blue-100 text-blue-800"
      case "대기중":
        return "bg-yellow-100 text-yellow-800"
      case "계획중":
        return "bg-gray-100 text-gray-800"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Target className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">프로젝트 요약</h1>
          <p className="text-muted-foreground">현재 프로젝트의 상세 정보를 확인하세요</p>
        </div>
      </div>

      {/* 현재 프로젝트 정보 */}
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <Target className="w-5 h-5 text-primary" />
        <div>
          <span className="text-sm text-muted-foreground">현재 프로젝트:</span>
          <span className="ml-2 text-lg font-semibold">{projectData.name}</span>
        </div>
      </div>

      {/* 프로젝트 관리 정보 */}
      {managementData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 작업</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementData.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                총 작업 수
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료율</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{managementData.completionRate}%</div>
              <Progress value={managementData.completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">지연 작업</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{managementData.delayedTasks}</div>
              <p className="text-xs text-muted-foreground">
                지연율 {managementData.delayRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기 작업</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{managementData.pendingTasks}</div>
              <p className="text-xs text-muted-foreground">
                미완료 작업
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 보고서 및 회의 현황 */}
      {managementData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">일일 보고서</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{managementData.dailyReports}</div>
              <p className="text-xs text-muted-foreground">
                총 작성 건수
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">주간 보고서</CardTitle>
              <ClipboardList className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{managementData.weeklyReports}</div>
              <p className="text-xs text-muted-foreground">
                총 작성 건수
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">회의록</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{managementData.meetings}</div>
              <p className="text-xs text-muted-foreground">
                총 회의 건수
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 작업 현황 상세 */}
      {managementData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>작업 현황</CardTitle>
              <CardDescription>프로젝트 작업의 상세 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">완료된 작업</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-green-600">{managementData.completedTasks}</span>
                    <span className="text-sm text-muted-foreground ml-1">개</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">대기 중인 작업</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-yellow-600">{managementData.pendingTasks}</span>
                    <span className="text-sm text-muted-foreground ml-1">개</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">지연된 작업</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-red-600">{managementData.delayedTasks}</span>
                    <span className="text-sm text-muted-foreground ml-1">개</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">전체 작업</span>
                    <span className="text-lg font-bold">{managementData.totalTasks}개</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>프로젝트 성과</CardTitle>
              <CardDescription>프로젝트의 성과 지표</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">완료율</span>
                    <span className="text-sm font-medium">{managementData.completionRate}%</span>
                  </div>
                  <Progress value={managementData.completionRate} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">지연율</span>
                    <span className="text-sm font-medium text-red-600">{managementData.delayRate}%</span>
                  </div>
                  <Progress value={managementData.delayRate} className="w-full" />
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">프로젝트 기간</span>
                    </div>
                    <span className="text-sm font-medium">
                      {projectData.created_at ? 
                        Math.ceil((new Date().getTime() - new Date(projectData.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 
                        0
                      }일
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}

export default ProjectSummary













