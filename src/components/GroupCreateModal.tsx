import * as React from 'react'
import { useState, useEffect } from 'react'
import Modal from './ui/modal'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { GroupService } from '@/services/groupService'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import type { Database } from '@/integrations/supabase/types'
import { supabase } from '@/integrations/supabase/client'

type Group = Database['public']['Tables']['groups']['Row']

interface GroupCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onGroupCreated: (newGroup: Group) => void
}

export function GroupCreateModal({ isOpen, onClose, onGroupCreated }: GroupCreateModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_group_id: ''
  })

  const [parentGroups, setParentGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 부모 그룹 목록 로드
  useEffect(() => {
    if (isOpen) {
      // 모달이 열린 후 약간의 지연을 두고 부모 그룹을 로드
      const timer = setTimeout(() => {
        loadParentGroups()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const loadParentGroups = async () => {
    try {
      console.log('🔄 부모 그룹 목록 로드 시작...')
      
      // 임시로 빈 배열 반환 (마이그레이션 완료 후 주석 해제)
      setParentGroups([])
      console.log('✅ 임시로 빈 부모 그룹 목록 설정')
      
      // TODO: 마이그레이션 완료 후 아래 코드 주석 해제
      /*
      // 타임아웃 설정 (3초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('부모 그룹 로드 타임아웃')), 3000)
      })
      
      const groupsPromise = GroupService.getGroups()
      
      const groups = await Promise.race([groupsPromise, timeoutPromise]) as Group[]
      console.log('✅ 부모 그룹 로드 성공:', groups)
      setParentGroups(groups)
      */
      
    } catch (error) {
      console.error('❌ 부모 그룹 로드 실패:', error)
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "부모 그룹 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
      // 에러가 발생해도 빈 배열로 설정하여 모달이 계속 작동하도록 함
      setParentGroups([])
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreate = async () => {
    if (!user) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }

    const trimmedName = formData.name.trim()
    if (!trimmedName) {
      toast({
        title: "오류",
        description: "그룹명을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (trimmedName.length < 2) {
      toast({
        title: "오류",
        description: "그룹명은 2자 이상 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const newGroup = await GroupService.createGroup({
        name: trimmedName,
        description: formData.description.trim() || null,
        parent_group_id: formData.parent_group_id || null,
        created_by: user.id
      })
      
      // 현재 사용자의 소속 상태 확인
      const { data: existingAffiliations } = await supabase
        .from('group_members')
        .select('id, group_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
      
      const isAlreadyAffiliated = existingAffiliations && existingAffiliations.length > 0
      
      toast({
        title: "성공",
        description: isAlreadyAffiliated 
          ? "그룹이 성공적으로 생성되었습니다. (이미 다른 기업에 소속되어 있어 자동 소속 등록은 생략되었습니다)"
          : "그룹이 성공적으로 생성되었습니다. 자동으로 해당 기업에 소속되었습니다.",
      })
      
      onGroupCreated(newGroup)
      onClose()
      
      // 폼 초기화
      setFormData({
        name: '',
        description: '',
        parent_group_id: ''
      })
      
         } catch (error) {
       console.error('그룹 생성 실패:', error)
       
       // 중복 이름 오류인지 확인
       if (error instanceof Error && error.message.includes('동일한 이름의 그룹이 이미 존재합니다')) {
         toast({
           title: "오류",
           description: `'${trimmedName}' 기업명이 이미 존재합니다. 다른 이름을 사용해주세요.`,
           variant: "destructive",
         })
       } else {
         toast({
           title: "오류",
           description: "기업 등록에 실패했습니다.",
           variant: "destructive",
         })
       }
     } finally {
      setIsLoading(false)
    }
  }

    return (
    <>
             {/* 배경 오버레이 - 다른 작업 방지 */}
       {isOpen && (
         <div className="fixed inset-0 bg-black/50 z-50" />
       )}
      
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="신규 기업 등록"
        description="새로운 기업을 등록합니다."
      >
        <div className="space-y-4">
          {/* 기업명 */}
          <div className="space-y-2">
            <Label htmlFor="name">기업명 *</Label>
            <Input
              id="name"
              placeholder="기업명을 입력하세요"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="기업에 대한 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* 부모 그룹 - 마이그레이션 완료 후 주석 해제 */}
          {/*
          <div className="space-y-2">
            <Label htmlFor="parent_group">상위 그룹</Label>
            <Select
              value={formData.parent_group_id}
              onValueChange={(value) => handleInputChange('parent_group_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="상위 그룹을 선택하세요 (선택사항)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">상위 그룹 없음</SelectItem>
                {parentGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          */}

          {/* 버튼 */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? '등록 중...' : '기업 등록'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
