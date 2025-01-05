'use client'
import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useCart } from "@/context/CartContext";
import ImageSlider from "@/components/contents/ImageSlider";

const CATEGORIES = [
  {
    name: 'ผ้าซิ่น',
    image: '/images/categories/fashion.jpg',
    alt: ''
  },
  {
    name: 'เครื่องเงิน', 
    image: '/images/categories/electronics.jpg',
    alt: ''
  },
  {
    name: 'อื่นๆ',
    image: '/images/categories/home.jpg', 
    alt: ''
  }
];

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Grandma silk',
    price: 70,
    description: 'ผ้าซิ่นสุดเท่จากยาย',
    image: '/products/1.jpg',
    alt: 'White sneakers on white background',
    category: 'ผ้าซิ่น'
  },
  {
    id: 2, 
    name: 'Hootub',
    price: 149.99,
    description: 'แมวหูตุบ',
    image: '/products/2.jpg',
    alt: 'Brown leather backpack',
    category: 'อื่นๆ'
  },
  {
    id: 3,
    name: '...',
    price: 199.99,
    description: '-',
    image: '/products/3.jpg',
    alt: '...',
    category: 'เครื่องเงิน'
  },
  {
    id: 4,
    name: '...',
    price: 299.99,
    description: '-',
    image: '/products/4.jpg',
    alt: '...',
    category: 'ผ้าซิ่น'
  }
];

export default function Product() {
  const [displayedProducts, setDisplayedProducts] = useState(FEATURED_PRODUCTS);
  const [loadingStates, setLoadingStates] = useState({});
  const [filters, setFilters] = useState({
    category: "",
    priceRange: "",
    sortBy: "",
    searchQuery: ""
  });
  
  const { data: session } = useSession();
  const { addToCart, cartItems, getCartSummary } = useCart();
  const router = useRouter();

  // Product filtering and sorting function with search
  const getFilteredProducts = () => {
    let filtered = [...FEATURED_PRODUCTS];
    
    if (filters.searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }
    
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-");
      filtered = filtered.filter(p => p.price >= min && p.price <= max);
    }
    
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        if (filters.sortBy === "price-asc") return a.price - b.price;
        if (filters.sortBy === "price-desc") return b.price - a.price;
        if (filters.sortBy === "name") return a.name.localeCompare(b.name);
      });
    }
    
    return filtered;
  };

  // Update products when filters change
  useEffect(() => {
    setDisplayedProducts(getFilteredProducts());
  }, [filters]);

  const handleSearch = (searchResults) => {
    if (searchResults) {
      setFilters(prev => ({
        ...prev,
        searchQuery: searchResults.length ? searchResults[0].name : ""
      }));
    }
  };

  const handleAddToCart = async (product) => {
    if (!session) {
      toast.error("Please sign in to add items to cart");
      router.push('/signin');
      return;
    }
  
    setLoadingStates(prev => ({ ...prev, [product.id]: true }));
  
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        category: product.category,
      };
  
      const success = await addToCart(cartItem);
  
      if (success) {
        const { totalItems, subtotal } = getCartSummary();
        
        toast.success(
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative rounded overflow-hidden">
                <Image 
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">Added to cart</p>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Cart total: ${subtotal.toFixed(2)} ({totalItems} items)
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setLoadingStates(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const isProductInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const getProductQuantityInCart = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const handleWishlist = async (productId) => {
    if (!session) {
      toast.error("Please sign in to add items to wishlist");
      return;
    }
    // Implement wishlist logic
  };

  const handleQuickView = (product) => {
    // Implement quick view modal logic
  };

  // Render no results message if needed
  const renderNoResults = () => {
    if (filters.searchQuery && displayedProducts.length === 0) {
      return (
        <div className="col-span-full py-12 text-center">
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">
            No products found for "{filters.searchQuery}"
          </h3>
          <p className="mt-2 text-gray-500">
            Try adjusting your search or filters to find what you're looking for
          </p>
          <button
            onClick={() => setFilters(prev => ({ ...prev, searchQuery: "", category: "" }))}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Clear Search
          </button>
        </div>
      );
    }
    return null;
  };

  // Make FEATURED_PRODUCTS available globally for the search component
  if (typeof window !== 'undefined') {
    window.FEATURED_PRODUCTS = FEATURED_PRODUCTS;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Improved responsiveness and visual hierarchy */}
      <section className="relative h-[80vh] lg:h-[80vh] bg-gradient-to-r from-cyan-100 to-blue-300 dark:from-cyan-950 dark:to-blue-800">
        <div className="container-custom h-full flex items-center px-4 lg:px-8">
          <div className="max-w-2xl text-var-foreground space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Discover Your <span className="text-primary-light">Perfect Style</span>
            </h1>
            <p className="text-lg md:text-xl text-var-foreground leading-relaxed">
            Discover a world of unique, handcrafted products, made with love and skill right here in Uttaradit. 
            From traditional crafts to modern designs, 
            every item in our collection is created by local artisans using time-honored techniques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="btn-primary bg-white text-blue-600 hover:bg-red-400">
                Shop Now
              </button>
              <button className="btn-primary bg-white/10 hover:bg-white/20 backdrop-blur-sm">
                Learn More
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-900"></div>
      </section>

      <ImageSlider/>

      {/* Categories Section - Enhanced grid and hover effects */}
      <section className="py-12 md:py-20">
        <div className="container-custom px-4 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {CATEGORIES.map((category) => (
              <div key={category.name} 
                className="group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="aspect-[4/3] md:aspect-square relative">
                  <Image
                    src={category.image}
                    alt={category.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 group-hover:from-black/70 transition-all duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-white text-2xl md:text-3xl font-bold mb-2">{category.name}</span>
                    <span className="text-white/80 text-sm md:text-base opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Explore Collection →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Premium design with enhanced user interaction */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/30">
        <div className="container-custom px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                {filters.searchQuery ? 'Search Results' : 'Featured Products'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {filters.searchQuery 
                  ? `Showing results for "${filters.searchQuery}"`
                  : 'Discover our handpicked selection'}
              </p>
            </div>
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: "" }))}
                className="text-sm text-gray-500 hover:text-primary transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {renderNoResults()}
            {displayedProducts.map((product) => (
              <div key={product.id} 
                className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col"
              >
                <div className="aspect-square relative bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.alt}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 -right-1 flex flex-col gap-2 transform translate-x-10 group-hover:-translate-x-2 transition-transform duration-300">
                    <button 
                      onClick={() => handleWishlist(product.id)}
                      className="p-2.5 bg-white/95 dark:bg-gray-900/95 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 backdrop-blur-sm"
                    >
                      <span className="sr-only">Add to wishlist</span>
                      ❤️
                    </button>
                    <button 
                      onClick={() => handleQuickView(product)}
                      className="p-2.5 bg-white/95 dark:bg-gray-900/95 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 backdrop-blur-sm"
                    >
                      <span className="sr-only">Quick view</span>
                      👁️
                    </button>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">
                      {product.name}
                    </h3>
                    <span className="text-primary-light font-semibold text-lg">
                      ${product.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-4">
                    {product.description}
                  </p>
                  <div className="mt-auto pt-6">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    disabled={loadingStates[product.id]}
                    className={`w-full btn-primary ${
                      isProductInCart(product.id) 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-primary hover:bg-primary-dark'
                    } transform transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loadingStates[product.id] ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Adding...
                      </span>
                    ) : (
                      <>
                        <svg className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {isProductInCart(product.id) 
                          ? `In Cart (${getProductQuantityInCart(product.id)})` 
                          : 'Add to Cart'}
                      </>
                    )}
                  </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}