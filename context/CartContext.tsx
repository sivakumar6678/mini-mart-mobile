import React, { createContext, useContext, useEffect, useState } from 'react';
import cartService from '../services/cart.service';
import { Product } from '../services/product.service';
import { Cart } from '../types';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  updateCartItem: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  validateCart: () => Promise<{
    isValid: boolean;
    errors: string[];
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

  const addToCart = async (product: Product, quantity: number) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartService.addToCart(product, quantity);
      setCart(updatedCart);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add item to cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (productId: number, quantity: number) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartService.updateCartItemQuantity(productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update cart item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartService.removeFromCart(productId);
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

  const getCartTotal = () => {
    if (!cart) return 0;
    return cartService.calculateTotal(cart.items);
  };

  const getCartItemCount = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
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