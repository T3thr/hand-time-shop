"use client";
import { useEffect, useState } from "react";

let liffObject = null;

export async function initializeLiff() {
  if (typeof window === 'undefined') return null;
  
  try {
    // Only import LIFF on client side
    const liff = (await import('@line/liff')).default;
    
    // Check if already initialized
    if (liff.isInitialized()) return liff;
    
    // Get LIFF ID from environment variable
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    
    if (!liffId) {
      console.error("LIFF ID is not defined in environment variables");
      return null;
    }
    
    // Initialize LIFF
    await liff.init({ liffId });
    console.log("LIFF initialized successfully");
    
    liffObject = liff;
    return liff;
  } catch (error) {
    console.error("LIFF initialization failed:", error);
    return null;
  }
}

export function useLiff() {
  const [liff, setLiff] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set liff if already initialized
    if (liffObject) {
      setLiff(liffObject);
      setIsReady(true);
      setIsLoggedIn(liffObject.isLoggedIn());
      return;
    }
    
    // Initialize LIFF
    initializeLiff()
      .then((liffInstance) => {
        if (liffInstance) {
          setLiff(liffInstance);
          setIsReady(true);
          setIsLoggedIn(liffInstance.isLoggedIn());
          
          // Get profile if logged in
          if (liffInstance.isLoggedIn()) {
            liffInstance.getProfile()
              .then(setProfile)
              .catch(e => setError(e));
          }
        }
      })
      .catch(err => {
        console.error("Error initializing LIFF:", err);
        setError(err);
      });
  }, []);

  return { liff, isReady, isLoggedIn, profile, error };
}

export default {
  initializeLiff,
  useLiff
};