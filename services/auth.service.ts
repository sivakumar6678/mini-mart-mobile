import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User } from '../types';
import api from './api';

const TOKEN_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export interface AuthResponse {
  access_token: string;
  role: string;
  city: string;
  user_id: number;
  user?: User;
}

export interface LoginResponse {
  access_token: string;
  role: string;
  city: string;
  user_id: number;
}

export interface RegisterResponse {
  message: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  city: string;
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
      
      const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      this.biometricEnabled = value === 'true';
    } catch (error) {
      console.error('Error loading biometric preference:', error);
      this.biometricEnabled = false;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', { email, password });
      const authData = response.data as LoginResponse;
      
      // Store the token
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authData.access_token);
      
      // Get user profile
      const userProfile = await this.getProfile();
      
      return {
        access_token: authData.access_token,
        role: authData.role,
        city: authData.city,
        user_id: authData.user_id,
        user: userProfile
      };
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    city: string;
    role?: string;
  }): Promise<RegisterResponse> {
    try {
      const response = await api.post('/auth/register', {
        ...userData,
        role: userData.role || 'customer'
      });
      return response.data;
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/me');
      const profileData = response.data as UserProfileResponse;
      
      const user: User = {
        id: profileData.id.toString(),
        name: profileData.name,
        email: profileData.email,
        role: profileData.role as 'customer' | 'admin',
        city: profileData.city,
        phone: '', // Not provided by backend
        avatar: '', // Not provided by backend
        isEmailVerified: true, // Assume verified
        isPhoneVerified: false, // Not provided by backend
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store user data
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw new Error('Failed to get user profile');
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put('/auth/profile', {
        name: userData.name,
        city: userData.city,
        // Add other fields as supported by backend
      });
      
      // Get updated profile
      return await this.getProfile();
    } catch (error: any) {
      console.error('Update profile error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to update profile');
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear local storage
      await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY, BIOMETRIC_ENABLED_KEY]);
      
      // Note: Backend doesn't seem to have a logout endpoint
      // If it did, we would call it here:
      // await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY, BIOMETRIC_ENABLED_KEY]);
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return null;
      }
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return null;
      }
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY, BIOMETRIC_ENABLED_KEY]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      // Backend doesn't seem to have this endpoint yet
      // await api.post('/auth/forgot-password', { email });
      throw new Error('Password reset feature not implemented yet');
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Backend doesn't seem to have this endpoint yet
      // await api.post('/auth/reset-password', { token, password: newPassword });
      throw new Error('Password reset feature not implemented yet');
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      // Backend doesn't seem to have this endpoint yet
      throw new Error('Email verification feature not implemented yet');
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  async verifyPhone(code: string): Promise<void> {
    try {
      // Backend doesn't seem to have this endpoint yet
      throw new Error('Phone verification feature not implemented yet');
    } catch (error: any) {
      console.error('Phone verification error:', error);
      throw error;
    }
  }

  async enableBiometric(): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        this.biometricEnabled = true;
        return;
      }
      
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      this.biometricEnabled = true;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      throw error;
    }
  }

  async disableBiometric(): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        this.biometricEnabled = false;
        return;
      }
      
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
      this.biometricEnabled = false;
    } catch (error) {
      console.error('Error disabling biometric:', error);
      throw error;
    }
  }

  isBiometricEnabled(): boolean {
    return this.biometricEnabled;
  }

  // Social login methods - not implemented in backend yet
  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    throw new Error('Google login not implemented yet');
  }

  async loginWithApple(credential: string): Promise<AuthResponse> {
    throw new Error('Apple login not implemented yet');
  }

  async loginWithFacebook(credential: string): Promise<AuthResponse> {
    throw new Error('Facebook login not implemented yet');
  }
}

export default new AuthService();