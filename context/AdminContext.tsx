import React, { createContext, useContext, useEffect, useState } from 'react';
import AnalyticsService, {
    DashboardAnalytics,
    InventoryAnalytics,
    OrderAnalytics,
    SalesAnalytics
} from '../services/analytics.service';
import OrderService, { Order } from '../services/order.service';
import ShopService, { Shop } from '../services/shop.service';

interface AdminContextType {
  // Shop Management
  shops: Shop[];
  currentShop: Shop | null;
  isLoadingShops: boolean;
  shopError: string | null;
  createShop: (shop: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateShop: (id: string, shop: Partial<Shop>) => Promise<void>;
  deleteShop: (id: string) => Promise<void>;
  setCurrentShop: (shop: Shop) => void;

  // Analytics
  dashboardAnalytics: DashboardAnalytics | null;
  salesAnalytics: SalesAnalytics | null;
  orderAnalytics: OrderAnalytics | null;
  inventoryAnalytics: InventoryAnalytics | null;
  isLoadingAnalytics: boolean;
  analyticsError: string | null;
  refreshAnalytics: () => Promise<void>;

  // Order Management
  orders: Order[];
  isLoadingOrders: boolean;
  orderError: string | null;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Shop Management State
  const [shops, setShops] = useState<Shop[]>([]);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [isLoadingShops, setIsLoadingShops] = useState(true);
  const [shopError, setShopError] = useState<string | null>(null);

  // Analytics State
  const [dashboardAnalytics, setDashboardAnalytics] = useState<DashboardAnalytics | null>(null);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics | null>(null);
  const [inventoryAnalytics, setInventoryAnalytics] = useState<InventoryAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Order Management State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    refreshShops();
    refreshAnalytics();
    refreshOrders();
  }, []);

  // Shop Management Functions
  const refreshShops = async () => {
    try {
      setIsLoadingShops(true);
      setShopError(null);
      const fetchedShops = await ShopService.getAllShops();
      setShops(fetchedShops);
    } catch (err) {
      setShopError(err instanceof Error ? err.message : 'Failed to fetch shops');
    } finally {
      setIsLoadingShops(false);
    }
  };

  const createShop = async (shop: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoadingShops(true);
      setShopError(null);
      const newShop = await ShopService.createShop(shop);
      setShops(prev => [...prev, newShop]);
    } catch (err) {
      setShopError(err instanceof Error ? err.message : 'Failed to create shop');
      throw err;
    } finally {
      setIsLoadingShops(false);
    }
  };

  const updateShop = async (id: string, shop: Partial<Shop>) => {
    try {
      setIsLoadingShops(true);
      setShopError(null);
      const updatedShop = await ShopService.updateShop(id, shop);
      setShops(prev => 
        prev.map(s => s.id === id ? updatedShop : s)
      );
      if (currentShop?.id === id) {
        setCurrentShop(updatedShop);
      }
    } catch (err) {
      setShopError(err instanceof Error ? err.message : 'Failed to update shop');
      throw err;
    } finally {
      setIsLoadingShops(false);
    }
  };

  const deleteShop = async (id: string) => {
    try {
      setIsLoadingShops(true);
      setShopError(null);
      await ShopService.deleteShop(id);
      setShops(prev => prev.filter(s => s.id !== id));
      if (currentShop?.id === id) {
        setCurrentShop(null);
      }
    } catch (err) {
      setShopError(err instanceof Error ? err.message : 'Failed to delete shop');
      throw err;
    } finally {
      setIsLoadingShops(false);
    }
  };

  // Analytics Functions
  const refreshAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      setAnalyticsError(null);
      const data = await AnalyticsService.getDashboardAnalytics();
      setDashboardAnalytics(data);
    } catch (err) {
      setAnalyticsError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Order Management Functions
  const refreshOrders = async () => {
    try {
      setIsLoadingOrders(true);
      setOrderError(null);
      const data = await OrderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      setIsLoadingOrders(true);
      setOrderError(null);
      const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
      setOrders(prev => 
        prev.map(order => order.id === orderId ? updatedOrder : order)
      );
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Failed to update order status');
      throw err;
    } finally {
      setIsLoadingOrders(false);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        // Shop Management
        shops,
        currentShop,
        isLoadingShops,
        shopError,
        createShop,
        updateShop,
        deleteShop,
        setCurrentShop,

        // Analytics
        dashboardAnalytics,
        salesAnalytics,
        orderAnalytics,
        inventoryAnalytics,
        isLoadingAnalytics,
        analyticsError,
        refreshAnalytics,

        // Order Management
        orders,
        isLoadingOrders,
        orderError,
        refreshOrders,
        updateOrderStatus,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}; 