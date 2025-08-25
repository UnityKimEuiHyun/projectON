import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import { ko } from "date-fns/locale"

const mockEvents = [
  {
    id: 1,
    title: "프로젝트 킥오프 미팅",
    date: "2024-01-15",
    type: "meeting",
    description: "새 프로젝트 시작을 위한 킥오프 미팅"
  },
  {
    id: 2,
    title: "디자인 리뷰",
    date: "2024-01-18",
    type: "review",
    description: "UI/UX 디자인 리뷰 세션"
  },
  {
    id: 3,
    title: "코드 리뷰",
    date: "2024-01-20",
    type: "review",
    description: "주요 기능 코드 리뷰"
  },
  {
    id: 4,
    title: "클라이언트 미팅",
    date: "2024-01-25",
    type: "meeting",
    description: "클라이언트와의 정기 미팅"
  },
  {
    id: 5,
    title: "프로젝트 마감",
    date: "2024-01-30",
    type: "deadline",
    description: "1월 프로젝트 마감일"
  }
]

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(event => 
      isSameDay(new Date(event.date), date)
    )
  }

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "meeting":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">미팅</Badge>
      case "review":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">리뷰</Badge>
      case "deadline":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">마감</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">캘린더</h1>
          <p className="text-muted-foreground">프로젝트 일정과 이벤트를 관리하세요</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          이벤트 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">
                    {format(currentDate, 'yyyy년 M월', { locale: ko })}
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
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
            </CardContent>
          </Card>
        </div>

        {/* Events Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>오늘의 이벤트</CardTitle>
              <CardDescription>
                {selectedDate ? format(selectedDate, 'yyyy년 M월 d일', { locale: ko }) : '날짜를 선택하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDate && getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    {getEventTypeBadge(event.type)}
                  </div>
                </div>
              ))}
              {selectedDate && getEventsForDate(selectedDate).length === 0 && (
                <p className="text-sm text-muted-foreground">이 날짜에 예정된 이벤트가 없습니다.</p>
              )}
              {!selectedDate && (
                <p className="text-sm text-muted-foreground">캘린더에서 날짜를 선택하세요.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>이번 달 이벤트</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockEvents
                .filter(event => isSameMonth(new Date(event.date), currentDate))
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Calendar 