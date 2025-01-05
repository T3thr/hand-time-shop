// context/CartContext.js
'use client'
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

const CartContext = createContext();

// Constants for cart configuration
const CART_CONFIG = {
  VERSION: '1.0.0',
  MAX_QUANTITY: 99,
  MIN_QUANTITY: 1,
  STORAGE_KEY_PREFIX: 'cart_',
  DEBOUNCE_DELAY: 300,
  MAX_CART_ITEMS: 50,
};

// Cart item validation schema
const validateCartItem = (item) => {
  const requiredFields = {
    id: (id) => typeof id !== 'undefined' && id !== null,
    quantity: (qty) => typeof qty === 'number' && qty >= CART_CONFIG.MIN_QUANTITY && qty <= CART_CONFIG.MAX_QUANTITY,
    price: (price) => typeof price === 'number' && price >= 0,
    name: (name) => typeof name === 'string' && name.length > 0,
    image: (img) => typeof img === 'string' && img.length > 0,
  };

  const errors = Object.entries(requiredFields)
    .filter(([field, validator]) => !validator(item[field]))
    .map(([field]) => `Invalid ${field}`);

  return { isValid: errors.length === 0, errors };
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const { data: session } = useSession();

  // Get storage key based on user session
  const getStorageKey = useCallback(() => {
    return session?.user?.email ? `${CART_CONFIG.STORAGE_KEY_PREFIX}${session.user.email}` : null;
  }, [session]);

  // Persist cart data with error handling and versioning
  const persistCart = useCallback(async (items) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      const cartData = {
        version: CART_CONFIG.VERSION,
        items,
        lastSync: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(cartData));
      setLastSync(cartData.lastSync);
    } catch (error) {
      console.error('Cart persistence error:', error);
      toast.error('Failed to save cart changes');
    }
  }, [getStorageKey]);

  // Initialize cart with migration support
  useEffect(() => {
    const initializeCart = async () => {
      const storageKey = getStorageKey();
      if (!storageKey) {
        setCartItems([]);
        return;
      }

      try {
        const savedCart = localStorage.getItem(storageKey);
        if (!savedCart) {
          setCartItems([]);
          return;
        }

        const { version, items = [], lastSync: savedLastSync } = JSON.parse(savedCart);

        // Handle version migration if needed
        if (version !== CART_CONFIG.VERSION) {
          console.warn('Cart version mismatch, performing migration...');
          // Add migration logic here if needed
        }

        const validItems = items.filter(item => validateCartItem(item).isValid);
        setCartItems(validItems);
        setLastSync(savedLastSync);

        if (validItems.length !== items.length) {
          toast.warning('Some invalid items were removed from your cart');
        }
      } catch (error) {
        console.error('Cart initialization error:', error);
        toast.error('Error loading your cart');
        setCartItems([]);
      }
    };

    initializeCart();
  }, [getStorageKey]);

  // Persist cart changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cartItems.length >= 0) {
        persistCart(cartItems);
      }
    }, CART_CONFIG.DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [cartItems, persistCart]);

  // Enhanced addToCart with validation and optimistic updates
  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!session?.user?.email) {
      toast.error('Please sign in to add items to cart');
      return false;
    }

    const validation = validateCartItem({ ...product, quantity });
    if (!validation.isValid) {
      toast.error(`Invalid product data: ${validation.errors.join(', ')}`);
      return false;
    }

    setLoading(true);

    try {
      setCartItems(prevItems => {
        // Check cart item limit
        if (prevItems.length >= CART_CONFIG.MAX_CART_ITEMS) {
          throw new Error(`Cart cannot exceed ${CART_CONFIG.MAX_CART_ITEMS} items`);
        }

        const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
        
        if (existingItemIndex !== -1) {
          const updatedItems = [...prevItems];
          const currentQuantity = updatedItems[existingItemIndex].quantity;
          const newQuantity = Math.min(currentQuantity + quantity, CART_CONFIG.MAX_QUANTITY);
          
          if (newQuantity === CART_CONFIG.MAX_QUANTITY) {
            toast.warning(`Maximum quantity of ${CART_CONFIG.MAX_QUANTITY} reached`);
          }
          
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newQuantity,
            lastUpdated: new Date().toISOString()
          };
          
          return updatedItems;
        }
        
        return [...prevItems, {
          ...product,
          quantity: Math.min(quantity, CART_CONFIG.MAX_QUANTITY),
          addedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }];
      });

      return true;
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.message || 'Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Enhanced updateQuantity with optimistic updates
  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (!session?.user?.email || !productId) return;

    setLoading(true);
    try {
      if (newQuantity < CART_CONFIG.MIN_QUANTITY) {
        await removeFromCart(productId);
        return;
      }

      if (newQuantity > CART_CONFIG.MAX_QUANTITY) {
        toast.warning(`Maximum quantity of ${CART_CONFIG.MAX_QUANTITY} reached`);
        newQuantity = CART_CONFIG.MAX_QUANTITY;
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
      console.error('Update quantity error:', error);
      toast.error('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Enhanced removeFromCart with optimistic updates
  const removeFromCart = useCallback(async (productId) => {
    if (!session?.user?.email || !productId) return;
    
    try {
      const itemToRemove = cartItems.find(item => item.id === productId);
      if (!itemToRemove) return;

      setCartItems(prev => prev.filter(item => item.id !== productId));
      toast.success(`${itemToRemove.name} removed from cart`);
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  }, [session, cartItems]);

  // Memoized cart summary calculations
  const cartSummary = useMemo(() => {
    try {
      const summary = cartItems.reduce((acc, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        const itemDiscount = (item.discount || 0) * (item.quantity || 0);

        return {
          totalItems: acc.totalItems + (item.quantity || 0),
          subtotal: acc.subtotal + itemTotal,
          totalDiscount: acc.totalDiscount + itemDiscount,
          itemCount: acc.itemCount + 1
        };
      }, {
        totalItems: 0,
        subtotal: 0,
        totalDiscount: 0,
        itemCount: 0
      });

      return {
        ...summary,
        total: Math.max(0, summary.subtotal - summary.totalDiscount),
        lastUpdated: lastSync,
        isEmpty: summary.itemCount === 0,
        isFull: summary.itemCount >= CART_CONFIG.MAX_CART_ITEMS
      };
    } catch (error) {
      console.error('Cart summary calculation error:', error);
      return {
        totalItems: 0,
        subtotal: 0,
        totalDiscount: 0,
        itemCount: 0,
        total: 0,
        lastUpdated: null,
        isEmpty: true,
        isFull: false
      };
    }
  }, [cartItems, lastSync]);

  // Clear cart with confirmation
  const clearCart = useCallback(async () => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      localStorage.removeItem(storageKey);
      setCartItems([]);
      setLastSync(null);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    }
  }, [getStorageKey]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loading,
    getCartSummary: () => cartSummary,
    lastSync,
    isCartFull: cartSummary.isFull,
    isEmpty: cartSummary.isEmpty
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