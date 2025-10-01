import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Calendar, 
  Upload, 
  File, 
  X,
  Check
} from "lucide-react"

// WBS 작업 타입
export interface WBSTask {
  id: string
  name: string
  level: number
  startDate: string
  endDate: string
  assignee: string
  assigneeId?: string
  status: string
  progress: number
  description?: string
  attachments?: AttachmentFile[]
  deliverables?: AttachmentFile[] // 최종 산출물
  children?: WBSTask[]
}

export interface AttachmentFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadedAt: string
}

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  task: WBSTask | null
  companyMembers?: any[]
  onTaskUpdate?: (task: WBSTask) => void
  allTasks?: WBSTask[] // 모든 작업 목록 (상위/하위 작업 찾기용)
  onNavigateToTask?: (taskId: string) => void // 다른 작업으로 이동하는 함수
}

export default function TaskDetailModal({ 
  isOpen, 
  onClose, 
  task, 
  companyMembers = [],
  onTaskUpdate,
  allTasks = [],
  onNavigateToTask
}: TaskDetailModalProps) {
  const [editingTask, setEditingTask] = useState<WBSTask | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // 모달이 열릴 때 편집용 데이터 초기화
  useEffect(() => {
    if (task) {
      setEditingTask({ ...task })
      setEditingField(null)
    }
  }, [task])

  // 필드 편집 시작
  const startEditingField = (field: string) => {
    setEditingField(field)
  }

  // 필드 편집 취소
  const cancelEditingField = () => {
    if (task) {
      setEditingTask({ ...task })
    }
    setEditingField(null)
  }

  // 작업 필드 업데이트
  const updateTaskField = (field: keyof WBSTask, value: any) => {
    if (editingTask) {
      setEditingTask({ ...editingTask, [field]: value })
    }
  }

  // 필드 저장
  const saveField = (field: string) => {
    if (editingTask && onTaskUpdate) {
      onTaskUpdate(editingTask)
    }
    setEditingField(null)
  }

  // 진행률 색상 함수
  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500'
    if (progress > 0) return 'bg-blue-500'
    return 'bg-gray-400'
  }

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 파일 업로드 처리
  const handleFileUpload = (files: FileList) => {
    if (!editingTask) return

    const newAttachments: AttachmentFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    }))

    const updatedAttachments = [...(editingTask.attachments || []), ...newAttachments]
    updateTaskField('attachments', updatedAttachments)
  }

  // 파일 삭제
  const removeAttachment = (attachmentId: string) => {
    if (!editingTask) return

    const updatedAttachments = editingTask.attachments?.filter(att => att.id !== attachmentId) || []
    updateTaskField('attachments', updatedAttachments)
  }

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  // 상위 작업 찾기
  const findParentTask = (taskId: string, tasks: WBSTask[]): WBSTask | null => {
    for (const task of tasks) {
      if (task.children) {
        for (const child of task.children) {
          if (child.id === taskId) {
            return task
          }
          // 재귀적으로 하위 작업에서도 찾기
          const found = findParentTask(taskId, [child])
          if (found) return found
        }
      }
    }
    return null
  }

  // 계층 구조에서 작업을 찾는 함수
  const findTaskById = (tasks: WBSTask[], taskId: string): WBSTask | null => {
    for (const task of tasks) {
      if (task.id === taskId) {
        return task
      }
      if (task.children) {
        const found = findTaskById(task.children, taskId)
        if (found) return found
      }
    }
    return null
  }

  // 하위 작업 찾기
  const findChildTasks = (taskId: string, tasks: WBSTask[]): WBSTask[] => {
    const task = findTaskById(tasks, taskId)
    return task?.children || []
  }

  // 상태 색상 함수
  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료':
        return 'bg-green-100 text-green-800'
      case '진행중':
        return 'bg-blue-100 text-blue-800'
      case '보류':
        return 'bg-yellow-100 text-yellow-800'
      case '취소':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!task || !editingTask) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[1200px] h-[900px] max-w-none max-h-none overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>작업 상세 정보</DialogTitle>
              <DialogDescription>
                필드를 클릭하여 편집할 수 있습니다. 변경사항은 자동으로 저장됩니다.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex gap-6">
          {/* 좌측 섹션: 제목과 작업 내용 */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex-shrink-0">작업 정보</h3>
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 mt-4">
              
              {/* 작업명 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">작업명 *</label>
                {editingField === 'name' ? (
                  <div className="space-y-2">
                    <Input
                      value={editingTask.name}
                      onChange={(e) => updateTaskField('name', e.target.value)}
                      placeholder="작업명을 입력하세요"
                      className="text-lg"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => {
                        setEditingField(null)
                        saveField('name')
                      }}>
                        저장
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditingField}>
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`text-lg font-medium px-3 py-2 rounded ${
                      'bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors'
                    }`}
                    onClick={() => startEditingField('name')}
                  >
                    {editingTask.name}
                  </div>
                )}
              </div>

              {/* 작업 내용 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">작업 내용</label>
                {editingField === 'description' ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingTask.description || ''}
                      onChange={(e) => updateTaskField('description', e.target.value)}
                      placeholder="작업에 대한 상세 내용을 입력하세요"
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => {
                        setEditingField(null)
                        saveField('description')
                      }}>
                        저장
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditingField}>
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`px-3 py-2 rounded min-h-[8rem] whitespace-pre-wrap ${
                      'bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors'
                    }`}
                    onClick={() => startEditingField('description')}
                  >
                    {editingTask.description || "작업 내용이 없습니다. 클릭하여 추가하세요."}
                  </div>
                )}
              </div>
            </div>

            {/* 첨부 파일 섹션 */}
            <div className="flex flex-col h-80">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex-shrink-0">첨부 파일</h3>
                
                <div className="flex-1 flex flex-col space-y-4 overflow-hidden mt-4">
                  {/* 파일 업로드 영역 */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-2 text-center transition-colors flex-shrink-0 ${
                      isDragOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-600 mb-1">
                      파일을 드래그하여 놓거나 클릭하여 선택하세요
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="text-xs px-2 py-1 h-6"
                    >
                      파일 선택
                    </Button>
                  </div>

                  {/* 첨부 파일 목록 */}
                  <div className="flex-1 overflow-hidden">
                    {editingTask.attachments && editingTask.attachments.length > 0 ? (
                      <div className="space-y-2 h-full flex flex-col">
                        <h4 className="text-sm font-medium text-gray-700 flex-shrink-0">첨부된 파일</h4>
                        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                          {editingTask.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(attachment.size)} • {attachment.type}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(attachment.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                                title="삭제"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                        첨부된 파일이 없습니다
                      </div>
                    )}
                  </div>
                </div>
              </div>
          </div>

          {/* 우측 섹션: 상세 정보 */}
          <div className="w-80 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex-shrink-0">상세 정보</h3>
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 mt-4">
            
            {/* ID */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">ID</label>
                <div className="text-sm font-mono bg-gray-100 px-3 py-2 rounded">
                  {editingTask.id}
                </div>
              </div>
            </div>

            {/* 진행률과 상태 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">진행률</label>
                {editingField === 'progress' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(editingTask.progress)}`}
                        style={{ width: `${editingTask.progress}%` }}
                      />
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editingTask.progress}
                      onChange={(e) => updateTaskField('progress', parseInt(e.target.value) || 0)}
                      onBlur={() => {
                        setEditingField(null)
                        saveField('progress')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingField(null)
                          saveField('progress')
                        }
                        if (e.key === 'Escape') {
                          cancelEditingField()
                        }
                      }}
                      className="w-16 text-center"
                      autoFocus
                    />
                    <span className="text-sm font-medium">%</span>
                  </div>
                ) : (
                  <div 
                    className={`flex items-center gap-2 p-2 rounded transition-colors ${
                      'cursor-pointer hover:bg-gray-50'
                    }`}
                    onClick={() => startEditingField('progress')}
                  >
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(editingTask.progress)}`}
                        style={{ width: `${editingTask.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{editingTask.progress}%</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">상태</label>
                <Select
                  value={editingTask.status}
                  onValueChange={(value) => {
                    updateTaskField('status', value)
                    saveField('status')
                  }}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="대기">대기</SelectItem>
                    <SelectItem value="진행중">진행중</SelectItem>
                    <SelectItem value="완료">완료</SelectItem>
                    <SelectItem value="보류">보류</SelectItem>
                    <SelectItem value="취소">취소</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 날짜 정보 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">시작일</label>
                {editingField === 'startDate' ? (
                  <Input
                    type="date"
                    value={editingTask.startDate}
                    onChange={(e) => updateTaskField('startDate', e.target.value)}
                    onBlur={() => {
                      setEditingField(null)
                      saveField('startDate')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingField(null)
                        saveField('startDate')
                      }
                      if (e.key === 'Escape') {
                        cancelEditingField()
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <div 
                    className={`flex items-center gap-2 p-2 rounded transition-colors ${
                      'cursor-pointer hover:bg-gray-50'
                    }`}
                    onClick={() => startEditingField('startDate')}
                  >
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{editingTask.startDate}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">종료일</label>
                {editingField === 'endDate' ? (
                  <Input
                    type="date"
                    value={editingTask.endDate}
                    onChange={(e) => updateTaskField('endDate', e.target.value)}
                    onBlur={() => {
                      setEditingField(null)
                      saveField('endDate')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingField(null)
                        saveField('endDate')
                      }
                      if (e.key === 'Escape') {
                        cancelEditingField()
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <div 
                    className={`flex items-center gap-2 p-2 rounded transition-colors ${
                      'cursor-pointer hover:bg-gray-50'
                    }`}
                    onClick={() => startEditingField('endDate')}
                  >
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{editingTask.endDate}</span>
                  </div>
                )}
              </div>
            </div>

             {/* 담당자 정보 */}
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-500">담당자</label>
               <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                 <User className="w-4 h-4 text-gray-400" />
                 <span className="text-sm">{editingTask.assignee}</span>
               </div>
             </div>

             {/* 상위 작업 */}
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-500">상위 작업</label>
               <div className="text-sm bg-gray-100 px-3 py-2 rounded">
                 {(() => {
                   const parentTask = findParentTask(editingTask.id, allTasks)
                   return parentTask ? (
                     <div 
                       className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-1 rounded transition-colors"
                       onClick={() => onNavigateToTask?.(parentTask.id)}
                     >
                       <span className="font-mono text-xs">{parentTask.id}</span>
                       <span className="flex-1 truncate">{parentTask.name}</span>
                       <Badge className={getStatusColor(parentTask.status)} variant="outline">
                         {parentTask.status}
                       </Badge>
                       <span className="text-xs text-gray-500">{parentTask.progress}%</span>
                     </div>
                   ) : (
                     "상위 작업 없음"
                   )
                 })()}
               </div>
             </div>

             {/* 하위 작업 */}
             {(() => {
               const childTasks = findChildTasks(editingTask.id, allTasks)
               return childTasks.length > 0 && (
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-500">하위 작업</label>
                   <div className="space-y-1 max-h-32 overflow-y-auto">
                     {childTasks.map((child) => (
                       <div 
                         key={child.id} 
                         className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                         onClick={() => onNavigateToTask?.(child.id)}
                       >
                         <span className="font-mono text-xs">{child.id}</span>
                         <span className="flex-1 truncate">{child.name}</span>
                         <Badge className={getStatusColor(child.status)} variant="outline">
                           {child.status}
                         </Badge>
                         <span className="text-xs text-gray-500">{child.progress}%</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )
             })()}
             </div>
           </div>
         </div>
       </DialogContent>
     </Dialog>
   )
 }
