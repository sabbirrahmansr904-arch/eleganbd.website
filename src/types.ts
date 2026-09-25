export interface User {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
  wishlist?: string[];
}

export interface Product {
  id: number | string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[] | string;
  fabric: string;
  fit: string;
  description: string;
  sizes: any[];
  colors?: string[];
  stockMap?: { [color: string]: { [size: string]: number } };
  stock?: number;
  stockStatus?: 'In Stock' | 'Out of Stock' | 'Low Stock';
  rating: number;
  reviews: number;
}

export interface CartItem extends Product {
  selectedSize: any;
  selectedColor?: string;
  quantity: number;
}

export interface Order {
  id?: string | number;
  user_id?: string | number;
  customer_name: string;
  phone: string;
  address: string;
  total_amount: number;
  items: CartItem[] | string;
  status?: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  payment_method?: string;
  transaction_id?: string;
  created_at?: string;
}

export interface Banner {
  id: string | number;
  image: string; // Desktop banner (1920 × 700 px)
  mobile_image?: string; // Mobile banner
  mobile_ratio?: 'auto' | '16/9' | '2/1' | '4/3' | '1/1' | '4/5' | '8/9';
  mobile_fit?: 'contain' | 'cover';
  mobile_height?: number;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
  created_at?: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  expiry_date: string;
  is_active: number;
  created_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
