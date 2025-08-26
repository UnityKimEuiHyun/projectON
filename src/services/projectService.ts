import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export class ProjectService {
  // 프로젝트 목록 조회
  static async getProjects(): Promise<Project[]> {
    console.log('🔐 인증 상태 확인...')
    
    // 현재 인증 상태 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('👤 현재 사용자:', user)
    console.log('❌ 인증 에러:', authError)
    
    if (!user) {
      console.warn('⚠️ 인증된 사용자가 없습니다. RLS 정책으로 인해 데이터 접근이 제한될 수 있습니다.')
    }
    
    console.log('📡 프로젝트 테이블 쿼리 시작...')
    console.log('🔑 사용자 ID:', user?.id)
    console.log('📧 사용자 이메일:', user?.email)
    
    // 0. 테이블 존재 여부 확인
    console.log('🔍 0단계: 테이블 존재 여부 확인...')
    try {
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'projects')
      
      console.log('📋 테이블 정보:', tableInfo)
      console.log('❌ 테이블 조회 에러:', tableError)
    } catch (e) {
      console.error('❌ 테이블 조회 중 예외 발생:', e)
    }
    
    // 1. 전체 테이블 확인 (RLS 무시)
    console.log('🔍 1단계: 전체 테이블 데이터 확인 (RLS 무시)...')
    try {
      const { data: allData, error: allError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('📊 전체 테이블 데이터:', allData)
      console.log('❌ 전체 테이블 에러:', allError)
      
      // 사용자별 데이터 분석
      if (allData && allData.length > 0) {
        console.log('🔍 사용자별 데이터 분석:')
        allData.forEach((project, index) => {
          const isOwner = project.created_by === user?.id
          console.log(`  ${index + 1}. ID: ${project.id}`)
          console.log(`     이름: ${project.name}`)
          console.log(`     생성자ID: ${project.created_by}`)
          console.log(`     내 프로젝트: ${isOwner ? '✅ 예' : '❌ 아니오'}`)
          console.log(`     생성일: ${project.created_at}`)
          console.log('     ---')
        })
        
        // 현재 사용자 소유 프로젝트 찾기
        const myProjects = allData.filter(p => p.created_by === user?.id)
        console.log(`🎯 내가 만든 프로젝트: ${myProjects.length}개`)
        myProjects.forEach((project, index) => {
          console.log(`  ${index + 1}. ${project.name}`)
        })
        
        // 다른 사용자 소유 프로젝트
        const otherProjects = allData.filter(p => p.created_by !== user?.id)
        console.log(`👥 다른 사용자 프로젝트: ${otherProjects.length}개`)
        otherProjects.forEach((project, index) => {
          console.log(`  ${index + 1}. ${project.name} (소유자: ${project.created_by})`)
        })
      }
    } catch (e) {
      console.error('❌ 전체 테이블 조회 중 예외 발생:', e)
    }
    
    // 2. RLS 적용된 쿼리
    console.log('🔍 2단계: RLS 적용된 쿼리...')
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 RLS 적용 쿼리 결과:', { data, error })
      
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
      
      // 3. 사용자별 데이터 확인
      console.log('🔍 3단계: 사용자별 데이터 확인...')
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
      console.error('❌ RLS 적용 쿼리 중 예외 발생:', e)
      return []
    }
  }

  // 프로젝트 생성
  static async createProject(project: Omit<ProjectInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      throw new Error('프로젝트 생성에 실패했습니다.')
    }

    return data
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
  static async deleteProject(id: number): Promise<void> {
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
  static async getProject(id: number): Promise<Project | null> {
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
