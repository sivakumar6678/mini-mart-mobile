import api from './api';

export interface Shop {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  image: string;
  userId: number;
}

const ShopService = {
  getAllShops: async (): Promise<Shop[]> => {
    const response = await api.get('/shops');
    return response.data;
  },
  
  getShopById: async (id: number): Promise<Shop> => {
    const response = await api.get(`/shops/${id}`);
    return response.data;
  },
  
  getShopsByCity: async (city: string): Promise<Shop[]> => {
    const response = await api.get(`/shops/city/${city}`);
    return response.data;
  },
  
  createShop: async (shopData: Omit<Shop, 'id'>): Promise<Shop> => {
    const response = await api.post('/shops', shopData);
    return response.data;
  },
  
  updateShop: async (id: number, shopData: Partial<Shop>): Promise<Shop> => {
    const response = await api.put(`/shops/${id}`, shopData);
    return response.data;
  },
  
  deleteShop: async (id: number): Promise<void> => {
    await api.delete(`/shops/${id}`);
  },
  
  getShopsByUser: async (userId: number): Promise<Shop[]> => {
    const response = await api.get(`/shops/user/${userId}`);
    return response.data;
  }
};

export default ShopService;