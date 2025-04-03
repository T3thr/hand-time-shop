'use client'
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { 
  Menu, ShoppingCart
} from "lucide-react";
import Cart from './Cart';
import SideBar from './SideBar';
import Search from './Search';
import StartGuide from './StartGuide'; // Import the new component

export default function NavBar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { data: session } = useSession();
  const { cartItems, getCartSummary } = useCart();
  const { totalItems, subtotal } = getCartSummary();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <nav className={`fixed w-full z-40 transition-all duration-300 ${
        isScrolled ? "bg-surface-card/95 shadow-md backdrop-blur-md" : "bg-transparent"
      }`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-container rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>

            <Link href="/" className="ml-4 flex-shrink-0" aria-label="Home">
              <h1 className="text-xl lg:text-3xl font-bold text-primary">Hand Time Shop</h1>
            </Link>

            <div className="flex-1 flex justify-center px-4 sm:px-8">
              <Search />
            </div>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-container rounded-lg transition-colors group"
              aria-label="Cart"
            >
              <ShoppingCart className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
              {totalItems > 0 && (
                <>
                  <div className="absolute -top-2 -right-2">
                    <span className="flex h-5 w-5 items-center justify-center bg-primary text-text-inverted text-xs font-bold rounded-full">
                      {Math.min(totalItems, 99)}{totalItems > 99 ? '+' : ''}
                    </span>
                  </div>
                  <div className="absolute right-0 mt-2 w-72 bg-surface-card rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-colors pointer-events-none border border-border-primary">
                    <div className="p-4">
                      <div className="text-sm font-medium text-foreground">Cart Summary</div>
                      <div className="mt-2 text-xs text-text-secondary">
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

      <SideBar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      <StartGuide /> {/* Add the StartGuide component */}
    </>
  );
}