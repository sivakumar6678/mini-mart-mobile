import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Address } from '@/services/order.service';
import { formatCurrency } from '@/utils/formatCurrency';
import { addressSchema } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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

// Payment methods
const PAYMENT_METHODS = [
  { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline' as const },
  { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline' as const },
  { id: 'wallet', name: 'Digital Wallet', icon: 'wallet-outline' as const },
];

interface CheckoutFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

// Add error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class CheckoutErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Checkout Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ThemedView style={styles.errorContainer}>
          <ThemedText>Something went wrong. Please try again.</ThemedText>
          <Button
            title="Retry"
            onPress={() => this.setState({ hasError: false })}
          />
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

// Wrap the main component
export default function CheckoutScreenWithErrorBoundary() {
  return (
    <CheckoutErrorBoundary>
      <CheckoutScreen />
    </CheckoutErrorBoundary>
  );
}

export function CheckoutScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { cart, clearCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const successAnimation = useRef(new Animated.Value(0)).current;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  
  const deliveryFee = useMemo(() => 
    cart.total > 500 ? 0 : 40,
    [cart.total]
  );

  const totalWithDelivery = useMemo(() => 
    cart.total + deliveryFee,
    [cart.total, deliveryFee]
  );

  const { control, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  useEffect(() => {
    const loadAddresses = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          setAddresses(ADDRESSES);
          const defaultAddress = ADDRESSES.find(addr => addr.isDefault);
          setSelectedAddress(defaultAddress || null);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading addresses:', error);
        setIsLoading(false);
      }
    };

    if (user) {
      loadAddresses();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleAddressSelect = useCallback((address: Address) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAddress(address);
  }, []);

  const handlePaymentMethodSelect = useCallback((methodId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPaymentMethod(methodId);
  }, []);

  const handleAddAddress = async (data: CheckoutFormData) => {
    if (isSubmittingAddress) return;
    
    setIsSubmittingAddress(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (!data.street || !data.city || !data.state || !data.zipCode) {
        throw new Error('Please fill in all address fields');
      }
      
      const newAddress: Address = {
        id: Date.now(),
        ...data,
        isDefault: addresses.length === 0,
      };
      
      setAddresses([...addresses, newAddress]);
      setSelectedAddress(newAddress);
      setIsAddingAddress(false);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add address');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (isSubmitting) return;

    setIsPlacingOrder(true);
    setIsSubmitting(true);
    
    try {
      // Simulate API call to place order
      const response = await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90% success rate
            resolve({ success: true });
          } else {
            reject(new Error('Network error'));
          }
        }, 1000);
      });
      
      setOrderSuccess(true);
      
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => {
        clearCart();
        router.replace({
          pathname: '/order/confirmation',
          params: { orderId: Date.now().toString() }
        });
      }, 1500);
    } catch (error) {
      console.error('Error placing order:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        error instanceof Error 
          ? error.message 
          : 'Failed to place order. Please try again.'
      );
    } finally {
      setIsPlacingOrder(false);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      successAnimation.stopAnimation();
    };
  }, [successAnimation]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  if (authLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Checkout' }} />
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.notLoggedInContainer}>
        <Stack.Screen options={{ title: 'Checkout' }} />
        <View style={styles.authIconContainer}>
          <Ionicons name="person-circle-outline" size={80} color={colors.tabIconDefault} />
          <View style={[styles.authIconBadge, { backgroundColor: colors.tint }]}>
            <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
          </View>
        </View>
        
        <ThemedText type="subtitle" style={styles.notLoggedInText}>
          Please login to continue
        </ThemedText>
        <ThemedText style={styles.notLoggedInSubtext}>
          You need to be logged in to complete your purchase
        </ThemedText>
        <Button
          title="Login"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/auth/login');
          }}
          style={styles.loginButton}
        />
      </ThemedView>
    );
  }

  if (cart.items.length === 0) {
    return (
      <ThemedView style={styles.emptyCartContainer}>
        <Stack.Screen options={{ title: 'Checkout' }} />
        <View style={styles.emptyCartIconContainer}>
          <Ionicons name="cart-outline" size={80} color={colors.tabIconDefault} />
          <View style={[styles.emptyCartBadge, { backgroundColor: colors.tint }]}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </View>
        </View>
        
        <ThemedText type="subtitle" style={styles.emptyCartText}>
          Your cart is empty
        </ThemedText>
        <ThemedText style={styles.emptyCartSubtext}>
          Add some products to your cart before checkout
        </ThemedText>
        <Button
          title="Continue Shopping"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/');
          }}
          style={styles.continueButton}
        />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'Checkout',
          headerRight: () => (
            <View style={styles.headerRight}>
              <ThemedText style={styles.cartCount}>
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
              </ThemedText>
            </View>
          )
        }} />
        
        {orderSuccess && (
          <Animated.View 
            style={[
              styles.successOverlay,
              { 
                opacity: successAnimation,
                transform: [
                  { 
                    scale: successAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.1, 1]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={[styles.successContent, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.successIconContainer, { backgroundColor: colors.tint }]}>
                <Ionicons name="checkmark" size={40} color="#FFFFFF" />
              </View>
              <Text style={[styles.successTitle, { color: colors.text }]}>
                Order Placed Successfully!
              </Text>
              <Text style={[styles.successMessage, { color: colors.tabIconDefault }]}>
                Your order has been placed and is being processed
              </Text>
            </View>
          </Animated.View>
        )}
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Order Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={[styles.progressCircle, { backgroundColor: colors.tint }]}>
                <Ionicons name="cart" size={16} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.progressText}>Cart</ThemedText>
            </View>
            
            <View style={[styles.progressLine, { backgroundColor: colors.tint }]} />
            
            <View style={styles.progressStep}>
              <View style={[styles.progressCircle, { backgroundColor: colors.tint }]}>
                <Ionicons name="card" size={16} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.progressText}>Payment</ThemedText>
            </View>
            
            <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
            
            <View style={styles.progressStep}>
              <View style={[styles.progressCircle, { backgroundColor: colors.border }]}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.progressText}>Confirmation</ThemedText>
            </View>
          </View>
          
          {/* Order Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="receipt-outline" size={20} color={colors.tint} />
                <ThemedText type="subtitle" style={styles.sectionTitle}>Order Summary</ThemedText>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/cart');
                }}
              >
                <ThemedText style={{ color: colors.tint }}>Edit Cart</ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.summaryContainer, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.cartItemsPreview}>
                {cart.items.slice(0, 2).map((item) => (
                  <View key={item.product.id} style={styles.cartItemPreview}>
                    <Image
                      source={{ uri: item.product.images[0] }}
                      style={styles.cartItemImage}
                      contentFit="cover"
                    />
                    <View style={styles.cartItemInfo}>
                      <ThemedText style={styles.cartItemName} numberOfLines={1}>
                        {item.product.name}
                      </ThemedText>
                      <View style={styles.cartItemDetails}>
                        <ThemedText style={styles.cartItemPrice}>
                          {formatCurrency(item.product.discountedPrice || item.product.price)}
                        </ThemedText>
                        <ThemedText style={styles.cartItemQuantity}>
                          × {item.quantity}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                ))}
                
                {cart.items.length > 2 && (
                  <View style={[styles.moreItemsBadge, { backgroundColor: colors.tint + '20' }]}>
                    <ThemedText style={[styles.moreItemsText, { color: colors.tint }]}>
                      +{cart.items.length - 2} more items
                    </ThemedText>
                  </View>
                )}
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <View style={styles.summaryRow}>
                <ThemedText>Subtotal</ThemedText>
                <ThemedText>{formatCurrency(cart.total)}</ThemedText>
              </View>
              
              <View style={styles.summaryRow}>
                <ThemedText>Delivery Fee</ThemedText>
                {deliveryFee === 0 ? (
                  <ThemedText style={{ color: colors.tint }}>FREE</ThemedText>
                ) : (
                  <ThemedText>{formatCurrency(deliveryFee)}</ThemedText>
                )}
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
                <ThemedText type="defaultSemiBold">Total</ThemedText>
                <ThemedText type="subtitle" style={styles.totalAmount}>
                  {formatCurrency(totalWithDelivery)}
                </ThemedText>
              </View>
            </View>
          </View>
          
          {/* Delivery Address */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="location-outline" size={20} color={colors.tint} />
                <ThemedText type="subtitle" style={styles.sectionTitle}>Delivery Address</ThemedText>
              </View>
              
              {!isAddingAddress && addresses.length > 0 && (
                <TouchableOpacity 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsAddingAddress(true);
                  }}
                >
                  <ThemedText style={{ color: colors.tint }}>Add New</ThemedText>
                </TouchableOpacity>
              )}
            </View>
            
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.tint} style={styles.addressLoader} />
            ) : isAddingAddress ? (
              <View style={[styles.addAddressForm, { backgroundColor: colors.cardBackground }]}>
                <Controller
                  control={control}
                  name="street"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Street Address"
                      placeholder="Enter your street address"
                      value={value}
                      onChangeText={onChange}
                      error={errors.street?.message}
                      leftIcon="home-outline"
                    />
                  )}
                />
                
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="City"
                      placeholder="Enter your city"
                      value={value}
                      onChangeText={onChange}
                      error={errors.city?.message}
                      leftIcon="business-outline"
                    />
                  )}
                />
                
                <Controller
                  control={control}
                  name="state"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="State"
                      placeholder="Enter your state"
                      value={value}
                      onChangeText={onChange}
                      error={errors.state?.message}
                      leftIcon="map-outline"
                    />
                  )}
                />
                
                <Controller
                  control={control}
                  name="zipCode"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Zip Code"
                      placeholder="Enter your zip code"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      error={errors.zipCode?.message}
                      leftIcon="mail-outline"
                    />
                  )}
                />
                
                <View style={styles.addressFormButtons}>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsAddingAddress(false);
                    }}
                    variant="outline"
                    style={styles.cancelButton}
                  />
                  <Button
                    title="Save Address"
                    onPress={handleSubmit(handleAddAddress)}
                    style={styles.saveButton}
                  />
                </View>
              </View>
            ) : addresses.length > 0 ? (
              <View style={styles.addressList}>
                {addresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    style={[
                      styles.addressItem,
                      { backgroundColor: colors.cardBackground },
                      selectedAddress?.id === address.id && { 
                        borderColor: colors.tint,
                        backgroundColor: colors.tint + '10',
                      }
                    ]}
                    onPress={() => handleAddressSelect(address)}
                  >
                    <View style={styles.addressContent}>
                      <View style={styles.addressHeader}>
                        <Ionicons 
                          name="location" 
                          size={20} 
                          color={selectedAddress?.id === address.id ? colors.tint : colors.tabIconDefault} 
                        />
                        <ThemedText style={styles.addressText}>
                          {address.street}
                        </ThemedText>
                      </View>
                      
                      <ThemedText style={styles.addressDetails}>
                        {address.city}, {address.state} {address.zipCode}
                      </ThemedText>
                      
                      {address.isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.tint + '20' }]}>
                          <ThemedText style={[styles.defaultText, { color: colors.tint }]}>
                            Default
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    
                    {selectedAddress?.id === address.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ThemedView style={[styles.noAddressContainer, { borderColor: colors.border }]}>
                <Ionicons name="location-outline" size={40} color={colors.tabIconDefault} />
                <ThemedText style={styles.noAddressText}>
                  You don't have any saved addresses
                </ThemedText>
                <Button
                  title="Add Address"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsAddingAddress(true);
                  }}
                  style={styles.addAddressButton}
                  icon="add-outline"
                />
              </ThemedView>
            )}
          </View>
          
          {/* Payment Method */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="wallet-outline" size={20} color={colors.tint} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>Payment Method</ThemedText>
            </View>
            
            <View style={styles.paymentMethodsList}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  accessible={true}
                  accessibilityLabel={`Select ${method.name} payment method`}
                  accessibilityRole="button"
                  key={method.id}
                  style={[
                    styles.paymentMethodItem,
                    { backgroundColor: colors.cardBackground },
                    selectedPaymentMethod === method.id && { 
                      borderColor: colors.tint,
                      backgroundColor: colors.tint + '10',
                    }
                  ]}
                  onPress={() => handlePaymentMethodSelect(method.id)}
                >
                  <View style={styles.paymentMethodContent}>
                    <Ionicons 
                      name={method.icon} 
                      size={24} 
                      color={selectedPaymentMethod === method.id ? colors.tint : colors.text} 
                    />
                    <ThemedText style={styles.paymentMethodName}>{method.name}</ThemedText>
                  </View>
                  
                  {selectedPaymentMethod === method.id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Delivery Options */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="bicycle-outline" size={20} color={colors.tint} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>Delivery Options</ThemedText>
            </View>
            
            <View style={[styles.deliveryOptionsContainer, { backgroundColor: colors.cardBackground }]}>
              <TouchableOpacity 
                style={[
                  styles.deliveryOption,
                  { borderColor: colors.tint }
                ]}
              >
                <View style={styles.deliveryOptionContent}>
                  <Ionicons name="flash-outline" size={24} color={colors.tint} />
                  <View style={styles.deliveryOptionInfo}>
                    <ThemedText style={styles.deliveryOptionTitle}>Express Delivery</ThemedText>
                    <ThemedText style={styles.deliveryOptionDescription}>
                      Delivery within 2 hours
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[styles.deliveryOptionPrice, { color: colors.tint }]}>
                  {formatCurrency(deliveryFee)}
                </ThemedText>
              </TouchableOpacity>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <View style={styles.deliveryTimeContainer}>
                <ThemedText style={styles.deliveryTimeLabel}>Estimated Delivery Time:</ThemedText>
                <ThemedText style={styles.deliveryTime}>Today, 6:00 PM - 8:00 PM</ThemedText>
              </View>
            </View>
          </View>
          
          {/* Place Order Button */}
          <Button
            title={isPlacingOrder ? 'Processing Order...' : 'Place Order'}
            onPress={handlePlaceOrder}
            loading={isPlacingOrder}
            disabled={isPlacingOrder || !selectedAddress}
            fullWidth
            style={styles.placeOrderButton}
            icon={isPlacingOrder ? undefined : "checkmark-circle-outline"}
          />
          
          <View style={styles.secureCheckoutContainer}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.tabIconDefault} />
            <ThemedText style={styles.secureCheckoutText}>
              Secure Checkout - Your data is protected
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRight: {
    marginRight: 8,
  },
  cartCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  authIconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  authIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notLoggedInText: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
  },
  notLoggedInSubtext: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.7,
    maxWidth: '80%',
  },
  loginButton: {
    minWidth: 160,
    height: 50,
    borderRadius: 12,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyCartIconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  emptyCartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyCartSubtext: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.7,
    maxWidth: '80%',
  },
  continueButton: {
    minWidth: 200,
    height: 50,
    borderRadius: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
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
  cartItemsPreview: {
    marginBottom: 16,
  },
  cartItemPreview: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  cartItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  cartItemQuantity: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.7,
  },
  moreItemsBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  moreItemsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
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
    fontSize: 20,
    fontWeight: '700',
  },
  addressLoader: {
    marginVertical: 20,
  },
  addressList: {
    marginBottom: 8,
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressContent: {
    flex: 1,
    marginRight: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addressDetails: {
    marginBottom: 8,
    marginLeft: 28,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 28,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noAddressContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  noAddressText: {
    marginVertical: 16,
    textAlign: 'center',
  },
  addAddressButton: {
    minWidth: 160,
    height: 45,
    borderRadius: 12,
  },
  addAddressForm: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  addressFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    height: 45,
    borderRadius: 12,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    height: 45,
    borderRadius: 12,
  },
  paymentMethodsList: {
    marginBottom: 8,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  deliveryOptionsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderRadius: 16,
  },
  deliveryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryOptionInfo: {
    marginLeft: 12,
  },
  deliveryOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deliveryOptionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  deliveryOptionPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  deliveryTimeContainer: {
    padding: 16,
  },
  deliveryTimeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeOrderButton: {
    height: 55,
    borderRadius: 16,
    marginBottom: 16,
  },
  secureCheckoutContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  secureCheckoutText: {
    fontSize: 12,
    marginLeft: 6,
    opacity: 0.7,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContent: {
    width: '80%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});