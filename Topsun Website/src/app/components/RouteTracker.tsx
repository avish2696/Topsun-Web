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
    // Track page view on route change
    trackPageView();
    
    // Optional: Also track the specific path for debugging
    console.log(`📍 Route changed to: ${location.pathname}`);
  }, [location]);

  // This component doesn't render anything
  return null;
};