import { Button } from '@/components/common/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Address } from '@/services/order.service';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

// Mock order data (same as in orders.tsx)
const ORDERS = [
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
    updatedAt: '2023-06-16T14:20:00Z',
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
    updatedAt: '2023-06-21T09:30:00Z',
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
    updatedAt: '2023-06-25T10:00:00Z',
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
    updatedAt: '2023-06-28T16:20:00Z',
  },
];

// Mock addresses
const ADDRESSES: Address[] = [
  {
    id: 1,
    street: '123 Main Street, Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    isDefault: true,
  },
  {
    id: 2,
    street: '456 Park Avenue',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400002',
    isDefault: false,
  },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const loadOrderDetails = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          const foundOrder = ORDERS.find(o => o.id === Number(id));
          setOrder(foundOrder || null);
          
          if (foundOrder) {
            const orderAddress = ADDRESSES.find(a => a.id === foundOrder.addressId);
            setAddress(orderAddress || null);
          }
          
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading order details:', error);
        setIsLoading(false);
      }
    };

    loadOrderDetails();
  }, [id]);

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              // Simulate API call
              setTimeout(() => {
                setOrder({ ...order, status: 'cancelled' });
                setIsCancelling(false);
              }, 500);
            } catch (error) {
              console.error('Error cancelling order:', error);
              setIsCancelling(false);
              Alert.alert('Error', 'Failed to cancel order. Please try again.');
            }
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
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

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Order Details' }} />
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView style={styles.notFoundContainer}>
        <Stack.Screen options={{ title: 'Order Not Found' }} />
        <Ionicons name="alert-circle-outline" size={60} color={colors.tabIconDefault} />
        <ThemedText type="subtitle" style={styles.notFoundText}>
          Order not found
        </ThemedText>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: `Order #${order.id}` }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.section}>
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <Ionicons name="information-circle-outline" size={24} color={getStatusColor(order.status)} />
            <ThemedText style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status === 'pending' && 'Your order is pending confirmation'}
              {order.status === 'confirmed' && 'Your order has been confirmed'}
              {order.status === 'dispatched' && 'Your order is on the way'}
              {order.status === 'delivered' && 'Your order has been delivered'}
              {order.status === 'cancelled' && 'Your order has been cancelled'}
            </ThemedText>
          </View>
        </View>
        
        {/* Order Info */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Order Information</ThemedText>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Order ID</ThemedText>
              <ThemedText style={styles.infoValue}>#{order.id}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Order Date</ThemedText>
              <ThemedText style={styles.infoValue}>{formatDate(order.createdAt)}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Status</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <ThemedText style={[styles.statusBadgeText, { color: getStatusColor(order.status) }]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </ThemedText>
              </View>
            </View>
            {order.status !== 'pending' && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Last Updated</ThemedText>
                <ThemedText style={styles.infoValue}>{formatDate(order.updatedAt)}</ThemedText>
              </View>
            )}
          </View>
        </View>
        
        {/* Order Items */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Order Items</ThemedText>
          <View style={styles.itemsContainer}>
            {order.items.map((item: any, index: number) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <ThemedText style={styles.itemName}>{item.productName}</ThemedText>
                  <ThemedText style={styles.itemPrice}>{formatCurrency(item.price)} x {item.quantity}</ThemedText>
                </View>
                <ThemedText style={styles.itemTotal}>{formatCurrency(item.price * item.quantity)}</ThemedText>
              </View>
            ))}
          </View>
        </View>
        
        {/* Delivery Address */}
        {address && (
          <View style={styles.section}>
            <ThemedText type="subtitle">Delivery Address</ThemedText>
            <View style={styles.addressContainer}>
              <ThemedText style={styles.addressText}>{address.street}</ThemedText>
              <ThemedText style={styles.addressText}>
                {address.city}, {address.state} {address.zipCode}
              </ThemedText>
            </View>
          </View>
        )}
        
        {/* Order Summary */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Order Summary</ThemedText>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <ThemedText>Subtotal</ThemedText>
              <ThemedText>{formatCurrency(order.total - 40)}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>Delivery Fee</ThemedText>
              <ThemedText>{formatCurrency(40)}</ThemedText>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <ThemedText type="defaultSemiBold">Total</ThemedText>
              <ThemedText type="defaultSemiBold">{formatCurrency(order.total)}</ThemedText>
            </View>
          </View>
        </View>
        
        {/* Cancel Button (only for pending or confirmed orders) */}
        {(order.status === 'pending' || order.status === 'confirmed') && (
          <Button
            title={isCancelling ? 'Cancelling...' : 'Cancel Order'}
            onPress={handleCancelOrder}
            variant="danger"
            loading={isCancelling}
            disabled={isCancelling}
            fullWidth
            style={styles.cancelButton}
          />
        )}
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
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notFoundText: {
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    minWidth: 120,
  },
  section: {
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  infoContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    opacity: 0.7,
  },
  infoValue: {
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemsContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemPrice: {
    opacity: 0.7,
  },
  itemTotal: {
    fontWeight: '600',
  },
  addressContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addressText: {
    marginBottom: 4,
  },
  summaryContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 0,
  },
  cancelButton: {
    marginBottom: 24,
  },
});