import { supabase } from '@/integrations/supabase/client'

export interface UserFavorite {
  id: string
  user_id: string
  project_id: string
  created_at: string
  updated_at: string
}

export class FavoriteService {
  // 사용자의 모든 즐겨찾기 프로젝트 ID 조회
  static async getUserFavorites(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('project_id')
        .eq('user_id', userId)

      if (error) {
        console.error('즐겨찾기 조회 실패:', error)
        throw error
      }

      return data?.map(favorite => favorite.project_id) || []
    } catch (error) {
      console.error('즐겨찾기 조회 중 오류:', error)
      throw error
    }
  }

  // 즐겨찾기 추가
  static async addFavorite(userId: string, projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          project_id: projectId
        })

      if (error) {
        console.error('즐겨찾기 추가 실패:', error)
        throw error
      }
    } catch (error) {
      console.error('즐겨찾기 추가 중 오류:', error)
      throw error
    }
  }

  // 즐겨찾기 제거
  static async removeFavorite(userId: string, projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('project_id', projectId)

      if (error) {
        console.error('즐겨찾기 제거 실패:', error)
        throw error
      }
    } catch (error) {
      console.error('즐겨찾기 제거 중 오류:', error)
      throw error
    }
  }

  // 즐겨찾기 토글 (추가/제거)
  static async toggleFavorite(userId: string, projectId: string): Promise<boolean> {
    try {
      // 먼저 현재 상태 확인
      const { data: existing, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', projectId)

      if (error) {
        console.error('즐겨찾기 상태 확인 실패:', error)
        throw error
      }

      if (existing && existing.length > 0) {
        // 즐겨찾기가 있으면 제거
        await this.removeFavorite(userId, projectId)
        return false
      } else {
        // 즐겨찾기가 없으면 추가
        await this.addFavorite(userId, projectId)
        return true
      }
    } catch (error) {
      console.error('즐겨찾기 토글 중 오류:', error)
      throw error
    }
  }

  // 특정 프로젝트가 즐겨찾기인지 확인
  static async isFavorite(userId: string, projectId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', projectId)

      if (error) {
        console.error('즐겨찾기 확인 실패:', error)
        throw error
      }

      return data && data.length > 0
    } catch (error) {
      console.error('즐겨찾기 확인 중 오류:', error)
      throw error
    }
  }
}
