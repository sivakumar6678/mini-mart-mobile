import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { registerSchema } from '@/utils/validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { Image } from 'expo-image';
import { Link, Stack } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'customer' | 'admin';
}

export default function RegisterScreen() {
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      await register(data.name, data.email, data.password, data.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/react-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <ThemedText type="title">Mini Mart</ThemedText>
          </View>
          
          <View style={styles.formContainer}>
            <ThemedText type="subtitle" style={styles.formTitle}>Create Account</ThemedText>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  error={errors.name?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  error={errors.email?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  placeholder="Create a password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  error={errors.password?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  error={errors.confirmPassword?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="role"
              render={({ field: { onChange, value } }) => (
                <View style={styles.roleContainer}>
                  <ThemedText style={styles.roleLabel}>Register as:</ThemedText>
                  <View style={styles.roleOptions}>
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        value === 'customer' && { backgroundColor: colors.tint + '20' },
                      ]}
                      onPress={() => onChange('customer')}
                    >
                      <ThemedText>Customer</ThemedText>
                      {value === 'customer' && (
                        <View style={[styles.radioSelected, { backgroundColor: colors.tint }]} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        value === 'admin' && { backgroundColor: colors.tint + '20' },
                      ]}
                      onPress={() => onChange('admin')}
                    >
                      <ThemedText>Shop Admin</ThemedText>
                      {value === 'admin' && (
                        <View style={[styles.radioSelected, { backgroundColor: colors.tint }]} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.role && <Text style={styles.errorText}>{errors.role.message}</Text>}
                </View>
              )}
            />
            
            <Button
              title="Register"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              style={styles.registerButton}
            />
            
            <View style={styles.loginContainer}>
              <ThemedText>Already have an account? </ThemedText>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text style={[styles.loginLink, { color: colors.tint }]}>Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  formContainer: {
    width: '100%',
  },
  formTitle: {
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FFEEEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '48%',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  registerButton: {
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  loginLink: {
    fontWeight: '600',
  },
});