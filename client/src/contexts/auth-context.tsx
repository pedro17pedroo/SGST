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

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  handleUnauthorized: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Verificar se há um utilizador guardado no localStorage
    const savedUser = localStorage.getItem("sgst-user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Inicializar prefetch se já estiver autenticado
        PerformanceOptimizer.initializeAfterAuth(queryClient);
      } catch {
        localStorage.removeItem("sgst-user");
      }
    }
  }, []);

  // Register auth handler with queryClient
  useEffect(() => {
    setAuthHandler(handleUnauthorized);
  }, []);

  const login = (userData: User) => {
    console.log('Login chamado com dados:', userData);
    setUser(userData);
    localStorage.setItem("sgst-user", JSON.stringify(userData));
    
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