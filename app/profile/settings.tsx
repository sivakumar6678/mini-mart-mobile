import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { passwordChangeSchema } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { control, handleSubmit, formState: { errors }, reset } = useForm<PasswordChangeFormData>({
    resolver: yupResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handlePasswordChange = async (data: PasswordChangeFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setIsChangingPassword(false);
        reset();
        Alert.alert('Success', 'Password changed successfully');
      }, 1000);
    } catch (error) {
      console.error('Error changing password:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Settings' }} />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Account Settings */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Account Settings</ThemedText>
            
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => setIsChangingPassword(!isChangingPassword)}
            >
              <View style={styles.settingContent}>
                <Ionicons name="lock-closed-outline" size={24} color={colors.text} />
                <ThemedText style={styles.settingText}>Change Password</ThemedText>
              </View>
              <Ionicons
                name={isChangingPassword ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.tabIconDefault}
              />
            </TouchableOpacity>
            
            {isChangingPassword && (
              <View style={styles.passwordForm}>
                <Controller
                  control={control}
                  name="currentPassword"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Current Password"
                      placeholder="Enter your current password"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry
                      error={errors.currentPassword?.message}
                    />
                  )}
                />
                
                <Controller
                  control={control}
                  name="newPassword"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="New Password"
                      placeholder="Enter your new password"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry
                      error={errors.newPassword?.message}
                    />
                  )}
                />
                
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Confirm New Password"
                      placeholder="Confirm your new password"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry
                      error={errors.confirmPassword?.message}
                    />
                  )}
                />
                
                <Button
                  title="Update Password"
                  onPress={handleSubmit(handlePasswordChange)}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.updateButton}
                />
              </View>
            )}
          </View>
          
          {/* App Settings */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>App Settings</ThemedText>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingContent}>
                <Ionicons name="notifications-outline" size={24} color={colors.text} />
                <ThemedText style={styles.settingText}>Push Notifications</ThemedText>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: colors.tint + '70' }}
                thumbColor={notificationsEnabled ? colors.tint : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingContent}>
                <Ionicons name="location-outline" size={24} color={colors.text} />
                <ThemedText style={styles.settingText}>Location Services</ThemedText>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: '#767577', true: colors.tint + '70' }}
                thumbColor={locationEnabled ? colors.tint : '#f4f3f4'}
              />
            </View>
          </View>
          
          {/* About */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>About</ThemedText>
            
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => Alert.alert('Mini Mart', 'Version 1.0.0')}
            >
              <View style={styles.settingContent}>
                <Ionicons name="information-circle-outline" size={24} color={colors.text} />
                <ThemedText style={styles.settingText}>App Version</ThemedText>
              </View>
              <ThemedText style={styles.versionText}>1.0.0</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => Alert.alert('Terms & Conditions', 'These are the terms and conditions for using the Mini Mart app.')}
            >
              <View style={styles.settingContent}>
                <Ionicons name="document-text-outline" size={24} color={colors.text} />
                <ThemedText style={styles.settingText}>Terms & Conditions</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => Alert.alert('Privacy Policy', 'This is the privacy policy for the Mini Mart app.')}
            >
              <View style={styles.settingContent}>
                <Ionicons name="shield-outline" size={24} color={colors.text} />
                <ThemedText style={styles.settingText}>Privacy Policy</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
          
          {/* Logout Button */}
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            fullWidth
            style={styles.logoutButton}
          />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 16,
    fontSize: 16,
  },
  versionText: {
    opacity: 0.7,
  },
  passwordForm: {
    marginTop: 16,
    marginBottom: 8,
  },
  updateButton: {
    marginTop: 8,
  },
  logoutButton: {
    marginBottom: 24,
  },
});