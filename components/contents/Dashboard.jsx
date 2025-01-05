'use client';

import React, { useState, useEffect } from 'react';
import { FaShoppingBag, FaHeart, FaUser, FaBox, FaHistory, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { MdLocalShipping, MdNotifications } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

const DashboardCard = ({ icon: Icon, title, value, color, trend }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-surface-card p-6 rounded-lg shadow-md transition-all duration-300 border border-border-primary hover:border-primary h-40"
  >
    <div className="flex items-center justify-between h-full">
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-text-secondary text-sm font-medium mb-2">{title}</h3>
          <p className="text-text-primary text-2xl font-bold">{value}</p>
        </div>
        {trend && (
          <p className={`text-sm ${trend > 0 ? 'text-success' : 'text-error'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
      <div className={`p-4 rounded-full ${color} bg-opacity-20 h-fit`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </motion.div>
);

const DashboardLink = ({ icon: Icon, text, href, isActive, notifications }) => (
  <Link 
    href={href}
    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 
      ${isActive 
        ? 'bg-primary text-text-inverted shadow-lg' 
        : 'hover:bg-interactive-muted text-text-secondary hover:text-primary'
      }`}
  >
    <div className="flex items-center">
      <Icon className="w-5 h-5 mr-3" />
      <span className="font-medium">{text}</span>
    </div>
    {notifications > 0 && (
      <span className="bg-error text-text-inverted text-xs px-2 py-1 rounded-full">
        {notifications}
      </span>
    )}
  </Link>
);

const OrderStatus = ({ status }) => {
  const statusStyles = {
    'Delivered': 'bg-success bg-opacity-10 text-success',
    'In Transit': 'bg-warning bg-opacity-10 text-warning',
    'Processing': 'bg-info bg-opacity-10 text-info',
    'Cancelled': 'bg-error bg-opacity-10 text-error'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

const Dashboard = ({ session }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const user = session?.user;
  
  const stats = [
    { icon: FaShoppingBag, title: 'Total Orders', value: '24', color: 'text-primary', trend: 12 },
    { icon: FaHeart, title: 'Wishlist Items', value: '12', color: 'text-error', trend: -5 },
    { icon: MdLocalShipping, title: 'In Transit', value: '3', color: 'text-warning', trend: 0 },
    { icon: FaBox, title: 'Delivered', value: '21', color: 'text-success', trend: 8 }
  ];

  const navigationItems = [
    { icon: FaUser, text: 'Overview', href: '#overview', notifications: 0 },
    { icon: FaShoppingBag, text: 'Orders', href: '#orders', notifications: 2 },
    { icon: FaHeart, text: 'Wishlist', href: '#wishlist', notifications: 0 },
    { icon: MdLocalShipping, text: 'Shipments', href: '#shipments', notifications: 1 },
    { icon: FaHistory, text: 'Order History', href: '#history', notifications: 0 },
    { icon: FaCog, text: 'Settings', href: '#settings', notifications: 0 }
  ];

  const orders = [
    { id: '2024001', date: 'Jan 1, 2024', status: 'Delivered', total: 99.99, items: 3 },
    { id: '2024002', date: 'Jan 2, 2024', status: 'In Transit', total: 149.99, items: 2 },
    { id: '2024003', date: 'Jan 3, 2024', status: 'Processing', total: 79.99, items: 1 },
    { id: '2024004', date: 'Jan 4, 2024', status: 'Delivered', total: 199.99, items: 4 },
    { id: '2024005', date: 'Jan 5, 2024', status: 'Cancelled', total: 59.99, items: 1 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* User Profile Card */}
            <div className="bg-surface-card p-6 rounded-lg shadow-md">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  {user?.avatar?.url ? (
                    <img 
                      src={user.avatar.url} 
                      alt={user.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-text-inverted text-2xl font-bold">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-surface-card"></div>
                </div>
                <div>
                  <h2 className="text-text-primary text-lg font-semibold">
                    {user?.name || 'User'}
                  </h2>
                  <p className="text-text-secondary text-sm">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <DashboardLink
                    key={item.href}
                    {...item}
                    isActive={activeSection === item.href.slice(1)}
                  />
                ))}
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center p-3 rounded-lg transition-all duration-200 text-error hover:bg-error hover:bg-opacity-10"
                >
                  <FaSignOutAlt className="w-5 h-5 mr-3" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 space-y-8"
          >
            {/* Welcome Message */}
            <div className="bg-var-primary-light bg-opacity-5 p-6 rounded-lg">
              <h1 className="text-2xl font-bold text-var-primary mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-text-secondary">
                Here's what's happening with your store today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DashboardCard {...stat} />
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-surface-card p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-text-primary text-xl font-semibold">
                  Recent Orders
                </h2>
                <Link 
                  href="#all-orders"
                  className="text-primary hover:text-primary-dark transition-colors duration-200"
                >
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-primary">
                      <th className="text-left py-4 px-4 text-text-secondary font-medium">Order ID</th>
                      <th className="text-left py-4 px-4 text-text-secondary font-medium">Date</th>
                      <th className="text-left py-4 px-4 text-text-secondary font-medium">Items</th>
                      <th className="text-left py-4 px-4 text-text-secondary font-medium">Status</th>
                      <th className="text-left py-4 px-4 text-text-secondary font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <motion.tr 
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-border-secondary hover:bg-background-secondary transition-colors duration-200"
                      >
                        <td className="py-4 px-4 text-text-primary font-medium">#{order.id}</td>
                        <td className="py-4 px-4 text-text-secondary">{order.date}</td>
                        <td className="py-4 px-4 text-text-secondary">{order.items} items</td>
                        <td className="py-4 px-4">
                          <OrderStatus status={order.status} />
                        </td>
                        <td className="py-4 px-4 text-text-primary font-medium">
                          ${order.total.toFixed(2)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;