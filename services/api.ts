import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

// Base URL for the API
const API_URL = 'http://127.0.0.1:5000/api';

// Extend the InternalAxiosRequestConfig to include _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to false for web compatibility
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      // Skip AsyncStorage operations on web during SSR
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return config;
      }
      
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      await AsyncStorage.removeItem('auth_token');
      // You might want to trigger a logout action here
    }
    
    // Log network errors for debugging
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      console.warn('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;