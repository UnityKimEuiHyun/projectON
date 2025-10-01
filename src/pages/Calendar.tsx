import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Edit, Trash2, Users, MapPin, X } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import { ko } from "date-fns/locale"
import { getCompanyMembers, getUserCompanies, type Company } from "@/services/companyService"
import { useSidebarState } from "@/hooks/useSidebarState"

interface Event {
  id: number
  title: string
  date: string
  type: "meeting" | "personal"
  description: string
  attendees?: string[]
  location?: string
}

interface CompanyMember {
  id: string
  group_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  display_name?: string
  email?: string
}

const initialEvents: Event[] = [
  {
    id: 1,
    title: "프로젝트 킥오프 미팅",
    date: "2024-01-15",
    type: "meeting",
    description: "새 프로젝트 시작을 위한 킥오프 미팅",
    attendees: ["김철수", "이영희"],
    location: "회의실 A"
  },
  {
    id: 2,
    title: "개인 업무 정리",
    date: "2024-01-18",
    type: "personal",
    description: "주간 업무 정리 및 계획 수립"
  },
  {
    id: 3,
    title: "팀 미팅",
    date: "2024-01-20",
    type: "meeting",
    description: "주간 팀 미팅",
    attendees: ["김철수", "이영희", "박민수"],
    location: "회의실 B"
  },
  {
    id: 4,
    title: "클라이언트 미팅",
    date: "2024-01-25",
    type: "meeting",
    description: "클라이언트와의 정기 미팅",
    attendees: ["김철수"],
    location: "클라이언트 사무실"
  },
  {
    id: 5,
    title: "개인 학습 시간",
    date: "2024-01-30",
    type: "personal",
    description: "새로운 기술 스택 학습"
  }
]

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    type: "personal" as Event["type"],
    description: "",
    attendees: [] as string[],
    location: ""
  })
  const [selectedFilter, setSelectedFilter] = useState<"all" | "meeting" | "personal">("all")
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([])
  const [attendeeSearch, setAttendeeSearch] = useState("")
  const [userCompanies, setUserCompanies] = useState<Company[]>([])
  const [selectedCompanyForCalendar, setSelectedCompanyForCalendar] = useState<Company | null>(null)
  const { selectedCompany } = useSidebarState()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 사용자 소속 기업 목록 로드
  useEffect(() => {
    const loadUserCompanies = async () => {
      try {
        const companies = await getUserCompanies()
        setUserCompanies(companies)
        // 기본적으로 첫 번째 기업을 선택
        if (companies.length > 0) {
          setSelectedCompanyForCalendar(companies[0])
        }
      } catch (error) {
        console.error('사용자 기업 목록 로드 실패:', error)
      }
    }
    loadUserCompanies()
  }, [])

  // 선택된 기업의 구성원 목록 로드
  useEffect(() => {
    const loadCompanyMembers = async () => {
      if (selectedCompanyForCalendar?.id) {
        try {
          console.log('캘린더에서 선택된 기업 ID:', selectedCompanyForCalendar.id)
          const members = await getCompanyMembers(selectedCompanyForCalendar.id)
          console.log('로드된 구성원:', members)
          setCompanyMembers(members)
        } catch (error) {
          console.error('구성원 목록 로드 실패:', error)
        }
      } else {
        console.log('선택된 기업이 없습니다')
        setCompanyMembers([])
      }
    }
    loadCompanyMembers()
  }, [selectedCompanyForCalendar])

  // 필터링된 구성원 목록
  const filteredMembers = companyMembers.filter(member =>
    member.display_name?.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
    member.email?.toLowerCase().includes(attendeeSearch.toLowerCase())
  )

  // 참석자 관리 함수들
  const handleAttendeeToggle = (memberName: string) => {
    setEventForm(prev => ({
      ...prev,
      attendees: prev.attendees.includes(memberName)
        ? prev.attendees.filter(name => name !== memberName)
        : [...prev.attendees, memberName]
    }))
  }

  const handleRemoveAttendee = (memberName: string) => {
    setEventForm(prev => ({
      ...prev,
      attendees: prev.attendees.filter(name => name !== memberName)
    }))
  }

  const getEventsForDate = (date: Date) => {
    let filteredEvents = events.filter(event => 
      isSameDay(new Date(event.date), date)
    )
    
    // 필터 적용
    if (selectedFilter !== "all") {
      filteredEvents = filteredEvents.filter(event => event.type === selectedFilter)
    }
    
    return filteredEvents
  }

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "meeting":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">미팅</Badge>
      case "personal":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">개인</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // 이벤트 관리 함수들
  const handleAddEvent = () => {
    setEditingEvent(null)
    setEventForm({
      title: "",
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      type: "personal",
      description: "",
      attendees: [],
      location: ""
    })
    setAttendeeSearch("")
    setIsEventModalOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      date: event.date,
      type: event.type,
      description: event.description,
      attendees: event.attendees || [],
      location: event.location || ""
    })
    setAttendeeSearch("")
    setIsEventModalOpen(true)
  }

  const handleDeleteEvent = (eventId: number) => {
    setEvents(events.filter(event => event.id !== eventId))
  }

  const handleSaveEvent = () => {
    if (!eventForm.title.trim() || !eventForm.date) return

    if (editingEvent) {
      // 수정
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...eventForm }
          : event
      ))
    } else {
      // 추가
      const newEvent: Event = {
        id: Math.max(...events.map(e => e.id), 0) + 1,
        ...eventForm
      }
      setEvents([...events, newEvent])
    }

    setIsEventModalOpen(false)
    setEventForm({ title: "", date: "", type: "personal", description: "", attendees: [], location: "" })
    setEditingEvent(null)
    setAttendeeSearch("")
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">캘린더</h1>
          <p className="text-muted-foreground">프로젝트 일정과 이벤트를 관리하세요</p>
        </div>
        
        {/* 태그 필터 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">필터:</span>
          <div className="flex gap-1">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("all")}
            >
              전체
            </Button>
            <Button
              variant={selectedFilter === "personal" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("personal")}
            >
              개인
            </Button>
            <Button
              variant={selectedFilter === "meeting" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("meeting")}
            >
              미팅
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center space-x-4">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">
                    {format(currentDate, 'yyyy년 M월', { locale: ko })}
                  </h2>
                </div>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day Headers */}
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar Days */}
                    {daysInMonth.map((day, index) => {
                      const events = getEventsForDate(day)
                      const isSelected = selectedDate && isSameDay(day, selectedDate)
                      const isCurrentMonth = isSameMonth(day, currentDate)
                      
                      return (
                        <div
                          key={index}
                          className={`
                            p-2 min-h-[80px] border border-border cursor-pointer hover:bg-muted/50
                            ${isSelected ? 'bg-primary/10 border-primary' : ''}
                            ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                          `}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className="text-sm font-medium mb-1">
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-1">
                            {events.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {events.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{events.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 오늘의 이벤트 */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">오늘의 이벤트</h3>
                      <Button 
                        size="sm" 
                        onClick={handleAddEvent}
                        className="h-8"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        추가
                      </Button>
                    </div>
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => selectedDate && setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
                        disabled={!selectedDate}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <p className="text-sm text-muted-foreground min-w-[120px] text-center">
                        {selectedDate ? format(selectedDate, 'yyyy년 M월 d일', { locale: ko }) : '날짜를 선택하세요'}
                      </p>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => selectedDate && setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
                        disabled={!selectedDate}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 이벤트 목록 */}
                  <div className="space-y-2">
                    {selectedDate && getEventsForDate(selectedDate).map(event => (
                      <div key={event.id} className="p-3 border rounded-lg group hover:bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            {event.type === "meeting" && (
                              <div className="space-y-1">
                                {event.attendees && event.attendees.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    <span>{event.attendees.join(", ")}</span>
                                  </div>
                                )}
                                {event.location && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getEventTypeBadge(event.type)}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEvent(event)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedDate && getEventsForDate(selectedDate).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        이 날짜에는 이벤트가 없습니다.
                      </p>
                    )}
                    {!selectedDate && (
                      <p className="text-sm text-muted-foreground">캘린더에서 날짜를 선택하세요.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 이번 달 이벤트 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>이번 달 이벤트</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {events
                .filter(event => {
                  const isCurrentMonth = isSameMonth(new Date(event.date), currentDate)
                  const matchesFilter = selectedFilter === "all" || event.type === selectedFilter
                  return isCurrentMonth && matchesFilter
                })
                .map(event => (
                  <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.date), 'M월 d일', { locale: ko })}
                      </div>
                    </div>
                    {getEventTypeBadge(event.type)}
                  </div>
                ))}
              {events
                .filter(event => {
                  const isCurrentMonth = isSameMonth(new Date(event.date), currentDate)
                  const matchesFilter = selectedFilter === "all" || event.type === selectedFilter
                  return isCurrentMonth && matchesFilter
                }).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {selectedFilter === "all" ? "이번 달에는 이벤트가 없습니다." : 
                   selectedFilter === "meeting" ? "이번 달에는 미팅이 없습니다." : 
                   "이번 달에는 개인 일정이 없습니다."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 이벤트 등록/수정 모달 */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? '이벤트 수정' : '새 이벤트 추가'}
            </DialogTitle>
            <DialogDescription>
              이벤트 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="이벤트 제목을 입력하세요"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">날짜</Label>
              <Input
                id="date"
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">유형</Label>
              <Select
                value={eventForm.type}
                onValueChange={(value: Event["type"]) => setEventForm({ ...eventForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">개인</SelectItem>
                  <SelectItem value="meeting">미팅</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="이벤트 설명을 입력하세요"
                rows={3}
              />
            </div>

            {/* 미팅 관련 필드들 */}
            {eventForm.type === "meeting" && (
              <>
                {/* 참석자 선택 */}
                <div className="grid gap-2">
                  <Label>참석자</Label>
                  <div className="space-y-2">
                    {/* 기업 선택 */}
                    <div className="grid gap-2">
                      <Label htmlFor="company-select">소속 기업</Label>
                      <Select
                        value={selectedCompanyForCalendar?.id || ""}
                        onValueChange={(value) => {
                          const company = userCompanies.find(c => c.id === value)
                          setSelectedCompanyForCalendar(company || null)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="기업을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {userCompanies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* 검색 입력 */}
                    <Input
                      placeholder="참석자 검색..."
                      value={attendeeSearch}
                      onChange={(e) => setAttendeeSearch(e.target.value)}
                    />
                    
                    {/* 선택된 참석자들 */}
                    {eventForm.attendees.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {eventForm.attendees.map((attendee) => (
                          <Badge key={attendee} variant="secondary" className="flex items-center gap-1">
                            {attendee}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAttendee(attendee)}
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* 구성원 목록 */}
                    <div className="max-h-32 overflow-y-auto border rounded-md">
                      {filteredMembers.map((member) => {
                        const memberName = member.display_name || member.email || 'Unknown'
                        const isSelected = eventForm.attendees.includes(memberName)
                        return (
                          <div key={member.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50">
                            <Checkbox
                              id={member.id}
                              checked={isSelected}
                              onCheckedChange={() => handleAttendeeToggle(memberName)}
                            />
                            <Label htmlFor={member.id} className="flex-1 cursor-pointer">
                              <div className="text-sm font-medium">{member.display_name || 'Unknown'}</div>
                              {member.email && (
                                <div className="text-xs text-muted-foreground">{member.email}</div>
                              )}
                            </Label>
                          </div>
                        )
                      })}
                      {filteredMembers.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          {!selectedCompanyForCalendar ? "소속 기업을 먼저 선택해주세요" :
                           attendeeSearch ? "검색 결과가 없습니다" : "구성원이 없습니다"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 미팅 장소 */}
                <div className="grid gap-2">
                  <Label htmlFor="location">미팅 장소</Label>
                  <Input
                    id="location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="미팅 장소를 입력하세요"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveEvent} disabled={!eventForm.title.trim() || !eventForm.date}>
              {editingEvent ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Calendar 