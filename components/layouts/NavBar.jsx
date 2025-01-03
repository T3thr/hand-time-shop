'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Cart from './Cart';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();
  const { cartItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/95 dark:bg-gray-900/95 shadow-md backdrop-blur-sm" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">Hand Time</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/categories" className="nav-link">Categories</Link>
            <Link href="/deals" className="nav-link">Deals</Link>
            <Link href="/new-arrivals" className="nav-link">New Arrivals</Link>
            
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <button 
                  onClick={() => signOut()}
                  className="nav-link"
                >
                  Sign Out
                </button>
                <Link href="/profile" className="nav-link">
                  <User className="h-6 w-6" />
                </Link>
              </>
            ) : (
              <Link href="/signin" className="nav-link">
                Sign In
              </Link>
            )}
            
            {/* Cart Icon */}
            <button 
            onClick={() => setIsCartOpen(true)}
            className="relative group"
            >
            <ShoppingCart className="h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
            {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
                </span>
            )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/categories" className="nav-link block px-3 py-2">
              Categories
            </Link>
            <Link href="/deals" className="nav-link block px-3 py-2">
              Deals
            </Link>
            <Link href="/new-arrivals" className="nav-link block px-3 py-2">
              New Arrivals
            </Link>
            {!session && (
              <Link href="/signin" className="nav-link block px-3 py-2">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
      {/* Shopping Cart */}
<Cart 
  isOpen={isCartOpen} 
  onClose={() => setIsCartOpen(false)} 
/>
    </nav>
  );
}