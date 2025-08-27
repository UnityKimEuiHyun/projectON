import React, { useState, useEffect } from 'react'
import Modal from './ui/modal'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Search, Users, User, Building } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']
type GroupMember = Database['public']['Tables']['group_members']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface TeamMemberAddModalProps {
  isOpen: boolean
  onClose: () => void
  onAddMembers: (selectedMembers: any[]) => void
  project: Project | null
  existingMembers: any[]
}

export function TeamMemberAddModal({ 
  isOpen, 
  onClose, 
  onAddMembers, 
  project, 
  existingMembers 
}: TeamMemberAddModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [availableMembers, setAvailableMembers] = useState<any[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 프로젝트가 열릴 때마다 사용 가능한 구성원 로드
  useEffect(() => {
    if (isOpen && project) {
      loadAvailableMembers()
    }
  }, [isOpen, project])

  const loadAvailableMembers = async () => {
    if (!project?.group_id) return

    setIsLoading(true)
    try {
      // 해당 기업에 소속된 구성원들 조회
      const { data: groupMembers, error } = await supabase
        .from('group_members')
        .select(`
          user_id,
          role,
          status,
          profiles (
            id,
            user_id,
            display_name,
            email
          )
        `)
        .eq('group_id', project.group_id)
        .eq('status', 'active')

      if (error) {
        console.error('기업 구성원 조회 실패:', error)
        return
      }

      // 이미 팀에 포함된 구성원 제외
      const existingMemberIds = existingMembers.map(m => m.user_id || m.id)
      const filteredMembers = groupMembers
        .filter(member => !existingMemberIds.includes(member.user_id))
        .map(member => ({
          id: member.user_id,
          user_id: member.user_id,
          role: member.role,
          display_name: member.profiles?.display_name,
          email: member.profiles?.email
        }))

      setAvailableMembers(filteredMembers)
    } catch (error) {
      console.error('사용 가능한 구성원 로드 중 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleAddSelected = () => {
    const membersToAdd = availableMembers.filter(member => 
      selectedMembers.includes(member.id)
    )
    onAddMembers(membersToAdd)
    setSelectedMembers([])
  }

  const filteredMembers = availableMembers.filter(member =>
    member.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Modal
      title="팀원 추가"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-4">
        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="이름 또는 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 기업 정보 */}
        {project?.group_id && (
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Building className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {project.group_id === 'd2a146c8-09ef-4add-bc8b-5e14643c326e' ? 'DAIM' : '기업'} 소속 구성원
            </span>
          </div>
        )}

        {/* 구성원 목록 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">구성원 선택</Label>
            <span className="text-xs text-muted-foreground">
              {selectedMembers.length}명 선택됨
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">구성원을 불러오는 중...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground">
                {searchTerm ? '검색 결과가 없습니다.' : '추가할 수 있는 구성원이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedMembers.includes(member.id) ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => handleMemberToggle(member.id)}
                >
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="text-xs">
                      {member.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {member.display_name || '이름 없음'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.email || '이메일 없음'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {member.role === 'admin' ? '관리자' : '구성원'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 선택된 구성원 요약 */}
        {selectedMembers.length > 0 && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm font-medium text-primary">
              {selectedMembers.length}명의 구성원이 선택되었습니다.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              추가 버튼을 클릭하여 팀에 추가하세요.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button 
          onClick={handleAddSelected}
          disabled={selectedMembers.length === 0}
        >
          <Users className="w-4 h-4 mr-2" />
          {selectedMembers.length}명 추가
        </Button>
      </div>
    </Modal>
  )
}
