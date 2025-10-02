import { supabase } from '@/integrations/supabase/client'

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  display_name?: string
  email?: string
}

export interface CreateProjectMemberData {
  project_id: string
  user_id: string
  role: 'admin' | 'member'
}

// 프로젝트 멤버 목록 조회
export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        id,
        project_id,
        user_id,
        role,
        joined_at,
        profiles!inner (
          display_name,
          email
        )
      `)
      .eq('project_id', projectId)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('프로젝트 멤버 목록 조회 실패:', error)
      throw error
    }

    return data.map(item => ({
      id: item.id,
      project_id: item.project_id,
      user_id: item.user_id,
      role: item.role,
      joined_at: item.joined_at,
      display_name: item.profiles?.display_name,
      email: item.profiles?.email
    }))
  } catch (error) {
    console.error('프로젝트 멤버 목록 조회 중 오류:', error)
    throw error
  }
}

// 프로젝트 멤버 추가
export const addProjectMember = async (memberData: CreateProjectMemberData): Promise<ProjectMember> => {
  try {
    const { data, error } = await supabase
      .from('project_members')
      .insert(memberData)
      .select(`
        id,
        project_id,
        user_id,
        role,
        joined_at,
        profiles!inner (
          display_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('프로젝트 멤버 추가 실패:', error)
      throw error
    }

    return {
      id: data.id,
      project_id: data.project_id,
      user_id: data.user_id,
      role: data.role,
      joined_at: data.joined_at,
      display_name: data.profiles?.display_name,
      email: data.profiles?.email
    }
  } catch (error) {
    console.error('프로젝트 멤버 추가 중 오류:', error)
    throw error
  }
}

// 프로젝트 멤버 역할 변경
export const updateProjectMemberRole = async (
  memberId: string, 
  newRole: 'admin' | 'member'
): Promise<ProjectMember> => {
  try {
    const { data, error } = await supabase
      .from('project_members')
      .update({ role: newRole })
      .eq('id', memberId)
      .select(`
        id,
        project_id,
        user_id,
        role,
        joined_at,
        profiles!inner (
          display_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('프로젝트 멤버 역할 변경 실패:', error)
      throw error
    }

    return {
      id: data.id,
      project_id: data.project_id,
      user_id: data.user_id,
      role: data.role,
      joined_at: data.joined_at,
      display_name: data.profiles?.display_name,
      email: data.profiles?.email
    }
  } catch (error) {
    console.error('프로젝트 멤버 역할 변경 중 오류:', error)
    throw error
  }
}

// 프로젝트 멤버 제거
export const removeProjectMember = async (memberId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', memberId)

    if (error) {
      console.error('프로젝트 멤버 제거 실패:', error)
      throw error
    }
  } catch (error) {
    console.error('프로젝트 멤버 제거 중 오류:', error)
    throw error
  }
}

// 사용자가 프로젝트에서 권한을 변경할 수 있는지 확인
export const canManageProjectMembers = async (projectId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // 1. 프로젝트 생성자인지 확인
    const { data: project } = await supabase
      .from('projects')
      .select('created_by, role')
      .eq('id', projectId)
      .single()

    if (project?.created_by === user.id) return true

    // 2. 프로젝트 멤버에서 owner 또는 admin인지 확인
    const { data: member } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single()

    if (member) return true

    // 3. 프로젝트 멤버에서 admin인지 확인
    const { data: adminMember } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    return !!adminMember
  } catch (error) {
    console.error('프로젝트 멤버 관리 권한 확인 중 오류:', error)
    return false
  }
}

// 사용자가 비용 관리 권한을 변경할 수 있는지 확인 (단순화된 버전)
export const canManageCostPermissions = async (projectId: string): Promise<boolean> => {
  try {
    console.log('🔍 비용 관리 권한 관리 권한 확인 시작:', { projectId })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('❌ 사용자가 로그인되지 않음')
      return false
    }

    console.log('✅ 사용자 인증 확인:', { userId: user.id })

    // 데이터베이스에서 프로젝트 정보 직접 조회
    const { data: project, error } = await supabase
      .from('projects')
      .select('created_by, group_id')
      .eq('id', projectId)
      .single()

    if (error) {
      console.error('❌ 프로젝트 조회 실패:', error)
      return false
    }

    if (!project) {
      console.log('❌ 프로젝트를 찾을 수 없음')
      return false
    }

    console.log('✅ 프로젝트 정보 조회 성공:', project)

    // 프로젝트 생성자인지 확인
    if (project.created_by === user.id) {
      console.log('✅ 프로젝트 생성자로 권한 관리 허용')
      return true
    }

    // 프로젝트가 속한 기업의 owner인지 확인
    if (project.group_id) {
      const { data: companyMember } = await supabase
        .from('company_members')
        .select('user_role')
        .eq('group_id', project.group_id)
        .eq('user_id', user.id)
        .single()

      if (companyMember && companyMember.user_role === 'owner') {
        console.log('✅ 기업 owner로 권한 관리 허용')
        return true
      }
    }

    console.log('❌ 권한 없음 - 프로젝트 생성자도 기업 owner도 아님')
    return false
  } catch (error) {
    console.error('❌ 비용 관리 권한 확인 중 오류:', error)
    return false
  }
}
