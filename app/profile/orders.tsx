import { Button } from '@/components/common/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import OrderService, { Order } from '@/services/order.service';
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
  View
} from 'react-native';
// Make sure OrderItem type includes 'image' property in order.service.ts
// Mock orders data
const ORDERS: Order[] = [
  {
    id: 1,
    userId: 1,
    items: [
      {
        productId: 1,
        quantity: 2,
        price: 99,
        productName: 'Fresh Organic Apples',
        // image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
      },
      {
        productId: 3,
        quantity: 1,
        price: 60,
        productName: 'Organic Milk 1L',
        // image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
      },
    ],
    total: 258,
    status: 'delivered',
    addressId: 1,
    createdAt: '2023-06-15T10:30:00Z',
  },
  {
    id: 2,
    userId: 1,
    items: [
      {
        productId: 2,
        quantity: 1,
        price: 45,
        productName: 'Whole Wheat Bread',
        // image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
      },
      {
        productId: 4,
        quantity: 3,
        price: 30,
        productName: 'Fresh Tomatoes',
        // image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
      },
    ],
    total: 135,
    status: 'dispatched',
    addressId: 1,
    createdAt: '2023-06-20T14:45:00Z',
  },
  {
    id: 3,
    userId: 1,
    items: [
      {
        productId: 5,
        quantity: 2,
        price: 65,
        productName: 'Organic Bananas',
        // image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
      },
    ],
    total: 130,
    status: 'confirmed',
    addressId: 2,
    createdAt: '2023-06-25T09:15:00Z',
  },
  {
    id: 4,
    userId: 1,
    items: [
      {
        productId: 6,
        quantity: 1,
        price: 35,
        productName: 'Fresh Carrots',
        // image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37',
      },
      {
        productId: 1,
        quantity: 1,
        price: 99,
        productName: 'Fresh Organic Apples',
        // image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
      },
    ],
    total: 134,
    status: 'pending',
    addressId: 1,
    createdAt: '2023-06-28T16:20:00Z',
  },
];

// Filter options for orders
const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Dispatched', value: 'dispatched' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

interface ExtendedOrderItem {
  productId: number;
  quantity: number;
  price: number;
  productName: string;
  image?: string;
}

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
      const userOrders = await OrderService.getUserOrders();
      setOrders(userOrders);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders');
      
      Alert.alert(
        'Error',
        'Failed to load orders. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: () => loadOrders() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
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

  const handleOrderPress = (orderId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/profile/orders/${orderId}`);
  };

  const handleTrackOrder = (orderId: number, event: any) => {
    event.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/order/track?id=${orderId}`);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#F5A623';
      case 'confirmed':
        return '#4A90E2';
      case 'dispatched':
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
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'dispatched':
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
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleOrderPress(item.id!)}
      activeOpacity={0.8}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <ThemedText style={styles.orderId}>Order #{item.id}</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons name={getStatusIcon(item.status) as any} size={14} color={getStatusColor(item.status)} />
            <ThemedText style={styles.statusText}>{item.status}</ThemedText>
          </View>
        </View>
      </View>
      
      <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
        <ThemedText style={styles.orderTotalLabel}>Total:</ThemedText>
        <ThemedText style={styles.orderTotal}>{formatCurrency(item.total)}</ThemedText>
        
        {item.status === 'dispatched' && (
          <TouchableOpacity 
            style={[styles.trackButton, { backgroundColor: colors.tint }]}
            onPress={(e) => handleTrackOrder(item.id!, e)}
          >
            <Ionicons name="navigate-outline" size={16} color="#FFFFFF" />
            <Text style={styles.trackButtonText}>Track</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => {
    if (activeFilter !== 'all') {
      return (
        <View style={styles.emptyFilterContainer}>
          <Ionicons name="filter-outline" size={50} color={colors.tabIconDefault} />
          <ThemedText style={styles.emptyFilterText}>
            No {activeFilter} orders found
          </ThemedText>
          <Button
            title="Show All Orders"
            onPress={() => setActiveFilter('all')}
            variant="outline"
            style={styles.showAllButton}
          />
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bag-outline" size={80} color={colors.tabIconDefault} />
        <ThemedText style={styles.emptyText}>No orders yet</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Your order history will appear here
        </ThemedText>
        <Button
          title="Start Shopping"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/');
          }}
          icon="bag-outline"
          style={styles.shopButton}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'My Orders' }} />
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'My Orders',
          headerRight: () => (
            orders.length > 0 ? (
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={handleRefresh}
              >
                <Ionicons name="refresh-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : null
          )
        }} 
      />
      
      {orders.length > 0 && (
        <View style={styles.filtersContainer}>
          <FlatList
            data={FILTER_OPTIONS}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  activeFilter === item.value && { 
                    backgroundColor: colors.tint,
                    borderColor: colors.tint,
                  }
                ]}
                onPress={() => handleFilterChange(item.value)}
              >
                <ThemedText 
                  style={[
                    styles.filterText,
                    activeFilter === item.value && { color: '#FFFFFF' }
                  ]}
                >
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.value}
            contentContainerStyle={styles.filtersList}
          />
        </View>
      )}
      
      {orders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={styles.ordersList}
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
      ) : (
        renderEmptyComponent()
      )}
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
  refreshButton: {
    padding: 8,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersList: {
    paddingVertical: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ordersList: {
    paddingBottom: 16,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderIdContainer: {
    flexDirection: 'column',
  },
  orderId: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
  },
  orderDate: {
    opacity: 0.7,
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  orderItemsContainer: {
    marginBottom: 16,
  },
  orderItemRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  orderItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItemPrice: {
    fontSize: 14,
  },
  orderItemQuantity: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.7,
  },
  moreItems: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  orderTotalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderTotal: {
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyFilterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyFilterText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  shopButton: {
    marginTop: 8,
  },
  showAllButton: {
    marginTop: 8,
  },
});