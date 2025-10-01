import React, { useState, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import TaskDetailModal, { WBSTask as TaskDetailWBSTask } from "@/components/TaskDetailModal"
import { BarChart3, Plus, Edit, Trash2, ChevronDown, ChevronRight, Calendar, User, Table, GanttChart, Filter, Download, Search, Minus, Plus as PlusIcon, UserPlus, Building2, Workflow, Target, FolderOpen, List, Check, Upload, File, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCompanyMembers, getUserCompanies, type CompanyMember } from "@/services/companyService"
import { ProjectService } from "@/services/projectService"

// 드롭다운 스타일을 위한 CSS
const dropdownStyles = `
  select.custom-dropdown {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    border: 1px solid #d1d5db;
  }
  
  select.custom-dropdown:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  select.custom-dropdown option {
    padding: 8px 12px;
    background-color: white;
    color: #374151;
    font-size: 12px;
    font-weight: 500;
    border: none;
  }
  
  select.custom-dropdown option:hover {
    background-color: #f3f4f6;
  }
  
  select.custom-dropdown option:checked {
    background-color: #3b82f6;
    color: white;
  }
`

interface WBSTask {
  id: string
  name: string
  level: number
  startDate: string
  endDate: string
  assignee: string
  assigneeId?: string
  status: string
  progress: number
  description?: string
  attachments?: AttachmentFile[]
  deliverables?: AttachmentFile[] // 최종 산출물
  children?: WBSTask[]
}

interface AttachmentFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadedAt: string
}

export default function WBSManagement() {
  const { toast } = useToast()
  const location = useLocation()
  
  // Lv1 테마색 정의
  const getThemeColor = (taskId: string, level: number) => {
    // Lv1 작업의 ID를 추출 (예: "1-1-1" -> "1")
    const lv1Id = taskId.split('-')[0]
    
    // Lv1별 테마색 정의 (더 진한 색상으로 변경)
    const themeColors = {
      '1': { // 프로젝트 기획
        base: '#3b82f6', // blue-500
        light: '#93c5fd', // blue-300 (더 진하게)
        lighter: '#dbeafe' // blue-100 (더 진하게)
      },
      '2': { // 디자인
        base: '#10b981', // emerald-500
        light: '#6ee7b7', // emerald-300 (더 진하게)
        lighter: '#a7f3d0' // emerald-200 (더 진하게)
      },
      '3': { // 개발
        base: '#f59e0b', // amber-500
        light: '#fcd34d', // amber-300 (더 진하게)
        lighter: '#fde68a' // amber-200 (더 진하게)
      },
      '4': { // 테스트
        base: '#ef4444', // red-500
        light: '#fca5a5', // red-300 (더 진하게)
        lighter: '#fecaca' // red-200 (더 진하게)
      },
      '5': { // 배포
        base: '#8b5cf6', // violet-500
        light: '#c4b5fd', // violet-300 (더 진하게)
        lighter: '#ddd6fe' // violet-200 (더 진하게)
      }
    }
    
    const theme = themeColors[lv1Id as keyof typeof themeColors] || themeColors['1']
    
    // 레벨에 따라 색상 반환
    let color
    switch (level) {
      case 1: color = theme.base; break
      case 2: color = theme.light; break
      case 3: color = theme.lighter; break
      default: color = theme.lighter
    }
    
    return color
  }

  // 날짜 유효성 검사 함수
  const validateDateInput = (pos: number, value: string, currentDate: string) => {
    if (pos === 4) { // MM 첫 번째 자리
      const month = currentDate.slice(4, 6) // MM 부분 추출
      
      if (month.length === 2) {
        const monthNum = parseInt(month)
        if (monthNum < 1 || monthNum > 12) {
          toast({
            title: "유효하지 않은 월",
            description: "월은 01-12 사이의 값이어야 합니다.",
            variant: "destructive"
          })
          return false
        }
      }
    } else if (pos === 5) { // MM 두 번째 자리
      const month = currentDate.slice(4, 6) // MM 부분 추출
      if (month.length === 2) {
        const monthNum = parseInt(month)
        if (monthNum < 1 || monthNum > 12) {
          toast({
            title: "유효하지 않은 월",
            description: "월은 01-12 사이의 값이어야 합니다.",
            variant: "destructive"
          })
          return false
        }
      }
    } else if (pos === 6) { // DD 첫 번째 자리
      const day = currentDate.slice(6, 8) // DD 부분 추출
      if (day.length === 2) {
        const dayNum = parseInt(day)
        if (dayNum < 1 || dayNum > 31) {
          toast({
            title: "유효하지 않은 일",
            description: "일은 01-31 사이의 값이어야 합니다.",
            variant: "destructive"
          })
          return false
        }
      }
    } else if (pos === 7) { // DD 두 번째 자리
      const day = currentDate.slice(6, 8) // DD 부분 추출
      if (day.length === 2) {
        const dayNum = parseInt(day)
        if (dayNum < 1 || dayNum > 31) {
          toast({
            title: "유효하지 않은 일",
            description: "일은 01-31 사이의 값이어야 합니다.",
            variant: "destructive"
          })
          return false
        }
      }
    }
    return true
  }

  // 임시 데이터 - 실제로는 API에서 가져올 예정
  const tempProjects = [
    { id: "1", name: "웹사이트 리뉴얼 프로젝트" },
    { id: "2", name: "모바일 앱 개발" },
  ]

  const wbsTasks: WBSTask[] = [
    {
      id: "1",
      name: "프로젝트 기획",
      level: 1,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      assignee: "김의현",
      status: "완료",
      progress: 100,
      children: [
        {
          id: "1-1",
          name: "요구사항 분석",
          level: 2,
          startDate: "2024-01-01",
          endDate: "2024-01-15",
          assignee: "김의현2",
          status: "완료",
          progress: 100,
          children: [
            {
              id: "1-1-1",
              name: "사용자 인터뷰",
              level: 3,
              startDate: "2024-01-01",
              endDate: "2024-01-05",
          assignee: "김분석",
          status: "완료",
          progress: 100,
            },
            {
              id: "1-1-2",
              name: "요구사항 정리",
              level: 3,
              startDate: "2024-01-06",
              endDate: "2024-01-10",
              assignee: "김분석",
              status: "완료",
              progress: 100,
            },
            {
              id: "1-1-3",
              name: "요구사항 검토",
              level: 3,
              startDate: "2024-01-11",
              endDate: "2024-01-15",
              assignee: "김분석",
              status: "완료",
              progress: 100,
            }
          ]
        },
        {
          id: "1-2",
          name: "프로젝트 계획 수립",
          level: 2,
          startDate: "2024-01-16",
          endDate: "2024-01-31",
          assignee: "박계획",
          status: "완료",
          progress: 100,
          children: [
            {
              id: "1-2-1",
              name: "WBS 작성",
              level: 3,
              startDate: "2024-01-16",
              endDate: "2024-01-20",
              assignee: "박계획",
              status: "완료",
              progress: 100,
            },
            {
              id: "1-2-2",
              name: "일정 계획",
              level: 3,
              startDate: "2024-01-21",
              endDate: "2024-01-25",
              assignee: "박계획",
              status: "완료",
              progress: 100,
            },
            {
              id: "1-2-3",
              name: "리소스 계획",
              level: 3,
              startDate: "2024-01-26",
          endDate: "2024-01-31",
          assignee: "박계획",
          status: "완료",
          progress: 100,
            }
          ]
        }
      ]
    },
    {
      id: "2",
      name: "디자인",
      level: 1,
      startDate: "2024-02-01",
      endDate: "2024-02-28",
      assignee: "디자인팀",
      status: "진행중",
      progress: 70,
      children: [
        {
          id: "2-1",
          name: "UI/UX 디자인",
          level: 2,
          startDate: "2024-02-01",
          endDate: "2024-02-15",
          assignee: "이디자인",
          status: "진행중",
          progress: 70,
          children: [
            {
              id: "2-1-1",
              name: "와이어프레임",
              level: 3,
              startDate: "2024-02-01",
              endDate: "2024-02-05",
              assignee: "이디자인",
              status: "완료",
              progress: 100,
            },
            {
              id: "2-1-2",
              name: "프로토타입",
              level: 3,
              startDate: "2024-02-06",
              endDate: "2024-02-10",
          assignee: "이디자인",
          status: "진행중",
          progress: 80,
            },
            {
              id: "2-1-3",
              name: "디자인 시스템",
              level: 3,
              startDate: "2024-02-11",
              endDate: "2024-02-15",
              assignee: "이디자인",
              status: "진행중",
              progress: 50,
            }
          ]
        },
        {
          id: "2-2",
          name: "그래픽 디자인",
          level: 2,
          startDate: "2024-02-16",
          endDate: "2024-02-28",
          assignee: "최그래픽",
          status: "진행중",
          progress: 80,
          children: [
            {
              id: "2-2-1",
              name: "로고 디자인",
              level: 3,
              startDate: "2024-02-16",
              endDate: "2024-02-20",
              assignee: "최그래픽",
              status: "완료",
              progress: 100,
            },
            {
              id: "2-2-2",
              name: "아이콘 디자인",
              level: 3,
              startDate: "2024-02-21",
              endDate: "2024-02-25",
              assignee: "최그래픽",
              status: "진행중",
              progress: 60,
            },
            {
              id: "2-2-3",
              name: "일러스트레이션",
              level: 3,
              startDate: "2024-02-26",
              endDate: "2024-02-28",
              assignee: "최그래픽",
              status: "진행중",
              progress: 30,
            }
          ]
        },
        {
          id: "2-3",
          name: "프로토타입 제작",
          level: 2,
          startDate: "2024-02-16",
          endDate: "2024-02-28",
          assignee: "최프로토",
          status: "진행중",
          progress: 60,
        }
      ]
    },
    {
      id: "3",
      name: "개발",
      level: 1,
      startDate: "2024-03-01",
      endDate: "2024-05-31",
      assignee: "개발팀",
      status: "계획중",
      progress: 0,
      children: [
        {
          id: "3-1",
          name: "프론트엔드 개발",
          level: 2,
          startDate: "2024-03-01",
          endDate: "2024-04-30",
          assignee: "김프론트",
          status: "계획중",
          progress: 0,
        },
        {
          id: "3-2",
          name: "백엔드 개발",
          level: 2,
          startDate: "2024-03-15",
          endDate: "2024-05-15",
          assignee: "박백엔드",
          status: "계획중",
          progress: 0,
        }
      ]
    }
  ]

  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'table' | 'gantt'>('table')
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [levelFilters, setLevelFilters] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]))
  const [allExpanded, setAllExpanded] = useState(false)
  const [tasks, setTasks] = useState<WBSTask[]>(wbsTasks)
  
  // 담당자 모달 상태
  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState("")
  
  // 최종 산출물 모달 상태
  const [deliverableModalOpen, setDeliverableModalOpen] = useState(false)
  const [selectedDeliverableTaskId, setSelectedDeliverableTaskId] = useState<string>("")
  const [isDeliverableDragOver, setIsDeliverableDragOver] = useState(false)
  
  // Task 상세 모달 상태
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false)
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<WBSTask | null>(null)
  const [editingTask, setEditingTask] = useState<WBSTask | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [taskAssigneeSearchTerm, setTaskAssigneeSearchTerm] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  
  // 기업 멤버 상태
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [userCompanies, setUserCompanies] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [activeProject, setActiveProject] = useState<any>(null)
  const [selectedProjectCompany, setSelectedProjectCompany] = useState<any>(null)
  

  // 기업 멤버를 teamMembers 형태로 변환
  const getTeamMembers = () => {
    console.log('getTeamMembers 호출됨, companyMembers:', companyMembers)
    console.log('companyMembers.length:', companyMembers.length)
    console.log('selectedCompanyId:', selectedCompanyId)
    
    // 선택된 기업의 멤버가 있으면 변환하여 반환
    if (companyMembers.length > 0) {
      const convertedMembers = companyMembers.map(member => {
        console.log('멤버 변환 중:', member)
        return {
          id: member.user_id,
          name: member.display_name || '이름 없음',
          email: member.email || '',
          role: member.role === 'owner' ? 'Owner' : 
                member.role === 'admin' ? '관리자' : '멤버'
        }
      })
      console.log('변환된 멤버들:', convertedMembers)
      return convertedMembers
    }
    
    // 기본 구성원 데이터 (기업이 선택되지 않았거나 멤버가 없는 경우)
    return [
      { id: "1", name: "김의현", email: "ehkim1130@gmail.com", role: "프로젝트 매니저" },
      { id: "2", name: "김의현2", email: "ehkim2@company.com", role: "분석가" },
      { id: "3", name: "김분석", email: "kim.analysis@company.com", role: "분석가" },
      { id: "4", name: "박계획", email: "park.planning@company.com", role: "기획자" },
      { id: "5", name: "이디자인", email: "lee.design@company.com", role: "디자이너" },
      { id: "6", name: "최그래픽", email: "choi.graphic@company.com", role: "그래픽 디자이너" },
      { id: "7", name: "최프로토", email: "choi.prototype@company.com", role: "프로토타이퍼" },
      { id: "8", name: "김프론트", email: "kim.frontend@company.com", role: "프론트엔드 개발자" },
      { id: "9", name: "박백엔드", email: "park.backend@company.com", role: "백엔드 개발자" }
    ]
  }

  const teamMembers = React.useMemo(() => getTeamMembers(), [companyMembers, selectedCompanyId])

  // 컴포넌트 마운트 및 페이지 이동 시 프로젝트 목록과 기업 목록 로드
  React.useEffect(() => {
    console.log('🚀 WBSManagement useEffect 실행됨 - 페이지 간 이동 감지')
    const loadData = async () => {
      try {
        // 1. 먼저 기업 목록 로드 (항상 최신 데이터)
        console.log('🔍 getUserCompanies 호출 시작')
        const companies = await getUserCompanies()
        console.log('사용자 기업 목록:', companies)
        setUserCompanies(companies)
        
        // 2. 그 다음 활성화된 프로젝트 로드
        console.log('🔍 활성화된 프로젝트 로드 시작')
        const savedOpenProject = localStorage.getItem('openProject')
        if (savedOpenProject) {
          const project = JSON.parse(savedOpenProject)
          console.log('localStorage에서 활성화된 프로젝트:', project)
          setActiveProject(project)
        } else {
          // 활성화된 프로젝트가 없으면 첫 번째 프로젝트 로드
          const projectsData = await ProjectService.getProjects()
          console.log('프로젝트 목록:', projectsData)
          if (projectsData.length > 0) {
            setActiveProject(projectsData[0])
          }
        }
        
        // 3. 기업 선택 로직
        if (companies.length > 0) {
          // owner인 기업을 우선적으로 선택, 없으면 첫 번째 기업 선택
          const ownerCompany = companies.find(company => 
            company.user_role === 'owner'
          ) || companies[0]
          
          console.log('선택된 기업:', ownerCompany)
          setSelectedCompanyId(ownerCompany.id)
        } else {
          console.log('사용자가 소속된 기업이 없습니다.')
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error)
      }
    }

    loadData()
  }, []) // 마운트 시에만 실행

  // 페이지 이동 감지 - F5와 동일한 처리
  React.useEffect(() => {
    console.log('🔄 WBS 페이지 이동 감지:', location.pathname)
    const loadData = async () => {
      try {
        // 1. 먼저 기업 목록 로드 (항상 최신 데이터)
        console.log('🔍 getUserCompanies 호출 시작')
        const companies = await getUserCompanies()
        console.log('사용자 기업 목록:', companies)
        setUserCompanies(companies)
        
        // 2. 그 다음 활성화된 프로젝트 로드
        console.log('🔍 활성화된 프로젝트 로드 시작')
        const savedOpenProject = localStorage.getItem('openProject')
        if (savedOpenProject) {
          const project = JSON.parse(savedOpenProject)
          console.log('localStorage에서 활성화된 프로젝트:', project)
          setActiveProject(project)
        } else {
          // 활성화된 프로젝트가 없으면 첫 번째 프로젝트 로드
          const projectsData = await ProjectService.getProjects()
          console.log('프로젝트 목록:', projectsData)
          if (projectsData.length > 0) {
            setActiveProject(projectsData[0])
          }
        }
        
        // 3. 기업 선택 로직
        if (companies.length > 0) {
          // owner인 기업을 우선적으로 선택, 없으면 첫 번째 기업 선택
          const ownerCompany = companies.find(company => 
            company.user_role === 'owner'
          ) || companies[0]
          
          console.log('선택된 기업:', ownerCompany)
          setSelectedCompanyId(ownerCompany.id)
        } else {
          console.log('사용자가 소속된 기업이 없습니다.')
        }
      } catch (error) {
        console.error('페이지 이동 시 데이터 로드 실패:', error)
      }
    }

    loadData()
  }, [location.pathname])

  // 페이지 포커스 시 데이터 새로고침
  React.useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 페이지 포커스 감지 - 데이터 새로고침')
      const loadData = async () => {
        try {
          const companies = await getUserCompanies()
          setUserCompanies(companies)
          
          const savedOpenProject = localStorage.getItem('openProject')
          if (savedOpenProject) {
            const project = JSON.parse(savedOpenProject)
            setActiveProject(project)
          }
        } catch (error) {
          console.error('포커스 시 데이터 로드 실패:', error)
        }
      }
      loadData()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // localStorage 변경 감지 (다른 탭에서 프로젝트 변경 시)
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'openProject') {
        console.log('🔄 localStorage에서 프로젝트 변경 감지됨')
        if (e.newValue) {
          try {
            const project = JSON.parse(e.newValue)
            console.log('새로운 활성화된 프로젝트:', project)
            setActiveProject(project)
          } catch (error) {
            console.error('프로젝트 파싱 실패:', error)
          }
        } else {
          console.log('활성화된 프로젝트가 제거됨')
          setActiveProject(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 선택된 프로젝트가 변경될 때 해당 프로젝트의 기업 정보 로드
  React.useEffect(() => {
    const loadProjectCompany = async () => {
      if (activeProject && activeProject.group_id) {
        console.log('활성화된 프로젝트의 기업 ID:', activeProject.group_id)
        try {
          // 프로젝트의 기업 정보 찾기
          const projectCompany = userCompanies.find(company => company.id === activeProject.group_id)
          if (projectCompany) {
            setSelectedProjectCompany(projectCompany)
            setSelectedCompanyId(projectCompany.id)
            console.log('프로젝트의 기업 정보:', projectCompany)
          } else {
            console.log('프로젝트의 기업 정보를 찾을 수 없습니다.')
            setSelectedProjectCompany(null)
          }
        } catch (error) {
          console.error('프로젝트 기업 정보 로드 실패:', error)
        }
      } else {
        console.log('선택된 프로젝트가 없거나 기업이 할당되지 않았습니다.')
        setSelectedProjectCompany(null)
      }
    }

    loadProjectCompany()
  }, [activeProject, userCompanies])

  // 선택된 기업이 변경될 때마다 멤버 목록 로드
  React.useEffect(() => {
    const loadCompanyMembers = async () => {
      if (selectedCompanyId) {
        console.log('선택된 기업 ID:', selectedCompanyId)
        try {
          const members = await getCompanyMembers(selectedCompanyId)
          console.log('선택된 기업 멤버 목록:', members)
          setCompanyMembers(members)
        } catch (error) {
          console.error('기업 멤버 목록 로드 실패:', error)
        }
      } else {
        console.log('선택된 기업이 없습니다.')
      }
    }

    loadCompanyMembers()
  }, [selectedCompanyId])

  // 진행률 업데이트 함수
  const updateTaskProgress = (taskId: string, newProgress: number) => {
    const updateTaskInArray = (taskList: WBSTask[]): WBSTask[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, progress: newProgress }
        }
        if (task.children) {
          return { ...task, children: updateTaskInArray(task.children) }
        }
        return task
      })
    }
    setTasks(updateTaskInArray(tasks))
  }

  // 날짜 업데이트 함수
  const updateTaskDate = (taskId: string, field: 'startDate' | 'endDate', newDate: string) => {
    const updateTaskInArray = (taskList: WBSTask[]): WBSTask[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, [field]: newDate }
        }
        if (task.children) {
          return { ...task, children: updateTaskInArray(task.children) }
        }
        return task
      })
    }
    setTasks(updateTaskInArray(tasks))
  }

  // 담당자 업데이트 함수
  const updateTaskAssignee = (taskId: string, newAssignee: string) => {
    const updateTaskInArray = (taskList: WBSTask[]): WBSTask[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, assignee: newAssignee }
        }
        if (task.children) {
          return { ...task, children: updateTaskInArray(task.children) }
        }
        return task
      })
    }
    setTasks(updateTaskInArray(tasks))
  }

  // 담당자 모달 열기
  const openAssigneeModal = (taskId: string) => {
    setSelectedTaskId(taskId)
    setAssigneeSearchTerm("")
    setAssigneeModalOpen(true)
  }

  // 담당자 선택
  const selectAssignee = (member: any) => {
    updateTaskAssignee(selectedTaskId, member.name)
    setAssigneeModalOpen(false)
    toast({
      title: "담당자 변경 완료",
      description: `${member.name}님이 담당자로 설정되었습니다.`,
    })
  }

  // 최종 산출물 모달 열기
  const openDeliverableModal = (taskId: string) => {
    setSelectedDeliverableTaskId(taskId)
    setDeliverableModalOpen(true)
  }

  // 최종 산출물 업로드 처리
  const handleDeliverableUpload = (files: FileList) => {
    const taskId = selectedDeliverableTaskId
    const newDeliverables: AttachmentFile[] = Array.from(files).map((file, index) => ({
      id: `${taskId}-deliverable-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString()
    }))

    const updateTaskInArray = (taskList: WBSTask[]): WBSTask[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            deliverables: [...(task.deliverables || []), ...newDeliverables]
          }
        }
        if (task.children) {
          return {
            ...task,
            children: updateTaskInArray(task.children)
          }
        }
        return task
      })
    }

    setTasks(updateTaskInArray(tasks))
    toast({
      title: "산출물 업로드 완료",
      description: `${files.length}개의 파일이 업로드되었습니다.`,
    })
  }

  // 최종 산출물 삭제
  const removeDeliverable = (taskId: string, deliverableId: string) => {
    const updateTaskInArray = (taskList: WBSTask[]): WBSTask[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            deliverables: task.deliverables?.filter(d => d.id !== deliverableId) || []
          }
        }
        if (task.children) {
          return {
            ...task,
            children: updateTaskInArray(task.children)
          }
        }
        return task
      })
    }

    setTasks(updateTaskInArray(tasks))
    toast({
      title: "산출물 삭제 완료",
      description: "파일이 삭제되었습니다.",
    })
  }

  // 최종 산출물 다운로드
  const downloadDeliverable = (deliverable: AttachmentFile) => {
    const link = document.createElement('a')
    link.href = deliverable.url || ''
    link.download = deliverable.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 모든 최종 산출물 다운로드
  const downloadAllDeliverables = (taskId: string) => {
    const task = findTaskById(tasks, taskId)
    if (task?.deliverables) {
      task.deliverables.forEach(deliverable => {
        downloadDeliverable(deliverable)
      })
    }
  }

  // 검색된 구성원 필터링
  const filteredMembers = React.useMemo(() => 
    teamMembers.filter(member =>
      member.name.toLowerCase().includes(assigneeSearchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(assigneeSearchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(assigneeSearchTerm.toLowerCase())
    ), [teamMembers, assigneeSearchTerm]
  )

  // 계층 구조에서 작업을 찾는 함수
  const findTaskById = (tasks: WBSTask[], taskId: string): WBSTask | null => {
    for (const task of tasks) {
      if (task.id === taskId) {
        return task
      }
      if (task.children) {
        const found = findTaskById(task.children, taskId)
        if (found) return found
      }
    }
    return null
  }

  // Task 상세 모달 열기
  const openTaskDetailModal = (task: WBSTask) => {
    setSelectedTaskDetail(task)
    
    // assigneeId가 없으면 기존 assignee 이름으로 찾아서 설정
    let taskWithAssigneeId = { ...task }
    if (!task.assigneeId && task.assignee && companyMembers.length > 0) {
      const matchingMember = companyMembers.find(member => member.display_name === task.assignee)
      if (matchingMember) {
        taskWithAssigneeId.assigneeId = matchingMember.id
      }
    }
    
    setEditingTask(taskWithAssigneeId)
    setEditingField(null)
    setTaskDetailModalOpen(true)
  }

  // 필드 편집 시작
  const startEditingField = (field: string) => {
    setEditingField(field)
    // 담당자 편집 시 검색어 초기화
    if (field === 'assignee') {
      setTaskAssigneeSearchTerm("")
    }
  }

  // 필드 편집 취소
  const cancelEditingField = () => {
    setEditingField(null)
    // 원본 데이터로 복원
    if (selectedTaskDetail) {
      setEditingTask({ ...selectedTaskDetail })
    }
  }

  // 작업 정보 업데이트
  const updateTaskField = (field: keyof WBSTask, value: any) => {
    if (editingTask) {
      setEditingTask({ ...editingTask, [field]: value })
    }
  }

  // 필드 저장
  const saveField = (field: string) => {
    setEditingField(null)
    // 개별 필드 저장은 즉시 반영
    if (editingTask && selectedTaskDetail) {
      setSelectedTaskDetail({ ...editingTask })
    }
  }

  // 전체 작업 저장
  const saveTask = () => {
    if (!editingTask || !selectedTaskDetail) return

    // tasks 배열에서 해당 작업 찾아서 업데이트
    const updateTaskInArray = (taskList: WBSTask[]): WBSTask[] => {
      return taskList.map(task => {
        if (task.id === editingTask.id) {
          return { ...editingTask }
        }
        if (task.children) {
          return { ...task, children: updateTaskInArray(task.children) }
        }
        return task
      })
    }

    setTasks(updateTaskInArray(tasks))
    setSelectedTaskDetail(editingTask)
    setEditingField(null)
    
    toast({
      title: "작업 정보가 저장되었습니다",
      description: `${editingTask.name}의 정보가 성공적으로 업데이트되었습니다.`
    })
  }

  // 상위 작업 찾기
  const findParentTask = (taskId: string, taskList: WBSTask[]): WBSTask | null => {
    for (const task of taskList) {
      if (task.children) {
        for (const child of task.children) {
          if (child.id === taskId) {
            return task
          }
          // 재귀적으로 하위 작업에서도 찾기
          const found = findParentTask(taskId, [child])
          if (found) return found
        }
      }
    }
    return null
  }

  // 필터링된 담당자 목록
  const filteredTaskAssignees = useMemo(() => {
    return companyMembers.filter(member =>
      member.display_name.toLowerCase().includes(taskAssigneeSearchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(taskAssigneeSearchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(taskAssigneeSearchTerm.toLowerCase())
    )
  }, [companyMembers, taskAssigneeSearchTerm])

  // 작업으로 이동하는 함수
  const navigateToTask = (taskId: string) => {
    // 모든 작업을 평면화하여 찾기
    const findTaskById = (taskList: WBSTask[]): WBSTask | null => {
      for (const task of taskList) {
        if (task.id === taskId) {
          return task
        }
        if (task.children) {
          const found = findTaskById(task.children)
          if (found) return found
        }
      }
      return null
    }

    const targetTask = findTaskById(tasks)
    if (targetTask) {
      openTaskDetailModal(targetTask)
    }
  }

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 파일 업로드 처리
  const handleFileUpload = (files: FileList) => {
    if (!editingTask) return

    const newAttachments: AttachmentFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    }))

    const updatedAttachments = [...(editingTask.attachments || []), ...newAttachments]
    updateTaskField('attachments', updatedAttachments)
    
    toast({
      title: "파일 업로드 완료",
      description: `${files.length}개의 파일이 업로드되었습니다.`
    })
  }

  // 파일 삭제
  const removeAttachment = (attachmentId: string) => {
    if (!editingTask) return

    const updatedAttachments = editingTask.attachments?.filter(att => att.id !== attachmentId) || []
    updateTaskField('attachments', updatedAttachments)
    
    toast({
      title: "파일 삭제 완료",
      description: "파일이 삭제되었습니다."
    })
  }

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  // 개별 파일 다운로드
  const downloadFile = (attachment: AttachmentFile) => {
    // 실제 파일이 있다면 다운로드, 없으면 알림
    if (attachment.url) {
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      toast({
        title: "다운로드 불가",
        description: "파일이 서버에 저장되지 않았습니다.",
        variant: "destructive"
      })
    }
  }

  // 모든 파일 다운로드 (ZIP으로 압축)
  const downloadAllFiles = () => {
    if (!editingTask?.attachments || editingTask.attachments.length === 0) {
      toast({
        title: "다운로드할 파일 없음",
        description: "첨부된 파일이 없습니다.",
        variant: "destructive"
      })
      return
    }

    // 실제 구현에서는 서버에서 ZIP 파일을 생성하여 다운로드
    // 현재는 개별 파일들을 순차적으로 다운로드
    editingTask.attachments.forEach((attachment, index) => {
      setTimeout(() => {
        downloadFile(attachment)
      }, index * 500) // 0.5초 간격으로 다운로드
    })

    toast({
      title: "다운로드 시작",
      description: `${editingTask.attachments.length}개의 파일을 다운로드합니다.`
    })
  }

  // WBS 통계 계산 함수들
  const getAllTasksForStats = (taskList: WBSTask[]): WBSTask[] => {
    const allTasks: WBSTask[] = []
    const traverse = (tasks: WBSTask[]) => {
      tasks.forEach(task => {
        allTasks.push(task)
        if (task.children) {
          traverse(task.children)
        }
      })
    }
    traverse(taskList)
    return allTasks
  }

  const getTaskStats = () => {
    const allTasks = getAllTasksForStats(tasks)
    const total = allTasks.length
    const completed = allTasks.filter(task => task.status === '완료').length
    const inProgress = allTasks.filter(task => task.status === '진행중').length
    const planned = allTasks.filter(task => task.status === '계획중' || task.status === '해야할 일').length
    
    return { total, completed, inProgress, planned }
  }

  const stats = getTaskStats()

  // 날짜 입력 상태 관리
  const [dateInputs, setDateInputs] = useState<{[key: string]: string}>({})

  // 기존 데이터를 dateInputs에 초기화
  React.useEffect(() => {
    const initializeDateInputs = (taskList: WBSTask[]) => {
      const newDateInputs: {[key: string]: string} = {}
      
      const traverse = (tasks: WBSTask[]) => {
        tasks.forEach(task => {
          if (task.startDate) {
            const dateStr = task.startDate.replace(/-/g, '')
            for (let i = 0; i < 8; i++) {
              const posKey = `${task.id}-startDate-${i}`
              newDateInputs[posKey] = dateStr[i] || ''
            }
          }
          if (task.endDate) {
            const dateStr = task.endDate.replace(/-/g, '')
            for (let i = 0; i < 8; i++) {
              const posKey = `${task.id}-endDate-${i}`
              newDateInputs[posKey] = dateStr[i] || ''
            }
          }
          if (task.children) {
            traverse(task.children)
          }
        })
      }
      
      traverse(taskList)
      setDateInputs(newDateInputs)
    }
    
    initializeDateInputs(tasks)
  }, [tasks])

  // 날짜 입력 핸들러 - 각 위치를 독립적으로 관리
  const handleDateInput = (taskId: string, field: 'startDate' | 'endDate', position: number, value: string, target?: HTMLInputElement) => {
    const key = `${taskId}-${field}-${position}`
    
    // 8자리 숫자가 모두 입력되었을 때만 유효성 검사
    const allPositions = []
    for (let i = 0; i < 8; i++) {
      const posKey = `${taskId}-${field}-${i}`
      allPositions[i] = i === position ? value : (dateInputs[posKey] || '')
    }
    const fullDate = allPositions.join('')
    
    
    // 해당 위치만 업데이트
    setDateInputs(prev => ({
      ...prev,
      [key]: value
    }))
    
        // 8자리가 모두 숫자로 입력되었을 때만 유효성 검사
        if (fullDate.length === 8 && allPositions.every(pos => pos !== '')) {
          const year = fullDate.slice(0, 4)
          const month = fullDate.slice(4, 6)
          const day = fullDate.slice(6, 8)
          const monthNum = parseInt(month)
          const dayNum = parseInt(day)

          let isValid = true

          // 월 유효성 검사
          if (monthNum < 1 || monthNum > 12) {
            isValid = false
            toast({
              title: "유효하지 않은 월",
              description: "월은 01-12 사이의 값이어야 합니다.",
              variant: "destructive"
            })
          }

          // 일 유효성 검사
          if (dayNum < 1 || dayNum > 31) {
            isValid = false
            toast({
              title: "유효하지 않은 일",
              description: "일은 01-31 사이의 값이어야 합니다.",
              variant: "destructive"
            })
          }

          // 유효하지 않으면 해당 부분만 비움
          if (!isValid) {
            const updates: {[key: string]: string} = {}
            
            // 월이 유효하지 않으면 MM 부분만 비움
            if (monthNum < 1 || monthNum > 12) {
              for (let i = 4; i <= 5; i++) {
                const posKey = `${taskId}-${field}-${i}`
                updates[posKey] = ''
              }
            }
            
            // 일이 유효하지 않으면 DD 부분만 비움
            if (dayNum < 1 || dayNum > 31) {
              for (let i = 6; i <= 7; i++) {
                const posKey = `${taskId}-${field}-${i}`
                updates[posKey] = ''
              }
            }

            setDateInputs(prev => ({
              ...prev,
              ...updates
            }))
            return
          }

          // 유효하면 YYYY-MM-DD 형식으로 저장
          const formatted = `${fullDate.slice(0,4)}-${fullDate.slice(4,6)}-${fullDate.slice(6,8)}`
          updateTaskDate(taskId, field, formatted)
        }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료": return "bg-green-100 text-green-800"
      case "진행중": return "bg-blue-100 text-blue-800"
      case "계획중": return "bg-yellow-100 text-yellow-800"
      case "지연": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-blue-500"
    if (progress >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const calculateTaskPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // 2024년 1월 1일을 기준점(0)으로 설정
    const baseDate = new Date('2024-01-01')
    const startDiff = start.getTime() - baseDate.getTime()
    const endDiff = end.getTime() - baseDate.getTime()
    
    // 일 단위로 계산
    const startDays = Math.floor(startDiff / (1000 * 60 * 60 * 24))
    const endDays = Math.floor(endDiff / (1000 * 60 * 60 * 24))
    const durationDays = endDays - startDays + 1
    
    // 전체 타임라인 길이 (2024년 1월~5월 = 150일)
    const totalDays = 150
    
    // px 단위로 변환 (월별 200px)
    const totalWidth = months.length * 200
    const leftPx = (startDays / totalDays) * totalWidth
    const widthPx = (durationDays / totalDays) * totalWidth
    
    return {
      left: `${leftPx}px`,
      width: `${widthPx}px`
    }
  }

  const isTaskInMonth = (task: WBSTask, month: any) => {
    const taskStart = new Date(task.startDate)
    const taskEnd = new Date(task.endDate)
    const monthStart = new Date(month.year, month.month - 1, 1)
    const monthEnd = new Date(month.year, month.month, 0)
    
    return taskStart <= monthEnd && taskEnd >= monthStart
  }

  // 연도별 월 표시 (2024년 1월부터 2024년 5월까지)
  const months = [
    { year: 2024, month: 1, label: "2024년 1월" },
    { year: 2024, month: 2, label: "2024년 2월" },
    { year: 2024, month: 3, label: "2024년 3월" },
    { year: 2024, month: 4, label: "2024년 4월" },
    { year: 2024, month: 5, label: "2024년 5월" }
  ]

  // WBS 작업을 간트차트용으로 변환 (트리 구조 유지)
  const convertToGanttTasks = (tasks: WBSTask[]) => {
    const allTasks: any[] = []
    
    const traverse = (taskList: WBSTask[], depth: number = 0) => {
      taskList.forEach(task => {
        // 현재 레벨이 필터에 포함되어 있으면 표시
        if (levelFilters.has(task.level)) {
          const themeColor = getThemeColor(task.id, task.level)
          allTasks.push({
            id: task.id,
            name: task.name,
            startDate: task.startDate,
            endDate: task.endDate,
            progress: task.progress,
            assignee: task.assignee,
            status: task.status,
            level: task.level,
            depth: depth,
            hasChildren: task.children && task.children.length > 0,
            color: themeColor
          })
        }
        
        // 하위 항목이 있고 펼쳐진 상태인 경우에만 추가
        // 상위 레벨이 숨겨져도 하위 레벨은 표시 가능
        if (task.children && expandedTasks.has(task.id)) {
          traverse(task.children, depth + 1)
        }
      })
    }
    
    traverse(tasks)
    return allTasks
  }

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  // 레벨 필터 토글 함수
  const toggleLevelFilter = (level: number) => {
    const newFilters = new Set(levelFilters)
    if (newFilters.has(level)) {
      newFilters.delete(level)
    } else {
      newFilters.add(level)
    }
    setLevelFilters(newFilters)
  }

  // 모두 펼치기/접기 함수
  const toggleAllExpanded = () => {
    if (allExpanded) {
      // 모두 접기
      setExpandedTasks(new Set())
      setAllExpanded(false)
    } else {
      // 모두 펼치기 - 모든 작업 ID를 수집
      const allTaskIds = new Set<string>()
      const collectTaskIds = (taskList: WBSTask[]) => {
        taskList.forEach(task => {
          allTaskIds.add(task.id)
          if (task.children) {
            collectTaskIds(task.children)
          }
        })
      }
      collectTaskIds(tasks)
      setExpandedTasks(allTaskIds)
      setAllExpanded(true)
    }
  }

  // 모든 작업을 평면적으로 추출하는 함수 (표 뷰용)
  const getAllTasks = (tasks: WBSTask[]): WBSTask[] => {
    const allTasks: WBSTask[] = []
    
    const traverse = (taskList: WBSTask[]) => {
      taskList.forEach(task => {
        allTasks.push(task)
        if (task.children) {
          traverse(task.children)
        }
      })
    }
    
    traverse(tasks)
    return allTasks
  }

  const renderTask = (task: WBSTask) => {
    // ID에서 계층 구조 파싱 (예: "1.1.1" -> [1, 1, 1])
    const idParts = task.id.split('-').map(part => part.split('.').map(num => parseInt(num)))
    const hierarchy = idParts.flat()
    
    // 각 레벨별로 표시할 값 설정
    const getLevelValue = (level: number) => {
      return hierarchy[level - 1] || ''
    }

    return (
      <div key={task.id} className="flex gap-4 p-3 border-b border-gray-200 hover:bg-gray-50 items-center">
        {/* ID */}
        <div className="w-[60px] text-sm font-mono text-gray-600">
          {task.id}
        </div>
        
        {/* L1 */}
        <div className="w-[16px] flex justify-center overflow-visible">
          {getLevelValue(1) && !getLevelValue(2) && (
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: getThemeColor(task.id, 1) }}
            >
            </div>
          )}
        </div>
        
        {/* L2 */}
        <div className="w-[16px] flex justify-center overflow-visible">
          {getLevelValue(2) && !getLevelValue(3) && (
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: getThemeColor(task.id, 2) }}
            >
            </div>
            )}
          </div>

        {/* L3 */}
        <div className="w-[16px] flex justify-center overflow-visible">
          {getLevelValue(3) && !getLevelValue(4) && (
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: getThemeColor(task.id, 3) }}
            >
              </div>
            )}
          </div>

        {/* L4 */}
        <div className="w-[16px] flex justify-center overflow-visible">
          {getLevelValue(4) && !getLevelValue(5) && (
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: getThemeColor(task.id, 4) }}
            >
              </div>
          )}
            </div>
            
        {/* L5 */}
        <div className="w-[16px] flex justify-center overflow-visible">
          {getLevelValue(5) && (
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: getThemeColor(task.id, 5) }}
            >
            </div>
          )}
        </div>
        
        {/* 빈 열 (공백) */}
        <div className="w-[12px]"></div>
        
        {/* 작업명 */}
        <div className="w-[300px] flex items-center gap-2">
          <button
            onClick={() => openTaskDetailModal(task)}
            className="font-medium text-sm text-left hover:underline cursor-pointer text-blue-600 hover:text-blue-800"
          >
            {task.name}
          </button>
        </div>
        
        {/* 진행률 게이지 + 입력 */}
        <div className="flex-1 flex flex-col items-start gap-1 py-1">
          {/* 넘버박스 */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="100"
              value={task.progress}
              onChange={(e) => {
                const newProgress = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                updateTaskProgress(task.id, newProgress)
              }}
              onFocus={(e) => {
                e.target.select()
              }}
              className="w-12 px-1 py-1 text-xs border border-gray-300 rounded text-center"
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
          {/* 게이지 바 */}
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(task.progress)}`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
        
        {/* 상태 */}
        <div className="w-28 flex items-center">
          <select
            value={task.status}
            onChange={(e) => {
              // 여기서 실제 데이터 업데이트 로직을 추가해야 합니다
            }}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 focus:bg-white focus:outline-none transition-all duration-200 cursor-pointer custom-dropdown"
            style={{
              width: '90px',
              marginRight: '22px',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 8px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px'
            }}
          >
            <option value="해야할 일" className="text-gray-700 py-2 px-3">해야할 일</option>
            <option value="진행중" className="text-blue-700 py-2 px-3">진행중</option>
            <option value="완료" className="text-green-700 py-2 px-3">완료</option>
          </select>
        </div>
        
        {/* 시작일 */}
        <div className="flex-1 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-0 relative">
            {/* YYYY */}
            {[0, 1, 2, 3].map(pos => (
              <input
                key={pos}
                type="text"
                maxLength={1}
                value={dateInputs[`${task.id}-startDate-${pos}`] || ''}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement
                  target.focus()
                  target.select()
                }}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  handleDateInput(task.id, 'startDate', pos, value, target)
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  handleDateInput(task.id, 'startDate', pos, value, target)
                  // 숫자 입력 시 다음 칸으로 포커스 이동 (YYYY→MM, MM→DD)
                  if (value && pos < 7) {
                    setTimeout(() => {
                      // 현재 날짜 필드의 부모 컨테이너에서 다음 입력 필드 찾기
                      const dateContainer = target.closest('.flex.items-center.gap-0')
                      const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                      const currentIndex = Array.from(allInputs).indexOf(target)
                      const nextInput = allInputs[currentIndex + 1]
                      if (nextInput) {
                        nextInput.focus()
                        nextInput.select()
                      }
                    }, 0)
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement
                  if (e.key === 'Backspace' && !target.value && pos > 0) {
                    // 이전 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const prevInput = allInputs[currentIndex - 1]
                    if (prevInput) {
                      prevInput.focus()
                      prevInput.select()
                    }
                  } else if (e.key === 'ArrowLeft' && pos > 0) {
                    // 왼쪽 화살표: 이전 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const prevInput = allInputs[currentIndex - 1]
                    if (prevInput) {
                      prevInput.focus()
                      prevInput.select()
                    }
                  } else if (e.key === 'ArrowRight' && pos < 7) {
                    // 오른쪽 화살표: 다음 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const nextInput = allInputs[currentIndex + 1]
                    if (nextInput) {
                      nextInput.focus()
                      nextInput.select()
                    }
                  }
                }}
                className="w-2 h-6 text-center text-xs font-mono p-0 relative z-10"
                placeholder={pos === 0 ? 'Y' : pos === 1 ? 'Y' : pos === 2 ? 'Y' : pos === 3 ? 'Y' : pos === 4 ? 'M' : pos === 5 ? 'M' : pos === 6 ? 'D' : pos === 7 ? 'D' : ''}
              />
            ))}
            <span className="text-gray-400">-</span>
            {/* MM */}
            {[4, 5].map(pos => (
              <input
                key={pos}
                type="text"
                maxLength={1}
                value={dateInputs[`${task.id}-startDate-${pos}`] || ''}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement
                  target.focus()
                  target.select()
                }}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  handleDateInput(task.id, 'startDate', pos, value, target)
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  handleDateInput(task.id, 'startDate', pos, value, target)
                  // 숫자 입력 시 다음 칸으로 포커스 이동 (YYYY→MM, MM→DD)
                  if (value && pos < 7) {
                    setTimeout(() => {
                      // 현재 날짜 필드의 부모 컨테이너에서 다음 입력 필드 찾기
                      const dateContainer = target.closest('.flex.items-center.gap-0')
                      const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                      const currentIndex = Array.from(allInputs).indexOf(target)
                      const nextInput = allInputs[currentIndex + 1]
                      if (nextInput) {
                        nextInput.focus()
                        nextInput.select()
                      }
                    }, 0)
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement
                  if (e.key === 'Backspace' && !target.value && pos > 0) {
                    // 이전 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const prevInput = allInputs[currentIndex - 1]
                    if (prevInput) {
                      prevInput.focus()
                      prevInput.select()
                    }
                  } else if (e.key === 'ArrowLeft' && pos > 0) {
                    // 왼쪽 화살표: 이전 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const prevInput = allInputs[currentIndex - 1]
                    if (prevInput) {
                      prevInput.focus()
                      prevInput.select()
                    }
                  } else if (e.key === 'ArrowRight' && pos < 7) {
                    // 오른쪽 화살표: 다음 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const nextInput = allInputs[currentIndex + 1]
                    if (nextInput) {
                      nextInput.focus()
                      nextInput.select()
                    }
                  }
                }}
                className="w-2 h-6 text-center text-xs font-mono p-0 relative z-10"
                placeholder={pos === 0 ? 'Y' : pos === 1 ? 'Y' : pos === 2 ? 'Y' : pos === 3 ? 'Y' : pos === 4 ? 'M' : pos === 5 ? 'M' : pos === 6 ? 'D' : pos === 7 ? 'D' : ''}
              />
            ))}
            <span className="text-gray-400">-</span>
            {/* DD */}
            {[6, 7].map(pos => (
              <input
                key={pos}
                type="text"
                maxLength={1}
                value={dateInputs[`${task.id}-startDate-${pos}`] || ''}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement
                  target.focus()
                  target.select()
                }}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  handleDateInput(task.id, 'startDate', pos, value, target)
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  handleDateInput(task.id, 'startDate', pos, value, target)
                  // 숫자 입력 시 다음 칸으로 포커스 이동 (YYYY→MM, MM→DD)
                  if (value && pos < 7) {
                    setTimeout(() => {
                      // 현재 날짜 필드의 부모 컨테이너에서 다음 입력 필드 찾기
                      const dateContainer = target.closest('.flex.items-center.gap-0')
                      const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                      const currentIndex = Array.from(allInputs).indexOf(target)
                      const nextInput = allInputs[currentIndex + 1]
                      if (nextInput) {
                        nextInput.focus()
                        nextInput.select()
                      }
                    }, 0)
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement
                  if (e.key === 'Backspace' && !target.value && pos > 0) {
                    // 이전 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const prevInput = allInputs[currentIndex - 1]
                    if (prevInput) {
                      prevInput.focus()
                      prevInput.select()
                    }
                  } else if (e.key === 'ArrowLeft' && pos > 0) {
                    // 왼쪽 화살표: 이전 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const prevInput = allInputs[currentIndex - 1]
                    if (prevInput) {
                      prevInput.focus()
                      prevInput.select()
                    }
                  } else if (e.key === 'ArrowRight' && pos < 7) {
                    // 오른쪽 화살표: 다음 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const nextInput = allInputs[currentIndex + 1]
                    if (nextInput) {
                      nextInput.focus()
                      nextInput.select()
                    }
                  }
                }}
                className="w-2 h-6 text-center text-xs font-mono p-0 relative z-10"
                placeholder={pos === 6 ? 'D' : pos === 7 ? 'D' : ''}
              />
            ))}
          </div>
            </div>
            
        {/* 종료일 */}
        <div className="flex-1 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-0 relative">
            {/* YYYY */}
            {[0, 1, 2, 3].map(pos => (
              <input
                key={pos}
                type="text"
                maxLength={1}
                value={dateInputs[`${task.id}-endDate-${pos}`] || ''}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement
                  target.focus()
                  target.select()
                }}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  handleDateInput(task.id, 'endDate', pos, value, target)
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  handleDateInput(task.id, 'endDate', pos, value, target)
                  // 숫자 입력 시 다음 칸으로 포커스 이동 (YYYY→MM, MM→DD)
                  if (value && pos < 7) {
                    setTimeout(() => {
                      // 현재 날짜 필드의 부모 컨테이너에서 다음 입력 필드 찾기
                      const dateContainer = target.closest('.flex.items-center.gap-0')
                      const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                      const currentIndex = Array.from(allInputs).indexOf(target)
                      const nextInput = allInputs[currentIndex + 1]
                      if (nextInput) {
                        nextInput.focus()
                        nextInput.select()
                      }
                    }, 0)
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement
                  if (e.key === 'Backspace' && !target.value && pos > 0) {
                    // 이전 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const prevInput = allInputs[currentIndex - 1]
                    if (prevInput) {
                      prevInput.focus()
                      prevInput.select()
                    }
                  } else if (e.key === 'ArrowLeft' && pos > 0) {
                    // 왼쪽 화살표: 이전 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const prevInput = allInputs[currentIndex - 1]
                    if (prevInput) {
                      prevInput.focus()
                      prevInput.select()
                    }
                  } else if (e.key === 'ArrowRight' && pos < 7) {
                    // 오른쪽 화살표: 다음 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const nextInput = allInputs[currentIndex + 1]
                    if (nextInput) {
                      nextInput.focus()
                      nextInput.select()
                    }
                  }
                }}
                className="w-2 h-6 text-center text-xs font-mono p-0 relative z-10"
                placeholder={pos === 0 ? 'Y' : pos === 1 ? 'Y' : pos === 2 ? 'Y' : pos === 3 ? 'Y' : pos === 4 ? 'M' : pos === 5 ? 'M' : pos === 6 ? 'D' : pos === 7 ? 'D' : ''}
              />
            ))}
            <span className="text-gray-400">-</span>
            {/* MM */}
            {[4, 5].map(pos => (
              <input
                key={pos}
                type="text"
                maxLength={1}
                value={dateInputs[`${task.id}-endDate-${pos}`] || ''}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement
                  target.focus()
                  target.select()
                }}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  handleDateInput(task.id, 'endDate', pos, value, target)
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  handleDateInput(task.id, 'endDate', pos, value, target)
                  // 숫자 입력 시 다음 칸으로 포커스 이동 (YYYY→MM, MM→DD)
                  if (value && pos < 7) {
                    setTimeout(() => {
                      // 현재 날짜 필드의 부모 컨테이너에서 다음 입력 필드 찾기
                      const dateContainer = target.closest('.flex.items-center.gap-0')
                      const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                      const currentIndex = Array.from(allInputs).indexOf(target)
                      const nextInput = allInputs[currentIndex + 1]
                      if (nextInput) {
                        nextInput.focus()
                        nextInput.select()
                      }
                    }, 0)
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement
                  if (e.key === 'Backspace' && !target.value && pos > 0) {
                    // 이전 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const prevInput = allInputs[currentIndex - 1]
                    if (prevInput) {
                      prevInput.focus()
                      prevInput.select()
                    }
                  } else if (e.key === 'ArrowLeft' && pos > 0) {
                    // 왼쪽 화살표: 이전 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const prevInput = allInputs[currentIndex - 1]
                    if (prevInput) {
                      prevInput.focus()
                      prevInput.select()
                    }
                  } else if (e.key === 'ArrowRight' && pos < 7) {
                    // 오른쪽 화살표: 다음 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const nextInput = allInputs[currentIndex + 1]
                    if (nextInput) {
                      nextInput.focus()
                      nextInput.select()
                    }
                  }
                }}
                className="w-2 h-6 text-center text-xs font-mono p-0 relative z-10"
                placeholder={pos === 0 ? 'Y' : pos === 1 ? 'Y' : pos === 2 ? 'Y' : pos === 3 ? 'Y' : pos === 4 ? 'M' : pos === 5 ? 'M' : pos === 6 ? 'D' : pos === 7 ? 'D' : ''}
              />
            ))}
            <span className="text-gray-400">-</span>
            {/* DD */}
            {[6, 7].map(pos => (
              <input
                key={pos}
                type="text"
                maxLength={1}
                value={dateInputs[`${task.id}-endDate-${pos}`] || ''}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement
                  target.focus()
                  target.select()
                }}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  handleDateInput(task.id, 'endDate', pos, value, target)
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  handleDateInput(task.id, 'endDate', pos, value, target)
                  // 숫자 입력 시 다음 칸으로 포커스 이동 (YYYY→MM, MM→DD)
                  if (value && pos < 7) {
                    setTimeout(() => {
                      // 현재 날짜 필드의 부모 컨테이너에서 다음 입력 필드 찾기
                      const dateContainer = target.closest('.flex.items-center.gap-0')
                      const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                      const currentIndex = Array.from(allInputs).indexOf(target)
                      const nextInput = allInputs[currentIndex + 1]
                      if (nextInput) {
                        nextInput.focus()
                        nextInput.select()
                      }
                    }, 0)
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement
                  if (e.key === 'Backspace' && !target.value && pos > 0) {
                    // 이전 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const prevInput = allInputs[currentIndex - 1]
                    if (prevInput) {
                      prevInput.focus()
                      prevInput.select()
                    }
                  } else if (e.key === 'ArrowLeft' && pos > 0) {
                    // 왼쪽 화살표: 이전 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const prevInput = allInputs[currentIndex - 1]
                    if (prevInput) {
                      prevInput.focus()
                      prevInput.select()
                    }
                  } else if (e.key === 'ArrowRight' && pos < 7) {
                    // 오른쪽 화살표: 다음 자리로 이동
                    e.preventDefault()
                    const dateContainer = target.closest('.flex.items-center.gap-0')
                    const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                    const currentIndex = Array.from(allInputs).indexOf(target)
                    const nextInput = allInputs[currentIndex + 1]
                    if (nextInput) {
                      nextInput.focus()
                      nextInput.select()
                    }
                  }
                }}
                className="w-2 h-6 text-center text-xs font-mono p-0 relative z-10"
                placeholder={pos === 6 ? 'D' : pos === 7 ? 'D' : ''}
              />
            ))}
          </div>
            </div>
            
        {/* 담당자 */}
        <div className="flex-1 flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openAssigneeModal(task.id)}
            className="flex items-center gap-2 h-8 px-3 text-sm"
          >
            <User className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{task.assignee}</span>
            <UserPlus className="w-3 h-3 opacity-50" />
          </Button>
        </div>

        {/* 최종 산출물 */}
        <div className="w-32 flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDeliverableModal(task.id)}
            className="flex items-center gap-2 h-8 px-2 text-xs w-full"
          >
            <Upload className="w-3 h-3" />
            <span className="truncate">
              {task.deliverables && task.deliverables.length > 0 
                ? `${task.deliverables.length}개` 
                : '업로드'
              }
            </span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <style dangerouslySetInnerHTML={{ __html: dropdownStyles }} />
      
      {/* 담당자 선택 모달 */}
      <Dialog open={assigneeModalOpen} onOpenChange={setAssigneeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>담당자 관리</DialogTitle>
            <DialogDescription>
              작업의 담당자를 선택하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 프로젝트 기업 정보 표시 */}
            {selectedProjectCompany ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {selectedProjectCompany.name}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">
                    개인 프로젝트
                  </span>
                </div>
              </div>
            )}
            
            {/* 검색 입력 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="이름, 이메일, 역할로 검색..."
                value={assigneeSearchTerm}
                onChange={(e) => setAssigneeSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* 구성원 목록 */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  console.log('렌더링 중인 멤버:', member, 'role === Owner?', member.role === 'Owner')
                  return (
                    <div
                      key={member.id}
                      onClick={() => selectAssignee(member)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm flex items-center gap-2">
                          {member.name}
                          {member.role === 'Owner' && (
                            <Badge variant="secondary" className="text-xs">
                              Owner
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{member.email}</div>
                        <div className="text-xs text-gray-400">{member.role}</div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task 상세 모달 - 공통 컴포넌트 사용 */}
      <TaskDetailModal
        isOpen={taskDetailModalOpen}
        onClose={() => setTaskDetailModalOpen(false)}
        task={selectedTaskDetail}
        companyMembers={companyMembers}
        onTaskUpdate={(updatedTask) => {
          // 작업 업데이트 처리
          setSelectedTaskDetail(updatedTask)
          // 실제로는 여기서 API 호출하여 저장
        }}
        allTasks={tasks}
        onNavigateToTask={(taskId) => {
          const task = findTaskById(tasks, taskId)
          if (task) {
            openTaskDetailModal(task)
          }
        }}
      />



      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <List className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">WBS 관리</h1>
            <p className="text-muted-foreground">프로젝트 작업 분할 구조(WBS)를 관리할 수 있습니다.</p>
          </div>
        </div>
        {/* 뷰 모드 토글 */}
        <div className="flex items-center border rounded-lg w-fit">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="rounded-r-none"
          >
            <Table className="w-4 h-4 mr-2" />
            표
            </Button>
          <Button
            variant={viewMode === 'gantt' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('gantt')}
            className="rounded-l-none"
          >
            <GanttChart className="w-4 h-4 mr-2" />
            간트차트
            </Button>
          </div>
          </div>

      {/* 현재 프로젝트 */}
      {activeProject && (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Target className="w-5 h-5 text-primary" />
          <div>
            <span className="text-sm text-muted-foreground">현재 프로젝트:</span>
            <span className="ml-2 text-lg font-semibold">{activeProject.name}</span>
          </div>
        </div>
      )}

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">전체 작업</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">완료된 작업</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">진행중인 작업</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.planned}</div>
              <div className="text-sm text-muted-foreground">계획중인 작업</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WBS 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>작업 분할 구조</CardTitle>
              <CardDescription>레벨별로 구성된 작업 목록입니다.</CardDescription>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              작업 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <>
              {/* 테이블 헤더 */}
              <div className="flex gap-4 p-3 bg-gray-50 border-b border-gray-200 font-medium text-sm">
                <div className="w-[60px]">ID</div>
                <div className="w-[16px]">L1</div>
                <div className="w-[16px]">L2</div>
                <div className="w-[16px]">L3</div>
                <div className="w-[16px]">L4</div>
                <div className="w-[16px]">L5</div>
                <div className="w-[12px]"></div>
                <div className="w-[300px]">작업명</div>
                <div className="flex-1">진행률</div>
                <div className="w-28">상태</div>
                <div className="flex-1">시작일</div>
                <div className="flex-1">종료일</div>
                <div className="flex-1">담당자</div>
                <div className="w-32">최종 산출물</div>
              </div>

              {/* 작업 목록 */}
              <div className="divide-y divide-gray-200">
                {getAllTasks(tasks).map((task) => renderTask(task))}
              </div>
            </>
          ) : (
            /* 간트차트 뷰 */
            <div className="space-y-4">
              {/* 컨트롤 섹션 - 가로 배열 */}
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  {/* 필터 컨트롤 - 좌측 */}
                  <div className="flex items-center gap-4">
                    {/* 모두 펼치기/접기 버튼 */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAllExpanded}
                        className="flex items-center gap-1"
                      >
                        {allExpanded ? (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            모두 접기
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-4 h-4" />
                            모두 펼치기
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* 레벨 필터 */}
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <span className="text-sm font-medium">레벨 필터:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(level => (
                          <Button
                            key={level}
                            variant={levelFilters.has(level) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleLevelFilter(level)}
                            className="w-8 h-8 p-0"
                          >
                            L{level}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 줌 컨트롤 + 내보내기 - 우측 */}
                  <div className="flex items-center gap-6">
                    {/* 줌 컨트롤 */}
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      <span className="text-sm font-medium">줌:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* 내보내기 */}
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      내보내기
                    </Button>
                  </div>
                </div>
              </div>

              {/* 간트차트 */}
              <div className="overflow-x-auto overflow-y-visible border border-gray-200 rounded-lg bg-white shadow-sm scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div 
                  className="inline-block min-w-full" 
                  style={{ 
                    width: `${Math.min(256 + (months.length * 200), 1200)}px`, // 256px (작업명) + 월별 200px, 최대 1200px
                    transform: `scale(${zoomLevel})`, 
                    transformOrigin: 'top left' 
                  }}
                >
                  {/* 헤더 */}
                  <div className="flex border-b border-gray-200">
                    <div className="w-64 p-3 font-medium bg-gray-50 border-r border-gray-200 flex-shrink-0 min-w-[256px]">
                      작업명
                    </div>
                    <div className="flex-1 bg-gray-50 relative">
                      {/* 월별 헤더 */}
                      <div className="relative">
                        {months.map((month, index) => {
                          // 각 월의 너비를 균등하게 분배 (200px씩)
                          const monthWidth = 200
                          const monthPosition = index * monthWidth
                          
                          return (
                            <div
                              key={`${month.year}-${month.month}`}
                              className="absolute top-0 p-2 text-center border-r border-gray-200"
                              style={{ 
                                left: `${monthPosition}px`,
                                width: `${monthWidth}px`,
                                height: '100%'
                              }}
                            >
                              <div className="text-sm font-medium">{month.label}</div>
                            </div>
                          )
                        })}
                      </div>
                      
                    </div>
                  </div>

                  {/* 작업 행들 */}
                  {convertToGanttTasks(tasks).map((task) => (
                    <div key={task.id} className="flex border-b border-gray-200 hover:bg-gray-50 min-h-[32px]">
                      {/* 작업 정보 */}
                      <div className="w-64 p-2 border-r border-gray-200 flex-shrink-0 min-w-[256px]">
                        <div className="flex items-center">
                          {/* 들여쓰기 */}
                          <div style={{ paddingLeft: `${task.depth * 20}px` }} className="flex items-center relative z-10">
                            {/* 접기/펼치기 버튼 */}
                            {task.hasChildren ? (
                              <button
                                className="w-5 h-5 mr-1 flex items-center justify-center hover:bg-gray-200 rounded border border-gray-300 bg-white cursor-pointer relative"
                                style={{ zIndex: 9999 }}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  toggleTask(task.id)
                                }}
                              >
                                {expandedTasks.has(task.id) ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </button>
                            ) : (
                              <div className="w-5 h-5 mr-1" />
                            )}
                            
                            {/* 작업명 */}
                              <div className="flex-1">
                                <button
                                  onClick={() => {
                                    // 원본 task 데이터 찾기
                                    const findOriginalTask = (taskList: WBSTask[], taskId: string): WBSTask | null => {
                                      for (const t of taskList) {
                                        if (t.id === taskId) return t
                                        if (t.children) {
                                          const found = findOriginalTask(t.children, taskId)
                                          if (found) return found
                                        }
                                      }
                                      return null
                                    }
                                    const originalTask = findOriginalTask(tasks, task.id)
                                    if (originalTask) {
                                      openTaskDetailModal(originalTask)
                                    }
                                  }}
                                  className={`font-medium text-xs text-left hover:underline cursor-pointer leading-tight ${
                                    task.level === 3 ? 'text-blue-600 hover:text-blue-800' : 
                                    task.level === 2 ? 'text-green-600 hover:text-green-800' : 
                                    'text-gray-700 hover:text-gray-900'
                                  }`}
                                >
                                  {task.name}
                                </button>
                              </div>
                          </div>
                        </div>
                      </div>

                      {/* 타임라인 바 - 최하위 항목만 (하위 작업이 없는 항목) */}
                      {!task.hasChildren ? (
                        <div className="flex-1 relative bg-gray-50 overflow-visible">
                          
                          {/* 작업 막대 */}
                          <div
                            className="absolute top-1/2 transform -translate-y-1/2 h-5 rounded opacity-80 flex items-center justify-start border border-gray-500"
                            style={{
                              left: calculateTaskPosition(task.startDate, task.endDate).left,
                              width: calculateTaskPosition(task.startDate, task.endDate).width,
                              minWidth: '20px', // 최소 너비 보장
                              backgroundColor: task.color,
                              overflow: 'visible'
                            }}
                          >
                            <span 
                              className="text-[10px] text-gray-800 font-medium px-1 whitespace-nowrap"
                              style={{
                                overflow: 'visible',
                                textOverflow: 'unset',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {task.name}
                            </span>
                          </div>
                        </div>
                      ) : (
                        // 최하위가 아닌 경우 빈 공간
                        <div className="flex-1 relative">
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 범례 - 실제 사용되는 Lv1 작업 유형별 색상 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Lv1 작업 유형별 색상 구분</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                    <span className="text-sm">1. 프로젝트 기획 (Lv1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#93c5fd' }}></div>
                    <span className="text-sm">1. 프로젝트 기획 (Lv2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dbeafe' }}></div>
                    <span className="text-sm">1. 프로젝트 기획 (Lv3)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                    <span className="text-sm">2. 디자인 (Lv1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6ee7b7' }}></div>
                    <span className="text-sm">2. 디자인 (Lv2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#a7f3d0' }}></div>
                    <span className="text-sm">2. 디자인 (Lv3)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                    <span className="text-sm">3. 개발 (Lv1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fcd34d' }}></div>
                    <span className="text-sm">3. 개발 (Lv2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fde68a' }}></div>
                    <span className="text-sm">3. 개발 (Lv3)</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <p>• 각 Lv1 작업 유형 내에서 Lv2는 중간 색상, Lv3는 연한 색상으로 표시됩니다.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 최종 산출물 관리 모달 */}
      <Dialog open={deliverableModalOpen} onOpenChange={setDeliverableModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>최종 산출물 관리</DialogTitle>
            <DialogDescription>
              작업의 최종 산출물을 업로드하고 관리하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 업로드 영역 */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDeliverableDragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDeliverableDragOver(true)
              }}
              onDragLeave={() => setIsDeliverableDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDeliverableDragOver(false)
                const files = e.dataTransfer.files
                if (files.length > 0) {
                  handleDeliverableUpload(files)
                }
              }}
            >
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                파일을 드래그하여 업로드하거나
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.multiple = true
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files && files.length > 0) {
                      handleDeliverableUpload(files)
                    }
                  }
                  input.click()
                }}
              >
                파일 선택
              </Button>
            </div>

            {/* 업로드된 파일 목록 */}
            {(() => {
              const task = findTaskById(tasks, selectedDeliverableTaskId)
              const deliverables = task?.deliverables || []
              
              if (deliverables.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    업로드된 산출물이 없습니다.
                  </div>
                )
              }

              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">업로드된 파일 ({deliverables.length}개)</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAllDeliverables(selectedDeliverableTaskId)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      모두 다운로드
                    </Button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {deliverables.map((deliverable) => (
                      <div
                        key={deliverable.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {deliverable.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(deliverable.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadDeliverable(deliverable)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDeliverable(selectedDeliverableTaskId, deliverable.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
