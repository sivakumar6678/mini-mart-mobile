import { Button } from '@/components/common/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import OrderService, { Order } from '@/services/order.service';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

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
    deliveryPartner: 'Express Delivery',
    trackingId: 'EXP12345678',
    estimatedDelivery: '2023-06-16T18:00:00Z',
    statusUpdates: [
      { status: 'pending', timestamp: '2023-06-15T10:30:00Z', message: 'Order placed' },
      { status: 'confirmed', timestamp: '2023-06-15T11:15:00Z', message: 'Order confirmed' },
      { status: 'processing', timestamp: '2023-06-15T14:30:00Z', message: 'Order is being prepared' },
      { status: 'dispatched', timestamp: '2023-06-16T09:45:00Z', message: 'Order dispatched' },
      { status: 'delivered', timestamp: '2023-06-16T14:20:00Z', message: 'Order delivered' },
    ],
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
    deliveryPartner: 'Fast Track',
    trackingId: 'FT87654321',
    estimatedDelivery: '2023-06-22T12:00:00Z',
    statusUpdates: [
      { status: 'pending', timestamp: '2023-06-20T14:45:00Z', message: 'Order placed' },
      { status: 'confirmed', timestamp: '2023-06-20T15:30:00Z', message: 'Order confirmed' },
      { status: 'processing', timestamp: '2023-06-21T08:15:00Z', message: 'Order is being prepared' },
      { status: 'dispatched', timestamp: '2023-06-21T09:30:00Z', message: 'Order dispatched' },
    ],
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
    deliveryPartner: 'Express Delivery',
    trackingId: 'EXP98765432',
    estimatedDelivery: '2023-06-26T18:00:00Z',
    statusUpdates: [
      { status: 'pending', timestamp: '2023-06-25T09:15:00Z', message: 'Order placed' },
      { status: 'confirmed', timestamp: '2023-06-25T10:00:00Z', message: 'Order confirmed' },
    ],
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
    deliveryPartner: 'Fast Track',
    trackingId: 'FT12345678',
    estimatedDelivery: '2023-06-30T12:00:00Z',
    statusUpdates: [
      { status: 'pending', timestamp: '2023-06-28T16:20:00Z', message: 'Order placed' },
    ],
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

// Delivery partner contact info
const DELIVERY_PARTNERS = {
  'Express Delivery': {
    phone: '+91 9876543210',
    email: 'support@expressdelivery.com',
    website: 'https://expressdelivery.com',
  },
  'Fast Track': {
    phone: '+91 9876543211',
    email: 'support@fasttrack.com',
    website: 'https://fasttrack.com',
  },
};

interface StatusUpdate {
  status: string;
  timestamp: string;
  message: string;
}

interface ExtendedOrder extends Order {
  deliveryPartner: string;
  trackingId: string;
  estimatedDelivery: string;
  statusUpdates: StatusUpdate[];
}

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [address, setAddress] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  const loadOrderDetails = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      if (!id) {
        throw new Error('Order ID is required');
      }

      try {
        const orderData = await OrderService.getOrderById(Number(id));
        setOrder(orderData as ExtendedOrder);
        
        // Set active step based on order status
        const statusSteps = ['pending', 'confirmed', 'dispatched', 'delivered'];
        const currentStepIndex = statusSteps.indexOf(orderData.status);
        setActiveStep(Math.max(0, currentStepIndex));
        
        // Animate progress
        Animated.timing(progressAnimation, {
          toValue: Math.max(0, currentStepIndex),
          duration: 1000,
          useNativeDriver: false,
        }).start();
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        // Use mock data as fallback
        const foundOrder = ORDERS.find(o => o.id === Number(id)) as ExtendedOrder;
        if (foundOrder) {
          setOrder(foundOrder);
          
          if (foundOrder.statusUpdates) {
            setActiveStep(foundOrder.statusUpdates.length - 1);
            
            // Animate progress
            Animated.timing(progressAnimation, {
              toValue: foundOrder.statusUpdates.length - 1,
              duration: 1000,
              useNativeDriver: false,
            }).start();
          }
        } else {
          throw new Error('Order not found');
        }
      }

    } catch (error: any) {
      console.error('Error loading order details:', error);
      setError(error.message || 'Failed to load order details');
      
      if (showRefreshing) {
        // Don't show alert on refresh
        console.log('Failed to refresh order data');
      } else {
        Alert.alert(
          'Error',
          'Order not found or failed to load. Please try again.',
          [
            { text: 'Retry', onPress: () => loadOrderDetails() },
            { text: 'Back', onPress: () => router.back() }
          ]
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id, progressAnimation]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadOrderDetails(true);
  }, [loadOrderDetails]);

  const handleContactDeliveryPartner = () => {
    if (order?.deliveryPartner) {
      const partnerInfo = DELIVERY_PARTNERS[order.deliveryPartner as keyof typeof DELIVERY_PARTNERS];
      if (partnerInfo) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL(`tel:${partnerInfo.phone}`);
      }
    }
  };

  const handleTrackExternally = () => {
    if (order?.deliveryPartner && order?.trackingId) {
      const partnerInfo = DELIVERY_PARTNERS[order.deliveryPartner as keyof typeof DELIVERY_PARTNERS];
      if (partnerInfo) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL(partnerInfo.website);
      }
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

  const getDeliveryStatus = () => {
    if (!order) return '';
    
    switch (order.status) {
      case 'pending':
        return 'Waiting for confirmation';
      case 'confirmed':
        return 'Order confirmed, preparing for dispatch';
      case 'dispatched':
        return 'On the way to you';
      case 'delivered':
        return 'Successfully delivered';
      case 'cancelled':
        return 'Order cancelled';
      default:
        return '';
    }
  };

  const getEstimatedDeliveryText = () => {
    if (!order || !order.estimatedDelivery) return '';
    
    if (order.status === 'delivered') {
      return 'Delivered on ' + formatDate(order.statusUpdates[order.statusUpdates.length - 1].timestamp);
    }
    
    if (order.status === 'cancelled') {
      return 'Order cancelled';
    }
    
    return 'Estimated delivery by ' + formatDate(order.estimatedDelivery);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Track Order' }} />
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
      <Stack.Screen options={{ title: `Track Order #${order.id}` }} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
          />
        }
      >
        {/* Delivery Status Card */}
        <View style={[styles.deliveryStatusCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.deliveryStatusHeader}>
            <View>
              <ThemedText style={styles.deliveryStatusTitle}>
                {getDeliveryStatus()}
              </ThemedText>
              <ThemedText style={styles.estimatedDelivery}>
                {getEstimatedDeliveryText()}
              </ThemedText>
            </View>
            <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              <Ionicons name={getStatusIcon(order.status) as any} size={24} color={getStatusColor(order.status)} />
            </View>
          </View>
          
          {order.deliveryPartner && order.trackingId && (
            <View style={styles.trackingInfo}>
              <View style={styles.trackingDetail}>
                <ThemedText style={styles.trackingLabel}>Delivery Partner</ThemedText>
                <ThemedText style={styles.trackingValue}>{order.deliveryPartner}</ThemedText>
              </View>
              <View style={styles.trackingDetail}>
                <ThemedText style={styles.trackingLabel}>Tracking ID</ThemedText>
                <ThemedText style={styles.trackingValue}>{order.trackingId}</ThemedText>
              </View>
            </View>
          )}
          
          {order.status === 'dispatched' && (
            <View style={styles.actionButtons}>
              <Button
                title="Contact Delivery Partner"
                onPress={handleContactDeliveryPartner}
                variant="outline"
                icon="call-outline"
                style={styles.actionButton}
              />
              <Button
                title="Track Externally"
                onPress={handleTrackExternally}
                icon="open-outline"
                style={styles.actionButton}
              />
            </View>
          )}
        </View>
        
        {/* Order Progress */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Order Progress</ThemedText>
          
          <View style={styles.progressContainer}>
            {order.statusUpdates.map((update, index) => {
              const isActive = index <= activeStep;
              const isLast = index === order.statusUpdates.length - 1;
              
              return (
                <View key={index} style={styles.progressStep}>
                  <View style={styles.stepIconContainer}>
                    <View 
                      style={[
                        styles.stepIcon, 
                        { 
                          backgroundColor: isActive ? getStatusColor(update.status) : colors.border,
                        }
                      ]}
                    >
                      <Ionicons 
                        name={getStatusIcon(update.status) as any} 
                        size={16} 
                        color="#FFFFFF" 
                      />
                    </View>
                    {!isLast && (
                      <Animated.View 
                        style={[
                          styles.progressLine,
                          {
                            backgroundColor: colors.border,
                          }
                        ]}
                      >
                        <Animated.View 
                          style={[
                            styles.progressLineFill,
                            {
                              backgroundColor: getStatusColor(update.status),
                              width: progressAnimation.interpolate({
                                inputRange: [index, index + 1],
                                outputRange: ['0%', '100%'],
                                extrapolate: 'clamp',
                              }),
                            }
                          ]}
                        />
                      </Animated.View>
                    )}
                  </View>
                  
                  <View style={styles.stepContent}>
                    <ThemedText style={[
                      styles.stepTitle,
                      isActive ? { color: getStatusColor(update.status), fontWeight: '600' } : {}
                    ]}>
                      {update.message}
                    </ThemedText>
                    <ThemedText style={styles.stepTime}>
                      {formatDate(update.timestamp)}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        
        {/* Order Items */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Order Items</ThemedText>
          
          <View style={[styles.itemsContainer, { backgroundColor: colors.cardBackground }]}>
            {order.items.map((item: any, index: number) => (
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
            
            <View style={[styles.orderSummary, { borderTopColor: colors.border }]}>
              <View style={styles.summaryRow}>
                <ThemedText>Subtotal</ThemedText>
                <ThemedText>{formatCurrency(order.total - 40)}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText>Delivery Fee</ThemedText>
                <ThemedText>{formatCurrency(40)}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText type="defaultSemiBold">Total</ThemedText>
                <ThemedText type="defaultSemiBold">{formatCurrency(order.total)}</ThemedText>
              </View>
            </View>
          </View>
        </View>
        
        {/* Delivery Address */}
        {address && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Delivery Address</ThemedText>
            <View style={[styles.addressContainer, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.addressHeader}>
                <Ionicons name="location" size={20} color={colors.tint} />
                <ThemedText style={styles.addressTitle}>Delivery Location</ThemedText>
              </View>
              <ThemedText style={styles.addressText}>{address.street}</ThemedText>
              <ThemedText style={styles.addressText}>
                {address.city}, {address.state} {address.zipCode}
              </ThemedText>
            </View>
          </View>
        )}
        
        {/* Support Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Need Help?</ThemedText>
          <View style={[styles.supportContainer, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity 
              style={styles.supportOption}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/support/chat');
              }}
            >
              <View style={[styles.supportIconContainer, { backgroundColor: colors.tint + '20' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.tint} />
              </View>
              <View style={styles.supportContent}>
                <ThemedText style={styles.supportTitle}>Chat with Support</ThemedText>
                <ThemedText style={styles.supportDescription}>Get instant help from our team</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity 
              style={styles.supportOption}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL('tel:+919876543210');
              }}
            >
              <View style={[styles.supportIconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
                <Ionicons name="call-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.supportContent}>
                <ThemedText style={styles.supportTitle}>Call Customer Service</ThemedText>
                <ThemedText style={styles.supportDescription}>Available 9 AM - 9 PM</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Button
            title="View Order Details"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/profile/orders/${order.id}`);
            }}
            variant="outline"
            icon="document-text-outline"
            style={styles.viewDetailsButton}
          />
          
          <Button
            title="Back to Orders"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/profile/orders');
            }}
            icon="list-outline"
            style={styles.backToOrdersButton}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  deliveryStatusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deliveryStatusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  estimatedDelivery: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  trackingDetail: {
    flex: 1,
  },
  trackingLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  trackingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  progressContainer: {
    paddingLeft: 8,
  },
  progressStep: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLine: {
    width: 2,
    height: 40,
    overflow: 'hidden',
  },
  progressLineFill: {
    width: '100%',
    height: '100%',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 8,
  },
  stepTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  stepTime: {
    fontSize: 12,
    opacity: 0.7,
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
  orderSummary: {
    padding: 16,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addressText: {
    marginBottom: 4,
    paddingLeft: 28,
  },
  supportContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  supportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  supportDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  actionButtonsContainer: {
    marginBottom: 24,
  },
  viewDetailsButton: {
    marginBottom: 12,
  },
  backToOrdersButton: {
    marginBottom: 12,
  },
});