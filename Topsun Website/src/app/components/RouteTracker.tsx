/**
 * Route Tracker Component
 * Automatically tracks page views when routes change in React Router
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/app/utils/fbPixel';

export const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change for Meta Pixel
    trackPageView();
    
    // Track page view on route change for Google Analytics GA4
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }

    console.log(`📍 Route changed to: ${location.pathname}`);
  }, [location]);

  // This component doesn't render anything
  return null;
};