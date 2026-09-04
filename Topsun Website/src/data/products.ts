/**
 * products.ts
 *
 * Single source of truth for all TOPSUN product data.
 * Import PRODUCTS from here in any page or component that needs product info.
 *
 * Helper functions:
 *   getProductBySlug('airflex')  → finds one product by its URL slug
 *   getProductById(1)            → finds one product by its numeric ID
 *   getRelatedProducts(1)        → returns same-category products (excluding current)
 */

// --- Shoe image imports (WebP — 95% smaller than original PNGs) ---

// Airflex (Mint Green / Blue)
import Airflex1 from '@/imports/storm-runner/1.webp';
import Airflex2 from '@/imports/storm-runner/2.webp';
import Airflex3 from '@/imports/storm-runner/3.webp';
import Airflex4 from '@/imports/storm-runner/4.webp';
import Airflex5 from '@/imports/storm-runner/5.webp';

// Duro Ridge (White / Black / Tan)
import DuroRidge1 from '@/imports/urban-classic/1.webp';
import DuroRidge2 from '@/imports/urban-classic/2.webp';
import DuroRidge3 from '@/imports/urban-classic/3.webp';
import DuroRidge4 from '@/imports/urban-classic/4.webp';
import DuroRidge5 from '@/imports/urban-classic/5.webp';

// Sunspark (White / Grey / Tan / Orange)
import Sunspark1 from '@/imports/trail-blaze/1.webp';
import Sunspark2 from '@/imports/trail-blaze/2.webp';
import Sunspark3 from '@/imports/trail-blaze/3.webp';
import Sunspark4 from '@/imports/trail-blaze/4.webp';
import Sunspark5 from '@/imports/trail-blaze/5.webp';

// Duskflex (Black / Peach / Teal)
import Duskflex1 from '@/imports/comfort-walk/1.webp';
import Duskflex2 from '@/imports/comfort-walk/2.webp';
import Duskflex3 from '@/imports/comfort-walk/3.webp';
import Duskflex4 from '@/imports/comfort-walk/4.webp';
import Duskflex5 from '@/imports/comfort-walk/5.webp';

// Emberflex (White / Grey / Orange)
import Emberflex1 from '@/imports/street-edge/1.webp';
import Emberflex2 from '@/imports/street-edge/2.webp';
import Emberflex3 from '@/imports/street-edge/3.webp';
import Emberflex4 from '@/imports/street-edge/4.webp';
import Emberflex5 from '@/imports/street-edge/5.webp';

// Cloudmax (Light Grey / White)
import Cloudmax1 from '@/imports/everyday-flex/1.webp';
import Cloudmax2 from '@/imports/everyday-flex/2.webp';
import Cloudmax3 from '@/imports/everyday-flex/3.webp';
import Cloudmax4 from '@/imports/everyday-flex/4.webp';
import Cloudmax5 from '@/imports/everyday-flex/5.webp';

// HyperFlow (White / Blue)
import HyperFlow1 from '@/imports/sprint-pro/1.webp';
import HyperFlow2 from '@/imports/sprint-pro/2.webp';
import HyperFlow3 from '@/imports/sprint-pro/3.webp';

import HyperFlow4 from '@/imports/sprint-pro/4.webp';
import HyperFlow5 from '@/imports/sprint-pro/5.webp';

// --- Product data ---

export const PRODUCTS = [
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
    image: Airflex1,
    mainImage: Airflex1,
    images: [Airflex1, Airflex2, Airflex3, Airflex4, Airflex5],
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
    image: DuroRidge1,
    mainImage: DuroRidge1,
    images: [DuroRidge1, DuroRidge2, DuroRidge3, DuroRidge4, DuroRidge5],
    description:
      'The Duro Ridge combines timeless style with modern comfort. This versatile shoe features a sophisticated colour palette that matches any urban aesthetic.',
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
    image: Sunspark1,
    mainImage: Sunspark1,
    images: [Sunspark1, Sunspark2, Sunspark3, Sunspark4, Sunspark5],
    description:
      "Our bestselling Sunspark is the perfect balance of rugged durability and style. With its earthy tones and responsive cushioning, it's our most popular outdoor shoe.",
    material: '100% Engineered Mesh Upper | Multi-Density EVA Midsole | Premium Rubber Outsole',
    fit: 'True to size. Recommended for all foot types.',
    care: 'Gentle hand wash or wipe clean. Air dry completely.',
    features: [
      'Best-selling trail design',
      'All-terrain traction system',
      'All-day comfort technology',
      'Moisture-wicking mesh',
      'Durable construction',
      'Stylish multi-colour design',
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
    image: Duskflex1,
    mainImage: Duskflex1,
    images: [Duskflex1, Duskflex2, Duskflex3, Duskflex4, Duskflex5],
    description:
      'Bold and comfortable, the Duskflex makes a statement. This premium walking shoe features advanced cushioning technology and a modern colourway that stands out from the crowd.',
    material: '100% Engineered Mesh Upper | EVA Midsole | Non-Slip Rubber Outsole',
    fit: 'True to size with a snug fit around the midfoot.',
    care: 'Hand wash recommended to maintain the vibrant colours.',
    features: [
      'Bold comfort-focused design',
      'Advanced cushioning',
      'Snug midfoot fit',
      'Breathable mesh upper',
      'Professional-grade sole',
      'Modern aesthetic',
      'Premium comfort',
      'Limited edition colourway',
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
    image: Emberflex1,
    mainImage: Emberflex1,
    images: [Emberflex1, Emberflex2, Emberflex3, Emberflex4, Emberflex5],
    description:
      'Energise your street style with the vibrant Emberflex. This high-energy shoe delivers the performance you need with the style you want. Perfect for urban explorers who want to stand out.',
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
    image: Cloudmax1,
    mainImage: Cloudmax1,
    images: [Cloudmax1, Cloudmax2, Cloudmax3, Cloudmax4, Cloudmax5],
    description:
      'Versatile and comfortable, the Cloudmax combines the best of both worlds. The clean light grey and white design provides a sophisticated look while the advanced sole handles any terrain.',
    material: '100% Engineered Mesh Upper | EVA Midsole | Flexible Rubber Outsole',
    fit: 'True to size with enhanced flexibility.',
    care: 'Suitable for machine wash on gentle cycle.',
    features: [
      'Everyday versatile design',
      'Clean minimalist colourway',
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
    image: HyperFlow1,
    mainImage: HyperFlow1,
    images: [HyperFlow1, HyperFlow2, HyperFlow3, HyperFlow4, HyperFlow5],
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
    ],
    sizes: [7, 8, 9, 10],
    outOfStockSizes: [],
    inStock: true,
  },
];

// Kept for backwards-compatibility — old code that imports PRODUCTS_DATABASE still works
export const PRODUCTS_DATABASE = PRODUCTS;

/** Find one product by its URL slug, e.g. 'airflex' */
export function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Find one product by its numeric ID */
export function getProductById(id: number) {
  return PRODUCTS.find((p) => p.id === id);
}

/** Return up to `limit` products in the same category as the given product ID */
export function getRelatedProducts(currentProductId: number, limit = 6) {
  const current = getProductById(currentProductId);
  if (!current) return [];
  return PRODUCTS.filter(
    (p) => p.category === current.category && p.id !== currentProductId
  ).slice(0, limit);
}
