import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
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
import { User } from '../../types';

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const router = useRouter();
  const { user, updateProfile, logout, error, clearError } = useAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setCity(user.city);
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleUpdateProfile = async () => {
    if (!name || !email || !city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const updatedUser: Partial<User> = {
        name,
        email,
        phone,
        city,
      };
      await updateProfile(updatedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

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
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: borderColor }]}>
                  <ThemedText style={styles.avatarText}>
                    {user.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={styles.name}>{user.name}</ThemedText>
            <ThemedText style={styles.email}>{user.email}</ThemedText>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                style={styles.editButton}
              >
                <Ionicons
                  name={isEditing ? 'close-outline' : 'pencil-outline'}
                  size={24}
                  color={textColor}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="person-outline" size={20} color={textColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Full Name"
                  placeholderTextColor={textColor + '80'}
                  value={name}
                  onChangeText={setName}
                  editable={isEditing}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>

              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="mail-outline" size={20} color={textColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Email"
                  placeholderTextColor={textColor + '80'}
                  value={email}
                  onChangeText={setEmail}
                  editable={isEditing}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="call-outline" size={20} color={textColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Phone Number"
                  placeholderTextColor={textColor + '80'}
                  value={phone}
                  onChangeText={setPhone}
                  editable={isEditing}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>

              <View style={[styles.inputContainer, { borderColor }]}>
                <Ionicons name="location-outline" size={20} color={textColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="City"
                  placeholderTextColor={textColor + '80'}
                  value={city}
                  onChangeText={setCity}
                  editable={isEditing}
                  autoCapitalize="words"
                  autoComplete="address-line1"
                />
              </View>

              {isEditing && (
                <ThemedButton
                  onPress={handleUpdateProfile}
                  style={styles.updateButton}
                  disabled={isLoading}
                  title={isLoading ? '' : 'Update Profile'}
                  loading={isLoading}
                />
              )}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Account Settings</ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/profile/change-password')}
              style={[styles.settingItem, { borderColor }]}
            >
              <Ionicons name="lock-closed-outline" size={20} color={textColor} />
              <ThemedText style={styles.settingText}>Change Password</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={textColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/profile/addresses')}
              style={[styles.settingItem, { borderColor }]}
            >
              <Ionicons name="location-outline" size={20} color={textColor} />
              <ThemedText style={styles.settingText}>Manage Addresses</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={textColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/profile/payment-methods')}
              style={[styles.settingItem, { borderColor }]}
            >
              <Ionicons name="card-outline" size={20} color={textColor} />
              <ThemedText style={styles.settingText}>Payment Methods</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={textColor} />
            </TouchableOpacity>
          </View>

          <ThemedButton
            onPress={handleLogout}
            style={styles.logoutButton}
            disabled={isLoading}
            title={isLoading ? '' : 'Logout'}
            loading={isLoading}
          />
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
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
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
  updateButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  logoutButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
  },
}); 