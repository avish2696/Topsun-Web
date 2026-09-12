import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';

import { RouteTracker } from '@/app/components/RouteTracker';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import CookieBanner from '@/app/components/CookieBanner';
import FloatingWhatsApp from '@/app/components/FloatingWhatsApp';

// Product data lives in src/data/products.ts — import from there
export { PRODUCTS_DATABASE, PRODUCTS, getProductBySlug, getProductById, getRelatedProducts } from '@/data/products';

// Lazy load route components
const Home = lazy(() => import('@/app/pages/Home'));
const ProductDetailPageRoute = lazy(() => import('@/app/pages/ProductDetailPage'));
const AboutUs = lazy(() => import('@/app/pages/AboutUs'));
const ContactUs = lazy(() => import('@/app/pages/ContactUs'));
const Shop = lazy(() => import('@/app/pages/Shop'));
const Cart = lazy(() => import('@/app/pages/Cart'));
const Checkout = lazy(() => import('@/app/pages/Checkout'));
const OrderConfirmation = lazy(() => import('@/app/pages/OrderConfirmation'));
const OrderSuccess = lazy(() => import('@/app/pages/OrderSuccess'));
const Orders = lazy(() => import('@/app/pages/Orders'));
const SignUp = lazy(() => import('@/app/pages/SignUp'));
const SignIn = lazy(() => import('@/app/pages/SignIn'));
const AuthCallback = lazy(() => import('@/app/pages/AuthCallback'));
const Profile = lazy(() => import('@/app/pages/Profile'));

const Careers = lazy(() => import('@/app/pages/Careers'));
const Press = lazy(() => import('@/app/pages/Press'));
const Sustainability = lazy(() => import('@/app/pages/Sustainability'));
const FAQ = lazy(() => import('@/app/pages/FAQ'));
const SizingGuide = lazy(() => import('@/app/pages/SizingGuide'));
const Returns = lazy(() => import('@/app/pages/Returns'));
const TrackOrder = lazy(() => import('@/app/pages/TrackOrder'));
const PrivacyPolicy = lazy(() => import('@/app/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/app/pages/TermsOfService'));
const Admin = lazy(() => import('@/app/pages/Admin'));
const AdminLogin = lazy(() => import('@/app/pages/AdminLogin'));
const NotFound = lazy(() => import('@/app/pages/NotFound'));

// Loading spinner shown while lazy-loaded pages are fetching
import LoadingScreen from '@/app/components/LoadingScreen';
import CartDrawer from '@/app/components/CartDrawer';
const LoadingFallback = () => <LoadingScreen minDuration={800} />;

/**
 * Root Layout Component
 * Supports global CartDrawer overlay and route tracker
 */
const RootLayout = () => {
  return (
    <>
      <RouteTracker />
      <Outlet />
      <CartDrawer />
      <CookieBanner />
      <FloatingWhatsApp />
    </>
  );
};
/**
 * Router configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Suspense fallback={<LoadingFallback />}><Home /></Suspense>,
      },
      {
        path: 'signup',
        element: <Suspense fallback={<LoadingFallback />}><SignUp /></Suspense>,
      },
      {
        path: 'signin',
        element: <Suspense fallback={<LoadingFallback />}><SignIn /></Suspense>,
      },
      {
        path: 'auth/callback',
        element: <Suspense fallback={<LoadingFallback />}><AuthCallback /></Suspense>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute><Suspense fallback={<LoadingFallback />}><Profile /></Suspense></ProtectedRoute>,
      },
      {
        path: 'shop',
        element: <Suspense fallback={<LoadingFallback />}><Shop /></Suspense>,
      },
      {
        path: 'cart',
        element: <Suspense fallback={<LoadingFallback />}><Cart /></Suspense>,
      },
      {
        path: 'checkout',
        element: <ProtectedRoute><Suspense fallback={<LoadingFallback />}><Checkout /></Suspense></ProtectedRoute>,
      },
      {
        path: 'order-confirmation/:orderId',
        element: <ProtectedRoute><Suspense fallback={<LoadingFallback />}><OrderConfirmation /></Suspense></ProtectedRoute>,
      },
      {
        path: 'order-success/:orderId',
        element: <ProtectedRoute><Suspense fallback={<LoadingFallback />}><OrderSuccess /></Suspense></ProtectedRoute>,
      },
      {
        path: 'orders',
        element: <ProtectedRoute><Suspense fallback={<LoadingFallback />}><Orders /></Suspense></ProtectedRoute>,
      },
      {
        path: 'about',
        element: <Suspense fallback={<LoadingFallback />}><AboutUs /></Suspense>,
      },
      {
        path: 'contact',
        element: <Suspense fallback={<LoadingFallback />}><ContactUs /></Suspense>,
      },
      {
        path: 'product/:productSlug',
        element: <Suspense fallback={<LoadingFallback />}><ProductDetailPageRoute /></Suspense>,
        errorElement: <div>Product not found</div>,
      },
      {
        path: 'careers',
        element: <Suspense fallback={<LoadingFallback />}><Careers /></Suspense>,
      },
      {
        path: 'press',
        element: <Suspense fallback={<LoadingFallback />}><Press /></Suspense>,
      },
      {
        path: 'sustainability',
        element: <Suspense fallback={<LoadingFallback />}><Sustainability /></Suspense>,
      },
      {
        path: 'faq',
        element: <Suspense fallback={<LoadingFallback />}><FAQ /></Suspense>,
      },
      {
        path: 'sizing-guide',
        element: <Suspense fallback={<LoadingFallback />}><SizingGuide /></Suspense>,
      },
      {
        path: 'returns',
        element: <Suspense fallback={<LoadingFallback />}><Returns /></Suspense>,
      },
      {
        path: 'track-order',
        element: <Suspense fallback={<LoadingFallback />}><TrackOrder /></Suspense>,
      },
      {
        path: 'privacy-policy',
        element: <Suspense fallback={<LoadingFallback />}><PrivacyPolicy /></Suspense>,
      },
      {
        path: 'terms-of-service',
        element: <Suspense fallback={<LoadingFallback />}><TermsOfService /></Suspense>,
      },
      {
        path: 'admin-login',
        element: <Suspense fallback={<LoadingFallback />}><AdminLogin /></Suspense>,
      },
      {
        path: 'admin',
        element: <Suspense fallback={<LoadingFallback />}><Admin /></Suspense>,
      },
      {
        path: '*',
        element: <Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>,
      },
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}

