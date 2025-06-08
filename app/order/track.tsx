import { Button } from '@/components/common/Button';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MockDataService, { MockOrder } from '@/services/mock-data.service';
import OrderService from '@/services/order.service';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    AccessibilityInfo,
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Linking,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

// Professional constants and types
const { width } = Dimensions.get('window');
const ANIMATION_DURATION = 1000;
const REFRESH_INTERVAL = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;

// Status configuration with proper typing
const STATUS_CONFIG = {
  pending: {
    icon: 'time-outline' as const,
    color: '#F5A623',
    label: 'Order Placed',
    description: 'Waiting for confirmation',
  },
  confirmed: {
    icon: 'checkmark-circle-outline' as const,
    color: '#4A90E2',
    label: 'Confirmed',
    description: 'Order confirmed, preparing for dispatch',
  },
  processing: {
    icon: 'construct-outline' as const,
    color: '#9B59B6',
    label: 'Processing',
    description: 'Order is being prepared',
  },
  dispatched: {
    icon: 'bicycle-outline' as const,
    color: '#7ED321',
    label: 'Dispatched',
    description: 'On the way to you',
  },
  delivered: {
    icon: 'bag-check-outline' as const,
    color: '#50E3C2',
    label: 'Delivered',
    description: 'Successfully delivered',
  },
  cancelled: {
    icon: 'close-circle-outline' as const,
    color: '#FF3B30',
    label: 'Cancelled',
    description: 'Order cancelled',
  },
} as const;

type OrderStatus = keyof typeof STATUS_CONFIG;

interface TrackingState {
  order: MockOrder | null;
  address: any | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  retryCount: number;
}

/**
 * Professional Order Tracking Screen
 * Features: Real-time updates, accessibility, error handling, animations
 */
function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Performance-optimized refs
  const progressAnimationRef = useRef(new Animated.Value(0)).current;
  const pulseAnimationRef = useRef(new Animated.Value(1)).current;
  const isMountedRef = useRef(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  
  // Centralized state management
  const [trackingState, setTrackingState] = useState<TrackingState>({
    order: null,
    address: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    retryCount: 0,
  });

  // Memoized calculations for performance
  const orderProgress = useMemo(() => {
    if (!trackingState.order?.statusUpdates) return { activeStep: 0, progress: 0 };
    
    const statusOrder = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered'];
    const currentStatus = trackingState.order.status;
    const activeStep = Math.max(0, statusOrder.indexOf(currentStatus));
    const progress = activeStep / (statusOrder.length - 1);
    
    return { activeStep, progress };
  }, [trackingState.order?.status, trackingState.order?.statusUpdates]);

  const deliveryPartnerInfo = useMemo(() => {
    if (!trackingState.order?.deliveryPartner) return null;
    return MockDataService.getDeliveryPartnerInfo(trackingState.order.deliveryPartner);
  }, [trackingState.order?.deliveryPartner]);

  // Professional load function with retry logic and error handling
  const loadOrderDetails = useCallback(async (showRefreshing = false) => {
    if (!isMountedRef.current) return;

    try {
      setTrackingState(prev => ({
        ...prev,
        isLoading: !showRefreshing,
        isRefreshing: showRefreshing,
        error: null,
      }));

      if (!id) {
        throw new Error('Order ID is required');
      }

      // Add network simulation delay for better UX
      await MockDataService.simulateNetworkDelay(500);

      let orderData: MockOrder | null = null;
      let addressData: any = null;

      try {
        // Try API first
        const apiOrder = await OrderService.getOrderById(Number(id));
        orderData = apiOrder as MockOrder;
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        // Fallback to mock data
        orderData = MockDataService.getOrderById(Number(id));
      }

      if (!orderData) {
        throw new Error('Order not found');
      }

      // Get address data
      if (orderData.addressId) {
        addressData = MockDataService.getAddressById(orderData.addressId);
      }

      if (!isMountedRef.current) return;

      setTrackingState(prev => ({
        ...prev,
        order: orderData,
        address: addressData,
        isLoading: false,
        isRefreshing: false,
        error: null,
        retryCount: 0,
      }));

      // Animate progress with smooth transition
      Animated.timing(progressAnimationRef, {
        toValue: orderProgress.progress,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }).start();

      // Start pulse animation for active orders
      if (orderData.status !== 'delivered' && orderData.status !== 'cancelled') {
        startPulseAnimation();
      }

      // Announce to screen readers
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(
          `Order ${orderData.id} is ${STATUS_CONFIG[orderData.status as OrderStatus]?.label || orderData.status}`
        );
      }

    } catch (error: any) {
      if (!isMountedRef.current) return;

      console.error('Error loading order details:', error);
      
      setTrackingState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: error.message || 'Failed to load order details',
        retryCount: prev.retryCount + 1,
      }));

      if (!showRefreshing && trackingState.retryCount < MAX_RETRY_ATTEMPTS) {
        Alert.alert(
          'Connection Error',
          'Unable to load order details. Please check your internet connection.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: () => loadOrderDetails() },
            { text: 'Go Back', onPress: () => router.back() }
          ]
        );
      }
    }
  }, [id, orderProgress.progress, trackingState.retryCount]);

  // Pulse animation for active orders
  const startPulseAnimation = useCallback(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimationRef, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimationRef, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isMountedRef.current && 
            trackingState.order?.status !== 'delivered' && 
            trackingState.order?.status !== 'cancelled') {
          pulse();
        }
      });
    };
    pulse();
  }, [pulseAnimationRef, trackingState.order?.status]);

  // Professional contact handlers with haptic feedback
  const handleContactDeliveryPartner = useCallback(() => {
    if (!deliveryPartnerInfo?.phone) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Contact Delivery Partner',
      `Call ${trackingState.order?.deliveryPartner}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL(`tel:${deliveryPartnerInfo.phone}`)
        }
      ]
    );
  }, [deliveryPartnerInfo, trackingState.order?.deliveryPartner]);

  const handleTrackExternally = useCallback(() => {
    if (!deliveryPartnerInfo?.website) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(deliveryPartnerInfo.website);
  }, [deliveryPartnerInfo]);

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadOrderDetails(true);
  }, [loadOrderDetails]);

  // Professional date formatting
  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  }, []);

  const getEstimatedDeliveryText = useCallback(() => {
    if (!trackingState.order) return '';
    
    const { order } = trackingState;
    
    if (order.status === 'delivered') {
      const deliveredUpdate = order.statusUpdates.find(update => update.status === 'delivered');
      return deliveredUpdate ? `Delivered on ${formatDate(deliveredUpdate.timestamp)}` : 'Delivered';
    }
    
    if (order.status === 'cancelled') {
      return 'Order cancelled';
    }
    
    return order.estimatedDelivery ? `Estimated delivery by ${formatDate(order.estimatedDelivery)}` : '';
  }, [trackingState.order, formatDate]);

  // Effects
  useEffect(() => {
    loadOrderDetails();
    
    // Set up auto-refresh for active orders
    if (trackingState.order?.status && 
        trackingState.order.status !== 'delivered' && 
        trackingState.order.status !== 'cancelled') {
      refreshIntervalRef.current = setInterval(() => {
        loadOrderDetails(true);
      }, REFRESH_INTERVAL);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [loadOrderDetails]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Render functions
  const renderStatusTimeline = useCallback(() => {
    if (!trackingState.order?.statusUpdates) return null;

    return (
      <View style={styles.timelineContainer}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Order Timeline
        </ThemedText>
        
        {trackingState.order.statusUpdates.map((update, index) => {
          const isActive = index <= orderProgress.activeStep;
          const statusConfig = STATUS_CONFIG[update.status as OrderStatus];
          
          return (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View
                  style={[
                    styles.timelineIcon,
                    {
                      backgroundColor: isActive ? (statusConfig?.color || colors.tint) : colors.border,
                    }
                  ]}
                >
                  <Ionicons
                    name={statusConfig?.icon || 'help-circle-outline'}
                    size={20}
                    color={isActive ? '#FFFFFF' : colors.tabIconDefault}
                  />
                </View>
                {index < trackingState.order.statusUpdates.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor: isActive ? colors.tint : colors.border,
                      }
                    ]}
                  />
                )}
              </View>
              
              <View style={styles.timelineContent}>
                <ThemedText
                  style={[
                    styles.timelineTitle,
                    { color: isActive ? colors.text : colors.tabIconDefault }
                  ]}
                >
                  {statusConfig?.label || update.status}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.timelineMessage,
                    { color: colors.tabIconDefault }
                  ]}
                >
                  {update.message}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.timelineTime,
                    { color: colors.tabIconDefault }
                  ]}
                >
                  {formatDate(update.timestamp)}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </View>
    );
  }, [trackingState.order, orderProgress.activeStep, colors, formatDate]);

  const renderOrderItems = useCallback(() => {
    if (!trackingState.order?.items) return null;

    return (
      <View style={styles.itemsContainer}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Order Items
        </ThemedText>
        
        {trackingState.order.items.map((item, index) => (
          <View key={index} style={[styles.orderItem, { borderBottomColor: colors.border }]}>
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              contentFit="cover"
              accessibilityLabel={`Image of ${item.productName}`}
            />
            
            <View style={styles.itemDetails}>
              <ThemedText style={[styles.itemName, { color: colors.text }]}>
                {item.productName}
              </ThemedText>
              <ThemedText style={[styles.itemQuantity, { color: colors.tabIconDefault }]}>
                Quantity: {item.quantity}
              </ThemedText>
              <ThemedText style={[styles.itemPrice, { color: colors.tint }]}>
                {formatCurrency(item.price)}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    );
  }, [trackingState.order, colors]);

  const renderDeliveryInfo = useCallback(() => {
    if (!trackingState.order || !trackingState.address) return null;

    return (
      <View style={styles.deliveryContainer}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Delivery Information
        </ThemedText>
        
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={colors.tint} />
            <View style={styles.infoContent}>
              <ThemedText style={[styles.infoLabel, { color: colors.tabIconDefault }]}>
                Delivery Address
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {trackingState.address.street}
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {trackingState.address.city}, {trackingState.address.state} {trackingState.address.zipCode}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color={colors.tint} />
            <View style={styles.infoContent}>
              <ThemedText style={[styles.infoLabel, { color: colors.tabIconDefault }]}>
                Delivery Partner
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {trackingState.order.deliveryPartner}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="barcode-outline" size={20} color={colors.tint} />
            <View style={styles.infoContent}>
              <ThemedText style={[styles.infoLabel, { color: colors.tabIconDefault }]}>
                Tracking ID
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {trackingState.order.trackingId}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    );
  }, [trackingState.order, trackingState.address, colors]);

  const renderActionButtons = useCallback(() => {
    if (!trackingState.order || !deliveryPartnerInfo) return null;

    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.tint }]}
          onPress={handleContactDeliveryPartner}
          accessibilityRole="button"
          accessibilityLabel="Contact delivery partner"
        >
          <Ionicons name="call-outline" size={20} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>
            Contact Partner
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={handleTrackExternally}
          accessibilityRole="button"
          accessibilityLabel="Track on partner website"
        >
          <Ionicons name="open-outline" size={20} color={colors.tint} />
          <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>
            Track Online
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }, [trackingState.order, deliveryPartnerInfo, colors, handleContactDeliveryPartner, handleTrackExternally]);

  // Loading state
  if (trackingState.isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Track Order' }} />
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={[styles.loadingText, { color: colors.text }]}>
          Loading order details...
        </ThemedText>
      </ThemedView>
    );
  }

  // Error state
  if (trackingState.error || !trackingState.order) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Order Not Found' }} />
        <Ionicons name="alert-circle-outline" size={64} color={colors.tabIconDefault} />
        <ThemedText style={[styles.errorTitle, { color: colors.text }]}>
          {trackingState.error ? 'Something went wrong' : 'Order not found'}
        </ThemedText>
        <ThemedText style={[styles.errorMessage, { color: colors.tabIconDefault }]}>
          {trackingState.error || 'The order you\'re looking for doesn\'t exist or has been removed.'}
        </ThemedText>
        <View style={styles.errorActions}>
          <Button
            title="Try Again"
            onPress={() => loadOrderDetails()}
            style={[styles.errorButton, { backgroundColor: colors.tint }]}
          />
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={[styles.errorButton, { backgroundColor: colors.border }]}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Track Order #${trackingState.order.id}`,
          headerShown: true,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={trackingState.isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
          />
        }
      >
        {/* Status Header */}
        <Animated.View 
          style={[
            styles.statusHeader,
            { 
              backgroundColor: colors.cardBackground,
              transform: [{ scale: pulseAnimationRef }]
            }
          ]}
        >
          <View style={styles.statusIconContainer}>
            <View
              style={[
                styles.statusIcon,
                { backgroundColor: STATUS_CONFIG[trackingState.order.status as OrderStatus]?.color || colors.tint }
              ]}
            >
              <Ionicons
                name={STATUS_CONFIG[trackingState.order.status as OrderStatus]?.icon || 'help-circle-outline'}
                size={32}
                color="#FFFFFF"
              />
            </View>
          </View>
          
          <ThemedText style={[styles.statusTitle, { color: colors.text }]}>
            {STATUS_CONFIG[trackingState.order.status as OrderStatus]?.label || trackingState.order.status}
          </ThemedText>
          
          <ThemedText style={[styles.statusDescription, { color: colors.tabIconDefault }]}>
            {STATUS_CONFIG[trackingState.order.status as OrderStatus]?.description || ''}
          </ThemedText>
          
          <ThemedText style={[styles.estimatedDelivery, { color: colors.tint }]}>
            {getEstimatedDeliveryText()}
          </ThemedText>
          
          <ThemedText style={[styles.orderTotal, { color: colors.text }]}>
            Total: {formatCurrency(trackingState.order.total)}
          </ThemedText>
        </Animated.View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.tint,
                  width: progressAnimationRef.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]}
            />
          </View>
        </View>

        {/* Timeline */}
        {renderStatusTimeline()}

        {/* Order Items */}
        {renderOrderItems()}

        {/* Delivery Info */}
        {renderDeliveryInfo()}

        {/* Action Buttons */}
        {renderActionButtons()}
      </ScrollView>
    </ThemedView>
  );
}

// Professional styles with accessibility and responsive design
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  errorButton: {
    minWidth: 100,
  },
  statusHeader: {
    padding: 24,
    alignItems: 'center',
    margin: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIconContainer: {
    marginBottom: 16,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  estimatedDelivery: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timelineContainer: {
    padding: 16,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
  },
  itemsContainer: {
    padding: 16,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deliveryContainer: {
    padding: 16,
    marginBottom: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8,
    minHeight: 44, // Accessibility
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// Export with Error Boundary
export default function OrderTrackingScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <OrderTrackingScreen />
    </ErrorBoundary>
  );
}