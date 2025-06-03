import { Order, OrderItem } from '../types';

// TODO: Replace with actual API endpoints
const API_URL = 'https://api.minimart.com';

const orderService = {
  async createOrder(orderData: {
    items: OrderItem[];
    shippingAddressId: string;
    paymentMethodId: string;
  }): Promise<Order> {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
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

      const response = await fetch(`${API_URL}/orders?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  async cancelOrder(id: string): Promise<Order> {
    try {
      const response = await fetch(`${API_URL}/orders/${id}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      return await response.json();
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
      const response = await fetch(`${API_URL}/orders/${id}/track`);
      if (!response.ok) {
        throw new Error('Failed to track order');
      }

      return await response.json();
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
      const response = await fetch(`${API_URL}/orders/analytics`);
      if (!response.ok) {
        throw new Error('Failed to fetch order analytics');
      }

      return await response.json();
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

      const response = await fetch(
        `${API_URL}/users/${userId}/orders?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  },
};

export default orderService;