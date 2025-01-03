// context/CartContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product, quantity = 1) => {
    setLoading(true);
    try {
      const existingItem = cartItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if item exists
        setCartItems(cartItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        // Add new item
        setCartItems([...cartItems, { ...product, quantity }]);
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      setLoading(false);
      throw new Error('Failed to add item to cart');
    }
  };

  const removeFromCart = (productId) => {
    try {
      setCartItems(cartItems.filter(item => item.id !== productId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        removeFromCart(productId);
        return;
      }

      setCartItems(cartItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    toast.success('Cart cleared');
  };

  // Calculate total price
  const total = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  // Calculate total items
  const itemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

