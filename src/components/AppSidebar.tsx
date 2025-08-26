import { useState } from "react"
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Calendar, 
  Settings,
  Plus,
  LogOut,
  User
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

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

const mainItems = [
  { title: "대시보드", url: "/", icon: LayoutDashboard },
  { title: "프로젝트", url: "/projects", icon: FolderOpen },
  { title: "조직 관리", url: "/team", icon: Users },
  { title: "캘린더", url: "/calendar", icon: Calendar },
]

const settingsItems = [
  { title: "설정", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(path)
  }

  const getNavCls = (path: string) =>
    isActive(path) ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"

  return (
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
                <p className="text-xs text-muted-foreground">프로젝트 관리</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action */}
        {!collapsed && (
          <div className="p-4">
            <Button className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              새 프로젝트
            </Button>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>메인</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
            <NavLink to="/profile-edit">
              <User className="mr-2 h-4 w-4" />
              개인정보 수정
            </NavLink>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={signOut}
            className="w-full justify-start"
          >
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}