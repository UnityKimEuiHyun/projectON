import { useState, useEffect } from "react"
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
  UserPlus,
  Building2,
  List,
  Grid3X3,
  Check,
  X,
  Trash2,
  Star,
  StarOff
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AffiliationModal } from "@/components/AffiliationModal"
import { AffiliationService } from "@/services/affiliationService"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"

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
  const [isAffiliationModalOpen, setIsAffiliationModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [userAffiliations, setUserAffiliations] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [isLoadingAffiliations, setIsLoadingAffiliations] = useState(false)
  const [companyMembers, setCompanyMembers] = useState<GroupMember[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

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
        const affiliations = await AffiliationService.getUserAffiliations(user.id)
        setUserAffiliations(affiliations)
        
        // 소속된 기업이 있으면 첫 번째 기업을 기본 선택
        if (affiliations.length > 0) {
          setSelectedGroup(affiliations[0])
          const groupId = affiliations[0].id
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

  // admin 권한이 변경될 때마다 대기 중인 요청 로드
  useEffect(() => {
    if (isAdmin && selectedGroup) {
      loadPendingRequests(selectedGroup.id)
    }
  }, [isAdmin, selectedGroup])

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
      // 1. group_members에서 admin 권한 확인
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
      
      // 2. groups 테이블에서 그룹 생성자 확인
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('created_by')
        .eq('id', groupId)
        .single()
      
      if (memberError && groupError) {
        console.error('❌ 권한 확인 실패:', { memberError, groupError })
        setIsAdmin(false)
        return
      }
      
      // admin 권한이 있거나 그룹 생성자인 경우
      const isAdminRole = memberData?.role === 'admin'
      const isGroupCreator = groupData?.created_by === user.id
      
      setIsAdmin(isAdminRole || isGroupCreator)
      console.log('✅ 권한 확인 완료:', { 
        isAdminRole, 
        isGroupCreator, 
        isAdmin: isAdminRole || isGroupCreator 
      })
      
    } catch (error) {
      console.error('❌ 권한 확인 중 예외 발생:', error)
      setIsAdmin(false)
    }
  }

  // 대기 중인 가입 요청들을 가져오는 함수
  const loadPendingRequests = async (groupId: string) => {
    console.log('🔄 대기 중인 요청 로드 시작:', { 
      groupId, 
      isAdmin, 
      userId: user?.id 
    })
    
    setIsLoadingRequests(true)
    try {
      // 기본 쿼리로 테스트 (JOIN 없이)
      const { data, error } = await supabase
        .from('group_join_requests')
        .select('id, group_id, user_id, status, message, created_at, user_display_name, user_email')
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('❌ 대기 중인 요청 조회 실패:', error)
        setPendingRequests([])
        return
      }
      
      console.log('✅ 기본 쿼리 성공, 사용자 정보 포함:', data)
      
             // 사용자 정보를 포함하여 데이터 설정
       if (data && data.length > 0) {
         const requestsWithUserInfo = data.map((request: any) => ({
           ...request,
           profiles: {
             display_name: request.user_display_name || '이름 없음',
             email: request.user_email || '이메일 없음',
             phone: null
           }
         }))
         
         setPendingRequests(requestsWithUserInfo)
         console.log('✅ 사용자 정보 포함하여 완료:', requestsWithUserInfo)
       } else {
        setPendingRequests([])
        console.log('✅ 대기 중인 요청 없음')
      }
      
    } catch (error) {
      console.error('❌ 대기 중인 요청 조회 중 예외 발생:', error)
      setPendingRequests([])
    } finally {
      setIsLoadingRequests(false)
    }
  }

  // 가입 요청 승인/거절 처리
  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    if (!user || !isAdmin || !selectedGroup) return
    
    try {
      const request = pendingRequests.find(r => r.id === requestId)
      if (!request) return
      
      if (action === 'approve') {
        console.log('🔄 멤버 추가 시작:', {
          group_id: request.group_id,
          user_id: request.user_id,
          current_user: user.id,
          isAdmin
        })
        
        // group_members 테이블에 추가
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: request.group_id,
            user_id: request.user_id,
            role: 'member',
            status: 'active',
            joined_at: new Date().toISOString()
          })
        
        if (memberError) {
          console.error('❌ 멤버 추가 실패:', memberError)
          console.error('❌ 에러 상세 정보:', {
            code: memberError.code,
            message: memberError.message,
            details: memberError.details,
            hint: memberError.hint
          })
          toast({
            title: "오류",
            description: "멤버 추가에 실패했습니다.",
            variant: "destructive",
          })
          return
        }
        
        console.log('✅ 멤버 추가 성공')
        
        // 승인 시 group_join_requests 상태를 approved로 업데이트
        const { error: updateError } = await supabase
          .from('group_join_requests')
          .update({
            status: 'approved',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', requestId)
        
        if (updateError) {
          console.error('❌ 요청 상태 업데이트 실패:', updateError)
          toast({
            title: "오류",
            description: "요청 상태 업데이트에 실패했습니다.",
            variant: "destructive",
          })
          return
        }
        
        toast({
          title: "성공",
          description: "가입 요청을 승인했습니다.",
        })
        
      } else if (action === 'reject') {
        // 거절 시 group_join_requests에서 데이터 삭제
        const { error: deleteError } = await supabase
          .from('group_join_requests')
          .delete()
          .eq('id', requestId)
        
        if (deleteError) {
          console.error('❌ 요청 삭제 실패:', deleteError)
          toast({
            title: "오류",
            description: "요청 삭제에 실패했습니다.",
            variant: "destructive",
          })
          return
        }
        
        toast({
          title: "성공",
          description: "가입 요청을 거절했습니다.",
        })
      }
      
      // 목록 새로고침
      await loadPendingRequests(request.group_id)
      await loadCompanyMembers(request.group_id)
      
    } catch (error) {
      console.error('❌ 요청 처리 실패:', error)
      toast({
        title: "오류",
        description: "요청 처리에 실패했습니다.",
        variant: "destructive",
      })
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
        const affiliations = await AffiliationService.getUserAffiliations(user.id)
        setUserAffiliations(affiliations)
        
        // 소속된 기업이 없으면 멤버 목록도 초기화
        if (affiliations.length === 0) {
          setCompanyMembers([])
          setSelectedGroup(null)
          setIsAdmin(false)
        } else {
          // 첫 번째 기업을 선택
          setSelectedGroup(affiliations[0])
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
          console.log('✅ 가입 요청 이력 정리 완료')
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
        
        // 4. 대기 중인 요청 목록도 새로고침 (admin인 경우)
        if (isAdmin) {
          await loadPendingRequests(groupId)
        }
        
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
          <h1 className="text-3xl font-bold">조직 관리</h1>
          <p className="text-muted-foreground">소속을 관리하고 조직도를 확인하세요</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsAffiliationModalOpen(true)}>
            <Building2 className="w-4 h-4 mr-2" />
            소속 관리
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            멤버 초대
          </Button>
        </div>
      </div>

            {/* User Affiliations */}
       <div className="bg-muted/50 rounded-lg p-4">
         <h3 className="text-lg font-semibold mb-3">내 소속 기업</h3>
         {isLoadingAffiliations ? (
           <div className="text-center py-4">
             <p className="text-muted-foreground">소속 정보를 불러오는 중...</p>
           </div>
         ) : userAffiliations.length > 0 ? (
           <div className="space-y-3">
             <div className="flex flex-wrap gap-3">
               {userAffiliations.map((affiliation) => (
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
                     해제
                   </Button>
                 </div>
               ))}
             </div>
             
             {/* 기본 기업 설정 버튼 */}
             {selectedGroup && (
               <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                 <span className="text-sm text-muted-foreground">기본 기업 설정:</span>
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
                 <Badge variant="outline" className="bg-blue-100 text-blue-800">
                   {isDefaultGroup(selectedGroup) ? '기본 기업' : '선택됨'}
                 </Badge>
               </div>
             )}
           </div>
         ) : (
           <div className="text-center py-4">
             <p className="text-muted-foreground mb-3">아직 소속된 기업이 없습니다.</p>
             <Button 
               variant="outline" 
               size="sm"
               onClick={() => setIsAffiliationModalOpen(true)}
             >
               <Building2 className="w-4 h-4 mr-2" />
               기업 소속 등록하기
             </Button>
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

          {/* Team Members and Invitation Management - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Registered Members */}
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
                            <Avatar className={`h-10 w-10 ${
                              member.user_id === user?.id 
                                ? 'ring-2 ring-blue-400' 
                                : ''
                            }`}>
                              <AvatarImage src={undefined} />
                              <AvatarFallback className={
                                member.user_id === user?.id 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : ''
                              }>
                                {member.profiles.display_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <CardTitle className={`text-lg ${
                                  member.user_id === user?.id 
                                    ? 'text-blue-800' 
                                    : 'text-gray-900'
                                }`}>
                                  {member.profiles.display_name || '이름 없음'}
                                  {member.user_id === user?.id && (
                                    <span className="ml-2 text-sm text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">나</span>
                                  )}
                                </CardTitle>
                                {getStatusBadge(member.status)}
                                {member.role === 'admin' && (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                    관리자
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Mail className="w-4 h-4 mr-1" />
                                  {member.profiles.email || '이메일 없음'}
                                </span>
                                <span className="flex items-center">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {member.profiles.phone || '전화번호 없음'}
                                </span>
                                <span>가입일: {new Date(member.joined_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              연락하기
                            </Button>
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
                <div className="grid grid-cols-1 gap-4">
                  {filteredMembers.map((member) => (
                    <Card 
                      key={member.id} 
                      className={`hover:shadow-md transition-shadow ${
                        member.user_id === user?.id 
                          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <CardHeader className={
                        member.user_id === user?.id 
                          ? 'bg-blue-100/50' 
                          : ''
                      }>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className={`h-12 w-12 ${
                              member.user_id === user?.id 
                                ? 'ring-2 ring-blue-400' 
                                : ''
                            }`}>
                              <AvatarImage src={undefined} />
                              <AvatarFallback className={
                                member.user_id === user?.id 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : ''
                              }>
                                {member.profiles.display_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className={`text-lg ${
                                member.user_id === user?.id 
                                  ? 'text-blue-800' 
                                  : 'text-gray-900'
                              }`}>
                                {member.profiles.display_name || '이름 없음'}
                                {member.user_id === user?.id && (
                                  <span className="ml-2 text-sm text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">나</span>
                                )}
                              </CardTitle>
                              <CardDescription className={
                                member.user_id === user?.id 
                                  ? 'text-blue-600' 
                                  : ''
                              }>
                                {member.profiles.email || '이메일 없음'}
                              </CardDescription>
                            </div>
                          </div>
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
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="w-4 h-4 mr-2" />
                            {member.profiles.email || '이메일 없음'}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 mr-2" />
                            {member.profiles.phone || '전화번호 없음'}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(member.status)}
                            {member.role === 'admin' && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                                관리자
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(member.joined_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <Button variant="outline" className="w-full">
                          연락하기
                        </Button>
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

            {/* Right Column - Invitation Management (Admin Only) */}
            {isAdmin && (
              <div>
                <h3 className="text-lg font-semibold mb-4">초대 관리</h3>
                {isLoadingRequests ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">초대 요청을 불러오는 중...</p>
                  </div>
                ) : pendingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {request.profiles?.display_name || '이름 없음'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.profiles?.email || '이메일 없음'}
                          </div>
                          {request.message && (
                            <div className="text-sm text-gray-600 mt-1">
                              메시지: {request.message}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRequestAction(request.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRequestAction(request.id, 'reject')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            거절
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">대기 중인 가입 요청이 없습니다.</p>
                  </div>
                )}
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

      {/* 소속 등록 모달 */}
      <AffiliationModal
        isOpen={isAffiliationModalOpen}
        onClose={() => setIsAffiliationModalOpen(false)}
        onGroupCreated={() => {
          // 기업 생성 후 사용자 소속 정보 새로고침
          if (user) {
            AffiliationService.getUserAffiliations(user.id)
              .then(setUserAffiliations)
              .catch(console.error)
          }
        }}
      />
    </div>
  )
}

export default Team 