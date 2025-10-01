import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { 
  Search, 
  Mail,
  Phone,
  MoreVertical,
  Building2,
  List,
  Grid3X3,
  Trash2,
  Star,
  StarOff,
  UserPlus
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { useSidebarState } from "@/hooks/useSidebarState"
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"
import InviteManagementModal from "@/components/InviteManagementModal"
import CompanyCreateModal from "@/components/CompanyCreateModal"
import { createCompany, getUserCompanies, getCompanyMembers, type CompanyMember } from "@/services/companyService"

type Group = Database['public']['Tables']['groups']['Row']
type GroupMember = Database['public']['Tables']['group_members']['Row'] & {
  profiles: {
    display_name: string | null
    email: string | null
    phone: string | null
  }
}

const Team = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const { selectedCompany } = useSidebarState()
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInviteManagementModalOpen, setIsInviteManagementModalOpen] = useState(false)
  const [isCompanyCreateModalOpen, setIsCompanyCreateModalOpen] = useState(false)

  // 소속된 기업이 있을 때만 해당 기업의 멤버들을 가져옴
  const filteredMembers = companyMembers.filter(member =>
    member.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.status?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 선택된 기업이 변경될 때마다 해당 기업의 구성원 로드
  useEffect(() => {
    const loadMembers = async () => {
      if (selectedCompany && user?.id) {
        setIsLoadingMembers(true)
        try {
          const members = await getCompanyMembers(selectedCompany.id)
          setCompanyMembers(members)
          await checkAdminStatus(selectedCompany.id)
        } catch (error) {
          console.error('구성원 로드 실패:', error)
          setCompanyMembers([])
        } finally {
          setIsLoadingMembers(false)
        }
      } else {
        setCompanyMembers([])
      }
    }

    loadMembers()
  }, [selectedCompany, user?.id])


  // 사용자의 admin 권한 또는 그룹 생성자 권한 확인
  const checkAdminStatus = async (groupId: string) => {
    if (!user) return
    
    try {
      const { data: member, error } = await supabase
        .from('group_members')
        .select('role, status')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()
      
      if (error) {
        console.error('권한 확인 실패:', error)
        setIsAdmin(false)
        return
      }
      
      // admin 권한이 있는지 확인
      setIsAdmin(member.role === 'admin')
    } catch (error) {
      console.error('권한 확인 중 예외 발생:', error)
      setIsAdmin(false)
    }
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">활성</Badge>
      case "inactive":
        return <Badge variant="outline">비활성</Badge>
      case "pending":
        return <Badge variant="secondary">대기중</Badge>
      case "suspended":
        return <Badge variant="destructive">정지</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }


  // 기업 등록 핸들러
  const handleCompanyCreated = async () => {
    // 기업 등록 후 페이지를 새로고침하여 사이드바의 기업 목록을 업데이트
    window.location.reload()
  }

  // 멤버 제거 함수
  const handleRemoveMember = async (member: CompanyMember) => {
    if (!user || !selectedCompany) return
    
    const groupId = selectedCompany.id
    
    // 그룹 생성자 또는 admin 권한이 있는지 확인
    if (!isAdmin) {
      toast({
        title: "권한 없음",
        description: "멤버를 제거할 권한이 없습니다.",
        variant: "destructive",
      })
      return
    }

    if (confirm(`${member.display_name || '이름 없는 사용자'}를 기업에서 제거하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        console.log('🔄 멤버 제거 시작:', { 
          memberId: member.id, 
          memberName: member.display_name,
          groupId 
        })

        // 1. 먼저 group_join_requests에서 관련된 모든 이력 정리
        const { error: cleanupError } = await supabase
          .from('group_join_requests')
          .delete()
          .eq('group_id', groupId)
          .eq('user_id', member.user_id)
        
        if (cleanupError) {
          console.error('❌ 가입 요청 이력 정리 실패:', cleanupError)
          // 이력 정리 실패해도 멤버 제거는 계속 진행
        } else {
          console.error('✅ 가입 요청 이력 정리 완료')
        }

        // 2. group_members에서 해당 멤버 삭제
        const { error: memberError } = await supabase
          .from('group_members')
          .delete()
          .eq('id', member.id)
        
        if (memberError) {
          console.error('❌ 멤버 제거 실패:', memberError)
          toast({
            title: "오류",
            description: "멤버 제거에 실패했습니다.",
            variant: "destructive",
          })
          return
        }

        console.log('✅ 멤버 제거 완료')

        toast({
          title: "성공",
          description: `${member.display_name || '이름 없는 사용자'}가 기업에서 제거되었습니다. 이제 다시 소속 요청을 할 수 있습니다.`,
        })

        // 3. 멤버 목록 새로고침
        const members = await getCompanyMembers(groupId)
        setCompanyMembers(members)
        
      } catch (error) {
        console.error('❌ 멤버 제거 중 오류 발생:', error)
        toast({
          title: "오류",
          description: "멤버 제거 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">구성원 관리</h1>
          <p className="text-muted-foreground">팀 구성원을 관리하고 초대를 보내세요</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setIsCompanyCreateModalOpen(true)}>
            <Building2 className="w-4 h-4 mr-2" />
            신규기업 등록
          </Button>
          <Button variant="outline" onClick={() => setIsInviteManagementModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            초대 관리
          </Button>
        </div>
      </div>

      {/* 선택된 기업 정보 */}
      {selectedCompany ? (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">현재 선택된 기업</h3>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-medium">{selectedCompany.name}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-center py-4">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-2">소속 기업을 선택해주세요</p>
            <p className="text-sm text-muted-foreground">사이드바에서 소속 기업을 선택하면 구성원을 확인할 수 있습니다.</p>
          </div>
        </div>
      )}

      {/* 선택된 기업이 있을 때만 멤버 목록 표시 */}
      {selectedCompany && (
        <>
          {/* Search and View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold">{selectedCompany.name} - 멤버 관리</h3>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="멤버 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">보기 방식:</span>
              <div className="flex border rounded-lg p-1 bg-muted">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4 mr-2" />
                  리스트
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  카드
                </Button>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <h3 className="text-lg font-semibold mb-4">등록된 인원</h3>
            {isLoadingMembers ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">멤버 정보를 불러오는 중...</p>
              </div>
            ) : viewMode === 'list' ? (
              // List View
              <div className="space-y-3">
                {filteredMembers.map((member) => (
                  <Card 
                    key={member.id} 
                    className={`hover:shadow-md transition-shadow ${
                      member.user_id === user?.id 
                        ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {member.display_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">
                                {member.display_name || '이름 없음'}
                                {member.user_id === user?.id && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    나
                                  </span>
                                )}
                                {(member.role as string) === 'owner' && (
                                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    Owner
                                  </span>
                                )}
                                {member.role === 'admin' && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    관리자
                                  </span>
                                )}
                              </h4>
                              {getStatusBadge(member.status || 'active')}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Mail className="w-4 h-4" />
                                <span>{member.email || '이메일 없음'}</span>
                              </div>
                              <span>가입일: {new Date(member.joined_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* admin 권한이 있는 경우에만 삭제 버튼 표시 */}
                          {isAdmin && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRemoveMember(member)}
                              className="h-8 px-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <Card 
                    key={member.id}
                    className={`hover:shadow-md transition-shadow ${
                      member.user_id === user?.id 
                        ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-lg">
                            {member.display_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-1">
                          <h4 className="font-medium">
                            {member.display_name || '이름 없음'}
                            {member.user_id === user?.id && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                나
                              </span>
                            )}
                            {(member.role as string) === 'owner' && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Owner
                              </span>
                            )}
                            {member.role === 'admin' && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                관리자
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center justify-center space-x-2">
                            {getStatusBadge(member.status || 'active')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.email || '이메일 없음'}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(member.joined_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredMembers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">검색 조건에 맞는 멤버가 없습니다.</p>
              </div>
            )}
          </div>
        </>
      )}



      {/* 초대 관리 모달 */}
      {selectedCompany && (
        <InviteManagementModal
          isOpen={isInviteManagementModalOpen}
          onClose={() => setIsInviteManagementModalOpen(false)}
          selectedGroup={{
            id: selectedCompany.id,
            name: selectedCompany.name,
            description: selectedCompany.description || '',
            parent_group_id: '',
            created_by: '',
            created_at: selectedCompany.created_at,
            updated_at: selectedCompany.updated_at
          }}
        />
      )}

      {/* 기업 등록 모달 */}
      <CompanyCreateModal
        open={isCompanyCreateModalOpen}
        onOpenChange={setIsCompanyCreateModalOpen}
        onCompanyCreated={handleCompanyCreated}
      />
    </div>
  )
}

export default Team