import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/auth.service';
import { User } from '../types';

// Define auth response types
interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string, code: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  verifyPhone: (phone: string, code: string) => Promise<void>;
  refreshToken: () => Promise<void>;
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

const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
};

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
    }
  };

  const loadStoredAuth = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
      ]);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        await authService.loadBiometricPreference();
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (token: string, refreshToken: string, userData: User) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
      ]);
      await authService.loadBiometricPreference();
      setUser(userData);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      ]);
      await authService.clearAuthData();
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  };

  const updateStoredUser = async (updatedUser: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw new Error('Failed to update user data');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(email, password) as unknown as AuthResponse;
      await saveAuthData(response.token, response.refreshToken, response.user);
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string; phone?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.register(userData) as AuthResponse;
      await saveAuthData(response.token, response.refreshToken, response.user);
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
      await clearAuthData();
    } catch (error: any) {
      setError(error.message || 'Logout failed');
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
      await updateStoredUser(updatedUser);
    } catch (error: any) {
      setError(error.message || 'Profile update failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, code: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.resetPassword(email, code);
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
      const updatedUser = await (authService as any).verifyEmail(token);
      await updateStoredUser(updatedUser);
    } catch (error: any) {
      setError(error.message || 'Email verification failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhone = async (phone: string, code: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await (authService as any).verifyPhone(phone, code);
      await updateStoredUser(updatedUser);
    } catch (error: any) {
      setError(error.message || 'Phone verification failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      const response = await authService.refreshToken() as AuthResponse;
      await saveAuthData(response.token, response.refreshToken, response.user);
    } catch (error: any) {
      setError(error.message || 'Token refresh failed');
      await clearAuthData();
      throw error;
    }
  };

  const enableBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
      });
      if (result.success) {
        await AsyncStorage.setItem('biometricEnabled', 'true');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to enable biometric');
      throw error;
    }
  };

  const disableBiometric = async () => {
    try {
      await AsyncStorage.removeItem('biometricEnabled');
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
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Biometric authentication failed');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await promptGoogleAsync();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google login failed');
      throw error;
    }
  };

  const handleGoogleLogin = async (accessToken: string | undefined) => {
    if (!accessToken) throw new Error('No access token');
    try {
      const response = await authService.loginWithGoogle(accessToken) as AuthResponse;
      await saveAuthData(response.token, response.refreshToken, response.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google login failed');
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      await promptFacebookAsync();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Facebook login failed');
      throw error;
    }
  };

  const handleFacebookLogin = async (accessToken: string | undefined) => {
    if (!accessToken) throw new Error('No access token');
    try {
      const response = await authService.loginWithFacebook(accessToken) as AuthResponse;
      await saveAuthData(response.token, response.refreshToken, response.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Facebook login failed');
      throw error;
    }
  };

  const loginWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const response = await authService.loginWithApple(credential.identityToken || '') as AuthResponse;
      await saveAuthData(response.token, response.refreshToken, response.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Apple login failed');
      throw error;
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    verifyEmail,
    verifyPhone,
    refreshToken,
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