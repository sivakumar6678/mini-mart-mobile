import { Shop } from '../types';
import api from './api';

class ShopService {
  async getAllShops(): Promise<Shop[]> {
    const response = await api.get('/shops');
    return response.data;
  }

  async getShopById(id: string): Promise<Shop> {
    const response = await api.get(`/shops/${id}`);
    return response.data;
  }

  async createShop(shop: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shop> {
    const response = await api.post('/shops', shop);
    return response.data;
  }

  async updateShop(id: string, shop: Partial<Shop>): Promise<Shop> {
    const response = await api.put(`/shops/${id}`, shop);
    return response.data;
  }

  async deleteShop(id: string): Promise<void> {
    await api.delete(`/shops/${id}`);
  }
}

export default new ShopService();