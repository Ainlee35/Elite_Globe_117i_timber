import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { User } from "@/data/products";
import { apiRequest, clearToken, getToken, setToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isInitializing: boolean;
}

interface AuthApiResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(apiUser: AuthApiResponse["user"]): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role.toLowerCase() === "admin" ? "admin" : "customer",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getToken();
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const me = await apiRequest<AuthApiResponse["user"]>("/auth/me");
        setUser(normalizeUser(me));
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    void bootstrap();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest<AuthApiResponse>("/auth/login", "POST", { email, password });
      setToken(response.accessToken);
      setUser(normalizeUser(response.user));
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest<AuthApiResponse>("/auth/register", "POST", { name, email, password });
      setToken(response.accessToken);
      setUser(normalizeUser(response.user));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, login, register, logout, isAdmin: user?.role === "admin", isInitializing }),
    [user, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
