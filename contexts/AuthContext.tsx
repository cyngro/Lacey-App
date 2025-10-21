import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearToken, getToken } from '../utils/authStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedCompany: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  selectCompany: (company: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const token = await getToken();
      setIsAuthenticated(!!token);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(token: string) {
    // Token is already saved by the login component before calling this function
    console.log("AuthContext: Setting isAuthenticated to true");
    setIsAuthenticated(true);
    console.log("AuthContext: Authentication state updated");
    
    // Force a re-check of auth status to ensure state is properly updated
    setTimeout(() => {
      checkAuthStatus();
    }, 100);
  }

  async function logout() {
    await clearToken();
    setIsAuthenticated(false);
    setSelectedCompany(null);
  }

  function selectCompany(company: string) {
    setSelectedCompany(company);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, selectedCompany, login, logout, selectCompany }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
