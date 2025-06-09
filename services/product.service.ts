import { Review } from '../types';
import { default as api, default as API_URL } from './api';

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

// API Error handling utility
const handleApiError = (error: any, operation: string) => {
  console.error(`${operation} failed:`, error);
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error || 'Unknown error';
    
    switch (status) {
      case 404:
        throw new Error(`${operation}: No data found`);
      case 500:
        throw new Error(`${operation}: Server error. Please try again later`);
      case 401:
        throw new Error(`${operation}: Authentication required`);
      case 403:
        throw new Error(`${operation}: Access denied`);
      default:
        throw new Error(`${operation}: ${message}`);
    }
  } else if (error.request) {
    // Network error
    throw new Error(`${operation}: Network error. Please check your connection`);
  } else {
    // Other error
    throw new Error(`${operation}: ${error.message || 'Unknown error'}`);
  }
};

// Enhanced product normalization for backend data
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

  // Calculate discounted price from discount percentage
  const calculateDiscountedPrice = (price: number, discountPercentage: number): number | undefined => {
    if (discountPercentage > 0) {
      return price - (price * discountPercentage / 100);
    }
    return undefined;
  };

  const quantity = Number(product.quantity || 0);
  const price = Number(product.price);
  const discountPercentage = Number(product.discount_percentage || 0);

  return {
    id: Number(product.id),
    name: String(product.name).trim(),
    description: String(product.description || 'Fresh and locally sourced').trim(),
    price: price,
    discountedPrice: calculateDiscountedPrice(price, discountPercentage),
    quantity: quantity,
    category: String(product.category || 'Vegetables').trim(),
    images: normalizeImages(product.images, product.image_url),
    shopId: Number(product.shop_id || 0),
    rating: Number(product.rating || 4.0),
    stockStatus: getStockStatus(quantity),
    brand: product.brand ? String(product.brand).trim() : undefined,
    unit: product.unit ? String(product.unit).trim() : 'kg',
    featured: Boolean(product.featured),
    createdAt: product.created_at || new Date().toISOString(),
    updatedAt: product.updated_at || new Date().toISOString(),
  };
};

const productService = {
  async getProducts(params?: {
    category?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
    city?: string;
  }): Promise<{ products: Product[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.city) queryParams.append('city', params.city);

      const response = await api.get(`/products?${queryParams.toString()}`);
      
      // Handle different response formats from backend
      let rawProducts = [];
      if (Array.isArray(response.data)) {
        rawProducts = response.data;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        rawProducts = response.data.products;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        rawProducts = response.data.data;
      }

      // Normalize the products from backend response
      const products = rawProducts.map(normalizeProduct);
      
      return {
        products,
        total: response.data?.total || products.length
      };
    } catch (error: any) {
      handleApiError(error, 'Get Products');
      throw error; // Re-throw to satisfy return type
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`);
      return normalizeProduct(response.data);
    } catch (error: any) {
      handleApiError(error, 'Get Product By ID');
      throw error; // Re-throw to satisfy return type
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

      const response = await api.get(`/products/${productId}/reviews?${queryParams.toString()}`);
      return response.data;
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
      const response = await api.post(`/products/${productId}/reviews`, review);
      return response.data;
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



  getFeaturedProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products', { params: { featured: true, limit: 8 } });
      
      let rawProducts = [];
      if (Array.isArray(response.data)) {
        rawProducts = response.data;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        rawProducts = response.data.products;
      }
      
      const normalizedProducts = rawProducts.map(normalizeProduct);
      return normalizedProducts.filter((p: Product) => p.featured);
    } catch (error: any) {
      handleApiError(error, 'Get Featured Products');
      throw error; // Re-throw to satisfy return type
    }
  },

  getNewArrivals: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products', { params: { sortBy: 'newest', limit: 8 } });
      
      let rawProducts = [];
      if (Array.isArray(response.data)) {
        rawProducts = response.data;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        rawProducts = response.data.products;
      }
      
      return rawProducts.map(normalizeProduct);
    } catch (error: any) {
      handleApiError(error, 'Get New Arrivals');
      throw error; // Re-throw to satisfy return type
    }
  },

  getBestSellers: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products', { params: { sortBy: 'sold_count', sortOrder: 'desc', limit: 8 } });
      
      let rawProducts = [];
      if (Array.isArray(response.data)) {
        rawProducts = response.data;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        rawProducts = response.data.products;
      }
      
      return rawProducts.map(normalizeProduct);
    } catch (error: any) {
      handleApiError(error, 'Get Best Sellers');
      throw error; // Re-throw to satisfy return type
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get('/products');
      
      let rawProducts = [];
      if (Array.isArray(response.data)) {
        rawProducts = response.data;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        rawProducts = response.data.products;
      }
      
      const categories = [...new Set(rawProducts.map((p: any) => p.category).filter(Boolean))];
      
      if (categories.length === 0) {
        throw new Error('No categories found');
      }
      
      return categories as string[];
    } catch (error: any) {
      handleApiError(error, 'Get Categories');
      throw error; // Re-throw to satisfy return type
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
      // Retry logic for network errors
      if (retryCount < MAX_RETRIES && (
        error.code === 'NETWORK_ERROR' || 
        error.code === 'ECONNABORTED' ||
        error?.response?.status >= 500
      )) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return productService.getAllProducts(filters, retryCount + 1);
      }
      
      handleApiError(error, 'Get All Products');
      throw error; // Re-throw to satisfy return type
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
  
  getProductsByCity: async (city: string, filters?: Omit<ProductFilter, 'city'>): Promise<Product[]> => {
    try {
      const response = await api.get(`/products/city/${city}`, { params: filters });
      
      let rawProducts = [];
      if (Array.isArray(response.data)) {
        rawProducts = response.data;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        rawProducts = response.data.products;
      }
      
      return rawProducts.map(normalizeProduct);
    } catch (error: any) {
      handleApiError(error, 'Get Products By City');
      throw error; // Re-throw to satisfy return type
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
      return normalizeProduct(response.data);
    } catch (error: any) {
      handleApiError(error, 'Update Product');
      throw error; // Re-throw to satisfy return type
    }
  },
  
  deleteProduct: async (id: number): Promise<void> => {
    try {
      await api.delete(`/products/${id}`);
    } catch (error: any) {
      handleApiError(error, 'Delete Product');
      throw error; // Re-throw to satisfy return type
    }
  }
};

export default productService;