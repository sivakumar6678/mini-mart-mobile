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
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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

interface CheckoutFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function CheckoutScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { cart, clearCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleAddAddress = async (data: CheckoutFormData) => {
    // Simulate adding a new address
    const newAddress: Address = {
      id: Date.now(),
      ...data,
      isDefault: addresses.length === 0,
    };
    
    setAddresses([...addresses, newAddress]);
    setSelectedAddress(newAddress);
    setIsAddingAddress(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Simulate API call to place order
      setTimeout(() => {
        // Clear cart after successful order
        clearCart();
        
        // Navigate to order confirmation
        router.replace({
          pathname: '/order/confirmation',
          params: { orderId: Date.now().toString() }
        });
      }, 1000);
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
      setIsPlacingOrder(false);
    }
  };

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
        <Ionicons name="person-circle-outline" size={60} color={colors.tabIconDefault} />
        <ThemedText type="subtitle" style={styles.notLoggedInText}>
          Please login to continue
        </ThemedText>
        <ThemedText style={styles.notLoggedInSubtext}>
          You need to be logged in to complete your purchase
        </ThemedText>
        <Button
          title="Login"
          onPress={() => router.push('/auth/login')}
          style={styles.loginButton}
        />
      </ThemedView>
    );
  }

  if (cart.items.length === 0) {
    return (
      <ThemedView style={styles.emptyCartContainer}>
        <Stack.Screen options={{ title: 'Checkout' }} />
        <Ionicons name="cart-outline" size={60} color={colors.tabIconDefault} />
        <ThemedText type="subtitle" style={styles.emptyCartText}>
          Your cart is empty
        </ThemedText>
        <ThemedText style={styles.emptyCartSubtext}>
          Add some products to your cart before checkout
        </ThemedText>
        <Button
          title="Continue Shopping"
          onPress={() => router.push('/')}
          style={styles.continueButton}
        />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Checkout' }} />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Order Summary</ThemedText>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <ThemedText>Items ({cart.items.length})</ThemedText>
                <ThemedText>{formatCurrency(cart.total)}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText>Delivery Fee</ThemedText>
                <ThemedText>{formatCurrency(40)}</ThemedText>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <ThemedText type="defaultSemiBold">Total</ThemedText>
                <ThemedText type="defaultSemiBold">{formatCurrency(cart.total + 40)}</ThemedText>
              </View>
            </View>
          </View>
          
          {/* Delivery Address */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Delivery Address</ThemedText>
              {!isAddingAddress && addresses.length > 0 && (
                <TouchableOpacity onPress={() => setIsAddingAddress(true)}>
                  <ThemedText style={{ color: colors.tint }}>Add New</ThemedText>
                </TouchableOpacity>
              )}
            </View>
            
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.tint} style={styles.addressLoader} />
            ) : isAddingAddress ? (
              <View style={styles.addAddressForm}>
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
                    />
                  )}
                />
                
                <View style={styles.addressFormButtons}>
                  <Button
                    title="Cancel"
                    onPress={() => setIsAddingAddress(false)}
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
                      selectedAddress?.id === address.id && { 
                        borderColor: colors.tint,
                        backgroundColor: colors.tint + '10',
                      }
                    ]}
                    onPress={() => handleAddressSelect(address)}
                  >
                    <View style={styles.addressContent}>
                      <ThemedText style={styles.addressText}>
                        {address.street}
                      </ThemedText>
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
              <ThemedView style={styles.noAddressContainer}>
                <ThemedText style={styles.noAddressText}>
                  You don't have any saved addresses
                </ThemedText>
                <Button
                  title="Add Address"
                  onPress={() => setIsAddingAddress(true)}
                  style={styles.addAddressButton}
                />
              </ThemedView>
            )}
          </View>
          
          {/* Payment Method - In a real app, this would be implemented */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Payment Method</ThemedText>
            <ThemedView style={styles.paymentContainer}>
              <ThemedText>Cash on Delivery</ThemedText>
              <Ionicons name="cash-outline" size={24} color={colors.text} />
            </ThemedView>
          </View>
          
          {/* Place Order Button */}
          <Button
            title={isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            onPress={handlePlaceOrder}
            loading={isPlacingOrder}
            disabled={isPlacingOrder || !selectedAddress}
            fullWidth
            style={styles.placeOrderButton}
          />
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
  notLoggedInText: {
    marginTop: 16,
  },
  notLoggedInSubtext: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.7,
  },
  loginButton: {
    minWidth: 120,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyCartText: {
    marginTop: 16,
  },
  emptyCartSubtext: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.7,
  },
  continueButton: {
    minWidth: 180,
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
  summaryContainer: {
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  addressContent: {
    flex: 1,
    marginRight: 8,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  addressDetails: {
    marginBottom: 4,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noAddressContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  noAddressText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  addAddressButton: {
    minWidth: 140,
  },
  addAddressForm: {
    marginBottom: 16,
  },
  addressFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  placeOrderButton: {
    marginBottom: 24,
  },
});