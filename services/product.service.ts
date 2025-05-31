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
}

export interface ProductFilter {
  shopId?: number;
  city?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

const ProductService = {
  getAllProducts: async (filters?: ProductFilter): Promise<Product[]> => {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },
  
  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  getProductsByShop: async (shopId: number): Promise<Product[]> => {
    const response = await api.get(`/products/shop/${shopId}`);
    return response.data;
  },
  
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },
  
  getProductsByCity: async (city: string): Promise<Product[]> => {
    const response = await api.get(`/products/city/${city}`);
    return response.data;
  },
  
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await api.get(`/products/search?q=${query}`);
    return response.data;
  },
  
  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  updateProduct: async (id: number, productData: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  }
};

export default ProductService;