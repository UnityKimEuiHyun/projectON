import { useState, useEffect } from "react"
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Calendar, 
  Settings,
  LogOut,
  User,
  BarChart3,
  DollarSign,
  ShoppingCart,
  FileText,
  ClipboardList,
  BookOpen,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  GanttChart,
  List,
  UserCheck,
  ArrowLeft,
  Search,
  Building2
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useSidebarState } from "@/hooks/useSidebarState"
import { ProjectSelectorModal } from "./ProjectSelectorModal"
import { CompanySelectorModal } from "./CompanySelectorModal"
import { supabase } from "@/integrations/supabase/client"
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

// 개인 관리 메뉴
const personalItems = [
  { title: "대시보드", url: "/", icon: LayoutDashboard },
  { title: "캘린더", url: "/calendar", icon: Calendar },
]

// 구성원 관리 메뉴
const teamManagementItems = [
  { title: "구성원 관리", url: "/team", icon: Users },
]

// 전체 프로젝트 관리 메뉴
const projectManagementItems = [
  { title: "전체 프로젝트 구성", url: "/projects", icon: FolderOpen },
  { title: "전체 프로젝트 계획", url: "/timeline", icon: GanttChart },
]

// 현재 프로젝트 관리 메뉴
const getCurrentProjectItems = (userRole: string | null) => {
  const allItems = [
    { title: "프로젝트 요약", url: "/projects/summary", icon: BarChart3 },
    { title: "WBS 관리", url: "/projects/wbs", icon: List },
    { title: "리소스 관리", url: "/projects/resource", icon: UserCheck },
    { title: "비용 관리", url: "/projects/cost", icon: DollarSign, requiresAdmin: true },
    { title: "자산 관리", url: "/projects/expense", icon: ShoppingCart },
    { title: "일일 보고서", url: "/projects/daily-report", icon: FileText },
    { title: "주간 보고서", url: "/projects/weekly-report", icon: ClipboardList },
    { title: "프로젝트 로그", url: "/projects/log", icon: BookOpen },
    { title: "회의록", url: "/projects/meetings", icon: MessageSquare },
  ]

  // Owner 권한이 있는 경우에만 비용 관리 표시
  return allItems.filter(item => {
    if (item.requiresAdmin) {
      return userRole === 'owner'
    }
    return true
  })
}

const settingsItems = [
  { title: "설정", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { user, signOut } = useAuth()
  const { state, setOpenMobile } = useSidebar()
  const { currentMode, selectedProject, selectedCompany, switchToAllProjectsMode, switchToProjectMode, setSelectedCompany } = useSidebarState()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false)
  const [isCompanySelectorOpen, setIsCompanySelectorOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  // 사용자 권한 로드
  useEffect(() => {
    const loadUserRole = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('authority')
            .eq('user_id', user.id)
            .single()

          if (!error && profile && 'authority' in profile) {
            setUserRole(profile.authority as string)
          }
        } catch (error) {
          console.error('사용자 권한 로드 실패:', error)
        }
      }
    }
    loadUserRole()
  }, [user])

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    
    // 전체 프로젝트 목록은 정확히 /projects일 때만 활성화
    if (path === "/projects") {
      return currentPath === "/projects"
    }
    
    // 나머지는 startsWith 사용
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



  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company)
  }

  const renderMenuItem = (item: any, level: number = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isExpanded = expandedMenus.has(item.title)
    const isActiveItem = isActive(item.url)

    const handleMenuClick = () => {
      if (hasSubItems) {
        toggleMenu(item.title)
      } else {
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

  const renderAllProjectsSidebar = () => (
    <>
      {/* Header - 전체 프로젝트 모드 (파란색 테마) */}
      <div className="p-4 border-b-2 border-blue-200 bg-gradient-to-r from-blue-100 to-blue-200/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-blue-900">ProjectON</h2>
              <p className="text-xs text-blue-600">전체 프로젝트 관리</p>
            </div>
          )}
        </div>
      </div>

      {/* 개인 관리 섹션 */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-blue-700 font-semibold">개인 관리</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {personalItems.map((item) => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* 기업 선택 버튼 */}
      {!collapsed && (
        <div className="p-4 pb-2">
          <Button
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
            size="sm"
            onClick={() => setIsCompanySelectorOpen(true)}
            variant="outline"
          >
            <Building2 className="w-4 h-4 mr-2" />
            {selectedCompany ? selectedCompany.name : "소속 기업 선택"}
          </Button>
        </div>
      )}

      {/* 프로젝트 선택 버튼 */}
      {!collapsed && selectedCompany && (
        <div className="px-4 pb-4">
          <Button 
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-100" 
            size="sm"
            onClick={() => setIsProjectSelectorOpen(true)}
            variant="outline"
          >
            <Search className="w-4 h-4 mr-2" />
            프로젝트 선택
          </Button>
        </div>
      )}

      {/* 구성원 관리 섹션 */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-blue-700 font-semibold">구성원 관리</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {teamManagementItems.map((item) => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* 전체 프로젝트 관리 섹션 */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-blue-700 font-semibold">전체 프로젝트 관리</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {projectManagementItems.map((item) => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )

  const renderCurrentProjectSidebar = () => (
    <>
      {/* Header - 현재 프로젝트 모드 (초록색 테마) */}
      <div className="p-4 border-b-2 border-green-200 bg-gradient-to-r from-green-100 to-green-200/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-green-900 truncate">{selectedProject?.name}</h2>
              <p className="text-xs text-green-600 truncate">{selectedProject?.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* 전체 프로젝트로 돌아가기 버튼 */}
      {!collapsed && (
        <div className="p-4 pb-2">
          <Button 
            className="w-full border-green-300 text-green-700 hover:bg-green-100" 
            size="sm"
            onClick={switchToAllProjectsMode}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            전체 프로젝트 관리
          </Button>
        </div>
      )}

      {/* 프로젝트 선택 버튼 */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <Button 
            className="w-full border-green-300 text-green-700 hover:bg-green-100" 
            size="sm"
            onClick={() => setIsProjectSelectorOpen(true)}
            variant="outline"
          >
            <Search className="w-4 h-4 mr-2" />
            프로젝트 선택
          </Button>
        </div>
      )}

      {/* 현재 프로젝트 메뉴 */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-green-700 font-semibold">
          <span>{selectedProject?.name || '현재 프로젝트'}</span>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {getCurrentProjectItems(userRole).map((item) => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )

  return (
    <>
      <Sidebar
        className={`${collapsed ? "w-14" : "w-64"} ${
          currentMode === 'all-projects' 
            ? "bg-gradient-to-b from-blue-50 to-blue-100/50 border-r-2 border-blue-300" 
            : "bg-gradient-to-b from-green-50 to-green-100/50 border-r-2 border-green-300"
        }`}
        collapsible="icon"
      >
        <SidebarContent>
          {currentMode === 'all-projects' ? renderAllProjectsSidebar() : renderCurrentProjectSidebar()}

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


      {/* 기업 선택 모달 */}
      <CompanySelectorModal
        isOpen={isCompanySelectorOpen}
        onClose={() => setIsCompanySelectorOpen(false)}
        onCompanySelect={handleCompanySelect}
      />

      {/* 프로젝트 선택 모달 */}
      <ProjectSelectorModal
        isOpen={isProjectSelectorOpen}
        onClose={() => setIsProjectSelectorOpen(false)}
      />
    </>
  )
}