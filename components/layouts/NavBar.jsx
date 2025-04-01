'use client'
import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { 
  Menu, ShoppingCart, User, X, Home,
  Tag, Sparkles, LogOut, ChevronRight,
  Settings, Shield
} from "lucide-react";
import Cart from './Cart';
import { motion, AnimatePresence } from "framer-motion";
import Search from './Search';
import { toast } from "react-toastify";
import AuthContext from "@/context/AuthContext";
import SigninModal from "@/components/auth/SigninModal";

const sidebarLinks = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/categories", icon: Tag, label: "Categories" },
  { href: "/new-arrivals", icon: Sparkles, label: "New Arrivals" },
  { href: "/account", icon: Settings, label: "Account Settings" },
];

export default function NavBar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const [isLineLoading, setIsLineLoading] = useState(false);
  const { data: session } = useSession();
  const { cartItems, getCartSummary } = useCart();
  const { totalItems, subtotal } = getCartSummary();
  const { adminSignIn } = useContext(AuthContext);

  // Memoize cart summary to prevent unnecessary recalculations
  const cartSummary = useMemo(() => getCartSummary(), [getCartSummary, cartItems]);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleLineSignIn = useCallback(async () => {
    try {
      setIsLineLoading(true);
      await signIn("line", { callbackUrl: "/" });
    } catch (error) {
      toast.error("Failed to initiate LINE login");
      setIsLineLoading(false);
    }
  }, []);

  const getUserAvatar = useCallback(() => {
    if (session?.user?.image) {
      return (
        <img 
          src={session.user.image} 
          alt="Profile" 
          className="h-10 w-10 rounded-full object-cover"
          loading="lazy"
        />
      );
    }
    return (
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <User className="h-6 w-6 text-primary" />
      </div>
    );
  }, [session]);

  const getUserRoleBadge = useCallback(() => {
    if (!session?.user?.role) return null;
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${
        session.user.role === 'admin' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-green-100 text-green-800'
      }`}>
        {session.user.role}
      </span>
    );
  }, [session]);

  return (
    <>
      <nav className={`fixed w-full z-40 transition-normal ${
        isScrolled ? "bg-white/95 dark:bg-gray-900/95 shadow-md backdrop-blur-sm" : "bg-transparent"
      }`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-fast"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="ml-4 flex-shrink-0" aria-label="Home">
              <h1 className="text-xl lg:text-3xl font-bold text-primary">Hand Time Shop</h1>
            </Link>

            <div className="flex-1 flex justify-center px-4 sm:px-8">
              <Search />
            </div>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-fast group"
              aria-label="Cart"
            >
              <ShoppingCart className="h-6 w-6 group-hover:text-primary transition-fast" />
              {cartItems.length > 0 && (
                <>
                  <div className="absolute -top-2 -right-2">
                    <span className="flex h-5 w-5 items-center justify-center bg-primary text-white text-xs font-bold rounded-full">
                      {Math.min(totalItems, 99)}{totalItems > 99 ? '+' : ''}
                    </span>
                  </div>
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-fast pointer-events-none">
                    <div className="p-4">
                      <div className="text-sm font-medium">Cart Summary</div>
                      <div className="mt-2 text-xs text-gray-500">
                        {totalItems} items · ${subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getUserAvatar()}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="font-semibold">
                            {session?.user?.name || "Guest"}
                          </h2>
                          {getUserRoleBadge()}
                        </div>
                        <p className="text-sm text-gray-500">
                          {session?.user?.email || "Sign in to access more features"}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-fast"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-1 px-3">
                    {sidebarLinks.map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-fast group"
                      >
                        <Icon className="h-5 w-5 text-gray-500 group-hover:text-primary" />
                        <span className="flex-1">{label}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {session ? (
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-fast"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleLineSignIn}
                        disabled={isLineLoading}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-[#06C755] text-white hover:bg-[#05b54d] transition-fast"
                      >
                        {isLineLoading ? (
                          <>
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            Signing in...
                          </>
                        ) : (
                          "Sign in with LINE"
                        )}
                      </button>
                      <button
                        onClick={() => setIsSigninModalOpen(true)}
                        className="w-full btn-primary flex items-center justify-center space-x-2 px-4 py-2 rounded-lg"
                      >
                        <User className="h-5 w-5" />
                        <span>Admin Sign In</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SigninModal 
        isOpen={isSigninModalOpen}
        onClose={() => setIsSigninModalOpen(false)}
        adminSignIn={adminSignIn}
      />

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
}