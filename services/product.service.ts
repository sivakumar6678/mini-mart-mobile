import { Review } from '../types';
import api from './api';

// Unified Product interface with proper typing
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  category: string;
  images: string[];
  shopId: number;
  rating: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  // Backend compatibility fields (optional)
  image_url?: string;
  shop_id?: number;
  // Additional fields for better UX
  brand?: string;
  unit?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilter {
  shopId?: number;
  city?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'name' | 'rating' | 'newest' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
  inStock?: boolean;
  brand?: string;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}

// Mock data for fallback
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Fresh Organic Apples',
    description: 'Delicious organic apples from local farms',
    price: 120,
    discountedPrice: 99,
    quantity: 100,
    category: 'Fruits',
    images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6'],
    shopId: 1,
    rating: 4.5,
    stockStatus: 'in_stock'
  },
  {
    id: 2,
    name: 'Whole Wheat Bread',
    description: 'Freshly baked whole wheat bread',
    price: 45,
    quantity: 5,
    category: 'Bakery',
    images: ['https://images.unsplash.com/photo-1598373182133-52452f7691ef'],
    shopId: 2,
    rating: 4.2,
    stockStatus: 'low_stock'
  },
  {
    id: 3,
    name: 'Organic Milk 1L',
    description: 'Farm fresh organic milk',
    price: 60,
    quantity: 0,
    category: 'Dairy',
    images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b'],
    shopId: 1,
    rating: 4.8,
    stockStatus: 'out_of_stock'
  },
  {
    id: 4,
    name: 'Fresh Tomatoes',
    description: 'Ripe and juicy tomatoes',
    price: 40,
    discountedPrice: 30,
    quantity: 80,
    category: 'Vegetables',
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea'],
    shopId: 3,
    rating: 4.3,
    stockStatus: 'in_stock'
  },
  {
    id: 5,
    name: 'Organic Bananas',
    description: 'Fresh organic bananas',
    price: 80,
    discountedPrice: 65,
    quantity: 150,
    category: 'Fruits',
    images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224'],
    shopId: 1,
    rating: 4.6,
    stockStatus: 'in_stock'
  },
];

// TODO: Replace with actual API endpoints
const API_URL = 'https://api.minimart.com';

// Enhanced product normalization with validation and fallbacks
const normalizeProduct = (product: any): Product => {
  // Validate required fields
  if (!product.id || !product.name || typeof product.price !== 'number') {
    throw new Error('Invalid product data: missing required fields');
  }

  // Determine stock status with proper logic
  const getStockStatus = (quantity: number): Product['stockStatus'] => {
    if (quantity <= 0) return 'out_of_stock';
    if (quantity <= 10) return 'low_stock';
    return 'in_stock';
  };

  // Normalize images with fallback
  const normalizeImages = (images?: string[], imageUrl?: string): string[] => {
    if (images && Array.isArray(images) && images.length > 0) {
      return images.filter(img => typeof img === 'string' && img.trim() !== '');
    }
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      return [imageUrl];
    }
    return ['https://via.placeholder.com/300x300?text=No+Image'];
  };

  return {
    id: Number(product.id),
    name: String(product.name).trim(),
    description: String(product.description || '').trim(),
    price: Number(product.price),
    discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : undefined,
    quantity: Number(product.quantity || 0),
    category: String(product.category || 'Uncategorized').trim(),
    images: normalizeImages(product.images, product.image_url),
    shopId: Number(product.shopId || product.shop_id || 0),
    rating: Number(product.rating || 0),
    stockStatus: getStockStatus(Number(product.quantity || 0)),
    brand: product.brand ? String(product.brand).trim() : undefined,
    unit: product.unit ? String(product.unit).trim() : undefined,
    featured: Boolean(product.featured),
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
  };
};

const productService = {
  async getProducts(params?: {
    category?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_URL}/products?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  async getProductReviews(productId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{ reviews: Review[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(
        `${API_URL}/products/${productId}/reviews?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },

  async addProductReview(productId: string, review: {
    rating: number;
    comment?: string;
  }): Promise<Review> {
    try {
      const response = await fetch(`${API_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      });

      if (!response.ok) {
        throw new Error('Failed to add review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding product review:', error);
      throw error;
    }
  },

  async updateProductReview(productId: string, reviewId: string, review: {
    rating: number;
    comment?: string;
  }): Promise<Review> {
    try {
      const response = await fetch(
        `${API_URL}/products/${productId}/reviews/${reviewId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(review),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating product review:', error);
      throw error;
    }
  },

  async deleteProductReview(productId: string, reviewId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_URL}/products/${productId}/reviews/${reviewId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting product review:', error);
      throw error;
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${API_URL}/products/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_URL}/products/featured`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  async getNewArrivals(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_URL}/products/new-arrivals`);
      if (!response.ok) {
        throw new Error('Failed to fetch new arrivals');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      throw error;
    }
  },

  async getBestSellers(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_URL}/products/best-sellers`);
      if (!response.ok) {
        throw new Error('Failed to fetch best sellers');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      throw error;
    }
  },

  getAllProducts: async (filters?: ProductFilter, retryCount = 0): Promise<ProductResponse> => {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1000;

    try {
      const response = await api.get('/products', { params: filters });
      
      // Handle different response formats
      let products: any[] = [];
      if (Array.isArray(response.data)) {
        products = response.data;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        products = response.data.products;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        products = response.data.data;
      }

      // Normalize products with error handling
      const normalizedProducts: Product[] = [];
      for (const product of products) {
        try {
          normalizedProducts.push(normalizeProduct(product));
        } catch (normalizationError) {
          console.warn('Failed to normalize product:', product, normalizationError);
          // Skip invalid products instead of failing the entire request
        }
      }
      
      return {
        products: normalizedProducts,
        total: response.data?.total || normalizedProducts.length,
        hasMore: response.data?.hasMore || false
      };
    } catch (error: any) {
      console.warn(`API error (attempt ${retryCount + 1}):`, error?.response?.status, error?.message);
      
      // Retry logic for network errors
      if (retryCount < MAX_RETRIES && (
        error.code === 'NETWORK_ERROR' || 
        error.code === 'ECONNABORTED' ||
        error?.response?.status >= 500
      )) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return productService.getAllProducts(filters, retryCount + 1);
      }
      
      // Return empty result for API errors
      return {
        products: [],
        total: 0,
        hasMore: false
      };
    }
  },
  
  getProductsByShop: async (shopId: number, filters?: Omit<ProductFilter, 'shopId'>): Promise<ProductResponse> => {
    try {
      const response = await api.get(`/products/shop/${shopId}`, { params: filters });
      const normalizedProducts = Array.isArray(response.data) 
        ? response.data.map(normalizeProduct)
        : response.data.products?.map(normalizeProduct) || [];
      
      return {
        products: normalizedProducts,
        total: response.data.total || normalizedProducts.length,
        hasMore: response.data.hasMore || false
      };
    } catch (error: any) {
      console.warn('API error:', error?.response?.status, error?.message);
      return {
        products: [],
        total: 0,
        hasMore: false
      };
    }
  },
  
  getProductsByCategory: async (category: string, filters?: Omit<ProductFilter, 'category'>): Promise<ProductResponse> => {
    try {
      const response = await api.get(`/products/category/${category}`, { params: filters });
      const normalizedProducts = Array.isArray(response.data) 
        ? response.data.map(normalizeProduct)
        : response.data.products?.map(normalizeProduct) || [];
      
      return {
        products: normalizedProducts,
        total: response.data.total || normalizedProducts.length,
        hasMore: response.data.hasMore || false
      };
    } catch (error: any) {
      console.warn('API error:', error?.response?.status, error?.message);
      return {
        products: [],
        total: 0,
        hasMore: false
      };
    }
  },
  
  getProductsByCity: async (city: string, filters?: Omit<ProductFilter, 'city'>): Promise<ProductResponse> => {
    try {
      const response = await api.get(`/products/city/${city}`, { params: filters });
      const normalizedProducts = Array.isArray(response.data) 
        ? response.data.map(normalizeProduct)
        : response.data.products?.map(normalizeProduct) || [];
      
      return {
        products: normalizedProducts,
        total: response.data.total || normalizedProducts.length,
        hasMore: response.data.hasMore || false
      };
    } catch (error: any) {
      console.warn('API error:', error?.response?.status, error?.message);
      return {
        products: [],
        total: 0,
        hasMore: false
      };
    }
  },
  
  searchProducts: async (query: string, filters?: Omit<ProductFilter, 'search'>): Promise<ProductResponse> => {
    try {
      const response = await api.get(`/products/search`, { 
        params: { ...filters, q: query }
      });
      const normalizedProducts = Array.isArray(response.data) 
        ? response.data.map(normalizeProduct)
        : response.data.products?.map(normalizeProduct) || [];
      
      return {
        products: normalizedProducts,
        total: response.data.total || normalizedProducts.length,
        hasMore: response.data.hasMore || false
      };
    } catch (error: any) {
      console.warn('API error:', error?.response?.status, error?.message);
      return {
        products: [],
        total: 0,
        hasMore: false
      };
    }
  },
  
  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.warn('API not available, creating mock product:', error);
      // For development, return a mock created product
      const newProduct: Product = {
        ...productData,
        id: Date.now(), // Use timestamp as mock ID
        rating: 0,
        stockStatus: 'in_stock'
      };
      return newProduct;
    }
  },
  
  updateProduct: async (id: number, productData: Partial<Product>): Promise<Product> => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.warn('API not available, updating mock product:', error);
      const product = MOCK_PRODUCTS.find(p => p.id === id);
      if (!product) {
        throw new Error(`Product with id ${id} not found`);
      }
      return { ...product, ...productData };
    }
  },
  
  deleteProduct: async (id: number): Promise<void> => {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      console.warn('API not available, deleting mock product:', error);
      const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error(`Product with id ${id} not found`);
      }
      MOCK_PRODUCTS.splice(index, 1);
    }
  }
};

export default productService;