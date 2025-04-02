'use client';
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-border-primary">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">HandTime Shop</h3>
            <p className="text-text-secondary text-sm mb-4">
              Bringing you unique, handcrafted products made with love and tradition from Uttaradit.
            </p>
            <div className="flex space-x-4">
              {['Facebook', 'Instagram', 'Twitter', 'Pinterest'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-text-muted hover:text-primary transition-colors duration-200"
                  aria-label={social}
                >
                  <span className="sr-only">{social}</span>
                  <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Shop</h3>
            <ul className="space-y-2">
              {['All Products', 'New Arrivals', 'Best Sellers', 'On Sale'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-text-secondary hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">About</h3>
            <ul className="space-y-2">
              {['Our Story', 'Craftsmen', 'Sustainability', 'Blog'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-text-secondary hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {['Contact Us', 'FAQs', 'Shipping Policy', 'Returns & Exchanges'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-text-secondary hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border-primary mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-muted text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Handcrafted Treasures. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-text-muted hover:text-primary text-sm">Privacy Policy</a>
            <a href="#" className="text-text-muted hover:text-primary text-sm">Terms of Service</a>
            <a href="#" className="text-text-muted hover:text-primary text-sm">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}