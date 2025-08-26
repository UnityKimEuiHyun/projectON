import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Group = Database['public']['Tables']['groups']['Row']
type GroupInsert = Database['public']['Tables']['groups']['Insert']
type GroupUpdate = Database['public']['Tables']['groups']['Update']

export class GroupService {
  // 모든 그룹 조회
  static async getGroups(): Promise<Group[]> {
    console.log('🔍 그룹 목록 조회 시작...')
    
    try {
      // 인증 상태 확인 및 토큰 갱신
      let { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('👤 현재 사용자:', user?.id)
      console.log('❌ 인증 에러:', authError)
      
      if (authError || !user) {
        console.log('🔄 그룹 조회 전 토큰 갱신 시도...')
        try {
          const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.error('❌ 토큰 갱신 실패:', refreshError)
          } else if (session?.user) {
            console.log('✅ 토큰 갱신 성공:', session.user.id)
            user = session.user
          }
        } catch (refreshError) {
          console.error('❌ 토큰 갱신 중 예외 발생:', refreshError)
        }
      }

      if (!user) {
        console.warn('⚠️ 인증된 사용자가 없습니다.')
        return []
      }

      console.log('📡 그룹 테이블 쿼리 시작...')
      console.log('🔑 사용자 ID:', user.id)
      
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name', { ascending: true })

      console.log('📊 그룹 조회 결과:', { data, error })
      
      if (error) {
        console.error('❌ 그룹 조회 에러:', error)
        console.error('🔍 에러 상세:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // RLS 정책 관련 에러의 경우 빈 배열 반환
        if (error.message && error.message.includes('infinite recursion')) {
          console.log('✅ RLS 재귀 에러로 빈 배열 반환')
          return []
        }
        
        // 기타 에러의 경우에도 빈 배열 반환하여 UI가 계속 작동하도록 함
        console.log('✅ 기타 에러로 빈 배열 반환')
        return []
      }

      console.log('✅ 그룹 목록 조회 성공:', data)
      return data || []
      
    } catch (error) {
      console.error('❌ 그룹 조회 중 예외 발생:', error)
      
      // 예상치 못한 에러의 경우 빈 배열 반환
      console.log('✅ 예상치 못한 에러로 빈 배열 반환')
      return []
    }
  }

  // 그룹명 중복 확인
  static async checkGroupNameExists(name: string): Promise<boolean> {
    console.log('🔍 그룹명 중복 확인:', name)
    
    if (!name || !name.trim()) {
      throw new Error('그룹명은 필수입니다.')
    }
    
    const trimmedName = name.trim()
    
    const { data, error } = await supabase
      .from('groups')
      .select('id')
      .eq('name', trimmedName)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116는 결과가 없을 때
      console.error('❌ 그룹명 중복 확인 에러:', error)
      throw new Error(`그룹명 중복 확인 실패: ${error.message}`)
    }

    const exists = !!data
    console.log('✅ 그룹명 중복 확인 완료:', { name: trimmedName, exists })
    return exists
  }

  // 새 그룹 생성
  static async createGroup(groupData: Omit<GroupInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Group> {
    console.log('🔍 그룹 생성 시작:', groupData)
    
    // 그룹명 유효성 검사
    if (!groupData.name || !groupData.name.trim()) {
      throw new Error('그룹명은 필수입니다.')
    }
    
    // 그룹명 중복 확인
    const nameExists = await this.checkGroupNameExists(groupData.name)
    if (nameExists) {
      throw new Error('동일한 이름의 그룹이 이미 존재합니다.')
    }
    
    // 인증 상태 확인 및 토큰 갱신
    let { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.log('🔄 그룹 생성 전 토큰 갱신 시도...')
      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          console.error('❌ 토큰 갱신 실패:', refreshError)
        } else if (session?.user) {
          console.log('✅ 토큰 갱신 성공:', session.user.id)
          user = session.user
        }
      } catch (refreshError) {
        console.error('❌ 토큰 갱신 중 예외 발생:', refreshError)
      }
    }
    
    // 그룹 생성
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert([{
        ...groupData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (groupError) {
      console.error('❌ 그룹 생성 에러:', groupError)
      throw new Error(`그룹 생성 실패: ${groupError.message}`)
    }

    console.log('✅ 그룹 생성 성공:', group)

    // 현재 사용자의 소속 상태 확인
    const { data: existingAffiliations, error: affiliationError } = await supabase
      .from('group_members')
      .select('id, group_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
    
    if (affiliationError) {
      console.error('❌ 소속 상태 확인 실패:', affiliationError)
      // 소속 상태 확인에 실패해도 그룹은 생성됨
      console.log('ℹ️ 소속 상태 확인 실패. 그룹 생성 완료.')
      return group
    }

    // 이미 다른 기업에 소속되어 있는 경우
    if (existingAffiliations && existingAffiliations.length > 0) {
      console.log('ℹ️ 이미 다른 기업에 소속되어 있음. 자동 소속 등록 생략.')
      return group
    }

    // 소속이 없는 경우에만 자동으로 admin 역할로 등록
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{
        group_id: group.id,
        user_id: user.id,
        role: 'admin',
        status: 'active',
        joined_at: new Date().toISOString()
      }])

    if (memberError) {
      console.error('❌ 그룹 멤버 등록 에러:', memberError)
      // 그룹은 생성되었지만 멤버 등록에 실패한 경우, 그룹을 삭제
      await supabase.from('groups').delete().eq('id', group.id)
      throw new Error(`그룹 생성자는 자동으로 등록되지 않았습니다: ${memberError.message}`)
    }

    console.log('✅ 그룹 생성자 admin 역할 자동 등록 성공')
    return group
  }

  // 그룹 수정
  static async updateGroup(id: string, updates: GroupUpdate): Promise<Group> {
    console.log('🔍 그룹 수정 시작:', { id, updates })
    
    const { data, error } = await supabase
      .from('groups')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ 그룹 수정 에러:', error)
      throw new Error(`그룹 수정 실패: ${error.message}`)
    }

    console.log('✅ 그룹 수정 성공:', data)
    return data
  }

  // 그룹 삭제
  static async deleteGroup(id: string): Promise<void> {
    console.log('🔍 그룹 삭제 시작:', id)
    
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ 그룹 삭제 에러:', error)
      throw new Error(`그룹 삭제 실패: ${error.message}`)
    }

    console.log('✅ 그룹 삭제 성공')
  }
}
