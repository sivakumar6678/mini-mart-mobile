import api from './api';

export interface OrderItem {
  id?: number;
  productId: number;
  quantity: number;
  price: number;
  productName: string;
}

export interface Address {
  id?: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Order {
  id?: number;
  userId: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  addressId: number;
  address?: Address;
  createdAt?: string;
  updatedAt?: string;
}

const OrderService = {
  createOrder: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  getOrderById: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  getUserOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders/user');
    return response.data;
  },
  
  getShopOrders: async (shopId: number): Promise<Order[]> => {
    const response = await api.get(`/orders/shop/${shopId}`);
    return response.data;
  },
  
  updateOrderStatus: async (id: number, status: Order['status']): Promise<Order> => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  cancelOrder: async (id: number): Promise<Order> => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  }
};

export default OrderService;