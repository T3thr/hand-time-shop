import React from "react";

export default function Product() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container-custom h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-6">Discover Your Style</h1>
            <p className="text-xl mb-8">Shop the latest trends in fashion with up to 50% off on selected items.</p>
            <div className="flex gap-4">
              <button className="btn-secondary">Shop Now</button>
              <button className="btn-primary bg-white/10 hover:bg-white/20">Learn More</button>
            </div>
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900"></div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Fashion', 'Electronics', 'Home'].map((category) => (
              <div key={category} className="group relative overflow-hidden rounded-2xl cursor-pointer">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                  {/* Add your category image here */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <button className="btn-secondary">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-t-lg">
                  {/* Add product image here */}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Product Name</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">$99.99</p>
                  <button className="w-full btn-primary">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Subscribe to get special offers, free giveaways, and updates.
            </p>
            <form className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
