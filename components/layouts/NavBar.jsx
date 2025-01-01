'use client';
import React, { useState } from "react";
import Link from "next/link";
import { FaShoppingCart, FaHeart, FaUser, FaSearch } from "react-icons/fa";

export default function NavBar() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-background shadow-sm border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <h1 className="text-2xl font-bold text-primary hover:text-primary-foreground transition-colors">
                            HandTimeShop
                        </h1>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="/new-arrivals" className="nav-link">New Arrivals</Link>
                        <Link href="/categories" className="nav-link">Categories</Link>
                        <Link href="/sale" className="nav-link">Sale</Link>
                        <Link href="/collections" className="nav-link">Collections</Link>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-6">
                        <button 
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="icon-button"
                        >
                            <FaSearch />
                        </button>
                        <Link href="/wishlist" className="icon-button">
                            <FaHeart />
                        </Link>
                        <Link href="/cart" className="icon-button relative">
                            <FaShoppingCart />
                            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                0
                            </span>
                        </Link>
                        <Link href="/account" className="icon-button">
                            <FaUser />
                        </Link>
                    </div>
                </div>

                {/* Search Bar (Expandable) */}
                {isSearchOpen && (
                    <div className="py-4">
                        <div className="relative max-w-xl mx-auto">
                            <input
                                type="text"
                                placeholder="Search for cute items..."
                                className="w-full px-4 py-2 rounded-full border-2 border-input focus:border-ring focus:outline-none bg-muted text-muted-foreground"
                            />
                            <button className="absolute right-3 top-2 text-primary">
                                <FaSearch />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
