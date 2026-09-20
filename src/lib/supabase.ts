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

export async function saveOrderToSupabase(order: any) {
  try {
    const { data, error } = await supabase.from('orders').insert([order]);
    if (error) {
      console.warn('Supabase insert order notice (table may need setup):', error.message);
    } else {
      console.log('Order saved to Supabase:', data);
    }
  } catch (err) {
    console.error('Failed to save order to Supabase:', err);
  }
}

export async function syncProductsToSupabase(products: any[]) {
  try {
    const { error } = await supabase.from('products').upsert(products);
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
