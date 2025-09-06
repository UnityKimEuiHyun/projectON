import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, User, Mail, Phone, Building2, ExternalLink } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'

export default function ProfileEdit() {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalData, setOriginalData] = useState({
    display_name: '',
    email: '',
    phone: ''
  })
  const [userCompany, setUserCompany] = useState<{ name: string; description: string } | null>(null)

  // 폼 데이터 초기화
  useEffect(() => {
    if (userProfile) {
      const initialData = {
        display_name: userProfile.display_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || ''
      }
      setFormData(initialData)
      setOriginalData(initialData)
      setHasUnsavedChanges(false)
    }
  }, [userProfile])

  // 로그인 상태 확인
  useEffect(() => {
    if (!user) {
      navigate('/auth')
    }
  }, [user, navigate])

  // 사용자 소속 기업 정보 가져오기
  useEffect(() => {
    const loadUserCompany = async () => {
      if (!user) return
      
      try {
        const { data: affiliations, error } = await supabase
          .from('group_members')
          .select(`
            groups (
              id,
              name,
              description,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
        
        if (error) {
          console.error('❌ 소속 기업 정보 가져오기 실패:', error)
          return
        }
        
        const affiliationsData = affiliations?.map(item => item.groups).filter(Boolean) || []
        if (affiliationsData.length > 0) {
          setUserCompany({
            name: affiliationsData[0].name,
            description: affiliationsData[0].description || ''
          })
        }
      } catch (error) {
        console.error('❌ 소속 기업 정보 가져오기 실패:', error)
      }
    }

    loadUserCompany()
  }, [user])

  // 페이지 떠날 때 경고 메시지
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = '저장하지 않은 변경사항이 있습니다. 정말로 페이지를 떠나시겠습니까?'
        return '저장하지 않은 변경사항이 있습니다. 정말로 페이지를 떠나시겠습니까?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 변경사항이 있는지 확인
    const newData = { ...formData, [field]: value }
    const hasChanges = newData.display_name !== originalData.display_name ||
                      newData.email !== originalData.email ||
                      newData.phone !== originalData.phone
    setHasUnsavedChanges(hasChanges)
  }

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // 먼저 기존 프로필이 있는지 확인
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      let error = null

      if (existingProfile) {
        // 기존 프로필이 있으면 업데이트
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            display_name: formData.display_name.trim() || null,
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
        
        error = updateError
      } else {
        // 기존 프로필이 없으면 새로 생성
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: formData.display_name.trim() || null,
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        error = insertError
      }

      if (error) {
        console.error('❌ 프로필 업데이트 실패:', error)
        throw new Error(`프로필 업데이트에 실패했습니다: ${error.message}`)
      }

      toast({
        title: "성공",
        description: "개인정보가 성공적으로 수정되었습니다.",
      })

      // 프로필 정보 새로고침
      if (refreshUserProfile) {
        await refreshUserProfile()
      }

      // 변경사항 저장 완료
      setHasUnsavedChanges(false)
      setOriginalData(formData)

      // 페이지에서 벗어나지 않고 현재 페이지에 머무름

    } catch (error) {
      console.error('❌ 개인정보 수정 실패:', error)
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "개인정보 수정에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const shouldNavigate = window.confirm(
        '저장하지 않은 변경사항이 있습니다. 정말로 페이지를 떠나시겠습니까?\n\n변경사항은 저장되지 않습니다.'
      )
      if (!shouldNavigate) {
        return
      }
    }
    navigate('/')
  }

  const handleNavigateToTeam = () => {
    if (hasUnsavedChanges) {
      const shouldNavigate = window.confirm(
        '저장하지 않은 변경사항이 있습니다. 정말로 페이지를 떠나시겠습니까?\n\n변경사항은 저장되지 않습니다.'
      )
      if (!shouldNavigate) {
        return
      }
    }
    navigate('/team')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>뒤로가기</span>
          </Button>
          <h1 className="text-2xl font-bold">개인정보 수정</h1>
        </div>

        {/* 개인정보 수정 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>기본 정보</span>
            </CardTitle>
            <CardDescription>
              개인정보를 수정하고 저장하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="display_name" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>이름</span>
              </Label>
              <Input
                id="display_name"
                type="text"
                placeholder="이름을 입력하세요"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                className="w-full"
              />
            </div>

            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>이메일</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full"
              />
            </div>

                         {/* 전화번호 */}
             <div className="space-y-2">
               <Label htmlFor="phone" className="flex items-center space-x-2">
                 <Phone className="w-4 h-4" />
                 <span>전화번호</span>
               </Label>
               <Input
                 id="phone"
                 type="tel"
                 placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
                 value={formData.phone}
                 onChange={(e) => handleInputChange('phone', e.target.value)}
                 className="w-full"
               />
             </div>

             {/* 소속 기업 정보 */}
             <div className="space-y-2">
               <Label className="flex items-center space-x-2">
                 <Building2 className="w-4 h-4" />
                 <span>소속 기업</span>
               </Label>
                                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                   <div className="flex items-center space-x-2">
                     <Building2 className="w-4 h-4 text-muted-foreground" />
                     <span className="text-sm text-muted-foreground">
                       {userCompany ? userCompany.name : '소속된 기업이 없습니다'}
                     </span>
                   </div>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={handleNavigateToTeam}
                     className="flex items-center space-x-2"
                   >
                     <ExternalLink className="w-3 h-3" />
                     <span>소속 변경</span>
                   </Button>
                 </div>
             </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSaving}
              >
                취소
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? '저장 중...' : '저장'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
