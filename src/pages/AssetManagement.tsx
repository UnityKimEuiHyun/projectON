import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Building2, 
  DollarSign,
  Package,
  Truck,
  Settings,
  Edit,
  Trash2,
  Filter
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Asset {
  id: string
  name: string
  category: string
  value: number
  purchaseDate: string
  status: 'active' | 'maintenance' | 'disposed'
  location: string
  description: string
}

const AssetManagement = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("전체")
  
  // 목업 데이터
  const mockAssets: Asset[] = [
    {
      id: "1",
      name: "노트북 컴퓨터",
      category: "IT 장비",
      value: 1500000,
      purchaseDate: "2024-01-15",
      status: "active",
      location: "본사 3층",
      description: "개발팀 업무용 노트북"
    },
    {
      id: "2", 
      name: "프로젝터",
      category: "오피스 장비",
      value: 800000,
      purchaseDate: "2024-02-20",
      status: "active",
      location: "회의실 A",
      description: "프레젠테이션용 프로젝터"
    },
    {
      id: "3",
      name: "사무용 책상",
      category: "가구",
      value: 300000,
      purchaseDate: "2024-03-10",
      status: "maintenance",
      location: "본사 2층",
      description: "직원용 사무용 책상"
    },
    {
      id: "4",
      name: "회의용 테이블",
      category: "가구", 
      value: 500000,
      purchaseDate: "2023-12-05",
      status: "active",
      location: "회의실 B",
      description: "대형 회의용 테이블"
    }
  ]

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === "전체" || asset.status === filter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "disposed":
        return "bg-red-100 text-red-800"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "사용중"
      case "maintenance":
        return "정비중"
      case "disposed":
        return "폐기"
      default:
        return status
    }
  }

  const totalValue = mockAssets.reduce((sum, asset) => sum + asset.value, 0)
  const activeAssets = mockAssets.filter(asset => asset.status === 'active').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">재산 관리</h1>
          <p className="text-muted-foreground">회사 자산을 체계적으로 관리하세요</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          자산 등록
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 자산 수</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAssets.length}</div>
            <p className="text-xs text-muted-foreground">
              등록된 자산 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">사용 중인 자산</CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAssets}</div>
            <p className="text-xs text-muted-foreground">
              현재 사용 가능한 자산
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 자산 가치</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalValue.toLocaleString()}원
            </div>
            <p className="text-xs text-muted-foreground">
              전체 자산의 총 가치
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="자산명, 카테고리, 위치로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {filter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter("전체")}>전체</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("active")}>사용중</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("maintenance")}>정비중</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("disposed")}>폐기</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 자산 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{asset.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {asset.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(asset.status)}>
                    {getStatusText(asset.status)}
                  </Badge>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {asset.value.toLocaleString()}원
                    </div>
                    <div className="text-xs text-muted-foreground">
                      구매가
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">카테고리</span>
                    <span className="font-medium">{asset.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">위치</span>
                    <span className="font-medium">{asset.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">구매일</span>
                    <span className="font-medium">
                      {new Date(asset.purchaseDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm || filter !== "전체" 
              ? "검색 조건에 맞는 자산이 없습니다." 
              : "등록된 자산이 없습니다."}
          </p>
        </div>
      )}
    </div>
  )
}

export default AssetManagement
