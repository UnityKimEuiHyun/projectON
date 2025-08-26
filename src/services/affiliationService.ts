import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Group = Database['public']['Tables']['groups']['Row']
type GroupMember = Database['public']['Tables']['group_members']['Row']

export class AffiliationService {
  // 사용자가 속한 기업 목록 가져오기
  static async getUserAffiliations(userId: string): Promise<Group[]> {
    try {
      console.log('🔄 사용자 기업 소속 정보 로드 시작...', userId)
      
      // 사용자가 속한 기업 조회 (더 안전한 방식)
      const { data: groupMembers, error: membersError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (
            id,
            name,
            description,
            created_at
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')

      if (membersError) {
        console.error('❌ 기업 멤버 조회 실패:', membersError)
        console.error('❌ 에러 상세 정보:', {
          code: membersError.code,
          message: membersError.message,
          details: membersError.details,
          hint: membersError.hint
        })
        
        // 500 에러나 다른 서버 에러의 경우 빈 배열 반환
        if (membersError.code === '500' || membersError.code === 'PGRST301' || membersError.code === 'PGRST116') {
          console.log('✅ 서버 에러로 빈 배열 반환')
          return []
        }
        
        // 테이블이 존재하지 않는 경우 빈 배열 반환
        if (membersError.code === '42P01') { // relation does not exist
          console.log('✅ group_members 테이블이 존재하지 않음, 빈 배열 반환')
          return []
        }
        
        // 기타 에러의 경우에도 빈 배열 반환하여 UI가 계속 작동하도록 함
        console.log('✅ 기타 에러로 빈 배열 반환')
        return []
      }

      // groups 데이터 추출 (null 체크 추가)
      const groups = groupMembers
        ?.filter(member => member.groups !== null) // null인 groups 제거
        ?.map(member => member.groups as Group) || []
      
      console.log('✅ 사용자 기업 소속 정보 로드 성공:', groups)
      return groups
      
    } catch (error) {
      console.error('❌ 사용자 기업 소속 정보 로드 실패:', error)
      
      // 예상치 못한 에러의 경우 빈 배열 반환
      console.log('✅ 예상치 못한 에러로 빈 배열 반환')
      return []
    }
  }

  // 사용자의 기업 가입 요청 상태 확인
  static async getUserJoinRequests(userId: string): Promise<any[]> {
    try {
      const { data: requests, error } = await supabase
        .from('group_join_requests')
        .select(`
          id,
          status,
          message,
          created_at,
          groups (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ 가입 요청 조회 실패:', error)
        // 에러가 발생해도 빈 배열 반환하여 UI가 계속 작동하도록 함
        return []
      }

      return requests || []
    } catch (error) {
      console.error('❌ 가입 요청 조회 중 예외 발생:', error)
      return []
    }
  }
}
