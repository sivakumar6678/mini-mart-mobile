import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    
    // Store token and user data
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    
    // Store token and user data
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('cart');
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/users/profile', data);
    
    // Update stored user data
    const currentUser = await AuthService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response.data };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return response.data;
  },
  
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.put('/users/password', data);
  },
  
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
  
  getRole: async (): Promise<string | null> => {
    const user = await AuthService.getCurrentUser();
    return user ? user.role : null;
  }
};

export default AuthService;