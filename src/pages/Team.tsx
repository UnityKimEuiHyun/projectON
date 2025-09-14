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
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"
import InviteManagementModal from "@/components/InviteManagementModal"
import CompanyCreateModal from "@/components/CompanyCreateModal"
import { createCompany, getUserCompanies } from "@/services/companyService"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [userAffiliations, setUserAffiliations] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [isLoadingAffiliations, setIsLoadingAffiliations] = useState(false)
  const [companyMembers, setCompanyMembers] = useState<GroupMember[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInviteManagementModalOpen, setIsInviteManagementModalOpen] = useState(false)
  const [isCompanyCreateModalOpen, setIsCompanyCreateModalOpen] = useState(false)

  // 소속된 기업이 있을 때만 해당 기업의 멤버들을 가져옴
  const filteredMembers = companyMembers.filter(member =>
    member.profiles.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.profiles.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.status?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 사용자 기업 소속 정보 로드
  useEffect(() => {
    const loadUserAffiliations = async () => {
      if (!user?.id) return
      
      setIsLoadingAffiliations(true)
      try {
        const { data: affiliations, error } = await supabase
          .from('group_members')
          .select(`
            groups (
              id,
              name,
              description,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
        
        if (error) {
          throw error
        }
        
        const affiliationsData = affiliations?.map(item => ({
          id: item.groups.id,
          name: item.groups.name,
          description: item.groups.description,
          parent_group_id: "",
          created_by: "",
          created_at: item.groups.created_at,
          updated_at: item.groups.updated_at,
        })).filter(group => group.id && group.name) || []
        
        setUserAffiliations(affiliationsData)
        
        // 소속된 기업이 있으면 기본 기업을 우선 선택, 없으면 첫 번째 기업 선택
        if (affiliationsData.length > 0) {
          // 기본 기업이 있는지 확인
          const defaultGroup = affiliationsData.find(group => isDefaultGroup(group))
          const groupToSelect = defaultGroup || affiliationsData[0]
          
          setSelectedGroup(groupToSelect)
          const groupId = groupToSelect.id
          await loadCompanyMembers(groupId)
          await checkAdminStatus(groupId)
        } else {
          setCompanyMembers([])
          setSelectedGroup(null)
        }
      } catch (error) {
        console.error('사용자 기업 소속 정보 로드 실패:', error)
        setUserAffiliations([])
        setCompanyMembers([])
        setSelectedGroup(null)
      } finally {
        setIsLoadingAffiliations(false)
      }
    }

    loadUserAffiliations()
  }, [user?.id])

  // 선택된 기업이 변경될 때마다 해당 기업의 정보 로드
  useEffect(() => {
    if (selectedGroup) {
      loadCompanyMembers(selectedGroup.id)
      checkAdminStatus(selectedGroup.id)
    }
  }, [selectedGroup])

  // 기본 기업 설정 함수
  const setDefaultGroup = async (group: Group) => {
    if (!user) return
    
    try {
      // profiles 테이블에 default_group_id 필드가 있다면 업데이트
      // 없다면 로컬 스토리지에 저장
      localStorage.setItem('defaultGroupId', group.id)
      
      toast({
        title: "성공",
        description: `${group.name}이(가) 기본 기업으로 설정되었습니다.`,
      })
    } catch (error) {
      console.error('기본 기업 설정 실패:', error)
      toast({
        title: "오류",
        description: "기본 기업 설정에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 기본 기업 해제 함수
  const removeDefaultGroup = async () => {
    try {
      localStorage.removeItem('defaultGroupId')
      
      toast({
        title: "성공",
        description: "기본 기업 설정이 해제되었습니다.",
      })
    } catch (error) {
      console.error('기본 기업 해제 실패:', error)
      toast({
        title: "오류",
        description: "기본 기업 해제에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 기본 기업인지 확인
  const isDefaultGroup = (group: Group) => {
    const defaultGroupId = localStorage.getItem('defaultGroupId')
    return defaultGroupId === group.id
  }

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

  // 소속된 기업의 멤버들을 가져오는 함수
  const loadCompanyMembers = async (groupId: string) => {
    if (!user) return
    
    setIsLoadingMembers(true)
    try {
      // 먼저 group_members만 조회 (profiles JOIN 없이)
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select(`
          id,
          group_id,
          user_id,
          role,
          status,
          joined_at
        `)
        .eq('group_id', groupId)
        .eq('status', 'active')
      
      if (membersError) {
        console.error('기업 멤버 조회 실패:', membersError)
        setCompanyMembers([])
        return
      }

      if (!members || members.length === 0) {
        console.log('기업에 소속된 멤버가 없습니다.')
        setCompanyMembers([])
        return
      }

      // 각 멤버의 프로필 정보를 개별적으로 조회
      const membersWithProfiles: GroupMember[] = []
      
      for (const member of members) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('display_name, email, phone')
            .eq('user_id', member.user_id)
            .single()
          
          if (profileError) {
            console.warn(`사용자 ${member.user_id}의 프로필 조회 실패:`, profileError)
            // 프로필 조회에 실패해도 기본 정보로 멤버 추가
            membersWithProfiles.push({
              ...member,
              profiles: {
                display_name: '이름 없음',
                email: '이메일 없음',
                phone: '전화번호 없음'
              }
            })
          } else {
            membersWithProfiles.push({
              ...member,
              profiles: profile
            })
          }
        } catch (profileError) {
          console.warn(`사용자 ${member.user_id}의 프로필 조회 중 예외 발생:`, profileError)
          // 예외가 발생해도 기본 정보로 멤버 추가
          membersWithProfiles.push({
            ...member,
            profiles: {
              display_name: '이름 없음',
              email: '이메일 없음',
              phone: '전화번호 없음'
            }
          })
        }
      }
      
      // 현재 사용자를 우선적으로 정렬: 현재 사용자가 먼저, 그 다음 다른 인원들
      const sortedMembers = membersWithProfiles.sort((a, b) => {
        // 현재 사용자인 경우 가장 앞으로
        if (a.user_id === user.id) return -1
        if (b.user_id === user.id) return 1
        
        // 그 외에는 가입일 순으로 정렬 (최신 가입자가 뒤로)
        return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
      })
      
      console.log('기업 멤버 정보 로드 성공 (정렬됨):', sortedMembers)
      setCompanyMembers(sortedMembers)
      
    } catch (error) {
      console.error('기업 멤버 정보 로드 실패:', error)
      setCompanyMembers([])
    } finally {
      setIsLoadingMembers(false)
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

  // 기업 소속 해제 함수
  const handleLeaveGroup = async (group: Group) => {
    if (!user) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }

    // 소속해제 확인 다이얼로그
    if (!confirm(`${group.name} 기업에서 소속을 해제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      console.log('🔄 소속 해제 시작...', { groupId: group.id, groupName: group.name })
      
      // 1. 먼저 group_join_requests에서 관련된 모든 이력 정리 (초대 이력 포함)
      const { error: cleanupError } = await supabase
        .from('group_join_requests')
        .delete()
        .eq('group_id', group.id)
        .eq('user_id', user.id)
      
      if (cleanupError) {
        console.error('❌ 가입 요청 이력 정리 실패:', cleanupError)
        // 이력 정리 실패해도 소속 해제는 계속 진행
      } else {
        console.log('✅ 가입 요청 이력 정리 완료 (초대 이력 포함)')
      }
      
      // 2. 기존 소속 레코드를 완전히 삭제
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group.id)
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ 소속 해제 실패:', error)
        toast({
          title: "오류",
          description: "소속 해제에 실패했습니다.",
          variant: "destructive",
        })
        return
      }

      console.log('✅ 소속 해제 완료')

      toast({
        title: "성공",
        description: `${group.name} 기업에서 소속이 해제되었습니다. 이제 다시 소속 요청을 할 수 있습니다.`,
      })

      // 3. 소속 정보 새로고침
      if (user) {
        const { data: affiliations, error } = await supabase
          .from('group_members')
          .select(`
            groups (
              id,
              name,
              description,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
        
        if (error) {
          console.error('소속 정보 새로고침 실패:', error)
        } else {
          const affiliationsData = affiliations?.map(item => ({
            id: item.groups.id,
            name: item.groups.name,
            description: item.groups.description,
            parent_group_id: "",
            created_by: "",
            created_at: item.groups.created_at,
            updated_at: item.groups.updated_at,
          })).filter(group => group.id && group.name) || []
          
          setUserAffiliations(affiliationsData)
          
          // 소속된 기업이 없으면 멤버 목록도 초기화
          if (affiliationsData.length === 0) {
            setCompanyMembers([])
            setSelectedGroup(null)
            setIsAdmin(false)
          } else {
            // 첫 번째 기업을 선택
            setSelectedGroup(affiliationsData[0])
          }
        }
      }
      
    } catch (error) {
      console.error('❌ 소속 해제 실패:', error)
      toast({
        title: "오류",
        description: "소속 해제에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 기업 등록 핸들러
  const handleCompanyCreated = async () => {
    // 기업 등록 후 사용자의 기업 목록을 다시 로드
    try {
      const { data: affiliations, error } = await supabase
        .from('group_members')
        .select(`
          groups (
            id,
            name,
            description,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
      
      if (error) {
        console.error('기업 목록 새로고침 실패:', error)
        return
      }
      
      const affiliationsData = affiliations?.map(item => ({
        id: item.groups.id,
        name: item.groups.name,
        description: item.groups.description,
        parent_group_id: "",
        created_by: "",
        created_at: item.groups.created_at,
        updated_at: item.groups.updated_at,
      })).filter(group => group.id && group.name) || []
      
      setUserAffiliations(affiliationsData)
      
      if (affiliationsData.length > 0) {
        // 가장 최근에 생성된 기업(마지막 기업)을 선택
        const latestCompany = affiliationsData[affiliationsData.length - 1]
        setSelectedGroup(latestCompany)
      }
    } catch (error) {
      console.error('기업 목록 새로고침 실패:', error)
    }
  }

  // 멤버 제거 함수
  const handleRemoveMember = async (member: GroupMember) => {
    if (!user || !selectedGroup) return
    
    const groupId = selectedGroup.id
    
    // 그룹 생성자 또는 admin 권한이 있는지 확인
    if (!isAdmin) {
      toast({
        title: "권한 없음",
        description: "멤버를 제거할 권한이 없습니다.",
        variant: "destructive",
      })
      return
    }

    if (confirm(`${member.profiles.display_name || '이름 없는 사용자'}를 기업에서 제거하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        console.log('🔄 멤버 제거 시작:', { 
          memberId: member.id, 
          memberName: member.profiles.display_name,
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
          description: `${member.profiles.display_name || '이름 없는 사용자'}가 기업에서 제거되었습니다. 이제 다시 소속 요청을 할 수 있습니다.`,
        })

        // 3. 멤버 목록 새로고침
        await loadCompanyMembers(groupId)
        
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

      {/* User Affiliations */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">내 소속 기업</h3>
            {selectedGroup && (
              <div className="flex items-center space-x-2">
                {isDefaultGroup(selectedGroup) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDefaultGroup()}
                    className="text-xs px-3 py-1 h-7 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <StarOff className="w-4 h-4 mr-1" />
                    기본 해제
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultGroup(selectedGroup)}
                    className="text-xs px-3 py-1 h-7 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    기본 설정
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        {isLoadingAffiliations ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">소속 정보를 불러오는 중...</p>
          </div>
        ) : userAffiliations.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {userAffiliations
                .sort((a, b) => {
                  // 기본 기업을 가장 앞에 배치
                  const aIsDefault = isDefaultGroup(a)
                  const bIsDefault = isDefaultGroup(b)
                  if (aIsDefault && !bIsDefault) return -1
                  if (!aIsDefault && bIsDefault) return 1
                  return 0
                })
                .map((affiliation) => (
                  <div key={affiliation.id} className="flex items-center space-x-2">
                    <Button
                      variant={selectedGroup?.id === affiliation.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedGroup(affiliation)}
                      className={`px-4 py-2 ${
                        selectedGroup?.id === affiliation.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      {affiliation.name}
                      {isDefaultGroup(affiliation) && (
                        <Star className="w-4 h-4 ml-2 text-yellow-500 fill-current" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveGroup(affiliation)}
                      className="text-xs px-2 py-2 h-8 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                    >
                      탈퇴
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-3">아직 소속된 기업이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 선택된 기업이 있을 때만 멤버 목록 표시 */}
      {selectedGroup && (
        <>
          {/* Search and View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold">{selectedGroup.name} - 멤버 관리</h3>
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
                              {member.profiles.display_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">
                                {member.profiles.display_name || '이름 없음'}
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
                                <span>{member.profiles.email || '이메일 없음'}</span>
                              </div>
                              {member.profiles.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="w-4 h-4" />
                                  <span>{member.profiles.phone}</span>
                                </div>
                              )}
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
                            {member.profiles.display_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-1">
                          <h4 className="font-medium">
                            {member.profiles.display_name || '이름 없음'}
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
                            {member.profiles.email || '이메일 없음'}
                          </div>
                          {member.profiles.phone && (
                            <div className="text-sm text-muted-foreground">
                              {member.profiles.phone}
                            </div>
                          )}
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

      {/* 소속된 기업이 없을 때 표시할 메시지 */}
      {userAffiliations.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">소속된 기업이 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              기업에 소속되어야 조직원들을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      )}


      {/* 초대 관리 모달 */}
      <InviteManagementModal
        isOpen={isInviteManagementModalOpen}
        onClose={() => setIsInviteManagementModalOpen(false)}
        selectedGroup={selectedGroup}
      />

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