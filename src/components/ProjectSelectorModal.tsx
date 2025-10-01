import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, FolderOpen, Calendar, Users, ArrowRight, Star } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useSidebarState } from "@/hooks/useSidebarState"
import type { Database } from "@/integrations/supabase/types"

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectSelectorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSelectorModal({ isOpen, onClose }: ProjectSelectorModalProps) {
  const { selectedCompany, switchToProjectMode } = useSidebarState()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [favoriteProjectIds, setFavoriteProjectIds] = useState<Set<string>>(new Set())

  // 프로젝트 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadProjects()
      loadFavoriteProjects()
    }
  }, [isOpen])

  // 즐겨찾기 프로젝트 로드
  const loadFavoriteProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: favorites, error } = await supabase
        .from('project_favorites')
        .select(`
          project_id,
          projects (
            id,
            name,
            description,
            status,
            progress,
            due_date,
            contract_date,
            group_id
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      const favoriteProjectIds = new Set(favorites?.map(fav => fav.project_id) || [])
      setFavoriteProjectIds(favoriteProjectIds)

      const favoriteProjectsList = favorites?.map(fav => fav.projects).filter(Boolean) as Project[] || []
      setFavoriteProjects(favoriteProjectsList)
    } catch (error) {
      console.error('즐겨찾기 프로젝트 로드 실패:', error)
    }
  }

  // 검색 필터링
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProjects(filtered)
    }
  }, [projects, searchTerm])

  const loadProjects = async () => {
    if (!selectedCompany) {
      setProjects([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('group_id', selectedCompany.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('프로젝트 로드 실패:', error)
        return
      }

      setProjects(data || [])
    } catch (error) {
      console.error('프로젝트 로드 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectSelect = (project: Project) => {
    // 사이드바 상태를 프로젝트 모드로 전환하고 프로젝트 요약 페이지로 이동
    switchToProjectMode(project)
    onClose()
  }

  // 즐겨찾기 토글 함수
  const toggleFavorite = async (project: Project, event: React.MouseEvent) => {
    event.stopPropagation() // 프로젝트 선택 이벤트 방지
    
    try {
      const isFavorite = favoriteProjectIds.has(project.id)
      
      if (isFavorite) {
        // 즐겨찾기 제거
        const { error } = await supabase
          .from('project_favorites')
          .delete()
          .eq('project_id', project.id)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        
        if (error) throw error
        
        setFavoriteProjectIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(project.id)
          return newSet
        })
        
        // 즐겨찾기 프로젝트 목록에서 제거
        setFavoriteProjects(prev => prev.filter(p => p.id !== project.id))
      } else {
        // 즐겨찾기 추가
        const { error } = await supabase
          .from('project_favorites')
          .insert({
            project_id: project.id,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })
        
        if (error) throw error
        
        setFavoriteProjectIds(prev => new Set(prev).add(project.id))
        
        // 즐겨찾기 프로젝트 목록에 추가
        setFavoriteProjects(prev => [...prev, project])
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[800px] h-[700px] max-w-none max-h-none overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            프로젝트 선택
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* 검색 입력 */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="프로젝트명 또는 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 스크롤 가능한 콘텐츠 영역 */}
          <div className="flex-1 overflow-hidden flex flex-col space-y-4 pr-2">

          {/* 즐겨찾기 프로젝트 섹션 - 항상 표시 */}
          <div className="flex-shrink-0 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              즐겨찾기 프로젝트
            </h3>
            <div className="h-48 overflow-y-auto space-y-2 border rounded-lg p-2 bg-yellow-50/30">
              {favoriteProjects.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  즐겨찾기된 프로젝트가 없습니다
                </div>
              ) : (
                favoriteProjects.map((project) => (
                <div
                  key={project.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors bg-yellow-50/50 border-yellow-200"
                  onClick={() => handleProjectSelect(project)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <h3 className="font-semibold text-base truncate">{project.name}</h3>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {project.status}
                      </Badge>
                      {project.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(project.due_date)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => toggleFavorite(project, e)}
                        className="h-7 w-7 p-0 hover:bg-yellow-100"
                      >
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </Button>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* 전체 프로젝트 목록 */}
          <div className="flex-1 flex flex-col space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground flex-shrink-0">전체 프로젝트</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">프로젝트를 불러오는 중...</div>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {!selectedCompany ? "소속 기업을 먼저 선택해주세요" : 
                       searchTerm ? "검색 결과가 없습니다" : "프로젝트가 없습니다"}
                    </p>
                    {!selectedCompany && (
                      <p className="text-sm text-muted-foreground mt-1">
                        사이드바에서 소속 기업을 선택한 후 프로젝트를 확인할 수 있습니다.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg truncate">{project.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {project.status}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {project.contract_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>계약: {formatDate(project.contract_date)}</span>
                            </div>
                          )}
                          {project.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>마감: {formatDate(project.due_date)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => toggleFavorite(project, e)}
                          className="h-8 w-8 p-0 hover:bg-yellow-100"
                        >
                          <Star className={`w-4 h-4 ${favoriteProjectIds.has(project.id) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        </Button>
                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div> {/* 스크롤 영역 닫기 */}
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
