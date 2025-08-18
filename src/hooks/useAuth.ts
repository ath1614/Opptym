import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { showPopup, showOTPPopup } from '../utils/popup';

// Use the same axios instance configured in main.tsx
// The axios.defaults.baseURL is already set to the correct base URL

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

      const response = await axios.get('/api/auth/profile', {
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
      console.log('🔐 Login attempt:', {
        email,
        axiosBaseURL: axios.defaults.baseURL,
        fullUrl: `${axios.defaults.baseURL}/api/otp/login/generate`
      });
      
      // Step 1: Generate login OTP
      const otpResponse = await axios.post('/api/otp/login/generate', { email, password });
      
      if (otpResponse.data.success) {
              // Step 2: Show OTP popup for verification
      return new Promise<void>((resolve, reject) => {
        showOTPPopup(
          email,
          async (otp: string) => {
            try {
              // Step 3: Verify OTP and complete login
              const verifyResponse = await axios.post('/api/otp/login/verify', { email, otp });
              
              if (verifyResponse.data.success) {
                localStorage.setItem('token', verifyResponse.data.token);
                
                // Set user from token
                const userFromToken = decodeUser(verifyResponse.data.token);
                setUser({
                  ...userFromToken,
                  isAdmin: verifyResponse.data.user.isAdmin,
                  subscription: verifyResponse.data.user.subscription,
                  email: verifyResponse.data.user.email,
                });

                // Refresh user data from server
                await refreshUser();
                showPopup('✅ Login successful!', 'success');
                resolve();
              } else {
                showPopup('❌ OTP verification failed. Please try again.', 'error');
                reject(new Error('OTP verification failed'));
              }
            } catch (error: any) {
              console.error('OTP verification error:', error);
              const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
              showPopup(`❌ ${errorMessage}`, 'error');
              reject(new Error(errorMessage));
            }
          },
          async () => {
            // Resend OTP
            try {
              await axios.post('/api/otp/login/generate', { email, password });
              showPopup('✅ New OTP sent to your email!', 'success');
            } catch (error: any) {
              const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
              showPopup(`❌ ${errorMessage}`, 'error');
            }
          },
          () => {
            // Cancel OTP verification
            showPopup('❌ Login cancelled.', 'warning');
            reject(new Error('Login cancelled'));
          }
        );
      });
      } else {
        throw new Error(otpResponse.data.message || 'Failed to generate OTP');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error types with user-friendly messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data?.error === 'OTP_REQUIRED') {
        // Redirect to OTP flow
        showPopup('🔄 Redirecting to OTP verification...', 'info');
        // The OTP flow will be handled by the new login function
        return;
      } else if (error.response?.data?.message) {
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
      // Step 1: Generate signup OTP
      const otpResponse = await axios.post('/api/otp/signup/generate', { email });
      
      if (otpResponse.data.success) {
        // Step 2: Show OTP popup for verification
        return new Promise<void>((resolve, reject) => {
          showOTPPopup(
            email,
            async (otp: string) => {
              try {
                // Step 3: Verify OTP and complete registration
                const verifyResponse = await axios.post('/api/otp/signup/verify', { 
                  email, 
                  otp, 
                  username, 
                  password 
                });
                
                if (verifyResponse.data.success) {
                  localStorage.setItem('token', verifyResponse.data.token);
                  
                  // Set user from token
                  const userFromToken = decodeUser(verifyResponse.data.token);
                  setUser({
                    ...userFromToken,
                    isAdmin: verifyResponse.data.user.isAdmin,
                    subscription: verifyResponse.data.user.subscription,
                    email: verifyResponse.data.user.email,
                  });

                  // Refresh user data from server
                  await refreshUser();
                  showPopup('✅ Account created successfully! Welcome to Opptym!', 'success');
                  resolve();
                } else {
                  showPopup('❌ OTP verification failed. Please try again.', 'error');
                  reject(new Error('OTP verification failed'));
                }
              } catch (error: any) {
                console.error('OTP verification error:', error);
                const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
                showPopup(`❌ ${errorMessage}`, 'error');
                reject(new Error(errorMessage));
              }
            },
            async () => {
              // Resend OTP
              try {
                await axios.post('/api/otp/signup/generate', { email });
                showPopup('✅ New OTP sent to your email!', 'success');
              } catch (error: any) {
                const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
                showPopup(`❌ ${errorMessage}`, 'error');
              }
            },
            () => {
              // Cancel OTP verification
              showPopup('❌ Registration cancelled.', 'warning');
              reject(new Error('Registration cancelled'));
            }
          );
        });
      } else {
        throw new Error(otpResponse.data.message || 'Failed to generate OTP');
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