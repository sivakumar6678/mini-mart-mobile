import { Button } from '@/components/common/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import OrderService from '@/services/order.service';
import { Order } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform
} from 'react-native';

const { width } = Dimensions.get('window');

// Filter options for orders
const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const loadOrders = useCallback(async (showRefreshing = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Use the correct API method - getOrders() for current user's orders
      const response = await OrderService.getOrders();
      setOrders(response.orders || []);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders');
      
      // Don't show alert on refresh, just log the error
      if (!showRefreshing) {
        Alert.alert(
          'Error',
          'Failed to load orders. Please check your connection and try again.',
          [
            { text: 'Retry', onPress: () => loadOrders() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    filterOrders(activeFilter);
  }, [orders, activeFilter]);

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadOrders(true);
  }, [loadOrders]);

  const filterOrders = (filterValue: string) => {
    if (filterValue === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === filterValue));
    }
  };

  const handleFilterChange = (filterValue: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filterValue);
  };

  const handleOrderPress = (orderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/order/track?id=${orderId}`);
  };

  const handleTrackOrder = (orderId: string, event: any) => {
    event.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/order/track?id=${orderId}`);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#F5A623';
      case 'processing':
        return '#4A90E2';
      case 'shipped':
        return '#7ED321';
      case 'delivered':
        return '#50E3C2';
      case 'cancelled':
        return '#FF3B30';
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'construct-outline';
      case 'shipped':
        return 'bicycle-outline';
      case 'delivered':
        return 'bag-check-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getItemsPreview = (items: Order['items']) => {
    if (items.length === 0) return 'No items';
    if (items.length === 1) return `${items[0].quantity}x Item`;
    return `${items.length} items`;
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[styles.orderCard, { 
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
      }]}
      onPress={() => handleOrderPress(item.id)}
      activeOpacity={0.7}
    >
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <ThemedText style={[styles.orderId, { color: colors.text }]}>
            Order #{item.id}
          </ThemedText>
          <ThemedText style={[styles.orderDate, { color: colors.tabIconDefault }]}>
            {formatDate(item.createdAt)}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Ionicons 
            name={getStatusIcon(item.status) as any} 
            size={14} 
            color={getStatusColor(item.status)} 
          />
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      {/* Order Content */}
      <View style={styles.orderContent}>
        <View style={styles.orderInfo}>
          <Ionicons name="bag-outline" size={16} color={colors.tabIconDefault} />
          <ThemedText style={[styles.itemsText, { color: colors.tabIconDefault }]}>
            {getItemsPreview(item.items)}
          </ThemedText>
        </View>
        
        <View style={styles.orderInfo}>
          <Ionicons name="location-outline" size={16} color={colors.tabIconDefault} />
          <ThemedText style={[styles.addressText, { color: colors.tabIconDefault }]} numberOfLines={1}>
            {item.shippingAddress.city}, {item.shippingAddress.state}
          </ThemedText>
        </View>
      </View>
      
      {/* Order Footer */}
      <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
        <View style={styles.totalContainer}>
          <ThemedText style={[styles.totalLabel, { color: colors.tabIconDefault }]}>
            Total:
          </ThemedText>
          <ThemedText style={[styles.totalAmount, { color: colors.text }]}>
            {formatCurrency(item.total)}
          </ThemedText>
        </View>
        
        {(item.status === 'shipped' || item.status === 'processing') && (
          <TouchableOpacity 
            style={[styles.trackButton, { backgroundColor: colors.tint }]}
            onPress={(e) => handleTrackOrder(item.id, e)}
          >
            <Ionicons name="navigate-outline" size={16} color="#FFFFFF" />
            <Text style={styles.trackButtonText}>Track</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'delivered' && (
          <TouchableOpacity 
            style={[styles.viewButton, { borderColor: colors.tint }]}
            onPress={(e) => handleTrackOrder(item.id, e)}
          >
            <Ionicons name="eye-outline" size={16} color={colors.tint} />
            <Text style={[styles.viewButtonText, { color: colors.tint }]}>View</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => {
    if (activeFilter !== 'all') {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="filter-outline" size={60} color={colors.tabIconDefault} />
          <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
            No {activeFilter} orders
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
            You don't have any {activeFilter} orders yet
          </ThemedText>
          <Button
            title="Show All Orders"
            onPress={() => setActiveFilter('all')}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bag-outline" size={80} color={colors.tabIconDefault} />
        <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
          No orders yet
        </ThemedText>
        <ThemedText style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
          Your order history will appear here once you make your first purchase
        </ThemedText>
        <Button
          title="Start Shopping"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/');
          }}
          icon="bag-outline"
          style={styles.actionButton}
        />
      </View>
    );
  };

  const renderFilterItem = ({ item }: { item: typeof FILTER_OPTIONS[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        { 
          backgroundColor: activeFilter === item.value ? colors.tint : 'transparent',
          borderColor: activeFilter === item.value ? colors.tint : colors.border,
        }
      ]}
      onPress={() => handleFilterChange(item.value)}
    >
      <ThemedText 
        style={[
          styles.filterText,
          { color: activeFilter === item.value ? '#FFFFFF' : colors.text }
        ]}
      >
        {item.label}
      </ThemedText>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'My Orders' }} />
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={[styles.loadingText, { color: colors.tabIconDefault }]}>
          Loading your orders...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'My Orders',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Ionicons name="refresh-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          )
        }} 
      />
      
      {/* Filters */}
      {orders.length > 0 && (
        <View style={styles.filtersContainer}>
          <FlatList
            data={FILTER_OPTIONS}
            renderItem={renderFilterItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.value}
            contentContainerStyle={styles.filtersList}
          />
        </View>
      )}
      
      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.ordersList,
          filteredOrders.length === 0 && styles.emptyList
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  filtersContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  filtersList: {
    paddingHorizontal: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ordersList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderContent: {
    gap: 8,
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemsText: {
    fontSize: 14,
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionButton: {
    minWidth: 160,
  },
});
  shopButton: {
    marginTop: 8,
  },
  showAllButton: {
    marginTop: 8,
  },
});