import React from 'react';
import { FaShoppingBag, FaHeart, FaUser, FaBox, FaHistory } from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';
import { getServerSession } from 'next-auth';
import options from '@/app/api/auth/[...nextauth]/options'; 
import Link from 'next/link'

export default async function Dashboard() {
    const session = await getServerSession(options);

    if (session && session.user) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-8">
                    <h1 className="text-3xl font-bold">Welcome back, {session.user.name}!</h1>
                    <p className="mt-2 opacity-90">Track your orders and manage your account</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FaBox className="text-blue-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-gray-600">Active Orders</p>
                                <h3 className="text-2xl font-bold">3</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <FaHeart className="text-purple-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-gray-600">Wishlist Items</p>
                                <h3 className="text-2xl font-bold">12</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 rounded-full">
                                <FaShoppingBag className="text-green-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-gray-600">Total Orders</p>
                                <h3 className="text-2xl font-bold">47</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
                    <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((order) => (
                            <div key={order} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">Order #{order}23456</p>
                                        <p className="text-sm text-gray-600">Placed on April {order}, 2024</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            In Transit
                                        </span>
                                        <button className="text-blue-600 hover:underline">
                                            Track Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <button className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <FaUser className="text-gray-600" />
                        <span>Edit Profile</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <MdLocalShipping className="text-gray-600" />
                        <span>Track Orders</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <FaHeart className="text-gray-600" />
                        <span>Wishlist</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <FaHistory className="text-gray-600" />
                        <span>Order History</span>
                    </button>
                </div>
            </div>
        );
    } else {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg p-6 text-white mb-8">
                    <h1 className="text-3xl font-bold">Welcome to Your Dashboard!</h1>
                    <p className="mt-2 opacity-90">Please sign in or sign up to access your account.</p>
                </div>
                <div className="flex justify-center space-x-4">
                    <Link 
                    href = {"/signin?callbackUrl=/account"}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        Sign In
                    </Link>
                    <Link 
                    href = {"/signup?callbackUrl=/account"}
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                        Sign Up
                    </Link>
                </div>
            </div>
        );
    }
}
