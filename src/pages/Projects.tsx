import { useState, useEffect, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useLocation } from "react-router-dom"
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
  Trash2,
  Filter,
  Loader2,
  Check,
  CheckCircle,
  Circle,
  Star
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProjectDetailModal } from "@/components/ProjectDetailModal"
import { ProjectCreateModal } from "@/components/ProjectCreateModal"
import { ProjectService } from "@/services/projectService"
import { FavoriteService } from "@/services/favoriteService"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"

import type { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']

// 프로젝트 카드 컴포넌트
interface ProjectCardProps {
  project: Project
  selectedProjects: Set<string>
  favoriteProjects: Set<string>
  openProject: Project | null
  onProjectToggle: (project: Project) => void
  onToggleFavorite: (projectId: string) => void
  onEditProject: (project: Project) => void
  onViewProject: (project: Project) => void
  onDeleteProject: (project: Project) => void
  canDeleteProject: (project: Project) => boolean
}

const ProjectCard = ({
  project,
  selectedProjects,
  favoriteProjects,
  openProject,
  onProjectToggle,
  onToggleFavorite,
  onEditProject,
  onViewProject,
  onDeleteProject,
  canDeleteProject
}: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "진행중":
        return "bg-green-100 text-green-800"
      case "완료":
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
    <Card 
      className={`hover:shadow-md transition-all duration-200 ${
        selectedProjects.has(project.id)
          ? 'ring-2 ring-primary bg-primary/5 shadow-lg' 
          : 'hover:shadow-lg'
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <CardDescription className="text-sm">
              {project.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* 즐겨찾기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${
                favoriteProjects.has(project.id)
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-muted-foreground hover:text-yellow-500'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(project.id)
              }}
              title={favoriteProjects.has(project.id) ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              <Star className={`h-5 w-5 ${favoriteProjects.has(project.id) ? 'fill-current' : ''}`} />
            </Button>
            
            {/* 프로젝트 체크박스 */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${
                selectedProjects.has(project.id)
                  ? 'text-primary hover:text-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onProjectToggle(project)
              }}
              title={selectedProjects.has(project.id) ? "선택 해제" : "프로젝트 선택"}
            >
              {selectedProjects.has(project.id) ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </Button>
            {canDeleteProject(project) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteProject(project)
                }}
                title="프로젝트 삭제"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {project.due_date ? new Date(project.due_date).toLocaleDateString() : '마감일 없음'}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">진행률</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>팀 크기: {project.team_size}명</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                onViewProject(project)
              }}
            >
              상세보기
            </Button>
            <Button 
              variant={openProject?.id === project.id ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                if (openProject?.id === project.id) {
                  // 이미 열린 프로젝트인 경우 닫기
                  localStorage.removeItem('openProject')
                  window.dispatchEvent(new StorageEvent('storage', {
                    key: 'openProject',
                    newValue: null,
                    oldValue: JSON.stringify(project)
                  }))
                } else {
                  // 프로젝트 열기 기능 - localStorage에 저장하고 이벤트 발생
                  localStorage.setItem('openProject', JSON.stringify(project))
                  // 같은 탭에서 localStorage 이벤트를 수동으로 발생시킴
                  window.dispatchEvent(new StorageEvent('storage', {
                    key: 'openProject',
                    newValue: JSON.stringify(project),
                    oldValue: localStorage.getItem('openProject')
                  }))
                }
              }}
              className={`min-w-[100px] ${
                openProject?.id === project.id 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md ring-2 ring-blue-300 ring-offset-2' 
                  : ''
              }`}
            >
              {openProject?.id === project.id ? '열린 프로젝트' : '프로젝트 열기'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Projects = () => {
  const { toast } = useToast()
  const { user, userProfile } = useAuth()
  const queryClient = useQueryClient()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("전체")
  const [userAuthority, setUserAuthority] = useState<string | null>(null)
  const [userGroups, setUserGroups] = useState<{ [groupId: string]: any }>({})

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [openProject, setOpenProject] = useState<Project | null>(null)

  // React Query로 프로젝트 목록 관리
  const { 
    data: projects = [], 
    isLoading, 
    error: projectsError 
  } = useQuery({
    queryKey: ['projects', user?.id], // 타임스탬프 제거
    queryFn: async () => {
      console.log('🔍 DB 연결 테스트 시작...')
      try {
        const dbProjects = await ProjectService.getProjects()
        console.log('✅ DB 연결 성공:', dbProjects)
        return dbProjects
      } catch (dbError) {
        console.error('❌ DB 연결 실패:', dbError)
        throw new Error('프로젝트 목록을 불러오는데 실패했습니다.')
      }
    },
    enabled: !!user, // 사용자가 로그인된 상태에서만 실행
    staleTime: 5 * 60 * 1000, // 5분간 fresh로 간주
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnMount: true, // 마운트 시 리페치
    refetchOnWindowFocus: true, // 윈도우 포커스 시 리페치
  })

  // 에러 처리
  useEffect(() => {
    if (projectsError) {
      console.error('❌ 전체 로딩 실패:', projectsError)
      toast({
        title: "오류",
        description: projectsError.message || "프로젝트 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    }
  }, [projectsError, toast])

  // 열린 프로젝트 상태 관리
  useEffect(() => {
    // 초기 로드 시 localStorage에서 열린 프로젝트 확인
    const savedOpenProject = localStorage.getItem('openProject')
    if (savedOpenProject) {
      try {
        setOpenProject(JSON.parse(savedOpenProject))
      } catch (e) {
        console.error('Failed to parse saved open project:', e)
      }
    }

    // localStorage 변경 이벤트 리스너
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'openProject') {
        if (e.newValue) {
          try {
            setOpenProject(JSON.parse(e.newValue))
          } catch (error) {
            console.error('Failed to parse open project from storage event:', error)
          }
        } else {
          setOpenProject(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // React Query로 즐겨찾기 관리
  const { 
    data: favoriteProjectIds = [], 
    error: favoritesError 
  } = useQuery({
    queryKey: ['favorites', user?.id], // 타임스탬프 제거
    queryFn: () => FavoriteService.getUserFavorites(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분간 fresh로 간주
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnMount: true, // 마운트 시 리페치
    refetchOnWindowFocus: true, // 윈도우 포커스 시 리페치
  })

  // 즐겨찾기 에러 처리
  useEffect(() => {
    if (favoritesError) {
      console.error('즐겨찾기 로드 실패:', favoritesError)
      toast({
        title: "오류",
        description: "즐겨찾기 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    }
  }, [favoritesError, toast])

  // 즐겨찾기 상태를 useMemo로 최적화하여 무한 루프 방지
  const favoriteProjectsSet = useMemo(() => {
    return new Set(favoriteProjectIds || [])
  }, [favoriteProjectIds])

  // 즐겨찾기 상태를 직접 사용 (useState 제거)
  const favoriteProjects = favoriteProjectsSet

  // 사용자 권한과 소속 기업 정보 로드
  useEffect(() => {
    if (user) {
      loadUserPermissions()
    }
  }, [user])

  // 페이지 이동 감지 - F5와 동일한 처리
  useEffect(() => {
    console.log('🔄 페이지 이동 감지:', location.pathname)
    // 페이지 이동 시 데이터 새로고침
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    queryClient.invalidateQueries({ queryKey: ['favorites'] })
  }, [location.pathname, queryClient])

  const loadUserPermissions = async () => {
    try {
      // 사용자 권한 조회 (기본값 설정)
      setUserAuthority('member') // 기본 권한으로 설정

      // 사용자가 소속된 기업 정보 조회 (현재는 비활성화)
      // const { data: memberships } = await supabase
      //   .from('group_members')
      //   .select(`
      //     group_id,
      //     role,
      //     groups (
      //       id,
      //       name
      //     )
      //   `)
      //   .eq('user_id', user.id)
      //   .eq('status', 'active')

      // if (memberships) {
      //   const groupsMap: { [groupId: string]: any } = {}
      //   memberships.forEach(membership => {
      //     if (membership.groups) {
      //       groupsMap[membership.group_id] = {
      //         ...membership.groups,
      //         role: membership.role
      //       }
      //     }
      //   })
      //   setUserGroups(groupsMap)
      // }
    } catch (error) {
      console.error('사용자 권한 로드 실패:', error)
    }
  }

  const filteredProjects = projects.filter(project => {
    // project가 undefined인 경우 필터링
    if (!project) return false
    
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filter === "전체" || project.status === filter
    return matchesSearch && matchesFilter
  })

  // 즐겨찾기 프로젝트와 일반 프로젝트 분리
  const favoriteProjectsList = filteredProjects.filter(project => favoriteProjects.has(project.id))
  const regularProjectsList = filteredProjects.filter(project => !favoriteProjects.has(project.id))

  const handleEditProject = (project: Project) => {
    setViewingProject(project)
    setIsDetailModalOpen(true)
  }

  const handleProjectUpdated = (updatedProject: Project) => {
    // React Query 캐시 무효화로 최신 데이터 가져오기
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    toast({
      title: "성공",
      description: "프로젝트가 성공적으로 수정되었습니다.",
    })
  }

  const handleViewProject = (project: Project) => {
    setViewingProject(project)
    setIsDetailModalOpen(true)
  }

  // React Query mutation으로 즐겨찾기 토글
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      if (!user) throw new Error('로그인이 필요합니다.')
      return await FavoriteService.toggleFavorite(user.id, projectId)
    },
    onSuccess: (isNowFavorite, projectId) => {
      // 캐시 무효화하여 즐겨찾기 목록 다시 로드
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
      
      toast({
        title: "성공",
        description: isNowFavorite ? "즐겨찾기에 추가되었습니다." : "즐겨찾기에서 제거되었습니다.",
      })
    },
    onError: (error) => {
      console.error('즐겨찾기 토글 실패:', error)
      toast({
        title: "오류",
        description: error.message || "즐겨찾기 상태를 변경하는데 실패했습니다.",
        variant: "destructive"
      })
    }
  })

  const toggleFavorite = (projectId: string) => {
    toggleFavoriteMutation.mutate(projectId)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setViewingProject(null)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleProjectCreated = (newProject: Project) => {
    // React Query 캐시 무효화로 최신 데이터 가져오기
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    toast({
      title: "성공",
      description: "프로젝트가 성공적으로 생성되었습니다.",
    })
  }

  const handleProjectSelect = (project: Project) => {
    setSelectedProjects(prev => new Set([...prev, project.id]))
  }

  const handleProjectDeselect = (project: Project) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev)
      newSet.delete(project.id)
      return newSet
    })
  }

  const handleProjectToggle = (project: Project) => {
    if (selectedProjects.has(project.id)) {
      handleProjectDeselect(project)
    } else {
      handleProjectSelect(project)
    }
  }

  const clearAllSelections = () => {
    setSelectedProjects(new Set())
  }

  // 프로젝트 삭제 권한 확인
  const canDeleteProject = (project: Project): boolean => {
    if (!user) return false
    
    // 1. 'owner' 권한을 가진 사용자는 모든 프로젝트 삭제 가능
    if (userAuthority === 'owner') return true
    
    // 2. 프로젝트 생성자는 자신의 프로젝트 삭제 가능
    if (project.created_by === user.id) return true
    
    // 3. 프로젝트가 할당된 기업의 관리자인 경우 삭제 가능 (현재는 비활성화)
    // if (project.group_id && userGroups[project.group_id]) {
    //   const groupInfo = userGroups[project.group_id]
    //   return groupInfo.role === 'admin'
    // }
    
    return false
  }

  const handleDeleteProject = async (project: Project) => {
    if (!canDeleteProject(project)) {
      toast({
        title: "권한 없음",
        description: "이 프로젝트를 삭제할 권한이 없습니다.",
        variant: "destructive"
      })
      return
    }

    if (confirm(`"${project.name}" 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        await ProjectService.deleteProject(project.id)
        // React Query 캐시 무효화로 최신 데이터 가져오기
        queryClient.invalidateQueries({ queryKey: ['projects'] })
        toast({
          title: "성공",
          description: "프로젝트가 성공적으로 삭제되었습니다.",
        })
      } catch (error) {
        console.error('프로젝트 삭제 실패:', error)
        toast({
          title: "오류",
          description: "프로젝트 삭제에 실패했습니다.",
          variant: "destructive"
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">프로젝트를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">프로젝트 관리</h1>
          <p className="text-muted-foreground">프로젝트를 생성하고 관리하세요</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          새 프로젝트
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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

      {/* 즐겨찾기 프로젝트 섹션 */}
      {favoriteProjectsList.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
            <h2 className="text-xl font-semibold">즐겨찾기 프로젝트</h2>
            <Badge variant="secondary" className="ml-2">
              {favoriteProjectsList.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProjectsList.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                selectedProjects={selectedProjects}
                favoriteProjects={favoriteProjects}
                openProject={openProject}
                onProjectToggle={handleProjectToggle}
                onToggleFavorite={toggleFavorite}
                onEditProject={handleEditProject}
                onViewProject={handleViewProject}
                onDeleteProject={handleDeleteProject}
                canDeleteProject={canDeleteProject}
              />
            ))}
          </div>
        </div>
      )}

      {/* 일반 프로젝트 섹션 */}
      <div className={favoriteProjectsList.length > 0 ? "mb-8" : ""}>
        {favoriteProjectsList.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">전체 프로젝트</h2>
            <Badge variant="outline" className="ml-2">
              {regularProjectsList.length}
            </Badge>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularProjectsList.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              selectedProjects={selectedProjects}
              favoriteProjects={favoriteProjects}
              openProject={openProject}
              onProjectToggle={handleProjectToggle}
              onToggleFavorite={toggleFavorite}
              onEditProject={handleEditProject}
              onViewProject={handleViewProject}
              onDeleteProject={handleDeleteProject}
              canDeleteProject={canDeleteProject}
            />
          ))}
        </div>
      </div>

      {/* 빈 상태 메시지 */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || filter !== "전체" 
              ? "검색 조건에 맞는 프로젝트가 없습니다." 
              : "등록된 프로젝트가 없습니다."}
          </p>
        </div>
      )}

      {/* Project Detail Modal */}
      <ProjectDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        project={viewingProject}
        onProjectUpdated={handleProjectUpdated}
      />

      {/* Project Create Modal */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}

export default Projects