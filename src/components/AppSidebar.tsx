import { useState, useEffect } from "react"
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Calendar, 
  Settings,
  Plus,
  LogOut,
  User,
  Building2,
  BarChart3,
  DollarSign,
  ShoppingCart,
  FileText,
  ClipboardList,
  BookOpen,
  MessageSquare,
  Briefcase,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  GanttChart,
  MapPin
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { ProjectCreateModal } from "./ProjectCreateModal"
import type { Database } from "@/integrations/supabase/types"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

type Project = Database['public']['Tables']['projects']['Row']

// 메인 메뉴 아이템
const mainItems = [
  { title: "대시보드", url: "/", icon: LayoutDashboard },
  { title: "캘린더", url: "/calendar", icon: Calendar },
]

// 조직 관리 메뉴
const organizationItems = [
  { title: "조직 관리", url: "/organization", icon: Building2 },
  { title: "구성원 관리", url: "/team", icon: Users },
]

// 프로젝트 관리 메뉴
const projectManagementItems = [
  { title: "전체 프로젝트 목록", url: "/projects", icon: FolderOpen },
  { title: "전체 프로젝트 계획", url: "/timeline", icon: GanttChart },
]

// 열린 프로젝트 관리 메뉴 (동적으로 생성됨)
const getOpenProjectItems = (projectName: string) => [
  { title: "프로젝트 요약", url: "/projects/summary", icon: BarChart3 },
  { title: "WBS 관리", url: "/projects/wbs", icon: BarChart3 },
  { title: "비용 관리", url: "/projects/cost", icon: DollarSign },
  { title: "재산 관리", url: "/projects/expense", icon: ShoppingCart },
  { title: "일일 보고서", url: "/projects/daily-report", icon: FileText },
  { title: "주간 보고서", url: "/projects/weekly-report", icon: ClipboardList },
  { title: "프로젝트 로그", url: "/projects/log", icon: BookOpen },
  { title: "회의록", url: "/projects/meetings", icon: MessageSquare },
]

const settingsItems = [
  { title: "설정", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { state, setOpenMobile } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectSubMenu, setShowProjectSubMenu] = useState(false)
  const [openProject, setOpenProject] = useState<Project | null>(null)

  // 프로젝트 선택 상태를 localStorage에서 복원
  useEffect(() => {
    const savedProject = localStorage.getItem('selectedProject')
    if (savedProject) {
      try {
        setSelectedProject(JSON.parse(savedProject))
        setShowProjectSubMenu(true)
      } catch (e) {
        console.error('Failed to parse saved project:', e)
      }
    }
  }, [])

  // 열린 프로젝트 상태를 localStorage에서 복원
  useEffect(() => {
    const savedOpenProject = localStorage.getItem('openProject')
    if (savedOpenProject) {
      try {
        setOpenProject(JSON.parse(savedOpenProject))
      } catch (e) {
        console.error('Failed to parse saved open project:', e)
      }
    }
  }, [])

  // localStorage 변경 이벤트 리스너
  useEffect(() => {
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
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(path)
  }

  const getNavCls = (path: string) =>
    isActive(path) ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"

  const toggleMenu = (menuTitle: string) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuTitle)) {
      newExpanded.delete(menuTitle)
    } else {
      newExpanded.add(menuTitle)
    }
    setExpandedMenus(newExpanded)
  }

  const handleProjectCreated = (newProject: Project) => {
    // 프로젝트 생성 후 처리 로직
    console.log("새 프로젝트 생성됨:", newProject)
    // 필요시 페이지 새로고침 또는 상태 업데이트
  }

  const clearProjectSelection = () => {
    setSelectedProject(null)
    setShowProjectSubMenu(false)
    localStorage.removeItem('selectedProject')
  }

  const openProjectHandler = (project: Project) => {
    setOpenProject(project)
    localStorage.setItem('openProject', JSON.stringify(project))
  }

  const closeProjectHandler = () => {
    setOpenProject(null)
    localStorage.removeItem('openProject')
    // 다른 탭에서도 상태가 업데이트되도록 이벤트 발생
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'openProject',
      newValue: null,
      oldValue: localStorage.getItem('openProject')
    }))
  }

  const renderMenuItem = (item: any, level: number = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isExpanded = expandedMenus.has(item.title)
    const isActiveItem = isActive(item.url)

    const handleMenuClick = () => {
      if (hasSubItems) {
        toggleMenu(item.title)
      } else {
        // 모바일에서 사이드바 닫기
        setOpenMobile(false)
      }
    }

    return (
      <div key={item.title}>
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild={!hasSubItems}
            onClick={handleMenuClick}
            className={hasSubItems ? "cursor-pointer" : ""}
          >
            {hasSubItems ? (
              <div className={`flex items-center justify-between w-full ${getNavCls(item.url)}`}>
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {!collapsed && <span>{item.title}</span>}
                </div>
                {!collapsed && (
                  isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                )}
              </div>
            ) : (
              <NavLink to={item.url} className={getNavCls(item.url)}>
                <item.icon className="w-4 h-4" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        {/* 서브 메뉴 렌더링 */}
        {hasSubItems && isExpanded && !collapsed && (
          <div className="ml-4 space-y-1">
            {item.subItems.map((subItem: any) => (
              <SidebarMenuItem key={subItem.title}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={subItem.url} 
                    className={getNavCls(subItem.url)}
                    onClick={() => setOpenMobile(false)}
                  >
                    <subItem.icon className="w-4 h-4" />
                    <span className="text-sm">{subItem.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Sidebar
        className={collapsed ? "w-14" : "w-64"}
        collapsible="icon"
      >
        <SidebarContent>
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
                              {!collapsed && (
                  <div>
                    <h2 className="text-lg font-semibold">ProjectON</h2>
                    {selectedProject ? (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-primary font-medium">{selectedProject.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearProjectSelection}
                          className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">프로젝트 관리</p>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Quick Action */}
          {!collapsed && (
            <div className="p-4">
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => setIsProjectModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                새 프로젝트
              </Button>
            </div>
          )}

          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>개인 관리</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Organization Management */}
          <SidebarGroup>
            <SidebarGroupLabel>조직 관리</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {organizationItems.map((item) => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Project Management */}
          <SidebarGroup>
            <SidebarGroupLabel>전체 프로젝트 관리</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projectManagementItems.map((item) => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Open Project Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-blue-600">
              <span>열린 프로젝트</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {openProject ? (
                <>
                  <div className="px-2 py-2 mb-2 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FolderOpen className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700 truncate">
                          {openProject.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={closeProjectHandler}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
                      >
                        ×
                      </Button>
                    </div>
                    <p className="text-xs text-blue-500 mt-1 truncate">
                      {openProject.description}
                    </p>
                  </div>
                  <SidebarMenu>
                    {getOpenProjectItems(openProject.name).map((item) => renderMenuItem(item))}
                  </SidebarMenu>
                </>
              ) : (
                <div className="px-2 py-4 text-center bg-blue-50/50 border border-blue-200/50 rounded-md">
                  <p className="text-sm text-blue-600">
                    열린 프로젝트가 없습니다
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    프로젝트 목록에서 프로젝트를 열어보세요
                  </p>
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Settings */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2 space-y-2">
            <div className="text-xs text-muted-foreground">
              {user?.email}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="w-full justify-start"
            >
              <NavLink to="/profile-edit" onClick={() => setOpenMobile(false)}>
                <User className="mr-2 h-4 w-4" />
                개인정보 수정
              </NavLink>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setOpenMobile(false)
                signOut()
              }}
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* 프로젝트 생성 모달 */}
      <ProjectCreateModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  )
}