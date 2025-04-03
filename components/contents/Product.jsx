'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useCart } from '@/context/CartContext';
import ImageSlider from '@/components/contents/ImageSlider';
import LearnMoreModal from '@/components/contents/LearnMoreModal';
import { Heart, ShoppingBag, Filter, Search, X, ChevronRight } from 'lucide-react';
import { useProducts } from '@/backend/lib/productAction';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Product() {
  // Added refs for scroll functionality
  const featuredProductsRef = useRef(null);
  
  // Added state for LearnMoreModal
  const [isLearnMoreModalOpen, setIsLearnMoreModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: '',
    searchQuery: '',
  });
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = useSession();
  const { addToCart, cartItems, getCartSummary } = useCart();
  const { products, isLoading: productsLoading, isError } = useProducts();
  const router = useRouter();

  // Scroll to featured products function
  const scrollToFeaturedProducts = () => {
    if (featuredProductsRef.current) {
      featuredProductsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/category');
        setCategories(response.data);
      } catch (error) {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const getFilteredProducts = () => {
    if (!products) return [];

    let filtered = [...products];

    if (filters.searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter((p) => p.categories.includes(filters.category));
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter((p) => p.price >= min && p.price <= max);
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'name') return a.name.localeCompare(b.name);
        if (filters.sortBy === 'rating') return b.averageRating - a.averageRating;
        return 0;
      });
    }

    return filtered;
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
  
    if (!session) {
      toast.error('Please sign in to add items to cart');
      router.push('/signin');
      return;
    }
  
    try {
      const cartItem = {
        id: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.images[0]?.url || '/images/placeholder.jpg',
        category: product.categories[0] || '',
      };
  
      const success = await addToCart(cartItem);
  
      if (success) {
        const { totalItems, subtotal } = getCartSummary();
        toast.success(
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative rounded overflow-hidden">
                <Image
                  src={product.images[0]?.url || '/images/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-text-primary">{product.name}</p>
                <p className="text-sm text-text-muted">Added to cart</p>
              </div>
            </div>
            <div className="mt-2 text-sm text-text-secondary">
              Cart total: ${subtotal.toFixed(2)} ({totalItems} items)
            </div>
          </div>
        );
      }
    } catch (error) {
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  const isProductInCart = (productId) => cartItems.some((item) => item.id === productId);
  const getProductQuantityInCart = (productId) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const handleWishlist = async (productId, e) => {
    e.stopPropagation();

    if (!session) {
      toast.error('Please sign in to manage wishlist');
      return;
    }

    try {
      const response = await axios.post('/api/wishlist', { productId, action: 'toggle' });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const displayedProducts = getFilteredProducts();

  const priceRanges = [
    { label: 'All Prices', value: '' },
    { label: 'Under $25', value: '0-25' },
    { label: '$25 - $50', value: '25-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: 'Over $100', value: '100-10000' },
  ];

  const sortOptions = [
    { label: 'Featured', value: '' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name', value: 'name' },
    { label: 'Top Rated', value: 'rating' },
  ];

  if (isLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-primary font-medium">Loading handcrafted treasures...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-error mb-4">Oops! Something went wrong</h2>
          <p className="text-text-secondary mb-6">We couldn't load our handcrafted products. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary bg-primary hover:bg-primary-dark"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Learn More Modal */}
      <LearnMoreModal 
        isOpen={isLearnMoreModalOpen} 
        onClose={() => setIsLearnMoreModalOpen(false)} 
      />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] lg:h-[80vh] bg-gradient-to-r from-background-secondary to-primary-light dark:from-background-secondary dark:to-primary-dark">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat bg-center opacity-20"></div>
        </div>
        <div className="container mx-auto max-w-7xl h-full flex items-center px-4 lg:px-8 z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-foreground space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Discover Your <span className="text-primary">Perfect Style</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              Discover a world of unique, handcrafted products, made with love and skill right here in Uttaradit.
              From traditional crafts to modern designs, every item tells a story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToFeaturedProducts}
                className="btn-primary bg-primary text-text-inverted hover:bg-primary-dark transition-colors duration-200"
              >
                Shop Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsLearnMoreModalOpen(true)}
                className="btn-primary bg-surface-card/10 hover:bg-surface-card/20 backdrop-blur-sm transition-colors duration-200"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background dark:from-background to-transparent"></div>
      </section>

      <ImageSlider />

      {/* Categories Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-text-primary">Shop by Category</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">Explore our collection of handcrafted products organized by category, each representing unique craftsmanship and cultural heritage.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.slug || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                onClick={() => setFilters((prev) => ({ ...prev, category: category.name }))}
              >
                <div className="aspect-[4/3] md:aspect-square relative">
                  <Image
                    src={category.image?.url || '/images/placeholder.jpg'}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 group-hover:from-black/70 transition-all duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <span className="text-text-inverted text-2xl md:text-3xl font-bold mb-2">{category.name}</span>
                    <span className="text-text-inverted/80 text-sm md:text-base opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-center">
                      Explore Collection <ChevronRight className="inline-block ml-1 w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Bar - Mobile Friendly */}
      <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-md border-y border-border-primary">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-text-secondary hover:text-primary transition-colors duration-200 mr-4"
              >
                <Filter className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-9 pr-3 py-1.5 text-black rounded-full border border-border-primary bg-surface-card/80 focus:outline-none focus:ring-2 focus:ring-primary text-sm w-full sm:w-auto"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                {filters.searchQuery && (
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-text-muted hover:text-error" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                className="py-1.5 pl-3 pr-8 rounded-full border border-border-primary text-black bg-surface-card/80 focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {filters.category && (
                <div className="flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                  <span>{filters.category}</span>
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, category: '' }))}
                    className="ml-2"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 pt-3 border-t border-border-primary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div>
                <h4 className="text-sm font-medium mb-2 text-text-secondary">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, category: '' }))}
                    className={`px-3 py-1.5 text-xs rounded-full ${
                      filters.category === '' 
                        ? 'bg-primary text-text-inverted' 
                        : 'bg-surface-card hover:bg-surface-card/80 text-text-secondary'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => setFilters((prev) => ({ ...prev, category: category.name }))}
                      className={`px-3 py-1.5 text-xs rounded-full ${
                        filters.category === category.name 
                          ? 'bg-primary text-text-inverted' 
                          : 'bg-surface-card hover:bg-surface-card/80 text-text-secondary'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 text-text-secondary">Price Range</h4>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setFilters((prev) => ({ ...prev, priceRange: range.value }))}
                      className={`px-3 py-1.5 text-xs rounded-full ${
                        filters.priceRange === range.value 
                          ? 'bg-primary text-text-inverted' 
                          : 'bg-surface-card hover:bg-surface-card/80 text-text-secondary'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={() => {
                    setFilters({
                      category: '',
                      priceRange: '',
                      sortBy: '',
                      searchQuery: '',
                    });
                    setShowFilters(false);
                  }}
                  className="text-sm text-text-muted hover:text-primary transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background to-background-secondary/50 dark:from-background dark:to-background-secondary/20">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                {filters.searchQuery || filters.category ? 'Filtered Products' : 'Featured Products'}
              </h2>
              <p className="text-text-secondary">
                {(filters.searchQuery || filters.category)
                  ? `Showing ${displayedProducts.length} result${displayedProducts.length !== 1 ? 's' : ''}`
                  : 'Discover our handpicked artisanal treasures'}
              </p>
            </motion.div>
          </div>

          {displayedProducts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex justify-center items-center w-16 h-16 mb-6 rounded-full bg-background-secondary">
                <Search className="h-8 w-8 text-text-muted" />
              </div>
              <h3 className="text-xl font-medium text-text-primary mb-2">No products found</h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                We couldn't find any products matching your current filters. Try adjusting your search criteria.
              </p>
              <button
                onClick={() => setFilters({
                  category: '',
                  priceRange: '',
                  sortBy: '',
                  searchQuery: '',
                })}
                className="btn-primary bg-primary hover:bg-primary-dark inline-flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {displayedProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index % 4 * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="group bg-surface-card rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="aspect-square relative bg-gradient-to-br from-background-secondary/60 to-background/60 dark:from-background-secondary/60 dark:to-background/60 overflow-hidden">
                    <Image
                      src={product.images[0]?.url || '/images/placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 -right-1 flex flex-col gap-2 transform translate-x-10 group-hover:-translate-x-2 transition-transform duration-300">
                      <button
                        onClick={(e) => handleWishlist(product._id, e)}
                        className="p-2.5 bg-surface-card/95 dark:bg-surface-card/95 rounded-full shadow-lg hover:bg-surface-card dark:hover:bg-surface-card backdrop-blur-sm"
                      >
                        <Heart className="h-5 w-5 text-text-muted hover:text-error" />
                      </button>
                    </div>

                    {product.isNew && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-text-inverted text-xs font-medium rounded-full">
                        New
                      </div>
                    )}

                    {product.discount > 0 && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-error text-text-inverted text-xs font-medium rounded-full">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg group-hover:text-primary transition-colors duration-300 line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex flex-col items-end">
                        <span className="text-primary font-semibold text-lg">${product.price.toFixed(2)}</span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-text-muted text-sm line-through">
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-text-muted line-clamp-2 mt-2 mb-3">{product.description}</p>

                    {product.craftsman && (
                      <div className="flex items-center mt-auto mb-4">
                        <div className="w-6 h-6 rounded-full overflow-hidden relative bg-background-secondary flex-shrink-0">
                          {product.craftsman.avatar ? (
                            <Image
                              src={product.craftsman.avatar}
                              alt={product.craftsman.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex items-center justify-center w-full h-full text-xs font-medium text-text-muted">
                              {product.craftsman.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-text-secondary ml-2">
                          Crafted by <span className="font-medium">{product.craftsman.name}</span>
                        </span>
                      </div>
                    )}

                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`w-full py-2.5 px-4 rounded-lg ${
                        isProductInCart(product._id)
                          ? 'bg-success hover:bg-success-dark'
                          : 'bg-primary hover:bg-primary-dark'
                      } text-text-inverted transition-all duration-300 flex items-center justify-center gap-2`}
                    >
                      {isProductInCart(product._id) ? (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>In Cart ({getProductQuantityInCart(product._id)})</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {displayedProducts.length > 0 && displayedProducts.length % 4 === 0 && (
            <div className="mt-12 text-center">
              <button className="btn-primary bg-surface-card border border-primary text-primary hover:bg-primary hover:text-text-inverted">
                Load More
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}