import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearToken, getToken } from '../utils/authStorage';
import { API_URL } from '../constants/api';

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
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log("AuthContext: State changed - isAuthenticated:", isAuthenticated, "selectedCompany:", selectedCompany);
  }, [isAuthenticated, selectedCompany]);

  async function checkAuthStatus() {
    try {
      console.log("AuthContext: Checking auth status");
      const token = await getToken();
      console.log("AuthContext: Token found:", token ? "exists" : "null");
      if (!token) {
        console.log("AuthContext: No token, setting authenticated to false");
        setIsAuthenticated(false);
        return;
      }

      // Simple token validation - just check if token exists and is not empty
      if (token && token.length > 0) {
        console.log("AuthContext: Valid token found, setting authenticated to true");
        setIsAuthenticated(true);
      } else {
        console.log("AuthContext: Invalid token, clearing and setting authenticated to false");
        await clearToken();
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(token: string) {
    // Token is already saved by the login component before calling this function
    console.log("AuthContext: Setting isAuthenticated to true");
    console.log("AuthContext: Current isAuthenticated state:", isAuthenticated);
    setIsAuthenticated(true);
    console.log("AuthContext: Authentication state updated to true");
    
    // No need to re-check auth status since we just set it to true
    // The token is already saved and we're explicitly setting authenticated to true
  }

  async function logout() {
    console.log("AuthContext: Starting logout process");
    console.log("AuthContext: Current isAuthenticated:", isAuthenticated);
    await clearToken();
    console.log("AuthContext: Token cleared");
    setIsAuthenticated(false);
    setSelectedCompany(null);
    setForceUpdate(prev => prev + 1); // Force re-render
    console.log("AuthContext: Authentication state set to false");
    console.log("AuthContext: Company selection cleared");
    console.log("AuthContext: Force update triggered");
    
    // Force a small delay to ensure state is updated
    setTimeout(() => {
      console.log("AuthContext: Logout process completed, final state:", isAuthenticated);
    }, 100);
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
