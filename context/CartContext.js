// context/CartContext.jsx
'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch cart from server on mount and when session changes
  const fetchCart = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/api/cart');
      setCartItems(response.data.cart || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load your cart');
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart
  const addToCart = useCallback(
    async (product) => {
      if (status !== 'authenticated' || !session?.user?.id) {
        toast.error('Please sign in to add items to cart');
        return false;
      }

      setLoading(true);
      try {
        const productId = product.productId || product.id || product._id;
        const existingItem = cartItems.find((item) => item.productId === productId);

        if (existingItem) {
          // Update quantity if item exists
          const newQuantity = existingItem.quantity + 1;
          const response = await axios.put('/api/cart', {
            productId,
            quantity: newQuantity,
          });
          setCartItems(response.data.cart || []);
          toast.success(`${product.name} quantity updated`);
        } else {
          // Add new item to cart
          const cartItem = {
            productId,
            name: product.name,
            price: product.price,
            image: product.image || product.images?.[0]?.url || '/images/placeholder.jpg',
            quantity: 1,
            description: product.description || '',
            category: product.category || product.categories?.[0] || '',
          };

          const response = await axios.post('/api/cart', { item: cartItem });
          setCartItems(response.data.cart || []);
          toast.success(`${product.name} added to cart`);
        }
        return true;
      } catch (error) {
        console.error('Cart operation error:', error);
        toast.error(error.response?.data?.message || 'Failed to add to cart');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [session, status, cartItems]
  );

  // Update quantity
  const updateQuantity = useCallback(
    async (productId, newQuantity) => {
      if (status !== 'authenticated' || !session?.user?.id) return;

      setLoading(true);
      try {
        if (newQuantity < 1) {
          await removeFromCart(productId);
          return;
        }

        const response = await axios.put('/api/cart', {
          productId,
          quantity: newQuantity,
        });
        setCartItems(response.data.cart || []);
      } catch (error) {
        console.error('Update quantity error:', error);
        toast.error('Failed to update quantity');
      } finally {
        setLoading(false);
      }
    },
    [session, status]
  );

  // Remove from cart
  const removeFromCart = useCallback(
    async (productId) => {
      if (status !== 'authenticated' || !session?.user?.id) return;

      setLoading(true);
      try {
        const itemToRemove = cartItems.find((item) => item.productId === productId);
        if (!itemToRemove) return;

        const response = await axios.delete('/api/cart', {
          data: { productId },
        });
        setCartItems(response.data.cart || []);
        toast.success(`${itemToRemove.name} removed from cart`);
      } catch (error) {
        console.error('Error removing from cart:', error);
        toast.error('Failed to remove item');
      } finally {
        setLoading(false);
      }
    },
    [session, status, cartItems]
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.id) return;

    setLoading(true);
    try {
      await axios.delete('/api/cart/all');
      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  // Calculate cart summary
  const getCartSummary = useCallback(() => {
    const summary = cartItems.reduce(
      (acc, item) => {
        const itemTotal = item.price * item.quantity;
        return {
          totalItems: acc.totalItems + item.quantity,
          subtotal: acc.subtotal + itemTotal,
          itemCount: acc.itemCount + 1,
        };
      },
      { totalItems: 0, subtotal: 0, itemCount: 0 }
    );

    return {
      ...summary,
      total: summary.subtotal,
      isEmpty: summary.itemCount === 0,
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
    isSyncing,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};