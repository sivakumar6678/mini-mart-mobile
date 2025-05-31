import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { profileUpdateSchema } from '@/utils/validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

interface ProfileFormData {
  name: string;
  email: string;
}

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { control, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: yupResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateUser(data);
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Edit Profile' }} />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
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
            
            <ThemedText style={styles.roleText}>
              Account Type: <ThemedText type="defaultSemiBold">
                {user?.role === 'admin' ? 'Shop Admin' : 'Customer'}
              </ThemedText>
            </ThemedText>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Save Changes"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                fullWidth
                style={styles.saveButton}
              />
              
              <Button
                title="Cancel"
                onPress={() => router.back()}
                variant="outline"
                fullWidth
                style={styles.cancelButton}
              />
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
    padding: 16,
  },
  formContainer: {
    marginTop: 16,
  },
  roleText: {
    marginTop: 8,
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 16,
  },
  saveButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 24,
  },
});