import { Address } from '../types';
import api from './api';

class AddressService {
  async getAddresses(): Promise<Address[]> {
    const response = await api.get('/addresses');
    return response.data;
  }

  async getAddressById(id: string): Promise<Address> {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  }

  async createAddress(address: Omit<Address, 'id' | 'isDefault' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    const response = await api.post('/addresses', address);
    return response.data;
  }

  async updateAddress(id: string, address: Partial<Address>): Promise<Address> {
    const response = await api.put(`/addresses/${id}`, address);
    return response.data;
  }

  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/addresses/${id}`);
  }

  async setDefaultAddress(id: string): Promise<Address> {
    const response = await api.put(`/addresses/${id}/default`);
    return response.data;
  }
}

export default new AddressService();