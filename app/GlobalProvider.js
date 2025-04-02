"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "@/context/CartContext";
import NavBarWrapper from '@/components/layouts/NavBarWrapper'; 

export function GlobalProvider({ children }) {
  return (
    <>
          <SessionProvider>
              <AuthProvider>
                <CartProvider>
                  <NavBarWrapper /> {/* Use the wrapper instead of NavBar directly */}
                  <ToastContainer position="bottom-right" />
                  {children}
                </CartProvider>
              </AuthProvider>
          </SessionProvider>
    </>
  );
}