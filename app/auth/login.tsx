import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useAuth } from '../../context/AuthContext';
import { useThemeColor } from '../../hooks/useThemeColor';
import authService from '../../services/auth.service';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    login,
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
    isBiometricAvailable,
    authenticateWithBiometric,
    error,
    clearError,
  } = useAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      router.replace('/');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      const success = await authenticateWithBiometric();
      if (success) {
        // If biometric auth succeeds, we'll use the stored credentials
        const authData = await authService.getStoredAuthData();
        if (authData) {
          await login(authData.user.email, ''); // Password not needed for biometric
          router.replace('/');
        }
      }
    } catch (error) {
      console.error('Biometric login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setIsLoading(true);
      switch (provider) {
        case 'google':
          await loginWithGoogle();
          break;
        case 'facebook':
          await loginWithFacebook();
          break;
        case 'apple':
          await loginWithApple();
          break;
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
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
            <ThemedText style={styles.title}>Welcome Back</ThemedText>
            <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { borderColor }]}>
              <Ionicons name="mail-outline" size={20} color={textColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Email"
                placeholderTextColor={textColor + '80'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={[styles.inputContainer, { borderColor }]}>
              <Ionicons name="lock-closed-outline" size={20} color={textColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Password"
                placeholderTextColor={textColor + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
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

            <TouchableOpacity
              onPress={() => router.push('/auth/forgot-password' as any)}
              style={styles.forgotPassword}
            >
              <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
            </TouchableOpacity>

            <ThemedButton
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={isLoading}
              title={isLoading ? '' : 'Sign In'}
              loading={isLoading}
            />

            {isBiometricAvailable && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                style={[styles.biometricButton, { borderColor }]}
              >
                <Ionicons name="finger-print" size={24} color={textColor} />
                <ThemedText style={styles.biometricButtonText}>Sign in with Biometrics</ThemedText>
              </TouchableOpacity>
            )}

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
              <ThemedText style={styles.dividerText}>or continue with</ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                onPress={() => handleSocialLogin('google')}
                style={[styles.socialButton, { borderColor }]}
              >
                <Ionicons name="logo-google" size={24} color={textColor} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSocialLogin('facebook')}
                style={[styles.socialButton, { borderColor }]}
              >
                <Ionicons name="logo-facebook" size={24} color={textColor} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSocialLogin('apple')}
                style={[styles.socialButton, { borderColor }]}
              >
                <Ionicons name="logo-apple" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Don't have an account? </ThemedText>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <ThemedText style={styles.signUpText}>Sign Up</ThemedText>
              </TouchableOpacity>
            </Link>
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
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    opacity: 0.7,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  biometricButtonText: {
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.7,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
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
  signUpText: {
    fontWeight: '600',
  },
});