import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cart, CartItem } from '../types';
import api from './api';
import { Product } from './product.service';

// TODO: Replace with actual API endpoints
const API_URL = 'https://api.minimart.com';

const CART_STORAGE_KEY = 'cart';

const CartService = {
  async getCart(): Promise<Cart> {
    try {
      const response = await fetch(`${API_URL}/cart`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  async addToCart(productId: string, quantity: number): Promise<Cart> {
    try {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },

  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    try {
      const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  async removeFromCart(itemId: string): Promise<Cart> {
    try {
      const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  },

  async clearCart(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  async getCartTotal(): Promise<number> {
    try {
      const response = await fetch(`${API_URL}/cart/total`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart total');
      }

      const data = await response.json();
      return data.total;
    } catch (error) {
      console.error('Error fetching cart total:', error);
      throw error;
    }
  },

  async getCartItemCount(): Promise<number> {
    try {
      const response = await fetch(`${API_URL}/cart/count`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart item count');
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error fetching cart item count:', error);
      throw error;
    }
  },

  async validateCart(): Promise<{
    isValid: boolean;
    invalidItems: CartItem[];
  }> {
    try {
      const response = await fetch(`${API_URL}/cart/validate`);
      if (!response.ok) {
        throw new Error('Failed to validate cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating cart:', error);
      throw error;
    }
  },

  getCart: async (): Promise<Cart> => {
    try {
      // Try to get cart from backend first
      const response = await api.get('/cart');
      const cart = response.data;
      // Update local storage
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      return cart;
    } catch (error) {
      console.warn('Failed to fetch cart from backend, using local storage:', error);
      // Fallback to local storage
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        return JSON.parse(cartData);
      }
      return { items: [], total: 0 };
    }
  },
  
  saveCart: async (cart: Cart): Promise<void> => {
    try {
      // Save to backend
      await api.put('/cart', cart);
      // Update local storage
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn('Failed to save cart to backend, using local storage only:', error);
      // Fallback to local storage only
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  },
  
  addToCart: async (product: Product, quantity: number = 1): Promise<Cart> => {
    // Validate stock
    if (product.stockStatus === 'out_of_stock') {
      throw new Error('Product is out of stock');
    }
    
    if (product.stockStatus === 'low_stock' && quantity > product.quantity) {
      throw new Error(`Only ${product.quantity} items available in stock`);
    }
    
    const cart = await CartService.getCart();
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Check if adding more would exceed stock
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (product.stockStatus === 'low_stock' && newQuantity > product.quantity) {
        throw new Error(`Cannot add more items. Only ${product.quantity} items available in stock`);
      }
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({ product, quantity });
    }
    
    // Recalculate total
    cart.total = CartService.calculateTotal(cart.items);
    
    // Save updated cart
    await CartService.saveCart(cart);
    
    return cart;
  },
  
  updateCartItemQuantity: async (productId: number, quantity: number): Promise<Cart> => {
    const cart = await CartService.getCart();
    
    const itemIndex = cart.items.findIndex(item => item.product.id === productId);
    
    if (itemIndex !== -1) {
      const product = cart.items[itemIndex].product;
      
      // Validate stock
      if (product.stockStatus === 'out_of_stock') {
        throw new Error('Product is out of stock');
      }
      
      if (product.stockStatus === 'low_stock' && quantity > product.quantity) {
        throw new Error(`Only ${product.quantity} items available in stock`);
      }
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }
      
      // Recalculate total
      cart.total = CartService.calculateTotal(cart.items);
      
      // Save updated cart
      await CartService.saveCart(cart);
    }
    
    return cart;
  },
  
  removeFromCart: async (productId: number): Promise<Cart> => {
    const cart = await CartService.getCart();
    
    // Filter out the item to remove
    cart.items = cart.items.filter(item => item.product.id !== productId);
    
    // Recalculate total
    cart.total = CartService.calculateTotal(cart.items);
    
    // Save updated cart
    await CartService.saveCart(cart);
    
    return cart;
  },
  
  clearCart: async (): Promise<void> => {
    try {
      // Clear from backend
      await api.delete('/cart');
    } catch (error) {
      console.warn('Failed to clear cart from backend:', error);
    }
    // Clear from local storage
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  },
  
  calculateTotal: (items: CartItem[]): number => {
    return items.reduce((total, item) => {
      const price = item.product.discountedPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  },
  
  validateCart: async (): Promise<{ isValid: boolean; errors: string[] }> => {
    const cart = await CartService.getCart();
    const errors: string[] = [];
    
    for (const item of cart.items) {
      try {
        // Fetch latest product data
        const response = await api.get(`/products/${item.product.id}`);
        const currentProduct = response.data;
        
        // Check if product still exists
        if (!currentProduct) {
          errors.push(`${item.product.name} is no longer available`);
          continue;
        }
        
        // Check stock status
        if (currentProduct.stockStatus === 'out_of_stock') {
          errors.push(`${item.product.name} is out of stock`);
        } else if (currentProduct.stockStatus === 'low_stock' && item.quantity > currentProduct.quantity) {
          errors.push(`Only ${currentProduct.quantity} items of ${item.product.name} available in stock`);
        }
        
        // Check price changes
        const currentPrice = currentProduct.discountedPrice || currentProduct.price;
        const cartPrice = item.product.discountedPrice || item.product.price;
        if (currentPrice !== cartPrice) {
          errors.push(`Price of ${item.product.name} has changed from ${cartPrice} to ${currentPrice}`);
        }
      } catch (error) {
        console.error('Error validating cart item:', error);
        errors.push(`Unable to validate ${item.product.name}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default CartService;