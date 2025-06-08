/**
 * Centralized Mock Data Service
 * Professional mock data management with proper typing and validation
 */

export interface MockOrderItem {
  productId: number;
  quantity: number;
  price: number;
  productName: string;
  image: string;
}

export interface MockStatusUpdate {
  status: string;
  timestamp: string;
  message: string;
}

export interface MockOrder {
  id: number;
  userId: number;
  items: MockOrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  addressId: number;
  createdAt: string;
  updatedAt: string;
  deliveryPartner: string;
  trackingId: string;
  estimatedDelivery: string;
  statusUpdates: MockStatusUpdate[];
}

export interface MockAddress {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface DeliveryPartnerInfo {
  phone: string;
  email: string;
  website: string;
}

// Professional mock data with realistic scenarios
export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 1,
    userId: 1,
    items: [
      {
        productId: 1,
        quantity: 2,
        price: 99,
        productName: 'Fresh Organic Apples',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop',
      },
      {
        productId: 3,
        quantity: 1,
        price: 60,
        productName: 'Organic Milk 1L',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop',
      },
    ],
    total: 258,
    status: 'delivered',
    addressId: 1,
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-16T14:20:00Z',
    deliveryPartner: 'Express Delivery',
    trackingId: 'EXP12345678',
    estimatedDelivery: '2023-06-16T18:00:00Z',
    statusUpdates: [
      { status: 'pending', timestamp: '2023-06-15T10:30:00Z', message: 'Order placed successfully' },
      { status: 'confirmed', timestamp: '2023-06-15T11:15:00Z', message: 'Order confirmed by merchant' },
      { status: 'processing', timestamp: '2023-06-15T14:30:00Z', message: 'Order is being prepared' },
      { status: 'dispatched', timestamp: '2023-06-16T09:45:00Z', message: 'Order dispatched for delivery' },
      { status: 'delivered', timestamp: '2023-06-16T14:20:00Z', message: 'Order delivered successfully' },
    ],
  },
  {
    id: 2,
    userId: 1,
    items: [
      {
        productId: 2,
        quantity: 1,
        price: 45,
        productName: 'Whole Wheat Bread',
        image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=300&h=300&fit=crop',
      },
      {
        productId: 4,
        quantity: 3,
        price: 30,
        productName: 'Fresh Tomatoes',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop',
      },
    ],
    total: 135,
    status: 'dispatched',
    addressId: 1,
    createdAt: '2023-06-20T14:45:00Z',
    updatedAt: '2023-06-21T09:30:00Z',
    deliveryPartner: 'Fast Track',
    trackingId: 'FT87654321',
    estimatedDelivery: '2023-06-22T12:00:00Z',
    statusUpdates: [
      { status: 'pending', timestamp: '2023-06-20T14:45:00Z', message: 'Order placed successfully' },
      { status: 'confirmed', timestamp: '2023-06-20T15:30:00Z', message: 'Order confirmed by merchant' },
      { status: 'processing', timestamp: '2023-06-21T08:15:00Z', message: 'Order is being prepared' },
      { status: 'dispatched', timestamp: '2023-06-21T09:30:00Z', message: 'Order dispatched for delivery' },
    ],
  },
  {
    id: 3,
    userId: 1,
    items: [
      {
        productId: 5,
        quantity: 2,
        price: 65,
        productName: 'Organic Bananas',
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop',
      },
    ],
    total: 130,
    status: 'confirmed',
    addressId: 2,
    createdAt: '2023-06-25T09:15:00Z',
    updatedAt: '2023-06-25T10:00:00Z',
    deliveryPartner: 'Express Delivery',
    trackingId: 'EXP98765432',
    estimatedDelivery: '2023-06-26T18:00:00Z',
    statusUpdates: [
      { status: 'pending', timestamp: '2023-06-25T09:15:00Z', message: 'Order placed successfully' },
      { status: 'confirmed', timestamp: '2023-06-25T10:00:00Z', message: 'Order confirmed by merchant' },
    ],
  },
  {
    id: 4,
    userId: 1,
    items: [
      {
        productId: 6,
        quantity: 1,
        price: 35,
        productName: 'Fresh Carrots',
        image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop',
      },
      {
        productId: 1,
        quantity: 1,
        price: 99,
        productName: 'Fresh Organic Apples',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop',
      },
    ],
    total: 134,
    status: 'pending',
    addressId: 1,
    createdAt: '2023-06-28T16:20:00Z',
    updatedAt: '2023-06-28T16:20:00Z',
    deliveryPartner: 'Fast Track',
    trackingId: 'FT12345678',
    estimatedDelivery: '2023-06-30T12:00:00Z',
    statusUpdates: [
      { status: 'pending', timestamp: '2023-06-28T16:20:00Z', message: 'Order placed successfully' },
    ],
  },
];

export const MOCK_ADDRESSES: MockAddress[] = [
  {
    id: 1,
    street: '123 Main Street, Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    isDefault: true,
  },
  {
    id: 2,
    street: '456 Park Avenue',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400002',
    isDefault: false,
  },
];

export const DELIVERY_PARTNERS: Record<string, DeliveryPartnerInfo> = {
  'Express Delivery': {
    phone: '+91 9876543210',
    email: 'support@expressdelivery.com',
    website: 'https://expressdelivery.com',
  },
  'Fast Track': {
    phone: '+91 9876543211',
    email: 'support@fasttrack.com',
    website: 'https://fasttrack.com',
  },
};

// Professional service class with error handling
export class MockDataService {
  static getOrderById(id: number): MockOrder | null {
    try {
      const order = MOCK_ORDERS.find(o => o.id === id);
      return order || null;
    } catch (error) {
      console.error('Error fetching mock order:', error);
      return null;
    }
  }

  static getAddressById(id: number): MockAddress | null {
    try {
      const address = MOCK_ADDRESSES.find(a => a.id === id);
      return address || null;
    } catch (error) {
      console.error('Error fetching mock address:', error);
      return null;
    }
  }

  static getDeliveryPartnerInfo(partnerName: string): DeliveryPartnerInfo | null {
    try {
      return DELIVERY_PARTNERS[partnerName] || null;
    } catch (error) {
      console.error('Error fetching delivery partner info:', error);
      return null;
    }
  }

  static getAllOrders(): MockOrder[] {
    try {
      return [...MOCK_ORDERS];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  static simulateNetworkDelay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default MockDataService;