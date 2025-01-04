'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { 
  Menu, 
  ShoppingCart, 
  User, 
  X, 
  Home,
  Tag,
  Sparkles,
  LogOut,
  ChevronRight,
  Settings
} from "lucide-react";
import Cart from './Cart';
import { motion, AnimatePresence } from "framer-motion";
import Search from './Search';

export default function NavBar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();
  const { cartItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize featured products on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFeaturedProducts(window.FEATURED_PRODUCTS || []);
    }
  }, []);

  const sidebarLinks = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/categories", icon: Tag, label: "Categories" },
    { href: "/new-arrivals", icon: Sparkles, label: "New Arrivals" },
    { href: "/account", icon: Settings, label: "Account Settings" },
  ];

  return (
    <>
      <nav className={`fixed w-full z-40 transition-all duration-300 ${
        isScrolled ? "bg-white/95 dark:bg-gray-900/95 shadow-md backdrop-blur-sm" : "bg-transparent"
      }`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Left Section - Always stays leftmost */}
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Logo - Stays near left but with some spacing */}
            <div className="ml-4">
              <Link href="/" className="flex-shrink-0">
                <h1 className="text-xl lg:text-3xl font-bold text-primary">Hand Time Shop</h1>
              </Link>
            </div>

            {/* Center Section - Search - Takes remaining space */}
            <div className="flex-1 flex justify-center px-4 sm:px-8">
              <Search 
                products={featuredProducts}
                onSearch={(results) => {
                  if (results) {
                    setFilters?.(prev => ({
                      ...prev,
                      searchQuery: results.length ? results[0].name : ""
                    }));
                  }
                }} 
              />
            </div>

            {/* Right Section - Always stays rightmost */}
            <div className="ml-auto">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Game Dashboard Style Sidebar */}
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
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {session?.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt="Profile" 
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h2 className="font-semibold">
                          {session?.user?.name || "Guest"}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {session?.user?.email || "Sign in to access more features"}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Sidebar Links */}
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-1 px-3">
                    {sidebarLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <link.icon className="h-5 w-5 text-gray-500 group-hover:text-primary" />
                        <span className="flex-1">{link.label}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {session ? (
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <Link
                      href="/signin"
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span>Sign In</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Component */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
}
