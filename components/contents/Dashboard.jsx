'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaShoppingBag, FaHeart, FaUser, FaBox, FaHistory, FaCog, FaSignOutAlt, FaBoxOpen, 
  FaSearch, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { MdLocalShipping, MdAddPhotoAlternate } from 'react-icons/md';
import { 
  Menu, ShoppingCart,ShoppingBag, User, X,
  LogOut, Shield, Copy, Eye, EyeOff , Home 
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { useProducts, addProduct, updateProduct, deleteProduct } from '@/backend/lib/productAction';
import axios from 'axios';
import Image from 'next/image';
import SideBar from '@/components/layouts/SideBar'; // Import the SideBar component
import Cart from '@/components/layouts/Cart';
import { useCart } from "@/context/CartContext";

// Dashboard Card Component - Enhanced with better animations and visual feedback
const DashboardCard = ({ icon: Icon, title, value, color, trend }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
    className="bg-surface-card p-6 rounded-lg shadow-md transition-all duration-300 border border-border-primary hover:border-primary h-40"
  >
    <div className="flex items-center justify-between h-full">
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-text-secondary text-sm font-medium mb-2">{title}</h3>
          <p className="text-text-primary text-2xl font-bold">{value}</p>
        </div>
        {trend !== undefined && (
          <p className={`text-sm ${trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-text-secondary'}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
      <div className={`p-4 rounded-full ${color} bg-opacity-20 h-fit`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </motion.div>
);

// Dashboard Navigation Link - Improved with better hover states
const DashboardLink = ({ icon: Icon, text, href, isActive, notifications, onClick }) => (
  <button
    onClick={() => onClick(href.slice(1))}
    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 w-full text-left
      ${isActive ? 'bg-primary text-text-inverted shadow-lg' : 'hover:bg-interactive-muted text-text-secondary hover:text-primary'}`}
  >
    <div className="flex items-center">
      <Icon className="w-5 h-5 mr-3" />
      <span className="font-medium">{text}</span>
    </div>
    {notifications > 0 && (
      <motion.span 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-error text-text-inverted text-xs px-2 py-1 rounded-full"
      >
        {notifications}
      </motion.span>
    )}
  </button>
);

// Order Status Badge - More visually distinct
const OrderStatus = ({ status }) => {
  const statusStyles = {
    'Delivered': 'bg-success bg-opacity-10 text-success border border-success border-opacity-20',
    'In Transit': 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20',
    'Processing': 'bg-info bg-opacity-10 text-info border border-info border-opacity-20',
    'Cancelled': 'bg-error bg-opacity-10 text-error border border-error border-opacity-20',
  };
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>{status}</span>;
};

// Enhanced Product Form Component
const ProductForm = ({ product, categories, onSubmit, formTitle, buttonText, onCancel }) => {
  const [formData, setFormData] = useState(product);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleCategoriesChange = (e) => {
    setFormData({ 
      ...formData, 
      categories: Array.from(e.target.selectedOptions, option => option.value) 
    });
  };
  
  const handleImageChange = (e) => {
    setFormData({ 
      ...formData, 
      images: [{ url: e.target.value }] 
    });
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }} className="bg-background-secondary p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-text-primary">{formTitle}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Product Name</label>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="input-field w-full"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Price ($)</label>
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="input-field w-full"
            required
          />
        </div>
        
        <div className="space-y-2 col-span-full">
          <label className="text-sm font-medium text-text-secondary">Description</label>
          <textarea
            name="description"
            placeholder="Product description"
            value={formData.description}
            onChange={handleChange}
            className="input-field w-full min-h-24"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Image URL</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              name="imageUrl"
              placeholder="Image URL"
              value={formData.images[0]?.url || ''}
              onChange={handleImageChange}
              className="input-field flex-1"
            />
            <button type="button" className="p-2 bg-primary text-white rounded-md">
              <MdAddPhotoAlternate size={20} />
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Categories</label>
          <select
            multiple
            name="categories"
            value={formData.categories || []}
            onChange={handleCategoriesChange}
            className="input-field w-full min-h-24"
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-background-secondary text-text-secondary border border-border-primary rounded-md 
                      hover:bg-interactive-muted transition-colors duration-200"
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary">
          {buttonText}
        </button>
      </div>
    </form>
  );
};

// Enhanced Category Management Component
const CategoryManagement = ({ categories, setCategories }) => {
  const [newCategory, setNewCategory] = useState({ name: '', description: '', image: { url: '' } });
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin/category', {
        ...newCategory,
        slug: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
      });
      setCategories([...categories, response.data]);
      setNewCategory({ name: '', description: '', image: { url: '' } });
      toast.success('Category added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add category');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/admin/category', editingCategory);
      setCategories(categories.map(cat => cat.slug === editingCategory.slug ? response.data : cat));
      setEditingCategory(null);
      toast.success('Category updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (slug) => {
    try {
      await axios.delete(`/api/admin/category/${slug}`);
      setCategories(categories.filter((cat) => cat.slug !== slug));
      toast.success('Category deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  return (
    <div className="bg-surface-card p-6 rounded-lg shadow-md border border-border-primary mt-8">
      <h2 className="text-text-primary text-xl font-semibold mb-6">Manage Categories</h2>
      
      {editingCategory ? (
        <form onSubmit={handleUpdateCategory} className="mb-8 bg-background-secondary p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Category Name</label>
              <input
                type="text"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Image URL</label>
              <input
                type="text"
                value={editingCategory.image?.url || ''}
                onChange={(e) => setEditingCategory({ 
                  ...editingCategory, 
                  image: { ...editingCategory.image, url: e.target.value } 
                })}
                className="input-field"
              />
            </div>
            
            <div className="space-y-2 col-span-full">
              <label className="text-sm font-medium text-text-secondary">Description</label>
              <textarea
                value={editingCategory.description || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="input-field col-span-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-4">
            <button 
              type="button" 
              onClick={() => setEditingCategory(null)}
              className="px-4 py-2 border border-border-primary rounded-md hover:bg-interactive-muted"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Update Category
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAddCategory} className="mb-8 bg-background-secondary p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Category Name</label>
              <input
                type="text"
                placeholder="Category Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Image URL</label>
              <input
                type="text"
                placeholder="Image URL"
                value={newCategory.image.url}
                onChange={(e) => setNewCategory({ ...newCategory, image: { url: e.target.value } })}
                className="input-field"
              />
            </div>
            
            <div className="space-y-2 col-span-full">
              <label className="text-sm font-medium text-text-secondary">Description</label>
              <textarea
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="input-field col-span-full"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4 w-full">Add Category</button>
        </form>
      )}

      {/* Category List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-primary">
              <th className="text-left py-4 px-4 text-text-secondary font-medium">Name</th>
              <th className="text-left py-4 px-4 text-text-secondary font-medium">Description</th>
              <th className="text-right py-4 px-4 text-text-secondary font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <motion.tr
                key={category.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-border-secondary hover:bg-interactive-muted transition-colors duration-200"
              >
                <td className="py-4 px-4 text-text-primary font-medium">{category.name}</td>
                <td className="py-4 px-4 text-text-secondary">{category.description || '-'}</td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="text-primary hover:text-primary-dark p-2 mr-2"
                    aria-label="Edit category"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.slug)}
                    className="text-error hover:text-error-dark p-2"
                    aria-label="Delete category"
                  >
                    <FaTrash />
                  </button>
                </td>
              </motion.tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-text-secondary">
                  No categories found. Add your first category above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Enhanced Product Management Component
const ManageProducts = ({ products, mutate }) => {
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', images: [{ url: '' }], categories: [],
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentTab, setCurrentTab] = useState('products');
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  // Fetch categories
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
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted products
  const getSortedProducts = () => {
    const filteredProducts = searchTerm
      ? products.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : [...products];
      
    if (sortConfig.key) {
      filteredProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredProducts;
  };

  // Form submission handlers
  const handleAddProduct = async (productData) => {
    try {
      const addedProduct = await addProduct(productData);
      mutate([...products, addedProduct], false);
      setNewProduct({ name: '', description: '', price: '', images: [{ url: '' }], categories: [] });
      setIsFormVisible(false);
      toast.success('Product added successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditProduct = async (productData) => {
    try {
      const updatedProduct = await updateProduct(productData.slug, productData);
      mutate(products.map((p) => (p.slug === productData.slug ? updatedProduct : p)), false);
      setEditingProduct(null);
      toast.success('Product updated successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteProduct = async (slug) => {
    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
    
    try {
      await deleteProduct(slug);
      mutate(products.filter((p) => p.slug !== slug), false);
      toast.success('Product deleted successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Render sort icon
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <FaSort className="inline ml-1 text-text-secondary opacity-50" />;
    return sortConfig.direction === 'ascending' ? 
      <FaSortUp className="inline ml-1 text-primary" /> : 
      <FaSortDown className="inline ml-1 text-primary" />;
  };

  return (
    <div className="bg-surface-card p-6 rounded-lg shadow-md border border-border-primary">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-text-primary text-xl font-semibold">Manage Store</h2>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0 w-full sm:w-auto">
          <button 
            onClick={() => setCurrentTab('products')}
            className={`px-4 py-2 rounded-md transition-colors duration-200
              ${currentTab === 'products' ? 'bg-primary text-text-inverted' : 'bg-background-secondary text-text-secondary'}
            `}
          >
            Products
          </button>
          <button 
            onClick={() => setCurrentTab('categories')}
            className={`px-4 py-2 rounded-md transition-colors duration-200
              ${currentTab === 'categories' ? 'bg-primary text-text-inverted' : 'bg-background-secondary text-text-secondary'}
            `}
          >
            Categories
          </button>
        </div>
      </div>

      {currentTab === 'products' && (
        <>
          {/* Product Management Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <div className="relative w-full md:w-64">
              <FaSearch className="absolute left-3 top-3 text-text-secondary" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            
            <button 
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="btn-primary flex items-center"
            >
              {isFormVisible ? (
                <>
                  <FaTimes className="mr-2" /> Hide Form
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" /> Add New Product
                </>
              )}
            </button>
          </div>

          {/* Add Product Form */}
          <AnimatePresence>
            {isFormVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <ProductForm
                  product={newProduct}
                  categories={categories}
                  onSubmit={handleAddProduct}
                  formTitle="Add New Product"
                  buttonText="Add Product"
                  onCancel={() => setIsFormVisible(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product List */}
          <div className="overflow-x-auto mb-8 rounded-lg border border-border-secondary">
            <table className="w-full">
              <thead className="bg-background-secondary">
                <tr>
                  <th 
                    className="text-left py-4 px-4 text-text-secondary font-medium cursor-pointer"
                    onClick={() => requestSort('name')}
                  >
                    Product Name {renderSortIcon('name')}
                  </th>
                  <th 
                    className="text-left py-4 px-4 text-text-secondary font-medium cursor-pointer"
                    onClick={() => requestSort('price')}
                  >
                    Price {renderSortIcon('price')}
                  </th>
                  <th className="text-left py-4 px-4 text-text-secondary font-medium hidden md:table-cell">
                    Categories
                  </th>
                  <th className="text-right py-4 px-4 text-text-secondary font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedProducts().map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-border-secondary hover:bg-interactive-muted transition-colors duration-200"
                  >
                    <td className="py-4 px-4 text-text-primary font-medium">
                      <div className="flex items-center">
                        {product.images && product.images[0]?.url ? (
                          <div className="w-10 h-10 rounded overflow-hidden mr-3 border border-border-secondary flex-shrink-0">
                            <img 
                              src={product.images[0].url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-background-secondary mr-3 flex items-center justify-center flex-shrink-0">
                            <FaBoxOpen className="text-text-secondary" />
                          </div>
                        )}
                        <span className="line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-text-secondary">${parseFloat(product.price).toFixed(2)}</td>
                    <td className="py-4 px-4 text-text-secondary hidden md:table-cell">
                      {product.categories && product.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.categories.slice(0, 2).map((cat, idx) => (
                            <span key={idx} className="bg-background-secondary px-2 py-1 rounded-full text-xs">
                              {cat}
                            </span>
                          ))}
                          {product.categories.length > 2 && (
                            <span className="bg-background-secondary px-2 py-1 rounded-full text-xs">
                              +{product.categories.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-text-secondary text-sm italic">No categories</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-primary hover:text-primary-dark p-2 inline-flex items-center justify-center"
                        title="Edit product"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.slug)}
                        className="text-error hover:text-error-dark p-2 inline-flex items-center justify-center"
                        title="Delete product"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {getSortedProducts().length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text-secondary">
                      {searchTerm ? 'No products matching your search' : 'No products found. Add your first product using the form above.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Edit Product Modal */}
          <AnimatePresence>
            {editingProduct && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-surface-card p-6 rounded-lg w-full max-w-2xl shadow-lg border border-border-primary max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-text-primary">Edit Product</h3>
                    <button 
                      onClick={() => setEditingProduct(null)}
                      className="text-text-secondary hover:text-error p-2 rounded-full hover:bg-error hover:bg-opacity-10"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  <ProductForm
                    product={editingProduct}
                    categories={categories}
                    onSubmit={handleEditProduct}
                    formTitle=""
                    buttonText="Save Changes"
                    onCancel={() => setEditingProduct(null)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {currentTab === 'categories' && (
        <CategoryManagement categories={categories} setCategories={setCategories} />
      )}
    </div>
  );
};

// Main Dashboard Component
//*************************** */
const Dashboard = () => {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState('overview');
  const { products, isLoading, mutate } = useProducts();
  const user = session?.user;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Added state for sidebar toggle
  const [profile, setProfile] = useState(null);
  const [showUserId, setShowUserId] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems, getCartSummary } = useCart();
  const { totalItems, subtotal } = getCartSummary();

  const handleAddToCart = async (product, e) => {
    e.stopPropagation(); // Prevent navigation when clicking the button

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
    e.stopPropagation(); // Prevent navigation when clicking wishlist button

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

  const handleLogoutConfirmation = useCallback(() => {
    setIsSignoutModalOpen(true);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      if (session) {
        await signOut({ callbackUrl: '/' });
      }
      
      if (typeof liff !== 'undefined' && liff.isLoggedIn()) {
        await liff.logout();
      }
      
      setProfile(null);
      setIsSignoutModalOpen(false);
    } catch (error) {
      toast.error("Failed to sign out");
      console.error("Logout error:", error);
    }
  }, [session]);

  const copyUserId = useCallback(() => {
    if (profile?.userId) {
      navigator.clipboard.writeText(profile.userId);
      toast.success("User ID copied to clipboard");
    }
  }, [profile]);

  const getUserAvatar = useCallback(() => {
    if (session?.user?.role === 'admin') {
      return (
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
      );
    }
    
    if (profile?.pictureUrl) {
      return (
        <img 
          src={profile.pictureUrl} 
          alt="Profile" 
          className="h-10 w-10 rounded-full object-cover"
          loading="lazy"
        />
      );
    }
    
    if (session?.user?.image) {
      return (
        <img 
          src={session.user.image} 
          alt="Profile" 
          className="h-10 w-10 rounded-full object-cover"
          loading="lazy"
        />
      );
    }
    
    return (
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <User className="h-6 w-6 text-primary" />
      </div>
    );
  }, [session, profile]);

  const getUserRoleBadge = useCallback(() => {
    if (!session?.user?.role) return null;
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${
        session.user.role === 'admin' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-green-100 text-green-800'
      }`}>
        {session.user.role}
      </span>
    );
  }, [session]);

  const renderUserInfo = useCallback(() => {
    if (session?.user?.email) {
      return session.user.email;
    } else if (profile?.userId) {
      return (
        <div className="flex flex-col space-y-2">
          <span className="truncate">{profile?.displayName || 'LINE User'}</span>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setShowUserId(!showUserId)}
              className="p-1 rounded hover:bg-container"
              aria-label={showUserId ? "Hide User ID" : "Show User ID"}
            >
              {showUserId ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            {showUserId && (
              <div className="flex items-center space-x-1 max-w-12 overflow-hidden">
                <span className="text-xs bg-container px-2 py-1 rounded truncate">
                  {profile.userId}
                </span>
                <button 
                  onClick={copyUserId}
                  className="p-1 rounded hover:bg-container flex-shrink-0"
                  aria-label="Copy User ID"
                >
                  <Copy size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
    return "Sign in to access more features";
  }, [session, profile, showUserId, copyUserId]);
    
  const stats = [
    { icon: FaShoppingBag, title: 'Total Orders', value: '24', color: 'text-primary', trend: 12 },
    { icon: FaHeart, title: 'Wishlist Items', value: '12', color: 'text-error', trend: -5 },
    { icon: MdLocalShipping, title: 'In Transit', value: '3', color: 'text-warning', trend: 0 },
    { icon: FaBox, title: 'Delivered', value: '21', color: 'text-success', trend: 8 },
  ];

  const navigationItems = [
    { icon: FaUser, text: 'Overview', href: '#overview', notifications: 0 },
    { icon: FaShoppingBag, text: 'Orders', href: '#orders', notifications: 2 },
    { icon: FaHeart, text: 'Wishlist', href: '#wishlist', notifications: 0 },
    { icon: MdLocalShipping, text: 'Shipments', href: '#shipments', notifications: 1 },
    { icon: FaHistory, text: 'Order History', href: '#history', notifications: 0 },
    { icon: FaCog, text: 'Settings', href: '#settings', notifications: 0 },
  ];

  const recentOrders = [
    { id: '#ORD-001', date: '2023-11-15', status: 'Delivered', total: '$125.99' },
    { id: '#ORD-002', date: '2023-11-10', status: 'In Transit', total: '$89.50' },
    { id: '#ORD-003', date: '2023-11-05', status: 'Processing', total: '$215.75' },
    { id: '#ORD-004', date: '2023-10-28', status: 'Delivered', total: '$56.20' },
  ];

  const wishlistItems = products?.slice(0, 3) || [];

  // Handle section change with smooth scroll
  const handleSectionChange = (section) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-error mb-4">Access Denied</h2>
          <p className="text-text-secondary mb-6">
            You need to be signed in to view your dashboard. Please sign in to continue.
          </p>
          <Link 
            href="/signin"
            className="btn-primary bg-primary hover:bg-primary-dark inline-flex items-center"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="bg-surface-card shadow-sm border-b border-border-primary">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          {/* Sidebar Button (Left) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-container rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>

          {/* Dashboard Title (Center) */}
          <h1 className="text-2xl font-bold text-text-primary mx-auto">Dashboard</h1>

          {/* User Data and Home Button (Right) */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden relative bg-background-secondary border-2 border-primary">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-lg font-medium text-text-muted">
                    {user.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="ml-3 hidden md:block">
                <p className="text-sm font-medium text-text-primary">{user.name}</p>
                <p className="text-xs text-text-secondary">
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </p>
              </div>
            </div>

            {/* Cart Button (Right) */}
                        <button 
                          onClick={() => setIsCartOpen(true)}
                          className="relative p-2 hover:bg-container rounded-lg transition-colors group"
                          aria-label="Cart"
                        >
                          <ShoppingCart className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                          {totalItems > 0 && (
                            <>
                              <div className="absolute -top-2 -right-2">
                                <span className="flex h-5 w-5 items-center justify-center bg-primary text-text-inverted text-xs font-bold rounded-full">
                                  {Math.min(totalItems, 99)}{totalItems > 99 ? '+' : ''}
                                </span>
                              </div>
                              <div className="absolute right-0 mt-2 w-72 bg-surface-card rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-colors pointer-events-none border border-border-primary">
                                <div className="p-4">
                                  <div className="text-sm font-medium text-foreground">Cart Summary</div>
                                  <div className="mt-2 text-xs text-text-secondary">
                                    {totalItems} items · ${subtotal.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </button>
            <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
          </div>
        </div>
      </div>
    </header>

      <SideBar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />


      {/* Dashboard Layout */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-surface-card rounded-lg shadow-sm border border-border-primary p-4 sticky top-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-text-primary mb-2">Menu</h2>
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <DashboardLink
                      key={item.href}
                      icon={item.icon}
                      text={item.text}
                      href={item.href}
                      isActive={activeSection === item.href.slice(1)}
                      notifications={item.notifications}
                      onClick={handleSectionChange}
                    />
                  ))}
                </nav>
              </div>

              {user.role === 'admin' && (
                <div className="pt-4 border-t border-border-primary">
                  <h2 className="text-lg font-semibold text-text-primary mb-2">Admin</h2>
                  <div className="space-y-1">
                    <DashboardLink
                      icon={FaBoxOpen}
                      text="Manage Store"
                      href="#manage-store"
                      isActive={activeSection === 'manage-store'}
                      onClick={handleSectionChange}
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Overview Section */}
            <section id="overview" className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-text-primary">Overview</h2>
                <p className="text-text-secondary text-sm">
                  Welcome back, <span className="font-medium text-primary">{user.name.split(' ')[0]}</span>!
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <DashboardCard
                    key={index}
                    icon={stat.icon}
                    title={stat.title}
                    value={stat.value}
                    color={stat.color}
                    trend={stat.trend}
                  />
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-surface-card rounded-lg shadow-sm border border-border-primary p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-text-primary">Recent Orders</h3>
                  <Link href="#orders" className="text-primary text-sm font-medium hover:underline">
                    View All
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-primary">
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Order ID</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
                        <th className="text-right py-3 px-4 text-text-secondary font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-border-secondary hover:bg-interactive-muted transition-colors duration-200"
                        >
                          <td className="py-3 px-4 text-primary font-medium">
                            <Link href={`#order-${order.id}`}>{order.id}</Link>
                          </td>
                          <td className="py-3 px-4 text-text-secondary">{order.date}</td>
                          <td className="py-3 px-4">
                            <OrderStatus status={order.status} />
                          </td>
                          <td className="py-3 px-4 text-right text-text-primary font-medium">{order.total}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Wishlist Preview */}
              <div className="bg-surface-card rounded-lg shadow-sm border border-border-primary p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-text-primary">Wishlist</h3>
                  <Link href="#wishlist" className="text-primary text-sm font-medium hover:underline">
                    View All
                  </Link>
                </div>
                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {wishlistItems.map((product) => (
                      <motion.div
                        key={product._id}
                        whileHover={{ y: -4 }}
                        className="border border-border-secondary rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
                      >
                        <div className="aspect-square relative bg-background-secondary">
                          <Image
                            src={product.images?.[0]?.url || '/images/placeholder.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="text-text-primary font-medium mb-1 line-clamp-1">{product.name}</h4>
                          <p className="text-primary font-semibold mb-3">${product.price.toFixed(2)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-secondary mb-4">Your wishlist is empty</p>
                    <Link href="/products" className="btn-primary inline-flex items-center">
                      Browse Products
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Orders Section */}
            <section id="orders" className="mb-12">
              <div className="bg-surface-card rounded-lg shadow-sm border border-border-primary p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6">Your Orders</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-primary">
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Order ID</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
                        <th className="text-right py-3 px-4 text-text-secondary font-medium">Total</th>
                        <th className="text-right py-3 px-4 text-text-secondary font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, index) => (
                        <tr key={index} className="border-b border-border-secondary hover:bg-interactive-muted transition-colors duration-200">
                          <td className="py-3 px-4 text-primary font-medium">{order.id}</td>
                          <td className="py-3 px-4 text-text-secondary">{order.date}</td>
                          <td className="py-3 px-4">
                            <OrderStatus status={order.status} />
                          </td>
                          <td className="py-3 px-4 text-right text-text-primary font-medium">{order.total}</td>
                          <td className="py-3 px-4 text-right">
                            <button className="text-primary hover:text-primary-dark text-sm font-medium">
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Wishlist Section */}
            <section id="wishlist" className="mb-12">
              <div className="bg-surface-card rounded-lg shadow-sm border border-border-primary p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6">Your Wishlist</h2>
                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlistItems.map((product) => (
                      <motion.div
                        key={product._id}
                        whileHover={{ y: -4 }}
                        className="border border-border-secondary rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
                      >
                        <div className="aspect-square relative bg-background-secondary">
                          <Image
                            src={product.images?.[0]?.url || '/images/placeholder.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          <button className="absolute top-3 right-3 p-2 bg-surface-card rounded-full shadow-md hover:bg-error hover:text-text-inverted transition-colors duration-200">
                            <FaHeart className="text-error" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h4 className="text-text-primary font-medium mb-1 line-clamp-1">{product.name}</h4>
                          <p className="text-primary font-semibold mb-3">${product.price.toFixed(2)}</p>
                          <div className="flex space-x-2">
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
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaHeart className="text-text-muted text-2xl" />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">Your wishlist is empty</h3>
                    <p className="text-text-secondary mb-4">Save items you love for easy access later</p>
                    <Link href="/products" className="btn-primary inline-flex items-center">
                      Browse Products
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Shipments Section */}
            <section id="shipments" className="mb-12">
              <div className="bg-surface-card rounded-lg shadow-sm border border-border-primary p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6">Your Shipments</h2>
                <div className="space-y-6">
                  {recentOrders.filter(o => o.status === 'In Transit').length > 0 ? (
                    recentOrders
                      .filter(order => order.status === 'In Transit')
                      .map((order, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-border-secondary rounded-lg p-4 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                            <div>
                              <h3 className="text-text-primary font-medium">{order.id}</h3>
                              <p className="text-text-secondary text-sm">Shipped on {order.date}</p>
                            </div>
                            <OrderStatus status={order.status} />
                          </div>
                          <div className="w-full bg-background-secondary rounded-full h-2 mb-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${Math.random() * 30 + 70}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-text-secondary">
                            <span>Order Placed</span>
                            <span>Shipped</span>
                            <span>In Transit</span>
                            <span>Delivered</span>
                          </div>
                        </motion.div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdLocalShipping className="text-text-muted text-2xl" />
                      </div>
                      <h3 className="text-lg font-medium text-text-primary mb-2">No active shipments</h3>
                      <p className="text-text-secondary mb-4">Your current orders are either delivered or being processed</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Order History Section */}
            <section id="history" className="mb-12">
              <div className="bg-surface-card rounded-lg shadow-sm border border-border-primary p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6">Order History</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-primary">
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Order ID</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
                        <th className="text-right py-3 px-4 text-text-secondary font-medium">Total</th>
                        <th className="text-right py-3 px-4 text-text-secondary font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, index) => (
                        <tr key={index} className="border-b border-border-secondary hover:bg-interactive-muted transition-colors duration-200">
                          <td className="py-3 px-4 text-primary font-medium">{order.id}</td>
                          <td className="py-3 px-4 text-text-secondary">{order.date}</td>
                          <td className="py-3 px-4">
                            <OrderStatus status={order.status} />
                          </td>
                          <td className="py-3 px-4 text-right text-text-primary font-medium">{order.total}</td>
                          <td className="py-3 px-4 text-right">
                            <button className="text-primary hover:text-primary-dark text-sm font-medium mr-3">
                              Details
                            </button>
                            <button className="text-primary hover:text-primary-dark text-sm font-medium">
                              Reorder
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Settings Section */}
            <section id="settings" className="mb-12">
              <div className="bg-surface-card rounded-lg shadow-sm border border-border-primary p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6">Account Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-text-primary mb-4">Personal Information</h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">First Name</label>
                          <input
                            type="text"
                            defaultValue={user.name.split(' ')[0]}
                            className="input-field w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Last Name</label>
                          <input
                            type="text"
                            defaultValue={user.name.split(' ')[1] || ''}
                            className="input-field w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                        <input
                          type="email"
                          defaultValue={user.email}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+1 (___) ___-____"
                          className="input-field w-full"
                        />
                      </div>
                      <div className="pt-2">
                        <button type="submit" className="btn-primary">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-text-primary mb-4">Profile Photo</h3>
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden relative bg-background-secondary border-2 border-primary mb-4">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-4xl font-medium text-text-muted">
                            {user.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <button className="text-primary hover:text-primary-dark text-sm font-medium mb-2">
                        Upload New Photo
                      </button>
                      <button className="text-error hover:text-error-dark text-sm font-medium">
                        Remove Photo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border-primary mt-8 pt-8">
                  <h3 className="text-lg font-medium text-text-primary mb-4">Change Password</h3>
                  <form className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Current Password</label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="input-field w-full"
                      />
                    </div>
                    <div className="pt-2">
                      <button type="submit" className="btn-primary">
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                <div className="border-t border-border-primary mt-8 pt-8">
                  <h3 className="text-lg font-medium text-error mb-4">Danger Zone</h3>
                  <div className="bg-error/5 border border-error/20 rounded-lg p-4">
                    <h4 className="font-medium text-error mb-2">Delete Account</h4>
                    <p className="text-text-secondary text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="btn-error">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Admin: Manage Store Section */}
            {user.role === 'admin' && (
              <section id="manage-store" className="mb-12">
                <ManageProducts products={products} mutate={mutate} />
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;