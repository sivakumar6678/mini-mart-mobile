import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from './product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

const CART_STORAGE_KEY = 'cart';

const CartService = {
  getCart: async (): Promise<Cart> => {
    const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (cartData) {
      return JSON.parse(cartData);
    }
    return { items: [], total: 0 };
  },
  
  saveCart: async (cart: Cart): Promise<void> => {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  },
  
  addToCart: async (product: Product, quantity: number = 1): Promise<Cart> => {
    const cart = await CartService.getCart();
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity;
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
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  },
  
  calculateTotal: (items: CartItem[]): number => {
    return items.reduce((total, item) => {
      const price = item.product.discountedPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }
};

export default CartService;