import { Product, Review } from '../types';
import api from './api';

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
  rating?: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
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
  sortBy?: 'price' | 'name' | 'rating';
  sortOrder?: 'asc' | 'desc';
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

  getAllProducts: async (filters?: ProductFilter): Promise<ProductResponse> => {
    try {
      const response = await api.get('/products', { params: filters });
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      // Apply filters to mock data
      let filteredProducts = [...MOCK_PRODUCTS];
      
      if (filters?.search) {
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          product.description.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters?.category) {
        filteredProducts = filteredProducts.filter(product =>
          product.category === filters.category
        );
      }
      
      if (filters?.minPrice) {
        filteredProducts = filteredProducts.filter(product =>
          (product.discountedPrice || product.price) >= filters.minPrice!
        );
      }
      
      if (filters?.maxPrice) {
        filteredProducts = filteredProducts.filter(product =>
          (product.discountedPrice || product.price) <= filters.maxPrice!
        );
      }
      
      if (filters?.shopId) {
        filteredProducts = filteredProducts.filter(product =>
          product.shopId === filters.shopId
        );
      }

      // Apply sorting
      if (filters?.sortBy) {
        filteredProducts.sort((a, b) => {
          let comparison = 0;
          switch (filters.sortBy) {
            case 'price':
              comparison = (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
              break;
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'rating':
              comparison = (b.rating || 0) - (a.rating || 0);
              break;
          }
          return filters.sortOrder === 'desc' ? -comparison : comparison;
        });
      }
      
      // Apply pagination
      const limit = filters?.limit || 10;
      const offset = filters?.offset || 0;
      const paginatedProducts = filteredProducts.slice(offset, offset + limit);
      
      return {
        products: paginatedProducts,
        total: filteredProducts.length,
        hasMore: offset + limit < filteredProducts.length
      };
    }
  },
  
  getProductsByShop: async (shopId: number, filters?: Omit<ProductFilter, 'shopId'>): Promise<ProductResponse> => {
    try {
      const response = await api.get(`/products/shop/${shopId}`, { params: filters });
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      const products = MOCK_PRODUCTS.filter(product => product.shopId === shopId);
      return {
        products,
        total: products.length,
        hasMore: false
      };
    }
  },
  
  getProductsByCategory: async (category: string, filters?: Omit<ProductFilter, 'category'>): Promise<ProductResponse> => {
    try {
      const response = await api.get(`/products/category/${category}`, { params: filters });
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      const products = MOCK_PRODUCTS.filter(product => product.category === category);
      return {
        products,
        total: products.length,
        hasMore: false
      };
    }
  },
  
  getProductsByCity: async (city: string, filters?: Omit<ProductFilter, 'city'>): Promise<ProductResponse> => {
    try {
      const response = await api.get(`/products/city/${city}`, { params: filters });
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      // For mock data, return all products regardless of city
      return {
        products: MOCK_PRODUCTS,
        total: MOCK_PRODUCTS.length,
        hasMore: false
      };
    }
  },
  
  searchProducts: async (query: string, filters?: Omit<ProductFilter, 'search'>): Promise<ProductResponse> => {
    try {
      const response = await api.get(`/products/search`, { 
        params: { ...filters, q: query }
      });
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      const products = MOCK_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      return {
        products,
        total: products.length,
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