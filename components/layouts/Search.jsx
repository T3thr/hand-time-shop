'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Search = ({ products, onSearch }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  
  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = products?.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered || []);
    if (onSearch) onSearch(filtered);
  };

  return (
    <div ref={searchRef} className="relative lg:w-96 z-50">
      {/* Desktop Search */}
      <div className="hidden md:block w-full max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary border-none transition-all duration-300"
          />
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-2.5 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Desktop Search Results */}
        <AnimatePresence>
          {searchQuery && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 w-full bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="max-h-96 overflow-y-auto">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors flex items-center space-x-3"
                    onClick={() => {
                      // Handle product selection
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${product.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Search Icon & Modal */}
      <div className="md:hidden">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <SearchIcon className="h-6 w-6" />
        </button>

        <AnimatePresence>
          {isSearchOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setIsSearchOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 z-50 shadow-xl"
              >
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary border-none"
                  />
                  <SearchIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-3 top-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Mobile Search Results */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-200 dark:border-gray-700 last:border-0"
                        onClick={() => {
                          // Handle product selection
                          setSearchQuery('');
                          setIsSearchOpen(false);
                        }}
                      >
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ${product.price}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Search;