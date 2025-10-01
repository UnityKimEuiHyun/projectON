import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import type { Database } from "@/integrations/supabase/types"
import type { Company } from "@/services/companyService"

type Project = Database['public']['Tables']['projects']['Row']

interface SidebarState {
  currentMode: 'all-projects' | 'current-project'
  selectedProject: Project | null
  selectedCompany: Company | null
  setCurrentMode: (mode: 'all-projects' | 'current-project') => void
  setSelectedProject: (project: Project | null) => void
  setSelectedCompany: (company: Company | null) => void
  switchToProjectMode: (project: Project) => void
  switchToAllProjectsMode: () => void
}

const SidebarStateContext = createContext<SidebarState | undefined>(undefined)

export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [currentMode, setCurrentMode] = useState<'all-projects' | 'current-project'>('all-projects')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  // localStorage에서 상태 복원
  useEffect(() => {
    const savedMode = localStorage.getItem('sidebarMode')
    const savedProject = localStorage.getItem('selectedProject')
    const savedCompany = localStorage.getItem('selectedCompany')
    
    if (savedMode === 'current-project' && savedProject) {
      try {
        const project = JSON.parse(savedProject)
        setSelectedProject(project)
        setCurrentMode('current-project')
      } catch (e) {
        console.error('Failed to parse saved project:', e)
        // 잘못된 데이터가 있으면 초기화
        localStorage.removeItem('sidebarMode')
        localStorage.removeItem('selectedProject')
      }
    }

    if (savedCompany) {
      try {
        const company = JSON.parse(savedCompany)
        setSelectedCompany(company)
      } catch (e) {
        console.error('Failed to parse saved company:', e)
        localStorage.removeItem('selectedCompany')
      }
    }
  }, [])

  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('sidebarMode', currentMode)
  }, [currentMode])

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProject', JSON.stringify(selectedProject))
    } else {
      localStorage.removeItem('selectedProject')
    }
  }, [selectedProject])

  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany))
    } else {
      localStorage.removeItem('selectedCompany')
    }
  }, [selectedCompany])

  const switchToProjectMode = (project: Project) => {
    setSelectedProject(project)
    setCurrentMode('current-project')
    // 프로젝트 모드로 전환 시에만 프로젝트 요약 페이지로 이동
    navigate('/projects/summary')
  }

  const switchToAllProjectsMode = () => {
    setSelectedProject(null)
    setCurrentMode('all-projects')
  }

  const value: SidebarState = {
    currentMode,
    selectedProject,
    selectedCompany,
    setCurrentMode,
    setSelectedProject,
    setSelectedCompany,
    switchToProjectMode,
    switchToAllProjectsMode,
  }

  return (
    <SidebarStateContext.Provider value={value}>
      {children}
    </SidebarStateContext.Provider>
  )
}

export function useSidebarState() {
  const context = useContext(SidebarStateContext)
  if (context === undefined) {
    throw new Error('useSidebarState must be used within a SidebarStateProvider')
  }
  return context
}
