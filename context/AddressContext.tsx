import React, { createContext, useContext, useEffect, useState } from 'react';
import AddressService, { Address } from '../services/address.service';

interface AddressContextType {
  addresses: Address[];
  defaultAddress: Address | null;
  isLoading: boolean;
  error: string | null;
  addAddress: (address: Omit<Address, 'id' | 'isDefault' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAddress: (addressId: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  refreshAddresses: () => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultAddress, setDefaultAddressState] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshAddresses();
  }, []);

  const refreshAddresses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedAddresses = await AddressService.getAddresses();
      setAddresses(fetchedAddresses);
      const defaultAddr = fetchedAddresses.find(addr => addr.isDefault) || null;
      setDefaultAddressState(defaultAddr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const addAddress = async (address: Omit<Address, 'id' | 'isDefault' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const newAddress = await AddressService.createAddress(address);
      setAddresses(prev => [...prev, newAddress]);
      if (newAddress.isDefault) {
        setDefaultAddressState(newAddress);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (addressId: string, address: Partial<Address>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedAddress = await AddressService.updateAddress(addressId, address);
      setAddresses(prev => 
        prev.map(addr => addr.id === addressId ? updatedAddress : addr)
      );
      if (updatedAddress.isDefault) {
        setDefaultAddressState(updatedAddress);
      } else if (defaultAddress?.id === addressId) {
        setDefaultAddressState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await AddressService.deleteAddress(addressId);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      if (defaultAddress?.id === addressId) {
        setDefaultAddressState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedAddress = await AddressService.setDefaultAddress(addressId);
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }))
      );
      setDefaultAddressState(updatedAddress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        defaultAddress,
        isLoading,
        error,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        refreshAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
}; 