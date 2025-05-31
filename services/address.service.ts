import api from './api';
import { Address } from './order.service';

const AddressService = {
  getUserAddresses: async (): Promise<Address[]> => {
    const response = await api.get('/addresses');
    return response.data;
  },
  
  getAddressById: async (id: number): Promise<Address> => {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },
  
  createAddress: async (addressData: Omit<Address, 'id'>): Promise<Address> => {
    const response = await api.post('/addresses', addressData);
    return response.data;
  },
  
  updateAddress: async (id: number, addressData: Partial<Address>): Promise<Address> => {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response.data;
  },
  
  deleteAddress: async (id: number): Promise<void> => {
    await api.delete(`/addresses/${id}`);
  },
  
  setDefaultAddress: async (id: number): Promise<Address> => {
    const response = await api.put(`/addresses/${id}/default`);
    return response.data;
  },
  
  getDefaultAddress: async (): Promise<Address | null> => {
    const addresses = await AddressService.getUserAddresses();
    const defaultAddress = addresses.find(address => address.isDefault);
    return defaultAddress || null;
  }
};

export default AddressService;