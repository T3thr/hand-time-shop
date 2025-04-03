// components/layouts/SideBar.jsx
'use client';
import React, { useState, useCallback, useContext, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import { 
  Menu, User, X, Home, Tag, Sparkles, LogOut, ChevronRight,
  Settings, Shield, Copy, Eye, EyeOff, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import AuthContext from "@/context/AuthContext";
import SigninModal from "@/components/auth/SigninModal";
import SignoutModal from "@/components/auth/SignoutModal";
import { FaLine } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const LiffProvider = dynamic(
  () => import('@line/liff').then((mod) => mod.default),
  { ssr: false }
);

const sidebarLinks = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/categories", icon: Tag, label: "Categories" },
  { href: "/new-arrivals", icon: Sparkles, label: "New Arrivals" },
  { href: "/account", icon: Settings, label: "Account Settings" },
  { href: "/wishlist", icon: Heart, label: "Wishlist" },
];

export default function SideBar({ isOpen, onClose }) {
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const [isLineLoading, setIsLineLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showUserId, setShowUserId] = useState(false);
  const { data: session, status } = useSession();
  const { adminSignIn } = useContext(AuthContext);

  useEffect(() => {
    if (!isOpen) return;

    const initializeLiff = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_LIFF_ID) {
          console.warn("LIFF ID is not defined in environment variables");
          return;
        }

        const liff = (await import('@line/liff')).default;
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
        
        if (liff.isLoggedIn()) {
          const profileData = await liff.getProfile();
          setProfile(profileData);
        }
      } catch (error) {
        console.error("LIFF initialization error:", error);
      }
    };

    initializeLiff();
  }, [isOpen]);

  const handleLineSignIn = useCallback(async () => {
    setIsLineLoading(true);
    try {
      const liff = (await import('@line/liff')).default;
      
      if (!liff.isLoggedIn()) {
        await liff.login();
        return;
      }

      const profile = await liff.getProfile();
      setProfile(profile);

      // Register LINE user via API
      const registerResponse = await fetch('/api/auth/line/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        }),
      });

      if (!registerResponse.ok) {
        throw new Error("Failed to register LINE user");
      }

      // Sign in with NextAuth
      const result = await signIn("line", {
        redirect: false,
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Signed in with LINE successfully");
    } catch (error) {
      console.error("LINE login error:", error);
      toast.error("LINE login failed. Please try again.");
    } finally {
      setIsLineLoading(false);
    }
  }, []);

  const handleLogoutConfirmation = useCallback(() => {
    setIsSignoutModalOpen(true);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      if (session) {
        await signOut({ callbackUrl: '/' });
      }
      
      try {
        const liff = (await import('@line/liff')).default;
        if (liff?.isLoggedIn?.()) {
          await liff.logout();
        }
      } catch (liffError) {
        console.warn("LIFF logout error:", liffError);
      }
      
      setProfile(null);
      setIsSignoutModalOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out completely");
    }
  }, [session]);

  const copyUserId = useCallback(() => {
    if (profile?.userId) {
      navigator.clipboard.writeText(profile.userId);
      toast.success("User ID copied to clipboard");
    }
  }, [profile]);

  const getUserAvatar = useCallback(() => {
    if (session?.user?.role === 'admin') {
      return (
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
      );
    }
    
    if (profile?.pictureUrl || session?.user?.image) {
      return (
        <img 
          src={profile?.pictureUrl || session.user.image} 
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
    } else if (profile?.userId || session?.user?.lineId) {
      return (
        <div className="flex flex-col space-y-2">
          <span className="truncate">{profile?.displayName || session?.user?.name || 'LINE User'}</span>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setShowUserId(!showUserId)}
              className="p-1 rounded hover:bg-container"
              aria-label={showUserId ? "Hide User ID" : "Show User ID"}
            >
              {showUserId ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            {showUserId && (
              <div className="flex items-center space-x-1 max-w-12 overflow-hidden">
                <span className="text-xs bg-container px-2 py-1 rounded truncate">
                  {profile?.userId || session?.user?.lineId}
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
                      onClick={onClose}
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
                        onClick={onClose}
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
    </>
  );
}