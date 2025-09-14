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

// 사용자가 비용 관리에 접근할 수 있는지 확인
export const canAccessCostManagement = async (projectId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    console.log('비용 관리 접근 권한 확인 시작:', { projectId, userId: user.id })

    // 1. 프로젝트 생성자인지 확인
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('created_by, group_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('프로젝트 조회 실패:', projectError)
      return false
    }

    console.log('프로젝트 정보:', project)

    // 프로젝트 생성자라면 접근 가능
    if (project.created_by === user.id) {
      console.log('프로젝트 생성자로 접근 허용')
      return true
    }

    // 2. 프로젝트 멤버에서 owner, admin, member 권한 확인
    const { data: projectMember } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectMember) {
      console.log('프로젝트 멤버로 접근 허용:', projectMember.role)
      return true
    }

    // 3. 프로젝트의 소속 기업에서 owner 권한을 가진 사용자인지 확인
    if (project.group_id) {
      const { data: groupMember, error: groupError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', project.group_id)
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .single()

      if (!groupError && groupMember) {
        console.log('기업 owner로 접근 허용')
        return true
      }

      console.log('기업 owner 확인 결과:', { groupError, groupMember })
    }

    // 4. 공유받은 사용자인지 확인
    const { data: share, error: shareError } = await supabase
      .from('cost_management_shares')
      .select('id')
      .eq('project_id', projectId)
      .eq('shared_with_user_id', user.id)
      .single()

    if (!shareError && share) {
      console.log('공유받은 사용자로 접근 허용')
      return true
    }

    console.log('공유 확인 결과:', { shareError, share })
    console.log('접근 권한 없음')
    return false
  } catch (error) {
    console.error('비용 관리 접근 권한 확인 중 오류:', error)
    return false
  }
}

// 사용자가 비용 관리 권한을 관리할 수 있는지 확인
export const canManageCostManagementPermissions = async (projectId: string): Promise<boolean> => {
  return await canManageCostPermissions(projectId)
}
