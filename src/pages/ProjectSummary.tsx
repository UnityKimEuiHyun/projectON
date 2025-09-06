import { useState, useEffect } from "react"
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
  XCircle
} from "lucide-react"
import { ProjectService } from "@/services/projectService"
import { useAuth } from "@/hooks/useAuth"
import type { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']

const ProjectSummary = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const data = await ProjectService.getProjects()
      setProjects(data)
    } catch (error) {
      console.error('프로젝트 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 통계 계산
  const totalProjects = projects.length
  const completedProjects = projects.filter(p => p.status === '완료').length
  const inProgressProjects = projects.filter(p => p.status === '진행중').length
  const pendingProjects = projects.filter(p => p.status === '대기중').length
  const plannedProjects = projects.filter(p => p.status === '계획중').length

  const averageProgress = totalProjects > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
    : 0

  const totalTeamSize = projects.reduce((sum, p) => sum + p.team_size, 0)

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">프로젝트 요약</h1>
        <p className="text-muted-foreground">전체 프로젝트 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 프로젝트</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              전체 프로젝트 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 프로젝트</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}% 완료율
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행 중</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressProjects}</div>
            <p className="text-xs text-muted-foreground">
              현재 진행 중인 프로젝트
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 진행률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <Progress value={averageProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* 프로젝트 상태별 분포 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>프로젝트 상태 분포</CardTitle>
            <CardDescription>전체 프로젝트의 상태별 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon("완료")}
                  <span className="text-sm">완료</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{completedProjects}</span>
                  <Badge className={getStatusColor("완료")}>
                    {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon("진행중")}
                  <span className="text-sm">진행중</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{inProgressProjects}</span>
                  <Badge className={getStatusColor("진행중")}>
                    {totalProjects > 0 ? Math.round((inProgressProjects / totalProjects) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon("대기중")}
                  <span className="text-sm">대기중</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{pendingProjects}</span>
                  <Badge className={getStatusColor("대기중")}>
                    {totalProjects > 0 ? Math.round((pendingProjects / totalProjects) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon("계획중")}
                  <span className="text-sm">계획중</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{plannedProjects}</span>
                  <Badge className={getStatusColor("계획중")}>
                    {totalProjects > 0 ? Math.round((plannedProjects / totalProjects) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>팀 현황</CardTitle>
            <CardDescription>전체 프로젝트의 팀 구성 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">총 팀원 수</span>
                </div>
                <span className="text-lg font-semibold">{totalTeamSize}명</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">평균 팀 크기</span>
                </div>
                <span className="text-lg font-semibold">
                  {totalProjects > 0 ? Math.round(totalTeamSize / totalProjects) : 0}명
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 프로젝트 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 프로젝트</CardTitle>
          <CardDescription>전체 프로젝트 목록</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">등록된 프로젝트가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(project.status)}
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{project.progress}%</div>
                      <Progress value={project.progress} className="w-20 h-2" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {project.team_size}명
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProjectSummary
