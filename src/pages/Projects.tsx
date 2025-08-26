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
  MoreVertical,
  Filter,
  Loader2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProjectEditModal } from "@/components/ProjectEditModal"
import { ProjectService } from "@/services/projectService"
import { useToast } from "@/hooks/use-toast"

import type { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']

const Projects = () => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("전체")
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isModalMinimized, setIsModalMinimized] = useState(false)

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
        
        // DB 연결 실패 시 mock 데이터 사용
        const mockProjects: Project[] = [
          {
            id: "mock-1",
            name: "웹사이트 리뉴얼",
            description: "회사 홈페이지 전면 리뉴얼 프로젝트",
            status: "진행중",
            progress: 65,
            contract_date: null,
            due_date: "2024-01-15",
            team_size: 5,
            priority: "높음",
            created_by: "mock-user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        
        setProjects(mockProjects)
        console.log('🔄 Mock 데이터로 대체:', mockProjects)
        
        toast({
          title: "DB 연결 실패",
          description: "임시 데이터를 표시합니다. DB 설정을 확인해주세요.",
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
    setEditingProject(project)
    setIsEditModalOpen(true)
  }

  const handleSaveProject = (updatedProject: Project) => {
    console.log('🔍 handleSaveProject - 수정된 프로젝트:', updatedProject)
    console.log('🔍 handleSaveProject - contract_date:', updatedProject.contract_date)
    
    setProjects(prev => 
      prev.map(p => p.id === updatedProject.id ? updatedProject : p)
    )
    setIsEditModalOpen(false)
    setEditingProject(null)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingProject(null)
    setIsModalMinimized(false)
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
                    <DropdownMenuItem onClick={() => handleEditProject(project)}>
                      편집
                    </DropdownMenuItem>
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
                  {project.due_date ? new Date(project.due_date).toLocaleDateString('ko-KR') : '미정'}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {project.team_size}명
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
          <p className="text-muted-foreground">
            {searchTerm || filter !== "전체" 
              ? "검색 조건에 맞는 프로젝트가 없습니다." 
              : "등록된 프로젝트가 없습니다."}
          </p>
        </div>
      )}

      {/* Project Edit Modal */}
      <ProjectEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveProject}
        project={editingProject}
        onMinimize={() => setIsModalMinimized(true)}
      />
    </div>
  )
}

export default Projects