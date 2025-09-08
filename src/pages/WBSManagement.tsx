import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BarChart3, Plus, Edit, Trash2, ChevronDown, ChevronRight, Calendar, User, Table, GanttChart, Filter, Download, Search, Minus, Plus as PlusIcon, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  status: string
  progress: number
  children?: WBSTask[]
}

export default function WBSManagement() {
  const { toast } = useToast()
  
  // Lv1 테마색 정의
  const getThemeColor = (taskId: string, level: number) => {
    // Lv1 작업의 ID를 추출 (예: "1-1-1" -> "1")
    const lv1Id = taskId.split('-')[0]
    
    // Lv1별 테마색 정의
    const themeColors = {
      '1': { // 프로젝트 기획
        base: '#3b82f6', // blue-500
        light: '#dbeafe', // blue-100
        lighter: '#eff6ff' // blue-50
      },
      '2': { // 디자인
        base: '#10b981', // emerald-500
        light: '#d1fae5', // emerald-100
        lighter: '#ecfdf5' // emerald-50
      },
      '3': { // 개발
        base: '#f59e0b', // amber-500
        light: '#fef3c7', // amber-100
        lighter: '#fffbeb' // amber-50
      },
      '4': { // 테스트
        base: '#ef4444', // red-500
        light: '#fecaca', // red-100
        lighter: '#fef2f2' // red-50
      },
      '5': { // 배포
        base: '#8b5cf6', // violet-500
        light: '#e9d5ff', // violet-100
        lighter: '#f5f3ff' // violet-50
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
  const projects = [
    { id: "1", name: "웹사이트 리뉴얼 프로젝트" },
    { id: "2", name: "모바일 앱 개발" },
  ]

  const wbsTasks: WBSTask[] = [
    {
      id: "1",
      name: "1. 프로젝트 기획",
      level: 1,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      assignee: "김의현",
      status: "완료",
      progress: 100,
      children: [
        {
          id: "1-1",
          name: "1.1 요구사항 분석",
          level: 2,
          startDate: "2024-01-01",
          endDate: "2024-01-15",
          assignee: "김의현2",
          status: "완료",
          progress: 100,
          children: [
            {
              id: "1-1-1",
              name: "1.1.1 사용자 인터뷰",
              level: 3,
              startDate: "2024-01-01",
              endDate: "2024-01-05",
          assignee: "김분석",
          status: "완료",
          progress: 100,
            },
            {
              id: "1-1-2",
              name: "1.1.2 요구사항 정리",
              level: 3,
              startDate: "2024-01-06",
              endDate: "2024-01-10",
              assignee: "김분석",
              status: "완료",
              progress: 100,
            },
            {
              id: "1-1-3",
              name: "1.1.3 요구사항 검토",
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
          name: "1.2 프로젝트 계획 수립",
          level: 2,
          startDate: "2024-01-16",
          endDate: "2024-01-31",
          assignee: "박계획",
          status: "완료",
          progress: 100,
          children: [
            {
              id: "1-2-1",
              name: "1.2.1 WBS 작성",
              level: 3,
              startDate: "2024-01-16",
              endDate: "2024-01-20",
              assignee: "박계획",
              status: "완료",
              progress: 100,
            },
            {
              id: "1-2-2",
              name: "1.2.2 일정 계획",
              level: 3,
              startDate: "2024-01-21",
              endDate: "2024-01-25",
              assignee: "박계획",
              status: "완료",
              progress: 100,
            },
            {
              id: "1-2-3",
              name: "1.2.3 리소스 계획",
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
      name: "2. 디자인",
      level: 1,
      startDate: "2024-02-01",
      endDate: "2024-02-28",
      assignee: "디자인팀",
      status: "진행중",
      progress: 70,
      children: [
        {
          id: "2-1",
          name: "2.1 UI/UX 디자인",
          level: 2,
          startDate: "2024-02-01",
          endDate: "2024-02-15",
          assignee: "이디자인",
          status: "진행중",
          progress: 70,
          children: [
            {
              id: "2-1-1",
              name: "2.1.1 와이어프레임",
              level: 3,
              startDate: "2024-02-01",
              endDate: "2024-02-05",
              assignee: "이디자인",
              status: "완료",
              progress: 100,
            },
            {
              id: "2-1-2",
              name: "2.1.2 프로토타입",
              level: 3,
              startDate: "2024-02-06",
              endDate: "2024-02-10",
          assignee: "이디자인",
          status: "진행중",
          progress: 80,
            },
            {
              id: "2-1-3",
              name: "2.1.3 디자인 시스템",
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
          name: "2.2 그래픽 디자인",
          level: 2,
          startDate: "2024-02-16",
          endDate: "2024-02-28",
          assignee: "최그래픽",
          status: "진행중",
          progress: 80,
          children: [
            {
              id: "2-2-1",
              name: "2.2.1 로고 디자인",
              level: 3,
              startDate: "2024-02-16",
              endDate: "2024-02-20",
              assignee: "최그래픽",
              status: "완료",
              progress: 100,
            },
            {
              id: "2-2-2",
              name: "2.2.2 아이콘 디자인",
              level: 3,
              startDate: "2024-02-21",
              endDate: "2024-02-25",
              assignee: "최그래픽",
              status: "진행중",
              progress: 60,
            },
            {
              id: "2-2-3",
              name: "2.2.3 일러스트레이션",
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
          name: "2.3 프로토타입 제작",
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
      name: "3. 개발",
      level: 1,
      startDate: "2024-03-01",
      endDate: "2024-05-31",
      assignee: "개발팀",
      status: "계획중",
      progress: 0,
      children: [
        {
          id: "3-1",
          name: "3.1 프론트엔드 개발",
          level: 2,
          startDate: "2024-03-01",
          endDate: "2024-04-30",
          assignee: "김프론트",
          status: "계획중",
          progress: 0,
        },
        {
          id: "3-2",
          name: "3.2 백엔드 개발",
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
  const [selectedProject, setSelectedProject] = useState<string>("1")
  const [viewMode, setViewMode] = useState<'table' | 'gantt'>('table')
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [levelFilters, setLevelFilters] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]))
  const [tasks, setTasks] = useState<WBSTask[]>(wbsTasks)
  
  // 담당자 모달 상태
  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState("")
  
  // Task 상세 모달 상태
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false)
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<WBSTask | null>(null)
  
  // 구성원 데이터 (실제로는 API에서 가져올 예정)
  const teamMembers = [
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

  // 검색된 구성원 필터링
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(assigneeSearchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(assigneeSearchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(assigneeSearchTerm.toLowerCase())
  )

  // Task 상세 모달 열기
  const openTaskDetailModal = (task: WBSTask) => {
    setSelectedTaskDetail(task)
    setTaskDetailModalOpen(true)
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
    
    return {
      left: `${(startDays / totalDays) * 100}%`,
      width: `${(durationDays / totalDays) * 100}%`
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
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <style dangerouslySetInnerHTML={{ __html: dropdownStyles }} />
      
      {/* 담당자 선택 모달 */}
      <Dialog open={assigneeModalOpen} onOpenChange={setAssigneeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>담당자 선택</DialogTitle>
            <DialogDescription>
              작업의 담당자를 선택하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
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
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => selectAssignee(member)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500 truncate">{member.email}</div>
                      <div className="text-xs text-gray-400">{member.role}</div>
                    </div>
                  </div>
                ))
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

      {/* Task 상세 모달 */}
      <Dialog open={taskDetailModalOpen} onOpenChange={setTaskDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>작업 상세 정보</DialogTitle>
            <DialogDescription>
              선택한 작업의 상세 정보를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTaskDetail && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <div className="text-sm font-mono bg-gray-100 px-3 py-2 rounded">
                    {selectedTaskDetail.id}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">레벨</label>
                  <div className="text-sm bg-gray-100 px-3 py-2 rounded">
                    Level {selectedTaskDetail.level}
                  </div>
                </div>
              </div>

              {/* 작업명 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">작업명</label>
                <div className="text-lg font-medium bg-gray-100 px-3 py-2 rounded">
                  {selectedTaskDetail.name}
                </div>
              </div>

              {/* 진행률과 상태 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">진행률</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(selectedTaskDetail.progress)}`}
                          style={{ width: `${selectedTaskDetail.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{selectedTaskDetail.progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">상태</label>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedTaskDetail.status)}>
                      {selectedTaskDetail.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 날짜 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">시작일</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedTaskDetail.startDate}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">종료일</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedTaskDetail.endDate}</span>
                  </div>
                </div>
              </div>

              {/* 담당자 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">담당자</label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{selectedTaskDetail.assignee}</span>
                </div>
              </div>

              {/* 하위 작업이 있는 경우 */}
              {selectedTaskDetail.children && selectedTaskDetail.children.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">하위 작업</label>
                  <div className="space-y-1">
                    {selectedTaskDetail.children.map((child) => (
                      <div key={child.id} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded">
                        <span className="font-mono text-xs">{child.id}</span>
                        <span>{child.name}</span>
                        <Badge className={getStatusColor(child.status)} variant="outline">
                          {child.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{child.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">WBS 관리</h1>
          <p className="text-muted-foreground">프로젝트 작업 분할 구조(WBS)를 관리할 수 있습니다.</p>
        </div>
      </div>

        {/* 뷰 모드 토글 */}
        <div className="flex items-center border rounded-lg">
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
              <div className="overflow-x-auto overflow-y-visible">
                <div 
                  className="inline-block" 
                  style={{ 
                    width: `${64 + (months.length * 32)}rem`,
                    transform: `scale(${zoomLevel})`, 
                    transformOrigin: 'top left' 
                  }}
                >
                  {/* 헤더 */}
                  <div className="flex border-b border-gray-200">
                    <div className="w-64 p-3 font-medium bg-gray-50 border-r border-gray-200 flex-shrink-0">
                      작업명
                    </div>
                    <div className="flex-1 bg-gray-50 relative">
                      {/* 월별 헤더 */}
                      <div className="relative">
                        {months.map((month, index) => {
                          const monthStart = new Date(month.year, month.month - 1, 1)
                          const baseDate = new Date('2024-01-01')
                          const monthStartDays = Math.floor((monthStart.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
                          const monthPosition = (monthStartDays / 150) * 100
                          
                          // 다음 월의 시작 위치 계산 (마지막 월 제외)
                          const nextMonthStart = index < months.length - 1 ? 
                            new Date(months[index + 1].year, months[index + 1].month - 1, 1) :
                            new Date(month.year, month.month, 1) // 현재 월의 다음 달 1일
                          const nextMonthStartDays = Math.floor((nextMonthStart.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
                          const nextMonthPosition = (nextMonthStartDays / 150) * 100
                          
                          const monthWidth = nextMonthPosition - monthPosition
                          
                          return (
                            <div
                              key={`${month.year}-${month.month}`}
                              className="absolute top-0 p-2 text-center"
                              style={{ 
                                left: `${monthPosition}%`,
                                width: `${monthWidth}%`,
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
                      <div className="w-64 p-2 border-r border-gray-200 flex-shrink-0">
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
                        <div className="flex-1 relative h-0 bg-gray-50 overflow-visible">
                          
                          {/* 작업 막대 */}
                          <div
                            className="absolute top-0.5 h-5 rounded opacity-80 flex items-center justify-center border border-gray-500"
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
                        <div className="flex-1 h-0 relative">
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 범례 */}
              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-200 rounded"></div>
                  <span className="text-sm">Lv1 작업</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 rounded"></div>
                  <span className="text-sm">Lv2 작업</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
