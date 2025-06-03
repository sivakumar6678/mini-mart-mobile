import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { resetPassword, error, clearError } = useAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (!token) {
      Alert.alert('Error', 'Invalid reset token');
      router.replace('/auth/login');
    }
  }, [token]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(token, password);
      Alert.alert(
        'Success',
        'Your password has been reset successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    } catch (error) {
      console.error('Reset password error:', error);
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
            <ThemedText style={styles.title}>Reset Password</ThemedText>
            <ThemedText style={styles.subtitle}>
              Enter your new password below
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { borderColor }]}>
              <Ionicons name="lock-closed-outline" size={20} color={textColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="New Password"
                placeholderTextColor={textColor + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
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
              onPress={handleResetPassword}
              style={styles.submitButton}
              disabled={isLoading}
              title={isLoading ? '' : 'Reset Password'}
              loading={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Remember your password? </ThemedText>
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <ThemedText style={styles.signInText}>Sign In</ThemedText>
            </TouchableOpacity>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingVertical: 24,
  },
  footerText: {
    opacity: 0.7,
  },
  signInText: {
    fontWeight: '600',
  },
}); 