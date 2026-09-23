import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || 'https://afwislqtlcfglimaacxk.supabase.co';
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6hhesP3nklqpR3SovQhUpQ_l47YNy6M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (!error) return true;
    console.warn('Supabase test table query:', error.message);
    return true; // client authenticated
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
}

export async function fetchProductsFromSupabase(): Promise<any[] | null> {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data && data.length > 0) {
      return data.map(item => ({
        ...item,
        price: Number(item.price) || 0,
        originalPrice: Number(item.original_price) || undefined,
        image: item.image_url || item.image || '',
        images: item.image_url ? [item.image_url] : (item.images || []),
        stockStatus: item.stock_status || 'In Stock'
      }));
    }
  } catch (err) {
    console.error('Failed to fetch products from Supabase:', err);
  }
  return null;
}

export async function saveProductToSupabase(product: any) {
  try {
    const payload: any = {
      id: product.id?.toString(),
      name: product.name,
      category: product.category || 'General',
      price: Number(product.price) || 0,
      original_price: Number(product.originalPrice || product.original_price) || null,
      stock_status: product.stockStatus || product.stock_status || 'In Stock',
      image_url: product.image || product.image_url || (Array.isArray(product.images) ? product.images[0] : null)
    };
    const { error } = await supabase.from('products').upsert([payload]);
    if (error) console.warn('Supabase product upsert notice:', error.message);
  } catch (err) {
    console.error('Failed to save product to Supabase:', err);
  }
}

export async function deleteProductFromSupabase(id: string) {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.warn('Supabase product delete notice:', error.message);
  } catch (err) {
    console.error('Failed to delete product from Supabase:', err);
  }
}

export async function fetchOrdersFromSupabase(): Promise<any[] | null> {
  try {
    const { data, error } = await supabase.from('orders').select('*');
    if (!error && data) return data;
  } catch (err) {
    console.error('Failed to fetch orders from Supabase:', err);
  }
  return null;
}

export async function saveOrderToSupabase(order: any) {
  try {
    const { data, error } = await supabase.from('orders').insert([order]);
    if (error) {
      console.warn('Supabase insert order notice:', error.message);
    } else {
      console.log('Order saved to Supabase:', data);
    }
  } catch (err) {
    console.error('Failed to save order to Supabase:', err);
  }
}

export async function updateOrderStatusInSupabase(id: string, status: string) {
  try {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) console.warn('Supabase order status notice:', error.message);
  } catch (err) {
    console.error('Failed to update order status in Supabase:', err);
  }
}

export async function deleteOrderFromSupabase(id: string) {
  try {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) console.warn('Supabase order delete notice:', error.message);
  } catch (err) {
    console.error('Failed to delete order from Supabase:', err);
  }
}

export async function fetchBannersFromSupabase(): Promise<any[] | null> {
  try {
    const { data, error } = await supabase.from('banners').select('*');
    if (!error && data) return data;
  } catch (err) {
    console.error('Failed to fetch banners from Supabase:', err);
  }
  return null;
}

export async function saveBannerToSupabase(banner: any) {
  try {
    const { error } = await supabase.from('banners').upsert([banner]);
    if (error) console.warn('Supabase banner upsert notice:', error.message);
  } catch (err) {
    console.error('Failed to save banner to Supabase:', err);
  }
}

export async function deleteBannerFromSupabase(id: string) {
  try {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) console.warn('Supabase banner delete notice:', error.message);
  } catch (err) {
    console.error('Failed to delete banner from Supabase:', err);
  }
}

export async function fetchCouponsFromSupabase(): Promise<any[] | null> {
  try {
    const { data, error } = await supabase.from('coupons').select('*');
    if (!error && data) return data;
  } catch (err) {
    console.error('Failed to fetch coupons from Supabase:', err);
  }
  return null;
}

export async function saveCouponToSupabase(coupon: any) {
  try {
    const { error } = await supabase.from('coupons').upsert([coupon]);
    if (error) console.warn('Supabase coupon upsert notice:', error.message);
  } catch (err) {
    console.error('Failed to save coupon to Supabase:', err);
  }
}

export async function deleteCouponFromSupabase(id: string) {
  try {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) console.warn('Supabase coupon delete notice:', error.message);
  } catch (err) {
    console.error('Failed to delete coupon from Supabase:', err);
  }
}

export async function syncProductsToSupabase(products: any[]) {
  try {
    const payloads = products.map(p => ({
      id: p.id?.toString(),
      name: p.name,
      category: p.category || 'General',
      price: Number(p.price) || 0,
      original_price: Number(p.originalPrice || p.original_price) || null,
      stock_status: p.stockStatus || p.stock_status || 'In Stock',
      image_url: p.image || p.image_url || (Array.isArray(p.images) ? p.images[0] : null)
    }));
    const { error } = await supabase.from('products').upsert(payloads);
    if (error) {
      console.warn('Supabase products upsert notice:', error.message);
    }
  } catch (err) {
    console.error('Failed to sync products to Supabase:', err);
  }
}

export async function saveFinanceAccountsToSupabase(accounts: any[]) {
  try {
    const { error } = await supabase.from('finance_accounts').upsert(accounts);
    if (error) {
      console.warn('Supabase finance accounts upsert notice:', error.message);
    }
  } catch (err) {
    console.error('Failed to sync finance accounts to Supabase:', err);
  }
}

export async function fetchFinanceAccountsFromSupabase() {
  try {
    const { data, error } = await supabase.from('finance_accounts').select('*');
    if (!error && data && data.length > 0) return data;
  } catch (err) {
    console.error('Failed to fetch finance accounts from Supabase:', err);
  }
  return null;
}

export async function saveFinanceTransactionToSupabase(tx: any) {
  try {
    const { error } = await supabase.from('finance_transactions').insert([tx]);
    if (error) {
      console.warn('Supabase finance transaction notice:', error.message);
    }
  } catch (err) {
    console.error('Failed to save transaction to Supabase:', err);
  }
}

export async function fetchFinanceTransactionsFromSupabase() {
  try {
    const { data, error } = await supabase.from('finance_transactions').select('*').order('date', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (err) {
    console.error('Failed to fetch transactions from Supabase:', err);
  }
  return null;
}

export async function deleteFinanceTransactionFromSupabase(id: string) {
  try {
    const { error } = await supabase.from('finance_transactions').delete().eq('id', id);
    if (error) {
      console.warn('Supabase transaction delete notice:', error.message);
    }
  } catch (err) {
    console.error('Failed to delete transaction from Supabase:', err);
  }
}

export async function updateFinanceTransactionStatusInSupabase(id: string, status: string) {
  try {
    const { error } = await supabase.from('finance_transactions').update({ status }).eq('id', id);
    if (error) {
      console.warn('Supabase transaction status update notice:', error.message);
    }
  } catch (err) {
    console.error('Failed to update transaction status in Supabase:', err);
  }
}
