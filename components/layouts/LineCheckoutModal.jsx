// components/LineCheckoutModal.jsx
"use client";
import React, { useState, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ExternalLink, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import AuthContext from "@/context/AuthContext";
import { toast } from "react-toastify";
import Image from "next/image";
import liff from "@line/liff";

const LineCheckoutModal = ({ isOpen, onClose }) => {
  const { cartItems, getCartSummary, clearCart } = useCart();
  const { lineProfile } = useContext(AuthContext);
  const { subtotal, totalItems } = getCartSummary();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Format order message for LINE OA or OpenChat
  const formatOrderMessage = useCallback(() => {
    let message = "🛒 New Order 🛒\n\n";
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   ${item.quantity} x ฿${item.price.toFixed(2)} = ฿${(item.quantity * item.price).toFixed(2)}\n`;
    });
    message += "\n------------------------\n";
    message += `Subtotal: ฿${subtotal.toFixed(2)}\n`;
    message += `Total Items: ${totalItems}\n`;
    message += "\nThank you for your order! Please provide your shipping details.";
    return message;
  }, [cartItems, subtotal, totalItems]);

  // Handle LINE checkout with LIFF
  const handleLineCheckout = useCallback(async () => {
    setIsProcessing(true);

    try {
      if (!process.env.NEXT_PUBLIC_LIFF_ID) {
        throw new Error("LIFF ID is not set in environment variables");
      }

      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });

      if (!liff.isLoggedIn()) {
        // Request necessary scopes
        await liff.login({ scope: "openid profile chat_message.write" });
        return; // After login, this function will re-run
      }

      const orderMessage = formatOrderMessage();

      // Check if the user has granted chat_message.write permission
      const permissions = await liff.getPermissions();
      if (!permissions.some((p) => p.name === "chat_message.write")) {
        toast.warn("Please grant permission to send messages via LINE.");
        await liff.login({ scope: "openid profile chat_message.write" });
        return;
      }

      // Since sendMessages only works in the user's own chat, we'll open an OpenChat or prompt manual sending
      // Replace with your LINE OA OpenChat URL or LINE ID
      const lineOaUrl = "https://line.me/R/ti/g/YOUR_OPENCHAT_ID"; // Replace with your OpenChat link

      await liff.openWindow({
        url: `${lineOaUrl}?message=${encodeURIComponent(orderMessage)}`,
        external: false, // Open within LINE app if possible
      });

      // Clear the cart after successful submission
      clearCart();

      // Show thank-you popup
      setShowThankYou(true);
      setIsProcessing(false);

      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowThankYou(false);
        onClose();
      }, 3000);

    } catch (error) {
      console.error("LINE checkout error:", error);
      setIsProcessing(false);
      toast.error(`Failed to process order: ${error.message}`);
    }
  }, [formatOrderMessage, clearCart, onClose]);

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
                    disabled={isProcessing}
                  >
                    <X className="h-5 w-5 text-text-secondary" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="mb-4">
                    <p className="text-sm text-text-secondary mb-2">
                      Your order will be sent to our LINE Official Account. Here's the summary:
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
                    disabled={isProcessing || cartItems.length === 0}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-[#06C755] text-white rounded-lg hover:bg-[#05b54d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        <span>Processing...</span>
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

          {/* Thank You Popup */}
          {showThankYou && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 flex items-center justify-center z-60"
            >
              <div className="bg-surface-card p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-success/20 p-3 rounded-full">
                    <Check className="h-6 w-6 text-success" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Thank You!</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Your order has been sent to our LINE Official Account. We’ll contact you soon.
                </p>
                <button
                  onClick={() => {
                    setShowThankYou(false);
                    onClose();
                  }}
                  className="inline-flex items-center px-4 py-2 bg-primary text-text-inverted rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default LineCheckoutModal;