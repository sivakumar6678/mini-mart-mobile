import { Button } from '@/components/common/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  showBadge?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress, showBadge }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.menuItemContent}>
        <Ionicons name={icon as any} size={24} color={colors.text} style={styles.menuIcon} />
        <ThemedText style={styles.menuTitle}>{title}</ThemedText>
      </View>
      <View style={styles.menuRight}>
        {showBadge && (
          <View style={[styles.badge, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.badgeText}>New</ThemedText>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
      </View>
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { user, isLoading, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleAddresses = () => {
    router.push('/profile/addresses');
  };

  const handleOrders = () => {
    router.push('/profile/orders');
  };

  const handleSettings = () => {
    router.push('/profile/settings');
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.notLoggedInContainer}>
        <Ionicons name="person-circle-outline" size={80} color={colors.tabIconDefault} />
        <ThemedText type="subtitle" style={styles.notLoggedInText}>
          You're not logged in
        </ThemedText>
        <ThemedText style={styles.notLoggedInSubtext}>
          Please login to access your profile
        </ThemedText>
        <Button
          title="Login"
          onPress={() => router.push('/auth/login')}
          style={styles.loginButton}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.userInfo}>
            <ThemedText type="subtitle">{user.name}</ThemedText>
            <ThemedText>{user.email}</ThemedText>
            <ThemedText style={styles.roleText}>
              {user.role === 'admin' ? 'Shop Admin' : 'Customer'}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.editButton, { borderColor: colors.border }]}
          onPress={handleEditProfile}
        >
          <Ionicons name="pencil" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        <MenuItem
          icon="bag"
          title="My Orders"
          onPress={handleOrders}
        />
        <MenuItem
          icon="location"
          title="My Addresses"
          onPress={handleAddresses}
        />
        {user.role === 'admin' && (
          <MenuItem
            icon="storefront"
            title="My Shop"
            onPress={() => router.push('/admin/shop')}
          />
        )}
        <MenuItem
          icon="settings-outline"
          title="Settings"
          onPress={handleSettings}
        />
        <MenuItem
          icon="help-circle-outline"
          title="Help & Support"
          onPress={() => router.push('/help')}
        />
      </View>

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        style={styles.logoutButton}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notLoggedInText: {
    marginTop: 16,
  },
  notLoggedInSubtext: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.7,
  },
  loginButton: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    marginLeft: 16,
  },
  roleText: {
    marginTop: 4,
    opacity: 0.7,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  logoutButton: {
    marginTop: 'auto',
  },
});