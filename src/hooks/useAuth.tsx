import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log(`🔍 프로필 가져오기 시작:`, userId);
      
      // 프로필 쿼리 실행
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.log('📝 프로필이 존재하지 않음, 기본 프로필 정보 사용');
        // 에러가 발생해도 기본 프로필 정보 설정
        setUserProfile({
          id: userId,
          user_id: userId,
          display_name: null,
          email: null,
          avatar_url: null,
          phone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        console.log('✅ 프로필 가져오기 성공');
        setUserProfile(data);
      }
    } catch (error) {
      console.error('❌ 프로필 가져오기 예외:', error);
      // 에러가 발생해도 기본 프로필 정보 설정
              setUserProfile({
          id: userId,
          user_id: userId,
          display_name: null,
          email: null,
          avatar_url: null,
          phone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🚀 Auth 초기화 시작...');
        
        // 기존 세션 확인
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔍 세션 확인 결과:', { session, error });
        
        if (error) {
          console.error('❌ Session retrieval error:', error);
          setLoading(false);
          return;
        } 
        
        if (session?.user) {
          console.log('👤 기존 세션에서 사용자 확인:', session.user.id);
          console.log('🔑 사용자 토큰 유효성:', session.expires_at);
          console.log('⏰ 현재 시간:', new Date().getTime() / 1000);
          console.log('⏰ 토큰 만료 시간:', session.expires_at);
          setSession(session);
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          console.warn('⚠️ 세션에 사용자 정보가 없습니다.');
        }
        
        // Auth state listener 설정
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('🔐 Auth state change:', event, newSession?.user?.id);
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            if (newSession?.user) {
              await fetchUserProfile(newSession.user.id);
            } else {
              setUserProfile(null);
            }
            
            setLoading(false);
          }
        );
        
        // 세션이 없는 경우에만 loading을 false로 설정
        if (!session?.user) {
          setLoading(false);
        }
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, userProfile, loading, signOut, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}