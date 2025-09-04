import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { setAuthHandler, queryClient, apiRequest } from "@/lib/queryClient";
import { PerformanceOptimizer } from "@/lib/performance-optimizer";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (authData: AuthData) => void;
  logout: () => Promise<void>;
  handleUnauthorized: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Verificar se há dados de autenticação guardados no localStorage
    const savedAuthData = localStorage.getItem("sgst-user");
    if (savedAuthData) {
      try {
        const authData = JSON.parse(savedAuthData);
        // Verificar se tem os tokens necessários
        if (authData.user && authData.accessToken) {
          setUser(authData.user);
          // Inicializar prefetch se já estiver autenticado
          PerformanceOptimizer.initializeAfterAuth(queryClient);
        } else {
          localStorage.removeItem("sgst-user");
        }
      } catch {
        localStorage.removeItem("sgst-user");
      }
    }
  }, []);

  // Register auth handler with queryClient
  useEffect(() => {
    setAuthHandler(handleUnauthorized);
  }, []);

  const login = (authData: AuthData) => {
    console.log('Login chamado com dados:', authData.user);
    setUser(authData.user);
    localStorage.setItem("sgst-user", JSON.stringify(authData));
    
    // Inicializar prefetch após autenticação
    PerformanceOptimizer.initializeAfterAuth(queryClient);
    
    // Usar setTimeout para garantir que o estado seja atualizado antes do redirecionamento
    setTimeout(() => {
      console.log('Redirecionando para dashboard...');
      setLocation('/dashboard');
    }, 50);
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    }
    
    // Clear local state regardless of API response
    setUser(null);
    localStorage.removeItem("sgst-user");
    
    // Redirect to home page after logout
    setLocation('/');
  };

  // Handle unauthorized access (401 errors)
  const handleUnauthorized = () => {
    setUser(null);
    localStorage.removeItem("sgst-user");
    
    // Only redirect if not already on login page
    if (window.location.pathname !== '/') {
      setLocation('/');
    }
  };

  const value = {
    user,
    login,
    logout,
    handleUnauthorized,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
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