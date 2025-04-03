'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowUp, LogIn, Menu } from 'lucide-react';

export default function StartGuide() {
  const [showGuide, setShowGuide] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { data: session } = useSession();
  const [idleTimer, setIdleTimer] = useState(null);

  // Check if it's the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    
    if (!hasVisited && !session) {
      // First time visit and not logged in
      setTimeout(() => {
        setShowGuide(true);
      }, 1000); // Small delay for better UX after page load
      
      // Mark as visited
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, [session]);

  // Reset idle timer when user interacts
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      setShowGuide(false);
      
      // Clear existing timer
      if (idleTimer) clearTimeout(idleTimer);
      
      // Set new timer if user is not logged in
      if (!session) {
        const timer = setTimeout(() => {
          setShowGuide(true);
        }, 5000); // Show guide after 5 seconds of inactivity
        setIdleTimer(timer);
      }
    };

    // Add event listeners for user interaction
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleInteraction);
    });

    // Initial idle timer if user isn't logged in
    if (!session && hasInteracted) {
      const timer = setTimeout(() => {
        setShowGuide(true);
      }, 5000);
      setIdleTimer(timer);
    }

    // Cleanup
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, [session, hasInteracted, idleTimer]);

  // Hide guide when user is logged in
  useEffect(() => {
    if (session) {
      setShowGuide(false);
      if (idleTimer) clearTimeout(idleTimer);
    }
  }, [session, idleTimer]);

  if (!showGuide || session) return null;

  return (
    <div className="fixed z-30 top-16 left-4 flex flex-col items-center animate-bounce-gentle">
      {/* Arrow pointing up to hamburger menu */}
      <div className="relative flex flex-col items-center">
        
        {/* Guide bubble with animation */}
        <div className="mt-2 bg-surface-card border border-primary p-4 rounded-lg shadow-lg max-w-xs relative">
          <div className="absolute -top-2 left-4 w-4 h-4 rotate-45 bg-surface-card border-t border-l border-primary"></div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Menu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Click here to open menu</h3>
              <p className="text-sm text-text-secondary mt-1">Login to access your account</p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-primary">
              <LogIn className="h-4 w-4" />
              <span>Sign in for benefits!</span>
            </div>
            <button 
              onClick={() => setShowGuide(false)} 
              className="text-text-secondary hover:text-text-primary"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}