import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthUser,
  authApi,
  clearSession,
  getStoredUser,
  getToken,
  setSession,
} from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata: { full_name: string; employee_id: string }
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const bootstrap = async () => {
      const token = getToken();
      const stored = getStoredUser();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await authApi.me();
        const nextUser: AuthUser = {
          id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name,
          employee_id: profile.employee_id,
          department: profile.department,
          phone: profile.phone,
        };
        setUser(nextUser);
        setSession(token, nextUser);
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      setSession(data.token, data.user);
      setUser(data.user);
      navigate("/dashboard");
      return { error: null };
    } catch (error: any) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { full_name: string; employee_id: string }
  ) => {
    try {
      await authApi.register({
        email,
        password,
        full_name: metadata.full_name,
        employee_id: metadata.employee_id,
      });
      return { error: null };
    } catch (error: any) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    }
    clearSession();
    setUser(null);
    navigate("/login");
  };

  const refreshUser = async () => {
    const profile = await authApi.me();
    const token = getToken();
    if (!token) return;
    const nextUser: AuthUser = {
      id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name,
      employee_id: profile.employee_id,
      department: profile.department,
      phone: profile.phone,
    };
    setUser(nextUser);
    setSession(token, nextUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, signIn, signUp, signOut, refreshUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
