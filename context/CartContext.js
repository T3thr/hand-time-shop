// context/CartContext.js
'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  // Enhanced cart initialization
  useEffect(() => {
    const initializeCart = () => {
      if (session?.user?.email) {
        try {
          const savedCart = localStorage.getItem(`cart_${session.user.email}`);
          const parsedCart = savedCart ? JSON.parse(savedCart) : [];
          
          // Validate cart data structure
          if (Array.isArray(parsedCart) && parsedCart.every(item => 
            item.id && 
            typeof item.quantity === 'number' && 
            item.price && 
            item.name
          )) {
            setCartItems(parsedCart);
          } else {
            console.warn('Invalid cart data structure, resetting cart');
            setCartItems([]);
          }
        } catch (error) {
          console.error('Error loading cart:', error);
          toast.error('Error loading your cart');
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    };

    initializeCart();
  }, [session]);

  // Optimized cart persistence
  useEffect(() => {
    const persistCart = () => {
      if (session?.user?.email && cartItems.length >= 0) {
        try {
          localStorage.setItem(`cart_${session.user.email}`, JSON.stringify(cartItems));
        } catch (error) {
          console.error('Error saving cart:', error);
          toast.error('Error saving your cart');
        }
      }
    };

    persistCart();
  }, [cartItems, session]);

  const addToCart = async (product, quantity = 1) => {
    if (!session?.user?.email) {
      toast.error('Please sign in to add items to cart');
      return false;
    }

    if (!product?.id || !product?.price || !product?.name) {
      toast.error('Invalid product data');
      return false;
    }

    setLoading(true);
    
    try {
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        const updatedItems = [...cartItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        // Optional: Add stock validation here
        // if (newQuantity > product.stockLimit) {
        //   toast.warning(`Only ${product.stockLimit} items available`);
        //   setLoading(false);
        //   return false;
        // }
        
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
          lastUpdated: new Date().toISOString()
        };
        
        setCartItems(updatedItems);
      } else {
        const newItem = {
          ...product,
          quantity,
          addedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          userId: session.user.email
        };
        
        setCartItems(prev => [...prev, newItem]);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (!session?.user?.email || !productId) return;

    try {
      if (newQuantity < 1) {
        await removeFromCart(productId);
        return;
      }

      setCartItems(prev => prev.map(item =>
        item.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              lastUpdated: new Date().toISOString()
            }
          : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeFromCart = async (productId) => {
    if (!session?.user?.email || !productId) return;
    
    try {
      setCartItems(prev => prev.filter(item => item.id !== productId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  // Enhanced cart calculations
  const getCartSummary = () => {
    try {
      const summary = {
        totalItems: cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
        subtotal: cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0),
        itemCount: cartItems.length,
        lastUpdated: null
      };

      if (cartItems.length > 0) {
        summary.lastUpdated = new Date(
          Math.max(...cartItems.map(item => 
            new Date(item.lastUpdated || item.addedAt).getTime()
          ))
        );
      }

      return summary;
    } catch (error) {
      console.error('Error calculating cart summary:', error);
      return {
        totalItems: 0,
        subtotal: 0,
        itemCount: 0,
        lastUpdated: null
      };
    }
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart: () => {
      setCartItems([]);
      if (session?.user?.email) {
        localStorage.removeItem(`cart_${session.user.email}`);
      }
    },
    loading,
    getCartSummary
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