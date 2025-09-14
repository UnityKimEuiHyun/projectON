import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trash2, UserPlus, Eye, Edit, Search, Check } from 'lucide-react'
import { getCompanyMembers, type CompanyMember } from '@/services/companyService'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { 
  getCostManagementShares, 
  createCostManagementShare, 
  updateCostManagementShare, 
  deleteCostManagementShare,
  canManageCostManagementPermissions,
  type CostManagementShare 
} from '@/services/costManagementService'

interface CostManagementShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
}

export function CostManagementShareModal({ 
  open, 
  onOpenChange, 
  projectId, 
  projectName 
}: CostManagementShareModalProps) {
  const { user } = useAuth()
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([])
  const [shares, setShares] = useState<CostManagementShare[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [permissionType, setPermissionType] = useState<'view' | 'edit'>('view')
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [activeTab, setActiveTab] = useState('members')
  const [canManagePermissions, setCanManagePermissions] = useState(false)

  // 기업 멤버 목록 로드
  useEffect(() => {
    const loadCompanyMembers = async () => {
      if (!open || !projectId) return
      
      try {
        setIsLoading(true)
        
        // 1. 프로젝트의 소속 기업 조회
        console.log('프로젝트 ID:', projectId)
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('group_id')
          .eq('id', projectId)
          .single()

        if (projectError) {
          console.error('프로젝트 조회 실패:', projectError)
          return
        }

        console.log('프로젝트 정보:', project)

        if (!project.group_id) {
          console.log('프로젝트에 소속 기업이 없습니다.')
          setCompanyMembers([])
          return
        }

        // 2. 해당 기업의 구성원들 조회
        console.log('기업 ID로 구성원 조회:', project.group_id)
        const members = await getCompanyMembers(project.group_id)
        console.log('조회된 구성원들:', members)
        setCompanyMembers(members)
      } catch (error) {
        console.error('기업 멤버 로드 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCompanyMembers()
  }, [open, projectId])

  // 권한 관리 권한 확인
  useEffect(() => {
    const checkManagePermissions = async () => {
      if (!open || !projectId) return
      
      try {
        const canManage = await canManageCostManagementPermissions(projectId)
        setCanManagePermissions(canManage)
      } catch (error) {
        console.error('권한 관리 권한 확인 실패:', error)
        setCanManagePermissions(false)
      }
    }

    checkManagePermissions()
  }, [open, projectId])

  // 공유 목록 로드
  useEffect(() => {
    const loadShares = async () => {
      if (!open) return
      
      try {
        const sharesData = await getCostManagementShares(projectId)
        setShares(sharesData)
      } catch (error) {
        console.error('공유 목록 로드 실패:', error)
      }
    }

    loadShares()
  }, [open, projectId])

  // 공유 추가
  const handleAddShare = async () => {
    if (selectedMembers.length === 0) return

    try {
      setIsAdding(true)
      
      // 선택된 모든 멤버에 대해 공유 생성
      const sharePromises = selectedMembers.map(userId => 
        createCostManagementShare({
          project_id: projectId,
          shared_with_user_id: userId,
          permission_type: permissionType
        })
      )
      
      const newShares = await Promise.all(sharePromises)
      setShares(prev => [...newShares, ...prev])
      setSelectedMembers([])
      setPermissionType('view')
      setActiveTab('shares')
    } catch (error) {
      console.error('공유 추가 실패:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // 공유 수정
  const handleUpdateShare = async (shareId: string, newPermissionType: 'view' | 'edit') => {
    try {
      const updatedShare = await updateCostManagementShare(shareId, newPermissionType)
      setShares(prev => prev.map(share => 
        share.id === shareId ? updatedShare : share
      ))
    } catch (error) {
      console.error('공유 수정 실패:', error)
    }
  }

  // 공유 삭제
  const handleDeleteShare = async (shareId: string) => {
    try {
      await deleteCostManagementShare(shareId)
      setShares(prev => prev.filter(share => share.id !== shareId))
    } catch (error) {
      console.error('공유 삭제 실패:', error)
    }
  }

  // 멤버 선택 토글
  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // 검색 필터링
  const filteredMembers = companyMembers.filter(member => {
    const searchLower = searchTerm.toLowerCase()
    const name = member.display_name || ''
    const email = member.email || ''
    return name.toLowerCase().includes(searchLower) || 
           email.toLowerCase().includes(searchLower)
  })

  // 이미 공유된 사용자와 본인 필터링
  const sharedUserIds = shares.map(share => share.shared_with_user_id)
  const availableMembers = filteredMembers.filter(member => 
    !sharedUserIds.includes(member.user_id) && 
    member.user_id !== user?.id
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>비용 관리 공유 설정</DialogTitle>
          <DialogDescription>
            {projectName} 프로젝트의 비용 관리 권한을 소속 기업 구성원들과 공유할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {!canManagePermissions ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">
              비용 관리 권한 설정 권한이 없습니다.
            </div>
            <div className="text-sm text-muted-foreground">
              프로젝트 Owner 또는 Admin만 권한을 관리할 수 있습니다.
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">구성원 선택</TabsTrigger>
              <TabsTrigger value="shares">공유 목록</TabsTrigger>
            </TabsList>

          {/* 구성원 선택 탭 */}
          <TabsContent value="members" className="space-y-4 overflow-hidden">
            <div className="space-y-4">
              {/* 검색 및 권한 설정 */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="search">구성원 검색</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="이름 또는 이메일로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="w-48">
                  <Label htmlFor="permission-select">권한 유형</Label>
                  <Select value={permissionType} onValueChange={(value: 'view' | 'edit') => setPermissionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          조회만 가능
                        </div>
                      </SelectItem>
                      <SelectItem value="edit">
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          수정 가능
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleAddShare} 
                  disabled={selectedMembers.length === 0 || isAdding}
                  className="whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isAdding ? '추가 중...' : `선택된 ${selectedMembers.length}명 추가`}
                </Button>
              </div>

              {/* 선택된 멤버 표시 */}
              {selectedMembers.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    선택된 구성원 ({selectedMembers.length}명)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map(userId => {
                      const member = companyMembers.find(m => m.user_id === userId)
                      return (
                        <Badge key={userId} variant="secondary" className="text-xs">
                          {member?.display_name || member?.email || '알 수 없음'}
                          <button
                            onClick={() => toggleMemberSelection(userId)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 구성원 목록 */}
              <Card className="flex-1 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">구성원 목록</CardTitle>
                </CardHeader>
                <CardContent className="overflow-auto max-h-96">
                  {isLoading ? (
                    <div className="text-center py-8">로딩 중...</div>
                  ) : companyMembers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="mb-2">프로젝트에 소속 기업이 없습니다.</div>
                      <div className="text-sm">개인 프로젝트는 공유할 수 없습니다.</div>
                    </div>
                  ) : availableMembers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? '검색 결과가 없습니다.' : '공유 가능한 구성원이 없습니다.'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableMembers.map((member) => (
                        <div
                          key={member.user_id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedMembers.includes(member.user_id)
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleMemberSelection(member.user_id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                              selectedMembers.includes(member.user_id)
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground'
                            }`}>
                              {selectedMembers.includes(member.user_id) && (
                                <Check className="w-3 h-3 text-primary-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {member.display_name || '이름 없음'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 공유 목록 탭 */}
          <TabsContent value="shares" className="space-y-4 overflow-hidden">
            <Card className="flex-1 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">현재 공유 목록</CardTitle>
              </CardHeader>
              <CardContent className="overflow-auto max-h-96">
                {isLoading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : shares.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    아직 공유된 구성원이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {shares.map((share) => {
                      const isCurrentUser = share.shared_with_user_id === user?.id
                      return (
                        <div key={share.id} className={`flex items-center justify-between p-3 border rounded-lg ${isCurrentUser ? 'bg-blue-50 border-blue-200' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {share.shared_with_profile?.display_name || '알 수 없음'}
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                    본인
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {share.shared_with_profile?.email}
                              </div>
                            </div>
                          </div>
                        
                        <div className="flex items-center gap-2">
                          {isCurrentUser ? (
                            <div className="flex items-center gap-2">
                     <Badge 
                       variant="outline" 
                       className={`text-xs ${
                         share.permission_type === 'edit' 
                           ? 'bg-green-100 text-green-700 border-green-300' 
                           : 'bg-gray-100 text-gray-700 border-gray-300'
                       }`}
                     >
                       {share.permission_type === 'edit' ? (
                         <div className="flex items-center gap-1">
                           <Edit className="w-3 h-3" />
                           수정 가능
                         </div>
                       ) : (
                         <div className="flex items-center gap-1">
                           <Eye className="w-3 h-3" />
                           조회만
                         </div>
                       )}
                     </Badge>
                            </div>
                          ) : (
                            <>
                              <Select
                                value={share.permission_type}
                                onValueChange={(value: 'view' | 'edit') => 
                                  handleUpdateShare(share.id, value)
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="view">
                                    <div className="flex items-center gap-2">
                                      <Eye className="w-4 h-4" />
                                      조회만
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="edit">
                                    <div className="flex items-center gap-2">
                                      <Edit className="w-4 h-4" />
                                      수정 가능
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteShare(share.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
