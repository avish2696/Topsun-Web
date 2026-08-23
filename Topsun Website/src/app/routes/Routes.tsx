import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import { initializeDemoUsers } from '@/app/utils/demoCredentials';
import { motion } from 'motion/react';
import { RouteTracker } from '@/app/components/RouteTracker';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';

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
const DemoCredentials = lazy(() => import('@/app/pages/DemoCredentials'));
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

// Initialize demo users on app start (development only)
if (import.meta.env.DEV) {
  initializeDemoUsers();
}

// TOPSUN Storm Runner (mint green & blue)
import Shoe1 from '@/imports/storm-runner/1.png';
import Shoe1_2 from '@/imports/storm-runner/2.png';
import Shoe1_3 from '@/imports/storm-runner/3.png';
import Shoe1_4 from '@/imports/storm-runner/4.png';
import Shoe1_5 from '@/imports/storm-runner/5.png';

// TOPSUN Urban Classic (white, black & tan)
import Shoe2 from '@/imports/urban-classic/1.png';
import Shoe2_2 from '@/imports/urban-classic/2.png';
import Shoe2_3 from '@/imports/urban-classic/3.png';
import Shoe2_4 from '@/imports/urban-classic/4.png';
import Shoe2_5 from '@/imports/urban-classic/5.png';

// TOPSUN Trail Blaze (white, grey, tan & orange)
import Shoe3 from '@/imports/trail-blaze/1.png';
import Shoe3_2 from '@/imports/trail-blaze/2.png';
import Shoe3_3 from '@/imports/trail-blaze/3.png';
import Shoe3_4 from '@/imports/trail-blaze/4.png';
import Shoe3_5 from '@/imports/trail-blaze/5.png';

// TOPSUN Comfort Walk (black, peach & teal)
import Shoe4 from '@/imports/comfort-walk/1.png';
import Shoe4_2 from '@/imports/comfort-walk/2.png';
import Shoe4_3 from '@/imports/comfort-walk/3.png';
import Shoe4_4 from '@/imports/comfort-walk/4.png';
import Shoe4_5 from '@/imports/comfort-walk/5.png';

// TOPSUN Street Edge (white, grey & orange)
import Shoe5 from '@/imports/street-edge/1.png';
import Shoe5_2 from '@/imports/street-edge/2.png';
import Shoe5_3 from '@/imports/street-edge/3.png';
import Shoe5_4 from '@/imports/street-edge/4.png';
import Shoe5_5 from '@/imports/street-edge/5.png';

// TOPSUN Everyday Flex (light grey & white)
import Shoe6 from '@/imports/everyday-flex/1.png';
import Shoe6_2 from '@/imports/everyday-flex/2.png';
import Shoe6_3 from '@/imports/everyday-flex/3.png';
import Shoe6_4 from '@/imports/everyday-flex/4.png';
import Shoe6_5 from '@/imports/everyday-flex/5.png';

// TOPSUN Sprint Pro (white & blue)
import Shoe7 from '@/imports/sprint-pro/1.png';
import Shoe7_2 from '@/imports/sprint-pro/2.png';
import Shoe7_3 from '@/imports/sprint-pro/3.png';
import Shoe7_4 from '@/imports/sprint-pro/4.png';
import Shoe7_5 from '@/imports/sprint-pro/5.png';

// Branded TOPSUN loading fallback
import LoadingScreen from '@/app/components/LoadingScreen';
const LoadingFallback = () => <LoadingScreen minDuration={800} />;

/**
 * Product database with complete information
 */
export const PRODUCTS_DATABASE = [
  {
    id: 1,
    slug: 'airflex',
    name: 'TOPSUN Airflex',
    brand: 'TOPSUN',
    category: 'Running',
    price: 2000,
    originalPrice: 4000,
    rating: 4.8,
    reviews: 214,
    tag: '50% OFF',
    colorLabel: 'Mint Green / Blue',
    cardBg: '#e6f8f4',
    image: Shoe1,
    mainImage: Shoe1,
    images: [Shoe1, Shoe1_2, Shoe1_3, Shoe1_4, Shoe1_5],
    description:
      'The Airflex redefines performance for runners who demand excellence. Built with cutting-edge cushioning technology and a breathable mesh upper, these shoes deliver comfort mile after mile.',
    material: '100% Engineered Mesh Upper | EVA Cushioned Midsole | Non-Slip Rubber Outsole',
    fit: 'True to size. For wider feet, consider sizing up half a size.',
    care: 'Wipe clean with a damp cloth. Air dry at room temperature.',
    features: [
      'Engineered mesh for superior breathability',
      'Multi-density cushioned midsole',
      'Non-slip rubber sole for all terrains',
      'Reflective heel strip for visibility',
      'Lightweight design (260g per shoe)',
      'Carbon-infused forefoot for stability',
      'Removable cushioned insole',
      'Performance-tested by athletes',
    ],
    sizes: [7, 8, 9, 10],
    outOfStockSizes: [],
    inStock: true,
  },
  {
    id: 2,
    slug: 'duro-ridge',
    name: 'TOPSUN Duro Ridge',
    brand: 'TOPSUN',
    category: 'Casual',
    price: 2200,
    originalPrice: 5500,
    rating: 4.7,
    reviews: 189,
    tag: '60% OFF',
    colorLabel: 'White / Black / Tan',
    cardBg: '#f0f0f2',
    image: Shoe2,
    mainImage: Shoe2,
    images: [Shoe2, Shoe2_2, Shoe2_3, Shoe2_4, Shoe2_5],
    description:
      'The Duro Ridge combines timeless style with modern comfort. This versatile shoe features a sophisticated color palette that matches any urban aesthetic.',
    material: '100% Engineered Mesh Upper | EVA Cushioned Midsole | Non-Slip Rubber Outsole',
    fit: 'True to size. Spacious toebox for comfortable all-day wear.',
    care: 'Machine wash on gentle cycle or hand wash with mild soap.',
    features: [
      'Premium urban design',
      'Enhanced lateral support',
      'Cushioned midsole for impact protection',
      'Breathable upper material',
      'Durable rubber outsole',
      'Flexible toe area',
      'Comfortable padded collar',
      'Versatile styling',
    ],
    sizes: [7, 8, 9, 10],
    outOfStockSizes: [],
    inStock: true,
  },
  {
    id: 3,
    slug: 'sunspark',
    name: 'TOPSUN Sunspark',
    brand: 'TOPSUN',
    category: 'Outdoor',
    price: 2280,
    originalPrice: 5700,
    rating: 4.9,
    reviews: 301,
    tag: '60% OFF',
    colorLabel: 'White / Grey / Tan / Orange',
    cardBg: '#f7f0e6',
    image: Shoe3,
    mainImage: Shoe3,
    images: [Shoe3, Shoe3_2, Shoe3_3, Shoe3_4, Shoe3_5],
    description:
      'Our bestselling Sunspark is the perfect balance of rugged durability and style. With its earthy tones and responsive cushioning, it\'s no wonder this is our most popular outdoor shoe.',
    material: '100% Engineered Mesh Upper | Multi-Density EVA Midsole | Premium Rubber Outsole',
    fit: 'True to size. Recommended for all foot types.',
    care: 'Gentle hand wash or wipe clean. Air dry completely.',
    features: [
      'Best-selling trail design',
      'All-terrain traction system',
      'All-day comfort technology',
      'Moisture-wicking mesh',
      'Durable construction',
      'Stylish multi-color design',
      'Suitable for all outdoor activities',
      'Premium materials throughout',
    ],
    sizes: [7, 8, 9, 10],
    outOfStockSizes: [],
    inStock: true,
  },
  {
    id: 4,
    slug: 'duskflex',
    name: 'TOPSUN Duskflex',
    brand: 'TOPSUN',
    category: 'Walking',
    price: 2400,
    originalPrice: 6000,
    rating: 4.6,
    reviews: 176,
    tag: '60% OFF',
    colorLabel: 'Black / Peach / Teal',
    cardBg: '#e8f0ee',
    image: Shoe4,
    mainImage: Shoe4,
    images: [Shoe4, Shoe4_2, Shoe4_3, Shoe4_4, Shoe4_5],
    description:
      'Bold and comfortable, the Duskflex makes a statement. This premium walking shoe features advanced cushioning technology and a modern colorway that stands out from the crowd.',
    material: '100% Engineered Mesh Upper | EVA Midsole | Non-Slip Rubber Outsole',
    fit: 'True to size with a snug fit around the midfoot.',
    care: 'Hand wash recommended to maintain the vibrant colors.',
    features: [
      'Bold comfort-focused design',
      'Advanced cushioning',
      'Snug midfoot fit',
      'Breathable mesh upper',
      'Professional-grade sole',
      'Modern aesthetic',
      'Premium comfort',
      'Limited edition colorway',
    ],
    sizes: [7, 8, 9, 10],
    outOfStockSizes: [],
    inStock: true,
  },
  {
    id: 5,
    slug: 'emberflex',
    name: 'TOPSUN Emberflex',
    brand: 'TOPSUN',
    category: 'Street',
    price: 2000,
    originalPrice: 5000,
    rating: 4.8,
    reviews: 243,
    tag: '60% OFF',
    colorLabel: 'White / Grey / Orange',
    cardBg: '#fff1ea',
    image: Shoe5,
    mainImage: Shoe5,
    images: [Shoe5, Shoe5_2, Shoe5_3, Shoe5_4, Shoe5_5],
    description:
      'Energize your street style with the vibrant Emberflex. This high-energy shoe delivers the performance you need with the style you want. Perfect for urban explorers who want to stand out.',
    material: '100% Engineered Mesh Upper | EVA Cushioned Midsole | Non-Slip Rubber Outsole',
    fit: 'True to size. Great for neutral and underpronators.',
    care: 'Wipe clean or gentle machine wash.',
    features: [
      'Vibrant street-style design',
      'High-energy aesthetic',
      'Responsive cushioning',
      'Breathable upper',
      'Superior traction',
      'Lightweight build',
      'Eye-catching style',
      'Performance-tested',
    ],
    sizes: [7, 8, 9, 10],
    outOfStockSizes: [],
    inStock: true,
  },
  {
    id: 6,
    slug: 'cloudmax',
    name: 'TOPSUN Cloudmax',
    brand: 'TOPSUN',
    category: 'Everyday',
    price: 2080,
    originalPrice: 5200,
    rating: 4.7,
    reviews: 158,
    tag: '60% OFF',
    colorLabel: 'Light Grey / White',
    cardBg: '#fef4e6',
    image: Shoe6,
    mainImage: Shoe6,
    images: [Shoe6, Shoe6_2, Shoe6_3, Shoe6_4, Shoe6_5],
    description:
      'Versatile and comfortable, the Cloudmax combines the best of both worlds. The clean light grey and white design provides a sophisticated look while the advanced sole handles any terrain.',
    material: '100% Engineered Mesh Upper | EVA Midsole | Flexible Rubber Outsole',
    fit: 'True to size with enhanced flexibility.',
    care: 'Suitable for machine wash on gentle cycle.',
    features: [
      'Everyday versatile design',
      'Clean minimalist colorway',
      'Enhanced flexibility',
      'All-day comfort',
      'Multi-surface capability',
      'Comfortable arch support',
      'Durable construction',
      'Timeless style',
    ],
    sizes: [7, 8, 9, 10],
    outOfStockSizes: [],
    inStock: true,
  },
  {
    id: 7,
    slug: 'hyperflow',
    name: 'TOPSUN HyperFlow',
    brand: 'TOPSUN',
    category: 'Performance',
    price: 2100,
    originalPrice: 4200,
    rating: 4.9,
    reviews: 267,
    tag: '50% OFF',
    colorLabel: 'White / Blue',
    cardBg: '#f5f5f5',
    image: Shoe7,
    mainImage: Shoe7,
    images: [Shoe7, Shoe7_2, Shoe7_3, Shoe7_4, Shoe7_5],
    description:
      'The ultimate performance shoe. Engineered with state-of-the-art technology and premium materials, the HyperFlow delivers uncompromising performance for serious athletes.',
    material: 'Premium Engineered Mesh + Synthetic Upper | Advanced EVA Midsole | High-Performance Rubber Outsole',
    fit: 'True to size. Premium padded collar for enhanced comfort.',
    care: 'Hand wash with premium shoe cleaner. Air dry at room temperature.',
    features: [
      'Professional performance design',
      'Advanced cushioning system',
      'Enhanced ankle support',
      'Premium breathable materials',
      'High-performance outsole',
      'Reinforced stitching',
      'Pressure-mapping insole',
      'Professional-grade construction',
      'Limited edition release',
    ],
    sizes: [7, 8, 9, 10],
    outOfStockSizes: [],
    inStock: true,
  },
];

/**
 * Get a single product by ID
 */
export function getProductById(id: number) {
  return PRODUCTS_DATABASE.find((product) => product.id === id);
}

/**
 * Get a single product by slug
 */
export function getProductBySlug(slug: string) {
  return PRODUCTS_DATABASE.find((product) => product.slug === slug);
}

/**
 * Get related products (same category, different product)
 */
export function getRelatedProducts(currentProductId: number, limit: number = 6) {
  const current = getProductById(currentProductId);
  if (!current) return [];

  return PRODUCTS_DATABASE.filter(
    (p) => p.category === current.category && p.id !== currentProductId
  ).slice(0, limit);
}

/**
 * Root Layout Component
 * Supports background location pattern so /cart renders as a drawer over the previous page
 */
const RootLayout = () => {
  const location = useLocation();
  // backgroundLocation is set in navigation state when going to /cart
  const backgroundLocation = (location.state as any)?.backgroundLocation;

  return (
    <>
      <RouteTracker />
      {/*
        When a backgroundLocation is present (e.g. we came from /shop and are now at /cart),
        render the BACKGROUND page at the background location, and the CART overlay on top.
        This keeps the shop visible behind the cart drawer.
      */}
      <Outlet location={backgroundLocation || location} />
      {backgroundLocation && (
        <Outlet />
      )}
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
        path: 'demo-credentials',
        element: <Suspense fallback={<LoadingFallback />}><DemoCredentials /></Suspense>,
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
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}

