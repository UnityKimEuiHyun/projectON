import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Download,
  Trash2,
  Save
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

const Settings = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    projectUpdates: true,
    taskAssignments: true,
    reminders: true
  })
  const [theme, setTheme] = useState('system')
  const [language, setLanguage] = useState('ko')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground">계정 및 애플리케이션 설정을 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              프로필 설정
            </CardTitle>
            <CardDescription>
              개인 정보와 계정 설정을 관리하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium">{user?.user_metadata?.display_name || user?.email}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Button variant="outline" size="sm">프로필 사진 변경</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">표시 이름</Label>
                <Input 
                  id="display-name" 
                  defaultValue={user?.user_metadata?.display_name || ''}
                  placeholder="표시할 이름을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input 
                  id="email" 
                  value={user?.email || ''}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  이메일 주소는 변경할 수 없습니다.
                </p>
              </div>
            </div>

            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              변경사항 저장
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              알림 설정
            </CardTitle>
            <CardDescription>
              알림 방법과 종류를 설정하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>이메일 알림</Label>
                <p className="text-sm text-muted-foreground">
                  이메일로 알림을 받습니다
                </p>
              </div>
              <Switch 
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>푸시 알림</Label>
                <p className="text-sm text-muted-foreground">
                  브라우저 푸시 알림을 받습니다
                </p>
              </div>
              <Switch 
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">프로젝트 업데이트</Label>
                <Switch 
                  checked={notifications.projectUpdates}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, projectUpdates: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">작업 할당</Label>
                <Switch 
                  checked={notifications.taskAssignments}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, taskAssignments: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">일정 알림</Label>
                <Switch 
                  checked={notifications.reminders}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, reminders: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              외관 설정
            </CardTitle>
            <CardDescription>
              테마와 언어 설정을 관리하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>테마</Label>
              <div className="flex space-x-2">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  라이트
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  다크
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTheme('system')}
                >
                  시스템
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>언어</Label>
              <div className="flex space-x-2">
                <Button 
                  variant={language === 'ko' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLanguage('ko')}
                >
                  한국어
                </Button>
                <Button 
                  variant={language === 'en' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLanguage('en')}
                >
                  English
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              보안 설정
            </CardTitle>
            <CardDescription>
              계정 보안을 관리하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Globe className="w-4 h-4 mr-2" />
              비밀번호 변경
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              데이터 내보내기
            </Button>
            
            <Separator />
            
            <Button variant="destructive" className="w-full justify-start">
              <Trash2 className="w-4 h-4 mr-2" />
              계정 삭제
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Settings 