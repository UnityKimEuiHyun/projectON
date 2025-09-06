import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Users, Mail, Phone, MapPin, Calendar } from "lucide-react"

export default function Organization() {
  // 임시 데이터 - 실제로는 API에서 가져올 예정
  const organization = {
    name: "테크솔루션즈 주식회사",
    description: "혁신적인 IT 솔루션을 제공하는 기업",
    industry: "정보기술",
    founded: "2020년",
    employees: 150,
    address: "서울특별시 강남구 테헤란로 123",
    email: "contact@techsolutions.co.kr",
    phone: "02-1234-5678",
    website: "https://techsolutions.co.kr"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">조직 관리</h1>
          <p className="text-muted-foreground">조직 정보를 확인하고 관리할 수 있습니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 조직 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">조직명</label>
                <p className="text-lg font-semibold">{organization.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">설명</label>
                <p className="text-sm">{organization.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{organization.industry}</Badge>
                <Badge variant="outline">{organization.founded}</Badge>
                <Badge variant="outline">{organization.employees}명</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 연락처 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              연락처 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{organization.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{organization.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{organization.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">웹사이트: {organization.website}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 조직 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              조직 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{organization.employees}</div>
                <div className="text-sm text-muted-foreground">전체 직원</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">25</div>
                <div className="text-sm text-muted-foreground">진행 프로젝트</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">완료 프로젝트</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">고객 만족도</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 빠른 액션 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
            <CardDescription>자주 사용하는 기능에 빠르게 접근할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              구성원 초대
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              조직 정보 수정
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              조직 일정 관리
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
