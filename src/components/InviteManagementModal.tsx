import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserPlus, 
  X,
  Mail,
  Calendar,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"

type Group = Database['public']['Tables']['groups']['Row']
type GroupJoinRequest = Database['public']['Tables']['group_join_requests']['Row'] & {
  groups: {
    name: string
    description: string | null
  }
}

interface InviteManagementModalProps {
  isOpen: boolean
  onClose: () => void
  selectedGroup: Group | null
}

const InviteManagementModal = ({ isOpen, onClose, selectedGroup }: InviteManagementModalProps) => {
  const { toast } = useToast()
  const [sentInvites, setSentInvites] = useState<GroupJoinRequest[]>([])
  const [receivedInvites, setReceivedInvites] = useState<GroupJoinRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received')
  
  // 초대 생성 관련 상태
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviteLoading, setIsInviteLoading] = useState(false)

  // 보낸 초대 로드
  const loadSentInvites = async () => {
    if (!selectedGroup) return

    try {
      setIsLoading(true)
      
      // 현재 사용자 ID 가져오기
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('사용자 인증 정보가 없습니다.')
        return
      }

      // 선택된 그룹에서 admin 권한 확인
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('role, status')
        .eq('group_id', selectedGroup.id)
        .eq('user_id', user.id)
        .single()

      if (memberError || !memberData || memberData.role !== 'admin' || memberData.status !== 'active') {
        console.log('선택된 그룹에 Admin 권한이 없습니다.')
        setSentInvites([])
        return
      }

      // 선택된 그룹의 초대 요청 조회
      const { data, error } = await supabase
        .from('group_join_requests')
        .select(`
          *,
          groups (
            name,
            description
          )
        `)
        .eq('group_id', selectedGroup.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('초대 요청 조회 오류:', error)
        throw error
      }
      
      console.log('보낸 초대 데이터:', data)
      setSentInvites(data || [])
    } catch (error) {
      console.error('보낸 초대 로드 실패:', error)
      toast({
        title: "오류",
        description: "보낸 초대를 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 받은 초대 로드
  const loadReceivedInvites = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('사용자 인증 정보가 없습니다.')
        return
      }

      console.log('받은 초대 조회 - 사용자 ID:', user.id)

      // 사용자 ID로 받은 초대 요청 조회
      const { data, error } = await supabase
        .from('group_join_requests')
        .select(`
          *,
          groups (
            name,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('받은 초대 조회 오류:', error)
        throw error
      }
      
      console.log('받은 초대 데이터:', data)
      setReceivedInvites(data || [])
    } catch (error) {
      console.error('받은 초대 로드 실패:', error)
      toast({
        title: "오류",
        description: "받은 초대를 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 초대 취소
  const handleCancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('group_join_requests')
        .delete()
        .eq('id', inviteId)

      if (error) throw error

      setSentInvites(prev => prev.filter(invite => invite.id !== inviteId))
      toast({
        title: "성공",
        description: "초대가 취소되었습니다."
      })
    } catch (error) {
      console.error('초대 취소 실패:', error)
      toast({
        title: "오류",
        description: "초대 취소에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 초대 승인
  const handleAcceptInvite = async (inviteId: string, groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. group_members에 사용자 추가
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
          status: 'active'
        })

      if (memberError) throw memberError

      // 2. 초대 요청 삭제
      const { error: deleteError } = await supabase
        .from('group_join_requests')
        .delete()
        .eq('id', inviteId)

      if (deleteError) throw deleteError

      setReceivedInvites(prev => prev.filter(invite => invite.id !== inviteId))
      toast({
        title: "성공",
        description: "초대를 승인했습니다."
      })
    } catch (error) {
      console.error('초대 승인 실패:', error)
      toast({
        title: "오류",
        description: "초대 승인에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 초대 거절
  const handleRejectInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('group_join_requests')
        .delete()
        .eq('id', inviteId)

      if (error) throw error

      setReceivedInvites(prev => prev.filter(invite => invite.id !== inviteId))
      toast({
        title: "성공",
        description: "초대를 거절했습니다."
      })
    } catch (error) {
      console.error('초대 거절 실패:', error)
      toast({
        title: "오류",
        description: "초대 거절에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 초대 생성
  const handleCreateInvite = async () => {
    if (!inviteEmail.trim() || !selectedGroup) {
      toast({
        title: "입력 오류",
        description: "이메일을 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsInviteLoading(true)

      // 현재 사용자 ID 가져오기
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('사용자 인증 정보가 없습니다.')
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(inviteEmail)) {
        toast({
          title: "입력 오류",
          description: "올바른 이메일 형식을 입력해주세요.",
          variant: "destructive"
        })
        return
      }

      // 이미 해당 그룹에 초대가 있는지 확인
      const { data: existingInvite } = await supabase
        .from('group_join_requests')
        .select('id')
        .eq('group_id', selectedGroup.id)
        .eq('user_email', inviteEmail)
        .eq('status', 'pending')
        .single()

      if (existingInvite) {
        toast({
          title: "중복 초대",
          description: "이미 해당 이메일로 초대가 발송되었습니다.",
          variant: "destructive"
        })
        return
      }

      // 초대 요청 생성
      const { error } = await supabase
        .from('group_join_requests')
        .insert({
          group_id: selectedGroup.id,
          user_id: user.id, // 초대를 보내는 사람의 ID
          user_email: inviteEmail,
          user_display_name: inviteEmail.split('@')[0], // 임시 이름
          status: 'pending'
        })

      if (error) throw error

      toast({
        title: "성공",
        description: "초대가 발송되었습니다."
      })

      // 폼 초기화
      setInviteEmail('')

      // 초대 목록 새로고침
      await loadSentInvites()

    } catch (error) {
      console.error('초대 생성 실패:', error)
      toast({
        title: "오류",
        description: "초대 발송에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsInviteLoading(false)
    }
  }

  // 상태별 아이콘과 색상
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', text: '대기중' }
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', text: '승인됨' }
      case 'rejected':
        return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', text: '거절됨' }
      default:
        return { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100', text: '알 수 없음' }
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  useEffect(() => {
    if (isOpen) {
      // 선택된 그룹이 있으면 보낸 초대 탭, 없으면 받은 초대 탭으로 설정
      if (selectedGroup) {
        setActiveTab('sent')
        loadSentInvites()
      } else {
        setActiveTab('received')
      }
      loadReceivedInvites()
    }
  }, [isOpen, selectedGroup])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden" style={{ 
        position: 'fixed', 
        top: '5rem', 
        left: '50%', 
        transform: 'translateX(-50%)',
        margin: 0
      }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            구성원 관리
            {selectedGroup && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - {selectedGroup.name}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            보낸 초대와 받은 초대를 관리할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'sent' | 'received')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sent">보낸 초대 ({sentInvites.length})</TabsTrigger>
            <TabsTrigger value="received">받은 초대 ({receivedInvites.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="sent" className="space-y-4">
            {/* 초대 보내기 */}
            {selectedGroup && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700">
                    {selectedGroup.name}에 초대 보내기
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium">이메일 주소</label>
                    <Input
                      type="email"
                      placeholder="초대할 사용자의 이메일을 입력하세요"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="mt-1 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleCreateInvite}
                      disabled={isInviteLoading || !inviteEmail.trim()}
                      size="sm"
                    >
                      {isInviteLoading ? '발송 중...' : '초대 보내기'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500">로딩 중...</div>
                </div>
              ) : sentInvites.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  보낸 초대가 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {sentInvites.map((invite) => {
                    const statusInfo = getStatusInfo(invite.status)
                    const StatusIcon = statusInfo.icon

                    return (
                      <Card key={invite.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {invite.user_display_name?.charAt(0) || 
                                 invite.user_email?.charAt(0) || 
                                 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {invite.user_display_name || '알 수 없음'}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {invite.user_email || '이메일 없음'}
                              </div>
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(invite.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.text}
                            </Badge>
                            {invite.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelInvite(invite.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4 mr-1" />
                                취소
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="received" className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500">로딩 중...</div>
                </div>
              ) : receivedInvites.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  받은 초대가 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedInvites.map((invite) => {
                    const statusInfo = getStatusInfo(invite.status)
                    const StatusIcon = statusInfo.icon

                    return (
                      <Card key={invite.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {invite.groups.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{invite.groups.name}</div>
                              {invite.groups.description && (
                                <div className="text-sm text-gray-500">
                                  {invite.groups.description}
                                </div>
                              )}
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(invite.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.text}
                            </Badge>
                            {invite.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectInvite(invite.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  거절
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptInvite(invite.id, invite.group_id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  승인
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default InviteManagementModal
