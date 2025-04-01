'use client'
import React, { useState, useEffect, useCallback, useContext } from "react";
import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { 
  Menu, ShoppingCart, User, X, Home,
  Tag, Sparkles, LogOut, ChevronRight,
  Settings, Shield, Copy, Eye, EyeOff
} from "lucide-react";
import Cart from './Cart';
import { motion, AnimatePresence } from "framer-motion";
import Search from './Search';
import { toast } from "react-toastify";
import AuthContext from "@/context/AuthContext";
import SigninModal from "@/components/auth/SigninModal";
import SignoutModal from "@/components/auth/SignoutModal";
import { FaLine } from 'react-icons/fa';
import liff from '@line/liff';

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
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const [isLineLoading, setIsLineLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showUserId, setShowUserId] = useState(false);
  const { data: session } = useSession();
  const { cartItems, getCartSummary } = useCart();
  const { totalItems, subtotal } = getCartSummary();
  const { adminSignIn } = useContext(AuthContext);

  // Initialize LIFF
  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
        if (liff.isLoggedIn()) {
          const profileData = await liff.getProfile();
          setProfile(profileData);
          localStorage.setItem('lineUserId', profileData.userId);
        }
      } catch (error) {
        console.error("LIFF initialization error:", error);
        toast.error("Failed to initialize LINE login");
      }
    };

    initializeLiff();
  }, []);

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
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const profile = await liff.getProfile();
      await signIn("line", {
        callbackUrl: "/",
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl
      });
    } catch (error) {
      toast.error("Failed to initiate LINE login");
    } finally {
      setIsLineLoading(false);
    }
  }, []);

  const handleLogoutConfirmation = useCallback(() => {
    setIsSignoutModalOpen(true);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      // Sign out from NextAuth if session exists
      if (session) {
        await signOut({ callbackUrl: '/' });
      }
      
      // Sign out from LINE LIFF if logged in
      if (liff.isLoggedIn()) {
        liff.logout();
      }
      
      // Clear local storage
      localStorage.removeItem('lineUserId');
      
      // Close the modal
      setIsSignoutModalOpen(false);
      
      // Reload the page to reset state
      window.location.reload();
    } catch (error) {
      toast.error("Failed to sign out");
      console.error("Logout error:", error);
    }
  }, [session]);

  const copyUserId = useCallback(() => {
    if (profile?.userId) {
      navigator.clipboard.writeText(profile.userId);
      toast.success("User ID copied to clipboard");
    }
  }, [profile]);

  const getUserAvatar = useCallback(() => {
    // Show admin avatar first if admin session exists
    if (session?.user?.role === 'admin') {
      return (
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
      );
    }
    
    // Show LINE profile picture if available
    if (profile?.pictureUrl) {
      return (
        <img 
          src={profile.pictureUrl} 
          alt="Profile" 
          className="h-10 w-10 rounded-full object-cover"
          loading="lazy"
        />
      );
    }
    
    // Show NextAuth user image if available
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
    
    // Default avatar
    return (
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <User className="h-6 w-6 text-primary" />
      </div>
    );
  }, [session, profile]);

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

  const renderUserInfo = useCallback(() => {
    if (session?.user?.email) {
      return session.user.email;
    } else if (profile?.userId) {
      return (
        <div className="flex flex-col space-y-2">
          <span className="truncate">LINE User</span>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setShowUserId(!showUserId)}
              className="p-1 rounded hover:bg-container"
              aria-label={showUserId ? "Hide User ID" : "Show User ID"}
            >
              {showUserId ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            {showUserId && (
              <div className="flex items-center space-x-1 max-w-full overflow-hidden">
                <span className="text-xs bg-container px-2 py-1 rounded truncate">
                  {profile.userId}
                </span>
                <button 
                  onClick={copyUserId}
                  className="p-1 rounded hover:bg-container flex-shrink-0"
                  aria-label="Copy User ID"
                >
                  <Copy size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
    return "Sign in to access more features";
  }, [session, profile, showUserId, copyUserId]);

  return (
    <>
      <nav className={`fixed w-full z-40 transition-all duration-300 ${
        isScrolled ? "bg-surface-card/95 shadow-md backdrop-blur-sm" : "bg-transparent"
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
              {cartItems.length > 0 && (
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
              className="fixed top-0 left-0 h-full w-80 bg-surface-card shadow-2xl z-50 border-r border-border-primary"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border-primary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getUserAvatar()}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h2 className="font-semibold text-foreground truncate">
                            {session?.user?.name || profile?.displayName || "Guest"}
                          </h2>
                          {getUserRoleBadge()}
                        </div>
                        <p className="text-sm text-text-secondary">
                          {renderUserInfo()}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 hover:bg-container rounded-full flex-shrink-0"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5 text-foreground" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-1 px-3">
                    {sidebarLinks.map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-container transition-colors group"
                      >
                        <Icon className="h-5 w-5 text-text-secondary group-hover:text-primary" />
                        <span className="flex-1 text-foreground">{label}</span>
                        <ChevronRight className="h-4 w-4 text-text-tertiary group-hover:text-primary" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-border-primary">
                  {session || profile ? (
                    <button
                      onClick={handleLogoutConfirmation}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-container hover:bg-container/80 transition-colors"
                    >
                      <LogOut className="h-5 w-5 text-foreground" />
                      <span className="text-foreground">Sign Out</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleLineSignIn}
                        disabled={isLineLoading}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-[#06C755] text-text-inverted hover:bg-[#05b54d] transition-colors"
                      >
                        {isLineLoading ? (
                          <>
                            <span className="animate-spin h-5 w-5 border-2 border-text-inverted border-t-transparent rounded-full" />
                            <span>Signing in...</span>
                          </>
                        ) : (
                          <>
                            <FaLine className="h-5 w-5" />
                            <span>Sign in with LINE</span>
                          </>
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

      <SignoutModal
        isOpen={isSignoutModalOpen}
        onClose={() => setIsSignoutModalOpen(false)}
        onConfirm={handleLogout}
      />

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
}