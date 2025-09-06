import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Plus, Edit, Trash2, ChevronDown, ChevronRight, Calendar, User, Table, GanttChart, Filter, Download, ZoomIn, ZoomOut } from "lucide-react"
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
  
  // 날짜 유효성 검사 함수
  const validateDateInput = (pos: number, value: string, currentDate: string) => {
    if (pos === 4) { // MM 첫 번째 자리
      const month = value + (currentDate[5] || '')
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
      const month = (currentDate[4] || '') + value
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
      const day = value + (currentDate[7] || '')
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
      const day = (currentDate[6] || '') + value
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
      assignee: "프로젝트 매니저",
      status: "완료",
      progress: 100,
      children: [
        {
          id: "1-1",
          name: "1.1 요구사항 분석",
          level: 2,
          startDate: "2024-01-01",
          endDate: "2024-01-15",
          assignee: "김분석",
          status: "완료",
          progress: 100,
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
          progress: 80,
        },
        {
          id: "2-2",
          name: "2.2 프로토타입 제작",
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
  const [tasks, setTasks] = useState<WBSTask[]>(wbsTasks)

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

  // 날짜 입력 핸들러
  const handleDateInput = (taskId: string, field: 'startDate' | 'endDate', position: number, value: string, target?: HTMLInputElement) => {
    const key = `${taskId}-${field}`
    const currentInput = dateInputs[key] || '        '
    const newInput = currentInput.split('')
    newInput[position] = value || ''
    const newValue = newInput.join('')
    
    // MM 또는 DD 유효성 검사
    if (value && (position >= 4 && position <= 7)) {
      if (!validateDateInput(position, value, newValue)) {
        // 유효하지 않으면 해당 부분을 비움
        const clearedInput = currentInput.split('')
        if (position >= 4 && position <= 5) { // MM 부분
          clearedInput[4] = ' '
          clearedInput[5] = ' '
        } else if (position >= 6 && position <= 7) { // DD 부분
          clearedInput[6] = ' '
          clearedInput[7] = ' '
        }
        const clearedValue = clearedInput.join('')
        
        setDateInputs(prev => ({
          ...prev,
          [key]: clearedValue
        }))
        
        // 유효성 검사 실패 시 해당 부분의 첫 번째 자리로 포커스 이동
        setTimeout(() => {
          const dateContainer = target.closest('.flex.items-center.gap-0')
          const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
          if (position >= 4 && position <= 5) { // MM 부분
            const mmFirstInput = allInputs[4] // MM 첫 번째 자리
            if (mmFirstInput) {
              mmFirstInput.focus()
              mmFirstInput.select()
            }
          } else if (position >= 6 && position <= 7) { // DD 부분
            const ddFirstInput = allInputs[6] // DD 첫 번째 자리
            if (ddFirstInput) {
              ddFirstInput.focus()
              ddFirstInput.select()
            }
          }
        }, 0)
        return
      }
    }
    
    setDateInputs(prev => ({
      ...prev,
      [key]: newValue
    }))
    
    // YYYY-MM-DD 형식으로 변환하여 저장
    if (newValue.length === 8) {
      const formatted = `${newValue.slice(0,4)}-${newValue.slice(4,6)}-${newValue.slice(6,8)}`
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
          color: task.level === 3 ? "bg-blue-200" : task.level === 2 ? "bg-green-200" : "bg-gray-200"
        })
        
        // 하위 항목이 있고 펼쳐진 상태인 경우에만 추가
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
            <div className="w-4 h-4 bg-blue-500 rounded-full">
            </div>
          )}
        </div>
        
        {/* L2 */}
        <div className="w-[16px] flex justify-center overflow-visible">
          {getLevelValue(2) && !getLevelValue(3) && (
            <div className="w-4 h-4 bg-green-500 rounded-full">
            </div>
          )}
        </div>
        
        {/* L3 */}
        <div className="w-[16px] flex justify-center overflow-visible">
          {getLevelValue(3) && !getLevelValue(4) && (
            <div className="w-4 h-4 bg-orange-500 rounded-full">
            </div>
          )}
        </div>
        
        {/* L4 */}
        <div className="w-[16px] flex justify-center overflow-visible">
          {getLevelValue(4) && !getLevelValue(5) && (
            <div className="w-4 h-4 bg-purple-500 rounded-full">
            </div>
          )}
        </div>
        
        {/* L5 */}
        <div className="w-[16px] flex justify-center overflow-visible">
          {getLevelValue(5) && (
            <div className="w-4 h-4 bg-pink-500 rounded-full">
            </div>
          )}
        </div>
        
        {/* 빈 열 (공백) */}
        <div className="w-[12px]"></div>
        
        {/* 작업명 */}
        <div className="w-[300px] flex items-center gap-2">
          <span className="font-medium text-sm">{task.name}</span>
        </div>
        
        {/* 상태 */}
        <div className="w-28 flex items-center">
          <select
            value={task.status}
            onChange={(e) => {
              // 여기서 실제 데이터 업데이트 로직을 추가해야 합니다
              console.log(`Task ${task.id} status updated to ${e.target.value}`)
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
          <div className="flex items-center gap-0">
            {/* YYYY */}
            {[0, 1, 2, 3].map(pos => (
              <input
                key={pos}
                type="text"
                maxLength={1}
                value={dateInputs[`${task.id}-startDate`]?.[pos] || ''}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement
                  target.focus()
                  target.select()
                }}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  if (value.length <= 1) {
                    handleDateInput(task.id, 'startDate', pos, value, target)
                  }
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  if (value.length <= 1) {
                    handleDateInput(task.id, 'startDate', pos, value, target)
                    // 숫자 입력 시 다음 칸으로 포커스 이동 (YYYY→MM, MM→DD)
                    if (value && pos < 7) {
                      setTimeout(() => {
                        // 현재 날짜 필드의 부모 컨테이너에서 다음 입력 필드 찾기
                        const dateContainer = target.closest('.flex.items-center.gap-0')
                        const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                        const currentIndex = Array.from(allInputs).indexOf(target)
                        const nextInput = allInputs[currentIndex + 1]
                        console.log('Debug - pos:', pos, 'currentIndex:', currentIndex, 'allInputs.length:', allInputs?.length, 'nextInput:', nextInput)
                        if (nextInput) {
                          nextInput.focus()
                          nextInput.select()
                          console.log('Debug - Focus moved to next input')
                        } else {
                          console.log('Debug - No next input found')
                        }
                      }, 0)
                    }
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement
                  if (e.key === 'Backspace' && !target.value && pos > 0) {
                    // 이전 자리로 이동
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
                className="w-2 h-6 text-center text-xs font-mono p-0"
                placeholder={pos === 0 ? 'Y' : pos === 1 ? 'Y' : pos === 2 ? 'Y' : 'Y'}
              />
            ))}
            <span className="text-gray-400">-</span>
            {/* MM */}
            {[4, 5].map(pos => (
              <input
                key={pos}
                type="text"
                maxLength={1}
                value={dateInputs[`${task.id}-startDate`]?.[pos] || ''}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement
                  target.focus()
                  target.select()
                }}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  if (value.length <= 1) {
                    handleDateInput(task.id, 'startDate', pos, value, target)
                  }
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  if (value.length <= 1) {
                    handleDateInput(task.id, 'startDate', pos, value, target)
                    // 숫자 입력 시 다음 칸으로 포커스 이동 (YYYY→MM, MM→DD)
                    if (value && pos < 7) {
                      setTimeout(() => {
                        // 현재 날짜 필드의 부모 컨테이너에서 다음 입력 필드 찾기
                        const dateContainer = target.closest('.flex.items-center.gap-0')
                        const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                        const currentIndex = Array.from(allInputs).indexOf(target)
                        const nextInput = allInputs[currentIndex + 1]
                        console.log('Debug - pos:', pos, 'currentIndex:', currentIndex, 'allInputs.length:', allInputs?.length, 'nextInput:', nextInput)
                        if (nextInput) {
                          nextInput.focus()
                          nextInput.select()
                          console.log('Debug - Focus moved to next input')
                        } else {
                          console.log('Debug - No next input found')
                        }
                      }, 0)
                    }
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement
                  if (e.key === 'Backspace' && !target.value && pos > 0) {
                    // 이전 자리로 이동
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
                className="w-2 h-6 text-center text-xs font-mono p-0"
                placeholder={pos === 4 ? 'M' : 'M'}
              />
            ))}
            <span className="text-gray-400">-</span>
            {/* DD */}
            {[6, 7].map(pos => (
              <input
                key={pos}
                type="text"
                maxLength={1}
                value={dateInputs[`${task.id}-startDate`]?.[pos] || ''}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement
                  target.focus()
                  target.select()
                }}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  if (value.length <= 1) {
                    handleDateInput(task.id, 'startDate', pos, value, target)
                  }
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  if (value.length <= 1) {
                    handleDateInput(task.id, 'startDate', pos, value, target)
                    // 숫자 입력 시 다음 칸으로 포커스 이동 (YYYY→MM, MM→DD)
                    if (value && pos < 7) {
                      setTimeout(() => {
                        // 현재 날짜 필드의 부모 컨테이너에서 다음 입력 필드 찾기
                        const dateContainer = target.closest('.flex.items-center.gap-0')
                        const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                        const currentIndex = Array.from(allInputs).indexOf(target)
                        const nextInput = allInputs[currentIndex + 1]
                        console.log('Debug - pos:', pos, 'currentIndex:', currentIndex, 'allInputs.length:', allInputs?.length, 'nextInput:', nextInput)
                        if (nextInput) {
                          nextInput.focus()
                          nextInput.select()
                          console.log('Debug - Focus moved to next input')
                        } else {
                          console.log('Debug - No next input found')
                        }
                      }, 0)
                    }
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement
                  if (e.key === 'Backspace' && !target.value && pos > 0) {
                    // 이전 자리로 이동
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
                className="w-2 h-6 text-center text-xs font-mono p-0"
                placeholder={pos === 6 ? 'D' : 'D'}
              />
            ))}
          </div>
        </div>
        
        {/* 종료일 */}
        <div className="flex-1 flex items-center gap-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-0">
            {/* YYYY */}
            {[0, 1, 2, 3].map(pos => (
              <input
                key={pos}
                type="text"
                maxLength={1}
                value={dateInputs[`${task.id}-endDate`]?.[pos] || ''}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement
                  target.focus()
                  target.select()
                }}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  if (value.length <= 1) {
                    handleDateInput(task.id, 'endDate', pos, value, target)
                    // 숫자 입력 시 다음 칸으로 포커스 이동 (YYYY→MM, MM→DD)
                    if (value && pos < 7) {
                      setTimeout(() => {
                        // 현재 날짜 필드의 부모 컨테이너에서 다음 입력 필드 찾기
                        const dateContainer = target.closest('.flex.items-center.gap-0')
                        const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                        const currentIndex = Array.from(allInputs).indexOf(target)
                        const nextInput = allInputs[currentIndex + 1]
                        console.log('Debug - pos:', pos, 'currentIndex:', currentIndex, 'allInputs.length:', allInputs?.length, 'nextInput:', nextInput)
                        if (nextInput) {
                          nextInput.focus()
                          nextInput.select()
                          console.log('Debug - Focus moved to next input')
                        } else {
                          console.log('Debug - No next input found')
                        }
                      }, 0)
                    }
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement
                  if (e.key === 'Backspace' && !target.value && pos > 0) {
                    // 이전 자리로 이동
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
                className="w-2 h-6 text-center text-xs font-mono p-0"
                placeholder={pos === 0 ? 'Y' : pos === 1 ? 'Y' : pos === 2 ? 'Y' : 'Y'}
              />
            ))}
            <span className="text-gray-400">-</span>
            {/* MM */}
            {[4, 5].map(pos => (
              <input
                key={pos}
                type="text"
                maxLength={1}
                value={dateInputs[`${task.id}-endDate`]?.[pos] || ''}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement
                  target.focus()
                  target.select()
                }}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  if (value.length <= 1) {
                    handleDateInput(task.id, 'endDate', pos, value, target)
                    // 숫자 입력 시 다음 칸으로 포커스 이동 (YYYY→MM, MM→DD)
                    if (value && pos < 7) {
                      setTimeout(() => {
                        // 현재 날짜 필드의 부모 컨테이너에서 다음 입력 필드 찾기
                        const dateContainer = target.closest('.flex.items-center.gap-0')
                        const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                        const currentIndex = Array.from(allInputs).indexOf(target)
                        const nextInput = allInputs[currentIndex + 1]
                        console.log('Debug - pos:', pos, 'currentIndex:', currentIndex, 'allInputs.length:', allInputs?.length, 'nextInput:', nextInput)
                        if (nextInput) {
                          nextInput.focus()
                          nextInput.select()
                          console.log('Debug - Focus moved to next input')
                        } else {
                          console.log('Debug - No next input found')
                        }
                      }, 0)
                    }
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement
                  if (e.key === 'Backspace' && !target.value && pos > 0) {
                    // 이전 자리로 이동
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
                className="w-2 h-6 text-center text-xs font-mono p-0"
                placeholder={pos === 4 ? 'M' : 'M'}
              />
            ))}
            <span className="text-gray-400">-</span>
            {/* DD */}
            {[6, 7].map(pos => (
              <input
                key={pos}
                type="text"
                maxLength={1}
                value={dateInputs[`${task.id}-endDate`]?.[pos] || ''}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement
                  target.focus()
                  target.select()
                }}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/[^0-9]/g, '')
                  if (value.length <= 1) {
                    handleDateInput(task.id, 'endDate', pos, value, target)
                    // 숫자 입력 시 다음 칸으로 포커스 이동 (YYYY→MM, MM→DD)
                    if (value && pos < 7) {
                      setTimeout(() => {
                        // 현재 날짜 필드의 부모 컨테이너에서 다음 입력 필드 찾기
                        const dateContainer = target.closest('.flex.items-center.gap-0')
                        const allInputs = dateContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
                        const currentIndex = Array.from(allInputs).indexOf(target)
                        const nextInput = allInputs[currentIndex + 1]
                        console.log('Debug - pos:', pos, 'currentIndex:', currentIndex, 'allInputs.length:', allInputs?.length, 'nextInput:', nextInput)
                        if (nextInput) {
                          nextInput.focus()
                          nextInput.select()
                          console.log('Debug - Focus moved to next input')
                        } else {
                          console.log('Debug - No next input found')
                        }
                      }, 0)
                    }
                  }
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement
                  if (e.key === 'Backspace' && !target.value && pos > 0) {
                    // 이전 자리로 이동
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
                className="w-2 h-6 text-center text-xs font-mono p-0"
                placeholder={pos === 6 ? 'D' : 'D'}
              />
            ))}
          </div>
        </div>
        
        {/* 담당자 */}
        <div className="flex-1 flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{task.assignee}</span>
        </div>
        
        {/* 진행률 게이지 + 입력 */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(task.progress)}`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <div className="flex items-center gap-0">
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <style dangerouslySetInnerHTML={{ __html: dropdownStyles }} />
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
                <div className="w-28">상태</div>
                <div className="flex-1">시작일</div>
                <div className="flex-1">종료일</div>
                <div className="flex-1">담당자</div>
                <div className="flex-1">진행률</div>
              </div>

              {/* 작업 목록 */}
              <div className="divide-y divide-gray-200">
                {getAllTasks(tasks).map((task) => renderTask(task))}
              </div>
            </>
          ) : (
            /* 간트차트 뷰 */
            <div className="space-y-4">
              {/* 간트차트 컨트롤 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">줌:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  내보내기
                </Button>
              </div>

              {/* 간트차트 */}
              <div className="overflow-x-auto">
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
                    <div className="flex-1 p-3 font-medium bg-gray-50">
                      <div className="text-sm">타임라인 (2024년 1월 ~ 5월)</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        최하위 작업만 표시됩니다
                      </div>
                    </div>
                  </div>

                  {/* 작업 행들 */}
                  {convertToGanttTasks(wbsTasks).map((task) => (
                    <div key={task.id} className="flex border-b border-gray-200 hover:bg-gray-50">
                      {/* 작업 정보 */}
                      <div className="w-64 p-3 border-r border-gray-200 flex-shrink-0">
                        <div className="flex items-center">
                          {/* 들여쓰기 */}
                          <div style={{ paddingLeft: `${task.depth * 20}px` }} className="flex items-center">
                            {/* 접기/펼치기 버튼 */}
                            {task.hasChildren ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-6 h-6 p-0 mr-2"
                                onClick={() => toggleTask(task.id)}
                              >
                                {expandedTasks.has(task.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                            ) : (
                              <div className="w-6 h-6 mr-2" />
                            )}
                            
                            {/* 작업명 */}
                            <div className="flex-1">
                              <div className={`font-medium text-sm ${
                                task.level === 3 ? 'text-blue-600' : 
                                task.level === 2 ? 'text-green-600' : 
                                'text-gray-700'
                              }`}>
                                {task.name}
                              </div>
                              {task.level === 3 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  담당: {task.assignee}
                                </div>
                              )}
                              {task.level === 3 && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={getStatusColor(task.status)} variant="secondary">
                                    {task.status}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground">
                                    {task.progress}%
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 타임라인 바 - 최하위 항목만 */}
                      {task.level === 3 ? (
                        <div className="flex-1 relative h-8 bg-gray-50">
                          {/* 전체 타임라인 배경 */}
                          <div className="absolute inset-0 flex">
                            {months.map((month, index) => {
                              const monthStart = new Date(month.year, month.month - 1, 1)
                              const baseDate = new Date('2024-01-01')
                              const monthStartDays = Math.floor((monthStart.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
                              const monthPosition = (monthStartDays / 150) * 100
                              
                              return (
                                <div
                                  key={`${month.year}-${month.month}`}
                                  className="absolute top-0 bottom-0 w-px bg-gray-300"
                                  style={{ left: `${monthPosition}%` }}
                                />
                              )
                            })}
                          </div>
                          
                          {/* 작업 막대 */}
                          <div
                            className={`absolute top-1 h-6 rounded ${task.color} opacity-80 flex items-center justify-center`}
                            style={{
                              left: calculateTaskPosition(task.startDate, task.endDate).left,
                              width: calculateTaskPosition(task.startDate, task.endDate).width,
                              minWidth: '20px' // 최소 너비 보장
                            }}
                          >
                            <span className="text-xs text-gray-800 font-medium truncate px-1">
                              {task.name}
                            </span>
                          </div>
                        </div>
                      ) : (
                        // 최하위가 아닌 경우 빈 공간
                        <div className="flex-1 h-8 bg-gray-50">
                          <div className="absolute inset-0">
                            {months.map((month, index) => {
                              const monthStart = new Date(month.year, month.month - 1, 1)
                              const baseDate = new Date('2024-01-01')
                              const monthStartDays = Math.floor((monthStart.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
                              const monthPosition = (monthStartDays / 150) * 100
                              
                              return (
                                <div
                                  key={`${month.year}-${month.month}`}
                                  className="absolute top-0 bottom-0 w-px bg-gray-300"
                                  style={{ left: `${monthPosition}%` }}
                                />
                              )
                            })}
                          </div>
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
