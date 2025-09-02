import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Plus, Edit, Trash2, ChevronDown, ChevronRight, Calendar, User } from "lucide-react"

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
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [selectedProject, setSelectedProject] = useState<string>("1")

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

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const renderTask = (task: WBSTask, depth: number = 0) => {
    const isExpanded = expandedTasks.has(task.id)
    const hasChildren = task.children && task.children.length > 0

    return (
      <div key={task.id}>
        <div 
          className={`flex items-center p-3 border-b border-gray-200 hover:bg-gray-50 ${
            depth > 0 ? 'ml-6' : ''
          }`}
        >
          {/* 확장/축소 버튼 */}
          <div className="w-6 flex justify-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleTask(task.id)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6" />
            )}
          </div>

          {/* 작업 정보 */}
          <div className="flex-1 grid grid-cols-6 gap-4 items-center">
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{task.name}</span>
                <Badge variant="outline" className="text-xs">
                  L{task.level}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{task.startDate}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{task.endDate}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{task.assignee}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(task.status)} variant="secondary">
                {task.status}
              </Badge>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(task.progress)}`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8">
                  {task.progress}%
                </span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 하위 작업들 */}
        {hasChildren && isExpanded && (
          <div>
            {task.children!.map((childTask) => renderTask(childTask, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">WBS 관리</h1>
          <p className="text-muted-foreground">프로젝트 작업 분할 구조(WBS)를 관리할 수 있습니다.</p>
        </div>
      </div>

      {/* 프로젝트 선택 및 컨트롤 */}
      <Card>
        <CardHeader>
          <CardTitle>프로젝트 설정</CardTitle>
          <CardDescription>WBS를 관리할 프로젝트를 선택하고 작업을 추가할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">프로젝트:</span>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="프로젝트 선택" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button>
              <Plus className="w-4 h-4 mr-2" />
              작업 추가
            </Button>

            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              간트 차트 보기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WBS 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>작업 분할 구조</CardTitle>
          <CardDescription>레벨별로 구성된 작업 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 border-b border-gray-200 font-medium text-sm">
            <div className="col-span-2">작업명</div>
            <div>시작일</div>
            <div>종료일</div>
            <div>담당자</div>
            <div>상태 및 진행률</div>
          </div>

          {/* 작업 목록 */}
          <div className="divide-y divide-gray-200">
            {wbsTasks.map((task) => renderTask(task))}
          </div>
        </CardContent>
      </Card>

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">전체 작업</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-muted-foreground">완료된 작업</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-muted-foreground">진행중인 작업</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <div className="text-sm text-muted-foreground">계획중인 작업</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
