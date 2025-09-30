import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  UserCheck, 
  Clock, 
  Target, 
  FileText, 
  Users,
  Plus,
  Edit,
  Trash2
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

// 리소스 관리 데이터 타입
interface ResourceAllocation {
  id: string
  memberId: string
  memberName: string
  memberRole: string
  startDate: string
  endDate: string
  workType: 'full-time' | 'part-time' | 'remote'
  status: 'planned' | 'active' | 'completed' | 'cancelled'
  tasks: Task[]
  outputs: Output[]
}

interface Task {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
  dueDate: string
}

interface Output {
  id: string
  title: string
  description: string
  deliverableType: 'document' | 'code' | 'design' | 'report' | 'presentation'
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed'
}

const ResourceManagement = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [activeProject, setActiveProject] = useState<any>(null)
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    loadActiveProject()
  }, [])

  useEffect(() => {
    if (activeProject) {
      loadResourceData()
    }
  }, [activeProject])

  // 페이지 이동 감지 - F5와 동일한 처리
  useEffect(() => {
    console.log('🔄 리소스 관리 페이지 이동 감지:', location.pathname)
    loadActiveProject()
  }, [location.pathname])

  const loadActiveProject = async () => {
    try {
      setIsLoading(true)
      const savedOpenProject = localStorage.getItem('openProject')
      if (savedOpenProject) {
        const project = JSON.parse(savedOpenProject)
        setActiveProject(project)
      }
    } catch (error) {
      console.error('프로젝트 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadResourceData = async () => {
    try {
      // 목업 데이터
      const mockData: ResourceAllocation[] = [
        {
          id: '1',
          memberId: 'user1',
          memberName: '김개발',
          memberRole: '시니어 개발자',
          startDate: '2024-01-15',
          endDate: '2024-03-15',
          workType: 'full-time',
          status: 'active',
          tasks: [
            {
              id: 't1',
              title: 'API 설계 및 구현',
              description: 'RESTful API 설계 및 백엔드 구현',
              priority: 'high',
              status: 'in_progress',
              dueDate: '2024-02-15'
            },
            {
              id: 't2',
              title: '데이터베이스 설계',
              description: '프로젝트 데이터베이스 스키마 설계',
              priority: 'high',
              status: 'completed',
              dueDate: '2024-01-30'
            }
          ],
          outputs: [
            {
              id: 'o1',
              title: 'API 명세서',
              description: 'RESTful API 명세서 작성 및 문서화',
              deliverableType: 'document',
              dueDate: '2024-02-10',
              status: 'pending'
            },
            {
              id: 'o2',
              title: '백엔드 코드',
              description: 'API 서버 구현 코드 및 테스트 코드',
              deliverableType: 'code',
              dueDate: '2024-03-01',
              status: 'in_progress'
            },
            {
              id: 'o3',
              title: '데이터베이스 설계서',
              description: 'ERD 및 데이터베이스 스키마 설계서',
              deliverableType: 'document',
              dueDate: '2024-01-30',
              status: 'completed'
            },
            {
              id: 'o4',
              title: '기술 검토 보고서',
              description: '아키텍처 및 기술 스택 검토 보고서',
              deliverableType: 'report',
              dueDate: '2024-02-20',
              status: 'pending'
            }
          ]
        },
        {
          id: '2',
          memberId: 'user2',
          memberName: '이디자인',
          memberRole: 'UI/UX 디자이너',
          startDate: '2024-01-20',
          endDate: '2024-02-20',
          workType: 'part-time',
          status: 'active',
          tasks: [
            {
              id: 't3',
              title: 'UI/UX 디자인',
              description: '사용자 인터페이스 및 사용자 경험 디자인',
              priority: 'high',
              status: 'in_progress',
              dueDate: '2024-02-15'
            }
          ],
          outputs: [
            {
              id: 'o3',
              title: '디자인 시스템',
              description: '일관된 디자인 시스템 구축 및 가이드라인',
              deliverableType: 'design',
              dueDate: '2024-02-10',
              status: 'in_progress'
            },
            {
              id: 'o4',
              title: '프로토타입',
              description: '인터랙티브 프로토타입 제작',
              deliverableType: 'design',
              dueDate: '2024-02-20',
              status: 'pending'
            },
            {
              id: 'o5',
              title: 'UI 컴포넌트 라이브러리',
              description: '재사용 가능한 UI 컴포넌트 모음',
              deliverableType: 'code',
              dueDate: '2024-02-15',
              status: 'pending'
            },
            {
              id: 'o6',
              title: '사용자 경험 분석 보고서',
              description: '사용자 리서치 및 UX 분석 결과',
              deliverableType: 'report',
              dueDate: '2024-02-05',
              status: 'completed'
            }
          ]
        },
        {
          id: '3',
          memberId: 'user3',
          memberName: '박테스트',
          memberRole: 'QA 엔지니어',
          startDate: '2024-02-01',
          endDate: '2024-03-30',
          workType: 'remote',
          status: 'planned',
          tasks: [
            {
              id: 't4',
              title: '테스트 계획 수립',
              description: '전체 테스트 계획 및 전략 수립',
              priority: 'medium',
              status: 'pending',
              dueDate: '2024-02-10'
            }
          ],
          outputs: [
            {
              id: 'o7',
              title: '테스트 계획서',
              description: '상세한 테스트 계획서 및 전략 수립',
              deliverableType: 'document',
              dueDate: '2024-02-15',
              status: 'pending'
            },
            {
              id: 'o8',
              title: '자동화 테스트 코드',
              description: 'E2E 및 단위 테스트 자동화 코드',
              deliverableType: 'code',
              dueDate: '2024-03-10',
              status: 'pending'
            },
            {
              id: 'o9',
              title: '테스트 결과 보고서',
              description: '테스트 실행 결과 및 버그 리포트',
              deliverableType: 'report',
              dueDate: '2024-03-25',
              status: 'pending'
            },
            {
              id: 'o10',
              title: '품질 보증 가이드',
              description: 'QA 프로세스 및 체크리스트 가이드',
              deliverableType: 'document',
              dueDate: '2024-02-28',
              status: 'pending'
            }
          ]
        }
      ]
      
      setResourceAllocations(mockData)
    } catch (error) {
      console.error('리소스 데이터 로드 실패:', error)
    }
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행중'
      case 'planned': return '계획됨'
      case 'completed': return '완료'
      case 'cancelled': return '취소됨'
      default: return status
    }
  }

  const getWorkTypeText = (workType: string) => {
    switch (workType) {
      case 'full-time': return '상주'
      case 'part-time': return '부분상주'
      case 'remote': return '비상주'
      default: return workType
    }
  }

  const getWorkTypeColor = (workType: string) => {
    switch (workType) {
      case 'full-time': return 'bg-blue-100 text-blue-800'
      case 'part-time': return 'bg-yellow-100 text-yellow-800'
      case 'remote': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeliverableIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />
      case 'code': return <Target className="w-4 h-4" />
      case 'design': return <Users className="w-4 h-4" />
      case 'report': return <FileText className="w-4 h-4" />
      case 'presentation': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">리소스 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">활성화된 프로젝트가 없습니다</h3>
          <p className="text-muted-foreground">프로젝트를 선택한 후 리소스 관리를 이용하세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">리소스 관리</h1>
            <p className="text-muted-foreground">프로젝트 구성원의 투입/철수 일정과 주요 업무를 관리합니다.</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          리소스 할당
        </Button>
      </div>

      {/* 현재 프로젝트 */}
      {activeProject && (
        <div className="mb-6">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <span className="text-sm text-muted-foreground">현재 프로젝트:</span>
              <span className="ml-2 text-lg font-semibold">{activeProject.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* 통계 요약 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-blue-600">
                  {resourceAllocations.length}
                </div>
                <div className="text-sm text-muted-foreground">총 할당 인원</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-green-600">
                  {resourceAllocations.filter(r => r.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">현재 투입</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-yellow-600">
                  {resourceAllocations.filter(r => r.status === 'planned').length}
                </div>
                <div className="text-sm text-muted-foreground">투입 예정</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-gray-600">
                  {resourceAllocations.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">철수 완료</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              현재 투입 인원 현황
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 리소스 할당 표 */}
      <Card>
        <CardHeader>
          <CardTitle>리소스 할당 현황</CardTitle>
          <CardDescription>구성원별 투입/철수 일정 및 주요 업무</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">구성원</th>
                  <th className="text-left p-3 font-semibold">역할</th>
                  <th className="text-left p-3 font-semibold">상주 유형</th>
                  <th className="text-left p-3 font-semibold">투입일</th>
                  <th className="text-left p-3 font-semibold">철수일</th>
                  <th className="text-left p-3 font-semibold">주요 작업</th>
                  <th className="text-left p-3 font-semibold">액션</th>
                </tr>
              </thead>
              <tbody>
                {resourceAllocations.map((allocation) => (
                  <tr key={allocation.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{allocation.memberName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {allocation.memberRole}
                    </td>
                    <td className="p-3">
                      <Badge className={getWorkTypeColor(allocation.workType)}>
                        {getWorkTypeText(allocation.workType)}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">
                      {allocation.startDate}
                    </td>
                    <td className="p-3 text-sm">
                      {allocation.endDate}
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {allocation.tasks.slice(0, 2).map((task) => (
                          <div key={task.id} className="text-xs text-muted-foreground">
                            • {task.title}
                          </div>
                        ))}
                        {allocation.tasks.length > 2 && (
                          <div className="text-xs text-blue-600">
                            +{allocation.tasks.length - 2}개 더
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                          투입
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          철수
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResourceManagement
