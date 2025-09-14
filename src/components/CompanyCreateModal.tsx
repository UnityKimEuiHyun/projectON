import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Building2, Loader2, CheckCircle, XCircle, Search } from "lucide-react"
import { createCompany, checkCompanyNameExists } from "@/services/companyService"

interface CompanyCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompanyCreated: () => void
}

export default function CompanyCreateModal({ 
  open, 
  onOpenChange, 
  onCompanyCreated 
}: CompanyCreateModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)
  const [nameCheckStatus, setNameCheckStatus] = useState<'none' | 'checking' | 'available' | 'duplicate'>('none')
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast({
        title: "입력 오류",
        description: "기업명을 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    // 중복확인을 완료하지 않은 경우
    if (nameCheckStatus !== 'available') {
      toast({
        title: "중복확인 필요",
        description: "기업명 중복확인을 완료해주세요.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      // API 호출로 기업 등록
      const company = await createCompany(formData)

      toast({
        title: "기업 등록 완료",
        description: `${formData.name}이(가) 성공적으로 등록되었습니다.`,
      })

      // 폼 초기화
      setFormData({ name: "", description: "" })
      onOpenChange(false)
      onCompanyCreated()
      
    } catch (error) {
      console.error('기업 등록 오류:', error)
      
      let errorMessage = "기업 등록 중 오류가 발생했습니다."
      
      if (error instanceof Error) {
        if (error.message.includes('이미 존재하는 기업명')) {
          errorMessage = error.message
        } else if (error.message.includes('기업 생성 실패')) {
          errorMessage = error.message
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "등록 실패",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 기업명이 변경되면 중복확인 상태 초기화
    if (field === 'name') {
      setNameCheckStatus('none')
    }
  }

  // 모달이 열릴 때 상태 초기화
  React.useEffect(() => {
    if (open) {
      setFormData({ name: "", description: "" })
      setNameCheckStatus('none')
    }
  }, [open])

  const handleCheckDuplicate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "입력 오류",
        description: "기업명을 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    setIsCheckingDuplicate(true)
    setNameCheckStatus('checking')

    try {
      const exists = await checkCompanyNameExists(formData.name.trim())
      
      if (exists) {
        setNameCheckStatus('duplicate')
        toast({
          title: "중복 확인",
          description: "이미 존재하는 기업명입니다.",
          variant: "destructive"
        })
      } else {
        setNameCheckStatus('available')
        toast({
          title: "중복 확인",
          description: "사용 가능한 기업명입니다.",
        })
      }
    } catch (error) {
      console.error('중복 확인 오류:', error)
      setNameCheckStatus('none')
      toast({
        title: "확인 실패",
        description: "중복 확인 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsCheckingDuplicate(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            신규기업 등록
          </DialogTitle>
          <DialogDescription>
            새로운 기업을 등록하고 소속을 설정하세요.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">기업명 *</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  id="company-name"
                  placeholder="기업명을 입력하세요"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isLoading}
                  required
                  className={`pr-10 ${
                    nameCheckStatus === 'available' ? 'border-green-500' : 
                    nameCheckStatus === 'duplicate' ? 'border-red-500' : ''
                  }`}
                />
                {nameCheckStatus === 'available' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {nameCheckStatus === 'duplicate' && (
                  <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              <Button
                type="button"
                variant={nameCheckStatus === 'available' ? "default" : "outline"}
                onClick={handleCheckDuplicate}
                disabled={isLoading || isCheckingDuplicate || !formData.name.trim()}
                className={`px-4 whitespace-nowrap ${
                  nameCheckStatus === 'available' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : ''
                }`}
              >
                {isCheckingDuplicate ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    확인 중...
                  </>
                ) : nameCheckStatus === 'available' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    확인완료
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    중복확인
                  </>
                )}
              </Button>
            </div>
            {nameCheckStatus === 'available' && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                사용 가능한 기업명입니다.
              </p>
            )}
            {nameCheckStatus === 'duplicate' && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                이미 존재하는 기업명입니다.
              </p>
            )}
            {nameCheckStatus === 'none' && formData.name.trim() && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <Search className="w-3 h-3" />
                중복확인을 완료해주세요.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-description">기업 설명</Label>
            <Textarea
              id="company-description"
              placeholder="기업에 대한 간단한 설명을 입력하세요 (선택사항)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim() || nameCheckStatus !== 'available'}
              className={nameCheckStatus !== 'available' && formData.name.trim() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  {nameCheckStatus === 'available' ? '기업 등록' : '중복확인 필요'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
