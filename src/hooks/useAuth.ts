import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { showPopup } from '../utils/popup';

// Use the same axios instance configured in main.tsx
// The axios.defaults.baseURL is already set to the correct base URL

interface User {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  timezone?: string;
  bio?: string;
  subscription?: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
  role?: 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer' | 'employee';
  isAdmin?: boolean;
  isOwner?: boolean;
  isEmployee?: boolean;
  trialEndDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const useAuthProvider = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const decodeUser = (token: string): User | null => {
    try {
      // Validate token format
      if (!token || typeof token !== 'string') {
        console.error('Token is null, undefined, or not a string');
        localStorage.removeItem('token');
        return null;
      }

      // Check if token has the correct JWT format (3 parts separated by dots)
      if (!token.includes('.') || token.split('.').length !== 3) {
        console.error('Invalid JWT token format - should have 3 parts separated by dots');
        localStorage.removeItem('token');
        return null;
      }
      
      const parts = token.split('.');
      
      // Validate each part
      if (!parts[0] || !parts[1] || !parts[2]) {
        console.error('Invalid JWT token structure - missing parts');
        localStorage.removeItem('token');
        return null;
      }
      
      // Decode the payload (second part)
      let payload;
      try {
        // Handle base64url decoding with proper padding
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        
        // Add padding if needed
        while (base64.length % 4) {
          base64 += '=';
        }
        
        const jsonPayload = atob(base64);
        payload = JSON.parse(jsonPayload);
      } catch (decodeError) {
        console.error('Error decoding JWT payload:', decodeError);
        console.error('Token parts:', parts);
        console.error('Base64 part:', parts[1]);
        localStorage.removeItem('token');
        return null;
      }
      
      // Validate payload has required fields
      if (!payload || typeof payload !== 'object') {
        console.error('Invalid token payload - not an object');
        localStorage.removeItem('token');
        return null;
      }
      
      if (!payload.userId || !payload.email) {
        console.error('Invalid token payload - missing required fields (userId or email)');
        localStorage.removeItem('token');
        return null;
      }
      
      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.error('Token has expired');
        localStorage.removeItem('token');
        return null;
      }
      
      return { 
        id: payload.userId, 
        username: payload.username,
        email: payload.email, 
        isAdmin: payload.isAdmin, 
        subscription: payload.subscription,
        role: payload.role,
        status: payload.status
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      return null;
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('🔍 No token found for refresh');
        return;
      }

      // Validate token before making request
      const userFromToken = decodeUser(token);
      if (!userFromToken) {
        console.log('🔍 Invalid token found during refresh, clearing...');
        localStorage.removeItem('token');
        setUser(null);
        return;
      }

      console.log('🔍 Fetching user profile from server...');
      const response = await axios.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('🔍 Profile response:', response.data);
      
      if (response.data && response.data.id) {
        console.log('✅ User profile refreshed successfully');
        setUser(response.data);
      } else {
        console.error('❌ Invalid profile response structure:', response.data);
        // Keep the user from token if profile fetch fails
        setUser(userFromToken);
      }
          } catch (error: any) {
        console.error('Error refreshing user data:', error);
        
        // If refresh fails with 401, clear the token and user
        if (error.response?.status === 401) {
          console.log('🔍 401 error during refresh, clearing token and user');
          localStorage.removeItem('token');
          setUser(null);
        } else {
          console.error('🔍 Non-401 error during refresh, keeping user from token');
          // Keep the user from token if profile fetch fails
          const token = localStorage.getItem('token');
          const userFromToken = decodeUser(token);
          if (userFromToken) {
            setUser(userFromToken);
          }
        }
      }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Login attempt:', { email });
      
      const loginResponse = await axios.post('/api/auth/login', { email, password });
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful');
        const token = loginResponse.data.token;
        
        // Validate token before storing
        const userFromToken = decodeUser(token);
        if (!userFromToken) {
          throw new Error('Invalid token received from server');
        }
        
        localStorage.setItem('token', token);
        
        // Set user from token first
        const userData = {
          ...userFromToken,
          isAdmin: loginResponse.data.user.isAdmin,
          subscription: loginResponse.data.user.subscription,
          email: loginResponse.data.user.email,
        } as User;
        
        setUser(userData);
        console.log('🔍 User set from login response:', userData);

        // Try to refresh user data from server (but don't fail if it doesn't work)
        try {
          await refreshUser();
        } catch (error) {
          console.log('⚠️ Profile refresh failed, but keeping user logged in:', error);
          // Keep the user logged in even if profile refresh fails
        }
        
        showPopup('✅ Login successful!', 'success');
      } else {
        throw new Error(loginResponse.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error types with user-friendly messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        switch (error.response.data.error) {
          case 'INVALID_EMAIL':
            errorMessage = '❌ Please enter a valid email address.';
            break;
          case 'MISSING_PASSWORD':
            errorMessage = '❌ Password is required.';
            break;
          case 'USER_NOT_FOUND':
            errorMessage = '❌ No account found with this email address.\n\nPlease check your email or sign up for a new account.';
            break;
          case 'WRONG_PASSWORD':
            errorMessage = '❌ Incorrect password.\n\nPlease check your password and try again.';
            break;
          default:
            errorMessage = error.response.data.message || 'Login failed. Please try again.';
        }
      }
      
      // Show error popup
      showPopup(errorMessage, 'error');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('📝 Registration attempt:', { username, email });
      
      const signupResponse = await axios.post('/api/auth/signup', { username, email, password });
      
      if (signupResponse.data.success) {
        console.log('✅ Signup successful');
        const token = signupResponse.data.token;
        
        // Validate token before storing
        const userFromToken = decodeUser(token);
        if (!userFromToken) {
          throw new Error('Invalid token received from server');
        }
        
        localStorage.setItem('token', token);
        
        // Set user from token
        setUser({
          ...userFromToken,
          isAdmin: signupResponse.data.user.isAdmin,
          subscription: signupResponse.data.user.subscription,
          email: signupResponse.data.user.email,
        });

        // Refresh user data from server
        await refreshUser();
        showPopup('✅ Account created successfully! Welcome to Opptym!', 'success');
      } else {
        throw new Error(signupResponse.data.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error types with user-friendly messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        switch (error.response.data.error) {
          case 'INVALID_EMAIL':
            errorMessage = '❌ Please enter a valid email address.';
            break;
          case 'WEAK_PASSWORD':
            errorMessage = '❌ Password must be at least 6 characters long.';
            break;
          case 'INVALID_USERNAME':
            errorMessage = '❌ Username must be at least 3 characters long.';
            break;
          case 'EMAIL_EXISTS':
            errorMessage = '❌ An account with this email already exists.\n\nPlease login instead or use a different email.';
            break;
          case 'USERNAME_EXISTS':
            errorMessage = '❌ This username is already taken.\n\nPlease choose a different username.';
            break;
          default:
            errorMessage = error.response.data.message || 'Registration failed. Please try again.';
        }
      }
      
      // Show error popup
      showPopup(errorMessage, 'error');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Initializing auth...');
      const token = localStorage.getItem('token');
      console.log('🔍 Token found:', !!token);
      
      if (token) {
        try {
          console.log('🔍 Decoding user from token...');
          const userFromToken = decodeUser(token);
          console.log('🔍 User from token:', userFromToken);
          
          // Check if user data is valid
          if (userFromToken && userFromToken.id && userFromToken.email) {
            setUser(userFromToken);
            console.log('🔍 User set from token during initialization:', userFromToken);
            
            // Try to refresh user data from server (but don't fail if it doesn't work)
            try {
              console.log('🔍 Refreshing user data from server...');
              await refreshUser();
            } catch (error) {
              console.log('⚠️ Profile refresh failed during initialization, but keeping user logged in:', error);
              // Keep the user logged in even if profile refresh fails
            }
          } else {
            console.log('🔍 Invalid user data from token, clearing...');
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('🔍 Error initializing auth:', error);
          // If token is invalid, remove it
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log('🔍 No token found, user is null');
        setUser(null);
      }
    };

    initializeAuth();
  }, []);

  return { user, login, register, logout, refreshUser, isLoading };
};