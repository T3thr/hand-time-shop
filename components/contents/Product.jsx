import React from "react";
import Image from "next/image";

const CATEGORIES = [
  {
    name: 'Fashion',
    image: '/images/categories/fashion.jpg',
    alt: 'Fashion category showing trendy clothing'
  },
  {
    name: 'Electronics', 
    image: '/images/categories/electronics.jpg',
    alt: 'Electronics category showing gadgets'
  },
  {
    name: 'Home',
    image: '/images/categories/home.jpg', 
    alt: 'Home category showing furniture and decor'
  }
];

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Grandma silk',
    price: 70,
    description: 'Comfortable and stylish sneakers for everyday wear',
    image: '/products/1.jpg',
    alt: 'White sneakers on white background'
  },
  {
    id: 2, 
    name: 'Hootub',
    price: 149.99,
    description: 'Durable leather backpack with multiple compartments',
    image: '/products/2.jpg',
    alt: 'Brown leather backpack'
  },
  {
    id: 3,
    name: 'Wireless Headphones',
    price: 199.99,
    description: 'Premium wireless headphones with noise cancellation',
    image: '/images/products/headphones.jpg',
    alt: 'Black wireless headphones'
  },
  {
    id: 4,
    name: 'Smart Watch',
    price: 299.99,
    description: 'Feature-rich smartwatch with health tracking',
    image: '/images/products/smartwatch.jpg',
    alt: 'Smart watch with black band'
  }
];

export default function Product() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Improved responsiveness and visual hierarchy */}
      <section className="relative min-h-[60vh] lg:h-[80vh] bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container-custom h-full flex items-center px-4 lg:px-8">
          <div className="max-w-2xl text-white space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Discover Your <span className="text-primary-light">Perfect Style</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Shop the latest trends in fashion with up to 50% off on selected items.
              Experience premium quality at unbeatable prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="btn-primary bg-white text-blue-600 hover:bg-white/90">
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
                Featured Products
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Discover our handpicked selection</p>
            </div>
            <button className="btn-secondary whitespace-nowrap hover:scale-105 transition-transform duration-300 flex items-center gap-2">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {FEATURED_PRODUCTS.map((product) => (
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
                  <div className="absolute top-3 right-0 flex flex-col gap-2 transform translate-x-10 group-hover:-translate-x-2 transition-transform duration-300">
                    <button className="p-2.5 bg-white/95 dark:bg-gray-900/95 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 backdrop-blur-sm">
                      <span className="sr-only">Add to wishlist</span>
                      ❤️
                    </button>
                    <button className="p-2.5 bg-white/95 dark:bg-gray-900/95 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 backdrop-blur-sm">
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
                    <span className="text-primary-light font-semibold text-lg">${product.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-4">{product.description}</p>
                  <div className="mt-auto pt-6">
                    <button className="w-full btn-primary bg-primary hover:bg-primary-dark transform transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group">
                      <svg className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section - Enhanced form design */}
      <section className="py-12 md:py-20">
        <div className="container-custom px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">Join Our Newsletter</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-900 transition-all duration-200"
              />
              <button type="submit" 
                className="btn-primary whitespace-nowrap hover:shadow-lg transform transition-all duration-200 active:scale-95">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}