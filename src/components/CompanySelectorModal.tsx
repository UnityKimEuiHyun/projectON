import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Building2, Users, ArrowRight } from "lucide-react"
import { getUserCompanies } from "@/services/companyService"
import type { Company } from "@/services/companyService"

interface CompanySelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onCompanySelect: (company: Company) => void
}

export function CompanySelectorModal({ isOpen, onClose, onCompanySelect }: CompanySelectorModalProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  // 기업 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadCompanies()
    }
  }, [isOpen])

  // 검색 필터링
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCompanies(companies)
    } else {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCompanies(filtered)
    }
  }, [companies, searchTerm])

  const loadCompanies = async () => {
    setLoading(true)
    try {
      const companyList = await getUserCompanies()
      setCompanies(companyList)
    } catch (error) {
      console.error('기업 목록 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompanySelect = (company: Company) => {
    onCompanySelect(company)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            소속 기업 선택
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 검색 입력 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="기업명 또는 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 기업 목록 */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">기업 목록을 불러오는 중...</div>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "검색 결과가 없습니다" : "소속된 기업이 없습니다"}
                  </p>
                </div>
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleCompanySelect(company)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">{company.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {company.user_role}
                        </Badge>
                      </div>
                      {company.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {company.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>소속 기업</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
