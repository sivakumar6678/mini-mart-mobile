import api from './api';

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface ProductAnalytics {
  productId: number;
  productName: string;
  totalSold: number;
  revenue: number;
  averageRating: number;
  views: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  ordersByStatus: { [key: string]: number };
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  revenueGrowth: number;
  profitMargin: number;
}

export interface InventoryAnalytics {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  topSellingProducts: ProductAnalytics[];
  slowMovingProducts: ProductAnalytics[];
}

export interface DashboardAnalytics {
  sales: SalesData[];
  revenue: RevenueAnalytics;
  orders: OrderAnalytics;
  customers: CustomerAnalytics;
  inventory: InventoryAnalytics;
  topProducts: ProductAnalytics[];
}

export interface AnalyticsFilter {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  shopId?: number;
  category?: string;
}

export interface SalesAnalytics {
  totalSales: number;
  totalRevenue: number;
  salesByDay: { date: string; sales: number; revenue: number }[];
}

export interface OrderAnalytics {
  totalOrders: number;
  ordersByStatus: { [key: string]: number };
  ordersByDay?: { date: string; count: number }[];
}

export interface InventoryAnalytics {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  productsByCategory?: { category: string; count: number }[];
}

const AnalyticsService = {
  // Get dashboard analytics
  getDashboardAnalytics: async (filters?: AnalyticsFilter): Promise<DashboardAnalytics> => {
    const response = await api.get('/analytics/dashboard', { params: filters });
    return response.data;
  },

  // Get sales data
  getSalesData: async (filters?: AnalyticsFilter): Promise<SalesData[]> => {
    const response = await api.get('/analytics/sales', { params: filters });
    return response.data;
  },

  // Get revenue analytics
  getRevenueAnalytics: async (filters?: AnalyticsFilter): Promise<RevenueAnalytics> => {
    const response = await api.get('/analytics/revenue', { params: filters });
    return response.data;
  },

  // Get order analytics
  getOrderAnalytics: async (): Promise<OrderAnalytics> => {
    const response = await api.get('/analytics/orders');
    return response.data;
  },

  // Get customer analytics
  getCustomerAnalytics: async (filters?: AnalyticsFilter): Promise<CustomerAnalytics> => {
    const response = await api.get('/analytics/customers', { params: filters });
    return response.data;
  },

  // Get product analytics
  getProductAnalytics: async (filters?: AnalyticsFilter): Promise<ProductAnalytics[]> => {
    const response = await api.get('/analytics/products', { params: filters });
    return response.data;
  },

  // Get inventory analytics
  getInventoryAnalytics: async (): Promise<InventoryAnalytics> => {
    const response = await api.get('/analytics/inventory');
    return response.data;
  },

  // Get top selling products
  getTopSellingProducts: async (limit: number = 10, filters?: AnalyticsFilter): Promise<ProductAnalytics[]> => {
    const response = await api.get('/analytics/products/top-selling', { 
      params: { ...filters, limit } 
    });
    return response.data;
  },

  // Get slow moving products
  getSlowMovingProducts: async (limit: number = 10, filters?: AnalyticsFilter): Promise<ProductAnalytics[]> => {
    const response = await api.get('/analytics/products/slow-moving', { 
      params: { ...filters, limit } 
    });
    return response.data;
  },

  // Get low stock alerts
  getLowStockAlerts: async (threshold: number = 10): Promise<ProductAnalytics[]> => {
    const response = await api.get('/analytics/inventory/low-stock', { 
      params: { threshold } 
    });
    return response.data;
  },

  // Get sales by category
  getSalesByCategory: async (filters?: AnalyticsFilter): Promise<{ category: string; sales: number; revenue: number }[]> => {
    const response = await api.get('/analytics/sales/by-category', { params: filters });
    return response.data;
  },

  // Get sales by time period
  getSalesByPeriod: async (period: 'hour' | 'day' | 'week' | 'month', filters?: AnalyticsFilter): Promise<SalesData[]> => {
    const response = await api.get(`/analytics/sales/by-${period}`, { params: filters });
    return response.data;
  },

  // Get customer retention data
  getCustomerRetention: async (filters?: AnalyticsFilter): Promise<{ period: string; retentionRate: number }[]> => {
    const response = await api.get('/analytics/customers/retention', { params: filters });
    return response.data;
  },

  // Get order fulfillment metrics
  getOrderFulfillmentMetrics: async (filters?: AnalyticsFilter): Promise<{
    averageProcessingTime: number;
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
    orderAccuracy: number;
  }> => {
    const response = await api.get('/analytics/orders/fulfillment', { params: filters });
    return response.data;
  },

  // Export analytics data
  exportAnalyticsData: async (type: 'sales' | 'orders' | 'customers' | 'products', format: 'csv' | 'excel', filters?: AnalyticsFilter): Promise<Blob> => {
    const response = await api.get(`/analytics/export/${type}`, {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },

  // Get real-time metrics
  getRealTimeMetrics: async (): Promise<{
    activeUsers: number;
    onlineOrders: number;
    currentRevenue: number;
    pendingOrders: number;
  }> => {
    const response = await api.get('/analytics/real-time');
    return response.data;
  },

  // Get conversion funnel data
  getConversionFunnel: async (filters?: AnalyticsFilter): Promise<{
    visitors: number;
    productViews: number;
    addToCart: number;
    checkout: number;
    orders: number;
    conversionRate: number;
  }> => {
    const response = await api.get('/analytics/conversion-funnel', { params: filters });
    return response.data;
  },

  // Get geographic sales data
  getGeographicSales: async (filters?: AnalyticsFilter): Promise<{ city: string; orders: number; revenue: number }[]> => {
    const response = await api.get('/analytics/sales/geographic', { params: filters });
    return response.data;
  },

  // Get default analytics data (for offline use)
  getDefaultAnalytics: (): DashboardAnalytics => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      sales: [
        { date: lastWeek.toISOString().split('T')[0], revenue: 1200, orders: 15, customers: 12 },
        { date: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 1500, orders: 18, customers: 15 },
        { date: new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 1800, orders: 22, customers: 18 },
        { date: new Date(lastWeek.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 1350, orders: 16, customers: 14 },
        { date: new Date(lastWeek.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 1650, orders: 20, customers: 17 },
        { date: new Date(lastWeek.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 2100, orders: 25, customers: 21 },
        { date: today.toISOString().split('T')[0], revenue: 1950, orders: 23, customers: 19 },
      ],
      revenue: {
        totalRevenue: 12550,
        monthlyRevenue: 12550,
        dailyRevenue: 1950,
        revenueGrowth: 15.5,
        profitMargin: 25.8,
      },
      orders: {
        totalOrders: 139,
        pendingOrders: 8,
        completedOrders: 125,
        cancelledOrders: 6,
        averageOrderValue: 90.3,
        ordersByStatus: {
          pending: 8,
          confirmed: 12,
          dispatched: 15,
          delivered: 125,
          cancelled: 6,
        },
      },
      customers: {
        totalCustomers: 116,
        newCustomers: 23,
        returningCustomers: 93,
        averageOrderValue: 108.2,
        customerLifetimeValue: 450.0,
      },
      inventory: {
        totalProducts: 45,
        lowStockProducts: 3,
        outOfStockProducts: 1,
        topSellingProducts: [],
        slowMovingProducts: [],
      },
      topProducts: [
        {
          productId: 1,
          productName: 'Fresh Organic Apples',
          totalSold: 85,
          revenue: 8415,
          averageRating: 4.8,
          views: 1250,
        },
        {
          productId: 2,
          productName: 'Whole Wheat Bread',
          totalSold: 72,
          revenue: 3240,
          averageRating: 4.6,
          views: 980,
        },
        {
          productId: 3,
          productName: 'Organic Milk 1L',
          totalSold: 68,
          revenue: 4080,
          averageRating: 4.7,
          views: 890,
        },
      ],
    };
  },

  getSalesAnalytics: async (): Promise<SalesAnalytics> => {
    const response = await api.get('/analytics/sales');
    return response.data;
  },
};

export default AnalyticsService;