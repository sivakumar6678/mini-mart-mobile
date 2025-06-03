import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useAuth } from '../../context/AuthContext';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { changePassword, error, clearError } = useAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(currentPassword, newPassword);
      Alert.alert(
        'Success',
        'Password changed successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Change password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ThemedText style={styles.title}>Change Password</ThemedText>
            <ThemedText style={styles.subtitle}>
              Enter your current password and choose a new one
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { borderColor }]}>
              <Ionicons name="lock-closed-outline" size={20} color={textColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Current Password"
                placeholderTextColor={textColor + '80'}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={textColor}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, { borderColor }]}>
              <Ionicons name="lock-closed-outline" size={20} color={textColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="New Password"
                placeholderTextColor={textColor + '80'}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={textColor}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, { borderColor }]}>
              <Ionicons name="lock-closed-outline" size={20} color={textColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Confirm New Password"
                placeholderTextColor={textColor + '80'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={textColor}
                />
              </TouchableOpacity>
            </View>

            <ThemedButton
              onPress={handleChangePassword}
              style={styles.submitButton}
              disabled={isLoading}
              title={isLoading ? '' : 'Change Password'}
              loading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 