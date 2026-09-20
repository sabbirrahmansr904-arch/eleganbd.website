/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Product, CartItem, User, Order, Banner, Coupon, Review } from './types';
import { db, auth, storage } from './firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, setDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  onSelectCategory
}: { 
  cartCount: number, 
  onOpenCart: () => void, 
  onOpenUser: () => void,
  onNavigate: (page: string) => void,
  user: User | null,
  searchQuery: string,
  setSearchQuery: (query: string) => void,
  onSelectCategory?: (category: string) => void
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const categories = [
    { label: 'All Products', value: '' },
    { label: 'Formal Pant', value: 'Formal Pant' },
    { label: 'Formal Shirt', value: 'Formal Shirt' },
    { label: 'Executive Shirt', value: 'Formal Shirt' },
    { label: 'Casual Shirt', value: 'Casual Shirt' },
    { label: 'Polo Shirt', value: 'Polo Shirt' },
    { label: 'Blazer', value: 'Blazer' }
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
                    {categories.map((cat, idx) => (
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
                      {categories.map((cat, idx) => (
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
              src={banners[currentIndex].image || banners[currentIndex].mobile_image || ''}
              alt={banners[currentIndex].title || 'Hero Banner'}
              className="w-full aspect-[800/900] md:aspect-[1920/700] object-cover block"
              referrerPolicy="no-referrer"
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

const TrustFeatureBadges = () => {
  const features = [
    {
      icon: <Truck size={22} className="text-white" strokeWidth={2.2} />,
      title: 'Cash On Delivery',
      subtitle: 'Check before you pay',
    },
    {
      icon: <ShieldCheck size={22} className="text-white" strokeWidth={2.2} />,
      title: '100% Premium Fabric',
      subtitle: 'Quality Guaranteed',
    },
    {
      icon: <ArrowLeftRight size={22} className="text-white" strokeWidth={2.2} />,
      title: 'Easy Exchange',
      subtitle: 'Free size change in 7 days',
    },
    {
      icon: <Headphones size={22} className="text-white" strokeWidth={2.2} />,
      title: '24/7 Support',
      subtitle: 'Instant help via call or message',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 md:mt-8 mb-6 sm:mb-8 md:mb-10 relative z-20">
      <div className="bg-white rounded-[22px] sm:rounded-[26px] md:rounded-[28px] border border-zinc-200/90 shadow-xs hover:shadow-md transition-shadow duration-300 p-4 sm:p-5 md:p-6 lg:p-7">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 sm:gap-3.5 md:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-[14px] md:rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
                {item.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-xs sm:text-[13px] md:text-sm lg:text-[15px] font-bold text-zinc-900 leading-tight tracking-tight font-sans">
                  {item.title}
                </h4>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-zinc-500 font-normal leading-tight mt-0.5 sm:mt-1 font-sans">
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

const FeaturedCollection = ({ products, onSelect, user, onToggleWishlist }: { 
  products: Product[], 
  onSelect: (p: Product) => void, 
  user?: User | null, 
  onToggleWishlist?: (e: React.MouseEvent, p: Product) => void 
}) => {
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  
  const categories = ['All', 'Formal Pant', 'Formal Shirt', 'Blazer'];

  const filteredProducts = products.filter(p => {
    if (activeTab === 'All') return true;
    return p.category === activeTab;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // default
  });

  return (
    <section className="py-16 md:py-24 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#111827] mb-4 tracking-tight">Featured Collection</h2>
          <div className="h-[2px] w-32 bg-[#cca94b] mx-auto mb-10"></div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-8 py-3 rounded-[30px] font-medium text-sm transition-all duration-300 border ${
                  activeTab === category 
                    ? 'bg-[#cfa83b] text-[#111827] border-[#cfa83b] shadow-md transform -translate-y-0.5' 
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-[#cfa83b] hover:text-[#111827]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex justify-center mb-10 relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-zinc-200 text-zinc-600 text-sm rounded-[30px] px-6 py-2.5 pr-10 outline-none focus:border-[#cfa83b] hover:border-[#cfa83b] transition-colors cursor-pointer"
            >
              <option value="default">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 justify-center w-32">
              <svg className="w-4 h-4 text-zinc-400 -mr-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
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
          const cardWidth = window.innerWidth < 768 ? 280 : 320;
          scrollRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
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
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-8 pb-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, idx) => (
          <div key={`${product.id}-${idx}`} className="min-w-[280px] md:min-w-[320px] snap-start">
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
          const cardWidth = window.innerWidth < 768 ? 280 : 320;
          scrollRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, idx) => (
          <div key={`${product.id}-${idx}`} className="min-w-[280px] md:min-w-[320px] snap-start">
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

  const getImages = (images: any) => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [images];
      } catch (e) {
        return [images];
      }
    }
    return [];
  };

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
          
          {getImages(product.images).length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {getImages(product.images).map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square border-2 overflow-hidden transition-all ${activeImage === img ? 'border-zinc-900' : 'border-transparent hover:border-zinc-200'}`}
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
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Select Color</h4>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(product.colors) ? product.colors : (typeof product.colors === 'string' ? (product.colors as string).split(',').map(c => c.trim()).filter(Boolean) : [])).map(color => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color as string);
                    setSelectedSize(null);
                  }}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${selectedColor === color ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg' : 'border-zinc-200 text-zinc-500 hover:border-zinc-900'}`}
                >
                  {color}
                </button>
              ))}
            </div>
            {!selectedColor && (Array.isArray(product.colors) ? product.colors : []).length > 0 && (
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-2 animate-pulse">Please select a color first</p>
            )}
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Select Size</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(Array.isArray(product.sizes) ? product.sizes : (typeof product.sizes === 'string' ? (product.sizes as string).split(',').map(s => s.trim()).filter(Boolean) : [])).map(size => {
                const stock = selectedColor && product.stockMap ? (product.stockMap[selectedColor]?.[size] || 0) : 0;
                const isOutOfStock = selectedColor && stock <= 0;
                const hasColors = (Array.isArray(product.colors) ? product.colors : (typeof product.colors === 'string' ? (product.colors as string).split(',') : [])).filter(Boolean).length > 0;

                if (isOutOfStock) return null;

                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={hasColors && !selectedColor}
                    className={`py-3 text-sm font-medium border transition-all ${selectedSize === size ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-600 hover:border-zinc-900'} ${hasColors && !selectedColor ? 'opacity-30 cursor-not-allowed' : ''}`}
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

const CheckoutPage = ({ items, onBack, onComplete, showToast }: { items: CartItem[], onBack: () => void, onComplete: (orderId?: string) => void, showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
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
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, paymentMethod: 'COD'})}
                  className={`w-full p-4 border flex items-center justify-between transition-all ${formData.paymentMethod === 'COD' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'}`}
                >
                  <span className="font-medium">Cash on Delivery (COD)</span>
                  {formData.paymentMethod === 'COD' && <ShieldCheck className="text-zinc-900" size={20} />}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({...formData, paymentMethod: 'bKash'})}
                  className={`w-full p-4 border flex items-center justify-between transition-all ${formData.paymentMethod === 'bKash' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://i.postimg.cc/FNktNhrf/1656234782bkash-app-logo.png" 
                      alt="bKash" 
                      className="w-8 h-8 object-contain rounded"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-medium">bKash Send Money</span>
                  </div>
                  {formData.paymentMethod === 'bKash' && <ShieldCheck className="text-zinc-900" size={20} />}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({...formData, paymentMethod: 'Nagad'})}
                  className={`w-full p-4 border flex items-center justify-between transition-all ${formData.paymentMethod === 'Nagad' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://i.postimg.cc/Dv0j6cmq/images.png" 
                      alt="Nagad" 
                      className="w-8 h-8 object-contain rounded"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-medium">Nagad Send Money</span>
                  </div>
                  {formData.paymentMethod === 'Nagad' && <ShieldCheck className="text-zinc-900" size={20} />}
                </button>
              </div>

              {formData.paymentMethod === 'COD' ? (
                <p className="text-xs text-zinc-400 mt-2 italic">Pay when you receive the product at your doorstep.</p>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-zinc-900 text-white rounded-xl space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-sm text-white/60">Send Money to:</span>
                    <span className="text-lg font-bold tracking-wider">01631496122</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-white/60 leading-relaxed">
                      Please send <span className="text-white font-bold">৳{total}</span> to the number above using {formData.paymentMethod} "Send Money" option. After sending, enter the Transaction ID below.
                    </p>
                    <input 
                      required
                      type="text"
                      placeholder="Enter Transaction ID"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/40 transition-all"
                      value={formData.transactionId}
                      onChange={e => setFormData({...formData, transactionId: e.target.value})}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full btn-primary py-4 mt-8 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Order'}
              {!isSubmitting && <ChevronRight size={18} />}
            </button>
          </form>
        </div>

        <div className="bg-zinc-50 p-8 h-fit sticky top-32">
          <h2 className="text-xl font-serif font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-8">
            {items.map(item => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor || ''}`} className="flex justify-between items-start text-sm">
                <div className="flex flex-col">
                  <span className="text-zinc-600 font-medium">
                    {item.name} ({item.selectedSize}{item.selectedColor ? `, ${item.selectedColor}` : ''}) x {item.quantity}
                  </span>
                  {(item.stockMap && item.selectedColor && item.selectedSize ? 
                    (item.stockMap[item.selectedColor]?.[item.selectedSize] || 0) <= 0 : 
                    (item.stock || 0) <= 0) && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Stock Out</span>
                    </div>
                  )}
                </div>
                <span className="font-bold whitespace-nowrap">৳{item.price * item.quantity}</span>
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
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ onBack, onRefreshProducts, onRefreshBanners, onRefreshPromoImage, onRefreshHeroVideo, onRefreshHeroImage, showToast }: { onBack: () => void, onRefreshProducts: () => void, onRefreshBanners: () => void, onRefreshPromoImage: () => void, onRefreshHeroVideo: () => void, onRefreshHeroImage: () => void, showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [topRatedOfferImage, setTopRatedOfferImage] = useState('');
  const [categories, setCategories] = useState<string[]>(['Formal Pant', 'Formal Shirt', 'Blazer', 'Office Wear', 'Premium Collection', 'Best Seller', 'Cuban Shirt']);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
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
  }, []);

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
    fabric: 'Woven Cotton',
    fit: 'Slim Fit',
    description: '',
    sizes: '30, 32, 34, 36, 38',
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

  const parseProductSizes = (sizes: any): string[] => {
    if (Array.isArray(sizes) && sizes.length > 0) {
      return sizes.map((s: any) => String(s).trim()).filter(Boolean);
    }
    if (typeof sizes === 'string' && sizes.trim().length > 0) {
      return sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    return ['30', '32', '34', '36', '38'];
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

  const initializeMasterStock = (items: Product[]) => {
    const initEdits: typeof masterStockEdits = {};
    items.forEach(p => {
      const pSizes = parseProductSizes(p.sizes);
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
        getDocs(collection(db, 'orders')).then(snapshot => {
          setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
      } else if (activeTab === 'products' || activeTab === 'master-table' || activeTab === 'dashboard') {
        getDocs(collection(db, 'products')).then(snapshot => {
          const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
          setProducts(prods);
          initializeMasterStock(prods);
          setLoading(false);
        });
      } else if (activeTab === 'banners') {
        getDocs(collection(db, 'banners')).then(snapshot => {
          setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
      } else if (activeTab === 'customers') {
        getDocs(collection(db, 'customers')).then(snapshot => {
          setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
      } else if (activeTab === 'coupons') {
        getDocs(collection(db, 'coupons')).then(snapshot => {
          setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
      } else if (activeTab === 'customization') {
        getDoc(doc(db, 'settings', 'top_rated_offer_image')).then(docSnap => {
          if (docSnap.exists()) {
            setTopRatedOfferImage(docSnap.data().value);
          }
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
    const pSizes = parseProductSizes(product.sizes);
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
      Object.values(editData.stockMap).forEach(sizeMap => {
        Object.values(sizeMap || {}).forEach(qty => {
          totalStock += (Number(qty) || 0);
        });
      });
      const dataToUpdate = {
        stockMap: editData.stockMap,
        stock: totalStock,
        stockStatus: editData.stockStatus
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
        Object.values(editData.stockMap).forEach(sizeMap => {
          Object.values(sizeMap || {}).forEach(qty => {
            totalStock += (Number(qty) || 0);
          });
        });
        const dataToUpdate = {
          stockMap: editData.stockMap,
          stock: totalStock,
          stockStatus: editData.stockStatus
        };
        await updateDoc(doc(db, 'products', pIdStr), dataToUpdate);
      }));
      
      setProducts(prev => prev.map(p => {
        const editData = masterStockEdits[p.id.toString()];
        if (editData && editData.hasChanges) {
          let totalStock = 0;
          Object.values(editData.stockMap).forEach(sizeMap => {
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
    const defaultSizes = ['30', '32', '34', '36', '38'];
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
      category: 'Formal Pant',
      price: 0,
      originalPrice: 0,
      image: '',
      fabric: 'Woven Cotton',
      fit: 'Slim Fit',
      description: '',
      sizes: defaultSizes.join(', '),
      colors: defaultColors.join(', '),
      stockMap: initialStockMap,
      stock: 300,
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

      const dataToSave = {
        ...productFormData,
        stock: computedStock,
        stockStatus: autoStatus,
        sizes: parsedSizes,
        colors: parsedColors
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id.toString()), dataToSave);
        showToast('Product updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'products'), {
          ...dataToSave,
          rating: 5.0,
          reviews: 0
        });
        showToast('Product added successfully', 'success');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductFormData({ 
        name: '', 
        price: 0, 
        originalPrice: 0, 
        image: '', 
        fabric: '', 
        fit: '', 
        description: '', 
        sizes: '30, 32, 34, 36, 38',
        colors: 'Black, Navy, Grey',
        stockMap: {},
        stock: 100,
        stockStatus: 'In Stock',
        category: 'Formal Pant' 
      } as any);
      getDocs(collection(db, 'products')).then(snapshot => {
        const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(prods);
        initializeMasterStock(prods);
      });
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
          setProducts(prev => prev.filter(p => p.id !== id));
          onRefreshProducts();
        } catch (err) {
          console.error(err);
        }
        setConfirmDialog({isOpen: false, message: '', onConfirm: () => {}});
      }
    });
  };

  const startEdit = (product: Product) => {
    const pSizes = parseProductSizes(product.sizes);
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

    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      category: product.category || 'Formal Pant',
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'banner' | 'banner_mobile' | 'top_rated_offer' | 'hero_image' = 'product') => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      const url = await compressImage(file);
      
      if (type === 'product') {
        setProductFormData(prev => ({ ...prev, image: url }));
      } else if (type === 'banner') {
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
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('Image upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
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
      if (editingBanner && editingBanner.id) {
        await updateDoc(doc(db, 'banners', editingBanner.id.toString()), bannerFormData);
      } else {
        if (banners.length >= 10) {
          showToast('Maximum 10 banners allowed.', 'error');
          return;
        }
        await addDoc(collection(db, 'banners'), {
          ...bannerFormData,
          created_at: new Date().toISOString()
        });
      }
      setShowBannerForm(false);
      setEditingBanner(null);
      setBannerFormData({ image: '', mobile_image: '', title: '', subtitle: '', buttonText: 'Shop Now', link: '' });
      
      // Refresh local banners list
      const snapshot = await getDocs(collection(db, 'banners'));
      setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      onRefreshBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const clearAllBanners = async () => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete ALL banners? This cannot be undone.',
      onConfirm: async () => {
        try {
          const snapshot = await getDocs(collection(db, 'banners'));
          for (const docRef of snapshot.docs) {
            await deleteDoc(doc(db, 'banners', docRef.id));
          }
          setBanners([]);
          onRefreshBanners();
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
          setBanners(prev => prev.filter(b => b.id !== id));
          onRefreshBanners();
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

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'master-table', name: 'Master Table', icon: <Table size={20} /> },
    { id: 'products', name: 'Product', icon: <Package size={20} /> },
    { id: 'categories', name: 'Categories', icon: <Ticket size={20} /> },
    { id: 'orders', name: 'Order', icon: <ShoppingBag size={20} /> },
    { id: 'customers', name: 'Customer', icon: <Users size={20} /> },
    { id: 'banners', name: 'Banners', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar Toggle (Mobile) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[60] bg-zinc-900 text-white p-4 rounded-full shadow-2xl"
      >
        {isSidebarOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
      </button>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (window.innerWidth < 1024 ? '100%' : 280) : 0, 
          opacity: isSidebarOpen ? 1 : 0,
          x: isSidebarOpen ? 0 : -280
        }}
        className="bg-white border-r border-zinc-200 overflow-hidden fixed h-full z-50 lg:z-40"
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <Logo light={false} />
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2">
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-1 flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors rounded-lg ${
                  activeTab === item.id 
                    ? 'bg-zinc-900 text-white' 
                    : 'text-zinc-500 hover:bg-zinc-100'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
          <div className="mt-10 pt-10 border-t border-zinc-100">
            <button 
              onClick={handleAdminLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[280px]' : 'ml-0'}`}>
        <header className="bg-white border-b border-zinc-200 h-20 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-serif font-bold uppercase tracking-tight">
              {menuItems.find(i => i.id === activeTab)?.name}
            </h2>
          </div>
          <button onClick={onBack} className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900">
            Exit Admin
          </button>
        </header>

        <div className="p-8">

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Revenue</p>
                    <CreditCard size={16} className="text-zinc-300" />
                  </div>
                  <h3 className="text-3xl font-bold">৳{orders.reduce((acc, o) => acc + (o.total_amount || (o as any).totalAmount || 0), 0).toLocaleString()}</h3>
                  <p className="text-xs text-green-600 mt-2 font-medium">Lifetime earnings</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Today Sales</p>
                    <ShoppingBag size={16} className="text-zinc-300" />
                  </div>
                  <h3 className="text-3xl font-bold">
                    ৳{orders
                      .filter(o => new Date(o.created_at || (o as any).createdAt || '').toDateString() === new Date().toDateString())
                      .reduce((acc, o) => acc + (o.total_amount || (o as any).totalAmount || 0), 0)
                      .toLocaleString()}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-2 font-medium">Sales from today</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Pending Orders</p>
                    <RefreshCw size={16} className="text-amber-400" />
                  </div>
                  <h3 className="text-3xl font-bold">{orders.filter(o => o.status?.toLowerCase() === 'pending').length}</h3>
                  <p className="text-xs text-amber-600 mt-2 font-medium">Awaiting confirmation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Orders</p>
                    <Package size={16} className="text-zinc-300" />
                  </div>
                  <h3 className="text-3xl font-bold">{orders.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Customers</p>
                    <Users size={16} className="text-zinc-300" />
                  </div>
                  <h3 className="text-3xl font-bold">{customers.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Products</p>
                    <Package size={16} className="text-zinc-300" />
                  </div>
                  <h3 className="text-3xl font-bold">{products.length}</h3>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'master-table' && (
            <div className="space-y-6">
              {/* Header & Controls */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                      <Table size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-zinc-900">Master Stock Management (মাস্টার স্টক টেবিল)</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Manage and set exact stock quantities per size and variant across all products</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-3 w-full md:w-auto">
                  <button
                    onClick={openAddProductModal}
                    className="px-4 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Plus size={15} />
                    <span>Add Product</span>
                  </button>

                  <button
                    onClick={handleSaveAllStockChanges}
                    disabled={isBulkSaving || (Object.values(masterStockEdits) as any[]).filter(e => e?.hasChanges).length === 0}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm ${
                      (Object.values(masterStockEdits) as any[]).filter(e => e?.hasChanges).length > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                        : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    {isBulkSaving ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    <span>Save All Changes ({(Object.values(masterStockEdits) as any[]).filter(e => e?.hasChanges).length})</span>
                  </button>
                </div>
              </div>

              {/* Metrics Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Total Catalog Products</span>
                  <span className="text-2xl font-bold text-zinc-900">{products.length}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Total Units In Stock</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {products.reduce((acc, p) => {
                      const editData = masterStockEdits[p.id.toString()];
                      if (editData?.stockMap) {
                        let sum = 0;
                        Object.values(editData.stockMap).forEach(sMap => {
                          Object.values(sMap || {}).forEach(qty => { sum += (Number(qty) || 0); });
                        });
                        return acc + sum;
                      }
                      return acc + (p.stock || 0);
                    }, 0).toLocaleString()}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 block mb-1">Low Stock Items (1-10)</span>
                  <span className="text-2xl font-bold text-amber-600">
                    {products.filter(p => {
                      const editData = masterStockEdits[p.id.toString()];
                      let sum = p.stock || 0;
                      if (editData?.stockMap) {
                        let s = 0;
                        Object.values(editData.stockMap).forEach(sMap => {
                          Object.values(sMap || {}).forEach(qty => { s += (Number(qty) || 0); });
                        });
                        sum = s;
                      }
                      return sum > 0 && sum <= 10;
                    }).length}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 block mb-1">Out of Stock</span>
                  <span className="text-2xl font-bold text-red-600">
                    {products.filter(p => {
                      const editData = masterStockEdits[p.id.toString()];
                      let sum = p.stock || 0;
                      if (editData?.stockMap) {
                        let s = 0;
                        Object.values(editData.stockMap).forEach(sMap => {
                          Object.values(sMap || {}).forEach(qty => { s += (Number(qty) || 0); });
                        });
                        sum = s;
                      }
                      return sum === 0;
                    }).length}
                  </span>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search product name, category, or color..."
                    value={masterSearchQuery}
                    onChange={(e) => setMasterSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:bg-white focus:border-zinc-900 transition-all"
                  />
                  {masterSearchQuery && (
                    <button onClick={() => setMasterSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700">
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* Category Filter */}
                  <select
                    value={masterCategoryFilter}
                    onChange={(e) => setMasterCategoryFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-zinc-900"
                  >
                    <option value="All">All Categories ({categories.length})</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {/* Stock Status Filter */}
                  <select
                    value={masterStockFilter}
                    onChange={(e) => setMasterStockFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-zinc-900"
                  >
                    <option value="All">All Stock Status</option>
                    <option value="In Stock">In Stock (&gt;10)</option>
                    <option value="Low Stock">Low Stock (1-10)</option>
                    <option value="Out of Stock">Out of Stock (0)</option>
                  </select>
                </div>
              </div>

              {/* Master Products Stock List */}
              {loading ? (
                <div className="bg-white p-12 rounded-2xl border border-zinc-100 text-center">
                  <RefreshCw size={24} className="animate-spin mx-auto text-zinc-400 mb-3" />
                  <p className="text-sm font-medium text-zinc-500">Loading products inventory...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-zinc-100 text-center">
                  <Package size={36} className="mx-auto text-zinc-300 mb-3" />
                  <h4 className="text-base font-bold text-zinc-900">No products found</h4>
                  <p className="text-xs text-zinc-500 mt-1 mb-4">Add your first product to start managing inventory</p>
                  <button onClick={openAddProductModal} className="btn-primary py-2 px-6 text-xs">
                    Add Product
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {products
                    .filter(product => {
                      const matchesSearch = !masterSearchQuery ||
                        product.name?.toLowerCase().includes(masterSearchQuery.toLowerCase()) ||
                        product.category?.toLowerCase().includes(masterSearchQuery.toLowerCase()) ||
                        (Array.isArray(product.colors) && product.colors.some(c => String(c).toLowerCase().includes(masterSearchQuery.toLowerCase()))) ||
                        (typeof product.colors === 'string' && product.colors.toLowerCase().includes(masterSearchQuery.toLowerCase()));

                      const matchesCat = masterCategoryFilter === 'All' || product.category === masterCategoryFilter;

                      const editData = masterStockEdits[product.id.toString()];
                      let curTotal = product.stock || 0;
                      if (editData?.stockMap) {
                        let sum = 0;
                        Object.values(editData.stockMap).forEach(sMap => {
                          Object.values(sMap || {}).forEach(qty => { sum += (Number(qty) || 0); });
                        });
                        curTotal = sum;
                      }

                      const matchesStock = masterStockFilter === 'All' ||
                        (masterStockFilter === 'In Stock' && curTotal > 10) ||
                        (masterStockFilter === 'Low Stock' && curTotal > 0 && curTotal <= 10) ||
                        (masterStockFilter === 'Out of Stock' && curTotal === 0);

                      return matchesSearch && matchesCat && matchesStock;
                    })
                    .map(product => {
                      const pIdStr = product.id.toString();
                      const editData = masterStockEdits[pIdStr] || { stockMap: product.stockMap || {}, stockStatus: product.stockStatus || 'In Stock' };
                      
                      const pSizes = Array.isArray(product.sizes) && product.sizes.length > 0 
                        ? product.sizes.map(s => String(s).trim()).filter(Boolean) 
                        : (typeof product.sizes === 'string' && product.sizes.trim().length > 0 ? product.sizes.split(',').map(s => s.trim()).filter(Boolean) : ['30', '32', '34', '36', '38']);
                      
                      const pColors = Array.isArray(product.colors) && product.colors.length > 0 
                        ? product.colors.map(c => String(c).trim()).filter(Boolean) 
                        : (typeof product.colors === 'string' && product.colors.trim().length > 0 ? product.colors.split(',').map(c => c.trim()).filter(Boolean) : ['Standard']);

                      let computedTotal = 0;
                      Object.values(editData.stockMap || {}).forEach(sMap => {
                        Object.values(sMap || {}).forEach(qty => {
                          computedTotal += (Number(qty) || 0);
                        });
                      });

                      const isSaving = savingProductId === pIdStr;
                      const isSaved = savedProductSuccess[pIdStr];
                      const hasChanges = editData.hasChanges;

                      return (
                        <div 
                          key={product.id} 
                          className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden ${
                            hasChanges ? 'border-amber-400 ring-2 ring-amber-100' : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          {/* Card Top Row */}
                          <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 bg-zinc-50/50">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0 flex items-center justify-center">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <Package size={24} className="text-zinc-400" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="px-2.5 py-0.5 bg-zinc-900 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    {product.category || 'Product'}
                                  </span>
                                  {hasChanges && (
                                    <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                      Unsaved
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-serif font-bold text-base text-zinc-900 leading-tight">
                                  {product.name}
                                </h4>
                                <div className="flex items-center gap-3 mt-1 text-xs">
                                  <span className="font-bold text-zinc-900">৳{product.price}</span>
                                  {product.originalPrice > product.price && (
                                    <span className="text-zinc-400 line-through">৳{product.originalPrice}</span>
                                  )}
                                  <span className="text-zinc-300">|</span>
                                  <span className="text-zinc-500 font-medium">
                                    {pColors.length} {pColors.length > 1 ? 'Colors' : 'Color'} • {pSizes.length} {pSizes.length > 1 ? 'Sizes' : 'Size'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status & Quick Actions */}
                            <div className="flex items-center flex-wrap gap-3">
                              {/* Total Quantity Pill */}
                              <div className="px-4 py-2 bg-white rounded-xl border border-zinc-200 flex items-center gap-2.5 shadow-sm">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total QN:</span>
                                <span className={`text-base font-bold ${
                                  computedTotal === 0 ? 'text-red-600' : computedTotal <= 10 ? 'text-amber-600' : 'text-emerald-700'
                                }`}>
                                  {computedTotal} <span className="text-xs font-medium text-zinc-500">units</span>
                                </span>
                              </div>

                              {/* Status Badge */}
                              <span className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                computedTotal === 0 ? 'bg-red-50 text-red-700 border border-red-200' :
                                computedTotal <= 10 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                  computedTotal === 0 ? 'bg-red-500' : computedTotal <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} />
                                {computedTotal === 0 ? 'Out of Stock' : computedTotal <= 10 ? 'Low Stock' : 'In Stock'}
                              </span>

                              {/* Save Individual Stock Button */}
                              <button
                                onClick={() => handleSaveProductStock(product.id)}
                                disabled={isSaving}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm ${
                                  isSaved
                                    ? 'bg-emerald-600 text-white'
                                    : hasChanges
                                    ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                              >
                                {isSaving ? (
                                  <RefreshCw size={14} className="animate-spin" />
                                ) : isSaved ? (
                                  <Check size={14} />
                                ) : (
                                  <Save size={14} />
                                )}
                                <span>{isSaved ? 'Saved!' : isSaving ? 'Saving...' : 'Save Stock'}</span>
                              </button>

                              {/* Edit Details Button */}
                              <button
                                onClick={() => startEdit(product)}
                                className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors"
                                title="Edit Full Product Details"
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Size and Color Stock Grid */}
                          <div className="p-5 space-y-5">
                            {pColors.map(color => (
                              <div key={color} className="bg-zinc-50/70 border border-zinc-200/80 rounded-xl p-4">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 pb-2 border-b border-zinc-200">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full border border-zinc-900 bg-zinc-800" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">{color}</span>
                                    <span className="text-[10px] text-zinc-400 font-medium">
                                      ({pSizes.reduce((sAcc, s) => sAcc + (Number(editData.stockMap?.[color]?.[s]) || 0), 0)} pcs in {color})
                                    </span>
                                  </div>

                                  {/* Quick Fill presets for this color */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mr-1">Quick Set:</span>
                                    {[0, 10, 20, 50, 100].map(amt => (
                                      <button
                                        key={amt}
                                        type="button"
                                        onClick={() => handleMasterQuickFill(product.id, color, amt)}
                                        className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-zinc-900 hover:text-white border border-zinc-200 rounded text-zinc-600 transition-colors"
                                      >
                                        {amt === 0 ? 'Clear (0)' : amt}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Sizes Matrix */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                  {pSizes.map(size => {
                                    const qty = editData.stockMap?.[color]?.[size] ?? 0;
                                    return (
                                      <div 
                                        key={size} 
                                        className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-400 transition-all shadow-xs"
                                      >
                                        <div className="bg-zinc-900 text-white text-[11px] font-bold py-1 px-2 flex justify-between items-center tracking-wider">
                                          <span>SIZE {size}</span>
                                          <span className="text-[9px] font-mono opacity-80">QN</span>
                                        </div>

                                        <div className="p-2">
                                          <div className="flex items-center justify-between gap-1">
                                            <button
                                              type="button"
                                              onClick={() => handleMasterStockChange(product.id, color, size, Math.max(0, qty - 1))}
                                              className="w-7 h-7 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold transition-colors select-none"
                                            >
                                              -
                                            </button>
                                            <input
                                              type="number"
                                              min="0"
                                              value={qty}
                                              onChange={(e) => handleMasterStockChange(product.id, color, size, parseInt(e.target.value) || 0)}
                                              className="w-full text-center font-bold text-sm text-zinc-900 bg-transparent py-1 outline-none border-b border-transparent focus:border-zinc-900"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleMasterStockChange(product.id, color, size, qty + 1)}
                                              className="w-7 h-7 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold transition-colors select-none"
                                            >
                                              +
                                            </button>
                                          </div>

                                          <div className="mt-1.5 text-center">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${
                                              qty === 0 ? 'bg-red-100 text-red-700' :
                                              qty <= 5 ? 'bg-amber-100 text-amber-800' :
                                              'bg-emerald-50 text-emerald-700'
                                            }`}>
                                              {qty === 0 ? 'Out of Stock' : qty <= 5 ? `Low (${qty})` : `In Stock (${qty})`}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="max-w-md">
              <h3 className="text-xl font-serif font-bold mb-6">Product Categories</h3>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const newCat = (e.target as any).category.value;
                  if (newCat && !categories.includes(newCat)) {
                    setCategories([...categories, newCat]);
                    (e.target as any).category.value = '';
                  }
                }} className="flex gap-4 mb-8">
                  <input name="category" placeholder="New Category Name" className="flex-grow border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" />
                  <button type="submit" className="btn-primary px-6 py-2 text-xs">Add</button>
                </form>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <div key={cat} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
                      <span className="text-sm font-medium">{cat}</span>
                      <button onClick={() => setCategories(categories.filter(c => c !== cat))} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
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
                  onClick={() => {
                    setEditingProduct(null);
                    setProductFormData({
                      name: '',
                      category: 'Formal Pant',
                      price: 0,
                      originalPrice: 0,
                      image: '',
                      fabric: 'Woven Cotton',
                      fit: 'Slim Fit',
                      description: '',
                      sizes: '30, 32, 34, 36, 38',
                      colors: 'Black, Navy, Grey',
                      stock: 100,
                      stockStatus: 'In Stock'
                    });
                    setShowProductForm(true);
                  }}
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
                          if (newCat === 'Cuban Shirt') {
                            setProductFormData({...productFormData, category: newCat, sizes: 'M, L, XL, XXL', price: 599, originalPrice: 599});
                          } else {
                            setProductFormData({...productFormData, category: newCat});
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
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Product Image</label>
                        <div className="flex gap-4 items-center">
                          {productFormData.image && <img src={productFormData.image} alt="Preview" className="w-20 h-20 object-cover rounded border border-zinc-200" referrerPolicy="no-referrer" />}
                          <div className="flex-grow">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'product')} className="hidden" id="product-image-upload" />
                            <label htmlFor="product-image-upload" className="inline-block px-6 py-2 border border-zinc-200 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-zinc-50 transition-colors">
                              {isUploading ? 'Uploading...' : 'Upload from Device'}
                            </label>
                            <input className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900 text-sm mt-2" value={productFormData.image} onChange={e => setProductFormData({...productFormData, image: e.target.value})} placeholder="https://..." />
                          </div>
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
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Sizes (comma separated)</label>
                        <input className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-900" value={productFormData.sizes} onChange={e => setProductFormData({...productFormData, sizes: e.target.value})} placeholder="30, 32, 34, 36, 38" />
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
                            const parsedFormSizes = (typeof productFormData.sizes === 'string' && productFormData.sizes.trim().length > 0)
                              ? productFormData.sizes.split(',').map(s => s.trim()).filter(Boolean)
                              : ['30', '32', '34', '36', '38'];

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
                                                const updated = {
                                                  ...productFormData.stockMap,
                                                  [color]: {
                                                    ...(productFormData.stockMap[color] || {}),
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
                                                const updated = {
                                                  ...productFormData.stockMap,
                                                  [color]: {
                                                    ...(productFormData.stockMap[color] || {}),
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
                                                const updated = {
                                                  ...productFormData.stockMap,
                                                  [color]: {
                                                    ...(productFormData.stockMap[color] || {}),
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
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Contact</th>
                      <th className="py-4 px-6">Address</th>
                      <th className="py-4 px-6">Total Orders</th>
                      <th className="py-4 px-6">Join Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {customers.map(customer => {
                      const customerOrders = orders.filter(o => o.phone === customer.phone || o.customer_name === customer.name);
                      return (
                        <tr key={customer.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-bold">{customer.name}</p>
                            <p className="text-xs text-zinc-400">{customer.email}</p>
                          </td>
                          <td className="py-4 px-6">{customer.phone || 'N/A'}</td>
                          <td className="py-4 px-6 text-xs max-w-xs truncate">{customer.address || 'N/A'}</td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-1 bg-zinc-100 rounded-full text-xs font-bold">{customerOrders.length}</span>
                          </td>
                          <td className="py-4 px-6 text-zinc-500">{new Date(customer.created_at || '').toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
    <footer className="bg-zinc-900 text-white pt-16 md:pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <Logo className="mb-6" />
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-xs">
              Premium formal wear for the modern gentleman. Crafted with precision, designed for elegance.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Phone size={18} />
              </a>
            </div>
          </div>
          
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-white/50">Quick Links</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Shop All</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">New Arrivals</button></li>
              <li><button onClick={() => onNavigate('returns-policy')} className="hover:text-white transition-colors">Returns & Exchange</button></li>
            </ul>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-white/50">Customer Care</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><button onClick={() => onNavigate('track-order')} className="hover:text-white transition-colors font-bold text-white">Track Your Order</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About Elegan BD</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact Us</button></li>
              <li><button onClick={() => onNavigate('privacy-policy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('terms-conditions')} className="hover:text-white transition-colors">Terms & Conditions</button></li>
            </ul>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-white/50">Contact Info</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Mail size={16} className="text-zinc-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email Us</p>
                  <p className="text-sm text-zinc-300">eleganbdltd@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Phone size={16} className="text-zinc-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Call Us</p>
                  <p className="text-sm text-zinc-300">+8801631496122</p>
                  <p className="text-sm text-zinc-300">+8801623-766036</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              2026 ELEGAN BD. All Rights Reserved.
            </p>
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-600 mt-1">
              Developed by Sabbir Rahman
            </p>
          </div>
          <button 
            onClick={() => onNavigate('admin')} 
            className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 hover:text-zinc-400 transition-colors"
          >
            Admin
          </button>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('elegan_page') || 'home');
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [topRatedOfferImage, setTopRatedOfferImage] = useState('');
  const [heroVideo, setHeroVideo] = useState('https://assets.mixkit.co/videos/preview/mixkit-man-in-a-suit-walking-slowly-4848-large.mp4');
  const [heroImage, setHeroImage] = useState('https://i.imgur.com/Vriu71z.png');
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

  const defaultProducts: Product[] = [
    {
      id: 'default_cuban_shirt',
      name: "Classic Cuban Collar Shirt",
      price: 599,
      originalPrice: 899,
      image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1000&auto=format&fit=crop",
      category: "Cuban Shirt",
      rating: 4.8,
      reviews: 56,
      fabric: "Viscose Rayon",
      fit: "Relaxed Fit",
      description: "Comfortable and stylish Cuban collar shirt for a relaxed look.",
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["Black", "White", "Navy"],
      stock: 50
    },
    {
      id: 'default_navy_pant',
      name: "Premium Navy Formal Pant",
      price: 1250,
      originalPrice: 1850,
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop",
      category: "Formal Pant",
      rating: 4.9,
      reviews: 124,
      fabric: "Premium Tropical",
      fit: "Slim Fit",
      description: "Our signature formal pant designed for maximum comfort and style.",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Navy", "Black", "Grey"],
      stock: 45
    },
    {
      id: 'default_white_shirt',
      name: "Classic White Formal Shirt",
      price: 1450,
      originalPrice: 1950,
      image: "https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1000&auto=format&fit=crop",
      category: "Formal Shirt",
      rating: 4.8,
      reviews: 86,
      fabric: "Egyptian Cotton",
      fit: "Regular Fit",
      description: "A timeless classic white shirt for every formal occasion.",
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["White"],
      stock: 40
    },
    {
      id: 'default_sky_shirt',
      name: "Sky Blue Executive Shirt",
      price: 1550,
      originalPrice: 2150,
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop",
      category: "Formal Shirt",
      rating: 4.9,
      reviews: 92,
      fabric: "Giza Cotton",
      fit: "Slim Fit",
      description: "Professional sky blue shirt with a premium finish.",
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["Sky Blue"],
      stock: 35
    },
    {
      id: 'default_grey_pant',
      name: "Charcoal Grey Formal Pant",
      price: 1250,
      originalPrice: 1850,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop",
      category: "Formal Pant",
      rating: 4.7,
      reviews: 108,
      fabric: "Premium Tropical",
      fit: "Slim Fit",
      description: "Versatile charcoal grey pant for daily office wear.",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Grey", "Charcoal"],
      stock: 50
    },
    {
      id: 'default_black_shirt',
      name: "Midnight Black Formal Shirt",
      price: 1650,
      originalPrice: 2250,
      image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1000&auto=format&fit=crop",
      category: "Formal Shirt",
      rating: 4.8,
      reviews: 74,
      fabric: "Oxford Cotton",
      fit: "Slim Fit",
      description: "Elegant black shirt for evening events and formal meetings.",
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["Black"],
      stock: 30
    },
    {
      id: 'default_pink_shirt',
      name: "Light Pink Formal Shirt",
      price: 1450,
      originalPrice: 1950,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop",
      category: "Formal Shirt",
      rating: 4.7,
      reviews: 65,
      fabric: "Premium Cotton",
      fit: "Regular Fit",
      description: "Sophisticated light pink shirt for a modern look.",
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["Pink"],
      stock: 25
    },
    {
      id: 'default_striped_shirt',
      name: "Striped Executive Shirt",
      price: 1750,
      originalPrice: 2450,
      image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1000&auto=format&fit=crop",
      category: "Formal Shirt",
      rating: 4.9,
      reviews: 58,
      fabric: "Italian Cotton",
      fit: "Slim Fit",
      description: "Premium striped shirt for the bold professional.",
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["Striped Navy"],
      stock: 20
    }
  ];

  const defaultBanners: Banner[] = [
    {
      id: 'default_hero_banner',
      image: 'https://images.unsplash.com/photo-1490515642209-717d61d5b0f0?auto=format&fit=crop&q=80&w=1920&h=700',
      mobile_image: 'https://images.unsplash.com/photo-1490515642209-717d61d5b0f0?auto=format&fit=crop&q=80&w=800&h=900',
      title: '',
      subtitle: '',
      buttonText: 'SHOP NOW!',
      link: '/shop'
    }
  ];

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (data.length === 0) {
        setProducts(defaultProducts);
      } else {
        setProducts(data as Product[]);
      }
    } catch (err) {
      console.warn('Firestore fetch products notice:', err);
      setProducts(defaultProducts);
    }
  };

  const fetchBanners = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'banners'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length === 0) {
        setBanners(defaultBanners);
      } else {
        setBanners(data as Banner[]);
      }
    } catch (err) {
      console.warn('Firestore fetch banners notice:', err);
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

  useEffect(() => {
    fetchProducts();
    fetchBanners();
    fetchPromoImage();
    fetchHeroVideo();
    fetchHeroImage();

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
              products={products}
              onSelect={handleProductSelect}
              user={user}
              onToggleWishlist={handleToggleWishlist}
            />

            <AutoScrollCarousel products={interleavedProducts} onSelect={handleProductSelect} user={user} onToggleWishlist={handleToggleWishlist} />

            {/* Top Rated Products Section */}
            <section className="py-16 md:py-32 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-20">
                  <h2 className="text-3xl md:text-6xl font-serif font-bold text-zinc-900 mb-6 tracking-tight">Top Rated Products</h2>
                  <p className="max-w-2xl mx-auto text-zinc-500 text-sm md:text-lg leading-relaxed">
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
                    <option value="Formal Pant">Formal Pant</option>
                    <option value="Formal Shirt">Formal Shirt</option>
                    <option value="Blazer">Blazer</option>
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
