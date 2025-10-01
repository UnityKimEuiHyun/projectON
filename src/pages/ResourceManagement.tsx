import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import TaskDetailModal, { WBSTask as TaskDetailWBSTask } from "@/components/TaskDetailModal"
import { 
  UserCheck, 
  Clock, 
  Target, 
  FileText, 
  Users,
  Plus,
  Edit,
  Trash2,
  ExternalLink
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getCompanyMembers, type CompanyMember } from "@/services/companyService"

// WBS 작업 타입 - 공통 컴포넌트와 동일한 타입 사용
type WBSTask = TaskDetailWBSTask

// 리소스 관리 데이터 타입
interface ResourceAllocation {
  id: string
  memberId: string
  memberName: string
  memberRole: string
  startDate: string
  endDate: string
  workType: 'full-time' | 'part-time' | 'remote'
  status: 'planned' | 'deployment_requested' | 'active' | 'withdrawal_requested' | 'completed' | 'cancelled'
  assignedTasks: WBSTask[]
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
  const navigate = useNavigate()
  const [activeProject, setActiveProject] = useState<any>(null)
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([])
  const [wbsTasks, setWbsTasks] = useState<WBSTask[]>([])
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set())
  
  // 작업 상세 모달 상태
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false)
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<WBSTask | null>(null)
  useEffect(() => {
    loadActiveProject()
  }, [])

  useEffect(() => {
    if (activeProject) {
      loadWbsTasks()
    }
  }, [activeProject])

  useEffect(() => {
    if (activeProject?.group_id) {
      loadCompanyMembers()
    }
  }, [activeProject?.group_id])

  // companyMembers와 wbsTasks가 모두 로드된 후 리소스 데이터 생성
  useEffect(() => {
    if (companyMembers.length > 0) {
      loadResourceData()
    }
  }, [companyMembers, wbsTasks])

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

  const loadCompanyMembers = async () => {
    try {
      console.log('🔍 기업 멤버 로드 시작')
      console.log('🏢 activeProject:', activeProject)
      console.log('🏢 group_id:', activeProject?.group_id)
      
      // 목업 데이터 사용 (실제 API 호출 대신)
      const mockMembers: CompanyMember[] = [
        { 
          id: '1', 
          user_id: '1', 
          display_name: '김의현', 
          email: 'ehkim1130@gmail.com', 
          role: 'owner' 
        },
        { 
          id: '2', 
          user_id: '2', 
          display_name: '김의현2', 
          email: 'ehkim2@company.com', 
          role: 'admin' 
        },
        { 
          id: '3', 
          user_id: '3', 
          display_name: '김분석', 
          email: 'kim.analysis@company.com', 
          role: 'member' 
        },
        { 
          id: '4', 
          user_id: '4', 
          display_name: '박계획', 
          email: 'park.planning@company.com', 
          role: 'member' 
        },
        { 
          id: '5', 
          user_id: '5', 
          display_name: '이디자인', 
          email: 'lee.design@company.com', 
          role: 'member' 
        },
        { 
          id: '6', 
          user_id: '6', 
          display_name: '최그래픽', 
          email: 'choi.graphic@company.com', 
          role: 'member' 
        },
        { 
          id: '7', 
          user_id: '7', 
          display_name: '최프로토', 
          email: 'choi.prototype@company.com', 
          role: 'member' 
        },
        { 
          id: '8', 
          user_id: '8', 
          display_name: '김프론트', 
          email: 'kim.frontend@company.com', 
          role: 'member' 
        },
        { 
          id: '9', 
          user_id: '9', 
          display_name: '박백엔드', 
          email: 'park.backend@company.com', 
          role: 'member' 
        }
      ]
      
      console.log('👥 로드된 기업 멤버 (목업):', mockMembers)
      setCompanyMembers(mockMembers)
      
      // 실제 API 호출은 주석 처리
      // if (activeProject?.group_id) {
      //   const members = await getCompanyMembers(activeProject.group_id)
      //   console.log('👥 로드된 기업 멤버:', members)
      //   setCompanyMembers(members)
      // } else {
      //   console.log('⚠️ group_id가 없어서 기업 멤버를 로드할 수 없습니다')
      // }
    } catch (error) {
      console.error('기업 멤버 로드 실패:', error)
    }
  }

  const loadWbsTasks = async () => {
    try {
      console.log('🔍 WBS 작업 로드 시작')
      // WBSManagement 페이지의 실제 작업 데이터를 기반으로 한 목업 데이터 (계층 구조)
      const mockWbsTasks: WBSTask[] = [
        // 레벨 1: 프로젝트 기획
        {
          id: '1',
          name: '프로젝트 기획',
          level: 1,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          assignee: '김의현',
          assigneeId: '1',
          status: '완료',
          progress: 100,
          description: '프로젝트 전체 기획 및 관리',
          children: [
            // 레벨 2: 요구사항 분석
            {
              id: '1-1',
              name: '요구사항 분석',
              level: 2,
              startDate: '2024-01-01',
              endDate: '2024-01-15',
              assignee: '김의현2',
              assigneeId: '2',
              status: '완료',
              progress: 100,
              description: '사용자 요구사항 수집 및 분석',
              children: [
                // 레벨 3: 하위 작업들
                {
                  id: '1-1-1',
                  name: '사용자 인터뷰',
                  level: 3,
                  startDate: '2024-01-01',
                  endDate: '2024-01-05',
                  assignee: '김분석',
                  assigneeId: '3',
                  status: '완료',
                  progress: 100,
                  description: '사용자 인터뷰 실시 및 데이터 수집'
                },
                {
                  id: '1-1-2',
                  name: '요구사항 정리',
                  level: 3,
                  startDate: '2024-01-06',
                  endDate: '2024-01-10',
                  assignee: '김분석',
                  assigneeId: '3',
                  status: '완료',
                  progress: 100,
                  description: '수집된 요구사항 정리 및 문서화'
                },
                {
                  id: '1-1-3',
                  name: '요구사항 검토',
                  level: 3,
                  startDate: '2024-01-11',
                  endDate: '2024-01-15',
                  assignee: '김분석',
                  assigneeId: '3',
                  status: '완료',
                  progress: 100,
                  description: '요구사항 검토 및 승인'
                }
              ]
            },
            // 레벨 2: 프로젝트 계획 수립
            {
              id: '1-2',
              name: '프로젝트 계획 수립',
              level: 2,
              startDate: '2024-01-16',
              endDate: '2024-01-31',
              assignee: '박계획',
              assigneeId: '4',
              status: '완료',
              progress: 100,
              description: '프로젝트 계획 수립 및 일정 관리',
              children: [
                // 레벨 3: 하위 작업들
                {
                  id: '1-2-1',
                  name: 'WBS 작성',
                  level: 3,
                  startDate: '2024-01-16',
                  endDate: '2024-01-20',
                  assignee: '박계획',
                  assigneeId: '4',
                  status: '완료',
                  progress: 100,
                  description: 'Work Breakdown Structure 작성'
                },
                {
                  id: '1-2-2',
                  name: '일정 계획',
                  level: 3,
                  startDate: '2024-01-21',
                  endDate: '2024-01-25',
                  assignee: '박계획',
                  assigneeId: '4',
                  status: '완료',
                  progress: 100,
                  description: '프로젝트 일정 계획 수립'
                },
                {
                  id: '1-2-3',
                  name: '리소스 계획',
                  level: 3,
                  startDate: '2024-01-26',
                  endDate: '2024-01-31',
                  assignee: '박계획',
                  assigneeId: '4',
                  status: '완료',
                  progress: 100,
                  description: '리소스 할당 및 관리 계획'
                }
              ]
            }
          ]
        },
        // 레벨 1: 디자인
        {
          id: '2',
          name: '디자인',
          level: 1,
          startDate: '2024-02-01',
          endDate: '2024-02-28',
          assignee: '디자인팀',
          assigneeId: '10',
          status: '진행중',
          progress: 70,
          description: '전체 디자인 작업',
          children: [
            // 레벨 2: UI/UX 디자인
            {
              id: '2-1',
              name: 'UI/UX 디자인',
              level: 2,
              startDate: '2024-02-01',
              endDate: '2024-02-15',
              assignee: '이디자인',
              assigneeId: '5',
              status: '진행중',
              progress: 70,
              description: '사용자 인터페이스 및 사용자 경험 디자인',
              children: [
                // 레벨 3: 하위 작업들
                {
                  id: '2-1-1',
                  name: '와이어프레임',
                  level: 3,
                  startDate: '2024-02-01',
                  endDate: '2024-02-05',
                  assignee: '이디자인',
                  assigneeId: '5',
                  status: '완료',
                  progress: 100,
                  description: '화면별 와이어프레임 설계'
                },
                {
                  id: '2-1-2',
                  name: '프로토타입',
                  level: 3,
                  startDate: '2024-02-06',
                  endDate: '2024-02-10',
                  assignee: '이디자인',
                  assigneeId: '5',
                  status: '진행중',
                  progress: 80,
                  description: '인터랙티브 프로토타입 제작'
                },
                {
                  id: '2-1-3',
                  name: '디자인 시스템',
                  level: 3,
                  startDate: '2024-02-11',
                  endDate: '2024-02-15',
                  assignee: '이디자인',
                  assigneeId: '5',
                  status: '진행중',
                  progress: 50,
                  description: '디자인 시스템 구축'
                }
              ]
            },
            // 레벨 2: 그래픽 디자인
            {
              id: '2-2',
              name: '그래픽 디자인',
              level: 2,
              startDate: '2024-02-16',
              endDate: '2024-02-28',
              assignee: '최그래픽',
              assigneeId: '6',
              status: '진행중',
              progress: 80,
              description: '그래픽 디자인 및 시각적 요소 제작',
              children: [
                // 레벨 3: 하위 작업들
                {
                  id: '2-2-1',
                  name: '로고 디자인',
                  level: 3,
                  startDate: '2024-02-16',
                  endDate: '2024-02-20',
                  assignee: '최그래픽',
                  assigneeId: '6',
                  status: '완료',
                  progress: 100,
                  description: '브랜드 로고 디자인'
                },
                {
                  id: '2-2-2',
                  name: '아이콘 디자인',
                  level: 3,
                  startDate: '2024-02-21',
                  endDate: '2024-02-25',
                  assignee: '최그래픽',
                  assigneeId: '6',
                  status: '진행중',
                  progress: 60,
                  description: 'UI 아이콘 세트 디자인'
                },
                {
                  id: '2-2-3',
                  name: '일러스트레이션',
                  level: 3,
                  startDate: '2024-02-26',
                  endDate: '2024-02-28',
                  assignee: '최그래픽',
                  assigneeId: '6',
                  status: '진행중',
                  progress: 30,
                  description: '일러스트레이션 제작'
                }
              ]
            },
            // 레벨 2: 프로토타입 제작
            {
              id: '2-3',
              name: '프로토타입 제작',
              level: 2,
              startDate: '2024-02-16',
              endDate: '2024-02-28',
              assignee: '최프로토',
              assigneeId: '7',
              status: '진행중',
              progress: 60,
              description: '고품질 프로토타입 제작',
              children: [
                {
                  id: '2-3-1',
                  name: '프로토타입 설계',
                  level: 3,
                  startDate: '2024-02-16',
                  endDate: '2024-02-20',
                  assignee: '최프로토',
                  assigneeId: '7',
                  status: '완료',
                  progress: 100,
                  description: '프로토타입 구조 설계'
                },
                {
                  id: '2-3-2',
                  name: '프로토타입 구현',
                  level: 3,
                  startDate: '2024-02-21',
                  endDate: '2024-02-25',
                  assignee: '최프로토',
                  assigneeId: '7',
                  status: '진행중',
                  progress: 40,
                  description: '프로토타입 기능 구현'
                },
                {
                  id: '2-3-3',
                  name: '프로토타입 테스트',
                  level: 3,
                  startDate: '2024-02-26',
                  endDate: '2024-02-28',
                  assignee: '최프로토',
                  assigneeId: '7',
                  status: '계획중',
                  progress: 0,
                  description: '프로토타입 사용성 테스트'
                }
              ]
            }
          ]
        },
        // 레벨 1: 개발
        {
          id: '3',
          name: '개발',
          level: 1,
          startDate: '2024-03-01',
          endDate: '2024-05-31',
          assignee: '개발팀',
          assigneeId: '11',
          status: '계획중',
          progress: 0,
          description: '전체 개발 작업',
          children: [
            // 레벨 2: 프론트엔드 개발
            {
              id: '3-1',
              name: '프론트엔드 개발',
              level: 2,
              startDate: '2024-03-01',
              endDate: '2024-04-30',
              assignee: '김프론트',
              assigneeId: '8',
              status: '계획중',
              progress: 0,
              description: '프론트엔드 애플리케이션 개발',
              children: [
                {
                  id: '3-1-1',
                  name: 'UI 컴포넌트 개발',
                  level: 3,
                  startDate: '2024-03-01',
                  endDate: '2024-03-15',
                  assignee: '김프론트',
                  assigneeId: '8',
                  status: '계획중',
                  progress: 0,
                  description: '재사용 가능한 UI 컴포넌트 개발'
                },
                {
                  id: '3-1-2',
                  name: '페이지 구현',
                  level: 3,
                  startDate: '2024-03-16',
                  endDate: '2024-04-15',
                  assignee: '김프론트',
                  assigneeId: '8',
                  status: '계획중',
                  progress: 0,
                  description: '각 페이지별 기능 구현'
                },
                {
                  id: '3-1-3',
                  name: 'API 연동',
                  level: 3,
                  startDate: '2024-04-16',
                  endDate: '2024-04-30',
                  assignee: '김프론트',
                  assigneeId: '8',
                  status: '계획중',
                  progress: 0,
                  description: '백엔드 API와의 연동 작업'
                }
              ]
            },
            // 레벨 2: 백엔드 개발
            {
              id: '3-2',
              name: '백엔드 개발',
              level: 2,
              startDate: '2024-03-15',
              endDate: '2024-05-15',
              assignee: '박백엔드',
              assigneeId: '9',
              status: '계획중',
              progress: 0,
              description: '백엔드 서버 및 API 개발',
              children: [
                {
                  id: '3-2-1',
                  name: '데이터베이스 설계',
                  level: 3,
                  startDate: '2024-03-15',
                  endDate: '2024-03-25',
                  assignee: '박백엔드',
                  assigneeId: '9',
                  status: '계획중',
                  progress: 0,
                  description: '데이터베이스 스키마 설계 및 구축'
                },
                {
                  id: '3-2-2',
                  name: 'API 서버 구축',
                  level: 3,
                  startDate: '2024-03-26',
                  endDate: '2024-04-30',
                  assignee: '박백엔드',
                  assigneeId: '9',
                  status: '계획중',
                  progress: 0,
                  description: 'RESTful API 서버 구축'
                },
                {
                  id: '3-2-3',
                  name: 'API 테스트',
                  level: 3,
                  startDate: '2024-05-01',
                  endDate: '2024-05-15',
                  assignee: '박백엔드',
                  assigneeId: '9',
                  status: '계획중',
                  progress: 0,
                  description: 'API 기능 테스트 및 검증'
                }
              ]
            }
          ]
        }
      ]
      
      console.log('📋 로드된 WBS 작업:', mockWbsTasks)
      setWbsTasks(mockWbsTasks)
    } catch (error) {
      console.error('WBS 작업 데이터 로드 실패:', error)
    }
  }

  const loadResourceData = async () => {
    try {
      console.log('🔍 리소스 데이터 로드 시작')
      console.log('👥 기업 멤버 수:', companyMembers.length)
      console.log('📋 WBS 작업 수:', wbsTasks.length)
      console.log('👥 기업 멤버:', companyMembers)
      console.log('📋 WBS 작업:', wbsTasks)
      
      // 계층 구조에서 모든 작업을 평면적으로 추출
      const allTasks = flattenTasks(wbsTasks)
      console.log('📋 평면화된 모든 작업:', allTasks)
      
      // 기업 멤버와 WBS 작업을 기반으로 리소스 할당 데이터 생성
      const statusOptions: ('planned' | 'deployment_requested' | 'active' | 'withdrawal_requested' | 'completed' | 'cancelled')[] = [
        'planned', 'deployment_requested', 'active', 'withdrawal_requested', 'completed', 'cancelled'
      ]
      
      const workTypeOptions: ('full-time' | 'part-time' | 'remote')[] = [
        'full-time', 'part-time', 'remote'
      ]
      
      const allocations: ResourceAllocation[] = companyMembers.map((member, index) => {
        const assignedTasks = allTasks.filter(task => 
          task.assigneeId === member.id || task.assignee === member.display_name
        )
        
        console.log(`🔍 ${member.display_name}에게 할당된 작업:`, assignedTasks)
        
        // 인덱스에 따라 다양한 상태와 상주 유형 할당
        const status = statusOptions[index % statusOptions.length]
        const workType = workTypeOptions[index % workTypeOptions.length]
        
        return {
          id: member.id,
          memberId: member.id,
          memberName: member.display_name,
          memberRole: member.role,
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          workType: workType,
          status: status,
          assignedTasks: assignedTasks
        }
      })
      
      console.log('📊 생성된 리소스 할당:', allocations)
      setResourceAllocations(allocations)
    } catch (error) {
      console.error('리소스 데이터 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 계층 구조에서 모든 작업을 평면적으로 추출하는 함수
  const flattenTasks = (tasks: WBSTask[]): WBSTask[] => {
    const result: WBSTask[] = []
    
    const traverse = (taskList: WBSTask[]) => {
      for (const task of taskList) {
        result.push(task)
        if (task.children) {
          traverse(task.children)
        }
      }
    }
    
    traverse(tasks)
    return result
  }

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

  // 작업 상세 모달을 여는 함수
  const openTaskDetailModal = (taskId: string) => {
    const task = findTaskById(wbsTasks, taskId)
    if (task) {
      setSelectedTaskDetail(task)
      setTaskDetailModalOpen(true)
    }
  }

  // 멤버의 작업 목록 확장/축소 토글
  const toggleMemberExpansion = (memberId: string) => {
    const newExpanded = new Set(expandedMembers)
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId)
    } else {
      newExpanded.add(memberId)
    }
    setExpandedMembers(newExpanded)
  }

  // 기존 목업 데이터 (참고용으로 유지)
  const loadResourceDataOld = async () => {
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

  // 투입 현황 텍스트 반환
  const getDeploymentStatusText = (status: string) => {
    switch (status) {
      case 'planned': return '미투입'
      case 'deployment_requested': return '미투입'
      case 'active': return '투입'
      case 'withdrawal_requested': return '투입'
      case 'completed': return '투입'
      case 'cancelled': return '미투입'
      default: return status
    }
  }

  // 투입 현황 색상 반환
  const getDeploymentStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-100 text-gray-800'
      case 'deployment_requested': return 'bg-gray-100 text-gray-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'withdrawal_requested': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // 액션 버튼 텍스트 반환
  const getActionButtonText = (status: string) => {
    switch (status) {
      case 'planned': return '투입'
      case 'deployment_requested': return '투입 요청됨'
      case 'active': return '철수'
      case 'withdrawal_requested': return '철수 요청됨'
      case 'completed': return '철수'
      case 'cancelled': return '투입'
      default: return '투입'
    }
  }

  // 액션 버튼 색상 반환
  const getActionButtonColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-blue-600 hover:text-blue-700'
      case 'deployment_requested': return 'text-yellow-600 hover:text-yellow-700'
      case 'active': return 'text-red-600 hover:text-red-700'
      case 'withdrawal_requested': return 'text-yellow-600 hover:text-yellow-700'
      case 'completed': return 'text-red-600 hover:text-red-700'
      case 'cancelled': return 'text-blue-600 hover:text-blue-700'
      default: return 'text-blue-600 hover:text-blue-700'
    }
  }

  // 투입 현황 액션 처리
  const handleDeploymentAction = (allocationId: string, newStatus: string) => {
    setResourceAllocations(prev => 
      prev.map(allocation => 
        allocation.id === allocationId 
          ? { ...allocation, status: newStatus as 'planned' | 'deployment_requested' | 'active' | 'withdrawal_requested' | 'completed' | 'cancelled' }
          : allocation
      )
    )
    
    // 토스트 알림
    const statusText = getDeploymentStatusText(newStatus)
    console.log(`리소스 ${allocationId}의 상태가 ${statusText}로 변경되었습니다.`)
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
                  <th className="text-left p-3 font-semibold">할당된 작업</th>
                  <th className="text-left p-3 font-semibold">투입 현황</th>
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
                        {allocation.assignedTasks.slice(0, 2).map((task) => (
                          <div 
                            key={task.id} 
                            className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 group"
                            onClick={() => openTaskDetailModal(task.id)}
                          >
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="truncate max-w-[200px]" title={`[${task.id}] ${task.name}`}>
                              <span className="text-gray-500 font-mono text-[10px]">[{task.id}]</span> {task.name}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                task.status === '완료' ? 'bg-green-100 text-green-800' :
                                task.status === '진행중' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {task.status}
                            </Badge>
                          </div>
                        ))}
                        
                        {/* 확장된 상태에서 나머지 작업들 표시 */}
                        {expandedMembers.has(allocation.id) && allocation.assignedTasks.length > 2 && (
                          <div className="space-y-1 mt-2 pt-2 border-t border-gray-200">
                            {allocation.assignedTasks.slice(2).map((task) => (
                              <div 
                                key={task.id} 
                                className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 group"
                                onClick={() => openTaskDetailModal(task.id)}
                              >
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="truncate max-w-[200px]" title={`[${task.id}] ${task.name}`}>
                                  <span className="text-gray-500 font-mono text-[10px]">[{task.id}]</span> {task.name}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    task.status === '완료' ? 'bg-green-100 text-green-800' :
                                    task.status === '진행중' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {task.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* +N개 더 버튼 */}
                        {allocation.assignedTasks.length > 2 && (
                          <div 
                            className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 group"
                            onClick={() => toggleMemberExpansion(allocation.id)}
                          >
                            <span className="font-medium">
                              {expandedMembers.has(allocation.id) ? '접기' : `+${allocation.assignedTasks.length - 2}개 더`}
                            </span>
                            <div className={`w-3 h-3 transition-transform ${expandedMembers.has(allocation.id) ? 'rotate-180' : ''}`}>
                              <svg viewBox="0 0 12 12" fill="currentColor">
                                <path d="M6 8L2 4h8L6 8z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        
                        {allocation.assignedTasks.length === 0 && (
                          <div className="text-xs text-muted-foreground">
                            할당된 작업 없음
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge 
                        className={getDeploymentStatusColor(allocation.status)}
                        variant="outline"
                      >
                        {getDeploymentStatusText(allocation.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {allocation.status === 'planned' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={getActionButtonColor(allocation.status)}
                            onClick={() => handleDeploymentAction(allocation.id, 'deployment_requested')}
                          >
                            {getActionButtonText(allocation.status)}
                          </Button>
                        )}
                        {allocation.status === 'deployment_requested' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={getActionButtonColor(allocation.status)}
                            disabled
                          >
                            {getActionButtonText(allocation.status)}
                          </Button>
                        )}
                        {allocation.status === 'active' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={getActionButtonColor(allocation.status)}
                            onClick={() => handleDeploymentAction(allocation.id, 'withdrawal_requested')}
                          >
                            {getActionButtonText(allocation.status)}
                          </Button>
                        )}
                        {allocation.status === 'withdrawal_requested' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={getActionButtonColor(allocation.status)}
                            disabled
                          >
                            {getActionButtonText(allocation.status)}
                          </Button>
                        )}
                        {allocation.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={getActionButtonColor(allocation.status)}
                            onClick={() => handleDeploymentAction(allocation.id, 'withdrawal_requested')}
                          >
                            {getActionButtonText(allocation.status)}
                          </Button>
                        )}
                        {allocation.status === 'cancelled' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={getActionButtonColor(allocation.status)}
                            onClick={() => handleDeploymentAction(allocation.id, 'deployment_requested')}
                          >
                            {getActionButtonText(allocation.status)}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 작업 상세 모달 - 공통 컴포넌트 사용 */}
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
        allTasks={flattenTasks(wbsTasks)}
        onNavigateToTask={(taskId) => {
          openTaskDetailModal(taskId)
        }}
      />
    </div>
  )
}

export default ResourceManagement
