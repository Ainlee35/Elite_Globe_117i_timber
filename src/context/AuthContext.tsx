import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("name, email, phone, address")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data ?? null;
  };

  const fetchRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) throw error;
    return data?.some((r) => r.role === "admin") ?? false;
  };

  useEffect(() => {
    let disposed = false;
    let requestId = 0;

    const hydrateAuthState = async (nextUser: SupabaseUser | null) => {
      const currentRequest = ++requestId;
      setUser(nextUser);

      if (!nextUser) {
        if (disposed || currentRequest !== requestId) return;
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      const [profileResult, roleResult] = await Promise.allSettled([
        fetchProfile(nextUser.id),
        fetchRole(nextUser.id),
      ]);

      if (disposed || currentRequest !== requestId) return;

      setProfile(profileResult.status === "fulfilled" ? profileResult.value : null);
      setIsAdmin(roleResult.status === "fulfilled" ? roleResult.value : false);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void hydrateAuthState(session?.user ?? null);
      }
    );

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (disposed) return;
      const u = session?.user ?? null;
      if (!u) {
        setLoading(false);
        return;
      }

      void hydrateAuthState(u);
    });

    return () => {
      disposed = true;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const register = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error?.message ?? null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
