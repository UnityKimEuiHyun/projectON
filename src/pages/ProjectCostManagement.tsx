import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Users, ShoppingCart, Plus, Share2, Building, Calendar, Target } from "lucide-react"
import { CostManagementShareModal } from "@/components/CostManagementShareModal"
import { canAccessCostManagement } from "@/services/costManagementService"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"

type Project = Database['public']['Tables']['projects']['Row']

export default function ProjectCostManagement() {
  const { user } = useAuth()
  const location = useLocation()
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState<string>("profit-loss")
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [isLoadingProject, setIsLoadingProject] = useState(true)

  // 활성화된 프로젝트 로드
  useEffect(() => {
    const loadActiveProject = async () => {
      if (!user) return
      
      try {
        setIsLoadingProject(true)
        
        // localStorage에서 활성화된 프로젝트 가져오기
        const savedOpenProject = localStorage.getItem('openProject')
        if (savedOpenProject) {
          const project = JSON.parse(savedOpenProject)
          setActiveProject(project)
        } else {
          // 활성화된 프로젝트가 없으면 첫 번째 프로젝트 로드
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)

          if (error) {
            console.error('프로젝트 로드 실패:', error)
            return
          }

          if (data && data.length > 0) {
            setActiveProject(data[0])
          }
        }
      } catch (error) {
        console.error('프로젝트 로드 중 오류:', error)
      } finally {
        setIsLoadingProject(false)
      }
    }

    loadActiveProject()
  }, [user])

  // 페이지 이동 감지 - F5와 동일한 처리
  useEffect(() => {
    console.log('🔄 비용 관리 페이지 이동 감지:', location.pathname)
    const loadActiveProject = async () => {
      if (!user) return
      
      try {
        setIsLoadingProject(true)
        
        // localStorage에서 활성화된 프로젝트 가져오기
        const savedOpenProject = localStorage.getItem('openProject')
        if (savedOpenProject) {
          const project = JSON.parse(savedOpenProject)
          setActiveProject(project)
        } else {
          // 활성화된 프로젝트가 없으면 첫 번째 프로젝트 로드
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)

          if (error) {
            console.error('프로젝트 로드 실패:', error)
            return
          }

          if (data && data.length > 0) {
            setActiveProject(data[0])
          }
        }
      } catch (error) {
        console.error('페이지 이동 시 프로젝트 로드 중 오류:', error)
      } finally {
        setIsLoadingProject(false)
      }
    }

    loadActiveProject()
  }, [location.pathname, user])

  // 접근 권한 확인 (단순화된 버전)
  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !activeProject) {
        console.log('사용자 또는 활성 프로젝트가 없음:', { user: !!user, activeProject: !!activeProject })
        setIsCheckingAccess(false)
        return
      }
      
      try {
        console.log('비용 관리 접근 권한 확인 시작:', { projectId: activeProject.id, userId: user.id })
        setIsCheckingAccess(true)
        
        // 임시 해결책: 프로젝트 생성자만 접근 허용 (데이터베이스 쿼리 없이)
        // localStorage에서 프로젝트 정보를 확인하여 생성자 여부 판단
        const savedOpenProject = localStorage.getItem('openProject')
        if (savedOpenProject) {
          const project = JSON.parse(savedOpenProject)
          if (project.created_by === user.id) {
            console.log('✅ 프로젝트 생성자로 접근 허용 (localStorage 확인)')
            setHasAccess(true)
          } else {
            console.log('❌ 프로젝트 생성자가 아님 - 접근 거부')
            setHasAccess(false)
          }
        } else {
          console.log('❌ 프로젝트 정보 없음 - 접근 거부')
          setHasAccess(false)
        }
      } catch (error) {
        console.error('접근 권한 확인 실패:', error)
        setHasAccess(false)
      } finally {
        console.log('접근 권한 확인 완료')
        setIsCheckingAccess(false)
      }
    }

    checkAccess()
  }, [user, activeProject])



  // 등급별 MM 비용
  const gradeCosts = {
    special: 17879000,
    high: 13938000,
    intermediate: 10467000,
    entry: 7783000
  }

  // 인건비 데이터 (이미지 기반)
  const personnelExpenses = [
    {
      name: "김의현",
      grade: "초급",
      monthlyCosts: [1768864, 7783000, 7783000, 7783000, 7783000, 7783000, 7783000, 7783000],
      remarks: ""
    },
    {
      name: "황설",
      grade: "초급",
      monthlyCosts: [0, 5306591, 2476409, 0, 0, 0, 0, 0],
      remarks: ""
    },
    {
      name: "정건모",
      grade: "초급",
      monthlyCosts: [0, 7075455, 6014136, 7783000, 1768864, 0, 0, 0],
      remarks: ""
    },
    {
      name: "이수찬",
      grade: "초급",
      monthlyCosts: [0, 7783000, 3891500, 0, 0, 0, 0, 0],
      remarks: ""
    },
    {
      name: "장동권",
      grade: "초급",
      monthlyCosts: [0, 0, 4245273, 1415091, 0, 0, 0, 0],
      remarks: ""
    },
    {
      name: "최승옥",
      grade: "초급",
      monthlyCosts: [0, 0, 1415091, 2830182, 3891500, 0, 0, 0],
      remarks: ""
    },
    {
      name: "전현배",
      grade: "초급",
      monthlyCosts: [0, 0, 1415091, 2830182, 3891500, 0, 0, 0],
      remarks: ""
    }
  ]

  // 월별 총 인건비 계산
  const totalPersonnelCosts = personnelExpenses[0].monthlyCosts.map((_, monthIndex) => 
    personnelExpenses.reduce((sum, person) => sum + person.monthlyCosts[monthIndex], 0)
  )

  // 4대보험 비용 (총 인건비의 10.5%)
  const insuranceCosts = totalPersonnelCosts.map(total => Math.round(total * 0.105))

  // 간접비 데이터
  const indirectCosts = [
    {
      category: "지급수수료",
      monthlyValues: ["입력", "입력", "입력", "입력", "입력", "입력", "입력", "입력"]
    },
    {
      category: "지급임차료",
      monthlyValues: ["입력", "입력", "입력", "입력", "입력", "입력", "입력", "입력"]
    },
    {
      category: "수도광열비",
      monthlyValues: ["입력", "입력", "입력", "입력", "입력", "입력", "입력", "입력"]
    },
    {
      category: "감가상각",
      monthlyValues: ["입력", "입력", "입력", "입력", "입력", "입력", "입력", "입력"]
    },
    {
      category: "공통비계",
      monthlyValues: ["-", "-", "-", "-", "-", "-", "-", "-"]
    }
  ]

  // MM 데이터 (이미지 기반)
  const personnelMMData = [
    {
      name: "김의현",
      grade: "초급",
      role: "PM",
      task: "프로젝트 관리",
      residency: "상주",
      monthlyMM: [0.23, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
      totalMM: 7.23
    },
    {
      name: "황설",
      grade: "초급",
      role: "TL",
      task: "지표 계산 모듈",
      residency: "비상주",
      monthlyMM: [0, 0.68, 0.32, 0, 0, 0, 0, 0],
      totalMM: 1.00
    },
    {
      name: "정건모",
      grade: "초급",
      role: "D",
      task: "지표 계산 모듈",
      residency: "상주",
      monthlyMM: [0, 0.91, 0.77, 1.00, 0.23, 0, 0, 0],
      totalMM: 2.91
    },
    {
      name: "이수찬",
      grade: "초급",
      role: "TL",
      task: "시뮬레이션 어댑터",
      residency: "상주",
      monthlyMM: [0, 1.00, 0.50, 0, 0, 0, 0, 0],
      totalMM: 1.50
    },
    {
      name: "장동권",
      grade: "초급",
      role: "D",
      task: "시뮬레이션 어댑터",
      residency: "상주",
      monthlyMM: [0, 0, 0.55, 0.18, 0, 0, 0, 0],
      totalMM: 0.73
    },
    {
      name: "최승옥",
      grade: "초급",
      role: "D",
      task: "시뮬레이션 어댑터",
      residency: "상주",
      monthlyMM: [0, 0, 0.18, 0.36, 0.50, 0, 0, 0],
      totalMM: 1.05
    },
    {
      name: "전현배",
      grade: "초급",
      role: "D",
      task: "시뮬레이션 어댑터",
      residency: "상주",
      monthlyMM: [0, 0, 0.18, 0.36, 0.50, 0, 0, 0],
      totalMM: 1.05
    }
  ]

  // 월별 총 MM 계산
  const totalMonthlyMM = personnelMMData[0].monthlyMM.map((_, monthIndex) => 
    personnelMMData.reduce((sum, person) => sum + person.monthlyMM[monthIndex], 0)
  )

  // 각 개인의 총 인건비 계산
  const personnelTotalCosts = personnelExpenses.map(person => 
    person.monthlyCosts.reduce((sum, cost) => sum + cost, 0)
  )

  // 요약 정보
  const totalSalarySum = totalPersonnelCosts.reduce((sum, cost) => sum + cost, 0)
  const totalMMSum = personnelMMData.reduce((sum, person) => sum + person.totalMM, 0)
  const averageCostPerMonth = 7783000

  const procurementItems = [
    { item: "서버 인프라", quantity: 1, unitPrice: 5000000, total: 5000000, status: "계약완료" },
    { item: "개발 도구 라이선스", quantity: 5, unitPrice: 200000, total: 1000000, status: "계약완료" },
    { item: "테스트 환경 구축", quantity: 1, unitPrice: 3000000, total: 3000000, status: "진행중" },
    { item: "보안 솔루션", quantity: 1, unitPrice: 2000000, total: 2000000, status: "계획중" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "계약완료": return "bg-green-100 text-green-800"
      case "진행중": return "bg-blue-100 text-blue-800"
      case "계획중": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  // 프로젝트 로딩 중
  if (isLoadingProject) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">프로젝트를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 활성화된 프로젝트가 없는 경우
  if (!activeProject) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">활성화된 프로젝트가 없습니다</h2>
            <p className="text-muted-foreground">
              비용 관리를 위해 프로젝트를 먼저 열어주세요.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 접근 권한 확인 중
  if (isCheckingAccess) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground mb-2">접근 권한을 확인하는 중...</p>
            <p className="text-xs text-gray-500">
              프로젝트: {activeProject?.name || '로딩 중...'}
            </p>
            <p className="text-xs text-gray-500">
              사용자: {user?.id ? '인증됨' : '인증 대기 중...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">접근 권한이 없습니다</h2>
            <p className="text-muted-foreground mb-4">
              이 프로젝트의 비용 관리에 접근할 권한이 없습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              프로젝트 소유자에게 접근 권한을 요청하세요.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">프로젝트 비용 관리</h1>
            <p className="text-muted-foreground">프로젝트 비용을 계획하고 수익성을 계산할 수 있습니다.</p>
          </div>
        </div>
        <Button onClick={() => setIsShareModalOpen(true)}>
          <Share2 className="w-4 h-4 mr-2" />
          공유 설정
        </Button>
      </div>



      {/* 탭 메뉴 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profit-loss">손익계산서</TabsTrigger>
          <TabsTrigger value="effort-allocation">판관비</TabsTrigger>
          <TabsTrigger value="procurement">조달</TabsTrigger>
        </TabsList>

        {/* 손익계산서 탭 */}
        <TabsContent value="profit-loss" className="space-y-6">
          {/* 요약 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(50000000)}
                  </div>
                  <div className="text-sm text-muted-foreground">총 수익</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(40000000)}
                  </div>
                  <div className="text-sm text-muted-foreground">총 비용</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(10000000)}
                  </div>
                  <div className="text-sm text-muted-foreground">순수익</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    20%
                  </div>
                  <div className="text-sm text-muted-foreground">수익률</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 상세 비용 분석 */}
          <Card>
            <CardHeader>
              <CardTitle>비용 상세 분석</CardTitle>
              <CardDescription>각 비용 항목별 상세 내역입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">인건비</span>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(25000000)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">자재비</span>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(8000000)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">간접비</span>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(5000000)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">기타 비용</span>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(2000000)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 판관비 탭 */}
        <TabsContent value="effort-allocation" className="space-y-6">
          {/* 요약 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalSalarySum)}
                  </div>
                  <div className="text-sm text-muted-foreground">총 급여 합</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {totalMMSum} MM
                  </div>
                  <div className="text-sm text-muted-foreground">총 MM 합</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(averageCostPerMonth)}
                  </div>
                  <div className="text-sm text-muted-foreground">평균 원가/월</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 등급별 MM 비용 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                등급별 MM 비용
              </CardTitle>
              <CardDescription>직급별 월간 비용 기준을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">특급</div>
                  <div className="text-lg font-semibold text-blue-600">{formatCurrency(17879000)}</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">고급</div>
                  <div className="text-lg font-semibold text-green-600">{formatCurrency(13938000)}</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">중급</div>
                  <div className="text-lg font-semibold text-yellow-600">{formatCurrency(10467000)}</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">초급</div>
                  <div className="text-lg font-semibold text-orange-600">{formatCurrency(7783000)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 인건비 관리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                인건비 관리
              </CardTitle>
              <CardDescription>개인별 작업 공수(MM)와 인건비를 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="mm" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mm">작업 공수 (MM)</TabsTrigger>
                  <TabsTrigger value="cost">인건비</TabsTrigger>
                </TabsList>
                
                {/* 공통 테이블 */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm table-fixed">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-semibold w-20">이름</th>
                        <th className="text-center p-3 font-semibold w-16">등급</th>
                        <th className="text-center p-3 font-semibold w-24">계</th>
                        <th className="text-center p-3 font-semibold w-20">8월</th>
                        <th className="text-center p-3 font-semibold w-20">9월</th>
                        <th className="text-center p-3 font-semibold w-20">10월</th>
                        <th className="text-center p-3 font-semibold w-20">11월</th>
                        <th className="text-center p-3 font-semibold w-20">12월</th>
                        <th className="text-center p-3 font-semibold w-20">1월</th>
                        <th className="text-center p-3 font-semibold w-20">2월</th>
                        <th className="text-center p-3 font-semibold w-20">3월</th>
                        <th className="text-center p-3 font-semibold w-32">비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 작업 공수 (MM) 탭 내용 */}
                      <TabsContent value="mm" className="contents">
                        {personnelMMData.map((person, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium w-20">{person.name}</td>
                            <td className="p-3 text-center w-16">
                              <Badge variant="outline" className="text-xs">
                                {person.grade}
                              </Badge>
                            </td>
                            <td className="p-3 text-center font-semibold w-24">
                              {person.totalMM.toFixed(2)}
                            </td>
                            {person.monthlyMM.map((mm, monthIndex) => (
                              <td key={monthIndex} className="p-3 text-center w-20">
                                {mm > 0 ? mm.toFixed(2) : '-'}
                              </td>
                            ))}
                            <td className="p-3 text-center text-xs text-gray-500 w-32">
                            </td>
                          </tr>
                        ))}
                        <tr className="border-b bg-green-50 font-semibold">
                          <td className="p-3 w-20">총 MM</td>
                          <td className="p-3 text-center w-16">-</td>
                          <td className="p-3 text-center text-green-700 w-24">
                            {totalMMSum.toFixed(2)}
                          </td>
                          {totalMonthlyMM.map((total, index) => (
                            <td key={index} className="p-3 text-center text-green-700 w-20">
                              {total > 0 ? total.toFixed(2) : '-'}
                            </td>
                          ))}
                          <td className="p-3 text-center text-xs text-gray-500 w-32">
                          </td>
                        </tr>
                      </TabsContent>
                      
                      {/* 인건비 탭 내용 */}
                      <TabsContent value="cost" className="contents">
                        {personnelExpenses.map((person, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium w-20">{person.name}</td>
                            <td className="p-3 text-center w-16">
                              <Badge variant="outline" className="text-xs">
                                {person.grade}
                              </Badge>
                            </td>
                            <td className="p-3 text-center font-semibold w-24">
                              {formatCurrency(personnelTotalCosts[index])}
                            </td>
                            {person.monthlyCosts.map((cost, monthIndex) => (
                              <td key={monthIndex} className="p-3 text-center w-20">
                                {cost > 0 ? formatCurrency(cost) : '-'}
                              </td>
                            ))}
                            <td className="p-3 text-center text-xs text-gray-500 w-32">
                              {person.remarks}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-b bg-green-50 font-semibold">
                          <td className="p-3 w-20">총 인건비</td>
                          <td className="p-3 text-center w-16">-</td>
                          <td className="p-3 text-center text-green-700 w-24">
                            {formatCurrency(totalSalarySum)}
                          </td>
                          {totalPersonnelCosts.map((total, index) => (
                            <td key={index} className="p-3 text-center text-green-700 w-20">
                              {formatCurrency(total)}
                            </td>
                          ))}
                          <td className="p-3 text-center text-xs text-gray-500 w-32">
                            4대 보험료 + 퇴직급여충당금 + 제수당 포함
                          </td>
                        </tr>
                      </TabsContent>
                    </tbody>
                  </table>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* 4대보험 (회사부담금) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                4대보험 (회사부담금)
              </CardTitle>
              <CardDescription>국민연금(4.5%) + 건강보험(3.5%) + 고용보험(1.5%) + 산재보험(1%) = 총 10.5% 부담</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-yellow-50">
                      <th className="text-left p-3 font-semibold">구분</th>
                      <th className="text-center p-3 font-semibold">8월</th>
                      <th className="text-center p-3 font-semibold">9월</th>
                      <th className="text-center p-3 font-semibold">10월</th>
                      <th className="text-center p-3 font-semibold">11월</th>
                      <th className="text-center p-3 font-semibold">12월</th>
                      <th className="text-center p-3 font-semibold">1월</th>
                      <th className="text-center p-3 font-semibold">2월</th>
                      <th className="text-center p-3 font-semibold">3월</th>
                      <th className="text-center p-3 font-semibold">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-yellow-50">
                      <td className="p-3 font-medium">4대보험 (회사부담금)</td>
                      {insuranceCosts.map((cost, index) => (
                        <td key={index} className="p-3 text-center">
                          {formatCurrency(cost)}
                        </td>
                      ))}
                      <td className="p-3 text-center text-xs text-gray-500">
                        국민연금(4.5%) + 건강보험(3.5%) + 고용보험(1.5%) + 산재보험(1%) = 총 10.5% 부담
                      </td>
                    </tr>
                  </tbody>
                </table>
                    </div>
            </CardContent>
          </Card>

          {/* 간접비 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                간접비
              </CardTitle>
              <CardDescription>지급수수료, 임차료, 수도광열비, 감가상각 등 간접비를 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">구분</th>
                      <th className="text-center p-3 font-semibold">8월</th>
                      <th className="text-center p-3 font-semibold">9월</th>
                      <th className="text-center p-3 font-semibold">10월</th>
                      <th className="text-center p-3 font-semibold">11월</th>
                      <th className="text-center p-3 font-semibold">12월</th>
                      <th className="text-center p-3 font-semibold">1월</th>
                      <th className="text-center p-3 font-semibold">2월</th>
                      <th className="text-center p-3 font-semibold">3월</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indirectCosts.map((cost, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{cost.category}</td>
                        {cost.monthlyValues.map((value, monthIndex) => (
                          <td key={monthIndex} className="p-3 text-center">
                            {value === '입력' ? (
                              <span className="text-gray-400 italic">입력</span>
                            ) : value === '-' ? (
                              <span className="text-gray-400">-</span>
                            ) : (
                              formatCurrency(value)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* 조달 탭 */}
        <TabsContent value="procurement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                조달 항목 관리
              </CardTitle>
              <CardDescription>프로젝트에 필요한 물품과 서비스의 조달을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm">
                  <div>항목</div>
                  <div className="text-center">수량</div>
                  <div className="text-center">단가</div>
                  <div className="text-center">총액</div>
                  <div className="text-center">상태</div>
                  <div className="text-center">액션</div>
                </div>
                
                {procurementItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-6 gap-4 p-3 border-b border-gray-200 items-center">
                    <div className="font-medium">{item.item}</div>
                    <div className="text-center">{item.quantity}</div>
                    <div className="text-center">{formatCurrency(item.unitPrice)}</div>
                    <div className="text-center font-semibold text-red-600">
                      {formatCurrency(item.total)}
                    </div>
                    <div className="text-center">
                      <Badge className={getStatusColor(item.status)} variant="secondary">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      {/* 공유 모달 */}
      <CostManagementShareModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        projectId={activeProject.id}
        projectName={activeProject.name}
      />
    </div>
  )
}
