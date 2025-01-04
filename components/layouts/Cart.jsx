import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

const Cart = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getCartSummary, loading } = useCart();
  const { data: session } = useSession();
  const { subtotal, totalItems } = getCartSummary();

  const slideVariants = {
    mobile: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' }
    },
    desktop: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' }
    }
  };

  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (!session?.user) {
      toast.error('Please sign in to update cart');
      return;
    }
    await updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    if (!session?.user) {
      toast.error('Please sign in to remove items');
      return;
    }
    await removeFromCart(productId);
    toast.success('Item removed from cart');
  };

  const handleCheckout = () => {
    if (!session?.user) {
      toast.error('Please sign in to checkout');
      return;
    }
    // Implement checkout logic here
    toast.info('Proceeding to checkout...');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Mobile Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl z-50 md:hidden"
            variants={slideVariants.mobile}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <CartContent
              cartItems={cartItems}
              handleQuantityUpdate={handleQuantityUpdate}
              handleRemoveItem={handleRemoveItem}
              handleCheckout={handleCheckout}
              subtotal={subtotal}
              totalItems={totalItems}
              loading={loading}
              onClose={onClose}
              isMobile={true}
            />
          </motion.div>

          {/* Desktop Sidebar */}
          <motion.div
            className="fixed top-0 right-0 h-full w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-50 hidden md:block"
            variants={slideVariants.desktop}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <CartContent
              cartItems={cartItems}
              handleQuantityUpdate={handleQuantityUpdate}
              handleRemoveItem={handleRemoveItem}
              handleCheckout={handleCheckout}
              subtotal={subtotal}
              totalItems={totalItems}
              loading={loading}
              onClose={onClose}
              isMobile={false}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CartContent = ({
  cartItems,
  handleQuantityUpdate,
  handleRemoveItem,
  handleCheckout,
  subtotal,
  totalItems,
  loading,
  onClose,
  isMobile
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Shopping Cart</h2>
              <p className="text-sm text-gray-500">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      )}

      {!loading && cartItems.length > 0 ? (
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4 px-4">
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="relative h-20 w-20 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">${item.price.toFixed(2)}</p>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => handleQuantityUpdate(item.id, Math.max(0, item.quantity - 1))}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      disabled={loading}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2 transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        !loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-4">Looks like you haven't added any items yet</p>
            <button
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              onClick={onClose}
            >
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        )
      )}

      {cartItems.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Subtotal</span>
              <span className="text-lg font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;