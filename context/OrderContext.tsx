import React, { createContext, useContext, useEffect, useState } from 'react';
import orderService from '../services/order.service';
import { Order } from '../types';
import { useAuth } from './AuthContext';

// Define order status type
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Define tracking info type
interface TrackingInfo {
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: string;
  currentLocation?: string;
  history: Array<{
    status: OrderStatus;
    timestamp: string;
    location?: string;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  // ... other User properties ...
}

interface OrderContextType {
  orders: Order[];
  recentOrders: Order[];
  isLoading: boolean;
  error: string | null;
  getOrders: (status?: OrderStatus, page?: number, limit?: number) => Promise<void>;
  getOrderById: (id: string) => Promise<Order>;
  cancelOrder: (id: string) => Promise<void>;
  trackOrder: (id: string) => Promise<Order>;
  getOrderAnalytics: () => Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
  }>;
  getOrderHistory: (page?: number, limit?: number) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadRecentOrders();
    }
  }, [user]);

  const loadRecentOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await orderService.getOrders();
      setRecentOrders(result.orders.slice(0, 5));
    } catch (error: any) {
      setError(error.message || 'Failed to load recent orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrders = async (status?: OrderStatus, page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await orderService.getOrders({ status, page, limit });
      setOrders(result.orders);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch orders');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderById = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const order = await orderService.getOrderById(id);
      return order;
    } catch (error: any) {
      setError(error.message || 'Failed to fetch order details');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await orderService.cancelOrder(id);
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status: 'cancelled' as OrderStatus } : order
      ));
      setRecentOrders(recentOrders.map(order => 
        order.id === id ? { ...order, status: 'cancelled' as OrderStatus } : order
      ));
    } catch (error: any) {
      setError(error.message || 'Failed to cancel order');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const trackOrder = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const trackingInfo = await orderService.trackOrder(id) as TrackingInfo;
      const order = await getOrderById(id);
      if (!order) throw new Error('Order not found');
      
      const updatedOrder = {
        ...order,
        status: trackingInfo.status,
        trackingNumber: trackingInfo.trackingNumber,
        estimatedDelivery: trackingInfo.estimatedDelivery,
        currentLocation: trackingInfo.currentLocation,
        trackingHistory: trackingInfo.history
      } as Order;
      
      setOrders(orders.map(o => o.id === id ? updatedOrder : o));
      setRecentOrders(recentOrders.map(o => o.id === id ? updatedOrder : o));
      return updatedOrder;
    } catch (error: any) {
      setError(error.message || 'Failed to track order');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const analytics = await orderService.getOrderAnalytics() as {
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        ordersByStatus: Record<OrderStatus, number>;
      };
      return analytics;
    } catch (error: any) {
      setError(error.message || 'Failed to fetch order analytics');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderHistory = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await orderService.getOrderHistory(`page=${page}&limit=${limit}`);
      setOrders(result.orders);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch order history');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    orders,
    recentOrders,
    isLoading,
    error,
    getOrders,
    getOrderById,
    cancelOrder,
    trackOrder,
    getOrderAnalytics,
    getOrderHistory,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
} 