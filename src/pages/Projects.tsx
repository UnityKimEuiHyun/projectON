import { useState, useEffect } from "react"
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
  Circle
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
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"

import type { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']
type Group = Database['public']['Tables']['groups']['Row']
type GroupMember = Database['public']['Tables']['group_members']['Row']

const Projects = () => {
  const { toast } = useToast()
  const { user, userProfile } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("전체")
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userAuthority, setUserAuthority] = useState<string | null>(null)
  const [userGroups, setUserGroups] = useState<{ [groupId: string]: any }>({})

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())

  // 프로젝트 목록 불러오기
  const loadProjects = async () => {
    try {
      setIsLoading(true)
      
      // DB 연결 테스트
      console.log('🔍 DB 연결 테스트 시작...')
      
      try {
        const dbProjects = await ProjectService.getProjects()
        console.log('✅ DB 연결 성공:', dbProjects)
        
        setProjects(dbProjects)
        console.log('📊 프로젝트 데이터 설정 완료:', dbProjects)
      } catch (dbError) {
        console.error('❌ DB 연결 실패:', dbError)
        
        toast({
          title: "DB 연결 실패",
          description: "프로젝트 목록을 불러오는데 실패했습니다. DB 설정을 확인해주세요.",
          variant: "destructive"
        })
      }
      
    } catch (error) {
      console.error('❌ 전체 로딩 실패:', error)
      toast({
        title: "오류",
        description: "프로젝트 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 컴포넌트 마운트 시 프로젝트 목록 로드
  useEffect(() => {
    loadProjects()
  }, [])

  // 사용자 권한과 소속 기업 정보 로드
  useEffect(() => {
    if (user) {
      loadUserPermissions()
    }
  }, [user])

  const loadUserPermissions = async () => {
    if (!user) return

    try {
      // 1. 사용자 권한 조회
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('authority')
        .eq('user_id', user.id)
        .single()

      if (!profileError && profile) {
        setUserAuthority(profile.authority)
      }

      // 2. 사용자가 소속된 기업 정보 조회
      const { data: groupMembers, error: groupError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          role,
          status
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (!groupError && groupMembers) {
        const groupsMap: { [groupId: string]: any } = {}
        groupMembers.forEach(member => {
          groupsMap[member.group_id] = member
        })
        setUserGroups(groupsMap)
      }
    } catch (error) {
      console.error('사용자 권한 로드 중 오류:', error)
    }
  }

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

  const filteredProjects = projects.filter(project => {
    // project가 undefined인 경우 필터링
    if (!project) return false
    
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filter === "전체" || project.status === filter
    return matchesSearch && matchesFilter
  })

  const handleEditProject = (project: Project) => {
    setViewingProject(project)
    setIsDetailModalOpen(true)
  }

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(prev => 
      prev.map(p => p.id === updatedProject.id ? updatedProject : p)
    )
    toast({
      title: "성공",
      description: "프로젝트가 성공적으로 수정되었습니다.",
    })
  }

  const handleViewProject = (project: Project) => {
    setViewingProject(project)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setViewingProject(null)
  }

  const handleCreateProject = () => {
    setIsCreateModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev])
    toast({
      title: "성공",
      description: "새 프로젝트가 생성되었습니다.",
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
    
    // 3. 프로젝트가 할당된 기업의 관리자인 경우 삭제 가능
    if (project.group_id && userGroups[project.group_id]) {
      const groupMember = userGroups[project.group_id]
      if (groupMember.role === 'admin') return true
    }
    
    return false
  }

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm(`"${project.name}" 프로젝트를 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      try {
        await ProjectService.deleteProject(project.id)
        setProjects(prev => prev.filter(p => p.id !== project.id))
        toast({
          title: "성공",
          description: "프로젝트가 성공적으로 삭제되었습니다.",
        })
      } catch (error) {
        toast({
          title: "오류",
          description: "프로젝트 삭제에 실패했습니다.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">프로젝트 목록을 불러오는 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">프로젝트</h1>
          <p className="text-muted-foreground">모든 프로젝트를 관리하고 추적하세요</p>
        </div>
        
        {/* Selected Projects Info in Header */}
        {selectedProjects.size > 0 && (
          <div className="flex items-center space-x-4 mx-6">
            <div className="flex items-center space-x-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-primary">
                  {selectedProjects.size}개 프로젝트 선택됨
                </p>
                <p className="text-sm text-muted-foreground">
                  {projects.filter(p => selectedProjects.has(p.id)).map(p => p.name).join(', ')}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearAllSelections}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                ×
              </Button>
            </div>
          </div>
        )}
        
        <Button onClick={handleCreateProject}>
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
          <Card 
            key={project.id} 
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
                      handleProjectToggle(project)
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
                        handleDeleteProject(project)
                      }}
                      title="프로젝트 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
                  종료일: {project.due_date ? new Date(project.due_date).toLocaleDateString('ko-KR') : '미정'}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {project.team_size}명
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewProject(project)
                  }}
                >
                  상세보기
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    // 프로젝트 열기 기능 - localStorage에 저장하고 이벤트 발생
                    localStorage.setItem('openProject', JSON.stringify(project))
                    // 같은 탭에서 localStorage 이벤트를 수동으로 발생시킴
                    window.dispatchEvent(new StorageEvent('storage', {
                      key: 'openProject',
                      newValue: JSON.stringify(project),
                      oldValue: localStorage.getItem('openProject')
                    }))
                  }}
                  className="min-w-[80px]"
                >
                  프로젝트 열기
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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