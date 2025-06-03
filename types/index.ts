export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer' | 'shop_owner';
  phone?: string;
  avatar?: string;
  city?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastLoginAt?: string;
  preferences?: {
    notifications: boolean;
    marketing: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardAnalytics {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalShops: number;
  recentOrders: Order[];
  topProducts: {
    id: string;
    name: string;
    totalSold: number;
  }[];
}

export interface SalesAnalytics {
  dailySales: { date: string; amount: number }[];
  monthlySales: { month: string; amount: number }[];
  salesByCategory: { category: string; amount: number }[];
}

export interface OrderAnalytics {
  ordersByStatus: { [key: string]: number };
  ordersByDay?: { date: string; count: number }[];
  averageOrderValue: number;
}

export interface InventoryAnalytics {
  totalProducts: number;
  lowStockProducts: number;
  productsByCategory?: { category: string; count: number }[];
  topSellingProducts: Product[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  rating?: number;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'credit_card' | 'debit_card' | 'upi' | 'net_banking';
  details: {
    cardNumber?: string;
    cardHolderName?: string;
    expiryDate?: string;
    cvv?: string;
    upiId?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
} 