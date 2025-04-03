"use client";
import { useEffect } from 'react';
import { initializeLiff } from '@/backend/lib/lineLiff';

export default function LiffInitializer() {
  useEffect(() => {
    // Initialize LIFF on client side
    initializeLiff().catch(console.error);
    
    // Clean up function
    return () => {
      // Any cleanup if needed
    };
  }, []);
  
  // This component doesn't render anything
  return null;
}