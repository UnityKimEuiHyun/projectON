import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSidebarState } from "@/hooks/useSidebarState"

interface ProjectRouteGuardProps {
  children: React.ReactNode
}

export function ProjectRouteGuard({ children }: ProjectRouteGuardProps) {
  const { selectedProject, currentMode } = useSidebarState()
  const navigate = useNavigate()

  useEffect(() => {
    // 프로젝트 관련 페이지에 접근할 때 현재 프로젝트가 선택되어 있지 않으면
    // 전체 프로젝트 목록으로 리다이렉트
    if (currentMode === 'all-projects' || !selectedProject) {
      navigate('/projects')
    }
  }, [selectedProject, currentMode, navigate])

  // 프로젝트가 선택되어 있지 않으면 아무것도 렌더링하지 않음
  if (currentMode === 'all-projects' || !selectedProject) {
    return null
  }

  return <>{children}</>
}
