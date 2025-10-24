import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearToken, getToken, saveToken, saveFaceIdPreference, getFaceIdPreference, saveFaceIdCredentials, getFaceIdCredentials, clearFaceIdCredentials } from '../utils/authStorage';
import { FaceIdService, FaceIdResult } from '../utils/faceIdService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedCompany: string | null;
  faceIdEnabled: boolean;
  faceIdAvailable: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  selectCompany: (company: string) => void;
  toggleFaceId: (enabled: boolean) => Promise<boolean>;
  authenticateWithFaceId: () => Promise<FaceIdResult>;
  setupFaceIdCredentials: (email: string, password: string) => Promise<boolean>;
  hasFaceIdCredentials: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [faceIdAvailable, setFaceIdAvailable] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    checkFaceIdAvailability();
    loadFaceIdPreference();
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
    console.log("AuthContext: Authentication state set to false");
    console.log("AuthContext: Company selection cleared");
    
    // Note: Face ID settings and credentials are preserved after logout
    // This allows users to use Face ID for future logins
    console.log("AuthContext: Face ID settings preserved for future logins");
    
    // Force a small delay to ensure state is updated
    setTimeout(() => {
      console.log("AuthContext: Logout process completed, final state:", isAuthenticated);
    }, 100);
  }

  function selectCompany(company: string) {
    setSelectedCompany(company);
  }

  async function checkFaceIdAvailability() {
    try {
      const available = await FaceIdService.isAvailable();
      setFaceIdAvailable(available);
      console.log("Face ID available:", available);
    } catch (error) {
      console.error('Error checking Face ID availability:', error);
      setFaceIdAvailable(false);
    }
  }

  async function loadFaceIdPreference() {
    try {
      const enabled = await getFaceIdPreference();
      setFaceIdEnabled(enabled);
      console.log("AuthContext: Face ID preference loaded:", enabled);
    } catch (error) {
      console.error('Error loading Face ID preference:', error);
      setFaceIdEnabled(false);
    }
  }

  async function toggleFaceId(enabled: boolean): Promise<boolean> {
    try {
      if (enabled && !faceIdAvailable) {
        console.log("Face ID not available, cannot enable");
        return false;
      }

      await saveFaceIdPreference(enabled);
      setFaceIdEnabled(enabled);
      console.log("AuthContext: Face ID preference saved and state updated:", enabled);
      
      // If disabling Face ID, clear the credentials
      if (!enabled) {
        await clearFaceIdCredentials();
        console.log("AuthContext: Face ID disabled, credentials cleared");
      }
      
      console.log("AuthContext: Face ID preference updated:", enabled);
      return true;
    } catch (error) {
      console.error('Error toggling Face ID:', error);
      return false;
    }
  }

  async function authenticateWithFaceId(): Promise<FaceIdResult> {
    try {
      if (!faceIdEnabled) {
        return {
          success: false,
          error: 'Face ID is not enabled',
          errorCode: 'NOT_ENABLED'
        };
      }

      if (!faceIdAvailable) {
        return {
          success: false,
          error: 'Face ID is not available on this device',
          errorCode: 'NOT_AVAILABLE'
        };
      }

      // Check if we have Face ID credentials saved
      const credentials = await getFaceIdCredentials();
      console.log("Face ID authentication - Credentials check:", credentials ? "Credentials exist" : "No credentials");
      
      if (!credentials) {
        console.log("Face ID authentication - No credentials found, user needs to setup Face ID first");
        return {
          success: false,
          error: 'Please setup Face ID credentials first',
          errorCode: 'NO_CREDENTIALS'
        };
      }

      // Authenticate with Face ID
      const result = await FaceIdService.authenticate('Use Face ID to access your account');
      
      if (result.success) {
        // Face ID authentication successful, login with saved credentials
        console.log("Face ID authentication successful, logging in with saved credentials");
        
        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://lacey-backend-production.up.railway.app'}/api/auth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: credentials.email.trim(), 
              password: credentials.password 
            }),
          });
          
          const data = await response.json().catch(() => ({}));
          
          if (!response.ok) {
            return {
              success: false,
              error: data?.message || "Invalid credentials",
              errorCode: 'LOGIN_FAILED'
            };
          }
          
          if (data?.token) {
            await saveToken(String(data.token));
            await login(String(data.token));
            console.log("Face ID login successful with saved credentials");
          } else {
            return {
              success: false,
              error: "No token received from server",
              errorCode: 'NO_TOKEN'
            };
          }
        } catch (error) {
          console.error('Face ID login error:', error);
          return {
            success: false,
            error: "Network error during Face ID login",
            errorCode: 'NETWORK_ERROR'
          };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Face ID authentication error:', error);
      return {
        success: false,
        error: 'An error occurred during Face ID authentication',
        errorCode: 'UNKNOWN_ERROR'
      };
    }
  }

  async function setupFaceIdCredentials(email: string, password: string): Promise<boolean> {
    try {
      // First verify the credentials by attempting to login
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://lacey-backend-production.up.railway.app'}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.log("Face ID setup failed - invalid credentials");
        return false;
      }
      
      if (data?.token) {
        // Credentials are valid, save them for Face ID
        await saveFaceIdCredentials({ email: email.trim(), password });
        console.log("Face ID credentials saved successfully");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error setting up Face ID credentials:', error);
      return false;
    }
  }

  async function hasFaceIdCredentials(): Promise<boolean> {
    try {
      const credentials = await getFaceIdCredentials();
      console.log("Face ID credentials check:", credentials ? "Credentials exist" : "No credentials");
      return !!credentials;
    } catch (error) {
      console.error('Error checking Face ID credentials:', error);
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      selectedCompany, 
      faceIdEnabled,
      faceIdAvailable,
      login, 
      logout, 
      selectCompany,
      toggleFaceId,
      authenticateWithFaceId,
      setupFaceIdCredentials,
      hasFaceIdCredentials
    }}>
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
