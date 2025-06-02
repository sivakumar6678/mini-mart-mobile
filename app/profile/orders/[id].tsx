import { Button } from '@/components/common/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Order } from '@/services/order.service';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';

// Mock orders (same as in orders.tsx)
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
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
      },
      {
        productId: 3,
        quantity: 1,
        price: 60,
        productName: 'Organic Milk 1L',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b',
      },
    ],
    total: 258,
    status: 'delivered',
    addressId: 1,
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-16T14:20:00Z',
    paymentMethod: 'Credit Card',
    deliveryPartner: 'Express Delivery',
    trackingId: 'EXP12345678',
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
        image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef',
      },
      {
        productId: 4,
        quantity: 3,
        price: 30,
        productName: 'Fresh Tomatoes',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
      },
    ],
    total: 135,
    status: 'dispatched',
    addressId: 1,
    createdAt: '2023-06-20T14:45:00Z',
    updatedAt: '2023-06-21T09:30:00Z',
    paymentMethod: 'Cash on Delivery',
    deliveryPartner: 'Fast Track',
    trackingId: 'FT87654321',
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
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
      },
    ],
    total: 130,
    status: 'confirmed',
    addressId: 2,
    createdAt: '2023-06-25T09:15:00Z',
    updatedAt: '2023-06-25T10:00:00Z',
    paymentMethod: 'Digital Wallet',
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
        image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37',
      },
      {
        productId: 1,
        quantity: 1,
        price: 99,
        productName: 'Fresh Organic Apples',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
      },
    ],
    total: 134,
    status: 'pending',
    addressId: 1,
    createdAt: '2023-06-28T16:20:00Z',
    updatedAt: '2023-06-28T16:20:00Z',
    paymentMethod: 'Credit Card',
  },
];

// Mock addresses
const ADDRESSES = [
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

interface ExtendedOrderItem {
  productId: number;
  quantity: number;
  price: number;
  productName: string;
  image: string;
}

interface ExtendedOrder extends Order {
  items: ExtendedOrderItem[];
  paymentMethod: string;
  deliveryPartner?: string;
  trackingId?: string;
}

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [address, setAddress] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const loadOrderDetails = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          const foundOrder = ORDERS.find(o => o.id === Number(id)) as ExtendedOrder;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F5A623';
      case 'confirmed':
        return '#4A90E2';
      case 'processing':
        return '#9B59B6';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'processing':
        return 'construct-outline';
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

  const handleTrackOrder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/order/track?id=${order?.id}`);
  };

  const handleReorder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Implement reorder functionality
    alert('Reorder functionality to be implemented');
  };

  const handleCancelOrder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Implement cancel order functionality
    alert('Cancel order functionality to be implemented');
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
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
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
        <View style={styles.statusContainer}>
          <View style={[styles.statusCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <Ionicons name={getStatusIcon(order.status) as any} size={24} color={getStatusColor(order.status)} />
              </View>
              <View style={styles.statusContent}>
                <ThemedText style={styles.statusTitle}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </ThemedText>
                <ThemedText style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                  {order.status === 'pending' && 'Your order is pending confirmation'}
                  {order.status === 'confirmed' && 'Your order has been confirmed'}
                  {order.status === 'dispatched' && 'Your order is on the way'}
                  {order.status === 'delivered' && 'Your order has been delivered'}
                  {order.status === 'cancelled' && 'Your order has been cancelled'}
                </ThemedText>
              </View>
            </View>
          </View>
          
          {order.status === 'dispatched' && (
            <Button
              title="Track Order"
              onPress={handleTrackOrder}
              icon="navigate-outline"
              style={styles.trackButton}
            />
          )}
        </View>
        
        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color={colors.tint} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>Order Summary</ThemedText>
          </View>
          
          <View style={[styles.summaryContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.summaryRow}>
              <ThemedText>Subtotal</ThemedText>
              <ThemedText>{formatCurrency(order.total - 40)}</ThemedText>
            </View>
            
            <View style={styles.summaryRow}>
              <ThemedText>Delivery Fee</ThemedText>
              <ThemedText>{formatCurrency(40)}</ThemedText>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
              <ThemedText type="defaultSemiBold">Total</ThemedText>
              <ThemedText type="subtitle" style={styles.totalAmount}>{formatCurrency(order.total)}</ThemedText>
            </View>
          </View>
        </View>
        
        {/* Order Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.tint} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>Order Information</ThemedText>
          </View>
          
          <View style={[styles.infoContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Order ID</ThemedText>
              <ThemedText style={styles.infoValue}>#{order.id}</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Order Date</ThemedText>
              <ThemedText style={styles.infoValue}>{formatDate(order.createdAt!)}</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Payment Method</ThemedText>
              <ThemedText style={styles.infoValue}>{order.paymentMethod}</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            {order.status !== 'pending' && (
              <>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Last Updated</ThemedText>
                  <ThemedText style={styles.infoValue}>{formatDate(order.updatedAt!)}</ThemedText>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </>
            )}
            
            {(order.status === 'dispatched' || order.status === 'delivered') && (
              <>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Delivery Partner</ThemedText>
                  <ThemedText style={styles.infoValue}>{order.deliveryPartner}</ThemedText>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Tracking ID</ThemedText>
                  <ThemedText style={styles.infoValue}>{order.trackingId}</ThemedText>
                </View>
              </>
            )}
          </View>
        </View>
        
        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cart-outline" size={20} color={colors.tint} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>Order Items</ThemedText>
          </View>
          
          <View style={[styles.itemsContainer, { backgroundColor: colors.cardBackground }]}>
            {order.items.map((item: ExtendedOrderItem, index: number) => (
              <View key={index} style={[styles.orderItem, index < order.items.length - 1 && styles.itemBorder]}>
                {item.image && (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.itemImage}
                    contentFit="cover"
                  />
                )}
                <View style={styles.itemInfo}>
                  <ThemedText style={styles.itemName}>{item.productName}</ThemedText>
                  <View style={styles.itemDetails}>
                    <ThemedText style={styles.itemPrice}>{formatCurrency(item.price)}</ThemedText>
                    <ThemedText style={styles.itemQuantity}>× {item.quantity}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.itemTotal}>{formatCurrency(item.price * item.quantity)}</ThemedText>
              </View>
            ))}
          </View>
        </View>
        
        {/* Delivery Address */}
        {address && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color={colors.tint} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>Delivery Address</ThemedText>
            </View>
            
            <View style={[styles.addressContainer, { backgroundColor: colors.cardBackground }]}>
              <ThemedText style={styles.addressText}>{address.street}</ThemedText>
              <ThemedText style={styles.addressText}>
                {address.city}, {address.state} {address.zipCode}
              </ThemedText>
            </View>
          </View>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {order.status === 'delivered' && (
            <Button
              title="Reorder"
              onPress={handleReorder}
              icon="refresh-outline"
              style={styles.actionButton}
            />
          )}
          
          {order.status === 'pending' && (
            <Button
              title="Cancel Order"
              onPress={handleCancelOrder}
              variant="outline"
              icon="close-circle-outline"
              style={styles.actionButton}
            />
          )}
          
          <Button
            title="Need Help?"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/support/chat');
            }}
            variant="outline"
            icon="help-circle-outline"
            style={styles.actionButton}
          />
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
  },
  trackButton: {
    marginTop: 16,
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: 0,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoLabel: {
    opacity: 0.7,
  },
  infoValue: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  itemsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
  },
  itemQuantity: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.7,
  },
  itemTotal: {
    alignSelf: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  addressContainer: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressText: {
    marginBottom: 4,
  },
  actionButtonsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
});