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
import { Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
type FilterStatus = Order['status'] | 'all';

// Update order status types
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export default function AdminOrdersScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  
  // State for search, filter, and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Load orders function
  const refreshOrders = async () => {
    try {
      setIsLoadingOrders(true);
      setOrderError(null);
      const response = await OrderService.getAllOrders();
      setOrders(response.orders || []);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      setOrderError(error.message || 'Failed to load orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Update order status function
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await OrderService.updateOrderStatus(orderId, status);
      // Refresh orders after update
      await refreshOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Admin Orders' }} />
        <View style={styles.errorContainer}>
          <Ionicons name="shield-outline" size={64} color={colors.tabIconDefault} />
          <ThemedText style={[styles.errorText, { color: colors.text }]}>
            Access denied. Admin privileges required.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      refreshOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return '#FFA000';
      case 'processing':
        return '#2196F3';
      case 'shipped':
        return '#9C27B0';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  // Update status actions
  const getStatusActions = (order: Order) => {
    const actions = [];
    
    switch (order.status) {
      case 'pending':
        actions.push(
          <Button
            key="process"
            title="Process"
            onPress={() => handleStatusUpdate(order.id, 'processing')}
            style={styles.statusButton}
            icon="checkmark-circle-outline"
          />
        );
        break;
      case 'processing':
        actions.push(
          <Button
            key="ship"
            title="Ship"
            onPress={() => handleStatusUpdate(order.id, 'shipped')}
            style={styles.statusButton}
            icon="bicycle-outline"
          />
        );
        break;
      case 'shipped':
        actions.push(
          <Button
            key="deliver"
            title="Deliver"
            onPress={() => handleStatusUpdate(order.id, 'delivered')}
            style={styles.statusButton}
            icon="bag-check-outline"
          />
        );
        break;
    }

    if (order.status !== 'cancelled' && order.status !== 'delivered') {
      actions.push(
        <Button
          key="cancel"
          title="Cancel"
          onPress={() => handleStatusUpdate(order.id, 'cancelled')}
          style={styles.cancelButton}
          variant="outline"
          icon="close-circle-outline"
        />
      );
    }

    return actions;
  };

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.userId.toLowerCase().includes(query) ||
        order.total.toString().includes(query)
      );
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter(order => order.status === selectedStatus);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        result.sort((a, b) => b.total - a.total);
        break;
      case 'lowest':
        result.sort((a, b) => a.total - b.total);
        break;
    }

    return result;
  }, [orders, searchQuery, selectedStatus, sortBy]);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Update order details rendering
  const renderOrderDetails = (order: Order) => {
    if (expandedOrderId !== order.id) return null;

    return (
      <ThemedView style={styles.orderDetails}>
        <ThemedView style={styles.detailSection}>
          <ThemedText style={styles.detailTitle}>Order Items</ThemedText>
          {order.items.map((item, index) => (
            <ThemedView key={item.id} style={styles.itemRow}>
              <ThemedText style={styles.itemName}>Item {index + 1}</ThemedText>
              <ThemedText>Quantity: {item.quantity}</ThemedText>
              <ThemedText>Price: ${item.price.toFixed(2)}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        <ThemedView style={styles.detailSection}>
          <ThemedText style={styles.detailTitle}>Shipping Address</ThemedText>
          <ThemedText>{order.shippingAddress?.name}</ThemedText>
          <ThemedText>{order.shippingAddress?.addressLine1}</ThemedText>
          {order.shippingAddress?.addressLine2 && (
            <ThemedText>{order.shippingAddress.addressLine2}</ThemedText>
          )}
          <ThemedText>
            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
          </ThemedText>
          <ThemedText>{order.shippingAddress?.country}</ThemedText>
          <ThemedText>Phone: {order.shippingAddress?.phone}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.detailSection}>
          <ThemedText style={styles.detailTitle}>Order Timeline</ThemedText>
          <ThemedText>Created: {new Date(order.createdAt).toLocaleString()}</ThemedText>
          <ThemedText>Last Updated: {new Date(order.updatedAt).toLocaleString()}</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Search and Filter Bar */}
      <ThemedView style={styles.filterBar}>
        <ThemedView style={styles.searchContainer}>
          <Ionicons name="search-outline" size={24} color={colors.tabIconDefault} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.tabIconDefault}
          />
        </ThemedView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'all' && styles.filterChipSelected]}
            onPress={() => setSelectedStatus('all')}
          >
            <ThemedText style={[styles.filterChipText, selectedStatus === 'all' && styles.filterChipTextSelected]}>
              All
            </ThemedText>
          </TouchableOpacity>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                selectedStatus === status && styles.filterChipSelected,
                { borderColor: getStatusColor(status as OrderStatus) }
              ]}
              onPress={() => setSelectedStatus(status as FilterStatus)}
            >
              <ThemedText
                style={[
                  styles.filterChipText,
                  selectedStatus === status && styles.filterChipTextSelected
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ThemedView style={styles.sortContainer}>
          <Ionicons name="funnel-outline" size={24} color={colors.tabIconDefault} />
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const options: SortOption[] = ['newest', 'oldest', 'highest', 'lowest'];
              const currentIndex = options.indexOf(sortBy);
              setSortBy(options[(currentIndex + 1) % options.length]);
            }}
          >
            <ThemedText style={[styles.sortButtonText, { color: colors.text }]}>
              {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Orders List */}
      <ScrollView
        style={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={isLoadingOrders} onRefresh={refreshOrders} />
        }
      >
        {orderError ? (
          <ThemedView style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <ThemedText style={[styles.errorText, { color: colors.text }]}>
              Error loading orders. Please try again.
            </ThemedText>
            <Button
              title="Retry"
              onPress={refreshOrders}
              style={styles.retryButton}
              icon="refresh-outline"
            />
          </ThemedView>
        ) : isLoadingOrders ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={[styles.loadingText, { color: colors.tabIconDefault }]}>
              Loading orders...
            </ThemedText>
          </ThemedView>
        ) : filteredAndSortedOrders.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={48} color={colors.tabIconDefault} />
            <ThemedText style={[styles.emptyText, { color: colors.text }]}>
              No orders found
            </ThemedText>
          </ThemedView>
        ) : (
          filteredAndSortedOrders.map((order) => (
            <ThemedView key={order.id} style={styles.orderCard}>
              <TouchableOpacity
                style={styles.orderHeader}
                onPress={() => toggleOrderExpand(order.id)}
              >
                <ThemedView style={styles.orderInfo}>
                  <ThemedText style={styles.orderId}>Order #{order.id}</ThemedText>
                  <ThemedView style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status as OrderStatus) }]}>
                    <ThemedText style={styles.statusText}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <Ionicons
                  name={expandedOrderId === order.id ? 'chevron-up-outline' : 'chevron-down-outline'}
                  size={24}
                  color={colors.tabIconDefault}
                />
              </TouchableOpacity>

              <ThemedView style={styles.orderSummary}>
                <ThemedText style={[styles.orderSummaryText, { color: colors.tabIconDefault }]}>
                  User: {order.userId}
                </ThemedText>
                <ThemedText style={[styles.orderSummaryText, { color: colors.tabIconDefault }]}>
                  Items: {order.items.length}
                </ThemedText>
                <ThemedText style={[styles.orderSummaryText, { color: colors.text }]}>
                  Total: {formatCurrency(order.total)}
                </ThemedText>
                <ThemedText style={[styles.orderSummaryText, { color: colors.tabIconDefault }]}>
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </ThemedText>
              </ThemedView>

              {renderOrderDetails(order)}

              <ThemedView style={styles.statusButtons}>
                {getStatusActions(order)}
              </ThemedView>
            </ThemedView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    color: '#333',
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterChipSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterChipText: {
    color: '#666',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  sortButtonText: {
    color: '#666',
  },
  ordersList: {
    flex: 1,
  },
  orderCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderSummary: {
    marginBottom: 12,
  },
  orderSummaryText: {
    color: '#666',
    marginBottom: 4,
  },
  orderDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 1,
    color: '#333',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  statusButton: {
    marginLeft: 8,
  },
  cancelButton: {
    marginLeft: 8,
    backgroundColor: '#ff4444',
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#F44336',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
  },
}); 