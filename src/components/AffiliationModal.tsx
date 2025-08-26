import * as React from 'react'
import { useState, useEffect } from 'react'
import Modal from './ui/modal'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Search, Users, Plus, Send, Building2, Trash2 } from 'lucide-react'
import { GroupService } from '@/services/groupService'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { GroupCreateModal } from './GroupCreateModal'
import type { Database } from '@/integrations/supabase/types'

type Group = Database['public']['Tables']['groups']['Row']

interface AffiliationModalProps {
  isOpen: boolean
  onClose: () => void
  onGroupCreated?: () => void
}

export function AffiliationModal({ isOpen, onClose, onGroupCreated }: AffiliationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("")
  const [groups, setGroups] = useState<Group[]>([])
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [joinMessage, setJoinMessage] = useState("")
  const [groupMemberCounts, setGroupMemberCounts] = useState<Record<string, number>>({})
  const [userAffiliations, setUserAffiliations] = useState<Record<string, boolean>>({})
  const [userJoinRequests, setUserJoinRequests] = useState<Record<string, boolean>>({})

  // 그룹 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadGroups()
    }
  }, [isOpen])

  // 검색어에 따른 그룹 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGroups(groups)
    } else {
      const filtered = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredGroups(filtered)
    }
  }, [searchTerm, groups])

  const loadGroups = async () => {
    try {
      console.log('🔄 그룹 목록 로드 시작...')
      setIsLoading(true)
      
      const groupsData = await GroupService.getGroups()
      setGroups(groupsData)
      setFilteredGroups(groupsData)
      
      // 각 기업의 멤버 수 조회
      await loadGroupMemberCounts(groupsData)
      
      // 사용자의 소속 상태 확인
      await loadUserAffiliations(groupsData)
      
      // 사용자의 가입 요청 상태 확인
      await loadUserJoinRequests(groupsData)
      
      console.log('✅ 그룹 목록 로드 성공:', groupsData)
      
    } catch (error) {
      console.error('❌ 그룹 목록 로드 실패:', error)
      toast({
        title: "오류",
        description: "그룹 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
      setGroups([])
      setFilteredGroups([])
    } finally {
      setIsLoading(false)
    }
  }

  // 사용자의 가입 요청 상태 확인
  const loadUserJoinRequests = async (groups: Group[]) => {
    try {
      if (!user) {
        console.log('👤 사용자 정보 없음, 가입 요청 상태 확인 건너뜀');
        return;
      }

      console.log('🔍 사용자 가입 요청 상태 확인 시작...');
      const joinRequests: Record<string, boolean> = {};
      
      // 각 그룹에 대해 사용자의 pending 상태 가입 요청 확인
      for (const group of groups) {
        try {
          const { data, error } = await supabase
            .from('group_join_requests')
            .select('id')
            .eq('group_id', group.id)
            .eq('user_id', user.id)
            .eq('status', 'pending');
          
          if (error) {
            console.error(`❌ ${group.name} 가입 요청 상태 조회 실패:`, error);
            joinRequests[group.id] = false;
            continue;
          }
          
          // 사용자가 해당 그룹에 pending 상태의 가입 요청이 있는지 확인
          joinRequests[group.id] = data && data.length > 0;
          console.log(`✅ ${group.name} 가입 요청 상태 확인 완료:`, joinRequests[group.id]);
          
        } catch (groupError) {
          console.error(`❌ ${group.name} 가입 요청 상태 조회 중 예외 발생:`, groupError);
          joinRequests[group.id] = false;
        }
      }
      
      setUserJoinRequests(joinRequests);
      console.log('✅ 사용자 가입 요청 상태 확인 완료:', joinRequests);
      
    } catch (error) {
      console.error('❌ 사용자 가입 요청 상태 확인 실패:', error);
      // 에러가 발생해도 모든 가입 요청 상태를 false로 설정
      const fallbackJoinRequests: Record<string, boolean> = {};
      groups.forEach(group => {
        fallbackJoinRequests[group.id] = false;
      });
      setUserJoinRequests(fallbackJoinRequests);
    }
  };

  // 사용자의 소속 상태 확인
  const loadUserAffiliations = async (groups: Group[]) => {
    try {
      if (!user) {
        console.log('👤 사용자 정보 없음, 소속 상태 확인 건너뜀');
        return;
      }

      console.log('🔍 사용자 소속 상태 확인 시작...');
      const affiliations: Record<string, boolean> = {};
      
      // 각 그룹에 대해 사용자의 소속 상태 확인
      for (const group of groups) {
        try {
          console.log(`🔍 ${group.name} 소속 상태 조회 시작:`, {
            groupId: group.id,
            userId: user.id
          });
          
          const { data, error } = await supabase
            .from('group_members')
            .select('id')
            .eq('group_id', group.id)
            .eq('user_id', user.id);
          
          if (error) {
            console.error(`❌ ${group.name} 소속 상태 조회 실패:`, {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            });
            
            // 에러가 발생해도 소속 상태를 false로 설정하여 UI가 계속 작동하도록 함
            affiliations[group.id] = false;
            continue;
          }
          
          // 사용자가 해당 그룹에 소속되어 있는지 확인
          affiliations[group.id] = data && data.length > 0;
          console.log(`✅ ${group.name} 소속 상태 확인 완료:`, affiliations[group.id]);
          
        } catch (groupError) {
          console.error(`❌ ${group.name} 소속 상태 조회 중 예외 발생:`, groupError);
          // 예외가 발생해도 소속 상태를 false로 설정
          affiliations[group.id] = false;
        }
      }
      
      setUserAffiliations(affiliations);
      console.log('✅ 사용자 소속 상태 확인 완료:', affiliations);
      
    } catch (error) {
      console.error('❌ 사용자 소속 상태 확인 실패:', error);
      // 에러가 발생해도 모든 소속 상태를 false로 설정
      const fallbackAffiliations: Record<string, boolean> = {};
      groups.forEach(group => {
        fallbackAffiliations[group.id] = false;
      });
      setUserAffiliations(fallbackAffiliations);
    }
  };

  // 각 기업의 멤버 수 조회
  const loadGroupMemberCounts = async (groups: Group[]) => {
    try {
      console.log('🔄 기업 멤버 수 로드 시작...')
      const memberCounts: Record<string, number> = {}
      
      for (const group of groups) {
        try {
          // 더 안전한 쿼리 방식 사용
          const { data, error } = await supabase
            .from('group_members')
            .select('id')
            .eq('group_id', group.id)
          
          if (error) {
            console.error(`❌ ${group.name} 멤버 수 조회 실패:`, error)
            console.error(`❌ 에러 상세 정보:`, {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            })
            
            // 에러가 발생해도 멤버 수를 0으로 설정하여 UI가 계속 작동하도록 함
            memberCounts[group.id] = 0
            continue
          } else {
            memberCounts[group.id] = data?.length || 0
          }
        } catch (groupError) {
          console.error(`❌ ${group.name} 멤버 수 조회 중 예외 발생:`, groupError)
          memberCounts[group.id] = 0
        }
      }
      
      setGroupMemberCounts(memberCounts)
      console.log('✅ 기업 멤버 수 로드 성공:', memberCounts)
      
    } catch (error) {
      console.error('❌ 기업 멤버 수 로드 실패:', error)
      // 에러가 발생해도 모든 멤버 수를 0으로 설정
      const fallbackCounts: Record<string, number> = {}
      groups.forEach(group => {
        fallbackCounts[group.id] = 0
      })
      setGroupMemberCounts(fallbackCounts)
    }
  }

  const handleJoinRequest = async (group: Group) => {
    if (!user) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }

    if (!joinMessage.trim()) {
      toast({
        title: "오류",
        description: "가입 메시지를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      // 먼저 사용자가 이미 다른 기업에 소속되어 있는지 확인
      const { data: existingAffiliations, error: checkError } = await supabase
        .from('group_members')
        .select('id, group_id')
        .eq('user_id', user.id)
      
      if (checkError) {
        console.error('❌ 기존 소속 확인 실패:', checkError)
        toast({
          title: "오류",
          description: "소속 상태를 확인할 수 없습니다.",
          variant: "destructive",
        })
        return
      }
      
      if (existingAffiliations && existingAffiliations.length > 0) {
        const existingGroupId = existingAffiliations[0].group_id
        if (existingGroupId !== group.id) {
          toast({
            title: "소속 제한",
            description: "이미 다른 기업에 소속되어 있습니다. 한 번에 하나의 기업에만 소속될 수 있습니다.",
            variant: "destructive",
          })
          return
        } else {
          toast({
            title: "알림",
            description: "이미 이 기업에 소속되어 있습니다.",
            variant: "default",
          })
          return
        }
      }
      
      // 이미 가입 요청을 보냈는지 확인 (pending 또는 rejected 상태)
      const { data: existingRequests, error: requestCheckError } = await supabase
        .from('group_join_requests')
        .select('id, status')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .eq('status', 'pending')
      
      if (requestCheckError) {
        console.error('❌ 기존 가입 요청 확인 실패:', requestCheckError)
        toast({
          title: "오류",
          description: "가입 요청 상태를 확인할 수 없습니다.",
          variant: "destructive",
        })
        return
      }
      
      if (existingRequests && existingRequests.length > 0) {
        const existingRequest = existingRequests[0];
        
        if (existingRequest.status === 'pending') {
          toast({
            title: "알림",
            description: "이미 이 기업에 가입 요청을 보냈습니다. 승인을 기다려주세요.",
            variant: "default",
          })
          return
        }
      }

      // 그룹 가입 요청을 group_join_requests 테이블에 저장
      // 사용자 정보를 함께 저장하여 admin이 쉽게 확인할 수 있도록 함
      
      // 먼저 profiles 테이블에서 사용자 정보 조회
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('user_id', user.id)
        .single()
      
      if (profileError) {
        console.warn('⚠️ 프로필 정보 조회 실패, 기본값 사용:', profileError)
      }
      
      const userDisplayName = userProfile?.display_name || user.user_metadata?.display_name || '이름 없음'
      const userEmail = userProfile?.email || user.email || '이메일 없음'
      
      console.log('🔍 사용자 정보:', { 
        userDisplayName, 
        userEmail, 
        profileData: userProfile,
        userMetadata: user.user_metadata 
      })
      
      const { data: joinRequest, error: insertError } = await supabase
        .from('group_join_requests')
        .insert([{
          group_id: group.id,
          user_id: user.id,
          status: 'pending',
          message: joinMessage.trim(),
          user_display_name: userDisplayName,
          user_email: userEmail
        }])
        .select()
        .single()
      
      if (insertError) {
        console.error('❌ 가입 요청 저장 실패:', insertError)
        
        // 중복 요청인 경우
        if (insertError.code === '23505') { // unique_violation
          toast({
            title: "알림",
            description: "이미 가입 요청을 보낸 기업입니다.",
            variant: "default",
          })
        } else {
          toast({
            title: "오류",
            description: "가입 요청 저장에 실패했습니다.",
            variant: "destructive",
          })
        }
        return
      }
      
      console.log('✅ 가입 요청 저장 성공:', joinRequest)
      
      toast({
        title: "성공",
        description: `${group.name} 기업에 가입 요청을 보냈습니다.`,
      })
      
      setSelectedGroup(null)
      setJoinMessage("")
      
      // 소속 상태와 가입 요청 상태 업데이트
      await loadUserAffiliations([group])
      await loadUserJoinRequests([group])
      
    } catch (error) {
      console.error('❌ 그룹 가입 요청 실패:', error)
      toast({
        title: "오류",
        description: "가입 요청에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 바로 소속 등록 (멤버가 0명인 기업)
  const handleDirectJoin = async (group: Group) => {
    if (!user) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('🔄 바로 소속 등록 시작...', { groupId: group.id, groupName: group.name })
      
      // 먼저 사용자가 이미 다른 기업에 소속되어 있는지 확인
      const { data: existingAffiliations, error: checkError } = await supabase
        .from('group_members')
        .select('id, group_id')
        .eq('user_id', user.id)
      
      if (checkError) {
        console.error('❌ 기존 소속 확인 실패:', checkError)
        toast({
          title: "오류",
          description: "소속 상태를 확인할 수 없습니다.",
          variant: "destructive",
        })
        return
      }
      
      if (existingAffiliations && existingAffiliations.length > 0) {
        const existingGroupId = existingAffiliations[0].group_id
        if (existingGroupId !== group.id) {
          toast({
            title: "소속 제한",
            description: "이미 다른 기업에 소속되어 있습니다. 한 번에 하나의 기업에만 소속될 수 있습니다.",
            variant: "destructive",
          })
          return
        } else {
          toast({
            title: "알림",
            description: "이미 이 기업에 소속되어 있습니다.",
            variant: "default",
          })
          return
        }
      }
      
      // group_members 테이블에 직접 추가
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'member',
          status: 'active',
          joined_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ 소속 등록 실패:', error)
        console.error('❌ 에러 상세 정보:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // 사용자당 하나의 소속만 허용하는 제약 조건 위반
        if (error.message && error.message.includes('사용자는 한 번에 하나의 기업에만 소속될 수 있습니다')) {
          toast({
            title: "소속 제한",
            description: "이미 다른 기업에 소속되어 있습니다. 한 번에 하나의 기업에만 소속될 수 있습니다.",
            variant: "destructive",
          })
        } else {
          throw new Error(`소속 등록에 실패했습니다: ${error.message}`)
        }
        return
      }

      toast({
        title: "성공",
        description: `${group.name} 기업에 바로 소속되었습니다.`,
      })

      // 그룹 목록 새로고침
      loadGroups()
      
      // 소속 상태 업데이트
      await loadUserAffiliations([group])
      
      // 부모 컴포넌트에 알림
      if (onGroupCreated) {
        onGroupCreated()
      }
      
    } catch (error) {
      console.error('❌ 바로 소속 등록 실패:', error)
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "소속 등록에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 기업 소속 해제
  const handleLeaveGroup = async (group: Group) => {
    if (!user) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('🔄 소속 해제 시작...', { groupId: group.id, groupName: group.name })
      
      // 기존 소속 레코드를 완전히 삭제
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

      toast({
        title: "성공",
        description: `${group.name} 기업에서 소속이 해제되었습니다.`,
      })

      // 그룹 목록 새로고침
      loadGroups()
      
      // 부모 컴포넌트에 알림
      if (onGroupCreated) {
        onGroupCreated()
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

  const handleGroupCreated = async (newGroup: Group) => {
    console.log('새 그룹 생성됨:', newGroup)
    // 그룹 목록 새로고침
    await loadGroups()
    
    // 새로 생성된 그룹에 대한 소속 상태 업데이트
    await loadUserAffiliations([newGroup])
    
    setIsGroupModalOpen(false)
    
    // 부모 컴포넌트에 알림
    if (onGroupCreated) {
      onGroupCreated()
    }
  }

  const handleDeleteGroup = async (group: Group) => {
    if (!user) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }

    if (confirm(`${group.name} 기업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        console.log('🔄 그룹 삭제 시작...', { groupId: group.id, groupName: group.name })
        
        // 먼저 그룹 멤버 레코드를 삭제
        const { error: memberError } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', group.id);

        if (memberError) {
          console.error('❌ 그룹 멤버 삭제 실패:', memberError)
          toast({
            title: "오류",
            description: "그룹 멤버를 삭제하는데 실패했습니다.",
            variant: "destructive",
          })
          return
        }

        // 그룹 자체를 삭제
        const { error: groupError } = await supabase
          .from('groups')
          .delete()
          .eq('id', group.id);

        if (groupError) {
          console.error('❌ 그룹 삭제 실패:', groupError)
          toast({
            title: "오류",
            description: "그룹을 삭제하는데 실패했습니다.",
            variant: "destructive",
          })
          return
        }

        toast({
          title: "성공",
          description: `${group.name} 기업이 삭제되었습니다.`,
        })

        // 그룹 목록 새로고침
        loadGroups()
        
        // 부모 컴포넌트에 알림
        if (onGroupCreated) {
          onGroupCreated()
        }
        
      } catch (error) {
        console.error('❌ 그룹 삭제 실패:', error)
        toast({
          title: "오류",
          description: error instanceof Error ? error.message : "그룹 삭제에 실패했습니다.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="소속 등록"
      >
        <div className="space-y-4">
          {/* 신규 기업 등록 버튼 */}
          <div className="flex justify-end">
            <Button onClick={() => setIsGroupModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              신규 기업 등록
            </Button>
          </div>

          {/* 현재 소속 기업 표시 */}
          {(() => {
            const currentAffiliation = Object.entries(userAffiliations).find(([_, isAffiliated]) => isAffiliated);
            if (currentAffiliation) {
              const [groupId, _] = currentAffiliation;
              const currentGroup = groups.find(g => g.id === groupId);
              if (currentGroup) {
                return (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-green-800">현재 소속 기업</h3>
                          <p className="text-sm text-green-700">{currentGroup.name}</p>
                          {currentGroup.description && (
                            <p className="text-xs text-green-600 mt-1">{currentGroup.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          소속됨
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLeaveGroup(currentGroup)}
                          className="text-xs px-2 py-1 h-6 border-green-300 text-green-700 hover:bg-green-100"
                        >
                          소속 해제
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }
            } else {
              // 현재 소속된 기업이 없을 때 안내 메시지
              return (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">소속된 기업 없음</h3>
                      <p className="text-sm text-gray-600">아직 소속된 기업이 없습니다. 아래에서 기업을 선택하여 소속을 등록하세요.</p>
                    </div>
                  </div>
                </div>
              );
            }
          })()}

          {/* 기업 목록 */}
          <div className="space-y-2">
            <Label htmlFor="search">소속 가능한 기업 검색</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                placeholder="기업명 또는 설명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 기업 목록 */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">기업 목록을 불러오는 중...</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? '검색 조건에 맞는 기업이 없습니다.' : '등록된 기업이 없습니다.'}
                </p>
              </div>
            ) : (
              filteredGroups
                .filter(group => !userAffiliations[group.id]) // 현재 소속된 기업은 목록에서 제외
                .map((group) => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              {group.description && (
                                <CardDescription>{group.description}</CardDescription>
                              )}
                              <Badge variant="outline" className="text-xs">
                                멤버 {groupMemberCounts[group.id] || 0}명
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {userAffiliations[group.id] ? (
                          // 이미 소속된 경우
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              소속됨
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLeaveGroup(group)}
                              className="text-xs px-2 py-1 h-6"
                            >
                              소속 해제
                            </Button>
                          </div>
                        ) : userJoinRequests[group.id] ? (
                          // 이미 가입 요청을 보낸 경우
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                요청 대기중
                              </Badge>
                            </div>
                        ) : groupMemberCounts[group.id] === 0 ? (
                          // 멤버가 0명인 경우 바로 소속 등록 또는 삭제
                          <div className="flex flex-col space-y-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleDirectJoin(group)}
                              className="w-full"
                            >
                              <Users className="w-4 h-4 mr-2" />
                              소속 등록
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteGroup(group)}
                              className="w-full"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              삭제
                            </Button>
                          </div>
                        ) : (
                          // 멤버가 있는 경우 소속 요청
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedGroup(group)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            소속 요청
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))
            )}
          </div>

          {/* 소속 요청 모달 */}
          {selectedGroup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">
                  {selectedGroup.name} 기업 소속 요청
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">소속 요청 메시지</Label>
                    <Textarea
                      id="message"
                      placeholder="등록 사유를 작성해주세요..."
                      value={joinMessage}
                      onChange={(e) => setJoinMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setSelectedGroup(null)}>
                      취소
                    </Button>
                    <Button onClick={() => handleJoinRequest(selectedGroup)}>
                      소속 요청
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 - 소속 제한 안내 */}
        <div className="border-t pt-4 mt-6">
          <div className="text-center text-xs text-muted-foreground bg-muted/30 rounded-md py-2 px-3">
            <span className="font-medium">ℹ</span> 사용자는 한 번에 하나의 기업에만 소속될 수 있습니다
          </div>
        </div>
      </Modal>

      {/* 신규 기업 등록 모달 */}
      <GroupCreateModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </>
  )
}
