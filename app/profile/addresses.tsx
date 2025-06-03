import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useAuth } from '../../context/AuthContext';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Address } from '../../types';

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, error, clearError } = useAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleAddAddress = async () => {
    if (!name || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const newAddress: Address = {
        id: Date.now().toString(),
        userId: user!.id,
        name,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        isDefault: addresses.length === 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // TODO: Call API to add address
      setAddresses([...addresses, newAddress]);
      resetForm();
      setIsAdding(false);
    } catch (error) {
      console.error('Add address error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = async (addressId: string) => {
    const address = addresses.find((a) => a.id === addressId);
    if (!address) return;

    setName(address.name);
    setPhone(address.phone);
    setAddressLine1(address.addressLine1);
    setAddressLine2(address.addressLine2 || '');
    setCity(address.city);
    setState(address.state);
    setPostalCode(address.postalCode);
    setCountry(address.country);
    setIsEditing(addressId);
  };

  const handleUpdateAddress = async () => {
    if (!isEditing) return;

    if (!name || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const updatedAddress: Address = {
        ...addresses.find((a) => a.id === isEditing)!,
        name,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        updatedAt: new Date().toISOString(),
      };

      // TODO: Call API to update address
      setAddresses(addresses.map((a) => (a.id === isEditing ? updatedAddress : a)));
      resetForm();
      setIsEditing(null);
    } catch (error) {
      console.error('Update address error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              // TODO: Call API to delete address
              setAddresses(addresses.filter((a) => a.id !== addressId));
            } catch (error) {
              console.error('Delete address error:', error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setIsLoading(true);
      // TODO: Call API to set default address
      setAddresses(
        addresses.map((a) => ({
          ...a,
          isDefault: a.id === addressId,
        }))
      );
    } catch (error) {
      console.error('Set default address error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('');
  };

  const renderAddress = ({ item: address }: { item: Address }) => (
    <View style={[styles.addressCard, { borderColor }]}>
      <View style={styles.addressHeader}>
        <View style={styles.addressInfo}>
          <ThemedText style={styles.addressName}>{address.name}</ThemedText>
          {address.isDefault && (
            <View style={[styles.defaultBadge, { backgroundColor: borderColor }]}>
              <ThemedText style={styles.defaultText}>Default</ThemedText>
            </View>
          )}
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity
            onPress={() => handleEditAddress(address.id)}
            style={styles.actionButton}
          >
            <Ionicons name="pencil-outline" size={20} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteAddress(address.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>
      <ThemedText style={styles.addressPhone}>{address.phone}</ThemedText>
      <ThemedText style={styles.addressText}>
        {address.addressLine1}
        {address.addressLine2 ? `, ${address.addressLine2}` : ''}
      </ThemedText>
      <ThemedText style={styles.addressText}>
        {address.city}, {address.state} {address.postalCode}
      </ThemedText>
      <ThemedText style={styles.addressText}>{address.country}</ThemedText>
      {!address.isDefault && (
        <TouchableOpacity
          onPress={() => handleSetDefault(address.id)}
          style={[styles.setDefaultButton, { borderColor }]}
        >
          <ThemedText style={styles.setDefaultText}>Set as Default</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>My Addresses</ThemedText>
          {!isAdding && !isEditing && (
            <TouchableOpacity
              onPress={() => setIsAdding(true)}
              style={[styles.addButton, { borderColor }]}
            >
              <Ionicons name="add" size={24} color={textColor} />
              <ThemedText style={styles.addButtonText}>Add New</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {(isAdding || isEditing) ? (
          <View style={styles.form}>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Full Name"
              placeholderTextColor={textColor + '80'}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Phone Number"
              placeholderTextColor={textColor + '80'}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Address Line 1"
              placeholderTextColor={textColor + '80'}
              value={addressLine1}
              onChangeText={setAddressLine1}
              autoComplete="address-line1"
            />
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Address Line 2 (Optional)"
              placeholderTextColor={textColor + '80'}
              value={addressLine2}
              onChangeText={setAddressLine2}
              autoComplete="address-line2"
            />
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="City"
              placeholderTextColor={textColor + '80'}
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              autoComplete="address-line2"
            />
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="State/Province"
              placeholderTextColor={textColor + '80'}
              value={state}
              onChangeText={setState}
              autoCapitalize="words"
              autoComplete="address-line1"
            />
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Postal Code"
              placeholderTextColor={textColor + '80'}
              value={postalCode}
              onChangeText={setPostalCode}
              keyboardType="numeric"
              autoComplete="postal-code"
            />
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Country"
              placeholderTextColor={textColor + '80'}
              value={country}
              onChangeText={setCountry}
              autoCapitalize="words"
              autoComplete="country"
            />
            <View style={styles.formActions}>
              <ThemedButton
                onPress={() => {
                  resetForm();
                  setIsAdding(false);
                  setIsEditing(null);
                }}
                style={styles.cancelButton}
                title="Cancel"
              />
              <ThemedButton
                onPress={isEditing ? handleUpdateAddress : handleAddAddress}
                style={styles.submitButton}
                disabled={isLoading}
                title={isLoading ? '' : isEditing ? 'Update Address' : 'Add Address'}
                loading={isLoading}
              />
            </View>
          </View>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderAddress}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.addressList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 16,
  },
  form: {
    padding: 20,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  submitButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressList: {
    padding: 20,
    gap: 16,
  },
  addressCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addressInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressName: {
    fontSize: 18,
    fontWeight: '600',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    color: '#fff',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  addressPhone: {
    fontSize: 16,
    opacity: 0.7,
  },
  addressText: {
    fontSize: 16,
  },
  setDefaultButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  setDefaultText: {
    fontSize: 14,
  },
});