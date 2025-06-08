import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User } from '../types';
import api from './api';

// TODO: Replace with actual API endpoints
const API_URL = 'http://127.0.0.1:5000';

const TOKEN_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SocialAuthConfig {
  googleClientId: string;
  facebookAppId: string;
  appleServiceId: string;
}

class AuthService {
  private biometricEnabled: boolean = false;

  constructor() {
    this.loadBiometricPreference();
  }

  private async loadBiometricPreference() {
    try {
      // Skip AsyncStorage operations on web during SSR
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        this.biometricEnabled = false;
        return;
      }
      
      const value = await AsyncStorage.getItem('biometricEnabled');
      this.biometricEnabled = value === 'true';
    } catch (error) {
      console.error('Error loading biometric preference:', error);
      this.biometricEnabled = false;
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(): Promise<{ token: string }> {
    try {
      const response = await api.post('/auth/refresh-token');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await api.post('/auth/verify-email', { token });
    } catch (error) {
      throw error;
    }
  }

  async verifyPhone(code: string): Promise<void> {
    try {
      await api.post('/auth/verify-phone', { code });
    } catch (error) {
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post('/auth/request-password-reset', { email });
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw error;
    }
  }

  async enableBiometric(): Promise<void> {
    try {
      // Skip AsyncStorage operations on web during SSR
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        this.biometricEnabled = true;
        return;
      }
      
      await AsyncStorage.setItem('biometricEnabled', 'true');
      this.biometricEnabled = true;
    } catch (error) {
      throw error;
    }
  }

  async disableBiometric(): Promise<void> {
    try {
      // Skip AsyncStorage operations on web during SSR
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        this.biometricEnabled = false;
        return;
      }
      
      await AsyncStorage.setItem('biometricEnabled', 'false');
      this.biometricEnabled = false;
    } catch (error) {
      throw error;
    }
  }

  isBiometricEnabled(): boolean {
    return this.biometricEnabled;
  }

  async loginWithGoogle(credential: string): Promise<User> {
    try {
      const response = await api.post('/auth/google', { credential });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async loginWithApple(credential: string): Promise<User> {
    try {
      const response = await api.post('/auth/apple', { credential });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async loginWithFacebook(credential: string): Promise<User> {
    try {
      const response = await api.post('/auth/facebook', { credential });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();