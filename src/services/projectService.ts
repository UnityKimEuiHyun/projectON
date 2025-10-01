import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export class ProjectService {
  // 새 프로젝트 생성
  static async createProject(projectData: Omit<ProjectInsert, 'id' | 'created_at' | 'updated_at'> & { group_id?: string | null }): Promise<Project> {
    console.log('🔍 프로젝트 생성 시작:', projectData)
    
    // 인증 상태 확인 및 토큰 갱신
    let { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.log('🔄 프로젝트 생성 전 토큰 갱신 시도...')
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
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        group_id: projectData.group_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ 프로젝트 생성 에러:', error)
      throw new Error(`프로젝트 생성 실패: ${error.message}`)
    }

    console.log('✅ 프로젝트 생성 성공:', data)
    return data
  }

  // 프로젝트 목록 조회
  static async getProjects(): Promise<Project[]> {
    console.log('🔐 인증 상태 확인...')
    
    // 현재 인증 상태 확인
    let { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('👤 현재 사용자:', user)
    console.log('❌ 인증 에러:', authError)
    
    // 인증 에러가 있거나 사용자가 없으면 토큰 갱신 시도
    if (authError || !user) {
      console.log('🔄 토큰 갱신 시도...')
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
      console.error('❌ 인증된 사용자가 없습니다! RLS 정책으로 인해 데이터 접근이 불가능합니다.')
      console.error('🔍 해결 방법:')
      console.error('  1. 로그아웃 후 다시 로그인')
      console.error('  2. 브라우저 쿠키/로컬스토리지 초기화')
      console.error('  3. Supabase 인증 설정 확인')
      return []
    }
    
    console.log('📡 프로젝트 테이블 쿼리 시작...')
    console.log('🔑 사용자 ID:', user?.id)
    console.log('📧 사용자 이메일:', user?.email)
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          groups (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false })

      console.log('📊 프로젝트 조회 결과:', { data, error })
      
      if (error) {
        console.error('❌ 프로젝트 조회 에러:', error)
        console.error('🔍 에러 상세:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`프로젝트 목록을 불러오는데 실패했습니다: ${error.message}`)
      }

      console.log('✅ 프로젝트 조회 성공, 데이터 개수:', data?.length || 0)
      
      // 사용자별 데이터 확인
      if (data && data.length > 0) {
        console.log('📋 테이블에 있는 모든 프로젝트:')
        data.forEach((project, index) => {
          console.log(`  ${index + 1}. ID: ${project.id}, 이름: ${project.name}, 생성자ID: ${project.created_by}`)
        })
        
        // 현재 사용자 ID와 일치하는 데이터 찾기
        const userProjects = data.filter(p => p.created_by === user?.id)
        console.log(`🔍 현재 사용자(${user?.id})의 프로젝트:`, userProjects)
        
        if (userProjects.length === 0) {
          console.warn('⚠️ 현재 사용자 ID와 일치하는 프로젝트가 없습니다!')
          console.warn('💡 데이터의 created_by와 로그인한 사용자 ID가 다를 수 있습니다.')
        }
      }
      
      return data || []
    } catch (e) {
      console.error('❌ 프로젝트 조회 중 예외 발생:', e)
      return []
    }
  }



  // 프로젝트 수정
  static async updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
    console.log('🔧 프로젝트 수정 시작...')
    console.log('🆔 수정할 프로젝트 ID:', id, '타입:', typeof id)
    console.log('📝 업데이트 데이터:', updates)
    console.log('📅 contract_date 타입:', typeof updates.contract_date, '값:', updates.contract_date)
    console.log('📅 due_date 타입:', typeof updates.due_date, '값:', updates.due_date)
    
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ 프로젝트 수정 오류:', error)
      console.error('🔍 오류 상세:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`프로젝트 수정에 실패했습니다: ${error.message}`)
    }

    console.log('✅ 프로젝트 수정 성공:', data)
    return data
  }

  // 프로젝트 삭제
  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      throw new Error('프로젝트 삭제에 실패했습니다.')
    }
  }

  // 프로젝트 단일 조회
  static async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }

    return data
  }
}
