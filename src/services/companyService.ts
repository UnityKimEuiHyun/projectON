import { supabase } from "@/integrations/supabase/client"

export interface Company {
  id: string
  name: string
  description?: string
  created_by: string
  created_at: string
  updated_at: string
  user_role?: string // 사용자가 해당 기업에서의 역할
}

export interface CompanyMember {
  id: string
  group_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  display_name?: string
  email?: string
}

export interface CreateCompanyData {
  name: string
  description?: string
}

/**
 * 새로운 기업을 생성하고 현재 사용자를 owner로 설정
 */
export async function createCompany(data: CreateCompanyData): Promise<Company> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  // 1. 기업 생성
  const { data: company, error: companyError } = await supabase
    .from('groups')
    .insert({
      name: data.name,
      description: data.description,
      created_by: user.id
    })
    .select()
    .single()

  if (companyError) {
    // 중복된 기업명 오류 처리
    if (companyError.code === '23505' && companyError.message.includes('groups_name_key')) {
      throw new Error('이미 존재하는 기업명입니다. 다른 기업명을 사용해주세요.')
    }
    throw new Error(`기업 생성 실패: ${companyError.message}`)
  }

  // 2. 현재 사용자를 owner로 설정
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: company.id,
      user_id: user.id,
      role: 'owner',
      status: 'active'
    })

  if (memberError) {
    // 기업 생성은 성공했지만 멤버 추가 실패 시 기업 삭제
    await supabase.from('groups').delete().eq('id', company.id)
    throw new Error(`소속 설정 실패: ${memberError.message}`)
  }

  return company
}

/**
 * 사용자가 소속된 기업 목록 조회
 */
export async function getUserCompanies(): Promise<Company[]> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.warn('사용자가 로그인되지 않았습니다.')
    return []
  }

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      role,
      groups!inner (
        id,
        name,
        description,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('role', { ascending: false }) // owner가 먼저 오도록 정렬

  if (error) {
    throw new Error(`기업 목록 조회 실패: ${error.message}`)
  }

  return data.map(item => ({
    ...item.groups,
    user_role: item.role
  }))
}

/**
 * 특정 기업의 멤버 목록 조회
 */
export async function getCompanyMembers(groupId: string): Promise<CompanyMember[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      id,
      group_id,
      user_id,
      role,
      joined_at,
      status,
      profiles!inner (
        display_name,
        email
      )
    `)
    .eq('group_id', groupId)
    .eq('status', 'active')

  if (error) {
    throw new Error(`멤버 목록 조회 실패: ${error.message}`)
  }

  return data.map(item => ({
    id: item.id,
    group_id: item.group_id,
    user_id: item.user_id,
    role: item.role,
    joined_at: item.joined_at,
    status: item.status,
    display_name: item.profiles?.display_name,
    email: item.profiles?.email
  }))
}

/**
 * 기업명 중복 확인
 */
export async function checkCompanyNameExists(companyName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('groups')
    .select('id')
    .eq('name', companyName)
    .single()

  if (error) {
    // 데이터가 없으면 중복되지 않음
    if (error.code === 'PGRST116') {
      return false
    }
    throw new Error(`기업명 확인 실패: ${error.message}`)
  }

  return !!data
}

/**
 * 사용자가 특정 기업의 owner인지 확인
 */
export async function isCompanyOwner(groupId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return false
  }

  const { data, error } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (error || !data) {
    return false
  }

  return data.role === 'owner'
}
