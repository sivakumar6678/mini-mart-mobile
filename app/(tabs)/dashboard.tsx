import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useOrder } from '@/context/OrderContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { 
    recentOrders, 
    isLoading, 
    error,
    getOrderAnalytics 
  } = useOrder();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [analytics, setAnalytics] = useState<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getOrderAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return colors.warning;
      case 'processing':
        return colors.info;
      case 'shipped':
        return colors.success;
      case 'delivered':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.text;
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={loadAnalytics}
        >
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View>
            <ThemedText style={styles.welcomeText}>
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </ThemedText>
            <ThemedText style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </ThemedText>
          </View>
          <TouchableOpacity 
            style={[styles.profileButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="person-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Analytics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Analytics
            </ThemedText>
            <TouchableOpacity onPress={loadAnalytics}>
              <Ionicons name="refresh-outline" size={20} color={colors.tint} />
            </TouchableOpacity>
          </View>

          <View style={styles.analyticsGrid}>
            <View style={[styles.analyticsCard, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="cart-outline" size={24} color={colors.tint} />
              <ThemedText style={styles.analyticsValue}>
                {analytics?.totalOrders || 0}
              </ThemedText>
              <ThemedText style={styles.analyticsLabel}>Total Orders</ThemedText>
            </View>

            <View style={[styles.analyticsCard, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="cash-outline" size={24} color={colors.tint} />
              <ThemedText style={styles.analyticsValue}>
                {formatCurrency(analytics?.totalRevenue || 0)}
              </ThemedText>
              <ThemedText style={styles.analyticsLabel}>Total Revenue</ThemedText>
            </View>

            <View style={[styles.analyticsCard, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="trending-up-outline" size={24} color={colors.tint} />
              <ThemedText style={styles.analyticsValue}>
                {formatCurrency(analytics?.averageOrderValue || 0)}
              </ThemedText>
              <ThemedText style={styles.analyticsLabel}>Average Order</ThemedText>
            </View>

            <View style={[styles.analyticsCard, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="time-outline" size={24} color={colors.tint} />
              <ThemedText style={styles.analyticsValue}>
                {analytics?.ordersByStatus?.pending || 0}
              </ThemedText>
              <ThemedText style={styles.analyticsLabel}>Pending Orders</ThemedText>
            </View>
          </View>
        </View>

        {/* Recent Orders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Recent Orders
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/torders')}>
              <ThemedText style={{ color: colors.tint }}>View All</ThemedText>
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="receipt-outline" size={48} color={colors.tabIconDefault} />
              <ThemedText style={styles.emptyStateText}>No orders yet</ThemedText>
              <TouchableOpacity 
                style={[styles.shopButton, { backgroundColor: colors.tint }]}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <ThemedText style={styles.shopButtonText}>Start Shopping</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {recentOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.orderCard, { backgroundColor: colors.cardBackground }]}
                  onPress={() => router.push({
                    pathname: '/(tabs)/torders',
                    params: { orderId: order.id }
                  })}
                >
                  <View style={styles.orderHeader}>
                    <ThemedText style={styles.orderId}>Order #{order.id}</ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                      <ThemedText style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {order.status}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.orderDetails}>
                    <ThemedText style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </ThemedText>
                    <ThemedText style={styles.orderTotal}>
                      {formatCurrency(order.total)}
                    </ThemedText>
                  </View>

                  <View style={styles.orderItems}>
                    {order.items.slice(0, 2).map((item) => (
                      <ThemedText key={item.id} style={styles.orderItem} numberOfLines={1}>
                        {item.quantity}x {item.productId}
                      </ThemedText>
                    ))}
                    {order.items.length > 2 && (
                      <ThemedText style={styles.moreItems}>
                        +{order.items.length - 2} more items
                      </ThemedText>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>

          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/(tabs)/torders')}
            >
              <Ionicons name="list-outline" size={24} color={colors.tint} />
              <ThemedText style={styles.actionText}>My Orders</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Ionicons name="heart-outline" size={24} color={colors.tint} />
              <ThemedText style={styles.actionText}>Wishlist</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/(tabs)/addresses')}
            >
              <Ionicons name="location-outline" size={24} color={colors.tint} />
              <ThemedText style={styles.actionText}>Addresses</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="settings-outline" size={24} color={colors.tint} />
              <ThemedText style={styles.actionText}>Settings</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/help')}
            >
              <Ionicons name="help-outline" size={24} color={colors.tint} />
              <ThemedText style={styles.actionText}>Help</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
  },
  dateText: {
    marginTop: 4,
    opacity: 0.7,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  analyticsCard: {
    width: '50%',
    padding: 16,
    margin: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  analyticsLabel: {
    opacity: 0.7,
  },
  ordersList: {
    marginTop: 8,
  },
  orderCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderDate: {
    opacity: 0.7,
  },
  orderTotal: {
    fontWeight: '600',
  },
  orderItems: {
    marginTop: 8,
  },
  orderItem: {
    opacity: 0.7,
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  emptyState: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  shopButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionButton: {
    width: '50%',
    padding: 16,
    margin: 8,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    fontWeight: '500',
  },
}); 