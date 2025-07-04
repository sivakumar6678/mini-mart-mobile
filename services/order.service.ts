import { Order, OrderItem } from '../types';
import api from './api';

const orderService = {
  async createOrder(orderData: {
    items: OrderItem[];
    shippingAddressId: string;
    paymentMethodId: string;
  }): Promise<Order> {
    try {
      // Convert to backend format
      const backendOrderData = {
        items: orderData.items.map(item => ({
          product_id: parseInt(item.productId),
          quantity: item.quantity
        })),
        address_id: parseInt(orderData.shippingAddressId),
        payment: {
          method: orderData.paymentMethodId,
          // Add other payment details as needed
        }
      };

      const response = await api.post('/orders', backendOrderData);
      
      // Convert backend response to our Order format
      const backendOrder = response.data;
      const order: Order = {
        id: backendOrder.id.toString(),
        userId: backendOrder.customer_id.toString(),
        items: backendOrder.items?.map((item: any) => ({
          id: item.id.toString(),
          productId: item.product_id.toString(),
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })) || [],
        total: backendOrder.total_amount,
        status: backendOrder.status || 'pending',
        shippingAddress: {
          id: backendOrder.address_id?.toString() || '',
          userId: backendOrder.customer_id.toString(),
          name: 'Shipping Address',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        paymentMethod: {
          id: orderData.paymentMethodId,
          userId: backendOrder.customer_id.toString(),
          type: 'upi', // Default type, should be determined from backend
          details: {},
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: backendOrder.created_at || new Date().toISOString(),
        updatedAt: backendOrder.updated_at || new Date().toISOString()
      };

      return order;
    } catch (error: any) {
      console.error('Error creating order:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to create order');
    }
  },

  async getOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await api.get(`/orders?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  async cancelOrder(id: string): Promise<Order> {
    try {
      const response = await api.post(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  },

  async trackOrder(id: string): Promise<{
    status: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    currentLocation?: string;
    history: {
      status: string;
      timestamp: string;
      location?: string;
    }[];
  }> {
    try {
      const response = await api.get(`/orders/${id}/track`);
      return response.data;
    } catch (error) {
      console.error('Error tracking order:', error);
      throw error;
    }
  },

  async getOrderAnalytics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: { [key: string]: number };
  }> {
    try {
      const response = await api.get(`/orders/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order analytics:', error);
      throw error;
    }
  },

  async getOrderHistory(userId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await api.get(`/users/${userId}/orders?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  },
};

export default orderService;