import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Share2, BarChart3, PieChart, ChevronRight, Target, Calendar, Package, Plus, X } from "lucide-react"
import { CostManagementShareModal } from "@/components/CostManagementShareModal"
import { canAccessCostManagement } from "@/services/costManagementService"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"

type Project = Database['public']['Tables']['projects']['Row']

interface YearTab {
  id: string
  name: string
  year: number
}

export default function ProjectCostManagement() {
  const { user } = useAuth()
  const location = useLocation()
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState<string>("plan")
  const [activeSubTab, setActiveSubTab] = useState<string>("profit-loss")
  const [activeYearTab, setActiveYearTab] = useState<string>("overall")
  const [yearTabs, setYearTabs] = useState<YearTab[]>([
    { id: "overall", name: "전체", year: 0 }
  ])
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [isLoadingProject, setIsLoadingProject] = useState(true)

  // 공통 월 관리 상태
  const [months, setMonths] = useState([
    { key: 'aug', label: '8월', value: 'Aug-25', month: 8, year: 2025, isEditable: false },
    { key: 'sep', label: '9월', value: 'Sep-25', month: 9, year: 2025, isEditable: false },
    { key: 'oct', label: '10월', value: 'Oct-25', month: 10, year: 2025, isEditable: false },
    { key: 'nov', label: '11월', value: 'Nov-25', month: 11, year: 2025, isEditable: false },
    { key: 'dec', label: '12월', value: 'Dec-25', month: 12, year: 2025, isEditable: false },
    { key: 'jan', label: '1월', value: 'Jan-26', month: 1, year: 2026, isEditable: false },
    { key: 'feb', label: '2월', value: 'Feb-26', month: 2, year: 2026, isEditable: false },
    { key: 'mar', label: '3월', value: 'Mar-26', month: 3, year: 2026, isEditable: false }
  ])

  // 월 추가 함수
  const addMonth = () => {
    const newKey = `month_${Date.now()}`
    const newMonthData = {
      key: newKey,
      label: '월 입력',
      value: 'Custom',
      month: 0,
      year: 0,
      isEditable: true
    }
    
    setMonths(prev => [...prev, newMonthData])
  }

  // 월 삭제 함수
  const removeMonth = (monthKey: string) => {
    if (months.length <= 1) return // 최소 1개월은 유지
    setMonths(prev => prev.filter(month => month.key !== monthKey))
  }

  // 월 라벨 업데이트 함수
  const updateMonthLabel = (monthKey: string, newLabel: string) => {
    setMonths(prev => prev.map(month => 
      month.key === monthKey 
        ? { ...month, label: newLabel, isEditable: false }
        : month
    ))
  }

  // 월 라벨 편집 모드 토글
  const toggleMonthEdit = (monthKey: string) => {
    setMonths(prev => prev.map(month => 
      month.key === monthKey 
        ? { ...month, isEditable: !month.isEditable }
        : month
    ))
  }

  // 활성화된 프로젝트 로드
  useEffect(() => {
    const loadActiveProject = async () => {
      if (!user) return
      
      try {
        setIsLoadingProject(true)
        
        const savedOpenProject = localStorage.getItem('openProject')
        if (savedOpenProject) {
          const project = JSON.parse(savedOpenProject)
          setActiveProject(project)
        } else {
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

  // 접근 권한 확인
  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !activeProject) {
        setHasAccess(false)
        setIsCheckingAccess(false)
        return
      }
      
      try {
        setIsCheckingAccess(true)
        const access = await canAccessCostManagement(activeProject.id)
        setHasAccess(access)
      } catch (error) {
        console.error('접근 권한 확인 중 오류:', error)
        setHasAccess(false)
      } finally {
        setIsCheckingAccess(false)
      }
    }

    checkAccess()
  }, [user, activeProject])

  // 브레드크럼 네비게이션 생성
  const getBreadcrumbItems = () => {
    const items = [
      { label: "프로젝트 비용 관리", icon: DollarSign, level: 0 }
    ]

    if (activeTab === "plan") {
      items.push({ label: "계획", icon: BarChart3, level: 1 })
    } else if (activeTab === "actual") {
      items.push({ label: "실적", icon: PieChart, level: 1 })
    }

    if (activeSubTab === "profit-loss") {
      items.push({ label: "손익계산서", icon: BarChart3, level: 2 })
    } else if (activeSubTab === "effort-allocation") {
      items.push({ label: "판관비", icon: PieChart, level: 2 })
    } else if (activeSubTab === "procurement") {
      items.push({ label: "조달", icon: Package, level: 2 })
    }

    if (activeSubTab === "profit-loss" || activeSubTab === "effort-allocation") {
      const currentYearTab = yearTabs.find(tab => tab.id === activeYearTab)
      if (currentYearTab) {
        items.push({ 
          label: currentYearTab.name, 
          icon: currentYearTab.id === "overall" ? Target : Calendar, 
          level: 3 
        })
      }
    }

    return items
  }

  // 년도 탭 추가
  const addYearTab = () => {
    const newYear = Math.max(...yearTabs.map(tab => tab.year), 0) + 1
    const newTab: YearTab = {
      id: `year${newYear}`,
      name: `${newYear}차년도`,
      year: newYear
    }
    setYearTabs(prev => [...prev, newTab])
    setActiveYearTab(newTab.id)
  }

  // 년도 탭 제거
  const removeYearTab = (tabId: string) => {
    if (tabId === "overall") return
    
    setYearTabs(prev => prev.filter(tab => tab.id !== tabId))
    
    if (activeYearTab === tabId) {
      setActiveYearTab("overall")
    }
  }

  // 탭 변경 핸들러
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setActiveSubTab("profit-loss")
    setActiveYearTab("overall")
  }

  const handleSubTabChange = (value: string) => {
    setActiveSubTab(value)
    setActiveYearTab("overall")
  }

  // 로딩 상태
  if (isLoadingProject || isCheckingAccess) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">로딩 중...</h2>
            <p className="text-muted-foreground">프로젝트 정보를 불러오는 중입니다.</p>
          </div>
        </div>
      </div>
    )
  }

  // 프로젝트가 없는 경우
  if (!activeProject) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">프로젝트를 찾을 수 없습니다</h2>
            <p className="text-muted-foreground mb-4">
              활성화된 프로젝트가 없습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              프로젝트를 선택하거나 새 프로젝트를 생성하세요.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 접근 권한이 없는 경우
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
    <div className="h-screen flex flex-col">
      {/* 고정 헤더 */}
      <div className="flex-shrink-0 p-6 space-y-4 bg-white border-b">
        <div className="flex items-center justify-between">
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

        {/* 브레드크럼 네비게이션 */}
        <div className="flex items-center space-x-2 text-sm">
          {getBreadcrumbItems().map((item, index) => {
            const IconComponent = item.icon
            return (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
                )}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                  item.level === 0 ? 'bg-primary/10 text-primary font-semibold' :
                  item.level === 1 ? 'bg-blue-50 text-blue-700 font-medium' :
                  item.level === 2 ? 'bg-green-50 text-green-700 font-medium' :
                  'bg-orange-50 text-orange-700 font-medium'
                }`}>
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">

      {/* 1단계 탭 - 계획/실적 */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="plan" className="text-base font-medium flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            계획
          </TabsTrigger>
          <TabsTrigger value="actual" className="text-base font-medium flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            실적
          </TabsTrigger>
        </TabsList>
        <Separator className="my-6" />

        {/* 계획 탭 컨텐츠 */}
        <TabsContent value="plan" className="space-y-6">
          <PlanContent 
            activeSubTab={activeSubTab}
            activeYearTab={activeYearTab}
            yearTabs={yearTabs}
            onSubTabChange={handleSubTabChange}
            onYearTabChange={setActiveYearTab}
            onAddYearTab={addYearTab}
            onRemoveYearTab={removeYearTab}
            months={months}
            onAddMonth={addMonth}
            onRemoveMonth={removeMonth}
            onUpdateMonthLabel={updateMonthLabel}
            onToggleMonthEdit={toggleMonthEdit}
          />
        </TabsContent>

        {/* 실적 탭 컨텐츠 */}
        <TabsContent value="actual" className="space-y-6">
          <ActualContent 
            activeSubTab={activeSubTab}
            activeYearTab={activeYearTab}
            yearTabs={yearTabs}
            onSubTabChange={handleSubTabChange}
            onYearTabChange={setActiveYearTab}
            onAddYearTab={addYearTab}
            onRemoveYearTab={removeYearTab}
            months={months}
            onAddMonth={addMonth}
            onRemoveMonth={removeMonth}
            onUpdateMonthLabel={updateMonthLabel}
            onToggleMonthEdit={toggleMonthEdit}
          />
        </TabsContent>
      </Tabs>

        </div>
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

// 계획 탭 컨텐츠 컴포넌트
interface PlanContentProps {
  activeSubTab: string
  activeYearTab: string
  yearTabs: YearTab[]
  onSubTabChange: (value: string) => void
  onYearTabChange: (value: string) => void
  onAddYearTab: () => void
  onRemoveYearTab: (tabId: string) => void
  months: Array<{
    key: string
    label: string
    value: string
    month: number
    year: number
    isEditable: boolean
  }>
  onAddMonth: () => void
  onRemoveMonth: (monthKey: string) => void
  onUpdateMonthLabel: (monthKey: string, newLabel: string) => void
  onToggleMonthEdit: (monthKey: string) => void
}

function PlanContent({ 
  activeSubTab, 
  activeYearTab, 
  yearTabs, 
  onSubTabChange, 
  onYearTabChange, 
  onAddYearTab, 
  onRemoveYearTab,
  months,
  onAddMonth,
  onRemoveMonth,
  onUpdateMonthLabel,
  onToggleMonthEdit
}: PlanContentProps) {
  return (
    <>
      {/* 2단계 탭 - 관리 영역 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">관리 영역</h2>
          <div className="text-sm text-muted-foreground">
            {activeSubTab === "profit-loss" ? "수익과 비용을 분석합니다" :
             activeSubTab === "effort-allocation" ? "인력과 비용을 관리합니다" :
             "장비와 서비스를 조달합니다"}
          </div>
        </div>
        <Tabs value={activeSubTab} onValueChange={onSubTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="profit-loss" className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              손익계산서
            </TabsTrigger>
            <TabsTrigger value="effort-allocation" className="text-sm font-medium flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              판관비
            </TabsTrigger>
            <TabsTrigger value="procurement" className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              조달
            </TabsTrigger>
        </TabsList>
        </Tabs>
        <Separator className="my-4" />
      </div>

      {/* 2단계 탭 컨텐츠 */}
      <Tabs value={activeSubTab} onValueChange={onSubTabChange} className="w-full">
        {/* 손익계산서 */}
        <TabsContent value="profit-loss" className="space-y-6">
          <ProfitLossContent 
            activeYearTab={activeYearTab}
            yearTabs={yearTabs}
            onYearTabChange={onYearTabChange}
            onAddYearTab={onAddYearTab}
            onRemoveYearTab={onRemoveYearTab}
            isActual={false}
            months={months}
            onAddMonth={onAddMonth}
            onRemoveMonth={onRemoveMonth}
            onUpdateMonthLabel={onUpdateMonthLabel}
            onToggleMonthEdit={onToggleMonthEdit}
          />
        </TabsContent>

        {/* 판관비 */}
        <TabsContent value="effort-allocation" className="space-y-6">
          <EffortAllocationContent 
            activeYearTab={activeYearTab}
            yearTabs={yearTabs}
            onYearTabChange={onYearTabChange}
            onAddYearTab={onAddYearTab}
            onRemoveYearTab={onRemoveYearTab}
            isActual={false}
            months={months}
            onAddMonth={onAddMonth}
            onRemoveMonth={onRemoveMonth}
            onUpdateMonthLabel={onUpdateMonthLabel}
            onToggleMonthEdit={onToggleMonthEdit}
          />
        </TabsContent>

        {/* 조달 */}
        <TabsContent value="procurement" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle>조달</CardTitle>
              <CardDescription>장비와 서비스를 조달합니다.</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>조달 컨텐츠가 여기에 표시됩니다.</p>
                </div>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

// 실적 탭 컨텐츠 컴포넌트
interface ActualContentProps {
  activeSubTab: string
  activeYearTab: string
  yearTabs: YearTab[]
  onSubTabChange: (value: string) => void
  onYearTabChange: (value: string) => void
  onAddYearTab: () => void
  onRemoveYearTab: (tabId: string) => void
  months: Array<{
    key: string
    label: string
    value: string
    month: number
    year: number
    isEditable: boolean
  }>
  onAddMonth: () => void
  onRemoveMonth: (monthKey: string) => void
  onUpdateMonthLabel: (monthKey: string, newLabel: string) => void
  onToggleMonthEdit: (monthKey: string) => void
}

function ActualContent({ 
  activeSubTab, 
  activeYearTab, 
  yearTabs, 
  onSubTabChange, 
  onYearTabChange, 
  onAddYearTab, 
  onRemoveYearTab,
  months,
  onAddMonth,
  onRemoveMonth,
  onUpdateMonthLabel,
  onToggleMonthEdit
}: ActualContentProps) {
  return (
    <>
      {/* 2단계 탭 - 관리 영역 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">관리 영역</h2>
          <div className="text-sm text-muted-foreground">
            {activeSubTab === "profit-loss" ? "실제 수익과 비용을 분석합니다" :
             activeSubTab === "effort-allocation" ? "실제 인력과 비용을 관리합니다" :
             "실제 조달 현황을 관리합니다"}
          </div>
        </div>
        <Tabs value={activeSubTab} onValueChange={onSubTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="profit-loss" className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              손익계산서
            </TabsTrigger>
            <TabsTrigger value="effort-allocation" className="text-sm font-medium flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              판관비
            </TabsTrigger>
            <TabsTrigger value="procurement" className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              조달
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Separator className="my-4" />
      </div>

      {/* 2단계 탭 컨텐츠 */}
      <Tabs value={activeSubTab} onValueChange={onSubTabChange} className="w-full">
        {/* 실적 손익계산서 */}
        <TabsContent value="profit-loss" className="space-y-6">
          <ProfitLossContent 
            activeYearTab={activeYearTab}
            yearTabs={yearTabs}
            onYearTabChange={onYearTabChange}
            onAddYearTab={onAddYearTab}
            onRemoveYearTab={onRemoveYearTab}
            isActual={true}
            months={months}
            onAddMonth={onAddMonth}
            onRemoveMonth={onRemoveMonth}
            onUpdateMonthLabel={onUpdateMonthLabel}
            onToggleMonthEdit={onToggleMonthEdit}
          />
        </TabsContent>

        {/* 실적 판관비 */}
        <TabsContent value="effort-allocation" className="space-y-6">
          <EffortAllocationContent 
            activeYearTab={activeYearTab}
            yearTabs={yearTabs}
            onYearTabChange={onYearTabChange}
            onAddYearTab={onAddYearTab}
            onRemoveYearTab={onRemoveYearTab}
            isActual={true}
            months={months}
            onAddMonth={onAddMonth}
            onRemoveMonth={onRemoveMonth}
            onUpdateMonthLabel={onUpdateMonthLabel}
            onToggleMonthEdit={onToggleMonthEdit}
          />
        </TabsContent>

        {/* 실적 조달 */}
        <TabsContent value="procurement" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle>실적 조달</CardTitle>
              <CardDescription>실제 조달 현황을 관리합니다.</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>실적 조달 컨텐츠가 여기에 표시됩니다.</p>
                </div>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

// 손익계산서 컨텐츠 컴포넌트
interface ProfitLossContentProps {
  activeYearTab: string
  yearTabs: YearTab[]
  onYearTabChange: (value: string) => void
  onAddYearTab: () => void
  onRemoveYearTab: (tabId: string) => void
  isActual: boolean
  months: Array<{
    key: string
    label: string
    value: string
    month: number
    year: number
    isEditable: boolean
  }>
  onAddMonth: () => void
  onRemoveMonth: (monthKey: string) => void
  onUpdateMonthLabel: (monthKey: string, newLabel: string) => void
  onToggleMonthEdit: (monthKey: string) => void
}

function ProfitLossContent({ 
  activeYearTab, 
  yearTabs, 
  onYearTabChange, 
  onAddYearTab, 
  onRemoveYearTab, 
  isActual,
  months,
  onAddMonth,
  onRemoveMonth,
  onUpdateMonthLabel,
  onToggleMonthEdit
}: ProfitLossContentProps) {
  return (
    <>
      {/* 3단계 탭 - 분석 기간 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">분석 기간</h3>
          <div className="flex items-center gap-2">
            <Button 
              onClick={onAddYearTab}
              size="sm"
              variant="outline"
              className="h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              년도 추가
            </Button>
          </div>
        </div>
        <Tabs value={activeYearTab} onValueChange={onYearTabChange} className="w-full">
          <TabsList className="flex flex-wrap gap-2 p-1 bg-muted h-auto">
            {yearTabs.map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="text-xs font-medium flex items-center gap-1 h-8 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {tab.id === "overall" ? (
                  <Target className="w-3 h-3" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                {tab.name}
                {tab.id !== "overall" && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveYearTab(tab.id)
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-1 hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Separator className="my-3" />
      </div>

      {/* 각 년도별 컨텐츠 */}
      <Tabs value={activeYearTab} onValueChange={onYearTabChange} className="w-full">
        {yearTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            {tab.id === "overall" ? (
              <OverallProfitLossContent isActual={isActual} yearTabs={yearTabs} />
            ) : (
              <YearProfitLossContent 
                yearTab={tab} 
                isActual={isActual}
                months={months}
                onAddMonth={onAddMonth}
                onRemoveMonth={onRemoveMonth}
                onUpdateMonthLabel={onUpdateMonthLabel}
                onToggleMonthEdit={onToggleMonthEdit}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  )
}

// 전체 손익계산서 컨텐츠 (연산으로 계산)
interface OverallProfitLossContentProps {
  isActual: boolean
  yearTabs: YearTab[]
}

function OverallProfitLossContent({ isActual, yearTabs }: OverallProfitLossContentProps) {
  // 전체 데이터는 연산으로 계산 (실제로는 각 년도별 데이터를 합산)
  const totalRevenue = 150000000 // 예시: 총 수익
  const totalCost = 120282727 // 예시: 총 비용
  const netProfit = totalRevenue - totalCost // 순수익
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1) // 수익률

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 수익</CardTitle>
              </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()}원</div>
              </CardContent>
            </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 비용</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalCost.toLocaleString()}원</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">순수익</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netProfit.toLocaleString()}원
          </div>
          </CardContent>
        </Card>
          <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">수익률</CardTitle>
            </CardHeader>
            <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(profitMargin) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitMargin}%
                </div>
              </CardContent>
            </Card>
          </div>

      {/* 전체 손익계산서 테이블 */}
          <Card>
            <CardHeader>
          <CardTitle>전체 손익계산서</CardTitle>
          <CardDescription>
            {isActual ? "실제 " : ""}전체 기간의 손익 현황을 보여줍니다.
          </CardDescription>
            </CardHeader>
            <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>전체 손익계산서 데이터는 각 년도별 데이터를 연산하여 계산됩니다.</p>
                </div>
            </CardContent>
          </Card>
                </div>
  )
}

// 년도별 손익계산서 컨텐츠 (사용자 입력 가능)
interface YearProfitLossContentProps {
  yearTab: YearTab
  isActual: boolean
  months: Array<{
    key: string
    label: string
    value: string
    month: number
    year: number
    isEditable: boolean
  }>
  onAddMonth: () => void
  onRemoveMonth: (monthKey: string) => void
  onUpdateMonthLabel: (monthKey: string, newLabel: string) => void
  onToggleMonthEdit: (monthKey: string) => void
}

function YearProfitLossContent({ 
  yearTab, 
  isActual, 
  months, 
  onAddMonth, 
  onRemoveMonth, 
  onUpdateMonthLabel, 
  onToggleMonthEdit 
}: YearProfitLossContentProps) {

  return (
    <div className="space-y-6">
      {/* 수익 섹션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>수익</CardTitle>
              <CardDescription>월별 수익을 입력합니다.</CardDescription>
                </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onAddMonth}
                size="sm"
                variant="outline"
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                월 추가
              </Button>
                </div>
                  </div>
        </CardHeader>
            <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">구분</th>
                  <th className="text-left p-2 font-medium">항목</th>
                  <th className="text-center p-2 font-medium">계</th>
                  {months.map((month) => (
                    <th key={month.key} className="text-center p-2 font-medium text-xs">
                      <div className="flex items-center justify-center gap-1">
                        {month.isEditable ? (
                          <input
                            type="text"
                            defaultValue={month.label}
                            className="w-16 px-1 py-0.5 text-xs text-center border rounded text-blue-600 font-medium"
                            onBlur={(e) => onUpdateMonthLabel(month.key, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                onUpdateMonthLabel(month.key, e.currentTarget.value)
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                            onClick={() => onToggleMonthEdit(month.key)}
                          >
                            {month.label}
                  </span>
                        )}
                        {months.length > 1 && (
                          <Button
                            onClick={() => onRemoveMonth(month.key)}
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 text-sm font-medium" rowSpan={3}>수익</td>
                  <td className="p-2 text-sm">프로젝트 수익</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        className="w-20 px-1 py-0.5 text-right text-xs border rounded text-blue-600 font-medium"
                        placeholder="입력"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-sm">기타 수익</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        className="w-20 px-1 py-0.5 text-right text-xs border rounded text-blue-600 font-medium"
                        placeholder="입력"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b bg-green-50">
                  <td className="p-2 text-sm font-medium">총 수익</td>
                  <td className="p-2 text-sm text-center font-medium">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-sm text-center font-medium">-</td>
                  ))}
                </tr>
              </tbody>
            </table>
              </div>
            </CardContent>
          </Card>

      {/* 비용 섹션 */}
          <Card>
            <CardHeader>
          <CardTitle>비용</CardTitle>
          <CardDescription>월별 비용을 입력합니다.</CardDescription>
            </CardHeader>
            <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">구분</th>
                  <th className="text-left p-2 font-medium">항목</th>
                  <th className="text-center p-2 font-medium">계</th>
                  {months.map((month) => (
                    <th key={month.key} className="text-center p-2 font-medium text-xs">
                      <div className="flex items-center justify-center gap-1">
                        <span>{month.label}</span>
                        {months.length > 1 && (
                          <Button
                            onClick={() => onRemoveMonth(month.key)}
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                      </Button>
                        )}
                    </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 text-sm font-medium" rowSpan={4}>직접비</td>
                  <td className="p-2 text-sm">인건비</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        className="w-20 px-1 py-0.5 text-right text-xs border rounded text-blue-600 font-medium"
                        placeholder="입력"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-sm">4대보험</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        className="w-20 px-1 py-0.5 text-right text-xs border rounded text-blue-600 font-medium"
                        placeholder="입력"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-sm">기타 직접비</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        className="w-20 px-1 py-0.5 text-right text-xs border rounded text-blue-600 font-medium"
                        placeholder="입력"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b bg-green-50">
                  <td className="p-2 text-sm font-medium">총 직접비</td>
                  <td className="p-2 text-sm text-center font-medium">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-sm text-center font-medium">-</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-sm font-medium" rowSpan={5}>간접비</td>
                  <td className="p-2 text-sm">지급수수료</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        className="w-20 px-1 py-0.5 text-right text-xs border rounded text-blue-600 font-medium"
                        placeholder="입력"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-sm">지급임차료</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        className="w-20 px-1 py-0.5 text-right text-xs border rounded text-blue-600 font-medium"
                        placeholder="입력"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-sm">수도광열비</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        className="w-20 px-1 py-0.5 text-right text-xs border rounded text-blue-600 font-medium"
                        placeholder="입력"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-sm">감가상각</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        className="w-20 px-1 py-0.5 text-right text-xs border rounded text-blue-600 font-medium"
                        placeholder="입력"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b bg-green-50">
                  <td className="p-2 text-sm font-medium">총 간접비</td>
                  <td className="p-2 text-sm text-center font-medium">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-sm text-center font-medium">-</td>
                  ))}
                </tr>
                <tr className="border-b bg-red-50">
                  <td className="p-2 text-sm font-medium" colSpan={2}>총 비용</td>
                  <td className="p-2 text-sm text-center font-medium">-</td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-sm text-center font-medium">-</td>
                  ))}
                </tr>
              </tbody>
            </table>
              </div>
            </CardContent>
          </Card>

      {/* 손익 요약 */}
      <div className="grid grid-cols-4 gap-4">
          <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 수익</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold text-green-600">-</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 비용</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">순수익</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">수익률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-</div>
          </CardContent>
        </Card>
                </div>
                    </div>
  )
}

// 판관비 컨텐츠 컴포넌트
interface EffortAllocationContentProps {
  activeYearTab: string
  yearTabs: YearTab[]
  onYearTabChange: (value: string) => void
  onAddYearTab: () => void
  onRemoveYearTab: (tabId: string) => void
  isActual: boolean
  months: Array<{
    key: string
    label: string
    value: string
    month: number
    year: number
    isEditable: boolean
  }>
  onAddMonth: () => void
  onRemoveMonth: (monthKey: string) => void
  onUpdateMonthLabel: (monthKey: string, newLabel: string) => void
  onToggleMonthEdit: (monthKey: string) => void
}

function EffortAllocationContent({ 
  activeYearTab, 
  yearTabs, 
  onYearTabChange, 
  onAddYearTab, 
  onRemoveYearTab, 
  isActual,
  months,
  onAddMonth,
  onRemoveMonth,
  onUpdateMonthLabel,
  onToggleMonthEdit
}: EffortAllocationContentProps) {
  return (
    <>
      {/* 3단계 탭 - 관리 기간 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">관리 기간</h3>
          <div className="flex items-center gap-2">
            <Button 
              onClick={onAddYearTab}
              size="sm"
              variant="outline"
              className="h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              년도 추가
                      </Button>
                    </div>
                  </div>
        <Tabs value={activeYearTab} onValueChange={onYearTabChange} className="w-full">
          <TabsList className="flex flex-wrap gap-2 p-1 bg-muted h-auto">
            {yearTabs.map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="text-xs font-medium flex items-center gap-1 h-8 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {tab.id === "overall" ? (
                  <Target className="w-3 h-3" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                {tab.name}
                {tab.id !== "overall" && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveYearTab(tab.id)
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-1 hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Separator className="my-3" />
              </div>

      {/* 각 년도별 컨텐츠 */}
      <Tabs value={activeYearTab} onValueChange={onYearTabChange} className="w-full">
        {yearTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            {tab.id === "overall" ? (
              <OverallEffortAllocationContent isActual={isActual} yearTabs={yearTabs} />
            ) : (
              <YearEffortAllocationContent 
                yearTab={tab} 
                isActual={isActual}
                months={months}
                onAddMonth={onAddMonth}
                onRemoveMonth={onRemoveMonth}
                onUpdateMonthLabel={onUpdateMonthLabel}
                onToggleMonthEdit={onToggleMonthEdit}
              />
            )}
        </TabsContent>
        ))}
      </Tabs>
    </>
  )
}

// 전체 판관비 컨텐츠 (연산으로 계산)
interface OverallEffortAllocationContentProps {
  isActual: boolean
  yearTabs: YearTab[]
}

function OverallEffortAllocationContent({ isActual, yearTabs }: OverallEffortAllocationContentProps) {
  // 전체 데이터는 연산으로 계산 (실제로는 각 년도별 데이터를 합산)
  const totalSalary = 120282727 // 예시: 모든 년도 합계
  const totalMM = 15.5 // 예시: 모든 년도 MM 합계
  const averageCostPerMonth = 7783000 // 예시: 평균 월 비용

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 급여 합</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSalary.toLocaleString()}원</div>
            </CardContent>
          </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 MM 합</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMM.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">평균 원가/월</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCostPerMonth.toLocaleString()}원</div>
          </CardContent>
        </Card>
              </div>

      {/* 전체 판관비 테이블 */}
          <Card>
            <CardHeader>
          <CardTitle>전체 판관비 요약</CardTitle>
          <CardDescription>
            {isActual ? "실제 " : ""}전체 기간의 판관비 현황을 보여줍니다.
          </CardDescription>
            </CardHeader>
            <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>전체 판관비 데이터는 각 년도별 데이터를 연산하여 계산됩니다.</p>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

// 년도별 판관비 컨텐츠 (사용자 입력 가능)
interface YearEffortAllocationContentProps {
  yearTab: YearTab
  isActual: boolean
  months: Array<{
    key: string
    label: string
    value: string
    month: number
    year: number
    isEditable: boolean
  }>
  onAddMonth: () => void
  onRemoveMonth: (monthKey: string) => void
  onUpdateMonthLabel: (monthKey: string, newLabel: string) => void
  onToggleMonthEdit: (monthKey: string) => void
}

function YearEffortAllocationContent({ 
  yearTab, 
  isActual, 
  months, 
  onAddMonth, 
  onRemoveMonth, 
  onUpdateMonthLabel, 
  onToggleMonthEdit 
}: YearEffortAllocationContentProps) {

  // 인건비 데이터 (사용자 입력)
  const personnelData = [
    { name: '김의현', role: 'PM', task: '프로젝트 관리', residency: '상주', grade: '초급' },
    { name: '황설', role: 'TL', task: '지표 계산 모듈', residency: '비상주', grade: '초급' },
    { name: '정건모', role: 'D', task: '지표 계산 모듈', residency: '상주', grade: '초급' },
    { name: '이수찬', role: 'TL', task: '시뮬레이션 어댑터', residency: '상주', grade: '초급' },
    { name: '장동권', role: 'D', task: '시뮬레이션 어댑터', residency: '상주', grade: '초급' },
    { name: '최승옥', role: 'D', task: '시뮬레이션 어댑터', residency: '상주', grade: '초급' },
    { name: '전현배', role: 'D', task: '시뮬레이션 어댑터', residency: '상주', grade: '초급' }
  ]

  // 등급별 MM 비용 (사용자 입력)
  const gradeCosts = [
    { grade: '특급', cost: 17879000 },
    { grade: '고급', cost: 13938000 },
    { grade: '중급', cost: 10467000 },
    { grade: '초급', cost: 7783000 }
  ]

  // 등급에 따른 단가 계산 함수
  const getGradeCost = (grade: string) => {
    const gradeCost = gradeCosts.find(gc => gc.grade === grade)
    return gradeCost ? gradeCost.cost.toLocaleString() : '0'
  }

  // 공통 열 너비 상수
  const COLUMN_WIDTHS = {
    grade: 'w-20',
    unitCost: 'w-32',
    total: 'w-16'
  } as const

  // 개인별 등급 상태 관리 (작업공수와 인건비 공유)
  const [personGrades, setPersonGrades] = useState<{[key: string]: string}>(() => {
    const initialGrades: {[key: string]: string} = {}
    personnelData.forEach((person, index) => {
      initialGrades[index] = person.grade
    })
    return initialGrades
  })

  // 등급 변경 핸들러 (작업공수와 인건비 공유)
  const handleGradeChange = (index: number, newGrade: string) => {
    setPersonGrades(prev => ({
      ...prev,
      [index]: newGrade
    }))
  }

  // 작업공수(MM) 월별 값 상태 관리
  const [workloadValues, setWorkloadValues] = useState<{[key: string]: {[monthKey: string]: number}}>(() => {
    const initialValues: {[key: string]: {[monthKey: string]: number}} = {}
    personnelData.forEach((person, index) => {
      initialValues[index] = {}
      months.forEach(month => {
        initialValues[index][month.key] = 0
      })
    })
    return initialValues
  })

  // 작업공수(MM) 값 변경 핸들러
  const handleWorkloadChange = (personIndex: number, monthKey: string, value: number) => {
    setWorkloadValues(prev => ({
      ...prev,
      [personIndex]: {
        ...prev[personIndex],
        [monthKey]: value
      }
    }))
  }

  // 인건비 계산 함수 (MM × 단가)
  const calculatePersonnelCost = (personIndex: number, monthKey: string) => {
    const mmValue = workloadValues[personIndex]?.[monthKey] || 0
    const grade = personGrades[personIndex] || personnelData[personIndex].grade
    const gradeCost = gradeCosts.find(gc => gc.grade === grade)
    const unitCost = gradeCost ? gradeCost.cost : 0
    return (mmValue * unitCost).toLocaleString()
  }

  // 간접비 관리 상태
  const [indirectCosts, setIndirectCosts] = useState<{[key: string]: {[monthKey: string]: number}}>(() => {
    const initialCosts: {[key: string]: {[monthKey: string]: number}} = {
      '지급수수료': {},
      '지급임차료': {},
      '수도광열비': {},
      '감가상각': {}
    }
    months.forEach(month => {
      Object.keys(initialCosts).forEach(costType => {
        initialCosts[costType][month.key] = 0
      })
    })
    return initialCosts
  })

  // 간접비 값 변경 핸들러
  const handleIndirectCostChange = (costType: string, monthKey: string, value: number) => {
    setIndirectCosts(prev => ({
      ...prev,
      [costType]: {
        ...prev[costType],
        [monthKey]: value
      }
    }))
  }

  // 공통비계 계산 함수
  const calculateTotalIndirectCost = (monthKey: string) => {
    return Object.values(indirectCosts).reduce((sum, costs) => {
      return sum + (costs[monthKey] || 0)
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* 등급별 MM 비용 */}
        <Card>
        <CardHeader>
          <CardTitle>등급별 MM 비용</CardTitle>
          <CardDescription>각 등급별 월간 비용을 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {gradeCosts.map((grade) => (
              <div key={grade.grade} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{grade.grade}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={grade.cost}
                    className="w-32 px-2 py-1 text-right border rounded text-blue-600 font-medium"
                    placeholder="입력"
                  />
                  <span className="text-sm text-muted-foreground">원</span>
              </div>
                    </div>
            ))}
            </div>
          </CardContent>
        </Card>
        
      {/* 인건비 관리 */}
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>인건비 관리</CardTitle>
              <CardDescription>개인별 월간 인건비를 관리합니다.</CardDescription>
              </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onAddMonth}
                size="sm"
                variant="outline"
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                월 추가
              </Button>
            </div>
                  </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="workload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="workload">작업공수 (MM)</TabsTrigger>
              <TabsTrigger value="cost">인건비</TabsTrigger>
            </TabsList>
            
            {/* 작업공수 (MM) 탭 */}
            <TabsContent value="workload" className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">성명</th>
                      <th className="text-left p-2 font-medium">역할</th>
                      <th className="text-left p-2 font-medium">업무</th>
                      <th className="text-left p-2 font-medium">상주여부</th>
                      <th className={`text-left p-2 font-medium ${COLUMN_WIDTHS.grade}`}>등급</th>
                      <th className={`text-left p-2 font-medium ${COLUMN_WIDTHS.unitCost}`}></th>
                      <th className={`text-center p-2 font-medium ${COLUMN_WIDTHS.total}`}>계</th>
                      {months.map((month) => (
                        <th key={month.key} className="text-center p-2 font-medium text-xs">
                          <div className="flex items-center justify-center gap-1">
                            {month.isEditable ? (
                              <input
                                type="text"
                                defaultValue={month.label}
                                className="w-16 px-1 py-0.5 text-xs text-center border rounded text-blue-600 font-medium"
                                onBlur={(e) => onUpdateMonthLabel(month.key, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    onUpdateMonthLabel(month.key, e.currentTarget.value)
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span 
                                className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                                onClick={() => onToggleMonthEdit(month.key)}
                              >
                                {month.label}
                              </span>
                            )}
                            {months.length > 1 && (
                              <Button
                                onClick={() => onRemoveMonth(month.key)}
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="text-left p-2 font-medium">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personnelData.map((person, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 text-sm font-medium">{person.name}</td>
                        <td className="p-2 text-sm">{person.role}</td>
                        <td className="p-2 text-sm">{person.task}</td>
                        <td className="p-2 text-sm">{person.residency}</td>
                        <td className={`p-2 text-sm ${COLUMN_WIDTHS.grade}`}>
                          <select 
                            value={personGrades[index] || person.grade}
                            onChange={(e) => handleGradeChange(index, e.target.value)}
                            className="w-full px-1 py-0.5 text-xs border rounded text-blue-600 font-medium"
                          >
                            <option value="특급">특급</option>
                            <option value="고급">고급</option>
                            <option value="중급">중급</option>
                            <option value="초급">초급</option>
                          </select>
                        </td>
                        <td className={`p-2 text-sm ${COLUMN_WIDTHS.unitCost}`}>
                        </td>
                        <td className={`p-2 text-sm text-center font-medium bg-green-50 ${COLUMN_WIDTHS.total}`}>
                          -
                        </td>
                        {months.map((month) => (
                          <td key={month.key} className="p-2 border-l border-gray-200 text-center">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="999.99"
                              value={workloadValues[index]?.[month.key] || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value)
                                if (!isNaN(value)) {
                                  // 소수점 2자리로 제한
                                  const roundedValue = Math.round(value * 100) / 100
                                  handleWorkloadChange(index, month.key, roundedValue)
                                } else {
                                  handleWorkloadChange(index, month.key, 0)
                                }
                              }}
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value)
                                if (!isNaN(value)) {
                                  const roundedValue = Math.round(value * 100) / 100
                                  handleWorkloadChange(index, month.key, roundedValue)
                                }
                              }}
                              className="w-20 px-1 py-0.5 text-center text-xs border rounded text-blue-600 font-medium"
                              placeholder="0.00"
                            />
                          </td>
                        ))}
                        <td className="p-2 text-sm">
                          <input
                            type="text"
                            className="w-16 px-1 py-0.5 text-xs border rounded"
                            placeholder=""
                          />
                        </td>
                      </tr>
                    ))}
                    {/* 작업공수 합계 행 */}
                      <tr className="border-b bg-green-50">
                        <td className="p-2 text-sm font-medium" colSpan={6}>작업공수</td>
                        <td className={`p-2 text-sm text-center font-medium ${COLUMN_WIDTHS.total}`}>-</td>
                      {months.map((month) => (
                        <td key={month.key} className="p-2 text-sm text-center font-medium border-l border-gray-200">-</td>
                      ))}
                      <td className="p-2 text-sm">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
        </TabsContent>
            
            {/* 인건비 탭 */}
            <TabsContent value="cost" className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">성명</th>
                      <th className="text-left p-2 font-medium">역할</th>
                      <th className="text-left p-2 font-medium">업무</th>
                      <th className="text-left p-2 font-medium">상주여부</th>
                      <th className={`text-left p-2 font-medium ${COLUMN_WIDTHS.grade}`}>등급</th>
                      <th className={`text-left p-2 font-medium ${COLUMN_WIDTHS.unitCost}`}>단가(원)</th>
                      <th className={`text-center p-2 font-medium ${COLUMN_WIDTHS.total}`}>계</th>
                      {months.map((month) => (
                        <th key={month.key} className="text-center p-2 font-medium text-xs">
                          <div className="flex items-center justify-center gap-1">
                            {month.isEditable ? (
                              <input
                                type="text"
                                defaultValue={month.label}
                                className="w-16 px-1 py-0.5 text-xs text-center border rounded text-blue-600 font-medium"
                                onBlur={(e) => onUpdateMonthLabel(month.key, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    onUpdateMonthLabel(month.key, e.currentTarget.value)
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span 
                                className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                                onClick={() => onToggleMonthEdit(month.key)}
                              >
                                {month.label}
                              </span>
                            )}
                            {months.length > 1 && (
                              <Button
                                onClick={() => onRemoveMonth(month.key)}
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="text-left p-2 font-medium">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personnelData.map((person, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 text-sm font-medium">{person.name}</td>
                        <td className="p-2 text-sm">{person.role}</td>
                        <td className="p-2 text-sm">{person.task}</td>
                        <td className="p-2 text-sm">{person.residency}</td>
                        <td className={`p-2 text-sm ${COLUMN_WIDTHS.grade}`}>
                          <select 
                            value={personGrades[index] || person.grade}
                            onChange={(e) => handleGradeChange(index, e.target.value)}
                            className="w-full px-1 py-0.5 text-xs border rounded text-blue-600 font-medium"
                          >
                            <option value="특급">특급</option>
                            <option value="고급">고급</option>
                            <option value="중급">중급</option>
                            <option value="초급">초급</option>
                          </select>
                        </td>
                        <td className={`p-2 text-sm ${COLUMN_WIDTHS.unitCost} text-right font-medium text-green-600`}>
                          {getGradeCost(personGrades[index] || person.grade)}원
                        </td>
                        <td className={`p-2 text-sm text-center font-medium bg-green-50 ${COLUMN_WIDTHS.total}`}>
                          -
                        </td>
                        {months.map((month) => (
                          <td key={month.key} className="p-2 text-right text-xs font-medium text-green-600 border-l border-gray-200">
                            {calculatePersonnelCost(index, month.key)}원
                          </td>
                        ))}
                        <td className="p-2 text-sm">
                          <input
                            type="text"
                            className="w-16 px-1 py-0.5 text-xs border rounded"
                            placeholder=""
                          />
                        </td>
                      </tr>
                    ))}
                    {/* 인건비 합계 행 */}
                      <tr className="border-b bg-green-50">
                        <td className="p-2 text-sm font-medium" colSpan={6}>인건비</td>
                        <td className={`p-2 text-sm text-center font-medium ${COLUMN_WIDTHS.total}`}>-</td>
                      {months.map((month) => {
                        const totalCost = personnelData.reduce((sum, person, personIndex) => {
                          const mmValue = workloadValues[personIndex]?.[month.key] || 0
                          const grade = personGrades[personIndex] || person.grade
                          const gradeCost = gradeCosts.find(gc => gc.grade === grade)
                          const unitCost = gradeCost ? gradeCost.cost : 0
                          return sum + (mmValue * unitCost)
                        }, 0)
                        return (
                          <td key={month.key} className="p-2 text-sm text-center font-medium text-green-600 border-l border-gray-200">
                            {totalCost.toLocaleString()}원
                          </td>
                        )
                      })}
                      <td className="p-2 text-sm">-</td>
                    </tr>
                    {/* 4대보험 회사부담금 행 */}
                      <tr className="border-b bg-green-50">
                        <td className="p-2 text-sm font-medium" colSpan={6}>4대보험 (회사부담금)</td>
                        <td className={`p-2 text-sm text-center font-medium ${COLUMN_WIDTHS.total}`}>-</td>
                      {months.map((month) => {
                        const totalCost = personnelData.reduce((sum, person, personIndex) => {
                          const mmValue = workloadValues[personIndex]?.[month.key] || 0
                          const grade = personGrades[personIndex] || person.grade
                          const gradeCost = gradeCosts.find(gc => gc.grade === grade)
                          const unitCost = gradeCost ? gradeCost.cost : 0
                          return sum + (mmValue * unitCost)
                        }, 0)
                        const insuranceCost = Math.round(totalCost * 0.1) // 인건비의 10%
                        return (
                          <td key={month.key} className="p-2 text-sm text-center font-medium text-green-600 border-l border-gray-200">
                            {insuranceCost.toLocaleString()}원
                          </td>
                        )
                      })}
                      <td className="p-2 text-sm">-</td>
                    </tr>
                  </tbody>
                </table>
            </div>
            </TabsContent>
          </Tabs>
          </CardContent>
        </Card>
        
      {/* 간접비 관리 */}
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>간접비 관리</CardTitle>
              <CardDescription>월별 간접비를 관리합니다.</CardDescription>
              </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onAddMonth}
                size="sm"
                variant="outline"
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                월 추가
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">구분</th>
                  <th className="text-left p-2 font-medium"></th>
                  <th className="text-center p-2 font-medium">계</th>
                  {months.map((month) => (
                    <th key={month.key} className="text-center p-2 font-medium text-xs">
                      <div className="flex items-center justify-center gap-1">
                        {month.isEditable ? (
                          <input
                            type="text"
                            defaultValue={month.label}
                            className="w-16 px-1 py-0.5 text-xs text-center border rounded text-blue-600 font-medium"
                            onBlur={(e) => onUpdateMonthLabel(month.key, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                onUpdateMonthLabel(month.key, e.currentTarget.value)
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                            onClick={() => onToggleMonthEdit(month.key)}
                          >
                            {month.label}
                          </span>
                        )}
                        {months.length > 1 && (
                          <Button
                            onClick={() => onRemoveMonth(month.key)}
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 text-sm font-medium" rowSpan={5}>간접비</td>
                  <td className="p-2 text-sm">지급수수료</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">
                    {Object.values(indirectCosts['지급수수료'] || {}).reduce((sum, value) => sum + value, 0).toLocaleString()}원
                  </td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        value={indirectCosts['지급수수료']?.[month.key] || ''}
                        onChange={(e) => handleIndirectCostChange('지급수수료', month.key, parseFloat(e.target.value) || 0)}
                        onClick={(e) => e.currentTarget.select()}
                        className="w-16 px-1 py-0.5 text-xs border rounded text-blue-600 font-medium bg-yellow-50 text-center"
                        placeholder="0"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-sm">지급임차료</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">
                    {Object.values(indirectCosts['지급임차료'] || {}).reduce((sum, value) => sum + value, 0).toLocaleString()}원
                  </td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        value={indirectCosts['지급임차료']?.[month.key] || ''}
                        onChange={(e) => handleIndirectCostChange('지급임차료', month.key, parseFloat(e.target.value) || 0)}
                        onClick={(e) => e.currentTarget.select()}
                        className="w-16 px-1 py-0.5 text-xs border rounded text-blue-600 font-medium bg-yellow-50 text-center"
                        placeholder="0"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-sm">수도광열비</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">
                    {Object.values(indirectCosts['수도광열비'] || {}).reduce((sum, value) => sum + value, 0).toLocaleString()}원
                  </td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        value={indirectCosts['수도광열비']?.[month.key] || ''}
                        onChange={(e) => handleIndirectCostChange('수도광열비', month.key, parseFloat(e.target.value) || 0)}
                        onClick={(e) => e.currentTarget.select()}
                        className="w-16 px-1 py-0.5 text-xs border rounded text-blue-600 font-medium bg-yellow-50 text-center"
                        placeholder="0"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-sm">감가상각</td>
                  <td className="p-2 text-sm text-center font-medium bg-green-50">
                    {Object.values(indirectCosts['감가상각'] || {}).reduce((sum, value) => sum + value, 0).toLocaleString()}원
                  </td>
                  {months.map((month) => (
                    <td key={month.key} className="p-2 text-center">
                      <input
                        type="number"
                        value={indirectCosts['감가상각']?.[month.key] || ''}
                        onChange={(e) => handleIndirectCostChange('감가상각', month.key, parseFloat(e.target.value) || 0)}
                        onClick={(e) => e.currentTarget.select()}
                        className="w-16 px-1 py-0.5 text-xs border rounded text-blue-600 font-medium bg-yellow-50 text-center"
                        placeholder="0"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b bg-green-50">
                  <td className="p-2 text-sm font-medium">공통비계</td>
                  <td className="p-2 text-sm text-center font-medium text-green-600">
                    {months.reduce((total, month) => total + calculateTotalIndirectCost(month.key), 0).toLocaleString()}원
                  </td>
                  {months.map((month) => {
                    const totalCost = calculateTotalIndirectCost(month.key)
                    return (
                      <td key={month.key} className="p-2 text-sm text-center font-medium text-green-600">
                        {totalCost.toLocaleString()}원
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
            </div>
          </CardContent>
        </Card>
        
      {/* 요약 정보 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 급여 합</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 MM 합</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">평균 원가/월</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}