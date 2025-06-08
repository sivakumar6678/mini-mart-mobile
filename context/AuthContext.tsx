import * as AppleAuthentication from 'expo-apple-authentication';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/auth.service';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; city: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  verifyPhone: (code: string) => Promise<void>;
  isBiometricAvailable: boolean;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  const [facebookRequest, facebookResponse, promptFacebookAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_CLIENT_ID',
  });

  useEffect(() => {
    checkBiometricAvailability();
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      handleGoogleLogin(authentication?.accessToken);
    }
  }, [googleResponse]);

  useEffect(() => {
    if (facebookResponse?.type === 'success') {
      const { authentication } = facebookResponse;
      handleFacebookLogin(authentication?.accessToken);
    }
  }, [facebookResponse]);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Biometric check error:', error);
      setIsBiometricAvailable(false);
    }
  };

  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      const [token, storedUser] = await Promise.all([
        authService.getStoredToken(),
        authService.getStoredUser(),
      ]);

      if (token && storedUser) {
        // Verify token is still valid by getting fresh profile
        try {
          const freshUser = await authService.getProfile();
          setUser(freshUser);
        } catch (error) {
          // Token is invalid, clear stored data
          console.log('Stored token is invalid, clearing auth data');
          await authService.clearAuthData();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      if (response.user) {
        setUser(response.user);
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string; city: string; phone?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.register(userData);
      // After successful registration, user needs to login
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (error: any) {
      setError(error.message || 'Logout failed');
      // Still clear user state even if logout fails
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
    } catch (error: any) {
      setError(error.message || 'Profile update failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.requestPasswordReset(email);
    } catch (error: any) {
      setError(error.message || 'Password reset request failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.resetPassword(token, newPassword);
    } catch (error: any) {
      setError(error.message || 'Password reset failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.verifyEmail(token);
      // Refresh user profile after verification
      if (user) {
        const updatedUser = await authService.getProfile();
        setUser(updatedUser);
      }
    } catch (error: any) {
      setError(error.message || 'Email verification failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhone = async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.verifyPhone(code);
      // Refresh user profile after verification
      if (user) {
        const updatedUser = await authService.getProfile();
        setUser(updatedUser);
      }
    } catch (error: any) {
      setError(error.message || 'Phone verification failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const enableBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
      });
      if (result.success) {
        await authService.enableBiometric();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to enable biometric');
      throw error;
    }
  };

  const disableBiometric = async () => {
    try {
      await authService.disableBiometric();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to disable biometric');
      throw error;
    }
  };

  const loginWithBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login',
      });
      if (result.success) {
        const storedUser = await authService.getStoredUser();
        if (storedUser) {
          // Verify the stored token is still valid
          try {
            const freshUser = await authService.getProfile();
            setUser(freshUser);
          } catch (error) {
            throw new Error('Biometric login failed. Please login again.');
          }
        } else {
          throw new Error('No stored user data found');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Biometric authentication failed');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      await promptGoogleAsync();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google login failed');
      throw error;
    }
  };

  const handleGoogleLogin = async (accessToken: string | undefined) => {
    if (!accessToken) throw new Error('No access token');
    try {
      setIsLoading(true);
      const response = await authService.loginWithGoogle(accessToken);
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFacebook = async () => {
    try {
      setError(null);
      await promptFacebookAsync();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Facebook login failed');
      throw error;
    }
  };

  const handleFacebookLogin = async (accessToken: string | undefined) => {
    if (!accessToken) throw new Error('No access token');
    try {
      setIsLoading(true);
      const response = await authService.loginWithFacebook(accessToken);
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Facebook login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const response = await authService.loginWithApple(credential.identityToken || '');
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Apple login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    updateProfile,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    verifyPhone,
    isBiometricAvailable,
    enableBiometric,
    disableBiometric,
    loginWithBiometric,
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}