import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Order } from '@/services/order.service';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

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
      },
      {
        productId: 3,
        quantity: 1,
        price: 60,
        productName: 'Organic Milk 1L',
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
      },
      {
        productId: 4,
        quantity: 3,
        price: 30,
        productName: 'Fresh Tomatoes',
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
      },
      {
        productId: 1,
        quantity: 1,
        price: 99,
        productName: 'Fresh Organic Apples',
      },
    ],
    total: 134,
    status: 'pending',
    addressId: 1,
    createdAt: '2023-06-28T16:20:00Z',
  },
];

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          setOrders(ORDERS);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading orders:', error);
        setIsLoading(false);
      }
    };

    if (user) {
      loadOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleOrderPress = (orderId: number) => {
    router.push(`/profile/orders/${orderId}`);
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
        <ThemedText style={styles.orderId}>Order #{item.id}</ThemedText>
        <ThemedText style={styles.orderDate}>{formatDate(item.createdAt!)}</ThemedText>
      </View>
      
      <View style={styles.orderItems}>
        {item.items.map((orderItem, index) => (
          <ThemedText key={index} style={styles.orderItemText}>
            {orderItem.quantity}x {orderItem.productName}
          </ThemedText>
        ))}
      </View>
      
      <View style={styles.orderFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons name={getStatusIcon(item.status) as any} size={16} color={getStatusColor(item.status)} />
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
        <ThemedText style={styles.orderTotal}>{formatCurrency(item.total)}</ThemedText>
      </View>
    </TouchableOpacity>
  );

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
      <Stack.Screen options={{ title: 'My Orders' }} />
      
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={styles.ordersList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={60} color={colors.tabIconDefault} />
          <ThemedText style={styles.emptyText}>No orders yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Your order history will appear here
          </ThemedText>
        </View>
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
  ordersList: {
    paddingBottom: 16,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontWeight: '600',
    fontSize: 16,
  },
  orderDate: {
    opacity: 0.7,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemText: {
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  orderTotal: {
    fontWeight: '700',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
});