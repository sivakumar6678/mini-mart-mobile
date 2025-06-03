import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardAnalytics } from '../../types';

export default function AdminDashboardScreen() {
  const navigation = useNavigation() as any;
  const { user } = useAuth();
  const {
    dashboardAnalytics,
    isLoadingAnalytics,
    analyticsError,
    refreshAnalytics,
  } = useAdmin();

  useEffect(() => {
    refreshAnalytics();
  }, []);

  if (!user || !(user as any)?.isAdmin) {
    return (
      <View style={styles.container}>
        <ThemedText>Access denied. Admin privileges required.</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoadingAnalytics} onRefresh={refreshAnalytics} />
      }
    >
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Admin Dashboard</ThemedText>
        <ThemedText style={styles.subtitle}>
          Welcome back, {user.name}
        </ThemedText>
      </ThemedView>

      {analyticsError ? (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{analyticsError}</ThemedText>
          <ThemedButton
            title="Retry"
            onPress={refreshAnalytics}
            style={styles.retryButton}
          />
        </ThemedView>
      ) : (
        <>
          <ThemedView style={styles.statsContainer}>
            <ThemedView style={styles.statCard}>
              <MaterialIcons name="shopping-cart" size={24} color="#4CAF50" />
              <ThemedText style={styles.statValue}>
                {(dashboardAnalytics as unknown as DashboardAnalytics)?.totalOrders || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Orders</ThemedText>
            </ThemedView>

            <ThemedView style={styles.statCard}>
              <MaterialIcons name="attach-money" size={24} color="#2196F3" />
              <ThemedText style={styles.statValue}>
                ${(dashboardAnalytics as unknown as DashboardAnalytics)?.totalRevenue?.toFixed(2) || '0.00'}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Revenue</ThemedText>
            </ThemedView>

            <ThemedView style={styles.statCard}>
              <MaterialIcons name="people" size={24} color="#FF9800" />
              <ThemedText style={styles.statValue}>
                {(dashboardAnalytics as unknown as DashboardAnalytics)?.totalCustomers || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Customers</ThemedText>
            </ThemedView>

            <ThemedView style={styles.statCard}>
              <MaterialIcons name="store" size={24} color="#9C27B0" />
              <ThemedText style={styles.statValue}>
                {(dashboardAnalytics as unknown as DashboardAnalytics)?.totalShops || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Shops</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.actionsContainer}>
            <ThemedButton
              title="Manage Orders"
              onPress={() => navigation.navigate('AdminOrders')}
              icon="receipt"
              style={styles.actionButton}
            />
            <ThemedButton
              title="Manage Shops"
              onPress={() => navigation.navigate('AdminShops')}
              icon="store"
              style={styles.actionButton}
            />
            <ThemedButton
              title="View Analytics"
              onPress={() => navigation.navigate('AdminAnalytics')}
              icon="analytics"
              style={styles.actionButton}
            />
            <ThemedButton
              title="Manage Users"
              onPress={() => navigation.navigate('AdminUsers')}
              icon="people"
              style={styles.actionButton}
            />
          </ThemedView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    marginBottom: 15,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
}); 