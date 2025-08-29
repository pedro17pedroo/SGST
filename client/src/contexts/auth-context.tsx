import React, { createContext, useContext, useState, useEffect } from "react";

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
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se há um utilizador guardado no localStorage
    const savedUser = localStorage.getItem("sgst-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("sgst-user");
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("sgst-user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies for session
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    }
    
    // Clear local state regardless of API response
    setUser(null);
    localStorage.removeItem("sgst-user");
  };

  const value = {
    user,
    login,
    logout,
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