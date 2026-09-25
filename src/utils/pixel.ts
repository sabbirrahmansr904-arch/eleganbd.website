declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

export const FB_PIXEL_ID = '1042867071937473';

export const trackPixelEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      if (params) {
        window.fbq('track', eventName, params);
      } else {
        window.fbq('track', eventName);
      }
    }
  } catch (err) {
    console.warn(`Facebook Pixel track (${eventName}) notice:`, err);
  }
};

export const trackPixelCustomEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, params);
    }
  } catch (err) {
    console.warn(`Facebook Pixel custom track (${eventName}) notice:`, err);
  }
};

export const trackPageView = (pageName?: string) => {
  trackPixelEvent('PageView', pageName ? { page_name: pageName } : undefined);
};

export const trackViewContent = (product: { id: string | number; name: string; price: number; category?: string }) => {
  trackPixelEvent('ViewContent', {
    content_name: product.name,
    content_category: product.category || 'Clothing',
    content_ids: [product.id.toString()],
    content_type: 'product',
    value: Number(product.price) || 0,
    currency: 'BDT'
  });
};

export const trackAddToCart = (
  product: { id: string | number; name: string; price: number; category?: string },
  quantity = 1,
  size?: string,
  color?: string
) => {
  trackPixelEvent('AddToCart', {
    content_name: product.name,
    content_category: product.category || 'Clothing',
    content_ids: [product.id.toString()],
    content_type: 'product',
    value: (Number(product.price) || 0) * (quantity || 1),
    currency: 'BDT',
    num_items: quantity || 1,
    size: size || '',
    color: color || ''
  });
};

export const trackInitiateCheckout = (
  items: Array<{ id?: string | number; product_id?: string | number; name?: string; price: number; quantity: number }>,
  totalValue: number
) => {
  trackPixelEvent('InitiateCheckout', {
    content_ids: items.map(item => (item.product_id || item.id || '').toString()),
    content_type: 'product',
    num_items: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
    value: Number(totalValue) || 0,
    currency: 'BDT'
  });
};

export const trackPurchase = (orderData: {
  orderId: string | number;
  total: number;
  items: Array<{ id?: string | number; product_id?: string | number; name?: string; price: number; quantity: number }>;
}) => {
  trackPixelEvent('Purchase', {
    order_id: orderData.orderId.toString(),
    content_ids: orderData.items.map(item => (item.product_id || item.id || '').toString()),
    content_type: 'product',
    value: Number(orderData.total) || 0,
    currency: 'BDT',
    num_items: orderData.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
  });
};
