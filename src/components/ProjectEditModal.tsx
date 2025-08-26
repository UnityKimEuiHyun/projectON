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
import type { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectEditModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onSave: (updatedProject: Project) => void
  onMinimize?: () => void
}

export function ProjectEditModal({ project, isOpen, onClose, onSave, onMinimize }: ProjectEditModalProps) {
  // project가 null이면 모달을 렌더링하지 않음
  if (!project) {
    return null
  }

  // 디버깅: contract_date 값 확인
  console.log('🔍 ProjectEditModal - project.contract_date:', project.contract_date)
  console.log('🔍 ProjectEditModal - project.due_date:', project.due_date)

  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    status: project.status,
    contract_date: project.contract_date ? project.contract_date.split('T')[0] : '',
    due_date: project.due_date ? project.due_date.split('T')[0] : '',
    team_size: project.team_size || 1,
    priority: project.priority,
    progress: project.progress
  })

  // 디버깅: formData 초기화 확인
  console.log('🔍 ProjectEditModal - formData 초기화:', formData)
  
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await ProjectService.updateProject(project.id, {
        ...formData,
        contract_date: formData.contract_date || null,
        due_date: formData.due_date || null,
        team_size: formData.team_size,
        progress: formData.progress
      })
      
      toast({
        title: "성공",
        description: "프로젝트가 성공적으로 수정되었습니다.",
      })
      
      // 수정된 데이터로 새로운 프로젝트 객체 생성
      const updatedProject = {
        ...project,
        ...formData,
        contract_date: formData.contract_date || null,
        due_date: formData.due_date || null,
        team_size: formData.team_size,
        progress: formData.progress
      }
      
      onSave(updatedProject)
      onClose()
    } catch (error) {
      toast({
        title: "오류",
        description: "프로젝트 수정에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title="프로젝트 편집"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSave}
      onCancel={onClose}
      confirmText={isLoading ? '저장 중...' : '확인'}
      cancelText="취소"
      size="lg"
      onMinimize={onMinimize}
    >
      <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
        {/* 프로젝트명 */}
        <div>
          <Label htmlFor="name">프로젝트명</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={isLoading}
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
              <SelectItem value="계획중">계획중</SelectItem>
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
            value={formData.contract_date || ''}
            onChange={(e) => handleInputChange('contract_date', e.target.value)}
            disabled={isLoading}
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
      </div>
    </Modal>
  )
}
