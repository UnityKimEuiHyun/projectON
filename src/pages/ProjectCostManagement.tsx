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


  const profitLossData = {
    revenue: 50000000,
    costs: {
      labor: 25000000,
      materials: 8000000,
      overhead: 5000000,
      other: 2000000
    },
    profit: 10000000
  }

  const effortAllocation = [
    { role: "프로젝트 매니저", hours: 160, rate: 50000, total: 8000000 },
    { role: "시스템 분석가", hours: 200, rate: 45000, total: 9000000 },
    { role: "UI/UX 디자이너", hours: 120, rate: 40000, total: 4800000 },
    { role: "프론트엔드 개발자", hours: 300, rate: 50000, total: 15000000 },
    { role: "백엔드 개발자", hours: 280, rate: 50000, total: 14000000 },
    { role: "테스터", hours: 80, rate: 35000, total: 2800000 }
  ]

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

      {/* 현재 프로젝트 */}
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <Target className="w-5 h-5 text-primary" />
        <div>
          <span className="text-sm text-muted-foreground">현재 프로젝트:</span>
          <span className="ml-2 text-lg font-semibold">{activeProject.name}</span>
        </div>
      </div>


      {/* 탭 메뉴 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profit-loss">손익계산서</TabsTrigger>
          <TabsTrigger value="effort-allocation">노력 할당</TabsTrigger>
          <TabsTrigger value="procurement">조달</TabsTrigger>
        </TabsList>

        {/* 손익계산서 탭 */}
        <TabsContent value="profit-loss" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 수익 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600">총 수익</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(profitLossData.revenue)}
                </div>
              </CardContent>
            </Card>

            {/* 비용 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600">총 비용</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(Object.values(profitLossData.costs).reduce((a, b) => a + b, 0))}
                </div>
              </CardContent>
            </Card>

            {/* 이익 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">순이익</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(profitLossData.profit)}
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
                    {formatCurrency(profitLossData.costs.labor)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">자재비</span>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(profitLossData.costs.materials)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">간접비</span>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(profitLossData.costs.overhead)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">기타 비용</span>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(profitLossData.costs.other)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 노력 할당 탭 */}
        <TabsContent value="effort-allocation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                인력 할당 및 비용
              </CardTitle>
              <CardDescription>역할별 인력 할당 시간과 비용을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm">
                  <div>역할</div>
                  <div className="text-center">시간</div>
                  <div className="text-center">시급</div>
                  <div className="text-center">총 비용</div>
                  <div className="text-center">액션</div>
                </div>
                
                {effortAllocation.map((item, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 p-3 border-b border-gray-200 items-center">
                    <div className="font-medium">{item.role}</div>
                    <div className="text-center">{item.hours}시간</div>
                    <div className="text-center">{formatCurrency(item.rate)}</div>
                    <div className="text-center font-semibold text-red-600">
                      {formatCurrency(item.total)}
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

      {/* 요약 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(profitLossData.revenue)}
              </div>
              <div className="text-sm text-muted-foreground">총 수익</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(Object.values(profitLossData.costs).reduce((a, b) => a + b, 0))}
              </div>
              <div className="text-sm text-muted-foreground">총 비용</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(profitLossData.profit)}
              </div>
              <div className="text-sm text-muted-foreground">순이익</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((profitLossData.profit / profitLossData.revenue) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">수익률</div>
            </div>
          </CardContent>
        </Card>
      </div>

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
