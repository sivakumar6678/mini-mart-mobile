import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Address } from '@/services/order.service';
import { addressSchema } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Mock addresses (same as in checkout screen)
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

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function AddressesScreen() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<AddressFormData>({
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

  const handleAddAddress = () => {
    reset();
    setEditingAddressId(null);
    setIsAddingAddress(true);
  };

  const handleEditAddress = (address: Address) => {
    setValue('street', address.street);
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('zipCode', address.zipCode);
    setEditingAddressId(address.id ?? null);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = (addressId: number) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Simulate API call
            const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
            setAddresses(updatedAddresses);
          }
        },
      ]
    );
  };

  const handleSetDefaultAddress = (addressId: number) => {
    // Simulate API call
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    setAddresses(updatedAddresses);
  };

  const onSubmit = (data: AddressFormData) => {
    if (editingAddressId) {
      // Update existing address
      const updatedAddresses = addresses.map(addr => {
        if (addr.id === editingAddressId) {
          return {
            ...addr,
            ...data,
          };
        }
        return addr;
      });
      setAddresses(updatedAddresses);
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now(),
        ...data,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
    }
    
    setIsAddingAddress(false);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'My Addresses' }} />
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'My Addresses' }} />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {isAddingAddress ? (
            <View style={styles.formContainer}>
              <ThemedText type="subtitle" style={styles.formTitle}>
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </ThemedText>
              
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
              
              <View style={styles.formButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setIsAddingAddress(false)}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <Button
                  title={editingAddressId ? 'Update' : 'Save'}
                  onPress={handleSubmit(onSubmit)}
                  style={styles.saveButton}
                />
              </View>
            </View>
          ) : (
            <>
              <Button
                title="Add New Address"
                onPress={handleAddAddress}
                fullWidth
                style={styles.addButton}
              />
              
              {addresses.length > 0 ? (
                <View style={styles.addressList}>
                  {addresses.map((address) => (
                    <View
                      key={address.id}
                      style={[styles.addressCard, { backgroundColor: colors.cardBackground }]}
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
                      
                      <View style={styles.addressActions}>
                        {!address.isDefault && (
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => address.id !== undefined && handleSetDefaultAddress(address.id)}
                          >
                            <Ionicons name="star-outline" size={20} color={colors.text} />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEditAddress(address)}
                        >
                          <Ionicons name="pencil-outline" size={20} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => address.id !== undefined && handleDeleteAddress(address.id)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <ThemedView style={styles.emptyContainer}>
                  <Ionicons name="location-outline" size={60} color={colors.tabIconDefault} />
                  <ThemedText style={styles.emptyText}>
                    No addresses found
                  </ThemedText>
                  <ThemedText style={styles.emptySubtext}>
                    Add an address to make checkout easier
                  </ThemedText>
                </ThemedView>
              )}
            </>
          )}
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
  addButton: {
    marginBottom: 16,
  },
  addressList: {
    marginBottom: 24,
  },
  addressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressContent: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  addressDetails: {
    marginBottom: 8,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
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
  formContainer: {
    marginBottom: 24,
  },
  formTitle: {
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});