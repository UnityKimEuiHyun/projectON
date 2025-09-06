import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  FolderOpen, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  TrendingUp,
  User,
  Target,
  FileText,
  Star,
  ArrowRight,
  MessageSquare,
  List
} from "lucide-react"
import { ProjectService } from "@/services/projectService"
import { FavoriteService } from "@/services/favoriteService"
import { useAuth } from "@/hooks/useAuth"
import type { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']

interface PersonalTask {
  id: string
  title: string
  project: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'completed'
  description: string
}

interface Mention {
  id: string
  author: string
  message: string
  time: string
  project: string
  taskTitle: string
  isRead: boolean
}

const Dashboard = () => {
  const { user } = useAuth()
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([])
  const [mockMentions, setMockMentions] = useState<Mention[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    
    // 사이드바에 열린 프로젝트로 설정
    localStorage.setItem('openProject', JSON.stringify(project))
    
    // 다른 탭에서도 상태가 업데이트되도록 이벤트 발생
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'openProject',
      newValue: JSON.stringify(project),
      oldValue: localStorage.getItem('openProject')
    }))
    
    // 프로젝트별 데이터 로드
    if (project.name === "임시 프로젝트" || project.name === "프로젝트 관리 페이지 제작") {
      // 기존 데이터 완전 삭제 후 프로젝트별 데이터만 로드
      setPersonalTasks([])
      setMockMentions([])
      
      // 프로젝트별 데이터만 로드
      loadProjectSpecificTasks(project.name)
      loadProjectSpecificMentions(project.name)
    } else {
      // 다른 프로젝트 선택 시 기본 데이터 표시
      loadPersonalTasks()
      loadMentions()
    }
  }

  // React Query로 프로젝트 데이터 관리
  const { 
    data: myProjects = [], 
    isLoading,
    error: projectsError
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const projects = await ProjectService.getProjects()
      // 실제로는 사용자가 참여한 프로젝트만 필터링해야 함
      return projects.slice(0, 3) // 목업용으로 3개만 표시
    }
  })

  // React Query로 즐겨찾기 데이터 관리
  const { data: favoriteProjectIdsList = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => FavoriteService.getUserFavorites(user!.id),
    enabled: !!user,
  })

  // 에러 처리
  useEffect(() => {
    if (projectsError) {
      console.error('프로젝트 로드 실패:', projectsError)
    }
  }, [projectsError])

  // 즐겨찾기 상태를 useMemo로 최적화하여 무한 루프 방지
  const favoriteProjectIdsSet = useMemo(() => {
    return new Set(favoriteProjectIdsList || [])
  }, [favoriteProjectIdsList])

  // 프로젝트를 즐겨찾기 순으로 정렬하는 함수
  const getSortedProjects = (projects: Project[]) => {
    return [...projects].sort((a, b) => {
      const aIsFavorite = favoriteProjectIdsSet.has(a.id)
      const bIsFavorite = favoriteProjectIdsSet.has(b.id)
      
      // 즐겨찾기된 프로젝트가 먼저 오도록 정렬
      if (aIsFavorite && !bIsFavorite) return -1
      if (!aIsFavorite && bIsFavorite) return 1
      
      // 즐겨찾기 상태가 같으면 프로젝트명으로 정렬
      return a.name.localeCompare(b.name)
    })
  }

  useEffect(() => {
    loadPersonalTasks()
    loadMentions()
  }, [])

  // 사이드바의 열린 프로젝트 상태와 동기화
  useEffect(() => {
    const savedOpenProject = localStorage.getItem('openProject')
    if (savedOpenProject) {
      try {
        const openProject = JSON.parse(savedOpenProject)
        setSelectedProject(openProject)
      } catch (e) {
        console.error('Failed to parse saved open project:', e)
      }
    }

    // localStorage 변경 이벤트 리스너
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'openProject') {
        if (e.newValue) {
          try {
            const openProject = JSON.parse(e.newValue)
            setSelectedProject(openProject)
          } catch (error) {
            console.error('Failed to parse open project from storage event:', error)
          }
        } else {
          setSelectedProject(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loadPersonalTasks = () => {
    // 기본 목업 개인 업무 데이터 (오늘 날짜 기준으로 동적 계산)
    const baseTasks: PersonalTask[] = [
      {
        id: "1",
        title: "로그인 기능 개발",
        project: "웹사이트 리뉴얼",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5일 후
        priority: "high",
        status: "in_progress",
        description: "JWT 토큰 기반 인증 시스템 구현"
      },
      {
        id: "2",
        title: "API 문서 작성",
        project: "모바일 앱 개발",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2일 후
        priority: "medium",
        status: "todo",
        description: "REST API 엔드포인트 문서화"
      },
      {
        id: "3",
        title: "데이터베이스 스키마 검토",
        project: "데이터 분석 시스템",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7일 후
        priority: "high",
        status: "todo",
        description: "성능 최적화를 위한 스키마 리뷰"
      },
      {
        id: "4",
        title: "UI 컴포넌트 테스트",
        project: "웹사이트 리뉴얼",
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1일 전 (완료됨)
        priority: "low",
        status: "completed",
        description: "React 컴포넌트 단위 테스트 작성"
      }
    ]
    setPersonalTasks(baseTasks)
  }

  const loadProjectSpecificTasks = (projectName: string) => {
    let projectTasks: PersonalTask[] = []
    
    if (projectName === "임시 프로젝트") {
      projectTasks = [
        {
          id: "temp-1",
          title: "프로젝트 초기 설정",
          project: "임시 프로젝트",
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1일 후
          priority: "high",
          status: "in_progress",
          description: "프로젝트 구조 및 기본 설정 구성"
        },
        {
          id: "temp-2",
          title: "데이터베이스 설계",
          project: "임시 프로젝트",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3일 후
          priority: "high",
          status: "todo",
          description: "ERD 작성 및 테이블 구조 설계"
        },
        {
          id: "temp-3",
          title: "API 설계서 작성",
          project: "임시 프로젝트",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2일 후
          priority: "medium",
          status: "todo",
          description: "RESTful API 엔드포인트 설계 및 문서화"
        },
        {
          id: "temp-4",
          title: "UI/UX 와이어프레임",
          project: "임시 프로젝트",
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4일 후
          priority: "medium",
          status: "todo",
          description: "사용자 인터페이스 와이어프레임 및 프로토타입 제작"
        }
      ]
    } else if (projectName === "프로젝트 관리 페이지 제작") {
      projectTasks = [
        {
          id: "pm-1",
          title: "대시보드 UI 구현",
          project: "프로젝트 관리 페이지 제작",
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1일 후
          priority: "high",
          status: "in_progress",
          description: "React 컴포넌트 기반 대시보드 레이아웃 구현"
        },
        {
          id: "pm-2",
          title: "프로젝트 목록 기능",
          project: "프로젝트 관리 페이지 제작",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2일 후
          priority: "high",
          status: "todo",
          description: "프로젝트 CRUD 기능 및 목록 표시 구현"
        },
        {
          id: "pm-3",
          title: "사용자 권한 관리",
          project: "프로젝트 관리 페이지 제작",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3일 후
          priority: "medium",
          status: "todo",
          description: "역할 기반 접근 제어 및 권한 관리 시스템"
        },
        {
          id: "pm-4",
          title: "데이터 시각화",
          project: "프로젝트 관리 페이지 제작",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5일 후
          priority: "low",
          status: "todo",
          description: "차트 및 그래프를 활용한 프로젝트 진행률 시각화"
        },
        {
          id: "pm-5",
          title: "반응형 디자인",
          project: "프로젝트 관리 페이지 제작",
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4일 후
          priority: "medium",
          status: "todo",
          description: "모바일 및 태블릿 환경 대응 반응형 레이아웃"
        }
      ]
    }
    
    // 프로젝트별 데이터만 표시 (기존 데이터 교체)
    setPersonalTasks(projectTasks)
  }

  const loadMentions = () => {
    // 기본 목업 @ 호출 메시지 데이터
    const baseMentions: Mention[] = [
      {
        id: "1",
        author: "김철수",
        message: "@{user} 로그인 기능에서 인증 토큰 처리 부분을 검토해주실 수 있나요?",
        time: "2시간 전",
        project: "웹사이트 리뉴얼",
        taskTitle: "로그인 기능 개발",
        isRead: false
      },
      {
        id: "2",
        author: "이영희",
        message: "@{user} API 문서에 새로운 엔드포인트 정보를 추가해주세요.",
        time: "4시간 전",
        project: "모바일 앱 개발",
        taskTitle: "API 문서 작성",
        isRead: true
      },
      {
        id: "3",
        author: "박민수",
        message: "@{user} 데이터베이스 성능 최적화 방안에 대해 의견을 듣고 싶습니다.",
        time: "1일 전",
        project: "데이터 분석 시스템",
        taskTitle: "데이터베이스 스키마 검토",
        isRead: false
      },
      {
        id: "4",
        author: "정수진",
        message: "@{user} 테스트 케이스가 잘 작성되었네요! 다른 컴포넌트도 참고하겠습니다.",
        time: "2일 전",
        project: "웹사이트 리뉴얼",
        taskTitle: "UI 컴포넌트 테스트",
        isRead: true
      }
    ]
    setMockMentions(baseMentions)
  }

  const loadProjectSpecificMentions = (projectName: string) => {
    let projectMentions: Mention[] = []
    
    if (projectName === "임시 프로젝트") {
      projectMentions = [
        {
          id: "temp-mention-1",
          author: "김개발",
          message: "@{user} 프로젝트 초기 설정에서 사용할 기술 스택에 대해 논의해보고 싶습니다.",
          time: "1시간 전",
          project: "임시 프로젝트",
          taskTitle: "프로젝트 초기 설정",
          isRead: false
        },
        {
          id: "temp-mention-2",
          author: "이디자인",
          message: "@{user} 데이터베이스 설계 시 고려사항이 있으시면 공유해주세요.",
          time: "3시간 전",
          project: "임시 프로젝트",
          taskTitle: "데이터베이스 설계",
          isRead: true
        }
      ]
    } else if (projectName === "프로젝트 관리 페이지 제작") {
      projectMentions = [
        {
          id: "pm-mention-1",
          author: "박프론트",
          message: "@{user} 대시보드 UI에서 차트 라이브러리 선택에 대해 의견을 듣고 싶습니다.",
          time: "30분 전",
          project: "프로젝트 관리 페이지 제작",
          taskTitle: "대시보드 UI 구현",
          isRead: false
        },
        {
          id: "pm-mention-2",
          author: "최백엔드",
          message: "@{user} 프로젝트 목록 기능의 API 설계가 완료되었습니다. 리뷰 부탁드립니다.",
          time: "2시간 전",
          project: "프로젝트 관리 페이지 제작",
          taskTitle: "프로젝트 목록 기능",
          isRead: false
        },
        {
          id: "pm-mention-3",
          author: "정디자인",
          message: "@{user} 반응형 디자인 가이드라인을 공유해드릴게요. 참고해주세요!",
          time: "5시간 전",
          project: "프로젝트 관리 페이지 제작",
          taskTitle: "반응형 디자인",
          isRead: true
        }
      ]
    }
    
    // 프로젝트별 메시지만 표시 (기존 메시지 교체)
    setMockMentions(projectMentions)
  }


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "높음"
      case "medium":
        return "보통"
      case "low":
        return "낮음"
      default:
        return priority
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "todo":
        return "할 일"
      case "in_progress":
        return "진행중"
      case "completed":
        return "완료"
      default:
        return status
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const isOverdue = (dueDate: string) => {
    return getDaysUntilDue(dueDate) < 0
  }

  const isDueSoon = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate)
    return days >= 0 && days <= 3
  }

  const completedTasks = personalTasks.filter(task => task.status === 'completed').length
  const inProgressTasks = personalTasks.filter(task => task.status === 'in_progress').length
  const todoTasks = personalTasks.filter(task => task.status === 'todo').length
  const overdueTasks = personalTasks.filter(task => isOverdue(task.dueDate)).length
  const dueSoonTasks = personalTasks.filter(task => isDueSoon(task.dueDate)).length

  const urgentTasks = personalTasks.filter(task => 
    task.priority === 'high' && (task.status === 'todo' || task.status === 'in_progress')
  )

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
        <h1 className="text-3xl font-bold">개인 대시보드</h1>
        <p className="text-muted-foreground">내 업무 현황과 할 일을 확인하세요</p>
      </div>

      {/* 내 프로젝트 현황 */}
        <Card>
        <CardHeader>
          <CardTitle>
            내 프로젝트 현황
          </CardTitle>
          <CardDescription>참여하고 있는 프로젝트들의 진행 상황과 업무 통계</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">프로젝트명</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">설명</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">상태</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">진행률</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">팀 크기</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">마감일</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">완료</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">진행중</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">마감임박</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">지연</th>
                </tr>
              </thead>
              <tbody>
                {myProjects.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-muted-foreground">
                      참여 중인 프로젝트가 없습니다
                    </td>
                  </tr>
                ) : (
                  getSortedProjects(myProjects).map((project) => {
                    // 각 프로젝트별 업무 통계 계산
                    const projectTasks = personalTasks.filter(task => task.project === project.name)
                    const projectCompleted = projectTasks.filter(task => task.status === 'completed').length
                    const projectInProgress = projectTasks.filter(task => task.status === 'in_progress').length
                    const projectDueSoon = projectTasks.filter(task => 
                      isDueSoon(task.dueDate) && task.status !== 'completed'
                    ).length
                    const projectOverdue = projectTasks.filter(task => isOverdue(task.dueDate)).length

                     return (
                       <tr key={project.id} className="border-b hover:bg-muted/50">
                         <td className="py-3 px-4">
                           <Button
                             variant={selectedProject?.id === project.id ? "default" : "outline"}
                             className={`h-8 px-3 font-medium text-sm text-left justify-start transition-all duration-200 ${
                               selectedProject?.id === project.id 
                                 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md ring-2 ring-blue-300 ring-offset-2' 
                                 : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                             }`}
                             onClick={() => handleProjectSelect(project)}
                           >
                             <div className="flex items-center gap-2">
                               {favoriteProjectIdsSet.has(project.id) && (
                                 <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                               )}
                               {project.name}
                             </div>
                           </Button>
                         </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {project.description}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-blue-100 text-blue-800">
                            {project.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{project.progress}%</div>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {project.team_size}명
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {project.due_date ? new Date(project.due_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600">{projectCompleted}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-600">{projectInProgress}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium text-orange-600">{projectDueSoon}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium text-red-600">{projectOverdue}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          </CardContent>
        </Card>


      {/* 프로젝트 상세 정보 섹션 */}
      {selectedProject && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-500" />
            {selectedProject.name} - 프로젝트 상세 정보
          </h2>
        </div>
      )}

      {/* 업무 관리 섹션 */}
      <div className="space-y-6">
        {/* 전체 업무 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5 text-purple-500" />
              전체 업무 목록
            </CardTitle>
            <CardDescription>모든 개인 업무의 상세 목록</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">업무명</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">우선순위</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">상태</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">마감일</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">설명</th>
                  </tr>
                </thead>
                <tbody>
                  {personalTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        등록된 업무가 없습니다
                      </td>
                    </tr>
                  ) : (
                    personalTasks.map((task) => (
                      <tr 
                        key={task.id} 
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          // 업무 상세 페이지로 이동하는 로직
                          console.log(`업무 이동: ${task.title}`)
                          // TODO: 실제 업무 상세 페이지로 이동
                        }}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-sm">{task.title}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getPriorityColor(task.priority)}>
                            {getPriorityText(task.priority)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusText(task.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {task.description}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 알림 및 소통 섹션 */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* @ 호출된 메시지 */}
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                @ 호출된 메시지
              </CardTitle>
              <CardDescription>내가 언급된 댓글과 메시지들</CardDescription>
          </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMentions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    호출된 메시지가 없습니다
                  </p>
                ) : (
                  mockMentions.map((mention) => (
                  <div 
                    key={mention.id} 
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      // 메시지 상세 페이지로 이동하는 로직
                      console.log(`호출된 메시지 이동: ${mention.taskTitle}`)
                      // TODO: 실제 메시지 상세 페이지로 이동
                    }}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-blue-600">
                        {mention.author.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{mention.author}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{mention.time}</span>
                        </div>
                      <p className="text-sm text-muted-foreground mb-2">{mention.message}</p>
                      <div className="text-xs text-blue-600 font-medium">
                        {mention.taskTitle}
                      </div>
                    </div>
                  </div>
                  ))
                )}
            </div>
          </CardContent>
        </Card>

          {/* 마감 임박 업무 */}
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                마감 임박 업무
              </CardTitle>
              <CardDescription>3일 이내 마감 예정인 업무들</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {personalTasks.filter(task => isDueSoon(task.dueDate) && task.status !== 'completed').length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    마감 임박인 업무가 없습니다
                  </p>
                ) : (
                  personalTasks
                    .filter(task => isDueSoon(task.dueDate) && task.status !== 'completed')
                    .map((task) => {
                      const days = getDaysUntilDue(task.dueDate)
                      return (
                        <div 
                          key={task.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            // 업무 상세 페이지로 이동하는 로직
                            console.log(`마감 임박 업무 이동: ${task.title}`)
                            // TODO: 실제 업무 상세 페이지로 이동
                          }}
                        >
                          <div className="space-y-1 flex-1">
                            <h4 className="text-sm font-medium">{task.title}</h4>
                            <p className="text-xs text-muted-foreground">{task.project}</p>
                            <p className="text-xs text-muted-foreground max-w-xs truncate">{task.description}</p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div className="text-sm font-medium text-orange-600">
                              {days === 0 ? '오늘' : `${days}일 후`}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(task.priority)}>
                                {getPriorityText(task.priority)}
                              </Badge>
                              <Badge className={getStatusColor(task.status)}>
                                {getStatusText(task.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })
                )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

    </div>
  )
}

export default Dashboard