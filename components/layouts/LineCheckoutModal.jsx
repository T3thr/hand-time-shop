// components/LineCheckoutModal.jsx
'use client';
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ExternalLink, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import liff from '@line/liff';

const LineCheckoutModal = ({ isOpen, onClose }) => {
  const { cartItems, getCartSummary, clearCart } = useCart();
  const { subtotal, totalItems } = getCartSummary();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Format order message for LINE OA
  const formatOrderMessage = useCallback(() => {
    let message = "🛒 New Order 🛒\n\n";
    
    // Add items
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   ${item.quantity} x ฿${item.price.toFixed(2)} = ฿${(item.quantity * item.price).toFixed(2)}\n`;
    });
    
    // Add summary
    message += "\n------------------------\n";
    message += `Subtotal: ฿${subtotal.toFixed(2)}\n`;
    message += `Total Items: ${totalItems}\n`;
    message += "\nThank you for your order!";
    
    return message;
  }, [cartItems, subtotal, totalItems]);
  
  // Handle LINE checkout
  const handleLineCheckout = useCallback(async () => {
    try {
      setIsRedirecting(true);
      
      // Format the message
      const orderMessage = formatOrderMessage();
      
      // Initialize LIFF if needed
      if (!liff.isInClient() && !liff.isLoggedIn()) {
        if (!process.env.NEXT_PUBLIC_LIFF_ID) {
          throw new Error("LIFF ID is not set");
        }
        
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
      }
      
      // Get LINE OA ID from env variable
      const lineOaId = process.env.NEXT_PUBLIC_LINE_OA_ID;
      
      if (!lineOaId) {
        throw new Error("LINE OA ID is not set");
      }
      
      // Clear cart before redirecting
      clearCart();
      
      // Create the LINE chat URL with prefilled message
      const encodedMessage = encodeURIComponent(orderMessage);
      const lineUrl = `https://line.me/R/oaMessage/${lineOaId}/?${encodedMessage}`;
      
      // Redirect to LINE OA
      window.location.href = lineUrl;
      
    } catch (error) {
      console.error("LINE checkout error:", error);
      setIsRedirecting(false);
      // You may want to add toast notification here
    }
  }, [formatOrderMessage, clearCart]);
  
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
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <div className="w-full max-w-md bg-surface-card rounded-xl shadow-2xl overflow-hidden">
              <div className="flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-border-primary flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-text-primary">Confirm Order</h2>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-interactive-muted rounded-full transition-colors duration-200"
                    disabled={isRedirecting}
                  >
                    <X className="h-5 w-5 text-text-secondary" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="mb-4">
                    <p className="text-sm text-text-secondary mb-2">
                      You'll be redirected to LINE to confirm your order. The following message will be sent:
                    </p>
                    
                    <div className="bg-background-secondary p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
                      {formatOrderMessage()}
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <h3 className="font-medium text-text-primary">Order Summary</h3>
                    
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex items-center space-x-3">
                        <div className="relative h-12 w-12 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{item.name}</p>
                          <p className="text-xs text-text-muted">
                            {item.quantity} x ฿{item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-text-primary">
                          ฿{(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    
                    <div className="border-t border-border-primary pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-text-primary">Total</span>
                        <span className="font-semibold text-text-primary">฿{subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-border-primary">
                  <button
                    onClick={handleLineCheckout}
                    disabled={isRedirecting || cartItems.length === 0}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-[#06C755] text-white rounded-lg hover:bg-[#05b54d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRedirecting ? (
                      <>
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        <span>Redirecting to LINE...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to LINE</span>
                        <ExternalLink className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LineCheckoutModal;