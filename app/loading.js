import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {/* Artisan-inspired loading spinner */}
          <div className="w-24 h-24 border-4 border-primary/20 rounded-full animate-spin">
            <div className="absolute inset-2 border-4 border-transparent border-b-primary rounded-full"></div>
          </div>
          
          {/* Handcraft-inspired elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse origin-center"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse origin-center delay-300"></div>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary">
            Crafting Your Experience
          </h2>
          <p className="text-text-secondary mt-2 animate-pulse">
            Gathering handmade treasures...
          </p>
        </div>
      </div>
    </div>
  );
}