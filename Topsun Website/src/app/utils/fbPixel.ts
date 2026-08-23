/**
 * Facebook Pixel tracking utilities
 * Handles pageview tracking and custom events for Meta conversion tracking
 */

// Declare fbq function for TypeScript
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

/**
 * Track a page view event
 * This should be called on every route change in a SPA
 */
export const trackPageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
    console.log('📊 Facebook Pixel: PageView tracked');
  } else {
    console.warn('Facebook Pixel not initialized');
  }
};

/**
 * Track custom events for e-commerce
 */
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    if (parameters) {
      window.fbq('track', eventName, parameters);
    } else {
      window.fbq('track', eventName);
    }
    console.log(`📊 Facebook Pixel: ${eventName} tracked`, parameters);
  } else {
    console.warn('Facebook Pixel not initialized');
  }
};

/**
 * E-commerce specific tracking functions
 */
export const fbPixelEvents = {
  // Track when user views a product
  viewContent: (productId: string | number, productName: string, category: string, price: number) => {
    trackEvent('ViewContent', {
      content_type: 'product',
      content_ids: [String(productId)],
      content_name: productName,
      content_category: category,
      value: price,
      currency: 'INR'
    });
  },

  // Track when user adds item to cart
  addToCart: (productId: string | number, productName: string, category: string, price: number, quantity: number = 1) => {
    trackEvent('AddToCart', {
      content_type: 'product',
      content_ids: [String(productId)],
      content_name: productName,
      content_category: category,
      value: price * quantity,
      currency: 'INR'
    });
  },

  // Track when user initiates checkout
  initiateCheckout: (cartValue: number, itemCount: number) => {
    trackEvent('InitiateCheckout', {
      value: cartValue,
      currency: 'INR',
      num_items: itemCount
    });
  },

  // Track completed purchase
  purchase: (orderId: string, totalValue: number, items: any[]) => {
    trackEvent('Purchase', {
      content_type: 'product',
      content_ids: items.map(item => String(item.id)),
      value: totalValue,
      currency: 'INR',
      transaction_id: orderId
    });
  },

  // Track user registration/signup
  completeRegistration: (method?: string) => {
    trackEvent('CompleteRegistration', {
      content_name: 'User Registration',
      status: method || 'email'
    });
  },

  // Track searches
  search: (searchTerm: string) => {
    trackEvent('Search', {
      search_string: searchTerm
    });
  }
};

/**
 * Initialize Facebook Pixel (called automatically via index.html script)
 * This function can be used for additional initialization if needed
 */
export const initFacebookPixel = () => {
  console.log('Facebook Pixel initialized with ID: 1799097638163383');
};