import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { showPopup } from '../utils/popup';

// Production-ready authentication hook with optimized UX

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
  profilePhoto?: string;
  subscription?: 'free' | 'test' | 'starter' | 'pro' | 'business' | 'enterprise' | 'custom';
  customPlan?: {
    name: string;
    description: string;
    price: number;
    billingCycle: 'monthly' | 'yearly' | 'lifetime';
    limits: {
      submissions: number;
      projects: number;
      tools: number;
      apiCalls: number;
    };
    features: {
      canCreateProjects: boolean;
      canSubmitDirectories: boolean;
      canUseSeoTools: boolean;
      canAccessAnalytics: boolean;
      canAccessAdmin: boolean;
    };
  };
  status?: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
  role?: 'user' | 'admin';
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
      if (!token || typeof token !== 'string') {
        localStorage.removeItem('token');
        return null;
      }

      if (!token.includes('.') || token.split('.').length !== 3) {
        localStorage.removeItem('token');
        return null;
      }
      
      const parts = token.split('.');
      
      if (!parts[0] || !parts[1] || !parts[2]) {
        localStorage.removeItem('token');
        return null;
      }
      
      let payload;
      try {
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        
        while (base64.length % 4) {
          base64 += '=';
        }
        
        const jsonPayload = atob(base64);
        payload = JSON.parse(jsonPayload);
      } catch (decodeError) {
        localStorage.removeItem('token');
        return null;
      }
      
      if (!payload || typeof payload !== 'object') {
        localStorage.removeItem('token');
        return null;
      }
      
      if (!payload.userId || !payload.email) {
        localStorage.removeItem('token');
        return null;
      }
      
      if (payload.exp && payload.exp * 1000 < Date.now()) {
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
      localStorage.removeItem('token');
      return null;
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const userFromToken = decodeUser(token);
      if (!userFromToken) {
        localStorage.removeItem('token');
        setUser(null);
        return;
      }

      const response = await axios.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.id) {
        setUser(response.data);
      } else {
        setUser(userFromToken);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        } else {
          const token = localStorage.getItem('token');
          if (token) {
            const userFromToken = decodeUser(token);
            if (userFromToken) {
              setUser(userFromToken);
            }
          }
        }
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loginResponse = await axios.post('/api/auth/login', { email, password });
      
      if (loginResponse.data.success) {
        const token = loginResponse.data.token;
        
        const userFromToken = decodeUser(token);
        if (!userFromToken) {
          throw new Error('Invalid token received from server');
        }
        
        localStorage.setItem('token', token);
        
        const userData = {
          ...userFromToken,
          isAdmin: loginResponse.data.user.isAdmin,
          subscription: loginResponse.data.user.subscription,
          email: loginResponse.data.user.email,
        } as User;
        
        setUser(userData);

        try {
          await refreshUser();
        } catch (error) {
          // Keep user logged in even if profile refresh fails
        }
        
        showPopup('✅ Login successful!', 'success');
      } else {
        throw new Error(loginResponse.data.message || 'Login failed');
      }
    } catch (error: any) {
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
      
      showPopup(errorMessage, 'error');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const signupResponse = await axios.post('/api/auth/signup', { username, email, password });
      
      if (signupResponse.data.success) {
        if (signupResponse.data.requiresVerification) {
          return signupResponse.data;
        }
        
        const token = signupResponse.data.token;
        
        const userFromToken = decodeUser(token);
        if (!userFromToken) {
          throw new Error('Invalid token received from server');
        }
        
        localStorage.setItem('token', token);
        
        setUser({
          ...userFromToken,
          isAdmin: signupResponse.data.user.isAdmin,
          subscription: signupResponse.data.user.subscription,
          email: signupResponse.data.user.email,
        });

        await refreshUser();
        showPopup('✅ Account created successfully! Welcome to Opptym!', 'success');
        return signupResponse.data;
      } else {
        throw new Error(signupResponse.data.message || 'Signup failed');
      }
    } catch (error: any) {
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
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const userFromToken = decodeUser(token);
          
          if (userFromToken && userFromToken.id && userFromToken.email) {
            setUser(userFromToken);
            
            try {
              await refreshUser();
            } catch (error) {
              // Keep user logged in even if profile refresh fails
            }
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    initializeAuth();
  }, []);

  return { user, login, register, logout, refreshUser, isLoading };
};
