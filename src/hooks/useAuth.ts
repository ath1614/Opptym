import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

const BASE_URL = isProduction 
  ? import.meta.env.VITE_API_URL || 'https://opptym-backend.onrender.com/api'
  : 'http://localhost:5050/api';

interface User {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
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

  const decodeUser = (token: string): User => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
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
      return { id: '', username: '', email: '' };
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If refresh fails, try to decode from token
      const token = localStorage.getItem('token');
      if (token) {
        setUser(decodeUser(token));
      }
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      
      // First set user from token
      const userFromToken = decodeUser(res.data.token);
      setUser({
        ...userFromToken,
        isAdmin: res.data.isAdmin,
        subscription: res.data.subscription,
        email: res.data.email,
      });

      // Then refresh user data from server to get complete profile
      await refreshUser();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await axios.post(`${BASE_URL}/auth/signup`, { username, email, password });
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
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
          setUser(userFromToken);
          
          // Try to refresh user data from server
          console.log('🔍 Refreshing user data from server...');
          await refreshUser();
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