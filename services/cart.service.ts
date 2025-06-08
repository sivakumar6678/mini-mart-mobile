import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cart, CartItem } from '../types';
import api from './api';
import { Product } from './product.service';

const CART_STORAGE_KEY = 'cart';

const CartService = {

  getCart: async (): Promise<Cart> => {
    try {
      // Try to get cart from backend first
      try {
        const response = await api.get('/cart');
        const backendCart = response.data;
        
        // Convert backend cart format to our format
        const cart: Cart = {
          items: backendCart.items?.map((item: any) => ({
            product: {
              id: item.product_id,
              name: item.product_name || 'Unknown Product',
              price: item.price,
              quantity: item.available_quantity || 0,
              category: item.category || 'Unknown',
              images: item.image_url ? [item.image_url] : [],
              shopId: item.shop_id || 0,
              rating: 0,
              stockStatus: 'in_stock' as const,
              description: ''
            },
            quantity: item.quantity
          })) || [],
          total: backendCart.total || 0
        };
        
        // Save to local storage as backup
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        return cart;
      } catch (apiError) {
        console.log('Backend cart not available, using local storage');
        
        // Fallback to local storage
        const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (cartData) {
          return JSON.parse(cartData);
        }
        return { items: [], total: 0 };
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      return { items: [], total: 0 };
    }
  },
  
  saveCart: async (cart: Cart): Promise<void> => {
    try {
      // Save to local storage
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      
      // Try to sync with backend
      try {
        const cartItems = cart.items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }));
        
        await api.post('/cart/sync', { items: cartItems });
      } catch (apiError) {
        console.log('Failed to sync cart with backend, saved locally');
      }
    } catch (error) {
      console.error('Failed to save cart:', error);
      throw error;
    }
  },
  
  addToCart: async (product: Product, quantity: number = 1): Promise<Cart> => {
    try {
      // Try to add to backend cart first
      await api.post('/cart', {
        product_id: product.id,
        quantity: quantity
      });
    } catch (apiError) {
      console.log('Failed to add to backend cart, using local cart');
    }
    
    // Validate stock with fallback values
    const stockStatus = product.stockStatus || (product.quantity > 10 ? 'in_stock' : (product.quantity > 0 ? 'low_stock' : 'out_of_stock'));
    
    if (stockStatus === 'out_of_stock') {
      throw new Error('Product is out of stock');
    }
    
    if (stockStatus === 'low_stock' && quantity > product.quantity) {
      throw new Error(`Only ${product.quantity} items available in stock`);
    }
    
    const cart = await CartService.getCart();
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Check if adding more would exceed stock
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (stockStatus === 'low_stock' && newQuantity > product.quantity) {
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
      const stockStatus = product.stockStatus || (product.quantity > 10 ? 'in_stock' : (product.quantity > 0 ? 'low_stock' : 'out_of_stock'));
      
      // Validate stock
      if (stockStatus === 'out_of_stock') {
        throw new Error('Product is out of stock');
      }
      
      if (stockStatus === 'low_stock' && quantity > product.quantity) {
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
      // Clear from local storage
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear cart from storage:', error);
      throw error;
    }
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
      const stockStatus = item.product.stockStatus || (item.product.quantity > 10 ? 'in_stock' : (item.product.quantity > 0 ? 'low_stock' : 'out_of_stock'));
      
      // Basic validation without backend calls for now
      if (stockStatus === 'out_of_stock') {
        errors.push(`${item.product.name} is out of stock`);
      } else if (stockStatus === 'low_stock' && item.quantity > item.product.quantity) {
        errors.push(`Only ${item.product.quantity} items of ${item.product.name} available in stock`);
      }
      
      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for ${item.product.name}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default CartService;