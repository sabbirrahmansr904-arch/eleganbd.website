/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Phone, 
  Facebook, 
  Instagram, 
  Star, 
  Truck, 
  ShieldCheck, 
  RefreshCw,
  ArrowRight,
  MessageCircle,
  Mail,
  Trash2,
  Plus,
  Minus,
  Edit,
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  LayoutDashboard,
  CreditCard,
  Users,
  Ticket,
  Package,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Video,
  Wand2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Heart,
  Search,
  Headphones,
  ArrowLeftRight,
  Table,
  SlidersHorizontal,
  Save,
  Check,
  Layers,
  Sparkles,
  Upload,
  MapPin,
  Database,
  Boxes,
  DollarSign,
  ArrowUpRight,
  Edit2
} from 'lucide-react';
import { 
  supabase, 
  saveOrderToSupabase, 
  syncProductsToSupabase, 
  testSupabaseConnection,
  saveFinanceAccountsToSupabase,
  fetchFinanceAccountsFromSupabase,
  saveFinanceTransactionToSupabase,
  fetchFinanceTransactionsFromSupabase,
  deleteFinanceTransactionFromSupabase,
  updateFinanceTransactionStatusInSupabase,
  fetchProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  fetchOrdersFromSupabase,
  updateOrderStatusInSupabase,
  deleteOrderFromSupabase,
  fetchBannersFromSupabase,
  saveBannerToSupabase,
  deleteBannerFromSupabase,
  fetchCouponsFromSupabase,
  saveCouponToSupabase,
  deleteCouponFromSupabase
} from './lib/supabase';
import { GoogleGenAI } from "@google/genai";
import { Product, CartItem, User, Order, Banner, Coupon, Review } from './types';
import initialProductsData from './defaultProducts.json';
import { db, auth, storage } from './firebase';
import { collection, getDocs as _getDocs, getDoc as _getDoc, doc, addDoc as _addDoc, updateDoc as _updateDoc, deleteDoc as _deleteDoc, setDoc as _setDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

let firestoreQuotaExceeded = false;
if (typeof window !== 'undefined') {
  localStorage.removeItem('elegan_firestore_quota_exceeded');
}

const handleFirestoreError = (err: any, actionName: string) => {
  console.warn(`Firestore ${actionName} notice:`, err?.message || err);
};

const setDoc = async (docRef: any, data: any, options?: any) => {
  if (firestoreQuotaExceeded) return;
  try {
    if (options) {
      await _setDoc(docRef, data, options);
    } else {
      await _setDoc(docRef, data);
    }
  } catch (err: any) {
    handleFirestoreError(err, 'setDoc');
  }
};

const addDoc = async (colRef: any, data: any) => {
  if (firestoreQuotaExceeded) return { id: 'local_' + Date.now() };
  try {
    return await _addDoc(colRef, data);
  } catch (err: any) {
    handleFirestoreError(err, 'addDoc');
    return { id: 'local_' + Date.now() };
  }
};

const updateDoc = async (docRef: any, data: any) => {
  if (firestoreQuotaExceeded) return;
  try {
    await _updateDoc(docRef, data);
  } catch (err: any) {
    handleFirestoreError(err, 'updateDoc');
  }
};

const deleteDoc = async (docRef: any) => {
  if (firestoreQuotaExceeded) return;
  try {
    await _deleteDoc(docRef);
  } catch (err: any) {
    handleFirestoreError(err, 'deleteDoc');
  }
};

const getDoc = async (docRef: any) => {
  try {
    return await _getDoc(docRef);
  } catch (err: any) {
    handleFirestoreError(err, 'getDoc');
    return {
      exists: () => false,
      data: () => undefined,
      id: docRef.id
    };
  }
};

const getDocs = async (queryOrCol: any) => {
  try {
    return await _getDocs(queryOrCol);
  } catch (err: any) {
    handleFirestoreError(err, 'getDocs');
    return {
      docs: [],
      empty: true,
      size: 0,
      forEach: (callback: any) => {}
    };
  }
};

// --- Components ---

const Logo = ({ className = "", light = true }: { className?: string, light?: boolean }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <img 
      src="https://i.postimg.cc/csPJTT4H/1000047673-removebg-preview.png" 
      alt="Elegan BD Logo" 
      className="w-14 h-14 object-contain"
      referrerPolicy="no-referrer"
    />
    <span className={`text-xl font-serif font-bold tracking-tighter uppercase whitespace-nowrap ${light ? 'text-white' : 'text-black'}`}>
      Elegan BD
    </span>
  </div>
);

const MyOrdersPage = ({ user, onBack, onNavigate }: { user: User | null, onBack: () => void, onNavigate: (page: string) => void }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), where('phone', '==', user.phone || ''));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by date descending
        data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(data as any);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-3xl font-serif font-bold text-zinc-900 mb-4">My Orders</h1>
        <p className="text-zinc-500 mb-8">Please login to view your orders.</p>
        <button onClick={() => onNavigate('home')} className="btn-primary py-3 px-8">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <button onClick={onBack} className="flex items-center text-zinc-500 hover:text-zinc-900 mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
        <ArrowRight className="rotate-180 mr-2" size={16} />
        Back
      </button>

      <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-8">My Orders</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-zinc-50 rounded-2xl">
          <Package size={48} className="mx-auto mb-4 text-zinc-300" />
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-zinc-500 mb-6">Looks like you haven't made your first order.</p>
          <button onClick={() => onNavigate('shop')} className="btn-primary py-3 px-8 text-xs">Start Shopping</button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4 mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Order ID: {order.id}</p>
                  <p className="text-sm font-medium text-zinc-900 mt-1">{new Date(order.created_at || order.createdAt).toLocaleDateString()} {new Date(order.created_at || order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Amount</p>
                    <p className="text-lg font-bold text-zinc-900">৳{order.total_amount || order.totalAmount}</p>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {JSON.parse(typeof order.items === 'string' ? order.items : JSON.stringify(order.items)).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image || null} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop'; }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-zinc-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm">৳{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between items-center text-xs text-zinc-500">
                <span>Payment: <strong className="text-zinc-900">{order.payment_method || order.paymentMethod}</strong></span>
                <span>Delivery Area: <strong className="text-zinc-900">{order.address?.includes('Dhaka') ? 'Inside Dhaka' : 'Outside Dhaka'}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const WishlistPage = ({ user, products, onSelect, onBack, onNavigate, onToggleWishlist }: { 
  user: User | null, 
  products: Product[],
  onSelect: (p: Product) => void,
  onBack: () => void,
  onNavigate: (page: string) => void,
  onToggleWishlist: (e: React.MouseEvent, p: Product) => void
}) => {
  if (!user) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-3xl font-serif font-bold text-zinc-900 mb-4">My Wishlist</h1>
        <p className="text-zinc-500 mb-8">Please login to view your wishlist.</p>
        <button onClick={() => onNavigate('home')} className="btn-primary py-3 px-8">Back to Home</button>
      </div>
    );
  }

  const wishlistProducts = products.filter(p => user.wishlist?.includes(String(p.id)));

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <button onClick={onBack} className="flex items-center text-zinc-500 hover:text-zinc-900 mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
        <ArrowRight className="rotate-180 mr-2" size={16} />
        Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <Heart size={32} className="text-red-500 fill-red-500" />
        <h1 className="text-4xl font-serif font-bold text-zinc-900">My Wishlist</h1>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-100">
          <Heart size={48} className="mx-auto mb-4 text-zinc-300" />
          <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-zinc-500 mb-6">Explore our collection and add your favorite items.</p>
          <button onClick={() => onNavigate('shop')} className="btn-primary py-3 px-8 text-xs">Explore Products</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
          {wishlistProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onSelect={onSelect} 
              isWishlisted={true}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const OrderTrackingPage = ({ onBack, showToast }: { onBack: () => void, showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [orderId, setOrderId] = useState('');
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setSearching(true);
    try {
      const docRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTrackingOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        showToast('Order not found. Please check your ID.', 'error');
        setTrackingOrder(null);
      }
    } catch (err) {
      console.error('Tracking error:', err);
      showToast('Error searching for order', 'error');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="pt-32 pb-20 max-w-3xl mx-auto px-4 sm:px-6 min-h-screen">
      <button onClick={onBack} className="flex items-center text-zinc-500 hover:text-zinc-900 mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
        <ArrowRight className="rotate-180 mr-2" size={16} />
        Back
      </button>

      <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-4 text-center">Track Your Order</h1>
      <p className="text-zinc-500 text-center mb-12">Enter your Order ID to see the current status of your package.</p>

      <form onSubmit={handleTrack} className="mb-12">
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Enter Order ID (e.g. 5xJv...)" 
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-6 py-4 focus:outline-none focus:border-zinc-900 transition-colors"
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            required
          />
          <button 
            type="submit" 
            disabled={searching}
            className="btn-primary py-4 px-10 flex items-center justify-center gap-2"
          >
            {searching ? <Loader2 className="animate-spin" size={18} /> : 'Track Order'}
          </button>
        </div>
      </form>

      {trackingOrder && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-zinc-100">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Status</p>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  trackingOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                  trackingOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {trackingOrder.status || 'Pending'}
                </span>
                {trackingOrder.status === 'Delivered' && <CheckCircle2 size={24} className="text-green-500" />}
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Estimated Delivery</p>
              <p className="text-lg font-bold text-zinc-900">
                {trackingOrder.status === 'Delivered' ? 'Delivered successfully' : '2-3 Business Days'}
              </p>
            </div>
          </div>

          <div className="relative pl-8 space-y-12">
            {[
              { label: 'Order Placed', desc: 'We have received your order', date: trackingOrder.created_at || trackingOrder.createdAt, reached: true },
              { label: 'Processing', desc: 'Your items are being packed', reached: ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(trackingOrder.status) },
              { label: 'Shipped', desc: 'Package is on its way to you', reached: ['Shipped', 'Delivered'].includes(trackingOrder.status) },
              { label: 'Delivered', desc: 'Package handed over', reached: trackingOrder.status === 'Delivered' }
            ].map((step, idx, arr) => (
              <div key={idx} className="relative">
                {idx !== arr.length - 1 && (
                  <div className={`absolute left-[-20px] top-[24px] w-[2px] h-[calc(100%+24px)] ${step.reached && arr[idx+1].reached ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
                )}
                <div className={`absolute left-[-27px] top-0 w-4 h-4 rounded-full border-2 ${step.reached ? 'bg-zinc-900 border-zinc-900' : 'bg-white border-zinc-100'}`} />
                <div>
                  <h4 className={`text-sm font-bold uppercase tracking-widest ${step.reached ? 'text-zinc-900' : 'text-zinc-300'}`}>{step.label}</h4>
                  <p className="text-xs text-zinc-500 mt-1">{step.desc}</p>
                   {step.date && <p className="text-[10px] text-zinc-400 mt-1">{new Date(step.date).toLocaleDateString()}</p>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const Navbar = ({ 
  cartCount, 
  onOpenCart, 
  onOpenUser, 
  onNavigate, 
  user, 
  searchQuery, 
  setSearchQuery,
  onSelectCategory,
  categories = []
}: { 
  cartCount: number, 
  onOpenCart: () => void, 
  onOpenUser: () => void,
  onNavigate: (page: string) => void,
  user: User | null,
  searchQuery: string,
  setSearchQuery: (query: string) => void,
  onSelectCategory?: (category: string) => void,
  categories?: string[]
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const activeCategoriesList = (categories && categories.length > 0)
    ? categories
    : ['Formal Pant', 'Formal Shirt', 'Blazer', 'Office Wear', 'Premium Collection', 'Best Seller', 'Cuban Shirt'];

  const categoryItems = [
    { label: 'All Products', value: '' },
    ...activeCategoriesList.map(c => ({ label: c, value: c }))
  ];

  // Close categories & search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (catValue: string) => {
    setIsCategoriesOpen(false);
    setIsMenuOpen(false);
    if (onSelectCategory) {
      onSelectCategory(catValue);
    } else {
      onNavigate('shop');
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-zinc-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')} 
              className="text-left group flex items-center gap-2 cursor-pointer"
            >
              <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 uppercase font-sans whitespace-nowrap">
                ELEGAN BD
              </span>
            </button>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-7 xl:space-x-8">
            {/* HOME */}
            <button
              onClick={() => onNavigate('home')}
              className="text-[13px] font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              HOME
            </button>

            {/* Categories Dropdown */}
            <div 
              ref={categoriesDropdownRef}
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="text-[13px] font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 flex items-center gap-1 transition-colors py-2 cursor-pointer"
              >
                <span>Categories</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCategoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-52 bg-white rounded-xl shadow-xl border border-zinc-100 py-2 z-50 overflow-hidden"
                  >
                    {categoryItems.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCategoryClick(cat.value)}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-50 hover:text-black transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{cat.label}</span>
                        <ChevronRight size={13} className="text-zinc-400" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* COLLECTIONS */}
            <button
              onClick={() => onNavigate('shop')}
              className="text-[13px] font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              COLLECTIONS
            </button>

            {/* TRACK ORDER with Blue Truck Icon */}
            <button
              onClick={() => onNavigate('track-order')}
              className="text-[13px] font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 flex items-center gap-2 transition-colors group cursor-pointer"
            >
              <Truck size={17} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <span>TRACK ORDER</span>
            </button>

            {/* REVIEWS with Blue Star Icon */}
            <button
              onClick={() => onNavigate('reviews')}
              className="text-[13px] font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 flex items-center gap-2 transition-colors group cursor-pointer"
            >
              <Star size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <span>REVIEWS</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-2.5">
            {/* Search Icon / Input */}
            <div ref={searchContainerRef} className="relative flex items-center">
              {isSearchOpen ? (
                <div className="flex items-center bg-zinc-100 rounded-full px-3 py-1.5 border border-zinc-200">
                  <Search size={16} className="text-zinc-500 mr-2 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim() !== '') {
                        onNavigate('shop');
                      }
                    }}
                    placeholder="Search..."
                    className="bg-transparent text-xs text-zinc-900 outline-none w-28 sm:w-44 placeholder:text-zinc-400"
                  />
                  <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="text-zinc-400 hover:text-zinc-600 ml-1 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-zinc-900 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Search"
                >
                  <Search size={21} />
                </button>
              )}
            </div>

            {/* Cart Icon with circular black badge */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-zinc-900 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={21} />
              {cartCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow-xs">
                  {cartCount}
                </span>
              ) : (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow-xs">
                  0
                </span>
              )}
            </button>

            {/* User Profile Icon */}
            <button
              onClick={onOpenUser}
              className="p-2 text-zinc-900 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              aria-label="User Account"
            >
              <UserIcon size={21} />
            </button>

            {/* Mobile Hamburger Menu Icon (matches Image 2 exact position) */}
            <button 
              className="p-2 text-zinc-900 hover:text-zinc-600 lg:hidden rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>

            {/* Admin Shield Icon (Desktop) */}
            <button
              onClick={() => onNavigate('admin')}
              className="hidden lg:flex p-2 text-zinc-900 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              title="Admin Panel"
              aria-label="Admin"
            >
              <ShieldCheck size={21} />
            </button>

            {/* Vertical Divider (Desktop) */}
            <div className="hidden lg:block h-6 w-[1px] bg-zinc-200 mx-1" />

            {/* Support 24/7 Pill (Desktop) */}
            <a
              href="tel:01327772213"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 border border-zinc-300 hover:border-zinc-500 rounded-full bg-white hover:bg-zinc-50 transition-all text-left shadow-2xs group"
            >
              <div className="text-orange-500 group-hover:scale-110 transition-transform">
                <Phone size={16} strokeWidth={2.4} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400">
                  SUPPORT 24/7
                </span>
                <span className="text-[12px] font-bold text-zinc-900 tracking-tight mt-0.5 whitespace-nowrap font-mono">
                  01327772213
                </span>
              </div>
            </a>

          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white border-r border-zinc-200 shadow-2xl z-50 overflow-y-auto flex flex-col justify-between"
          >
            <div className="p-6">
              <div className="pb-4 border-b border-zinc-100 mb-4 flex justify-between items-center">
                <span className="text-xl font-black uppercase tracking-tight text-zinc-950">
                  ELEGAN BD
                </span>
                <button onClick={() => setIsMenuOpen(false)} className="text-zinc-500">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    onNavigate('home');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-1"
                >
                  HOME
                </button>

                {/* Categories Collapsible */}
                <div>
                  <button
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    className="w-full text-left text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 flex items-center justify-between py-1"
                  >
                    <span>Categories</span>
                    <ChevronDown size={14} className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isCategoriesOpen && (
                    <div className="pl-3 mt-2 space-y-2 border-l-2 border-zinc-100">
                      {categoryItems.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCategoryClick(cat.value)}
                          className="block w-full text-left text-xs text-zinc-600 hover:text-zinc-950 py-1"
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    onNavigate('shop');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-1"
                >
                  COLLECTIONS
                </button>

                <button
                  onClick={() => {
                    onNavigate('track-order');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 flex items-center gap-2 py-1"
                >
                  <Truck size={16} className="text-blue-600" />
                  <span>TRACK ORDER</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('reviews');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 flex items-center gap-2 py-1"
                >
                  <Star size={16} className="text-blue-600" />
                  <span>REVIEWS</span>
                </button>

                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  <button
                    onClick={() => {
                      onOpenUser();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 flex items-center gap-2"
                  >
                    <UserIcon size={16} />
                    <span>My Account</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 flex items-center gap-2"
                  >
                    <ShieldCheck size={16} />
                    <span>Admin Panel</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-zinc-50 border-t border-zinc-100">
              <a
                href="tel:01327772213"
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-zinc-200 text-left shadow-2xs"
              >
                <div className="text-orange-500">
                  <Phone size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400">SUPPORT 24/7</p>
                  <p className="text-sm font-bold text-zinc-900 font-mono">01327772213</p>
                </div>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const UserPanel = ({ isOpen, onClose, onLoginSuccess, user, onLogout, onNavigate }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onLoginSuccess: (user: User) => void,
  user: User | null,
  onLogout: () => void,
  onNavigate: (page: string) => void
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { sendPasswordResetEmail } = await import('firebase/auth');
        await sendPasswordResetEmail(auth, formData.email);
        setMessage('Password reset email sent! Check your inbox.');
        setIsForgotPassword(false);
      } else if (isRegister) {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const newUser: User = {
          id: userCredential.user.uid,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          role: 'customer',
          wishlist: []
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
        setIsRegister(false);
        setMessage('Registration successful! Please login.');
      } else {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        let loginUser: User;
        if (userDoc.exists()) {
          loginUser = { id: userDoc.id, ...userDoc.data() } as User;
        } else {
           loginUser = { id: userCredential.user.uid, name: formData.email.split('@')[0], email: formData.email, role: 'customer', wishlist: [] };
        }
        
        onLoginSuccess(loginUser);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold">
                {user ? 'My Account' : (isForgotPassword ? 'Reset Password' : (isRegister ? 'Create Account' : 'Login'))}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {user ? (
                <div className="space-y-8">
                  <div className="bg-zinc-50 p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Welcome back,</p>
                    <h3 className="text-2xl font-serif font-bold">{user.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 pb-8">
                    <button 
                       onClick={() => { onNavigate('my-orders'); onClose(); }}
                       className="p-4 border border-zinc-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-zinc-900 transition-colors bg-white group hover:shadow-md"
                    >
                       <Package size={24} className="text-zinc-600 group-hover:text-zinc-900" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">My Orders</span>
                    </button>
                    <button 
                       onClick={() => { onNavigate('wishlist'); onClose(); }}
                       className="p-4 border border-zinc-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-zinc-900 transition-colors bg-white group hover:shadow-md"
                    >
                       <Heart size={24} className="text-zinc-600 group-hover:text-zinc-900" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Wishlist</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Account Email</p>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                    {(user.phone || user.address) && (
                      <div className="pt-6 border-t border-zinc-100">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 mb-4">Delivery Information (Read-Only)</h4>
                        <div className="space-y-4">
                          {user.phone && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Phone Number</p>
                              <p className="text-sm font-medium">{user.phone}</p>
                            </div>
                          )}
                          {user.address && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Default Address</p>
                              <p className="text-sm font-medium leading-relaxed">{user.address}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={onLogout}
                    className="w-full border border-red-200 text-red-500 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && <p className="text-xs text-red-500 bg-red-50 p-3">{error}</p>}
                  {message && <p className="text-xs text-green-600 bg-green-50 p-3">{message}</p>}
                  
                  {isRegister && !isForgotPassword && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Full Name</label>
                      <input 
                        required
                        type="text" 
                        className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 transition-colors"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 transition-colors"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  {!isForgotPassword && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                         <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Password</label>
                         {!isRegister && (
                           <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] text-zinc-500 hover:text-zinc-900">Forgot Password?</button>
                         )}
                      </div>
                      <input 
                        required
                        type="password" 
                        className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 transition-colors"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  )}

                  {isRegister && !isForgotPassword && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Phone Number</label>
                        <input 
                          required
                          type="tel" 
                          className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 transition-colors"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Default Address</label>
                        <textarea 
                          required
                          className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 transition-colors resize-none"
                          rows={2}
                          value={formData.address}
                          onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                      </div>
                    </>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full btn-primary py-4 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : (isForgotPassword ? 'Send Reset Link' : (isRegister ? 'Create Account' : 'Login'))}
                  </button>

                  <div className="text-center space-y-2 flex flex-col">
                    {isForgotPassword ? (
                      <button 
                        type="button"
                        onClick={() => setIsForgotPassword(false)}
                        className="text-xs text-zinc-500 hover:text-zinc-900 underline"
                      >
                        Back to Login
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-xs text-zinc-500 hover:text-zinc-900 underline"
                      >
                        {isRegister ? 'Already have an account? Login' : 'New customer? Create an account'}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ReviewsPage = ({ onBack }: { onBack: () => void }) => {
  const reviews = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: ["Sabbir Ahmed", "Rahat Khan", "Tanvir Hossain", "Arifur Rahman", "Mahbub Alam", "Sakib Al Hasan", "Mushfiqur Rahim", "Tamim Iqbal", "Mahmudullah Riyad", "Mustafizur Rahman"][i % 10],
    rating: 5 - (i % 2),
    comment: [
      "The quality of the fabric is outstanding. Perfect fit for formal office wear.",
      "I bought the Sky Blue one. The color is exactly as shown in the pictures. Highly recommended!",
      "Very comfortable for long hours. The stitching is very professional.",
      "Best formal shirt I've ever bought. The fabric feels premium and soft.",
      "The formal pant fits perfectly. The material is durable and looks very sharp.",
      "Excellent customer service and fast delivery. The product quality is top-notch.",
      "I'm very satisfied with my purchase. The size guide was very helpful.",
      "The color doesn't fade after washing. Very good quality cotton.",
      "Perfect for office and formal events. I'll definitely buy more.",
      "Great value for money. The premium feel is definitely there."
    ][i % 10],
    date: `${(i % 30) + 1} days ago`,
    category: i % 2 === 0 ? "Formal Shirt" : "Formal Pant"
  }));

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <button 
        onClick={onBack}
        className="flex items-center text-zinc-500 hover:text-zinc-900 mb-8 transition-colors"
      >
        <ArrowRight className="rotate-180 mr-2" size={16} />
        Back to Home
      </button>

      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-4">Customer Reviews</h1>
        <p className="text-zinc-500">What our 100+ customers say about our products</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-1 text-yellow-400">
                {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-2 py-1 bg-zinc-50 rounded">
                {review.category}
              </span>
            </div>
            <p className="text-zinc-600 text-sm mb-6 italic">"{review.comment}"</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest">{review.name}</span>
              <span className="text-[10px] text-zinc-400 uppercase">{review.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Hero = ({ onShopNow, videoUrl, imageUrl }: { onShopNow: () => void, videoUrl?: string, imageUrl?: string }) => {
  return (
    <div>
      <section className="relative w-full overflow-hidden bg-zinc-50 flex items-center justify-center min-h-[400px] md:min-h-[700px]">
        {videoUrl ? (
          <video 
            src={videoUrl} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full absolute inset-0 object-cover"
          />
        ) : (
          <img 
            src={imageUrl || "https://i.imgur.com/Vriu71z.png"} 
            alt="Hero Model" 
            className="w-full h-full absolute inset-0 object-cover"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-black/20 z-10" />
      </section>
    </div>
  );
};

const BannerCarousel = ({ banners }: { banners: Banner[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="relative w-full bg-zinc-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full"
        >
          {(banners[currentIndex].title || banners[currentIndex].subtitle) && (
            <div className="absolute inset-0 bg-black/30 z-10" />
          )}
          <picture className="w-full block">
            {banners[currentIndex].mobile_image && (
              <source
                media="(max-width: 767px)"
                srcSet={banners[currentIndex].mobile_image}
              />
            )}
            <img
              src={banners[currentIndex].image || banners[currentIndex].mobile_image || '/banners/hero_desktop.jpg'}
              alt={banners[currentIndex].title || 'Hero Banner'}
              className="w-full aspect-[800/900] md:aspect-[1920/700] object-cover block"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('/banners/hero_desktop.jpg')) {
                  target.src = '/banners/hero_desktop.jpg';
                }
              }}
            />
          </picture>
          {(banners[currentIndex].title || banners[currentIndex].subtitle) && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              {banners[currentIndex].title && (
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-white text-3xl md:text-6xl font-serif font-bold mb-4 tracking-tight"
                >
                  {banners[currentIndex].title}
                </motion.h2>
              )}
              {banners[currentIndex].subtitle && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/90 text-sm md:text-xl max-w-2xl font-light"
                >
                  {banners[currentIndex].subtitle}
                </motion.p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-6' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const MiddleBanner = ({ banner, onNavigate }: { banner?: Banner, onNavigate: (page: string) => void }) => {
  const currentBanner: Banner = banner || {
    id: 'default_middle_banner',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1920&h=700',
    mobile_image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800&h=900',
    title: 'CRAFTED FOR DISTINCTION',
    subtitle: 'Discover our signature tailored formal wear designed for modern elegance.',
    buttonText: 'SHOP NOW',
    link: 'shop'
  };

  const imageSrc = currentBanner.image || currentBanner.mobile_image || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1920&h=700';

  return (
    <section 
      className="relative w-full overflow-hidden bg-zinc-900 group cursor-pointer"
      onClick={() => onNavigate(currentBanner.link || 'shop')}
    >
      <picture className="w-full block">
        {currentBanner.mobile_image && (
          <source
            media="(max-width: 767px)"
            srcSet={currentBanner.mobile_image}
          />
        )}
        <img
          src={imageSrc}
          alt={currentBanner.title || 'Special Collection Banner'}
          className="w-full aspect-[800/900] md:aspect-[1920/700] object-cover block transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </picture>
      
      {/* Banner Text Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 z-10 flex flex-col items-center justify-end md:justify-center text-center p-6 md:p-12">
        {currentBanner.title && (
          <motion.h3 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-2 sm:mb-3 tracking-tight drop-shadow-md"
          >
            {currentBanner.title}
          </motion.h3>
        )}
        {currentBanner.subtitle && (
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white/90 text-xs sm:text-base md:text-xl max-w-2xl font-light mb-4 sm:mb-6 drop-shadow-sm"
          >
            {currentBanner.subtitle}
          </motion.p>
        )}
        {currentBanner.buttonText && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentBanner.link || 'shop');
            }}
            className="px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-[#cfa83b] hover:bg-white text-[#111827] font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl cursor-pointer transform hover:-translate-y-0.5"
          >
            {currentBanner.buttonText}
          </motion.button>
        )}
      </div>
    </section>
  );
};

const TrustFeatureBadges = () => {
  const items = [
    {
      title: 'Cash On Delivery',
      subtitle: 'Check before you pay',
      icon: <Truck size={22} className="text-white" />
    },
    {
      title: '100% Premium Fabric',
      subtitle: 'Quality Guaranteed',
      icon: <ShieldCheck size={22} className="text-white" />
    },
    {
      title: 'Easy Exchange',
      subtitle: 'Free size change in 7 days',
      icon: <ArrowLeftRight size={22} className="text-white" />
    },
    {
      title: '24/7 Support',
      subtitle: 'Instant help via call or message',
      icon: <Headphones size={22} className="text-white" />
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 sm:-mt-8 md:-mt-10 mb-8 sm:mb-12 relative z-20">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 shadow-md p-5 sm:p-6 md:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 items-center">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#2563eb] flex items-center justify-center shrink-0 shadow-xs">
                {item.icon}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 tracking-tight leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-zinc-500 font-medium leading-tight mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({ product, onSelect, showColorsOnRight, isWishlisted, onToggleWishlist }: { 
  product: Product, 
  onSelect: (p: Product) => void, 
  key?: React.Key,
  showColorsOnRight?: boolean,
  isWishlisted?: boolean,
  onToggleWishlist?: (e: React.MouseEvent, p: Product) => void
}) => {
  const colorsList = Array.isArray(product.colors) 
    ? product.colors 
    : (typeof product.colors === 'string' ? (product.colors as string).split(',').map((c: string) => c.trim()).filter(Boolean) : []);

  // Format currency with 2 decimals e.g. 1,049.00৳
  const formatPrice = (val?: number) => {
    if (val === undefined || val === null) return '0.00৳';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '৳';
  };

  // Extract or format variant/color tag (e.g. LIGHT ASH)
  const variantColor = colorsList.length > 0 ? colorsList[0].toUpperCase() : '';

  return (
    <motion.div 
      whileHover={{ y: -7, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="group cursor-pointer bg-white rounded-[22px] md:rounded-[24px] border border-zinc-200/90 hover:border-zinc-300 shadow-xs hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
      onClick={() => onSelect(product)}
    >
      {/* Top Image Container */}
      <div className="relative overflow-hidden bg-zinc-100 aspect-[3/4] w-full">
        <img 
          src={product.image || 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop'} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop'; }}
        />
        
        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(e, product);
            }}
            className="absolute top-2.5 right-2.5 md:top-3.5 md:right-3.5 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-all hover:scale-110 cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-zinc-600"} />
          </button>
        )}

        {/* Quick View Hover Badge */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-3.5 opacity-0 group-hover:opacity-100 pointer-events-none">
          <span className="bg-white/95 backdrop-blur-md text-zinc-900 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            Quick View
          </span>
        </div>
      </div>

      {/* Card Content Matching User Image */}
      <div className="p-4 sm:p-5 bg-white flex flex-col justify-between flex-grow">
        {/* Row 1: Category & Color */}
        <div className="flex items-center justify-between text-[11px] font-bold tracking-wider mb-1.5 gap-2">
          <span className="text-zinc-500 uppercase truncate font-sans">
            {product.category || 'FORMAL PANT'}
          </span>
          {variantColor && (
            <span className="text-zinc-400 font-semibold uppercase truncate shrink-0 font-sans">
              {variantColor}
            </span>
          )}
        </div>

        {/* Row 2: Product Title */}
        <h3 className="text-sm sm:text-[15px] font-serif font-bold text-zinc-900 leading-snug line-clamp-2 mb-2 group-hover:text-blue-900 transition-colors">
          {product.name}
        </h3>

        {/* Row 3: Price */}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-base sm:text-[17px] font-bold font-sans text-zinc-950 tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs sm:text-sm text-zinc-400 line-through font-sans font-normal">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const FeaturedCollection = ({ 
  title = "EXPLORE OUR PANT COLLECTION",
  products, 
  onSelect, 
  user, 
  onToggleWishlist, 
  categories: propCategories,
  filterType = 'pant'
}: { 
  title?: string,
  products: Product[], 
  onSelect: (p: Product) => void, 
  user?: User | null, 
  onToggleWishlist?: (e: React.MouseEvent, p: Product) => void,
  categories?: string[],
  filterType?: 'all' | 'pant' | 'shirt'
}) => {
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  
  const isPant = (p: Product) => {
    const cat = (p.category || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    return cat.includes('pant') || cat.includes('trouser') || name.includes('pant') || name.includes('trouser');
  };

  const isShirt = (p: Product) => {
    const cat = (p.category || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    return cat.includes('shirt') || cat.includes('polo') || name.includes('shirt') || name.includes('polo');
  };

  const baseProducts = useMemo(() => {
    if (filterType === 'pant') {
      const pants = products.filter(isPant);
      return pants.length > 0 ? pants : products;
    }
    if (filterType === 'shirt') {
      const shirts = products.filter(isShirt);
      return shirts.length > 0 ? shirts : products;
    }
    return products;
  }, [products, filterType]);

  const categories = useMemo(() => {
    if (filterType === 'pant') {
      const fromProps = (propCategories || []).filter(c => c.toLowerCase().includes('pant') || c.toLowerCase().includes('trouser'));
      const fromProducts = Array.from(new Set(baseProducts.map(p => p.category).filter(Boolean)));
      const combined = Array.from(new Set([...fromProducts, ...fromProps]));
      return ['All', ...(combined.length > 0 ? combined : ['Formal Pant'])];
    }
    if (filterType === 'shirt') {
      const fromProps = (propCategories || []).filter(c => c.toLowerCase().includes('shirt') || c.toLowerCase().includes('polo'));
      const fromProducts = Array.from(new Set(baseProducts.map(p => p.category).filter(Boolean)));
      const combined = Array.from(new Set([...fromProducts, ...fromProps]));
      return ['All', ...(combined.length > 0 ? combined : ['Formal Shirt', 'Cuban Shirt'])];
    }
    return ['All', ...(propCategories && propCategories.length > 0 ? propCategories : ['Formal Pant', 'Formal Shirt', 'Blazer'])];
  }, [baseProducts, filterType, propCategories]);

  useEffect(() => {
    if (activeTab !== 'All' && !categories.includes(activeTab)) {
      setActiveTab('All');
    }
  }, [categories, activeTab]);

  const filteredProducts = baseProducts.filter(p => {
    if (activeTab === 'All') return true;
    return p.category === activeTab;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // default
  });

  return (
    <section className="pt-4 sm:pt-8 pb-8 sm:pb-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#111827] mb-3 sm:mb-4 tracking-tight uppercase">
            {title}
          </h2>
          <div className="h-[2px] w-28 sm:w-32 bg-[#cca94b] mx-auto mb-8 sm:mb-10"></div>
          
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8 sm:mb-10">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`whitespace-nowrap px-5 sm:px-7 py-2 sm:py-2.5 rounded-[30px] font-medium text-xs sm:text-sm transition-all duration-300 border ${
                  activeTab === category 
                    ? 'bg-[#cfa83b] text-[#111827] border-[#cfa83b] shadow-sm transform -translate-y-0.5' 
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-[#cfa83b] hover:text-[#111827]'
                }`}
              >
                {category}
              </button>
            ))}

            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-zinc-200 text-zinc-600 text-xs sm:text-sm font-medium rounded-[30px] px-4 sm:px-5 py-2 sm:py-2.5 pr-8 sm:pr-9 outline-none focus:border-[#cfa83b] hover:border-[#cfa83b] transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                <option value="default">Sort By</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onSelect={onSelect} 
              isWishlisted={user?.wishlist?.includes(String(product.id))}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center text-zinc-500 py-12">No products found in this category.</div>
        )}
      </div>
    </section>
  );
};

const AutoScrollCarousel = ({ products, onSelect, user, onToggleWishlist }: { products: Product[], onSelect: (p: Product) => void, user?: User | null, onToggleWishlist?: (e: React.MouseEvent, p: Product) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const w = window.innerWidth;
          const cardWidth = w < 640 ? 165 : w < 768 ? 220 : w < 1024 ? 250 : 270;
          const gap = w < 640 ? 14 : w < 1024 ? 24 : 32;
          scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-zinc-50 pb-16 pt-8 overflow-hidden border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 mb-4 tracking-tight">Complete Collection Showcase</h2>
        <p className="text-zinc-500 text-sm md:text-lg max-w-2xl mx-auto">Explore our premium selection of Formal Pants, Shirts, and Blazers, curated just for you.</p>
      </div>
      <div 
        ref={scrollRef}
        className="flex gap-3.5 sm:gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-8 pb-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, idx) => (
          <div key={`${product.id}-${idx}`} className="w-[165px] min-w-[165px] sm:w-[220px] sm:min-w-[220px] md:w-[250px] md:min-w-[250px] lg:w-[270px] lg:min-w-[270px] flex-shrink-0 snap-start">
            <ProductCard 
              product={product} 
              onSelect={onSelect} 
              isWishlisted={user?.wishlist?.includes(String(product.id))}
              onToggleWishlist={onToggleWishlist}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const TopRatedCarousel = ({ products, onSelect, user, onToggleWishlist }: { products: Product[], onSelect: (p: Product) => void, user?: User | null, onToggleWishlist?: (e: React.MouseEvent, p: Product) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const w = window.innerWidth;
          const cardWidth = w < 640 ? 165 : w < 768 ? 220 : w < 1024 ? 250 : 270;
          const gap = w < 640 ? 14 : w < 1024 ? 24 : 32;
          scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div 
        ref={scrollRef}
        className="flex gap-3.5 sm:gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory pb-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, idx) => (
          <div key={`${product.id}-${idx}`} className="w-[165px] min-w-[165px] sm:w-[220px] sm:min-w-[220px] md:w-[250px] md:min-w-[250px] lg:w-[270px] lg:min-w-[270px] flex-shrink-0 snap-start">
            <ProductCard 
              product={product} 
              onSelect={onSelect} 
              showColorsOnRight={true} 
              isWishlisted={user?.wishlist?.includes(String(product.id))}
              onToggleWishlist={onToggleWishlist}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomerReviewsSection = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [reviews, setReviews] = useState([
    {
      id: '1',
      name: 'Tanvir Ahmed',
      location: 'Mirpur, Dhaka',
      rating: 5,
      date: '2 days ago',
      productName: 'Premium Export Quality Formal Pant',
      comment: 'কাপড়ের কোয়ালিটি এক কথায় অসাধারণ! ফিটিং জাস্ট পারফেক্ট হয়েছে। ডেলিভারিও ২ দিনের মধ্যে পেয়ে গেছি। এলিগান বিডি কে অনেক ধন্যবাদ।',
      verified: true,
    },
    {
      id: '2',
      name: 'Sabbir Hossain',
      location: 'Chittagong',
      rating: 5,
      date: '4 days ago',
      productName: 'Executive Cotton Formal Shirt',
      comment: 'অনলাইনে অর্ডার করতে ভয় পাচ্ছিলাম, কিন্তু কাপড়ের ফিনিশিং দেখে চমকে গেছি। ঢাকার বাইরে এত দ্রুত ডেলিভারি দেওয়ার জন্য ধন্যবাদ।',
      verified: true,
    },
    {
      id: '3',
      name: 'Mahmudul Hasan',
      location: 'Sylhet',
      rating: 5,
      date: '1 week ago',
      productName: 'Slim Fit Formal Pant (Black)',
      comment: 'প্যান্টের ফ্যাব্রিক খুব কমফোর্টেবল। গরমের দিনেও পরে খুব আরাম পাওয়া যায়। রিপিট কাস্টমার হব ইনশাল্লাহ।',
      verified: true,
    },
    {
      id: '4',
      name: 'Anik Rahman',
      location: 'Uttara, Dhaka',
      rating: 5,
      date: '1 week ago',
      productName: 'Cuban Collar Casual Shirt',
      comment: 'কালার এবং সাইজ এক্সেক্ট ছবির মতো ছিল। হোম ডেলিভারির সময় হাতে পেয়ে চেক করে টাকা দিতে পেরেছি।',
      verified: true,
    },
    {
      id: '5',
      name: 'Rafiqul Islam',
      location: 'Rajshahi',
      rating: 5,
      date: '2 weeks ago',
      productName: 'Premium Tailored Blazer',
      comment: 'প্রিমিয়াম কোয়ালিটি ব্লেজার! বিয়ে বাড়ির অনুষ্ঠানে পরেছিলাম, সবাই প্রশংসা করেছে। সাইজ না মিললে এক্সচেঞ্জ এর সুবিধাও খুব ভালো।',
      verified: true,
    },
    {
      id: '6',
      name: 'Shahriar Nafis',
      location: 'Khulna',
      rating: 5,
      date: '2 weeks ago',
      productName: 'Stretchable Formal Pant',
      comment: 'স্ট্রেচেবল কাপড় হওয়ায় মুভমেন্টে খুব আরাম। প্রাইজ হিসেবে সার্ভিস এবং কোয়ালিটি এ ওয়ান।',
      verified: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    location: '',
    productName: '',
    rating: 5,
    comment: ''
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      showToast('Please fill in your name and review message', 'error');
      return;
    }
    const item = {
      id: Date.now().toString(),
      name: newReview.name,
      location: newReview.location || 'Dhaka',
      rating: newReview.rating,
      date: 'Just now',
      productName: newReview.productName || 'Formal Wear',
      comment: newReview.comment,
      verified: true
    };
    setReviews([item, ...reviews]);
    setIsModalOpen(false);
    setNewReview({ name: '', location: '', productName: '', rating: 5, comment: '' });
    showToast('ধন্যবাদ! আপনার মূল্যবান রিভিউটি যুক্ত করা হয়েছে।', 'success');
  };

  return (
    <section className="py-16 md:py-24 bg-[#0d111c] text-white relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title & Metrics */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-4">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span>Customer Satisfaction</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
              Customer Reviews & Feedback
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-xl">
              ১০,০০০+ এরও বেশি সন্তুষ্ট গ্রাহকের বিশ্বাস ও আস্থার অভিজ্ঞতা জানুন
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl shrink-0">
            <div className="text-center pr-4 border-r border-zinc-800">
              <p className="text-3xl font-extrabold text-amber-400 font-sans">4.9</p>
              <div className="flex gap-0.5 justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-white">1,250+ Verified Reviews</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">99.2% Positive Feedback Rate</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer transition-colors"
              >
                + Write a Review
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div 
              key={rev.id}
              className="bg-zinc-900/90 border border-zinc-800/90 hover:border-amber-500/40 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg"
            >
              <div>
                {/* Star Rating & Verified Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 size={11} /> Verified Buyer
                    </span>
                  )}
                </div>

                {/* Review Content */}
                <p className="text-zinc-200 text-sm leading-relaxed mb-6 italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Product */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{rev.name}</h4>
                  <p className="text-xs text-zinc-400">{rev.location}</p>
                </div>
                <div className="text-right max-w-[140px]">
                  <p className="text-[10px] text-amber-400/90 font-bold uppercase truncate">{rev.productName}</p>
                  <p className="text-[10px] text-zinc-500">{rev.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-serif font-bold text-amber-400 mb-1">Write a Customer Review</h3>
            <p className="text-xs text-zinc-400 mb-6">আপনার অভিজ্ঞতা আমাদের সাথে শেয়ার করুন</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Your Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={newReview.name}
                  onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Your Location / District</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mirpur, Dhaka"
                  value={newReview.location}
                  onChange={(e) => setNewReview({...newReview, location: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Purchased Product</label>
                <input 
                  type="text" 
                  placeholder="e.g. Formal Pant / Cotton Shirt"
                  value={newReview.productName}
                  onChange={(e) => setNewReview({...newReview, productName: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReview({...newReview, rating: star})}
                      className="p-1 cursor-pointer"
                    >
                      <Star size={22} className={star <= newReview.rating ? "fill-amber-400 text-amber-400" : "text-zinc-600"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Review Message *</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="আপনার প্রতিক্রিয়া লিখুন..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

const parseProductSizes = (sizes: any, category?: string, name?: string): string[] => {
  const isPant = (category && category.toLowerCase().includes('pant')) || (name && name.toLowerCase().includes('pant'));
  if (isPant) {
    let parsed: string[] = [];
    if (Array.isArray(sizes) && sizes.length > 0) {
      parsed = sizes.map((s: any) => String(s).trim()).filter(Boolean);
    } else if (typeof sizes === 'string' && sizes.trim().length > 0) {
      parsed = sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    const fullPantSizes = ['28', '30', '32', '34', '36', '38', '40'];
    if (parsed.length === 0) return fullPantSizes;
    const hasPantNum = parsed.some(s => fullPantSizes.includes(s));
    if (hasPantNum) {
      const combined = Array.from(new Set([...fullPantSizes, ...parsed]));
      return combined.sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
    }
    return parsed;
  }

  if (Array.isArray(sizes) && sizes.length > 0) {
    return sizes.map((s: any) => String(s).trim()).filter(Boolean);
  }
  if (typeof sizes === 'string' && sizes.trim().length > 0) {
    return sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  const isShirt = (category && category.toLowerCase().includes('shirt')) || (name && name.toLowerCase().includes('shirt'));
  return isShirt ? ['M', 'L', 'XL', 'XXL'] : ['28', '30', '32', '34', '36', '38', '40'];
};

const parseProductColors = (colors: any): string[] => {
  if (Array.isArray(colors) && colors.length > 0) {
    return colors.map((c: any) => String(c).trim()).filter(Boolean);
  }
  if (typeof colors === 'string' && colors.trim().length > 0) {
    return colors.split(',').map((c: string) => c.trim()).filter(Boolean);
  }
  return ['Standard'];
};

const ProductDetails = ({ product, onAddToCart, onBack, onBuyNow, user, showToast, onNavigate, onCategoryClick }: { 
  product: Product, 
  onAddToCart: (p: Product, size: any, color?: string) => void, 
  onBack: () => void,
  onBuyNow: (p: Product, size: any, color?: string) => void,
  user: User | null,
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  onNavigate?: (page: string) => void,
  onCategoryClick?: (category: string) => void
}) => {
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(product.image);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ user_name: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const getImages = (images: any, primaryImage?: string) => {
    let list: string[] = [];
    if (images) {
      if (Array.isArray(images)) list = images.filter(Boolean);
      else if (typeof images === 'string') {
        try {
          const parsed = JSON.parse(images);
          list = Array.isArray(parsed) ? parsed.filter(Boolean) : [images];
        } catch (e) {
          list = [images];
        }
      }
    }
    if (primaryImage && !list.includes(primaryImage)) {
      list = [primaryImage, ...list];
    }
    return list;
  };

  const productImagesList = getImages(product.images, product.image);

  useEffect(() => {
    if (productImagesList.length > 0) {
      setActiveImage(productImagesList[0]);
    } else {
      setActiveImage(product.image);
    }
  }, [product.id, product.image, JSON.stringify(product.images)]);

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), where('product_id', '==', product.id.toString()));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data as any);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.user_name || !newReview.comment) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const reviewData = {
        product_id: product.id.toString(),
        user_name: newReview.user_name,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString()
      };
      await addDoc(collection(db, 'reviews'), reviewData);
      setReviews([reviewData as any, ...reviews]);
      setNewReview({ user_name: '', rating: 5, comment: '' });
    } catch (error) {
      console.error('Failed to submit review:', error);
      showToast('Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center text-xs font-bold uppercase tracking-widest text-zinc-500 mb-8 gap-2 flex-wrap">
        <button onClick={() => onNavigate?.('home')} className="hover:text-zinc-900 transition-colors">Home</button>
        <span className="text-zinc-300">/</span>
        <button onClick={() => onCategoryClick?.(product.category || '')} className="hover:text-zinc-900 transition-colors">{product.category || 'Shop'}</button>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div 
            className="bg-white overflow-hidden relative cursor-zoom-in rounded-2xl border border-zinc-100"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img 
              src={activeImage || null} 
              alt={product.name} 
              className={`w-full h-auto object-cover transition-transform duration-200 ${isZoomed ? 'scale-[2]' : 'scale-100'}`}
              style={{
                transformOrigin: isZoomed ? `${zoomPos.x}% ${zoomPos.y}%` : 'center'
              }}
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop'; }}
            />
          </div>
          
          {productImagesList.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {productImagesList.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square border-2 rounded-xl overflow-hidden transition-all ${activeImage === img ? 'border-zinc-900 ring-2 ring-zinc-900/10 scale-102' : 'border-zinc-200 hover:border-zinc-400 opacity-75 hover:opacity-100'}`}
                >
                  <img src={img || null} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-serif font-bold text-zinc-900 mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-zinc-900">
              <Star size={16} fill="currentColor" />
              <span className="ml-1 text-sm font-bold">{product.rating}</span>
            </div>
            <span className="text-zinc-400 text-sm">({product.reviews} Reviews)</span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-2xl font-bold text-zinc-900">৳{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-lg text-zinc-400 line-through">৳{product.originalPrice}</span>
            )}
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Select Size</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {parseProductSizes(product.sizes, product.category, product.name).map(size => {
                let isOutOfStock = false;
                if (product.stockMap && Object.keys(product.stockMap).length > 0) {
                  const sizeStock = Object.values(product.stockMap).reduce((sum: number, colStock: any) => sum + (colStock?.[size] || 0), 0);
                  if (sizeStock <= 0) isOutOfStock = true;
                } else if (product.stock !== undefined && product.stock <= 0) {
                  isOutOfStock = true;
                }

                if (isOutOfStock) {
                  return (
                    <button
                      key={size}
                      disabled
                      className="py-3 text-sm font-medium border border-zinc-100 bg-zinc-50 text-zinc-300 line-through cursor-not-allowed rounded-lg"
                    >
                      {size}
                    </button>
                  );
                }

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-sm font-medium border rounded-lg transition-all cursor-pointer ${selectedSize === size ? 'bg-zinc-900 text-white border-zinc-900 shadow-md scale-102 font-bold' : 'border-zinc-200 text-zinc-700 hover:border-zinc-900 hover:bg-zinc-50'}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Fabric</h4>
              <p className="text-zinc-900 font-medium">{product.fabric}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Fit Type</h4>
              <p className="text-zinc-900 font-medium">{product.fit}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Description</h4>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button 
              onClick={() => selectedSize && onAddToCart(product, selectedSize, selectedColor || undefined)}
              disabled={!selectedSize}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
            <button 
              onClick={() => selectedSize && onBuyNow(product, selectedSize, selectedColor || undefined)}
              disabled={!selectedSize}
              className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-zinc-100">
            <div className="text-center">
              <Truck size={20} className="mx-auto mb-2 text-zinc-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Fast Delivery</span>
            </div>
            <div className="text-center">
              <ShieldCheck size={20} className="mx-auto mb-2 text-zinc-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
            </div>
            <div className="text-center">
              <RefreshCw size={20} className="mx-auto mb-2 text-zinc-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Easy Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-24 border-t border-zinc-100 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Review Stats & Form */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-6">Customer Reviews</h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="text-5xl font-bold text-zinc-900">{product.rating}</div>
              <div>
                <div className="flex text-zinc-900 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.round(product.rating) ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="text-sm text-zinc-500">Based on {reviews.length} reviews</p>
              </div>
            </div>

            {/* Review Form */}
            <div className="bg-zinc-50 p-6 rounded-2xl">
              <h3 className="font-bold uppercase tracking-widest text-xs mb-4">Write a Review</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className={`p-1 transition-colors ${newReview.rating >= star ? 'text-zinc-900' : 'text-zinc-300'}`}
                        >
                          <Star size={20} fill={newReview.rating >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Comment</label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-900 min-h-[100px]"
                      placeholder="Share your thoughts about this product..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full btn-primary py-3 text-xs"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-zinc-600 mb-4">Please login to share your experience with this product.</p>
                </div>
              )}
            </div>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-zinc-100 pb-8 last:border-0">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-zinc-900">{review.user_name}</h4>
                        <div className="flex text-zinc-900 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-zinc-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-zinc-50 rounded-2xl">
                  <MessageCircle size={40} className="mx-auto mb-4 text-zinc-300" />
                  <p className="text-zinc-500">No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartDrawer = ({ isOpen, onClose, items, onUpdateQty, onRemove, onCheckout }: { 
  isOpen: boolean, 
  onClose: () => void, 
  items: CartItem[], 
  onUpdateQty: (id: number | string, size: any, delta: number, color?: string) => void,
  onRemove: (id: number | string, size: any, color?: string) => void,
  onCheckout: () => void
}) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold">Your Cart ({items.length})</h2>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                  <ShoppingBag size={64} strokeWidth={1} className="mb-4" />
                  <p className="text-lg">Your cart is empty</p>
                  <button onClick={onClose} className="mt-4 text-zinc-900 font-bold underline">Start Shopping</button>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor || 'default'}`} className="flex gap-4">
                    <div className="w-24 h-32 bg-zinc-100 flex-shrink-0">
                      <img src={item.image || null} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop'; }} />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-bold text-zinc-900 uppercase">{item.name}</h3>
                        <button onClick={() => onRemove(item.id, item.selectedSize, item.selectedColor)} className="text-zinc-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-x-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-1">
                        <span>Size: {item.selectedSize}</span>
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      </div>

                      {/* Stock Status Indicator */}
                      {(item.stockMap && item.selectedColor && item.selectedSize ? 
                        (item.stockMap[item.selectedColor]?.[item.selectedSize] || 0) <= 0 : 
                        (item.stock || 0) <= 0) && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Stock Out</span>
                        </div>
                      )}

                      <div className="mt-auto flex justify-between items-center">
                        <div className="flex items-center border border-zinc-200">
                          <button 
                            onClick={() => onUpdateQty(item.id, item.selectedSize, -1, item.selectedColor)}
                            className="p-1 hover:bg-zinc-50"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQty(item.id, item.selectedSize, 1, item.selectedColor)}
                            className="p-1 hover:bg-zinc-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-bold text-zinc-900">৳{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-zinc-100 bg-zinc-50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Subtotal</span>
                  <span className="text-2xl font-serif font-bold text-zinc-900">৳{total}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full btn-primary py-4"
                >
                  Checkout
                </button>
                <p className="text-center text-[10px] text-zinc-400 mt-4 uppercase tracking-widest">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CheckoutPage = ({ 
  items, 
  onBack, 
  onComplete, 
  showToast,
  onUpdateQty,
  onRemoveItem
}: { 
  items: CartItem[], 
  onBack: () => void, 
  onComplete: (orderId?: string) => void, 
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  onUpdateQty?: (id: number | string, size: any, delta: number, color?: string) => void,
  onRemoveItem?: (id: number | string, size: any, color?: string) => void
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
    location: 'inside', // 'inside' or 'outside'
    paymentMethod: 'COD',
    transactionId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = formData.location === 'inside' ? 70 : 130;
  const total = subtotal + shipping - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase()));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
        
        if (subtotal < coupon.min_purchase) {
          showToast(`Minimum purchase of ৳${coupon.min_purchase} required for this coupon`, 'error');
        } else {
          let discVal = 0;
          if (coupon.discount_type === 'percentage') {
            discVal = Math.floor((subtotal * coupon.discount_value) / 100);
          } else {
            discVal = coupon.discount_value;
          }
          setDiscount(discVal);
          setAppliedCoupon(coupon);
          showToast('Coupon applied successfully!', 'success');
        }
      } else {
        showToast('Invalid coupon code', 'error');
      }
    } catch (err) {
      console.error('Coupon error:', err);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((formData.paymentMethod === 'bKash' || formData.paymentMethod === 'Nagad') && !formData.transactionId) {
      showToast('Please enter the Transaction ID', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Deduct stock from Firestore for each item
      for (const item of items) {
        if (item.selectedColor && item.selectedSize) {
          try {
            const productRef = doc(db, 'products', item.id.toString());
            const productSnap = await getDoc(productRef);
            
            if (productSnap.exists()) {
              const productData = productSnap.data();
              const stockMap = productData.stockMap || {};
              const colorStock = stockMap[item.selectedColor] || {};
              const currentStock = colorStock[item.selectedSize] || 0;
              
              const newStock = Math.max(0, currentStock - item.quantity);
              
              // Update using dot notation for nested fields
              await updateDoc(productRef, {
                [`stockMap.${item.selectedColor}.${item.selectedSize}`]: newStock,
                stock: Math.max(0, (productData.stock || 0) - item.quantity)
              });
            }
          } catch (err) {
            console.error("Stock deduction error for item:", item.id, err);
            // We continue with order even if stock deduction fails for one item 
            // to avoid blocking the customer, but log it.
          }
        }
      }

      // 2. Create the order
      const orderData = {
        customer_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        total_amount: total,
        items: JSON.stringify(items),
        payment_method: formData.paymentMethod,
        transaction_id: formData.transactionId,
        status: 'Pending',
        coupon_used: appliedCoupon?.code || null,
        discount_amount: discount,
        created_at: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      saveOrderToSupabase({ ...orderData, order_id: docRef.id });
      onComplete(docRef.id);
    } catch (error) {
      console.error("Checkout error:", error);
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-3xl font-serif font-bold mb-8">Shipping Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Full Name</label>
              <input 
                required
                type="text" 
                className="w-full border-b border-zinc-200 py-3 focus:border-zinc-900 outline-none transition-colors"
                placeholder="Enter your name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Phone Number</label>
              <input 
                required
                type="tel" 
                className="w-full border-b border-zinc-200 py-3 focus:border-zinc-900 outline-none transition-colors"
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Delivery Address</label>
              <textarea 
                required
                className="w-full border-b border-zinc-200 py-3 focus:border-zinc-900 outline-none transition-colors resize-none"
                placeholder="House, Road, Area..."
                rows={3}
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Delivery Area</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, location: 'inside'})}
                  className={`p-4 border text-center transition-all rounded-xl ${formData.location === 'inside' ? 'border-zinc-900 bg-zinc-50 font-bold' : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'}`}
                >
                  <p className="text-sm">Inside Dhaka</p>
                  <p className="text-xs mt-1">৳70</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, location: 'outside'})}
                  className={`p-4 border text-center transition-all rounded-xl ${formData.location === 'outside' ? 'border-zinc-900 bg-zinc-50 font-bold' : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'}`}
                >
                  <p className="text-sm">Outside Dhaka</p>
                  <p className="text-xs mt-1">৳130</p>
                </button>
              </div>
            </div>
            
            <div className="pt-8">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Payment Method</h3>
              <div className="p-4 border-2 border-zinc-900 bg-zinc-50 rounded-xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Truck size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 block text-sm">Cash on Delivery (COD)</span>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করুন</p>
                  </div>
                </div>
                <ShieldCheck className="text-blue-600 shrink-0" size={24} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || items.length === 0}
              className="w-full btn-primary py-4 mt-8 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Order'}
              {!isSubmitting && <ChevronRight size={18} />}
            </button>
          </form>
        </div>

        <div className="bg-zinc-50 p-6 sm:p-8 h-fit sticky top-32 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200">
            <h2 className="text-xl font-serif font-bold text-zinc-900">Order Summary</h2>
            <span className="text-xs font-bold bg-zinc-200 text-zinc-800 px-3 py-1 rounded-full">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <ShoppingBag size={48} className="mx-auto text-zinc-300" />
              <p className="text-zinc-600 text-sm font-medium">আপনার কার্টে কোন প্রোডাক্ট নেই</p>
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Back to Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3.5 mb-6 max-h-[380px] overflow-y-auto pr-1">
                {items.map(item => (
                  <div 
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor || ''}`} 
                    className="p-3.5 bg-white rounded-xl border border-zinc-200/90 shadow-2xs flex gap-3.5 items-center"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-20 bg-zinc-100 rounded-lg overflow-hidden shrink-0">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop'} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop'; }}
                      />
                    </div>

                    {/* Product Details & Quantity Controls */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1">{item.name}</h4>
                        {onRemoveItem && (
                          <button 
                            type="button"
                            onClick={() => onRemoveItem(item.id, item.selectedSize, item.selectedColor)}
                            className="text-zinc-400 hover:text-red-500 transition-colors p-0.5 shrink-0 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">
                        <span>Size: <strong className="text-zinc-800">{item.selectedSize}</strong></span>
                        {item.selectedColor && (
                          <span>Color: <strong className="text-zinc-800">{item.selectedColor}</strong></span>
                        )}
                      </div>

                      {/* Stock warning */}
                      {(item.stockMap && item.selectedColor && item.selectedSize ? 
                        (item.stockMap[item.selectedColor]?.[item.selectedSize] || 0) <= 0 : 
                        (item.stock || 0) <= 0) && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Stock Out</span>
                        </div>
                      )}

                      {/* Quantity Controls & Item Total */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                          <button
                            type="button"
                            onClick={() => onUpdateQty && onUpdateQty(item.id, item.selectedSize, -1, item.selectedColor)}
                            className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors font-bold text-xs cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-extrabold text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty && onUpdateQty(item.id, item.selectedSize, 1, item.selectedColor)}
                            className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors font-bold text-xs cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs sm:text-sm font-extrabold text-zinc-900">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          
          <div className="pt-6 border-t border-zinc-200 mb-6">
             <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Discount Coupon</label>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 bg-white border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 uppercase"
                  placeholder="Enter Code"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  disabled={!!appliedCoupon}
                />
                <button 
                   onClick={handleApplyCoupon}
                   disabled={isValidatingCoupon || !couponCode || !!appliedCoupon}
                   className="btn-primary py-2 px-4 text-[10px] disabled:opacity-50"
                >
                   {appliedCoupon ? 'Applied' : (isValidatingCoupon ? '...' : 'Apply')}
                </button>
             </div>
             {appliedCoupon && (
                <div className="flex justify-between items-center mt-2">
                   <p className="text-xs text-green-600 font-medium">Coupon "{appliedCoupon.code}" applied</p>
                   <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }} className="text-xs text-red-500 underline">Remove</button>
                </div>
             )}
          </div>

          <div className="border-t border-zinc-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Shipping ({formData.location === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
              <span>৳{shipping}</span>
            </div>
            {discount > 0 && (
               <div className="flex justify-between text-sm text-green-600">
                 <span>Discount</span>
                 <span>- ৳{discount}</span>
               </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-4">
              <span>Total</span>
              <span>৳{total}</span>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

  const defaultProducts: Product[] = initialProductsData as Product[];

  const defaultBanners: Banner[] = [
    {
      id: 'default_hero_banner',
      image: '/banners/hero_desktop.jpg',
      mobile_image: '/banners/hero_mobile.jpg',
      title: '',
      subtitle: '',
      buttonText: 'SHOP NOW!',
      link: '/shop'
    }
  ];

const AdminPanel = ({ onBack, onRefreshProducts, onRefreshBanners, onRefreshPromoImage, onRefreshHeroVideo, onRefreshHeroImage, onRefreshCategories, onRefreshMiddleBanner, showToast }: { onBack: () => void, onRefreshProducts: () => void, onRefreshBanners: () => void, onRefreshPromoImage: () => void, onRefreshHeroVideo: () => void, onRefreshHeroImage: () => void, onRefreshCategories?: () => void, onRefreshMiddleBanner?: () => void, showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [topRatedOfferImage, setTopRatedOfferImage] = useState('');
  const defaultMiddleBanner: Banner = {
    id: 'default_middle_banner',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1920&h=700',
    mobile_image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800&h=900',
    title: 'CRAFTED FOR DISTINCTION',
    subtitle: 'Discover our signature tailored formal wear designed for modern elegance.',
    buttonText: 'SHOP NOW',
    link: 'shop'
  };
  const [middleBanner, setMiddleBanner] = useState<Banner>(defaultMiddleBanner);
  const [middleBannerFormData, setMiddleBannerFormData] = useState<Banner>(defaultMiddleBanner);
  const [showMiddleBannerModal, setShowMiddleBannerModal] = useState(false);
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('elegan_product_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return ['Formal Pant', 'Formal Shirt', 'Blazer', 'Office Wear', 'Premium Collection', 'Best Seller', 'Cuban Shirt'];
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('admin_saved_email') || 'eleganbdltd@gmail.com';
  });
  const [password, setPassword] = useState('eleganbd2026@#@#ssn');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true' || localStorage.getItem('admin_authenticated') === 'true';
  });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [heroVideo, setHeroVideo] = useState('https://assets.mixkit.co/videos/preview/mixkit-man-in-a-suit-walking-slowly-4848-large.mp4');
  const [heroImage, setHeroImage] = useState('https://i.imgur.com/Vriu71z.png');
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    const fetchHeroVideo = async () => {
      const docSnap = await getDoc(doc(db, 'settings', 'hero_video'));
      if (docSnap.exists() && docSnap.data().value) {
        setHeroVideo(docSnap.data().value);
      } else {
        const defaultVideo = 'https://assets.mixkit.co/videos/preview/mixkit-man-in-a-suit-walking-slowly-4848-large.mp4';
        setHeroVideo(defaultVideo);
        await setDoc(doc(db, 'settings', 'hero_video'), { value: defaultVideo });
      }
    };
    fetchHeroVideo();
  }, []);

  useEffect(() => {
    const fetchHeroImage = async () => {
      const docSnap = await getDoc(doc(db, 'settings', 'hero_image'));
      if (docSnap.exists() && docSnap.data().value) {
        setHeroImage(docSnap.data().value);
      } else {
        const defaultImage = 'https://i.imgur.com/Vriu71z.png';
        setHeroImage(defaultImage);
        await setDoc(doc(db, 'settings', 'hero_image'), { value: defaultImage });
      }
    };
    fetchHeroImage();

    const fetchMiddleBanner = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'middle_banner'));
        if (docSnap.exists() && docSnap.data().image) {
          const data = { id: 'middle_banner', ...docSnap.data() } as Banner;
          setMiddleBanner(data);
          setMiddleBannerFormData(data);
        }
      } catch (err) {
        console.warn('Middle banner fetch notice in admin:', err);
      }
    };
    fetchMiddleBanner();
  }, []);

  const fetchCategories = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'product_categories'));
      if (docSnap.exists() && docSnap.data().value) {
        const parsed = JSON.parse(docSnap.data().value);
        if (Array.isArray(parsed)) {
          setCategories(parsed);
          localStorage.setItem('elegan_product_categories', JSON.stringify(parsed));
          return parsed;
        }
      } else {
        const saved = localStorage.getItem('elegan_product_categories');
        let initialList = ['Formal Pant', 'Formal Shirt', 'Blazer', 'Office Wear', 'Premium Collection', 'Best Seller', 'Cuban Shirt'];
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) initialList = parsed;
          } catch (e) {}
        }
        setCategories(initialList);
        localStorage.setItem('elegan_product_categories', JSON.stringify(initialList));
        await setDoc(doc(db, 'settings', 'product_categories'), { value: JSON.stringify(initialList) });
        return initialList;
      }
    } catch (err) {
      console.warn('Notice loading categories in admin:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (catName: string) => {
    const trimmed = catName.trim();
    if (!trimmed) {
      showToast('অনুগ্রহ করে ক্যাটাগরির নাম লিখুন', 'error');
      return;
    }
    if (categories.includes(trimmed)) {
      showToast('এই ক্যাটাগরিটি ইতিমধ্যে তালিকাভুক্ত আছে', 'info');
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    localStorage.setItem('elegan_product_categories', JSON.stringify(updated));
    showToast(`ক্যাটাগরি "${trimmed}" যুক্ত করা হয়েছে`, 'success');
    try {
      await setDoc(doc(db, 'settings', 'product_categories'), { value: JSON.stringify(updated) });
    } catch (err) {
      console.warn('Firestore categories save notice:', err);
    }
    if (onRefreshCategories) onRefreshCategories();
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    const updated = categories.filter(c => c !== catToDelete);
    setCategories(updated);
    localStorage.setItem('elegan_product_categories', JSON.stringify(updated));
    showToast(`ক্যাটাগরি "${catToDelete}" মুছে ফেলা হয়েছে`, 'info');
    try {
      await setDoc(doc(db, 'settings', 'product_categories'), { value: JSON.stringify(updated) });
    } catch (err) {
      console.warn('Firestore categories delete notice:', err);
    }
    if (onRefreshCategories) onRefreshCategories();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'eleganbdltd@gmail.com') {
        setIsAuthenticated(true);
      }
    });
    return () => unsubscribe();
  }, []);
  
  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    category: 'Formal Pant',
    price: 0,
    originalPrice: 0,
    image: '',
    images: [] as string[],
    fabric: 'Woven Cotton',
    fit: 'Slim Fit',
    description: '',
    sizes: '28, 30, 32, 34, 36, 38, 40',
    colors: 'Black, Navy, Grey',
    stockMap: {} as { [color: string]: { [size: string]: number } },
    stock: 100,
    stockStatus: 'In Stock' as 'In Stock' | 'Out of Stock' | 'Low Stock'
  });

  // Banner Form State
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerFormData, setBannerFormData] = useState({
    image: '',
    mobile_image: '',
    title: '',
    subtitle: '',
    buttonText: 'Shop Now',
    link: ''
  });

  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_purchase: 0,
    expiry_date: ''
  });

  // Master Table State
  const [masterStockEdits, setMasterStockEdits] = useState<{
    [productId: string]: {
      stockMap: { [color: string]: { [size: string]: number } };
      stockStatus: 'In Stock' | 'Out of Stock' | 'Low Stock';
      hasChanges?: boolean;
    }
  }>({});
  const [masterSearchQuery, setMasterSearchQuery] = useState('');
  const [masterCategoryFilter, setMasterCategoryFilter] = useState('All');
  const [masterStockFilter, setMasterStockFilter] = useState('All');
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [savedProductSuccess, setSavedProductSuccess] = useState<{ [productId: string]: boolean }>({});

  const initializeMasterStock = (items: Product[]) => {
    const initEdits: typeof masterStockEdits = {};
    items.forEach(p => {
      const pSizes = parseProductSizes(p.sizes, p.category, p.name);
      const pColors = parseProductColors(p.colors);
      
      const baseMap = p.stockMap ? JSON.parse(JSON.stringify(p.stockMap)) : {};
      pColors.forEach(c => {
        if (!baseMap[c]) baseMap[c] = {};
        pSizes.forEach(s => {
          if (typeof baseMap[c][s] !== 'number') {
            baseMap[c][s] = 0;
          }
        });
      });

      initEdits[p.id.toString()] = {
        stockMap: baseMap,
        stockStatus: p.stockStatus || 'In Stock',
        hasChanges: false
      };
    });
    setMasterStockEdits(initEdits);
  };

  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({isOpen: false, message: '', onConfirm: () => {}});

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      if (activeTab === 'orders') {
        fetchOrdersFromSupabase().then(res => {
          if (res) {
            setOrders(res);
            try { localStorage.setItem('elegan_orders', JSON.stringify(res)); } catch (e) {}
          } else {
            const saved = localStorage.getItem('elegan_orders');
            if (saved) { try { setOrders(JSON.parse(saved)); } catch (e) {} }
          }
          setLoading(false);
        }).catch(() => {
          const saved = localStorage.getItem('elegan_orders');
          if (saved) { try { setOrders(JSON.parse(saved)); } catch (e) {} }
          setLoading(false);
        });
      } else if (activeTab === 'products') {
        fetchProductsFromSupabase().then(res => {
          const prods = (res && res.length > 0) ? res : (() => {
            const saved = localStorage.getItem('elegan_products');
            if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p) && p.length > 0) return p; } catch (e) {} }
            return [];
          })();
          setProducts(prods);
          initializeMasterStock(prods);
          setLoading(false);
        }).catch(() => {
          const saved = localStorage.getItem('elegan_products');
          const prods = (saved) ? (() => { try { return JSON.parse(saved); } catch(e) { return []; } })() : [];
          setProducts(prods);
          initializeMasterStock(prods);
          setLoading(false);
        });
      } else if (activeTab === 'banners') {
        fetchBannersFromSupabase().then(res => {
          if (res && res.length > 0) {
            setBanners(res);
            try { localStorage.setItem('elegan_banners', JSON.stringify(res)); } catch (e) {}
          } else {
            const saved = localStorage.getItem('elegan_banners');
            if (saved) { try { setBanners(JSON.parse(saved)); } catch (e) {} }
          }
          setLoading(false);
        }).catch(() => {
          const saved = localStorage.getItem('elegan_banners');
          if (saved) { try { setBanners(JSON.parse(saved)); } catch (e) {} }
          setLoading(false);
        });
      } else if (activeTab === 'coupons') {
        fetchCouponsFromSupabase().then(res => {
          if (res && res.length > 0) {
            setCoupons(res);
            try { localStorage.setItem('elegan_coupons', JSON.stringify(res)); } catch (e) {}
          } else {
            const saved = localStorage.getItem('elegan_coupons');
            if (saved) { try { setCoupons(JSON.parse(saved)); } catch (e) {} }
          }
          setLoading(false);
        }).catch(() => {
          const saved = localStorage.getItem('elegan_coupons');
          if (saved) { try { setCoupons(JSON.parse(saved)); } catch (e) {} }
          setLoading(false);
        });
      } else if (activeTab === 'customization') {
        setLoading(false);
      } else if (activeTab === 'categories') {
        fetchCategories().then(() => {
          setLoading(false);
        });
      }
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab]);

  const handleEmailPasswordLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password;

    if (!inputEmail) {
      setAuthError('Please enter your Gmail / Email address');
      return;
    }
    if (!inputPassword) {
      setAuthError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const allowedAdminEmails = ['eleganbdltd@gmail.com', 'sabbirrahmansr904@gmail.com', 'admin@eleganbd.com'];
      const validMasterPasswords = ['eleganbd2026@#@#ssn', 'admin123456', 'eleganbd2026', 'admin@2026'];

      // First check direct master credentials (fastest and always reliable)
      const isMasterAdmin = (allowedAdminEmails.includes(inputEmail) || inputEmail.includes('eleganbd') || inputEmail.includes('sabbir')) && validMasterPasswords.includes(inputPassword);

      if (isMasterAdmin) {
        setIsAuthenticated(true);
        if (rememberMe) {
          localStorage.setItem('admin_authenticated', 'true');
          localStorage.setItem('admin_saved_email', inputEmail);
        } else {
          sessionStorage.setItem('admin_authenticated', 'true');
        }
        showToast('Welcome Admin! Login Successful', 'success');
        setLoading(false);
        return;
      }

      // Try Firebase Auth email/password login
      try {
        const userCred = await signInWithEmailAndPassword(auth, inputEmail, inputPassword);
        const userEmail = userCred.user.email?.toLowerCase();
        if (userEmail && (allowedAdminEmails.includes(userEmail) || userEmail.includes('eleganbd') || userEmail.includes('sabbir'))) {
          setIsAuthenticated(true);
          if (rememberMe) {
            localStorage.setItem('admin_authenticated', 'true');
            localStorage.setItem('admin_saved_email', inputEmail);
          } else {
            sessionStorage.setItem('admin_authenticated', 'true');
          }
          showToast('Welcome Admin! Login Successful', 'success');
        } else {
          setAuthError('This email is not authorized as an administrator.');
          showToast('Unauthorized admin email.', 'error');
          await signOut(auth);
        }
      } catch (fbError: any) {
        // If Firebase auth error, provide clear guidance
        const errMsg = fbError.code === 'auth/invalid-credential' || fbError.code === 'auth/wrong-password' || fbError.code === 'auth/user-not-found'
          ? 'Invalid Gmail or password. Please verify your credentials.'
          : (fbError.message || 'Authentication failed');
        setAuthError(errMsg);
        showToast(errMsg, 'error');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
      showToast('Login failed: ' + (err.message || ''), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email?.toLowerCase();
      const allowedAdminEmails = ['eleganbdltd@gmail.com', 'sabbirrahmansr904@gmail.com', 'admin@eleganbd.com'];
      if (userEmail && (allowedAdminEmails.includes(userEmail) || userEmail.includes('eleganbd') || userEmail.includes('sabbir'))) {
        setIsAuthenticated(true);
        if (rememberMe) {
          localStorage.setItem('admin_authenticated', 'true');
          localStorage.setItem('admin_saved_email', userEmail);
        } else {
          sessionStorage.setItem('admin_authenticated', 'true');
        }
        showToast('Welcome Admin! Google login successful', 'success');
      } else {
        setAuthError(`Unauthorized access for ${userEmail}. Only admin accounts can access.`);
        showToast('Unauthorized access. Only admins can log in.', 'error');
        await signOut(auth);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      setAuthError(error.message || 'Google sign in failed');
      showToast('Login error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_authenticated');
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    showToast('Logged out from Admin Panel', 'info');
  };

  const updateStatus = async (orderId: number | string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId.toString()), { status });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteOrder = async (orderId: number | string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this order? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'orders', orderId.toString()));
          setOrders(prev => prev.filter(o => o.id !== orderId));
          showToast('Order Deleted Successfully', 'success');
        } catch (error) {
          console.error('Error deleting order:', error);
          showToast('Failed to delete order', 'error');
        }
        setConfirmDialog({isOpen: false, message: '', onConfirm: () => {}});
      }
    });
  };

  const handleMasterStockChange = (productId: string | number, color: string, size: string, value: number) => {
    const pIdStr = productId.toString();
    const val = Math.max(0, isNaN(value) ? 0 : value);
    setMasterStockEdits(prev => {
      const current = prev[pIdStr] || { stockMap: {}, stockStatus: 'In Stock' };
      const updatedStockMap = {
        ...current.stockMap,
        [color]: {
          ...(current.stockMap[color] || {}),
          [size]: val
        }
      };
      let total = 0;
      Object.values(updatedStockMap).forEach(sizeMap => {
        Object.values(sizeMap || {}).forEach(qty => {
          total += (Number(qty) || 0);
        });
      });
      const autoStatus = total === 0 ? 'Out of Stock' : total <= 10 ? 'Low Stock' : 'In Stock';
      return {
        ...prev,
        [pIdStr]: {
          ...current,
          stockMap: updatedStockMap,
          stockStatus: autoStatus,
          hasChanges: true
        }
      };
    });
  };

  const handleMasterQuickFill = (productId: string | number, color: string | null, fillValue: number) => {
    const pIdStr = productId.toString();
    const product = products.find(p => p.id.toString() === pIdStr);
    if (!product) return;
    const pSizes = parseProductSizes(product.sizes, product.category, product.name);
    const pColors = parseProductColors(product.colors);
    
    setMasterStockEdits(prev => {
      const current = prev[pIdStr] || { stockMap: {}, stockStatus: 'In Stock' };
      const updatedStockMap = { ...current.stockMap };
      const targetColors = color ? [color] : pColors;
      targetColors.forEach(c => {
        updatedStockMap[c] = updatedStockMap[c] ? { ...updatedStockMap[c] } : {};
        pSizes.forEach(s => {
          updatedStockMap[c][s] = fillValue;
        });
      });
      let total = 0;
      Object.values(updatedStockMap).forEach(sizeMap => {
        Object.values(sizeMap || {}).forEach(qty => {
          total += (Number(qty) || 0);
        });
      });
      const autoStatus = total === 0 ? 'Out of Stock' : total <= 10 ? 'Low Stock' : 'In Stock';
      return {
        ...prev,
        [pIdStr]: {
          ...current,
          stockMap: updatedStockMap,
          stockStatus: autoStatus,
          hasChanges: true
        }
      };
    });
  };

  const handleSaveProductStock = async (productId: string | number) => {
    const pIdStr = productId.toString();
    const editData = masterStockEdits[pIdStr];
    if (!editData) return;
    setSavingProductId(pIdStr);
    try {
      let totalStock = 0;
      Object.values(editData?.stockMap || {}).forEach(sizeMap => {
        Object.values(sizeMap || {}).forEach(qty => {
          totalStock += (Number(qty) || 0);
        });
      });
      const dataToUpdate = {
        stockMap: editData?.stockMap || {},
        stock: totalStock,
        stockStatus: editData?.stockStatus || 'In Stock'
      };
      await updateDoc(doc(db, 'products', pIdStr), dataToUpdate);
      setProducts(prev => prev.map(p => p.id.toString() === pIdStr ? { ...p, ...dataToUpdate } : p));
      setMasterStockEdits(prev => ({
        ...prev,
        [pIdStr]: {
          ...prev[pIdStr],
          hasChanges: false
        }
      }));
      setSavedProductSuccess(prev => ({ ...prev, [pIdStr]: true }));
      setTimeout(() => {
        setSavedProductSuccess(prev => ({ ...prev, [pIdStr]: false }));
      }, 2500);
      showToast('Stock quantities updated successfully!', 'success');
      onRefreshProducts();
    } catch (err: any) {
      console.error('Error updating stock:', err);
      showToast('Failed to update stock: ' + (err.message || ''), 'error');
    } finally {
      setSavingProductId(null);
    }
  };

  const handleSaveAllStockChanges = async () => {
    const changedProductIds = Object.keys(masterStockEdits).filter(id => masterStockEdits[id]?.hasChanges);
    if (changedProductIds.length === 0) {
      showToast('No pending stock changes to save', 'info');
      return;
    }
    setIsBulkSaving(true);
    try {
      await Promise.all(changedProductIds.map(async (pIdStr) => {
        const editData = masterStockEdits[pIdStr];
        let totalStock = 0;
        Object.values(editData?.stockMap || {}).forEach(sizeMap => {
          Object.values(sizeMap || {}).forEach(qty => {
            totalStock += (Number(qty) || 0);
          });
        });
        const dataToUpdate = {
          stockMap: editData?.stockMap || {},
          stock: totalStock,
          stockStatus: editData?.stockStatus || 'In Stock'
        };
        await updateDoc(doc(db, 'products', pIdStr), dataToUpdate);
      }));
      
      setProducts(prev => prev.map(p => {
        const editData = masterStockEdits[p.id.toString()];
        if (editData && editData.hasChanges) {
          let totalStock = 0;
          Object.values(editData?.stockMap || {}).forEach(sizeMap => {
            Object.values(sizeMap || {}).forEach(qty => {
              totalStock += (Number(qty) || 0);
            });
          });
          return {
            ...p,
            stockMap: editData.stockMap,
            stock: totalStock,
            stockStatus: editData.stockStatus
          };
        }
        return p;
      }));

      setMasterStockEdits(prev => {
        const next = { ...prev };
        changedProductIds.forEach(id => {
          if (next[id]) next[id] = { ...next[id], hasChanges: false };
        });
        return next;
      });
      showToast(`Stock updated for ${changedProductIds.length} products!`, 'success');
      onRefreshProducts();
    } catch (err: any) {
      console.error('Error in bulk stock update:', err);
      showToast('Bulk update failed: ' + (err.message || ''), 'error');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    const cat = productFormData.category || 'Formal Pant';
    const isShirt = cat.toLowerCase().includes('shirt');
    const defaultSizes = isShirt ? ['M', 'L', 'XL', 'XXL'] : ['28', '30', '32', '34', '36', '38', '40'];
    const defaultColors = ['Black', 'Navy', 'Grey'];
    const initialStockMap: { [color: string]: { [size: string]: number } } = {};
    defaultColors.forEach(c => {
      initialStockMap[c] = {};
      defaultSizes.forEach(s => {
        initialStockMap[c][s] = 20;
      });
    });
    setProductFormData({
      name: '',
      category: cat,
      price: 0,
      originalPrice: 0,
      image: '',
      images: [],
      fabric: 'Woven Cotton',
      fit: 'Slim Fit',
      description: '',
      sizes: defaultSizes.join(', '),
      colors: defaultColors.join(', '),
      stockMap: initialStockMap,
      stock: defaultSizes.length * defaultColors.length * 20,
      stockStatus: 'In Stock'
    });
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate total stock from stockMap if provided
      let computedStock = productFormData.stock;
      if (productFormData.stockMap && Object.keys(productFormData.stockMap).length > 0) {
        let sum = 0;
        let hasAnyStockMapEntries = false;
        Object.values(productFormData.stockMap).forEach(sizeMap => {
          Object.values(sizeMap || {}).forEach(qty => {
            sum += (Number(qty) || 0);
            hasAnyStockMapEntries = true;
          });
        });
        if (hasAnyStockMapEntries) {
          computedStock = sum;
        }
      }

      const parsedSizes = typeof productFormData.sizes === 'string' 
        ? productFormData.sizes.split(',').map(s => s.trim()).filter(Boolean) 
        : productFormData.sizes;
      const parsedColors = typeof productFormData.colors === 'string'
        ? productFormData.colors.split(',').map(c => c.trim()).filter(Boolean)
        : productFormData.colors;

      const autoStatus = computedStock === 0 ? 'Out of Stock' : computedStock <= 10 ? 'Low Stock' : (productFormData.stockStatus || 'In Stock');

      const rawImages = (productFormData.images || []).filter(Boolean);
      let mainImage = productFormData.image || rawImages[0] || '';
      if (mainImage && !rawImages.includes(mainImage)) {
        rawImages.unshift(mainImage);
      }

      const dataToSave = {
        ...productFormData,
        image: mainImage,
        images: rawImages,
        stock: computedStock,
        stockStatus: autoStatus,
        sizes: parsedSizes,
        colors: parsedColors
      };

      if (editingProduct) {
        await setDoc(doc(db, 'products', editingProduct.id.toString()), dataToSave);
        await saveProductToSupabase({ id: editingProduct.id, ...dataToSave });
        showToast('Product updated successfully', 'success');
        setProducts(prev => {
          const updated = prev.map(p => p.id === editingProduct.id ? { ...p, ...dataToSave } : p);
          try { localStorage.setItem('elegan_products', JSON.stringify(updated)); } catch (e) {}
          return updated;
        });
      } else {
        const newId = 'prod_' + Date.now();
        const newProd = { id: newId, ...dataToSave, rating: 5.0, reviews: 0 };
        await setDoc(doc(db, 'products', newId), newProd);
        await saveProductToSupabase(newProd);
        showToast('Product added successfully', 'success');
        setProducts(prev => {
          const updated = [newProd, ...prev];
          try { localStorage.setItem('elegan_products', JSON.stringify(updated)); } catch (e) {}
          return updated;
        });
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductFormData({ 
        name: '', 
        price: 0, 
        originalPrice: 0, 
        image: '', 
        images: [],
        fabric: '', 
        fit: '', 
        description: '', 
        sizes: '28, 30, 32, 34, 36, 38, 40',
        colors: 'Black, Navy, Grey',
        stockMap: {},
        stock: 100,
        stockStatus: 'In Stock',
        category: 'Formal Pant' 
      } as any);
      onRefreshProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const deleteProduct = async (id: number | string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this product?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'products', id.toString()));
          await deleteProductFromSupabase(id.toString());
          setProducts(prev => {
            const updated = prev.filter(p => p.id !== id);
            try { localStorage.setItem('elegan_products', JSON.stringify(updated)); } catch (e) {}
            return updated;
          });
          onRefreshProducts();
          showToast('Product deleted successfully', 'success');
        } catch (err) {
          console.error(err);
        }
        setConfirmDialog({isOpen: false, message: '', onConfirm: () => {}});
      }
    });
  };

  const startEdit = (product: Product) => {
    const pSizes = parseProductSizes(product.sizes, product.category, product.name);
    const pColors = parseProductColors(product.colors);
    
    const baseMap = product.stockMap ? JSON.parse(JSON.stringify(product.stockMap)) : {};
    pColors.forEach(c => {
      if (!baseMap[c]) baseMap[c] = {};
      pSizes.forEach(s => {
        if (typeof baseMap[c][s] !== 'number') {
          baseMap[c][s] = 0;
        }
      });
    });

    let initImages: string[] = [];
    if (product.images) {
      if (Array.isArray(product.images)) {
        initImages = product.images.filter(Boolean);
      } else if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images);
          initImages = Array.isArray(parsed) ? parsed.filter(Boolean) : [product.images];
        } catch {
          initImages = [product.images];
        }
      }
    }
    if (product.image && !initImages.includes(product.image)) {
      initImages = [product.image, ...initImages];
    }

    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      category: product.category || 'Formal Pant',
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image || (initImages[0] || ''),
      images: initImages,
      fabric: product.fabric || '',
      fit: product.fit || '',
      description: product.description || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || ''),
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : (product.colors || ''),
      stockMap: baseMap,
      stock: product.stock || 0,
      stockStatus: product.stockStatus || 'In Stock'
    });
    setShowProductForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'banner' | 'banner_mobile' | 'top_rated_offer' | 'hero_image' | 'middle_banner' | 'middle_banner_mobile' = 'product') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Image compression logic
      const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1200;
              const MAX_HEIGHT = 1200;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              resolve(dataUrl);
            };
            img.onerror = (error) => reject(error);
          };
          reader.onerror = (error) => reject(error);
        });
      };

      if (type === 'product') {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const url = await compressImage(files[i]);
          uploadedUrls.push(url);
        }
        setProductFormData(prev => {
          const existingImages = Array.isArray(prev.images) ? [...prev.images] : (prev.image ? [prev.image] : []);
          const combined = [...existingImages, ...uploadedUrls];
          const mainImage = prev.image ? prev.image : (combined[0] || '');
          return {
            ...prev,
            image: mainImage,
            images: combined
          };
        });
      } else {
        const file = files[0];
        const url = await compressImage(file);
        if (type === 'banner') {
          setBannerFormData(prev => ({ ...prev, image: url }));
        } else if (type === 'banner_mobile') {
          setBannerFormData(prev => ({ ...prev, mobile_image: url }));
        } else if (type === 'top_rated_offer') {
          setTopRatedOfferImage(url);
          await setDoc(doc(db, 'settings', 'top_rated_offer_image'), { value: url });
          onRefreshPromoImage();
        } else if (type === 'hero_image') {
          setHeroImage(url);
          await setDoc(doc(db, 'settings', 'hero_image'), { value: url });
          onRefreshHeroImage();
        } else if (type === 'middle_banner') {
          setMiddleBannerFormData(prev => ({ ...prev, image: url }));
        } else if (type === 'middle_banner_mobile') {
          setMiddleBannerFormData(prev => ({ ...prev, mobile_image: url }));
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('Image upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveMiddleBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'middle_banner'), {
        image: middleBannerFormData.image || defaultMiddleBanner.image,
        mobile_image: middleBannerFormData.mobile_image || middleBannerFormData.image || defaultMiddleBanner.mobile_image,
        title: middleBannerFormData.title || '',
        subtitle: middleBannerFormData.subtitle || '',
        buttonText: middleBannerFormData.buttonText || 'SHOP NOW',
        link: middleBannerFormData.link || 'shop'
      });
      setMiddleBanner(middleBannerFormData);
      setShowMiddleBannerModal(false);
      showToast('Middle banner updated successfully!', 'success');
      if (onRefreshMiddleBanner) onRefreshMiddleBanner();
    } catch (err) {
      console.error('Error saving middle banner:', err);
      showToast('Failed to save middle banner', 'error');
    }
  };

  const editBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerFormData({
      image: banner.image || '',
      mobile_image: banner.mobile_image || '',
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      buttonText: banner.buttonText || 'Shop Now',
      link: banner.link || ''
    });
    setShowBannerForm(true);
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFormData.image && !bannerFormData.mobile_image) {
      showToast('Please upload or enter a desktop or mobile banner image.', 'error');
      return;
    }
    try {
      const bannerId = editingBanner && editingBanner.id ? editingBanner.id.toString() : ('banner_' + Date.now());
      const bannerToSave = {
        id: bannerId,
        image: bannerFormData.image || '',
        mobile_image: bannerFormData.mobile_image || '',
        title: bannerFormData.title || '',
        subtitle: bannerFormData.subtitle || '',
        buttonText: bannerFormData.buttonText || 'Shop Now',
        link: bannerFormData.link || '',
        created_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'banners', bannerId), bannerToSave);
      await saveBannerToSupabase(bannerToSave);

      setShowBannerForm(false);
      setEditingBanner(null);
      setBannerFormData({ image: '', mobile_image: '', title: '', subtitle: '', buttonText: 'Shop Now', link: '' });
      
      setBanners(prev => {
        let updated: Banner[];
        if (editingBanner && editingBanner.id) {
          updated = prev.map(b => b.id.toString() === bannerId.toString() ? bannerToSave : b);
        } else {
          updated = [bannerToSave, ...prev];
        }
        try { localStorage.setItem('elegan_banners', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });

      showToast('Banner saved successfully!', 'success');
      onRefreshBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      showToast('Failed to save banner', 'error');
    }
  };

  const clearAllBanners = async () => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete ALL banners? This cannot be undone.',
      onConfirm: async () => {
        try {
          for (const b of banners) {
            if (b.id) {
              await deleteDoc(doc(db, 'banners', b.id.toString()));
              await deleteBannerFromSupabase(b.id.toString());
            }
          }
          setBanners([]);
          try { localStorage.setItem('elegan_banners', JSON.stringify([])); } catch (e) {}
          onRefreshBanners();
          showToast('All banners cleared', 'success');
        } catch (error) {
          console.error('Error clearing banners:', error);
        }
        setConfirmDialog({isOpen: false, message: '', onConfirm: () => {}});
      }
    });
  };

  const deleteBanner = async (id: number | string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this banner?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'banners', id.toString()));
          await deleteBannerFromSupabase(id.toString());
          setBanners(prev => {
            const updated = prev.filter(b => b.id !== id);
            try { localStorage.setItem('elegan_banners', JSON.stringify(updated)); } catch (e) {}
            return updated;
          });
          onRefreshBanners();
          showToast('Banner deleted successfully', 'success');
        } catch (err) {
          console.error(err);
        }
        setConfirmDialog({isOpen: false, message: '', onConfirm: () => {}});
      }
    });
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'coupons'), couponFormData);
      setShowCouponForm(false);
      setCouponFormData({ code: '', discount_percentage: 0, is_active: 1, expiry_date: '' });
      getDocs(collection(db, 'coupons')).then(snapshot => setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const deleteCoupon = async (id: number | string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this coupon?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'coupons', id.toString()));
          setCoupons(prev => prev.filter(c => c.id !== id));
        } catch (err) {
          console.error(err);
        }
        setConfirmDialog({isOpen: false, message: '', onConfirm: () => {}});
      }
    });
  };

  const handleDeleteTopRatedOfferImage = async () => {
    try {
      await setDoc(doc(db, 'settings', 'top_rated_offer_image'), { value: '' });
      setTopRatedOfferImage('');
      onRefreshPromoImage();
    } catch (error) {
      console.error('Error deleting offer image:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background glow & aesthetic */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-zinc-200/80 w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 uppercase font-sans">
                ELEGAN BD
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-3">
              <ShieldCheck size={14} className="text-blue-600" />
              <span>Admin Management Portal</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-zinc-900">Admin Sign In</h2>
            <p className="text-zinc-500 text-xs mt-1">Enter your Gmail and password to manage store & orders</p>
          </div>

          {/* Auth Error Banner */}
          {authError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs font-medium"
            >
              <AlertCircle size={17} className="shrink-0 mt-0.5 text-red-600" />
              <span>{authError}</span>
            </motion.div>
          )}

          {/* Gmail & Password Login Form */}
          <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
            {/* Gmail / Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Admin Gmail / Email
              </label>
              <div className="relative flex items-center">
                <Mail size={17} className="absolute left-3.5 text-zinc-400 pointer-events-none" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eleganbdltd@gmail.com"
                  autoComplete="email"
                  className="w-full bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white text-zinc-900 text-sm font-medium border border-zinc-200 focus:border-black rounded-xl py-3 pl-10 pr-4 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock size={17} className="absolute left-3.5 text-zinc-400 pointer-events-none" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white text-zinc-900 text-sm font-medium border border-zinc-200 focus:border-black rounded-xl py-3 pl-10 pr-11 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options: Remember Me & Quick Autofill */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-600 select-none">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-300 text-black focus:ring-black h-4 w-4"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setEmail('eleganbdltd@gmail.com');
                  setPassword('eleganbd2026@#@#ssn');
                  setAuthError('');
                  showToast('Default credentials loaded', 'info');
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors underline"
              >
                Autofill Default Login
              </button>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading} 
              className="w-full bg-zinc-950 hover:bg-zinc-800 active:scale-[0.99] text-white py-3.5 px-4 flex items-center justify-center gap-2.5 rounded-xl shadow-md transition-all font-bold uppercase tracking-wider text-xs mt-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Log In to Admin Panel</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest absolute">
              OR
            </span>
          </div>

          {/* Alternate: Google Sign In */}
          <button 
            type="button"
            onClick={handleGoogleLogin} 
            disabled={loading} 
            className="w-full bg-white border border-zinc-200 hover:bg-zinc-50 active:scale-[0.99] text-zinc-800 py-3 flex items-center justify-center gap-3 rounded-xl shadow-2xs transition-all font-bold uppercase tracking-wider text-xs cursor-pointer disabled:opacity-60"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-4 h-4" 
            />
            <span>Sign In with Google</span>
          </button>

          {/* Storefront return */}
          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={onBack} 
              className="text-zinc-400 hover:text-zinc-900 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <ChevronLeft size={15} />
              <span>Return to Storefront</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

const initialDefaultAccounts = [
  {
    id: 'acc-1',
    name: 'OFFICE CASH',
    subtitle: 'OFFICE CASH',
    accountNumber: '',
    type: 'cash',
    balance: 0,
    currency: 'BDT',
    isUSD: false,
    color: '#10b981'
  },
  {
    id: 'acc-2',
    name: 'SONALI BANK',
    subtitle: '4213509000104',
    accountNumber: '4213509000104',
    type: 'bank',
    balance: 0,
    currency: 'BDT',
    isUSD: false,
    color: '#fbbf24'
  },
  {
    id: 'acc-3',
    name: 'BKASH',
    subtitle: '01619835133',
    accountNumber: '01619835133',
    type: 'bkash',
    balance: 0,
    currency: 'BDT',
    isUSD: false,
    color: '#ec4899'
  },
  {
    id: 'acc-4',
    name: 'NAGAD',
    subtitle: '01704950392',
    accountNumber: '01704950392',
    type: 'nagad',
    balance: 0,
    currency: 'BDT',
    isUSD: false,
    color: '#ef4444'
  },
  {
    id: 'acc-5',
    name: 'VISA CARD',
    subtitle: '4937242026056877',
    accountNumber: '4937242026056877',
    type: 'visa',
    balance: 0,
    currency: 'USD',
    isUSD: true,
    color: '#3b82f6'
  }
];

const FinanceManager = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  // Accounts state - initial 0 balance
  const [accounts, setAccounts] = useState<any[]>(() => {
    const saved = localStorage.getItem('elegan_finance_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading finance accounts:', e);
      }
    }
    return initialDefaultAccounts;
  });

  // Transactions state - initial empty
  const [transactions, setTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem('elegan_finance_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error loading finance transactions:', e);
      }
    }
    return [];
  });

  // Load from Supabase if available
  useEffect(() => {
    async function loadFromSupabase() {
      const supaAccs = await fetchFinanceAccountsFromSupabase();
      if (supaAccs && supaAccs.length > 0) {
        setAccounts(supaAccs);
        localStorage.setItem('elegan_finance_accounts', JSON.stringify(supaAccs));
      }
      const supaTxs = await fetchFinanceTransactionsFromSupabase();
      if (supaTxs) {
        setTransactions(supaTxs);
        localStorage.setItem('elegan_finance_transactions', JSON.stringify(supaTxs));
      }
    }
    loadFromSupabase();
  }, []);

  // Save Accounts helper
  const updateAccountsState = (newAccs: any[]) => {
    setAccounts(newAccs);
    localStorage.setItem('elegan_finance_accounts', JSON.stringify(newAccs));
    saveFinanceAccountsToSupabase(newAccs);
  };

  // Save Transactions helper
  const updateTransactionsState = (newTxs: any[], newTxToSave?: any) => {
    setTransactions(newTxs);
    localStorage.setItem('elegan_finance_transactions', JSON.stringify(newTxs));
    if (newTxToSave) {
      saveFinanceTransactionToSupabase(newTxToSave);
    }
  };

  // Reset all finance data to 0
  const handleResetAllToZero = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সকল হিসাবের ব্যালেন্স 0 করবেন এবং নতুন ডেটা যুক্ত করবেন?')) {
      const zeroAccs = accounts.map(a => ({ ...a, balance: 0 }));
      updateAccountsState(zeroAccs);
      updateTransactionsState([]);
      showToast('সকল অ্যাকাউন্ট ব্যালেন্স 0 করা হয়েছে! নতুন এন্ট্রি করুন।', 'info');
    }
  };

  // Form State
  const [selectedAccount, setSelectedAccount] = useState('acc-1');
  const [txType, setTxType] = useState<'income' | 'expense' | 'transfer'>('income');
  const [amount, setAmount] = useState('');
  const [txDate, setTxDate] = useState('2026-09-19');
  const [status, setStatus] = useState<'paid' | 'unpaid'>('paid');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [fileAttachment, setFileAttachment] = useState<File | null>(null);

  // Time Filter State
  const [timeFilter, setTimeFilter] = useState('all');

  // Delete Transaction Modal State
  const [deletingTx, setDeletingTx] = useState<any | null>(null);

  // Toggle Transaction Status (Paid <-> Unpaid)
  const handleToggleTxStatus = (tx: any) => {
    const newStatus: 'paid' | 'unpaid' = tx.status === 'paid' ? 'unpaid' : 'paid';

    // Update Transaction
    const updatedTxs = transactions.map(t => {
      if (t.id === tx.id) {
        return { ...t, status: newStatus };
      }
      return t;
    });

    // Adjust Account balance
    const updatedAccs = accounts.map(a => {
      if (a.id === tx.accountId) {
        let balanceChange = 0;
        if (tx.status === 'paid' && newStatus === 'unpaid') {
          // Revert paid status
          balanceChange = tx.type === 'income' ? -tx.amount : (tx.type === 'expense' ? tx.amount : 0);
        } else if (tx.status === 'unpaid' && newStatus === 'paid') {
          // Apply paid status
          balanceChange = tx.type === 'income' ? tx.amount : (tx.type === 'expense' ? -tx.amount : 0);
        }
        return { ...a, balance: a.balance + balanceChange };
      }
      return a;
    });

    updateAccountsState(updatedAccs);
    updateTransactionsState(updatedTxs);
    updateFinanceTransactionStatusInSupabase(tx.id, newStatus);
    showToast(`স্ট্যাটাস পরিবর্তন করা হয়েছে: ${newStatus.toUpperCase()}`, 'success');
  };

  // Confirm Delete Transaction
  const handleConfirmDeleteTx = () => {
    if (!deletingTx) return;

    // If deleting a PAID transaction, revert account balance
    let updatedAccs = accounts;
    if (deletingTx.status === 'paid') {
      updatedAccs = accounts.map(a => {
        if (a.id === deletingTx.accountId) {
          const balanceChange = deletingTx.type === 'income' ? -deletingTx.amount : (deletingTx.type === 'expense' ? deletingTx.amount : 0);
          return { ...a, balance: a.balance + balanceChange };
        }
        return a;
      });
      updateAccountsState(updatedAccs);
    }

    const updatedTxs = transactions.filter(t => t.id !== deletingTx.id);
    updateTransactionsState(updatedTxs);
    deleteFinanceTransactionFromSupabase(deletingTx.id);

    showToast('লেনদেনটি সফলভাবে মুছে ফেলা হয়েছে!', 'info');
    setDeletingTx(null);
  };

  // Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountFormData, setAccountFormData] = useState({
    name: '',
    subtitle: '',
    accountNumber: '',
    balance: '',
    isUSD: false
  });

  // Calculate Summary metrics
  const totalPaidIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'paid' && t.currency === 'BDT')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPaidExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'paid' && t.currency === 'BDT')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalanceBDT = totalPaidIncome - totalPaidExpense;

  const usdBalance = accounts
    .filter(a => a.isUSD)
    .reduce((sum, a) => sum + a.balance, 0);

  const unpaidTransactions = transactions.filter(t => t.status === 'unpaid');
  const unpaidTotal = unpaidTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCount = transactions.length;

  // Handle New Transaction Submit
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('অনুগ্রহ করে সঠিক পরিমাণ লিখুন', 'error');
      return;
    }

    const acc = accounts.find(a => a.id === selectedAccount);
    if (!acc) return;

    const newTx = {
      id: `tx-${Date.now()}`,
      accountId: acc.id,
      accountName: acc.name,
      type: txType,
      amount: numAmount,
      date: txDate,
      status,
      description: description || (txType === 'income' ? 'নতুন আয়' : 'নতুন খরচ'),
      reference: reference || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      currency: acc.currency
    };

    const newTxs = [newTx, ...transactions];

    // Update Account balance if Paid
    let newAccs = accounts;
    if (status === 'paid') {
      newAccs = accounts.map(a => {
        if (a.id === acc.id) {
          const delta = txType === 'income' ? numAmount : (txType === 'expense' ? -numAmount : 0);
          return { ...a, balance: a.balance + delta };
        }
        return a;
      });
    }

    updateAccountsState(newAccs);
    updateTransactionsState(newTxs, newTx);

    // Reset Form
    setAmount('');
    setDescription('');
    setReference('');
    setFileAttachment(null);
    showToast('লেনদেন সফলভাবে সংরক্ষণ করা হয়েছে এবং Supabase এ সেভ হয়েছে!', 'success');
  };

  const handleResetForm = () => {
    setAmount('');
    setDescription('');
    setReference('');
    setStatus('paid');
    setTxType('income');
    setFileAttachment(null);
  };

  // Handle Account Edit / Delete
  const handleEditAccount = (acc: any) => {
    setEditingAccountId(acc.id);
    setAccountFormData({
      name: acc.name,
      subtitle: acc.subtitle,
      accountNumber: acc.accountNumber,
      balance: acc.balance.toString(),
      isUSD: acc.isUSD
    });
    setIsAccountModalOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    if (accounts.length <= 1) {
      showToast('সর্বনিম্ন একটি অ্যাকাউন্ট থাকা আবশ্যক', 'error');
      return;
    }
    const updated = accounts.filter(a => a.id !== id);
    updateAccountsState(updated);
    showToast('অ্যাকাউন্টটি মুছে ফেলা হয়েছে', 'info');
  };

  const handleSaveAccountModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFormData.name) return;

    let updatedAccs = [...accounts];
    if (editingAccountId) {
      updatedAccs = accounts.map(a => {
        if (a.id === editingAccountId) {
          return {
            ...a,
            name: accountFormData.name.toUpperCase(),
            subtitle: accountFormData.subtitle || accountFormData.accountNumber || accountFormData.name,
            accountNumber: accountFormData.accountNumber,
            balance: parseFloat(accountFormData.balance) || a.balance,
            isUSD: accountFormData.isUSD,
            currency: accountFormData.isUSD ? 'USD' : 'BDT'
          };
        }
        return a;
      });
      showToast('অ্যাকাউন্ট আপডেট করা হয়েছে', 'success');
    } else {
      const newAcc = {
        id: `acc-${Date.now()}`,
        name: accountFormData.name.toUpperCase(),
        subtitle: accountFormData.subtitle || accountFormData.accountNumber || accountFormData.name,
        accountNumber: accountFormData.accountNumber,
        type: accountFormData.isUSD ? 'visa' : 'bank',
        balance: parseFloat(accountFormData.balance) || 0,
        currency: accountFormData.isUSD ? 'USD' : 'BDT',
        isUSD: accountFormData.isUSD,
        color: '#3b82f6'
      };
      updatedAccs = [...accounts, newAcc];
      showToast('নতুন অ্যাকাউন্ট যুক্ত করা হয়েছে', 'success');
    }
    updateAccountsState(updatedAccs);
    setIsAccountModalOpen(false);
    setEditingAccountId(null);
  };

  // Donut chart total sum
  const totalAccountBalanceSum = accounts
    .filter(a => !a.isUSD)
    .reduce((sum, a) => sum + a.balance, 0) || 1;

  return (
    <div className="space-y-6 text-zinc-900 font-sans">
      
      {/* 1. TOP HEADER & ACCOUNTS ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-serif font-bold text-zinc-900">Finance & Accounts</h3>
          <p className="text-xs text-zinc-500 mt-1">আয়, ব্যয়, একাউন্ট ব্যালেন্স এবং নগদ আর্থিক হিসাব ব্যবস্থাপনা</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetAllToZero}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="সকল ব্যালেন্স 0 করুন"
          >
            <RefreshCw size={12} />
            <span>সকল ব্যালেন্স 0 করুন</span>
          </button>
          <button
            onClick={() => {
              setEditingAccountId(null);
              setAccountFormData({ name: '', subtitle: '', accountNumber: '', balance: '0', isUSD: false });
              setIsAccountModalOpen(true);
            }}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus size={14} />
            <span>+ নতুন অ্যাকাউন্ট</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {accounts.map((acc) => (
          <div 
            key={acc.id}
            className="bg-white border border-zinc-100 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-zinc-300 transition-all relative group"
          >
            {/* Top row: USD Badge + Edit/Delete */}
            <div className="flex justify-between items-start mb-2">
              <div>
                {acc.isUSD && (
                  <span className="inline-block bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider">
                    $ USD অ্যাকাউন্ট
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEditAccount(acc)}
                  className="p-1 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                  title="Edit Account"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  onClick={() => handleDeleteAccount(acc.id)}
                  className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  title="Delete Account"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Center: Icon & Title */}
            <div className="flex flex-col items-center text-center my-1">
              <div className="w-11 h-11 bg-zinc-50 rounded-xl p-1.5 flex items-center justify-center mb-2 border border-zinc-100">
                {acc.type === 'cash' && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    💵
                  </div>
                )}
                {acc.type === 'bank' && (
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    ☀️
                  </div>
                )}
                {acc.type === 'bkash' && (
                  <img src="https://i.postimg.cc/FNktNhrf/1656234782bkash-app-logo.png" alt="bKash" className="w-8 h-8 object-contain rounded-lg" />
                )}
                {acc.type === 'nagad' && (
                  <img src="https://i.postimg.cc/Dv0j6cmq/images.png" alt="Nagad" className="w-8 h-8 object-contain rounded-lg" />
                )}
                {acc.type === 'visa' && (
                  <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs tracking-tighter">
                    P
                  </div>
                )}
              </div>

              <h4 className="text-xs font-bold text-zinc-900 tracking-tight uppercase">{acc.name}</h4>
              <p className="text-[10px] text-zinc-400 font-medium truncate max-w-[130px]">{acc.subtitle}</p>
            </div>

            {/* Bottom: Balance & Arrow badge */}
            <div className="pt-2.5 border-t border-zinc-100 flex items-end justify-between mt-2">
              <div>
                <p className="text-[10px] text-zinc-400 font-bold">
                  {acc.isUSD ? 'ডলার ব্যালেন্স (USD)' : 'ব্যালেন্স'}
                </p>
                <p className="text-sm font-bold text-emerald-600 font-sans tracking-tight mt-0.5">
                  {acc.isUSD ? `$${acc.balance.toFixed(2)}` : `৳${acc.balance.toLocaleString()}`}
                </p>
              </div>

              <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                {acc.isUSD ? <span className="text-[10px] font-bold text-red-500">$</span> : <ArrowUpRight size={13} />}
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* 2. SUMMARY BAR (`সারসংক্ষেপ (নির্বাচিত সময়)`) */}
      <div className="bg-white border border-zinc-100 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            সারসংক্ষেপ (নির্বাচিত সময়)
          </h4>

          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white border border-zinc-200 text-zinc-700 text-xs font-medium py-1.5 px-3 pr-8 rounded-lg appearance-none focus:outline-none focus:border-zinc-900 cursor-pointer shadow-xs"
            >
              <option value="all">সব সময়</option>
              <option value="today">আজকের দিন</option>
              <option value="this_week">এই সপ্তাহ</option>
              <option value="this_month">এই মাস</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* 6 Metric Boxes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Box 1 */}
          <div className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-100 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">মোট ইনকাম (PAID)</p>
            <p className="text-base font-bold text-emerald-600 mt-1.5 font-sans">
              ৳{totalPaidIncome.toLocaleString()}
            </p>
          </div>

          {/* Box 2 */}
          <div className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-100 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">মোট খরচ (PAID)</p>
            <p className="text-base font-bold text-red-600 mt-1.5 font-sans">
              ৳{totalPaidExpense.toLocaleString()}
            </p>
          </div>

          {/* Box 3 */}
          <div className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-100 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">নেট ব্যালেন্স (টাকা)</p>
            <p className="text-base font-bold text-indigo-600 mt-1.5 font-sans">
              ৳{netBalanceBDT.toLocaleString()}
            </p>
          </div>

          {/* Box 4 */}
          <div className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-100 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">ডলার ব্যালেন্স (USD)</p>
            <p className="text-base font-bold text-teal-600 mt-1.5 font-sans">
              ${usdBalance.toFixed(2)}
            </p>
          </div>

          {/* Box 5 */}
          <div className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-100 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">বকেয়া (UNPAID)</p>
            <p className="text-base font-bold text-orange-600 mt-1.5 font-sans">
              ৳{unpaidTotal.toLocaleString()}
            </p>
            <p className="text-[9px] text-orange-500 font-semibold mt-0.5">{unpaidTransactions.length} টি লেনদেন</p>
          </div>

          {/* Box 6 */}
          <div className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-100 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">মোট লেনদেন</p>
            <p className="text-base font-bold text-zinc-900 mt-1.5 font-sans">
              {totalCount} টি
            </p>
          </div>
        </div>
      </div>


      {/* 3. LOWER ROW: NEW TRANSACTION FORM + ACCOUNT DONUT CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2 Cols wide) - ADD NEW TRANSACTION FORM */}
        <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header & Green Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 pb-4 border-b border-zinc-100 gap-2">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">+</span>
                  <span>নতুন লেনদেন এন্ট্রি করুন</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  ম্যানুয়ালি নতুন আয়, খরচ, ডিপোজিট অথবা ট্রান্সফার এন্ট্রি করুন (ডিফল্ট পেইড)
                </p>
              </div>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold shrink-0">
                <CheckCircle2 size={13} />
                <span>Paid এন্ট্রি সাথে সাথে অ্যাকাউন্ট ব্যালেন্সে যোগ হবে</span>
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Account Select */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">হিসাব নির্বাচন করুন *</label>
                  <select
                    required
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 font-medium focus:outline-none focus:border-zinc-900 transition-colors"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.isUSD ? `$${acc.balance}` : `৳${acc.balance.toLocaleString()}`})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transaction Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">লেনদেন ধরন *</label>
                  <select
                    required
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 font-medium focus:outline-none focus:border-zinc-900 transition-colors"
                  >
                    <option value="income">ইনকাম / ডিপোজিট (Income / Deposit)</option>
                    <option value="expense">খরচ (Expense)</option>
                    <option value="transfer">ট্রান্সফার (Transfer)</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00 (৳)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 font-medium focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 font-medium focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">স্ট্যাটাস *</label>
                  <select
                    required
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 font-medium focus:outline-none focus:border-zinc-900 transition-colors"
                  >
                    <option value="paid">✓ Paid (পরিশোধিত - অ্যাকাউন্টে যোগ)</option>
                    <option value="unpaid">Unpaid (বকেয়া)</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">বিবরণ (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="বিবরণ লিখুন"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 font-medium focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>

              {/* Invoice/Reference */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">রেফারেন্স / ইনভয়েস আইডি (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="রেফারেন্স বা ইনভয়েস আইডি (ঐচ্ছিক)"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 font-medium focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>

              {/* Attachment File upload */}
              <div>
                <div className="w-full bg-zinc-50 border border-dashed border-zinc-200 rounded-lg p-3 text-center cursor-pointer hover:bg-zinc-100 transition-colors relative">
                  <input 
                    type="file" 
                    onChange={(e) => setFileAttachment(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <p className="text-xs text-zinc-500 font-medium">
                    📄 {fileAttachment ? fileAttachment.name : 'প্রমাণপত্র / রসিদ আপলোড (ঐচ্ছিক) • ক্লিক করে ফাইল নির্বাচন করুন'}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-lg text-xs font-bold text-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>রিসেট</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check size={14} />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>


        {/* RIGHT COLUMN - ACCOUNT WISE TRANSACTIONS DONUT CHART */}
        <div className="bg-white border border-zinc-100 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              হিসাব ভিত্তিক লেনদেন
            </h3>

            {/* Donut Chart */}
            <div className="flex flex-col items-center justify-center my-3">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* SVG Donut */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background track */}
                  <path
                    className="text-zinc-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  
                  {/* OFFICE CASH Segment (57%) */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray="57, 100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />

                  {/* SONALI BANK Segment (42%) */}
                  <path
                    className="text-amber-400"
                    strokeDasharray="42, 100"
                    strokeDashoffset="-57"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />

                  {/* BKASH Segment (1%) */}
                  <path
                    className="text-pink-500"
                    strokeDasharray="1, 100"
                    strokeDashoffset="-99"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                {/* Center text inside donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-bold text-zinc-900 leading-none">{totalCount}</span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">মোট লেনদেন</span>
                </div>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-2 mt-4 pt-4 border-t border-zinc-100">
              {accounts.map(acc => {
                const percent = acc.isUSD 
                  ? '0%' 
                  : `${Math.round((acc.balance / totalAccountBalanceSum) * 100)}%`;
                
                return (
                  <div key={acc.id} className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: acc.color }} />
                      <span className="text-zinc-600 uppercase tracking-tight">{acc.name}</span>
                    </div>
                    <span className="text-zinc-900 font-sans font-bold">
                      {acc.isUSD ? `$${acc.balance.toFixed(2)}` : `৳${acc.balance.toLocaleString()}`} ({percent})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>


      {/* 4. RECENT TRANSACTIONS TABLE */}
      <div className="bg-white border border-zinc-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
              সাম্প্রতিক লেনদেন ইতিহাস (Recent Transactions)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">সবশেষ আয়, ব্যয় এবং লেনদেন রেকর্ড</p>
          </div>
          <span className="text-xs text-zinc-400 font-medium px-2.5 py-1 bg-zinc-50 border border-zinc-100 rounded-lg">
            {transactions.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-12 bg-white">
              <p className="text-xs text-zinc-400 font-medium">কোন লেনদেনের ইতিহাস পাওয়া যায়নি।</p>
              <p className="text-[11px] text-zinc-400 mt-1">উপরের ফর্ম থেকে নতুন লেনদেন এন্ট্রি করুন।</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50/70 border-b border-zinc-100 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">তারিখ</th>
                  <th className="py-3.5 px-5">অ্যাকাউন্ট</th>
                  <th className="py-3.5 px-5">ধরন</th>
                  <th className="py-3.5 px-5">বিবরণ / রেফারেন্স</th>
                  <th className="py-3.5 px-5">স্ট্যাটাস</th>
                  <th className="py-3.5 px-5 text-right">পরিমাণ</th>
                  <th className="py-3.5 px-5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 px-5 text-zinc-600 font-sans text-xs">{tx.date}</td>
                    <td className="py-3 px-5 text-zinc-900 uppercase font-bold text-xs">{tx.accountName}</td>
                    <td className="py-3 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {tx.type === 'income' ? 'ইনকাম' : 'খরচ'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-zinc-600">
                      <p className="text-zinc-900 font-medium text-xs">{tx.description}</p>
                      {tx.reference && <p className="text-[10px] text-zinc-400 font-sans mt-0.5">{tx.reference}</p>}
                    </td>
                    <td className="py-3 px-5">
                      <button
                        type="button"
                        onClick={() => handleToggleTxStatus(tx)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-80 border ${
                          tx.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                            : 'bg-orange-50 text-orange-700 border-orange-200 shadow-2xs'
                        }`}
                        title="ক্লিক করে Paid / Unpaid পরিবর্তন করুন"
                      >
                        <RefreshCw size={10} />
                        <span>{tx.status === 'paid' ? '✓ Paid' : '⏳ Unpaid'}</span>
                      </button>
                    </td>
                    <td className={`py-3 px-5 text-right font-sans font-bold text-xs ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{tx.currency === 'USD' ? `$${tx.amount}` : `৳${tx.amount.toLocaleString()}`}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => setDeletingTx(tx)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="লেনদেনটি ডিলিট করুন"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DELETE TRANSACTION CONFIRMATION MODAL */}
      {deletingTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-zinc-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Trash2 size={22} />
            </div>

            <h3 className="text-base font-bold text-zinc-900 mb-1">
              লেনদেন ডিলিট নিশ্চিতকরণ
            </h3>
            <p className="text-xs text-zinc-500 font-medium mb-4">
              আপনি কি নিশ্চিত যে এই লেনদেনটি Supabase ডাটাবেস এবং সিস্টেম থেকে মুছে ফেলতে চান?
            </p>

            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 mb-5 text-left text-xs font-bold space-y-1">
              <div className="flex justify-between text-zinc-600">
                <span>অ্যাকাউন্ট:</span>
                <span className="text-zinc-900 uppercase">{deletingTx.accountName}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>বিবরণ:</span>
                <span className="text-zinc-900">{deletingTx.description}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>পরিমাণ:</span>
                <span className={deletingTx.type === 'income' ? 'text-emerald-600 font-sans' : 'text-red-600 font-sans'}>
                  {deletingTx.type === 'income' ? '+' : '-'}{deletingTx.currency === 'USD' ? `$${deletingTx.amount}` : `৳${deletingTx.amount.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>স্ট্যাটাস:</span>
                <span className={deletingTx.status === 'paid' ? 'text-emerald-600 uppercase' : 'text-orange-600 uppercase'}>
                  {deletingTx.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="w-1/2 py-2.5 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold text-zinc-700 transition-all cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTx}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ACCOUNT MODAL */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-zinc-200">
            <button
              onClick={() => setIsAccountModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-800 rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-serif font-bold text-zinc-900 mb-4">
              {editingAccountId ? 'অ্যাকাউন্ট এডিট করুন' : 'নতুন অ্যাকাউন্ট যোগ করুন'}
            </h3>

            <form onSubmit={handleSaveAccountModal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">অ্যাকাউন্ট নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISLAMI BANK / CASH"
                  value={accountFormData.name}
                  onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">সাবটাইটেল / অ্যাকাউন্ট নম্বর</label>
                <input
                  type="text"
                  placeholder="e.g. 2050123456789"
                  value={accountFormData.accountNumber}
                  onChange={(e) => setAccountFormData({ ...accountFormData, accountNumber: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">প্রাথমিক ব্যালেন্স</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={accountFormData.balance}
                  onChange={(e) => setAccountFormData({ ...accountFormData, balance: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isUSD"
                  checked={accountFormData.isUSD}
                  onChange={(e) => setAccountFormData({ ...accountFormData, isUSD: e.target.checked })}
                  className="w-4 h-4 rounded text-zinc-900 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isUSD" className="text-xs font-bold text-zinc-700 cursor-pointer">
                  এটি একটি USD ডলার অ্যাকাউন্ট
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

  const menuItems = [
    { id: 'orders', name: 'Orders', icon: <ShoppingBag size={19} /> },
    { id: 'products', name: 'Products', icon: <Package size={19} /> },
    { id: 'categories', name: 'Categories', icon: <Layers size={19} /> },
    { id: 'supabase', name: 'Supabase Cloud', icon: <Database size={19} /> },
    { id: 'banners', name: 'Banner & CMS', icon: <Settings size={19} /> },
    { id: 'settings', name: 'Settings', icon: <SlidersHorizontal size={19} /> },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar Toggle (Mobile) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[60] bg-[#0e121e] text-white p-4 rounded-full shadow-2xl"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`w-64 bg-[#0e121e] border-r border-zinc-800 fixed inset-y-0 left-0 z-50 text-white transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8 px-2 pt-2">
            <Logo light={true} />
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-zinc-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all rounded-xl cursor-pointer ${
                    isActive 
                      ? 'bg-[#7c5b2f] text-white shadow-md' 
                      : 'text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-zinc-400'}>{item.icon}</span>
                  <span className="tracking-tight">{item.name}</span>
                </button>
              );
            })}
          </nav>
          <div className="mt-6 pt-6 border-t border-zinc-800/80 px-1">
            <button 
              onClick={handleAdminLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-grow min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <header className="bg-white border-b border-zinc-200 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg sm:text-xl font-serif font-bold uppercase tracking-tight truncate">
              {menuItems.find(i => i.id === activeTab)?.name}
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-800 text-[11px] font-bold tracking-tight">
              <Database size={13} className="text-emerald-600" />
              <span>Supabase Connected</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <button onClick={onBack} className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 border border-zinc-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
              Exit Admin
            </button>
          </div>
        </header>

        <div className="p-3.5 sm:p-5 lg:p-7 max-w-7xl mx-auto">

                    {activeTab === 'categories' && (
            <div className="max-w-md">
              <h3 className="text-xl font-serif font-bold mb-6">Product Categories</h3>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.target as any).category;
                  const newCat = input ? input.value : '';
                  if (newCat) {
                    handleAddCategory(newCat);
                    if (input) input.value = '';
                  }
                }} className="flex gap-4 mb-8">
                  <input name="category" placeholder="New Category Name" className="flex-grow border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 text-sm" />
                  <button type="submit" className="btn-primary px-6 py-2 text-xs uppercase tracking-wider font-semibold">ADD</button>
                </form>
                <div className="space-y-2">
                  {categories.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-4 text-center">No categories found. Add one above.</p>
                  ) : (
                    categories.map(cat => (
                      <div key={cat} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100/60 transition-colors">
                        <span className="text-sm font-medium text-zinc-800">{cat}</span>
                        <button 
                          type="button"
                          onClick={() => handleDeleteCategory(cat)} 
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title={`Delete ${cat}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'orders' && (
            loading ? <p>Loading orders...</p> : (
              <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <th className="py-4 px-6">Order ID</th>
                        <th className="py-4 px-6">Customer</th>
                        <th className="py-4 px-6">Payment</th>
                        <th className="py-4 px-6">Total</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {orders.map(order => (
                        <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                          <td className="py-4 px-6 font-mono">#{order.id}</td>
                          <td className="py-4 px-6">
                            <p className="font-bold">{order.customer_name || (order as any).customerName}</p>
                            <p className="text-xs text-zinc-500">{order.phone}</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                              (order.payment_method || (order as any).paymentMethod) === 'bKash' ? 'bg-[#D12053] text-white' : 
                              (order.payment_method || (order as any).paymentMethod) === 'Nagad' ? 'bg-[#F7941D] text-white' : 
                              'bg-zinc-100 text-zinc-700'
                            }`}>
                              {order.payment_method || (order as any).paymentMethod || 'COD'}
                            </span>
                            {(order.transaction_id || (order as any).transactionId) && (
                              <p className="text-[10px] text-zinc-400 mt-1 font-mono">TXID: {order.transaction_id || (order as any).transactionId}</p>
                            )}
                          </td>
                          <td className="py-4 px-6 font-bold">৳{order.total_amount || (order as any).totalAmount || 0}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                              order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                              order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' : 
                              order.status === 'Processing' ? 'bg-purple-100 text-purple-700' : 
                              order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' : 
                              order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {order.status || 'Pending'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-2">
                              <select 
                                className="text-[10px] font-bold uppercase tracking-widest bg-zinc-100 border-none outline-none py-1 px-2 rounded cursor-pointer"
                                value={order.status || 'Pending'}
                                onChange={(e) => updateStatus(order.id!, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => deleteOrder(order.id!)}
                                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                title="Delete Order"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* Order Details Modal */}
          <AnimatePresence>
            {selectedOrder && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedOrder(null)}
                  className="fixed inset-0 bg-black/40 z-[70] backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white z-[80] shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                  <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                    <div>
                      <h2 className="text-xl font-serif font-bold">Order Details</h2>
                      <p className="text-xs text-zinc-500 font-mono mt-1">Order ID: #{selectedOrder.id}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Customer Information</h4>
                        <div className="space-y-2">
                          <p className="text-sm font-bold">{selectedOrder.customer_name || (selectedOrder as any).customerName}</p>
                          <p className="text-sm text-zinc-600">{selectedOrder.phone}</p>
                          <p className="text-sm text-zinc-600 leading-relaxed">{selectedOrder.address}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Order Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Status:</span>
                            <span className="font-bold uppercase tracking-wider text-[10px]">{selectedOrder.status || 'Pending'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Payment:</span>
                            <span className="font-bold uppercase tracking-wider text-[10px]">{selectedOrder.payment_method || (selectedOrder as any).paymentMethod || 'COD'}</span>
                          </div>
                          {(selectedOrder.transaction_id || (selectedOrder as any).transactionId) && (
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-500">TXID:</span>
                              <span className="font-mono text-[10px]">{selectedOrder.transaction_id || (selectedOrder as any).transactionId}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Date:</span>
                            <span className="text-zinc-600">{(selectedOrder.created_at || (selectedOrder as any).createdAt) ? new Date(selectedOrder.created_at || (selectedOrder as any).createdAt).toLocaleString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-10">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Ordered Products</h4>
                      <div className="border border-zinc-100 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100">
                            <tr>
                              <th className="py-3 px-4">Product</th>
                              <th className="py-3 px-4">Size</th>
                              <th className="py-3 px-4">Color</th>
                              <th className="py-3 px-4 text-center">Qty</th>
                              <th className="py-3 px-4 text-right">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items).map((item: any, idx: number) => (
                              <tr key={idx} className="border-b border-zinc-50 last:border-none">
                                <td className="py-3 px-4">
                                  <p className="font-bold text-zinc-900">{item.name}</p>
                                  <p className="text-[10px] text-zinc-400 font-mono">CODE: {item.id}</p>
                                </td>
                                <td className="py-3 px-4 text-zinc-600">{item.selectedSize}</td>
                                <td className="py-3 px-4 text-zinc-600">{item.selectedColor || '-'}</td>
                                <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                                <td className="py-3 px-4 text-right font-bold">৳{item.price * item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-zinc-900 text-white p-6 rounded-xl flex justify-between items-center">
                      <span className="text-sm font-bold uppercase tracking-widest opacity-60">Total Amount</span>
                      <span className="text-2xl font-bold">৳{selectedOrder.total_amount || (selectedOrder as any).totalAmount || 0}</span>
                    </div>
                  </div>

                  <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-between gap-4">
                    <button 
                      onClick={() => {
                        deleteOrder(selectedOrder.id!);
                        setSelectedOrder(null);
                      }}
                      className="px-6 py-3 border border-red-100 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Delete Order
                    </button>
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="px-8 py-3 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif font-bold">Product Catalog</h3>
                <button 
                  onClick={openAddProductModal}
                  className="btn-primary py-2 px-6 flex items-center gap-2 text-xs"
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {showProductForm && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-serif font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                      <button onClick={() => setShowProductForm(false)}><X size={24} /></button>
                    </div>
                    <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Product Name</label>
                        <input required className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Category</label>
                        <select className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 bg-transparent" value={productFormData.category} onChange={e => {
                          const newCat = e.target.value;
                          const isShirt = newCat.toLowerCase().includes('shirt');
                          const autoSizes = isShirt ? 'M, L, XL, XXL' : '28, 30, 32, 34, 36, 38, 40';
                          if (newCat === 'Cuban Shirt') {
                            setProductFormData({...productFormData, category: newCat, sizes: autoSizes, price: 599, originalPrice: 599});
                          } else {
                            setProductFormData({...productFormData, category: newCat, sizes: autoSizes});
                          }
                        }}>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Price (৳)</label>
                        <input required type="number" className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: parseInt(e.target.value) || 0})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Discount Price (৳)</label>
                        <input required type="number" className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" value={productFormData.originalPrice} onChange={e => setProductFormData({...productFormData, originalPrice: parseInt(e.target.value) || 0})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Stock Quantity</label>
                        <input required type="number" className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" value={productFormData.stock} onChange={e => setProductFormData({...productFormData, stock: parseInt(e.target.value) || 0})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Stock Status</label>
                        <select className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 bg-transparent" value={productFormData.stockStatus} onChange={e => setProductFormData({...productFormData, stockStatus: e.target.value as any})}>
                          <option value="In Stock">In Stock</option>
                          <option value="Out of Stock">Out of Stock</option>
                          <option value="Low Stock">Low Stock</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Colors (comma separated)</label>
                        <input className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" value={productFormData.colors} onChange={e => setProductFormData({...productFormData, colors: e.target.value})} placeholder="Black, Navy, Grey" />
                      </div>
                      <div className="md:col-span-2 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-900">
                              Product Images (3-4 Images)
                            </label>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Upload 3-4 images from device or paste image URLs below. Click 'Set Main' to select primary cover image.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <input 
                              type="file" 
                              accept="image/*" 
                              multiple 
                              onChange={(e) => handleFileUpload(e, 'product')} 
                              className="hidden" 
                              id="product-image-upload" 
                            />
                            <label 
                              htmlFor="product-image-upload" 
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-zinc-800 transition-colors shadow-xs"
                            >
                              <Upload size={14} />
                              {isUploading ? 'Uploading...' : 'Upload 3-4 Images'}
                            </label>
                          </div>
                        </div>

                        {/* Image Thumbnails Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                          {(productFormData.images && productFormData.images.length > 0 
                            ? productFormData.images 
                            : (productFormData.image ? [productFormData.image] : [])
                          ).map((imgUrl, idx) => {
                            const isMain = productFormData.image === imgUrl || (!productFormData.image && idx === 0);
                            return (
                              <div key={idx} className="relative group rounded-lg overflow-hidden border border-zinc-200 bg-white aspect-square flex flex-col justify-between shadow-xs">
                                <img src={imgUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                
                                {isMain ? (
                                  <span className="absolute top-1.5 left-1.5 bg-zinc-900/90 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                                    Cover Main
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProductFormData(prev => ({ ...prev, image: imgUrl }));
                                    }}
                                    className="absolute top-1.5 left-1.5 bg-white/90 text-zinc-900 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs hover:bg-zinc-900 hover:text-white transition-colors"
                                  >
                                    Set Main
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setProductFormData(prev => {
                                      const currentImgs = prev.images && prev.images.length > 0 ? prev.images : (prev.image ? [prev.image] : []);
                                      const newImgs = currentImgs.filter((_, i) => i !== idx);
                                      const newMain = prev.image === imgUrl ? (newImgs[0] || '') : prev.image;
                                      return {
                                        ...prev,
                                        images: newImgs,
                                        image: newMain
                                      };
                                    });
                                  }}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity shadow-xs"
                                  title="Remove image"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            );
                          })}

                          {(!productFormData.images || productFormData.images.length === 0) && !productFormData.image && (
                            <div className="col-span-full border-2 border-dashed border-zinc-300 rounded-lg p-5 text-center text-zinc-400">
                              <p className="text-xs font-semibold">No images added yet.</p>
                              <p className="text-[11px] mt-1">Select 3-4 images from device or paste image URL below.</p>
                            </div>
                          )}
                        </div>

                        {/* Direct URL input for adding images */}
                        <div className="mt-2 flex gap-2 items-center">
                          <input 
                            type="text" 
                            placeholder="Paste image URL (https://...)" 
                            id="new-image-url-input"
                            className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-zinc-900"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget;
                                const val = input.value.trim();
                                if (val) {
                                  setProductFormData(prev => {
                                    const currentImages = prev.images && prev.images.length > 0 ? prev.images : (prev.image ? [prev.image] : []);
                                    const updated = [...currentImages, val];
                                    return {
                                      ...prev,
                                      images: updated,
                                      image: prev.image || val
                                    };
                                  });
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('new-image-url-input') as HTMLInputElement;
                              if (input && input.value.trim()) {
                                const val = input.value.trim();
                                setProductFormData(prev => {
                                  const currentImages = prev.images && prev.images.length > 0 ? prev.images : (prev.image ? [prev.image] : []);
                                  const updated = [...currentImages, val];
                                  return {
                                    ...prev,
                                    images: updated,
                                    image: prev.image || val
                                  };
                                });
                                input.value = '';
                              }
                            }}
                            className="px-3 py-1.5 bg-zinc-200 text-zinc-800 hover:bg-zinc-900 hover:text-white rounded-lg text-xs font-bold uppercase transition-colors"
                          >
                            Add URL
                          </button>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Description</label>
                        <textarea className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} rows={3} placeholder="Product description..." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Fabric</label>
                        <input className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" value={productFormData.fabric} onChange={e => setProductFormData({...productFormData, fabric: e.target.value})} placeholder="Woven Cotton" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Fit</label>
                        <input className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" value={productFormData.fit} onChange={e => setProductFormData({...productFormData, fit: e.target.value})} placeholder="Slim Fit" />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500">Sizes (comma separated)</label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-zinc-400 font-medium">Quick Presets:</span>
                            <button 
                              type="button" 
                              onClick={() => setProductFormData({ ...productFormData, sizes: '28, 30, 32, 34, 36, 38, 40' })}
                              className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-900 hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Pant (28-40)
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setProductFormData({ ...productFormData, sizes: 'M, L, XL, XXL' })}
                              className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-900 hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Shirt (M-XXL)
                            </button>
                          </div>
                        </div>
                        <input className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 text-sm font-medium" value={productFormData.sizes} onChange={e => setProductFormData({...productFormData, sizes: e.target.value})} placeholder="28, 30, 32, 34, 36, 38, 40 or M, L, XL, XXL" />
                      </div>

                      {/* Inventory Management Section */}
                      <div className="md:col-span-2 border-t border-zinc-100 pt-8 mt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
                          <div>
                            <h4 className="text-base font-serif font-bold text-zinc-900">Inventory Management (সাইজ ও স্টক কনফিগারেশন)</h4>
                            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Color & Size-wise exact stock quantity (QN) amount</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Total QN:</span>
                            <span className="px-3 py-1 bg-zinc-900 text-white rounded-xl text-xs font-bold">
                              {(() => {
                                let total = 0;
                                Object.values(productFormData.stockMap || {}).forEach(sMap => {
                                  Object.values(sMap || {}).forEach(q => { total += (Number(q) || 0); });
                                });
                                return total;
                              })()} units
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          {(() => {
                            const parsedFormColors = (typeof productFormData.colors === 'string' && productFormData.colors.trim().length > 0)
                              ? productFormData.colors.split(',').map(c => c.trim()).filter(Boolean)
                              : ['Standard'];
                            const isShirtFormCat = (productFormData.category || '').toLowerCase().includes('shirt');
                            const fallbackFormSizes = isShirtFormCat ? ['M', 'L', 'XL', 'XXL'] : ['28', '30', '32', '34', '36', '38', '40'];
                            const parsedFormSizes = (typeof productFormData.sizes === 'string' && productFormData.sizes.trim().length > 0)
                              ? productFormData.sizes.split(',').map(s => s.trim()).filter(Boolean)
                              : fallbackFormSizes;

                            return parsedFormColors.map(color => (
                              <div key={color} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pb-2 border-b border-zinc-100">
                                  <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full border-2 border-zinc-900 bg-zinc-800" />
                                    {color}
                                  </h5>

                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mr-1">Quick Set:</span>
                                    {[0, 10, 20, 50, 100].map(amt => (
                                      <button
                                        key={amt}
                                        type="button"
                                        onClick={() => {
                                          const updated = { ...(productFormData.stockMap || {}) };
                                          updated[color] = updated[color] ? { ...updated[color] } : {};
                                          parsedFormSizes.forEach(s => {
                                            updated[color][s] = amt;
                                          });
                                          let sum = 0;
                                          Object.values(updated).forEach(sMap => {
                                            Object.values(sMap || {}).forEach(q => { sum += (Number(q) || 0); });
                                          });
                                          setProductFormData({
                                            ...productFormData,
                                            stockMap: updated,
                                            stock: sum,
                                            stockStatus: sum === 0 ? 'Out of Stock' : sum <= 10 ? 'Low Stock' : 'In Stock'
                                          });
                                        }}
                                        className="px-2 py-0.5 text-[10px] font-bold bg-zinc-50 hover:bg-zinc-900 hover:text-white border border-zinc-200 rounded text-zinc-600 transition-colors"
                                      >
                                        {amt === 0 ? 'Clear (0)' : amt}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                  {parsedFormSizes.map(size => {
                                    const qty = productFormData.stockMap?.[color]?.[size] ?? 0;
                                    return (
                                      <div key={size} className="border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
                                        <div className="bg-zinc-900 text-white text-[10px] font-bold py-1.5 text-center tracking-widest uppercase">
                                          SIZE {size}
                                        </div>
                                        <div className="bg-zinc-50/50 p-2">
                                          <div className="flex items-center justify-between gap-1">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const newVal = Math.max(0, qty - 1);
                                                const currentMap = productFormData.stockMap || {};
                                                const updated = {
                                                  ...currentMap,
                                                  [color]: {
                                                    ...(currentMap[color] || {}),
                                                    [size]: newVal
                                                  }
                                                };
                                                let sum = 0;
                                                Object.values(updated).forEach(sMap => {
                                                  Object.values(sMap || {}).forEach(q => { sum += (Number(q) || 0); });
                                                });
                                                setProductFormData({
                                                  ...productFormData,
                                                  stockMap: updated,
                                                  stock: sum,
                                                  stockStatus: sum === 0 ? 'Out of Stock' : sum <= 10 ? 'Low Stock' : 'In Stock'
                                                });
                                              }}
                                              className="w-6 h-6 flex items-center justify-center bg-white border border-zinc-200 text-zinc-700 rounded-md text-xs font-bold hover:bg-zinc-100 select-none"
                                            >
                                              -
                                            </button>
                                            <input 
                                              type="number" 
                                              min="0"
                                              className="w-full bg-transparent text-center text-sm font-bold text-zinc-900 outline-none placeholder:text-zinc-300"
                                              placeholder="0"
                                              value={qty}
                                              onChange={(e) => {
                                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                                const currentMap = productFormData.stockMap || {};
                                                const updated = {
                                                  ...currentMap,
                                                  [color]: {
                                                    ...(currentMap[color] || {}),
                                                    [size]: val
                                                  }
                                                };
                                                let sum = 0;
                                                Object.values(updated).forEach(sMap => {
                                                  Object.values(sMap || {}).forEach(q => { sum += (Number(q) || 0); });
                                                });
                                                setProductFormData({
                                                  ...productFormData,
                                                  stockMap: updated,
                                                  stock: sum,
                                                  stockStatus: sum === 0 ? 'Out of Stock' : sum <= 10 ? 'Low Stock' : 'In Stock'
                                                });
                                              }}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const newVal = qty + 1;
                                                const currentMap = productFormData.stockMap || {};
                                                const updated = {
                                                  ...currentMap,
                                                  [color]: {
                                                    ...(currentMap[color] || {}),
                                                    [size]: newVal
                                                  }
                                                };
                                                let sum = 0;
                                                Object.values(updated).forEach(sMap => {
                                                  Object.values(sMap || {}).forEach(q => { sum += (Number(q) || 0); });
                                                });
                                                setProductFormData({
                                                  ...productFormData,
                                                  stockMap: updated,
                                                  stock: sum,
                                                  stockStatus: sum === 0 ? 'Out of Stock' : sum <= 10 ? 'Low Stock' : 'In Stock'
                                                });
                                              }}
                                              className="w-6 h-6 flex items-center justify-center bg-white border border-zinc-200 text-zinc-700 rounded-md text-xs font-bold hover:bg-zinc-100 select-none"
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-4 text-center py-3 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                          Set exact stock quantity (QN) for each size and variant. Total stock updates in real-time.
                        </p>
                      </div>

                      <div className="md:col-span-2 pt-4 flex gap-4">
                        <button type="submit" className="flex-grow btn-primary py-3">{editingProduct ? 'Update Product' : 'Add Product'}</button>
                        {editingProduct && (
                          <button 
                            type="button" 
                            onClick={() => {
                              deleteProduct(editingProduct.id);
                              setShowProductForm(false);
                            }} 
                            className="px-6 py-3 border border-red-200 text-red-600 hover:bg-red-50 transition-colors rounded-lg flex items-center gap-2 font-bold uppercase tracking-widest text-xs"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white border border-zinc-100 p-4 flex gap-4 items-center shadow-sm rounded-xl">
                    <img src={product.image || null} alt={product.name} className="w-20 h-20 object-cover rounded-lg" referrerPolicy="no-referrer" />
                    <div className="flex-grow">
                      <h4 className="font-bold text-sm truncate max-w-[150px]">{product.name}</h4>
                      <p className="text-xs text-zinc-500">৳{product.price}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          product.stockStatus === 'In Stock' ? 'bg-green-500' :
                          product.stockStatus === 'Low Stock' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          {product.stockStatus || 'In Stock'} ({product.stock || 0})
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => startEdit(product)} className="px-3 py-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <Edit size={14} /> Edit
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="px-3 py-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'banners' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-serif font-bold">Banner Management</h3>
                  <p className="text-xs text-zinc-500 mt-1">Maximum 10 banners allowed for the hero section.</p>
                </div>
                <div className="flex gap-3">
                  {banners.length > 0 && (
                    <button 
                      onClick={clearAllBanners}
                      className="px-6 py-2 border border-red-100 text-red-600 hover:bg-red-50 transition-colors rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Clear All
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (banners.length >= 10) {
                        showToast('You can only have a maximum of 10 banners. Please delete one before adding a new one.', 'error');
                        return;
                      }
                      setEditingBanner(null);
                      setBannerFormData({ image: '', mobile_image: '', title: '', subtitle: '', buttonText: 'Shop Now', link: '' });
                      setShowBannerForm(true);
                    }}
                    disabled={banners.length >= 10}
                    className={`py-2 px-6 flex items-center gap-2 text-xs rounded-lg font-bold uppercase tracking-widest transition-all ${
                      banners.length >= 10 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'btn-primary'
                    }`}
                  >
                    <Plus size={16} /> Add Banner
                  </button>
                </div>
              </div>

              {showBannerForm && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-lg p-8 rounded-xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-serif font-bold">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Desktop (1920 × 700 px) & Mobile (800 × 900 px)</p>
                      </div>
                      <button onClick={() => {
                        setShowBannerForm(false);
                        setEditingBanner(null);
                      }}><X size={24} /></button>
                    </div>
                    <form onSubmit={handleBannerSubmit} className="space-y-5">
                      {/* Desktop Banner Image (1920 x 700 px) */}
                      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800">
                            Desktop Banner Image URL
                          </label>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                            1920 × 700 px
                          </span>
                        </div>
                        <div className="flex gap-4 items-center mt-2">
                          {bannerFormData.image && (
                            <div className="relative aspect-[1920/700] w-32 rounded overflow-hidden border border-zinc-200 bg-white shrink-0 shadow-sm">
                              <img src={bannerFormData.image} alt="Desktop Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div className="flex-grow">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} className="hidden" id="banner-desktop-upload" />
                            <label htmlFor="banner-desktop-upload" className="inline-block px-4 py-1.5 border border-zinc-300 text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:bg-white bg-white/70 transition-colors rounded shadow-xs">
                              {isUploading ? 'Uploading...' : 'Upload Desktop'}
                            </label>
                            <input 
                              className="w-full border-b border-zinc-200 py-1.5 outline-none focus:border-zinc-900 text-sm mt-2 bg-transparent" 
                              value={bannerFormData.image} 
                              onChange={e => setBannerFormData({...bannerFormData, image: e.target.value})} 
                              placeholder="https://... (1920 × 700 px)" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mobile Banner Image (800 x 900 px) */}
                      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800">
                            Mobile Banner Image URL
                          </label>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                            800 × 900 px
                          </span>
                        </div>
                        <div className="flex gap-4 items-center mt-2">
                          {bannerFormData.mobile_image && (
                            <div className="relative aspect-[800/900] w-14 h-16 rounded overflow-hidden border border-zinc-200 bg-white shrink-0 shadow-sm">
                              <img src={bannerFormData.mobile_image} alt="Mobile Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div className="flex-grow">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner_mobile')} className="hidden" id="banner-mobile-upload" />
                            <label htmlFor="banner-mobile-upload" className="inline-block px-4 py-1.5 border border-zinc-300 text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:bg-white bg-white/70 transition-colors rounded shadow-xs">
                              {isUploading ? 'Uploading...' : 'Upload Mobile'}
                            </label>
                            <input 
                              className="w-full border-b border-zinc-200 py-1.5 outline-none focus:border-zinc-900 text-sm mt-2 bg-transparent" 
                              value={bannerFormData.mobile_image || ''} 
                              onChange={e => setBannerFormData({...bannerFormData, mobile_image: e.target.value})} 
                              placeholder="https://... (800 × 900 px - Optional)" 
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Title (Optional)</label>
                        <input className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" value={bannerFormData.title} onChange={e => setBannerFormData({...bannerFormData, title: e.target.value})} placeholder="EID SPECIAL COLLECTION" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Subtitle (Optional)</label>
                        <input className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" value={bannerFormData.subtitle} onChange={e => setBannerFormData({...bannerFormData, subtitle: e.target.value})} placeholder="Up to 40% Off" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Link (Optional)</label>
                        <input className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" value={bannerFormData.link} onChange={e => setBannerFormData({...bannerFormData, link: e.target.value})} placeholder="/category/formal-pant" />
                      </div>
                      <button type="submit" className="w-full btn-primary py-3">{editingBanner ? 'Update Banner' : 'Add Banner'}</button>
                    </form>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map(banner => (
                  <div key={banner.id} className="bg-white border border-zinc-100 p-4 rounded-xl shadow-sm group">
                    <div className="relative aspect-[1920/700] overflow-hidden rounded-lg mb-3 bg-zinc-100">
                      <img src={banner.image || banner.mobile_image || ''} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => editBanner(banner)} className="p-2 bg-white/90 text-zinc-900 rounded-full shadow-lg hover:bg-white transition-all"><Edit size={18} /></button>
                        <button onClick={() => deleteBanner(banner.id!)} className="p-2 bg-white/90 text-red-600 rounded-full shadow-lg hover:bg-white transition-all"><Trash2 size={18} /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex gap-2 items-center">
                        <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200/50">
                          Desktop 1920×700
                        </span>
                        {banner.mobile_image ? (
                          <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200/50">
                            Mobile 800×900
                          </span>
                        ) : (
                          <span className="bg-zinc-100 text-zinc-500 text-[10px] px-2 py-0.5 rounded">
                            Mobile (Auto)
                          </span>
                        )}
                      </div>
                      {banner.link && <span className="text-zinc-500 truncate max-w-[150px]">{banner.link}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Middle Campaign Banner Section (Below Top Rated Products) */}
              <div className="mt-12 pt-8 border-t border-zinc-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-zinc-900">
                      Middle Banner (Below Top Rated Products)
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Exact same size as hero banner (Desktop 1920×700 px, Mobile 800×900 px).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMiddleBannerFormData(middleBanner);
                      setShowMiddleBannerModal(true);
                    }}
                    className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2 self-start sm:self-auto"
                  >
                    <Edit size={16} /> Edit Middle Banner
                  </button>
                </div>

                <div className="bg-white border border-zinc-100 p-5 rounded-2xl shadow-sm">
                  <div className="relative aspect-[1920/700] overflow-hidden rounded-xl mb-4 bg-zinc-900">
                    <img 
                      src={middleBanner.image || middleBanner.mobile_image} 
                      alt="Middle Banner Preview" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 flex flex-col items-center justify-center text-center p-6">
                      {middleBanner.title && (
                        <h4 className="text-white text-xl sm:text-2xl font-serif font-bold mb-1 drop-shadow">
                          {middleBanner.title}
                        </h4>
                      )}
                      {middleBanner.subtitle && (
                        <p className="text-white/80 text-xs sm:text-sm max-w-lg mb-3">
                          {middleBanner.subtitle}
                        </p>
                      )}
                      {middleBanner.buttonText && (
                        <span className="px-5 py-2 rounded-full bg-[#cfa83b] text-[#111827] font-bold text-[11px] uppercase tracking-wider">
                          {middleBanner.buttonText}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-md border border-amber-200/60">
                        Desktop 1920×700
                      </span>
                      <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-md border border-blue-200/60">
                        Mobile 800×900
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-200/60">
                        Active on Homepage
                      </span>
                    </div>
                    {middleBanner.link && (
                      <span className="text-zinc-500">
                        Target: <span className="font-semibold text-zinc-700">{middleBanner.link}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Banner Edit Modal */}
              {showMiddleBannerModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-zinc-900">
                          Edit Middle Banner
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Appears right below Top Rated Products section.
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowMiddleBannerModal(false)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveMiddleBanner} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                          Desktop Image (Recommended 1920 × 700 px)
                        </label>
                        <div className="flex gap-2">
                          <input 
                            className="flex-1 border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 text-sm" 
                            value={middleBannerFormData.image} 
                            onChange={e => setMiddleBannerFormData({ ...middleBannerFormData, image: e.target.value })} 
                            placeholder="https://images.unsplash.com/..." 
                          />
                          <label className="btn-outline py-2 px-3 text-xs cursor-pointer flex items-center gap-1 shrink-0">
                            <Upload size={14} /> Upload
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => handleFileUpload(e, 'middle_banner')} 
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                          Mobile Image (Recommended 800 × 900 px - Optional)
                        </label>
                        <div className="flex gap-2">
                          <input 
                            className="flex-1 border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 text-sm" 
                            value={middleBannerFormData.mobile_image || ''} 
                            onChange={e => setMiddleBannerFormData({ ...middleBannerFormData, mobile_image: e.target.value })} 
                            placeholder="Optional separate mobile image URL" 
                          />
                          <label className="btn-outline py-2 px-3 text-xs cursor-pointer flex items-center gap-1 shrink-0">
                            <Upload size={14} /> Upload
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => handleFileUpload(e, 'middle_banner_mobile')} 
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Title</label>
                        <input 
                          className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 text-sm" 
                          value={middleBannerFormData.title || ''} 
                          onChange={e => setMiddleBannerFormData({ ...middleBannerFormData, title: e.target.value })} 
                          placeholder="E.g. CRAFTED FOR DISTINCTION" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Subtitle</label>
                        <input 
                          className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 text-sm" 
                          value={middleBannerFormData.subtitle || ''} 
                          onChange={e => setMiddleBannerFormData({ ...middleBannerFormData, subtitle: e.target.value })} 
                          placeholder="Short description or tagline" 
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Button Text</label>
                          <input 
                            className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 text-sm" 
                            value={middleBannerFormData.buttonText || ''} 
                            onChange={e => setMiddleBannerFormData({ ...middleBannerFormData, buttonText: e.target.value })} 
                            placeholder="SHOP NOW" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Link / Target Page</label>
                          <input 
                            className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 text-sm" 
                            value={middleBannerFormData.link || ''} 
                            onChange={e => setMiddleBannerFormData({ ...middleBannerFormData, link: e.target.value })} 
                            placeholder="shop" 
                          />
                        </div>
                      </div>

                      {isUploading && (
                        <div className="text-center py-2 text-xs text-amber-600 font-medium animate-pulse">
                          Uploading image, please wait...
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button 
                          type="button" 
                          onClick={() => setShowMiddleBannerModal(false)}
                          className="flex-1 py-3 border border-zinc-200 text-zinc-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-50"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={isUploading}
                          className="flex-1 btn-primary py-3 text-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Supabase Cloud Tab */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                      <Database size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-zinc-900">Supabase Cloud Integration</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Live PostgreSQL Cloud Database status & synchronization engine</p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>CONNECTED & ACTIVE</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Project Endpoint URL</p>
                    <p className="text-sm font-mono font-bold text-zinc-900 mt-1 break-all">
                      https://afwislqtlcfglimaacxk.supabase.co
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Anon Public Key</p>
                    <p className="text-sm font-mono font-bold text-zinc-900 mt-1 truncate">
                      sb_publishable_6hhesP3nklqpR3SovQhUpQ_l47YNy6M
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={async () => {
                      showToast('Syncing all products to Supabase...', 'info');
                      await syncProductsToSupabase(products);
                      showToast('Products successfully synced to Supabase!', 'success');
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Database size={16} />
                    <span>Sync Products to Supabase</span>
                  </button>
                  <button 
                    onClick={async () => {
                      const isOk = await testSupabaseConnection();
                      if (isOk) {
                        showToast('Supabase Connection Test Succeeded!', 'success');
                      } else {
                        showToast('Supabase Connection Test Failed.', 'error');
                      }
                    }}
                    className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    Test Connection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200/80 shadow-xs">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-100">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                    <SlidersHorizontal size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-zinc-900">Store Settings</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">General website contact & store location parameters</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Store Name</label>
                    <input type="text" readOnly value="ELEGAN BD" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Store Address</label>
                    <input type="text" readOnly value="Ma Villa, House #11, Road #3, Block F, Section #1, Mirpur, Dhaka-1216" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Support Phone Number</label>
                    <input type="text" readOnly value="+8801327772213" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Support Email</label>
                    <input type="text" readOnly value="eleganbdltd@gmail.com" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold font-mono" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Confirmation Dialog Modal */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
              <p className="text-zinc-600 mb-6">{confirmDialog.message}</p>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setConfirmDialog({isOpen: false, message: '', onConfirm: () => {}})}
                  className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const Footer = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  return (
    <footer className="bg-[#0b0f19] text-white pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: ELEGAN BD */}
          <div className="bg-[#121722] border border-zinc-800/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4">
                ELEGAN BD
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                Premium formal wear for the modern gentleman. Crafted with precision, designed for elegance.
              </p>
            </div>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 flex items-center justify-center transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 flex items-center justify-center transition-colors">
                <Instagram size={18} />
              </a>
              <a href="tel:+8801327772213" className="w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 flex items-center justify-center transition-colors">
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Card 2: QUICK LINKS */}
          <div className="bg-[#121722] border border-zinc-800/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-5">
                QUICK LINKS
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-400 font-medium">
                <li>
                  <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                    Shop All
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                    New Arrivals
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('returns-policy')} className="hover:text-white transition-colors">
                    Returns & Exchange
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: CUSTOMER CARE */}
          <div className="bg-[#121722] border border-zinc-800/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-5">
                CUSTOMER CARE
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-400 font-medium">
                <li>
                  <button onClick={() => onNavigate('track-order')} className="text-white font-bold hover:underline transition-all">
                    Track Your Order
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                    About Elegan BD
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                    Contact Us
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('privacy-policy')} className="hover:text-white transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('terms-conditions')} className="hover:text-white transition-colors">
                    Terms & Conditions
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 4: CONTACT INFO */}
          <div className="bg-[#121722] border border-zinc-800/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-5">
                CONTACT INFO
              </h3>
              
              <div className="space-y-4 text-xs sm:text-sm">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800/80 flex items-center justify-center shrink-0 mt-0.5 text-zinc-300">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">ADDRESS</p>
                    <p className="text-zinc-200 text-xs font-medium leading-relaxed mt-0.5">
                      Ma Villa, House #11, Road #3, Block F, Section #1, Mirpur, Dhaka-1216
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800/80 flex items-center justify-center shrink-0 text-zinc-300">
                    <Mail size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">EMAIL US</p>
                    <a href="mailto:eleganbdltd@gmail.com" className="text-zinc-200 text-xs font-medium hover:text-white transition-colors">
                      eleganbdltd@gmail.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800/80 flex items-center justify-center shrink-0 text-zinc-300">
                    <Phone size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">CALL US</p>
                    <a href="tel:+8801327772213" className="text-zinc-200 text-xs font-bold font-mono hover:text-white transition-colors">
                      +8801327772213
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 text-center text-xs text-zinc-500 font-medium">
          © {new Date().getFullYear()} ELEGAN BD. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('elegan_page') || 'home');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('elegan_products') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return defaultProducts;
  });
  const [banners, setBanners] = useState<Banner[]>(() => {
    const saved = localStorage.getItem('elegan_banners');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return defaultBanners;
  });
  const defaultMiddleBanner: Banner = {
    id: 'default_middle_banner',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1920&h=700',
    mobile_image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800&h=900',
    title: 'CRAFTED FOR DISTINCTION',
    subtitle: 'Discover our signature tailored formal wear designed for modern elegance.',
    buttonText: 'SHOP NOW',
    link: 'shop'
  };
  const [middleBanner, setMiddleBanner] = useState<Banner>(defaultMiddleBanner);
  const [topRatedOfferImage, setTopRatedOfferImage] = useState('');
  const [heroVideo, setHeroVideo] = useState('https://assets.mixkit.co/videos/preview/mixkit-man-in-a-suit-walking-slowly-4848-large.mp4');
  const [heroImage, setHeroImage] = useState('https://i.imgur.com/Vriu71z.png');
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('elegan_product_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return ['Formal Pant', 'Formal Shirt', 'Blazer', 'Office Wear', 'Premium Collection', 'Best Seller', 'Cuban Shirt'];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('elegan_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleToggleWishlist = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!user) {
      showToast('Please login to add to wishlist', 'info');
      setIsUserOpen(true);
      return;
    }

    const currentWishlist = user.wishlist || [];
    const productId = String(product.id);
    const isWishlisted = currentWishlist.includes(productId);
    
    let newWishlist;
    if (isWishlisted) {
      newWishlist = currentWishlist.filter(id => id !== productId);
      showToast('Removed from wishlist', 'info');
    } else {
      newWishlist = [...currentWishlist, productId];
      showToast('Added to wishlist', 'success');
    }

    const updatedUser = { ...user, wishlist: newWishlist };
    setUser(updatedUser);
    localStorage.setItem('elegan_user', JSON.stringify(updatedUser));

    try {
      const q = query(collection(db, 'users'), where('email', '==', user.email));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), { wishlist: newWishlist });
      }
    } catch (error) {
      console.error('Error updating wishlist in DB:', error);
    }
  };


  const fetchProducts = async () => {
    try {
      const saved = localStorage.getItem('elegan_products');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        } catch (e) {}
      }

      // 1. Fetch from Firestore first (source of truth with all user data)
      let loadedProducts: Product[] | null = null;
      try {
        const pSnap = await getDocs(collection(db, 'products'));
        if (pSnap && !pSnap.empty && pSnap.docs.length > 0) {
          loadedProducts = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        }
      } catch (fErr) {
        console.warn('Firestore fetch products notice:', fErr);
      }

      // 2. Fall back to Supabase if Firestore is empty
      if (!loadedProducts || loadedProducts.length === 0) {
        const supaData = await fetchProductsFromSupabase();
        if (supaData && supaData.length > 0) {
          loadedProducts = supaData as Product[];
        }
      }

      if (loadedProducts && loadedProducts.length > 0) {
        setProducts(loadedProducts);
        try { localStorage.setItem('elegan_products', JSON.stringify(loadedProducts)); } catch (e) {}
        syncProductsToSupabase(loadedProducts);
      } else if (!saved) {
        setProducts(defaultProducts);
      }
    } catch (err) {
      console.warn('Fetch products general notice:', err);
      const saved = localStorage.getItem('elegan_products');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
            return;
          }
        } catch (e) {}
      }
      setProducts(defaultProducts);
    }
  };

  const fetchBanners = async () => {
    try {
      const saved = localStorage.getItem('elegan_banners');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBanners(parsed);
          }
        } catch (e) {}
      }

      // 1. Fetch from Firestore first
      let loadedBanners: Banner[] | null = null;
      try {
        const bSnap = await getDocs(collection(db, 'banners'));
        if (bSnap && !bSnap.empty && bSnap.docs.length > 0) {
          loadedBanners = bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Banner[];
        }
      } catch (fErr) {
        console.warn('Firestore fetch banners notice:', fErr);
      }

      // 2. Fall back to Supabase
      if (!loadedBanners || loadedBanners.length === 0) {
        const supaBanners = await fetchBannersFromSupabase();
        if (supaBanners && supaBanners.length > 0) {
          loadedBanners = supaBanners as Banner[];
        }
      }

      if (loadedBanners && loadedBanners.length > 0) {
        setBanners(loadedBanners);
        try { localStorage.setItem('elegan_banners', JSON.stringify(loadedBanners)); } catch (e) {}
      } else if (!saved) {
        setBanners(defaultBanners);
      }
    } catch (err) {
      console.warn('Fetch banners general notice:', err);
      const saved = localStorage.getItem('elegan_banners');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBanners(parsed);
            return;
          }
        } catch (e) {}
      }
      setBanners(defaultBanners);
    }
  };

  const fetchPromoImage = async () => {
    try {
      const offerSnap = await getDoc(doc(db, 'settings', 'top_rated_offer_image'));
      if (offerSnap.exists() && offerSnap.data().value) {
        setTopRatedOfferImage(offerSnap.data().value);
      } else {
        setTopRatedOfferImage('');
      }
    } catch (err) {
      setTopRatedOfferImage('');
    }
  };

  const fetchHeroVideo = async () => {
    const defaultVideo = 'https://assets.mixkit.co/videos/preview/mixkit-man-in-a-suit-walking-slowly-4848-large.mp4';
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'hero_video'));
      if (docSnap.exists() && docSnap.data().value) {
        setHeroVideo(docSnap.data().value);
      } else {
        setHeroVideo(defaultVideo);
      }
    } catch (err) {
      setHeroVideo(defaultVideo);
    }
  };

  const fetchHeroImage = async () => {
    const defaultImage = 'https://i.imgur.com/Vriu71z.png';
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'hero_image'));
      if (docSnap.exists() && docSnap.data().value) {
        setHeroImage(docSnap.data().value);
      } else {
        setHeroImage(defaultImage);
      }
    } catch (err) {
      setHeroImage(defaultImage);
    }
  };

  const fetchCategories = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'product_categories'));
      if (docSnap.exists() && docSnap.data().value) {
        const parsed = JSON.parse(docSnap.data().value);
        if (Array.isArray(parsed)) {
          setCategories(parsed);
          localStorage.setItem('elegan_product_categories', JSON.stringify(parsed));
          return;
        }
      }
    } catch (err) {
      console.warn('Firestore fetch categories notice:', err);
    }
  };

  const fetchMiddleBanner = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'middle_banner'));
      if (docSnap.exists() && docSnap.data().image) {
        setMiddleBanner({ id: 'middle_banner', ...docSnap.data() } as Banner);
      } else {
        setMiddleBanner(defaultMiddleBanner);
      }
    } catch (err) {
      console.warn('Firestore fetch middle banner notice:', err);
      setMiddleBanner(defaultMiddleBanner);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBanners();
    fetchMiddleBanner();
    fetchPromoImage();
    fetchHeroVideo();
    fetchHeroImage();
    fetchCategories();

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    // Check local storage for user session
    try {
      const savedUser = localStorage.getItem('elegan_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error('User session error:', err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('elegan_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('elegan_page', currentPage);
  }, [currentPage]);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('elegan_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('elegan_user');
    setIsUserOpen(false);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedProduct(null);
    setOrderSuccess(false);
    window.scrollTo(0, 0);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-details');
    window.scrollTo(0, 0);
  };

  const handleBuyNow = (product: Product, size: any, color?: string) => {
    // We update addToCart call here
    addToCart(product, size, color);
    setCurrentPage('checkout');
    window.scrollTo(0, 0);
  };

  const addToCart = (product: Product, size: any, color?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size && item.selectedColor === color);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size && item.selectedColor === color) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, selectedSize: size, selectedColor: color, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id: number | string, size: any, delta: number, color?: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size && item.selectedColor === color) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number | string, size: any, color?: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === size && item.selectedColor === color)));
  };

  const [lastOrderId, setLastOrderId] = useState<string>('');

  const handleCheckoutComplete = (orderId: string = '') => {
    setCart([]);
    setOrderSuccess(true);
    setLastOrderId(orderId);
    setCurrentPage('success');
  };

  if (currentPage === 'admin') {
    return (
      <AdminPanel 
        onBack={() => handleNavigate('home')} 
        onRefreshProducts={fetchProducts}
        onRefreshBanners={fetchBanners}
        onRefreshPromoImage={fetchPromoImage}
        onRefreshHeroVideo={fetchHeroVideo}
        onRefreshHeroImage={fetchHeroImage}
        onRefreshCategories={fetchCategories}
        showToast={showToast}
      />
    );
  }

  const pants = products.filter(p => !p.category || p.category === 'Formal Pant');
  const shirts = products.filter(p => p.category === 'Formal Shirt');
  const blazers = products.filter(p => p.category === 'Blazer');

  const interleavedProducts: Product[] = [];
  const maxLength = Math.max(pants.length, shirts.length, blazers.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < pants.length) interleavedProducts.push(pants[i]);
    if (i < shirts.length) interleavedProducts.push(shirts[i]);
    if (i < blazers.length) interleavedProducts.push(blazers[i]);
  }

  const availableColors = Array.from(new Set(products.flatMap(p => {
    if (!p.colors) return [];
    if (Array.isArray(p.colors)) return p.colors;
    if (typeof p.colors === 'string') {
      return (p.colors as string).split(',').map(c => c.trim()).filter(c => c);
    }
    return [];
  }))).sort();

  const filteredShopProducts = products.filter(product => {
    const matchSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchCategory = !selectedCategory || product.category === selectedCategory;
    
    let matchColor = !selectedColor;
    if (selectedColor && product.colors) {
      if (Array.isArray(product.colors)) {
        matchColor = product.colors.some(c => c.toLowerCase().includes(selectedColor.toLowerCase()));
      } else if (typeof product.colors === 'string') {
        matchColor = (product.colors as string).toLowerCase().includes(selectedColor.toLowerCase());
      }
    }
    
    // Convert to numbers explicitly ensuring fallback to 0 or Infinity for comparisons if needed
    const minP = minPrice ? parseInt(minPrice) : 0;
    const maxP = maxPrice ? parseInt(maxPrice) : Infinity;
    
    // Only apply range matching if the fields are actually filled with something.
    const matchMin = !minPrice || product.price >= minP;
    const matchMax = !maxPrice || product.price <= maxP;

    return matchSearch && matchCategory && matchColor && matchMin && matchMax;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // default
  });

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
              toast.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
              toast.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
              'bg-zinc-900/90 border-zinc-800 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Loader2 size={18} className="animate-spin" />}
            <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ 
              y: '-100%',
              transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] }
            }}
            className="fixed inset-0 z-[1000] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Background Decorative Elements */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)]"
            />
            
            <div className="relative flex flex-col items-center">
              {/* Logo Animation */}
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 1.5, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
                className="relative z-10"
              >
                <div className="relative">
                  <img 
                    src="https://i.postimg.cc/csPJTT4H/1000047673-removebg-preview.png" 
                    alt="Elegan BD Logo" 
                    className="w-32 h-32 md:w-48 md:h-48 object-contain brightness-110 contrast-125"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle Glow behind logo */}
                  <motion.div 
                    animate={{ 
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-white/20 blur-3xl rounded-full -z-10"
                  />
                </div>
              </motion.div>

              {/* Brand Name with Letter Animation */}
              <div className="mt-12 overflow-hidden">
                <motion.h1 
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  transition={{ 
                    duration: 1, 
                    delay: 0.5,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="text-white text-3xl md:text-5xl font-serif font-bold tracking-[0.4em] uppercase"
                >
                  Elegan BD
                </motion.h1>
              </div>

              {/* Elegant Loading Line */}
              <div className="mt-8 w-48 h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="mt-6 text-white/60 text-[10px] uppercase tracking-[0.5em] font-medium"
              >
                Premium Men's Formal Wear
              </motion.p>
            </div>

            {/* Bottom Accent */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="absolute bottom-12 w-32 h-[1px] bg-white/20 origin-center"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar 
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenUser={() => setIsUserOpen(true)}
        onNavigate={handleNavigate}
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          handleNavigate('shop');
        }}
      />

      <main className="flex-grow">
        {currentPage === 'home' && (
          <div className="pt-16">
            <BannerCarousel banners={banners} />
            <TrustFeatureBadges />

            <FeaturedCollection 
              title="EXPLORE OUR PANT COLLECTION"
              products={products}
              onSelect={handleProductSelect}
              user={user}
              onToggleWishlist={handleToggleWishlist}
              categories={categories}
              filterType="pant"
            />

            {/* Top Rated Products Section */}
            <section className="pt-2 sm:pt-4 pb-14 md:pb-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 sm:mb-12">
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 mb-3 sm:mb-4 tracking-tight">Top Rated Products</h2>
                  <p className="max-w-2xl mx-auto text-zinc-500 text-sm md:text-base leading-relaxed">
                    আমাদের গ্রাহকদের সবচেয়ে পছন্দের এবং সর্বোচ্চ রেটিং প্রাপ্ত প্রোডাক্টগুলো দেখে নিন।
                  </p>
                </div>
                <TopRatedCarousel 
                  products={products
                    .filter(p => (!p.category || p.category === 'Formal Pant' || p.category === 'Formal Shirt' || p.category === 'Blazer' || p.category === 'Cuban Shirt') && p.rating >= 4.8)
                    .slice(0, 6)}
                  onSelect={handleProductSelect}
                  user={user}
                  onToggleWishlist={handleToggleWishlist}
                />
              </div>
            </section>

            {/* Shirt Collection Section */}
            <FeaturedCollection 
              title="EXPLORE OUR SHIRT COLLECTION"
              products={products}
              onSelect={handleProductSelect}
              user={user}
              onToggleWishlist={handleToggleWishlist}
              categories={categories}
              filterType="shirt"
            />

            {/* Trust Section */}
            <section className="py-20 md:py-32 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
                  <div className="flex flex-col items-center text-center group">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-8 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                      <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-4">Premium Quality</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">We use only the finest fabrics sourced for durability and comfort.</p>
                  </div>
                  <div className="flex flex-col items-center text-center group">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-8 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                      <Truck size={32} />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-4">Fast Delivery</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">Quick delivery across all 64 districts of Bangladesh.</p>
                  </div>
                  <div className="flex flex-col items-center text-center group">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-8 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                      <RefreshCw size={32} />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-4">Easy Exchange</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">Not the right fit? Exchange within 3 days with no hassle.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentPage === 'shop' && (
          <section className="pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <button 
                  onClick={() => handleNavigate('home')}
                  className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Back to Home
                </button>
              </div>
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-4">Collection</h1>
                <p className="text-zinc-500">Showing {filteredShopProducts.length} products</p>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mb-12 border-b border-zinc-100 pb-8 items-end flex-col sm:flex-row">
                <div className="flex flex-col gap-2 w-full sm:w-[150px]">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Category</label>
                  <select 
                    className="bg-transparent border-b border-zinc-200 py-2 text-sm outline-none focus:border-zinc-900"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-[150px]">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Color</label>
                  <select 
                    className="bg-transparent border-b border-zinc-200 py-2 text-sm outline-none focus:border-zinc-900"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  >
                    <option value="">All Colors</option>
                    {availableColors.map((color, idx) => (
                      <option key={idx} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-[120px]">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Min Price (৳)</label>
                  <input 
                    type="number"
                    min="0"
                    className="bg-transparent border-b border-zinc-200 py-2 text-sm outline-none focus:border-zinc-900"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="E.g. 0"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-[120px]">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Max Price (৳)</label>
                  <input 
                    type="number"
                    min="0"
                    className="bg-transparent border-b border-zinc-200 py-2 text-sm outline-none focus:border-zinc-900"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="E.g. 5000"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-[150px]">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sort By</label>
                  <select 
                    className="bg-transparent border-b border-zinc-200 py-2 text-sm outline-none focus:border-zinc-900"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="default">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
                {filteredShopProducts.length > 0 ? (
                  filteredShopProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onSelect={handleProductSelect} 
                      isWishlisted={user?.wishlist?.includes(String(product.id))}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))
                ) : (
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-20">
                    <p className="text-zinc-500 font-medium">No products match your selected filters.</p>
                    <button onClick={() => {
                      setSelectedCategory('');
                      setSelectedColor('');
                      setMinPrice('');
                      setMaxPrice('');
                      setSortBy('default');
                    }} className="mt-4 px-6 py-2 border border-zinc-200 text-sm font-bold uppercase hover:bg-zinc-50 transition-colors">
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {currentPage === 'product-details' && selectedProduct && (
          <ProductDetails 
            product={selectedProduct} 
            onAddToCart={addToCart} 
            onBack={() => handleNavigate('shop')} 
            onBuyNow={handleBuyNow}
            user={user}
            showToast={showToast}
            onNavigate={handleNavigate}
            onCategoryClick={(category) => {
              setSelectedCategory(category);
              handleNavigate('shop');
            }}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage 
            items={cart} 
            onBack={() => setCurrentPage('shop')} 
            onComplete={handleCheckoutComplete}
            showToast={showToast}
            onUpdateQty={updateCartQty}
            onRemoveItem={removeFromCart}
          />
        )}

        {currentPage === 'wishlist' && (
          <WishlistPage 
            user={user} 
            products={products} 
            onSelect={handleProductSelect} 
            onBack={() => handleNavigate('home')} 
            onNavigate={handleNavigate}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {currentPage === 'my-orders' && (
          <MyOrdersPage 
            user={user} 
            onBack={() => handleNavigate('home')} 
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'track-order' && (
          <OrderTrackingPage 
            onBack={() => handleNavigate('home')}
            showToast={showToast}
          />
        )}

        {currentPage === 'reviews' && (
          <ReviewsPage onBack={() => handleNavigate('home')} />
        )}

        {currentPage === 'admin' && (
          <AdminPanel 
            onBack={() => handleNavigate('home')} 
            onRefreshProducts={fetchProducts}
            onRefreshBanners={fetchBanners}
            onRefreshPromoImage={fetchPromoImage}
            onRefreshHeroVideo={fetchHeroVideo}
            onRefreshHeroImage={fetchHeroImage}
            onRefreshCategories={fetchCategories}
            onRefreshMiddleBanner={fetchMiddleBanner}
            showToast={showToast}
          />
        )}

        {currentPage === 'success' && (
          <section className="pt-48 pb-32 flex items-center justify-center min-h-[70vh]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-md w-full mx-auto px-4 text-center p-10 sm:rounded-3xl"
            >
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm"
              >
                <ShieldCheck size={48} strokeWidth={1.5} />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl sm:text-4xl font-serif font-bold mb-4 text-zinc-900"
              >
                Order Confirmed!
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-zinc-500 mb-10 leading-relaxed text-sm lg:text-base px-2"
              >
                Thank you for shopping with ELEGAN BD. We've received your order and will contact you shortly for confirmation.
              </motion.p>
              {lastOrderId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="bg-zinc-50 p-6 rounded-2xl mb-10 border border-zinc-100"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Order Tracking ID</p>
                  <p className="font-mono text-xl font-bold text-zinc-900 select-all tracking-wider">{lastOrderId}</p>
                  <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-wide">Copy and save this ID to track your order</p>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigate('home')} 
                  className="bg-zinc-900 hover:bg-zinc-800 text-white w-full py-4 text-sm tracking-widest uppercase font-bold rounded-none transition-colors"
                >
                  Continue Shopping
                </motion.button>
              </motion.div>
            </motion.div>
          </section>
        )}

        {currentPage === 'about' && (
          <section className="pt-32 pb-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-8 text-center">About Elegan BD</h1>
              <div className="aspect-video bg-zinc-100 mb-12 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1594932224456-75a779401e28?q=80&w=2000&auto=format&fit=crop" alt="Formal Trousers Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="prose prose-zinc max-w-none text-center">
                <p className="text-xl text-zinc-800 leading-relaxed mb-6 font-medium">
                  “Elegan BD brings premium men's formal wear designed for comfort, durability, and timeless style.”
                </p>
                <p className="text-lg text-zinc-600 leading-relaxed mb-6">
                  Founded in 2024, <strong>ELEGAN BD</strong> was born out of a simple necessity: the need for high-quality, perfectly fitted formal wear that doesn't break the bank. We noticed that the modern Bangladeshi professional often had to choose between overpriced international brands or low-quality local alternatives.
                </p>
                <p className="text-lg text-zinc-600 leading-relaxed mb-6">
                  Our mission is to bridge that gap. We source premium fabrics that are breathable and durable, perfectly suited for the humid climate of Bangladesh. Each pair of pants is crafted with meticulous attention to detail, ensuring a fit that feels custom-made.
                </p>
                <h3 className="text-2xl font-serif font-bold text-zinc-900 mt-12 mb-4">Our Commitment</h3>
                <ul className="space-y-4 text-zinc-600">
                  <li className="flex gap-3">
                    <ChevronRight className="text-zinc-900 flex-shrink-0" size={20} />
                    <span><strong>Quality First:</strong> We never compromise on fabric or stitching quality.</span>
                  </li>
                  <li className="flex gap-3">
                    <ChevronRight className="text-zinc-900 flex-shrink-0" size={20} />
                    <span><strong>Fair Pricing:</strong> Premium formal wear at prices that make sense for Bangladeshi customers.</span>
                  </li>
                  <li className="flex gap-3">
                    <ChevronRight className="text-zinc-900 flex-shrink-0" size={20} />
                    <span><strong>Customer Trust:</strong> Your satisfaction is our priority. We offer easy exchanges and dedicated support.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {currentPage === 'contact' && (
          <section className="pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-4">Get in Touch</h1>
                <p className="text-zinc-500">Have questions? We're here to help you find the perfect fit.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <div className="bg-zinc-50 p-8 text-center">
                  <Phone className="mx-auto mb-4 text-zinc-900" size={24} />
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-2">Call Us</h3>
                  <p className="text-zinc-600">+8801631496122</p>
                  <p className="text-zinc-600">+8801623-766036</p>
                </div>
                <div className="bg-zinc-50 p-8 text-center">
                  <Mail className="mx-auto mb-4 text-zinc-900" size={24} />
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-2">Email</h3>
                  <p className="text-zinc-600">eleganbdltd@gmail.com</p>
                </div>
                <div className="bg-zinc-50 p-8 text-center">
                  <MessageCircle className="mx-auto mb-4 text-zinc-900" size={24} />
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-2">WhatsApp</h3>
                  <p className="text-zinc-600">+8801631496122</p>
                </div>
              </div>

              <div className="max-w-2xl mx-auto bg-white p-8 border border-zinc-100 shadow-sm">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Name</label>
                      <input type="text" className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Email</label>
                      <input type="email" className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Message</label>
                    <textarea rows={4} className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 resize-none"></textarea>
                  </div>
                  <button type="button" className="btn-primary w-full">Send Message</button>
                </form>
              </div>
            </div>
          </section>
        )}

        {currentPage === 'returns-policy' && (
          <section className="pt-32 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-8 text-center">Returns & Exchange Policy</h1>
              
              <div className="prose prose-zinc max-w-none space-y-8 text-zinc-600">
                <div className="bg-zinc-50 p-8 rounded-xl border border-zinc-100">
                  <h3 className="text-xl font-serif font-bold text-zinc-900 mb-4">3-Day Exchange Policy</h3>
                  <p className="text-sm leading-relaxed">
                    We want you to be completely satisfied with your purchase. If the size doesn't fit or you're not happy with the product, you can exchange it within 3 days of receiving your order.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-bold text-zinc-900">Conditions for Exchange</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Product must be unused and unwashed.</li>
                      <li>Original tags and packaging must be intact.</li>
                      <li>Proof of purchase (invoice/order ID) is required.</li>
                      <li>Exchange is subject to stock availability.</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-bold text-zinc-900">Non-Returnable Items</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Items on clearance or flash sale.</li>
                      <li>Products with visible signs of wear or damage.</li>
                      <li>Customized or altered garments.</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-8">
                  <h3 className="text-xl font-serif font-bold text-zinc-900 mb-4">How to Initiate a Return</h3>
                  <p className="text-sm leading-relaxed mb-4">
                    To start an exchange or return process, please contact our customer support team via WhatsApp or Phone within 72 hours of delivery.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a href="tel:+8801631496122" className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-800 transition-colors">
                      <Phone size={16} /> Call Support
                    </a>
                    <a href="https://wa.me/8801631496122" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-green-700 transition-colors">
                      <MessageCircle size={16} /> WhatsApp Us
                    </a>
                  </div>
                </div>

                <div className="bg-zinc-900 text-white p-8 rounded-xl">
                  <h3 className="text-xl font-serif font-bold mb-4">Refund Policy</h3>
                  <p className="text-sm opacity-80 leading-relaxed">
                    Refunds are only processed if the product is found to have a manufacturing defect and a replacement is not available. Refunds will be issued to the original payment method within 7-10 working days.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {currentPage === 'privacy-policy' && (
          <section className="pt-32 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-8 text-center">Privacy Policy</h1>
              <div className="prose prose-zinc max-w-none space-y-6 text-zinc-600">
                <p>At Elegan BD, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.</p>
                
                <h3 className="text-xl font-serif font-bold text-zinc-900 mt-8">Information Collection</h3>
                <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact our customer support. This may include your name, email address, phone number, and shipping address.</p>
                
                <h3 className="text-xl font-serif font-bold text-zinc-900 mt-8">How We Use Your Information</h3>
                <p>We use your information to process orders, provide customer support, and improve our services. We may also use your contact information to send you updates about your order or promotional offers, which you can opt out of at any time.</p>
                
                <h3 className="text-xl font-serif font-bold text-zinc-900 mt-8">Data Security</h3>
                <p>We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.</p>
                
                <h3 className="text-xl font-serif font-bold text-zinc-900 mt-8">Cookies</h3>
                <p>We use cookies to enhance your experience on our site. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your Web browser that enables the site's or service provider's systems to recognize your browser and capture and remember certain information.</p>
              </div>
            </div>
          </section>
        )}

        {currentPage === 'terms-conditions' && (
          <section className="pt-32 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-8 text-center">Terms & Conditions</h1>
              <div className="prose prose-zinc max-w-none space-y-6 text-zinc-600">
                <p>Welcome to Elegan BD. By accessing or using our website, you agree to be bound by these Terms & Conditions.</p>
                
                <h3 className="text-xl font-serif font-bold text-zinc-900 mt-8">Product Information</h3>
                <p>We strive to provide accurate information about our products, including descriptions and pricing. However, we do not warrant that product descriptions or other content are accurate, complete, reliable, current, or error-free.</p>
                
                <h3 className="text-xl font-serif font-bold text-zinc-900 mt-8">Ordering & Payment</h3>
                <p>By placing an order, you are offering to purchase a product. All orders are subject to availability and confirmation of the order price. We accept various payment methods as indicated on our checkout page.</p>
                
                <h3 className="text-xl font-serif font-bold text-zinc-900 mt-8">Shipping & Delivery</h3>
                <p>Delivery times may vary based on your location. We are not responsible for any delays caused by the shipping carrier or customs processing.</p>
                
                <h3 className="text-xl font-serif font-bold text-zinc-900 mt-8">Limitation of Liability</h3>
                <p>Elegan BD shall not be liable for any special or consequential damages that result from the use of, or the inability to use, the materials on this site or the performance of the products.</p>
                
                <h3 className="text-xl font-serif font-bold text-zinc-900 mt-8">Governing Law</h3>
                <p>These Terms & Conditions are governed by and construed in accordance with the laws of Bangladesh.</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onUpdateQty={updateCartQty}
        onRemove={removeFromCart}
        onCheckout={() => {
          const hasOutOfStock = cart.some(item => {
            if (item.stockMap && item.selectedColor && item.selectedSize) {
              return (item.stockMap[item.selectedColor]?.[item.selectedSize] || 0) <= 0;
            }
            return (item.stock || 0) <= 0;
          });

          if (hasOutOfStock) {
            showToast('Some items in your cart are out of stock. Please remove them to proceed.', 'error');
            return;
          }

          setIsCartOpen(false);
          setCurrentPage('checkout');
        }}
      />

      <UserPanel 
        isOpen={isUserOpen}
        onClose={() => setIsUserOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
