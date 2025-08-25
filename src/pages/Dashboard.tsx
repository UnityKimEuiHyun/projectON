import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FolderOpen, 
  Users, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Calendar
} from "lucide-react"

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">프로젝트 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 프로젝트</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 지난 달 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">팀 멤버</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              활성 멤버
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 작업</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              이번 달
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              평균 완성률
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>진행 중인 프로젝트</CardTitle>
            <CardDescription>현재 활발히 진행되고 있는 프로젝트들</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">웹사이트 리뉴얼</h4>
                  <p className="text-sm text-muted-foreground">UI/UX 개선 작업</p>
                </div>
                <Badge variant="secondary">진행중</Badge>
              </div>
              <Progress value={65} className="h-2" />
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                마감: 2024년 1월 15일
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">모바일 앱 개발</h4>
                  <p className="text-sm text-muted-foreground">크로스 플랫폼 앱</p>
                </div>
                <Badge variant="secondary">진행중</Badge>
              </div>
              <Progress value={40} className="h-2" />
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                마감: 2024년 2월 28일
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">데이터베이스 최적화</h4>
                  <p className="text-sm text-muted-foreground">성능 개선 작업</p>
                </div>
                <Badge variant="outline">대기중</Badge>
              </div>
              <Progress value={20} className="h-2" />
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                마감: 2024년 1월 30일
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>팀의 최근 작업 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">김개발</span>이 
                    <span className="font-medium"> 로그인 기능</span>을 완료했습니다
                  </p>
                  <p className="text-xs text-muted-foreground">2시간 전</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">이디자인</span>이 
                    <span className="font-medium"> 메인 페이지 디자인</span>을 업데이트했습니다
                  </p>
                  <p className="text-xs text-muted-foreground">4시간 전</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">박기획</span>이 
                    <span className="font-medium"> 새 기획안</span>을 공유했습니다
                  </p>
                  <p className="text-xs text-muted-foreground">6시간 전</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">최테스트</span>가 
                    <span className="font-medium"> 버그 리포트</span>를 작성했습니다
                  </p>
                  <p className="text-xs text-muted-foreground">1일 전</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard