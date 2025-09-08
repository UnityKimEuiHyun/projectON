import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Edit3,
  Trash2,
  Save,
  X,
  FileText,
  Calendar,
  Tag,
  Filter
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 임시 노트 데이터 타입
interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  isPinned: boolean
}

// 임시 목업 데이터
const mockNotes: Note[] = [
  {
    id: "1",
    title: "프로젝트 회의록",
    content: "오늘 프로젝트 회의에서 논의된 주요 사항들:\n- 일정 조정 필요\n- 예산 검토 완료\n- 다음 주까지 WBS 완성",
    tags: ["회의", "프로젝트", "일정"],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
    isPinned: true
  },
  {
    id: "2",
    title: "개발 아이디어",
    content: "새로운 기능 아이디어:\n- 실시간 알림 시스템\n- 대시보드 개선\n- 모바일 앱 개발",
    tags: ["개발", "아이디어", "기능"],
    createdAt: "2024-01-14",
    updatedAt: "2024-01-14",
    isPinned: false
  },
  {
    id: "3",
    title: "학습 노트",
    content: "React Query 학습 내용:\n- useQuery 훅 사용법\n- 캐싱 전략\n- 에러 처리 방법",
    tags: ["학습", "React", "Query"],
    createdAt: "2024-01-13",
    updatedAt: "2024-01-13",
    isPinned: false
  },
  {
    id: "4",
    title: "할 일 목록",
    content: "이번 주 해야 할 일들:\n- 코드 리뷰 완료\n- 문서 작성\n- 테스트 케이스 작성",
    tags: ["할일", "업무", "우선순위"],
    createdAt: "2024-01-12",
    updatedAt: "2024-01-12",
    isPinned: true
  }
]

const PersonalNotes = () => {
  const [notes, setNotes] = useState<Note[]>(mockNotes)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("전체")
  const [isCreating, setIsCreating] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: [] as string[]
  })

  // 모든 태그 추출
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)))

  // 필터링된 노트
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = selectedTag === "전체" || note.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  // 고정된 노트를 먼저, 그 다음 최신순으로 정렬
  const sortedNotes = filteredNotes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  const handleCreateNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isPinned: false
      }
      setNotes(prev => [note, ...prev])
      setNewNote({ title: "", content: "", tags: [] })
      setIsCreating(false)
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags
    })
  }

  const handleUpdateNote = () => {
    if (editingNote && newNote.title.trim() && newNote.content.trim()) {
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id 
          ? { ...note, title: newNote.title, content: newNote.content, tags: newNote.tags, updatedAt: new Date().toISOString().split('T')[0] }
          : note
      ))
      setEditingNote(null)
      setNewNote({ title: "", content: "", tags: [] })
    }
  }

  const handleDeleteNote = (id: string) => {
    if (window.confirm("정말로 이 노트를 삭제하시겠습니까?")) {
      setNotes(prev => prev.filter(note => note.id !== id))
    }
  }

  const handleTogglePin = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ))
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingNote(null)
    setNewNote({ title: "", content: "", tags: [] })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">개인 노트</h1>
          <p className="text-muted-foreground">개인적인 메모와 아이디어를 정리하세요</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          새 노트
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="노트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {selectedTag}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedTag("전체")}>전체</DropdownMenuItem>
            {allTags.map(tag => (
              <DropdownMenuItem key={tag} onClick={() => setSelectedTag(tag)}>
                {tag}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingNote) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingNote ? "노트 수정" : "새 노트 작성"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="노트 제목"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="노트 내용을 입력하세요..."
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
            />
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">태그: </span>
              {newNote.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="mr-1">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                취소
              </Button>
              <Button onClick={editingNote ? handleUpdateNote : handleCreateNote}>
                <Save className="w-4 h-4 mr-2" />
                {editingNote ? "수정" : "저장"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    {note.isPinned && (
                      <Badge variant="default" className="text-xs">고정</Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {note.content.length > 100 
                      ? `${note.content.substring(0, 100)}...` 
                      : note.content
                    }
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleEditNote(note)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTogglePin(note.id)}>
                      {note.isPinned ? "고정 해제" : "고정"}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {note.updatedAt}
                </div>
                <div className="flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  {note.content.length}자
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedNotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm || selectedTag !== "전체" 
              ? "검색 조건에 맞는 노트가 없습니다." 
              : "아직 작성된 노트가 없습니다."}
          </p>
          {!searchTerm && selectedTag === "전체" && (
            <Button 
              className="mt-4" 
              onClick={() => setIsCreating(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              첫 번째 노트 작성하기
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default PersonalNotes

