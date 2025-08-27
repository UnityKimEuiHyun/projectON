import * as React from 'react'
import { useState } from 'react'
import Modal from './ui/modal'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Slider } from './ui/slider'
import { ProjectService } from '@/services/projectService'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import type { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated: (newProject: Project) => void
}

export function ProjectCreateModal({ isOpen, onClose, onProjectCreated }: ProjectCreateModalProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: '계약전',
    contract_date: '',
    estimate_amount: '',
    estimate_note: '',
    due_date: '',
    team_size: 1,
    priority: '중간',
    progress: 0,
    group_id: '' as string | null
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string | number | null) => {
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

    if (!formData.name.trim()) {
      toast({
        title: "오류",
        description: "프로젝트명을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const newProject = await ProjectService.createProject({
        ...formData,
        contract_date: formData.contract_date || null,
        estimate_amount: formData.estimate_amount || null,
        estimate_note: formData.estimate_note || null,
        due_date: formData.due_date || null,
        team_size: formData.team_size,
        progress: formData.progress,
        group_id: formData.group_id || null,
        created_by: user?.id || '',
        created_by_name: userProfile?.display_name || '알 수 없음'
      })
      
      toast({
        title: "성공",
        description: "프로젝트가 성공적으로 생성되었습니다.",
      })
      
      onProjectCreated(newProject)
      onClose()
      
      // 폼 초기화
      setFormData({
        name: '',
        description: '',
        status: '계약전',
        contract_date: '',
        estimate_amount: '',
        estimate_note: '',
        due_date: '',
        team_size: 1,
        priority: '중간',
        progress: 0,
        group_id: '' as string | null
      })
    } catch (error) {
      toast({
        title: "오류",
        description: "프로젝트 생성에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title="새 프로젝트 생성"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleCreate}
      onCancel={onClose}
      confirmText={isLoading ? '생성 중...' : '생성'}
      cancelText="취소"
      size="lg"
    >
      <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
        {/* 프로젝트명 */}
        <div>
          <Label htmlFor="name">프로젝트명 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={isLoading}
            placeholder="프로젝트명을 입력하세요"
          />
        </div>

        {/* 설명 */}
        <div>
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={isLoading}
            rows={3}
            placeholder="프로젝트에 대한 설명을 입력하세요"
          />
        </div>

        {/* 상태 */}
        <div>
          <Label htmlFor="status">상태</Label>
          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger disabled={isLoading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="계약전">계약전</SelectItem>
              <SelectItem value="진행중">진행중</SelectItem>
              <SelectItem value="완료">완료</SelectItem>
              <SelectItem value="보류">보류</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 계약일 */}
        <div>
          <Label htmlFor="contract_date">계약일</Label>
          <Input
            id="contract_date"
            type="date"
            value={formData.contract_date}
            onChange={(e) => handleInputChange('contract_date', e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* 견적 금액 */}
        <div>
          <Label htmlFor="estimate_amount">견적 금액</Label>
          <Input
            id="estimate_amount"
            type="number"
            min="0"
            step="1000"
            value={formData.estimate_amount}
            onChange={(e) => handleInputChange('estimate_amount', e.target.value)}
            disabled={isLoading}
            placeholder="견적 금액을 입력하세요 (원)"
          />
        </div>

        {/* 견적 비고 */}
        <div>
          <Label htmlFor="estimate_note">견적 비고</Label>
          <Textarea
            id="estimate_note"
            value={formData.estimate_note}
            onChange={(e) => handleInputChange('estimate_note', e.target.value)}
            disabled={isLoading}
            rows={2}
            placeholder="견적에 대한 추가 정보를 입력하세요"
          />
        </div>

        {/* 마감일 */}
        <div>
          <Label htmlFor="due_date">마감일</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => handleInputChange('due_date', e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* 진행률 */}
        <div>
          <Label htmlFor="progress">진행률: {formData.progress}%</Label>
          <Slider
            value={[formData.progress]}
            onValueChange={(value) => handleInputChange('progress', value[0])}
            max={100}
            step={5}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* 팀 크기 */}
        <div>
          <Label htmlFor="team_size">팀 크기</Label>
          <Input
            id="team_size"
            type="number"
            min="1"
            value={formData.team_size}
            onChange={(e) => handleInputChange('team_size', parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>

        {/* 우선순위 */}
        <div>
          <Label htmlFor="priority">우선순위</Label>
          <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
            <SelectTrigger disabled={isLoading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="낮음">낮음</SelectItem>
              <SelectItem value="중간">중간</SelectItem>
              <SelectItem value="높음">높음</SelectItem>
              <SelectItem value="긴급">긴급</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 기업 할당 */}
        <div>
          <Label htmlFor="group_id">기업 할당 (선택사항)</Label>
          <Input
            id="group_id"
            value={formData.group_id || ''}
            onChange={(e) => handleInputChange('group_id', e.target.value)}
            disabled={isLoading}
            placeholder="기업 ID를 입력하세요 (예: d2a146c8-09ef-4add-bc8b-5e14643c326e)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            기업 ID를 입력하면 해당 기업에 프로젝트가 할당됩니다. 비워두면 개인 프로젝트로 생성됩니다.
          </p>
        </div>

        {/* 기업 할당 */}
        <div>
          <Label htmlFor="group_id">기업 할당 (선택사항)</Label>
          <Input
            id="group_id"
            value={formData.group_id || ''}
            onChange={(e) => handleInputChange('group_id', e.target.value)}
            disabled={isLoading}
            placeholder="기업 ID를 입력하세요 (예: d2a146c8-09ef-4add-bc8b-5e14643c326e)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            기업 ID를 입력하면 해당 기업에 프로젝트가 할당됩니다. 비워두면 개인 프로젝트로 생성됩니다.
          </p>
        </div>


      </div>
    </Modal>
  )
}
