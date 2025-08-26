import React, { useState, useEffect } from 'react'
import Modal from './ui/modal'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Slider } from './ui/slider'
import { Calendar, Users, User, Clock, Target, FileText, Building, Edit, Save, X } from 'lucide-react'
import { ProjectService } from '@/services/projectService'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectDetailModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onProjectUpdated?: (updatedProject: Project) => void
}

export function ProjectDetailModal({ project, isOpen, onClose, onProjectUpdated }: ProjectDetailModalProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 모달이 닫힐 때 편집 모드 초기화
  const handleClose = () => {
    setIsEditing(false)
    onClose()
  }
  
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || '',
    contract_date: project?.contract_date ? project.contract_date.split('T')[0] : '',
    estimate_amount: project?.estimate_amount || '',
    estimate_note: project?.estimate_note || '',
    due_date: project?.due_date ? project.due_date.split('T')[0] : '',
    team_size: project?.team_size || 1,
    priority: project?.priority || '',
    progress: project?.progress || 0
  })

  // project가 변경될 때마다 formData 업데이트
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status,
        contract_date: project.contract_date ? project.contract_date.split('T')[0] : '',
        estimate_amount: project.estimate_amount || '',
        estimate_note: project.estimate_note || '',
        due_date: project.due_date ? project.due_date.split('T')[0] : '',
        team_size: project.team_size || 1,
        priority: project.priority,
        progress: project.progress
      })
    }
  }, [project])

  if (!project) return null

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!project) return
    
    setIsLoading(true)
    try {
      await ProjectService.updateProject(project.id, {
        ...formData,
        contract_date: formData.contract_date || null,
        estimate_amount: formData.estimate_amount || null,
        estimate_note: formData.estimate_note || null,
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
        estimate_amount: formData.estimate_amount || null,
        estimate_note: formData.estimate_note || null,
        due_date: formData.due_date || null,
        team_size: formData.team_size,
        progress: formData.progress
      }
      
      if (onProjectUpdated) {
        onProjectUpdated(updatedProject)
      }
      
      setIsEditing(false)
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

  const handleCancelEdit = () => {
    // 원래 데이터로 복원
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status,
        contract_date: project.contract_date ? project.contract_date.split('T')[0] : '',
        estimate_amount: project.estimate_amount || '',
        estimate_note: project.estimate_note || '',
        due_date: project.due_date ? project.due_date.split('T')[0] : '',
        team_size: project.team_size || 1,
        priority: project.priority,
        progress: project.progress
      })
    }
    setIsEditing(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "진행중":
        return <Badge variant="default">진행중</Badge>
      case "완료":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">완료</Badge>
      case "대기중":
        return <Badge variant="secondary">대기중</Badge>
      case "계획중":
        return <Badge variant="outline">계획중</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "높음":
        return "text-red-600"
      case "중간":
        return "text-yellow-600"
      case "낮음":
        return "text-green-600"
      default:
        return "text-muted-foreground"
    }
  }

  // Mock 팀 멤버 데이터 (실제로는 DB에서 가져와야 함)
  const teamMembers = [
    { id: 1, name: "김철수", role: "프로젝트 매니저", email: "kim@example.com" },
    { id: 2, name: "이영희", role: "개발자", email: "lee@example.com" },
    { id: 3, name: "박민수", role: "디자이너", email: "park@example.com" },
    { id: 4, name: "정수진", role: "QA 엔지니어", email: "jung@example.com" },
    { id: 5, name: "최동현", role: "개발자", email: "choi@example.com" },
  ].slice(0, project?.team_size || 1)

  return (
    <Modal
      title="프로젝트 상세 정보"
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
    >
      <div className="max-h-[75vh] overflow-y-auto space-y-6 pr-2">
        {/* 프로젝트 기본 정보 */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">프로젝트명</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={isLoading}
                      className="text-xl font-bold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">설명</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={isLoading}
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{project.name}</h2>
                  <p className="text-muted-foreground text-lg">{project.description}</p>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {isEditing ? (
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium">상태</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger disabled={isLoading} className="w-32">
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
                  <div>
                    <Label htmlFor="priority" className="text-sm font-medium">우선순위</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger disabled={isLoading} className="w-32">
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
              ) : (
                <>
                  {getStatusBadge(project.status)}
                  <Badge variant="outline" className={getPriorityColor(project.priority)}>
                    {project.priority} 우선순위
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 진행률 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center">
            <Target className="w-5 h-5 mr-2" />
            진행률
          </h3>
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">전체 진행률</span>
                  <span className="font-medium">{formData.progress}%</span>
                </div>
                <Slider
                  value={[formData.progress]}
                  onValueChange={(value) => handleInputChange('progress', value[0])}
                  max={100}
                  step={5}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">전체 진행률</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-3" />
              </>
            )}
          </div>
        </div>

        {/* 날짜 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              프로젝트 일정
            </h3>
            <div className="space-y-2">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="contract_date" className="text-sm font-medium">계약일</Label>
                    <Input
                      id="contract_date"
                      type="date"
                      value={formData.contract_date || ''}
                      onChange={(e) => handleInputChange('contract_date', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date" className="text-sm font-medium">종료일</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date || ''}
                      onChange={(e) => handleInputChange('due_date', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">계약일</span>
                    <span className="font-medium">
                      {project.contract_date 
                        ? new Date(project.contract_date).toLocaleDateString('ko-KR') 
                        : '미정'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">종료일</span>
                    <span className="font-medium">
                      {project.due_date 
                        ? new Date(project.due_date).toLocaleDateString('ko-KR') 
                        : '미정'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              생성 정보
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">생성일</span>
                <span className="font-medium">
                  {new Date(project.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">수정일</span>
                <span className="font-medium">
                  {new Date(project.updated_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 견적 정보 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            견적 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="estimate_amount" className="text-sm font-medium">견적 금액</Label>
                  <Input
                    id="estimate_amount"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.estimate_amount || ''}
                    onChange={(e) => handleInputChange('estimate_amount', e.target.value)}
                    disabled={isLoading}
                    placeholder="견적 금액을 입력하세요 (원)"
                  />
                </div>
                <div>
                  <Label htmlFor="estimate_note" className="text-sm font-medium">견적 비고</Label>
                  <Textarea
                    id="estimate_note"
                    value={formData.estimate_note || ''}
                    onChange={(e) => handleInputChange('estimate_note', e.target.value)}
                    disabled={isLoading}
                    rows={2}
                    placeholder="견적에 대한 추가 정보를 입력하세요"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">견적 금액</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.estimate_amount ? `${project.estimate_amount}원` : '미정'}
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">견적 비고</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.estimate_note || '없음'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 팀 정보 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2" />
              팀 구성
            </h3>
            {isEditing && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="team_size" className="text-sm font-medium">팀 크기</Label>
                <Input
                  id="team_size"
                  type="number"
                  min="1"
                  value={formData.team_size}
                  onChange={(e) => handleInputChange('team_size', parseInt(e.target.value))}
                  disabled={isLoading}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">명</span>
              </div>
            )}
          </div>
          {!isEditing && (
            <h4 className="text-sm text-muted-foreground">({project.team_size}명)</h4>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{member.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            추가 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">프로젝트 ID</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{project.id}</p>
            </div>
                         <div className="p-3 border rounded-lg">
               <div className="flex items-center space-x-2">
                 <User className="w-4 h-4 text-muted-foreground" />
                 <span className="text-sm font-medium">생성자</span>
               </div>
               <p className="text-sm text-muted-foreground mt-1">{project.created_by_name}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={handleClose}>
              닫기
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              편집
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}
