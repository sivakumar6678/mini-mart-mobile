import React, { createContext, useContext, useEffect, useState } from 'react';
import CartService, { Cart } from '../services/cart.service';
import { Product } from '../services/product.service';

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await CartService.getCart();
        setCart(savedCart);
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      const updatedCart = await CartService.addToCart(product, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      const updatedCart = await CartService.updateCartItemQuantity(productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  };

  const removeItem = async (productId: number) => {
    try {
      const updatedCart = await CartService.removeFromCart(productId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await CartService.clearCart();
      setCart({ items: [], total: 0 });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  // Calculate total number of items in cart
  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};