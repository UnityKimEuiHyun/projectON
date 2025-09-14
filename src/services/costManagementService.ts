import { supabase } from '@/integrations/supabase/client'
import { canManageCostPermissions } from './projectRoleService'

export interface CostManagementShare {
  id: string
  project_id: string
  shared_by_user_id: string
  shared_with_user_id: string
  permission_type: 'view' | 'edit'
  created_at: string
  updated_at: string
  shared_with_profile?: {
    display_name: string
    email: string
  }
}

export interface CreateShareData {
  project_id: string
  shared_with_user_id: string
  permission_type: 'view' | 'edit'
}

// 비용 관리 공유 목록 조회
export const getCostManagementShares = async (projectId: string): Promise<CostManagementShare[]> => {
  try {
    const { data, error } = await supabase
      .from('cost_management_shares')
      .select(`
        *,
        shared_with_profile:shared_with_user_id (
          display_name,
          email
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('비용 관리 공유 목록 조회 실패:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('비용 관리 공유 목록 조회 중 오류:', error)
    throw error
  }
}

// 비용 관리 공유 생성
export const createCostManagementShare = async (shareData: CreateShareData): Promise<CostManagementShare> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('사용자가 로그인되지 않았습니다.')
    }

    const { data, error } = await supabase
      .from('cost_management_shares')
      .insert({
        ...shareData,
        shared_by_user_id: user.id
      })
      .select(`
        *,
        shared_with_profile:shared_with_user_id (
          display_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('비용 관리 공유 생성 실패:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('비용 관리 공유 생성 중 오류:', error)
    throw error
  }
}

// 비용 관리 공유 수정
export const updateCostManagementShare = async (
  shareId: string, 
  permissionType: 'view' | 'edit'
): Promise<CostManagementShare> => {
  try {
    const { data, error } = await supabase
      .from('cost_management_shares')
      .update({ permission_type: permissionType })
      .eq('id', shareId)
      .select(`
        *,
        shared_with_profile:shared_with_user_id (
          display_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('비용 관리 공유 수정 실패:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('비용 관리 공유 수정 중 오류:', error)
    throw error
  }
}

// 비용 관리 공유 삭제
export const deleteCostManagementShare = async (shareId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cost_management_shares')
      .delete()
      .eq('id', shareId)

    if (error) {
      console.error('비용 관리 공유 삭제 실패:', error)
      throw error
    }
  } catch (error) {
    console.error('비용 관리 공유 삭제 중 오류:', error)
    throw error
  }
}

// 쿼리 타임아웃 헬퍼 함수
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`${operation} 타임아웃 (${timeoutMs}ms)`)), timeoutMs)
    )
  ])
}

// 사용자가 비용 관리에 접근할 수 있는지 확인 (단순화된 버전)
export const canAccessCostManagement = async (projectId: string): Promise<boolean> => {
  try {
    console.log('🔍 비용 관리 접근 권한 확인 시작:', { projectId })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('❌ 사용자가 로그인되지 않음')
      return false
    }

    console.log('✅ 사용자 인증 확인:', { userId: user.id })

    // 단순화: 프로젝트 생성자만 접근 허용 (임시)
    console.log('🔍 프로젝트 생성자 확인 중...')
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('❌ 프로젝트 조회 실패:', projectError)
      return false
    }

    console.log('✅ 프로젝트 정보 조회 성공:', project)

    // 프로젝트 생성자라면 접근 가능
    if (project.created_by === user.id) {
      console.log('✅ 프로젝트 생성자로 접근 허용')
      return true
    }

    console.log('❌ 프로젝트 생성자가 아님 - 접근 거부')
    return false
  } catch (error) {
    console.error('❌ 비용 관리 접근 권한 확인 중 오류:', error)
    return false
  }
}

// 사용자가 비용 관리 권한을 관리할 수 있는지 확인
export const canManageCostManagementPermissions = async (projectId: string): Promise<boolean> => {
  return await canManageCostPermissions(projectId)
}
