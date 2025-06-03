import React, { createContext, useContext, useEffect, useState } from 'react';
import cartService from '../services/cart.service';
import { Cart, CartItem } from '../types';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => Promise<number>;
  getCartItemCount: () => Promise<number>;
  validateCart: () => Promise<{
    isValid: boolean;
    invalidItems: CartItem[];
  }>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add item to cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartService.updateCartItem(itemId, quantity);
      setCart(updatedCart);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update cart item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartService.removeFromCart(itemId);
      setCart(updatedCart);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove item from cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      await cartService.clearCart();
      setCart(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to clear cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getCartTotal = async () => {
    try {
      return await cartService.getCartTotal();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get cart total');
      throw error;
    }
  };

  const getCartItemCount = async () => {
    try {
      return await cartService.getCartItemCount();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get cart item count');
      throw error;
    }
  };

  const validateCart = async () => {
    try {
      return await cartService.validateCart();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to validate cart');
      throw error;
    }
  };

  const clearError = () => setError(null);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
        validateCart,
        clearError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}