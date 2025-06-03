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
    View,
} from 'react-native';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useAuth } from '../../context/AuthContext';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { forgotPassword, error, clearError } = useAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(email);
      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    } catch (error) {
      console.error('Forgot password error:', error);
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
            <ThemedText style={styles.title}>Forgot Password</ThemedText>
            <ThemedText style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password
            </ThemedText>
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

            <ThemedButton
              onPress={handleForgotPassword}
              style={styles.submitButton}
              disabled={isLoading}
              title={isLoading ? '' : 'Send Reset Instructions'}
              loading={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Remember your password? </ThemedText>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <ThemedText style={styles.signInText}>Sign In</ThemedText>
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