import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { setAuthHandler, queryClient } from "@/lib/queryClient";
import { authService } from "@/services/api.service";
import { PerformanceOptimizer } from "@/lib/performance-optimizer";
import { useToast } from "@/hooks/use-toast";
import { Permission } from "@/hooks/use-permissions-unified";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  login: (authData: AuthData) => Promise<void>;
  logout: () => Promise<void>;
  handleUnauthorized: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissionsLoading: boolean;
  isReady: boolean; // Indica se auth e permissões estão prontos
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Função para carregar permissões do usuário
  const loadUserPermissions = useCallback(async (userId: string) => {
    if (!userId) {
      setPermissions([]);
      return;
    }

    setPermissionsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001';
      const savedAuthData = localStorage.getItem('sgst-user');
      const authData = savedAuthData ? JSON.parse(savedAuthData) : null;
      const accessToken = authData?.accessToken;
      
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }
      
      const url = `${apiUrl}/api/users/${userId}/permissions`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const userPermissions = await response.json();
      setPermissions(userPermissions || []);
      

    } catch (error) {
      console.error('Erro ao carregar permissões no AuthContext:', error);
      setPermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  // Função para atualizar permissões (exposta no contexto)
  const refreshPermissions = useCallback(async () => {
    if (user?.id) {
      await loadUserPermissions(user.id);
    }
  }, [user?.id, loadUserPermissions]);

  useEffect(() => {
    // Verificar se há dados de autenticação guardados no localStorage
    const savedAuthData = localStorage.getItem("sgst-user");
    if (savedAuthData) {
      try {
        const authData = JSON.parse(savedAuthData);
        // Verificar se tem os tokens necessários
        if (authData.user && authData.accessToken) {
          setUser(authData.user);
          // Carregar permissões automaticamente
          loadUserPermissions(authData.user.id);
          // Inicializar prefetch se já estiver autenticado
          PerformanceOptimizer.initializeAfterAuth(queryClient);
        } else {
          localStorage.removeItem("sgst-user");
        }
      } catch {
        localStorage.removeItem("sgst-user");
      }
    }
    setIsLoading(false);
  }, [loadUserPermissions]);

  // Register auth handler with queryClient
  useEffect(() => {
    setAuthHandler(handleUnauthorized);
  }, []);

  const login = async (authData: AuthData) => {
    try {
      setUser(authData.user);
      localStorage.setItem("sgst-user", JSON.stringify(authData));
      
      // Carregar permissões automaticamente após login
      await loadUserPermissions(authData.user.id);
      
      // Inicializar prefetch após autenticação
      PerformanceOptimizer.initializeAfterAuth(queryClient);
      
      // Usar setTimeout para garantir que o estado seja atualizado antes do redirecionamento
      setTimeout(() => {
        setLocation('/dashboard');
      }, 50);
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer login. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    }
    
    // Clear local state regardless of API response
    setUser(null);
    setPermissions([]);
    localStorage.removeItem("sgst-user");
    
    // Redirect to home page after logout
    setLocation('/');
  };

  // Handle unauthorized access (401 errors)
  const handleUnauthorized = () => {
    setUser(null);
    setPermissions([]);
    localStorage.removeItem("sgst-user");
    
    // Only redirect if not already on login page
    if (window.location.pathname !== '/') {
      setLocation('/');
    }
  };

  // Estado que indica se o sistema está pronto para uso
  // Pronto quando: não está carregando E (não está autenticado OU tem permissões carregadas)
  const isReady = !isLoading && (!user || !permissionsLoading);

  const value = {
    user,
    permissions,
    login,
    logout,
    handleUnauthorized,
    isAuthenticated: !!user,
    isLoading,
    permissionsLoading,
    isReady,
    refreshPermissions,
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