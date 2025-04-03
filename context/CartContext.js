'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch cart from server on mount and when session changes
  const fetchCart = useCallback(async () => {
    if (!session) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error('Failed to fetch cart');
      const { cart } = await response.json();
      setCartItems(cart || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load your cart');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Sync cart with server
  const syncCart = useCallback(async (newCart) => {
    if (!session || isSyncing) return;

    setIsSyncing(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: newCart[0]?.productId,
          quantity: newCart[0]?.quantity
        }),
      });

      if (!response.ok) throw new Error('Failed to sync cart');
    } catch (error) {
      console.error('Error syncing cart:', error);
      toast.error('Failed to sync cart changes');
    } finally {
      setIsSyncing(false);
    }
  }, [session, isSyncing]);

  // Add to cart
  const addToCart = useCallback(async (product) => {
    if (!session) {
      toast.error('Please sign in to add items to cart');
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product }),
      });

      if (!response.ok) throw new Error('Failed to add to cart');

      const { cart } = await response.json();
      setCartItems(cart || []);
      toast.success(`${product.name} added to cart`);
      return true;
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.message || 'Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Update quantity
  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (!session) return;

    setLoading(true);
    try {
      if (newQuantity < 1) {
        await removeFromCart(productId);
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (!response.ok) throw new Error('Failed to update quantity');

      const { cart } = await response.json();
      setCartItems(cart || []);
    } catch (error) {
      console.error('Update quantity error:', error);
      toast.error('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Remove from cart
  const removeFromCart = useCallback(async (productId) => {
    if (!session) return;

    setLoading(true);
    try {
      const itemToRemove = cartItems.find(item => item.productId === productId);
      if (!itemToRemove) return;

      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) throw new Error('Failed to remove from cart');

      const { cart } = await response.json();
      setCartItems(cart || []);
      toast.success(`${itemToRemove.name} removed from cart`);
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    } finally {
      setLoading(false);
    }
  }, [session, cartItems]);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    try {
      // Implement clear cart API if needed
      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Calculate cart summary
  const getCartSummary = useCallback(() => {
    const summary = cartItems.reduce((acc, item) => {
      const itemTotal = item.price * item.quantity;
      return {
        totalItems: acc.totalItems + item.quantity,
        subtotal: acc.subtotal + itemTotal,
        itemCount: acc.itemCount + 1
      };
    }, {
      totalItems: 0,
      subtotal: 0,
      itemCount: 0
    });

    return {
      ...summary,
      total: summary.subtotal,
      isEmpty: summary.itemCount === 0
    };
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loading,
    getCartSummary,
    isSyncing
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};