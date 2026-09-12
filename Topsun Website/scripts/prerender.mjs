/**
 * scripts/prerender.mjs
 *
 * Pre-renders static HTML pages for all public TOPSUN routes into dist/
 * Ensures search engine crawlers (Googlebot, Bingbot, social scrapers)
 * get 100% complete, semantic HTML without requiring JavaScript execution.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const BASE_DOMAIN = 'https://topsun.in';

// Verified footwear catalog metadata matching products.ts
const PRODUCTS_METADATA = [
  {
    slug: 'airflex',
    name: 'TOPSUN Airflex',
    category: 'Running',
    price: 2000,
    originalPrice: 4000,
    rating: 4.8,
    reviews: 214,
    color: 'Mint Green / Blue',
    description: 'The Airflex redefines performance for runners who demand excellence. Built with CloudMatrix responsive cushioning and breathable mesh upper for long-distance comfort.',
    features: ['Engineered mesh upper', 'Multi-density cushioned midsole', 'Non-slip rubber sole for all terrains', 'Reflective heel strip for night visibility'],
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    material: '100% Engineered Mesh Upper | EVA Cushioned Midsole | Non-Slip Rubber Outsole',
  },
  {
    slug: 'duro-ridge',
    name: 'TOPSUN Duro Ridge',
    category: 'Casual',
    price: 2200,
    originalPrice: 5500,
    rating: 4.7,
    reviews: 189,
    color: 'White / Black / Tan',
    description: 'The Duro Ridge combines timeless urban style with modern comfort. Versatile colorway with enhanced lateral support and impact cushioning.',
    features: ['Premium urban design', 'Enhanced lateral support', 'Impact absorbing midsole', 'Flexible toebox for all-day comfort'],
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    material: '100% Engineered Mesh Upper | EVA Midsole | Premium Rubber Outsole',
  },
  {
    slug: 'sunspark',
    name: 'TOPSUN Sunspark',
    category: 'Outdoor',
    price: 2280,
    originalPrice: 5700,
    rating: 4.9,
    reviews: 301,
    color: 'White / Grey / Tan / Orange',
    description: 'Our bestselling Sunspark trail runner is engineered for rugged durability and all-terrain traction, powered by responsive EVA cushioning.',
    features: ['Best-selling trail runner', 'All-terrain traction system', 'Moisture-wicking mesh upper', 'Multi-density EVA midsole'],
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    material: 'Engineered Mesh Upper | Multi-Density EVA Midsole | Premium Rugged Rubber Outsole',
  },
  {
    slug: 'duskflex',
    name: 'TOPSUN Duskflex',
    category: 'Walking',
    price: 2400,
    originalPrice: 6000,
    rating: 4.6,
    reviews: 176,
    color: 'Black / Peach / Teal',
    description: 'Bold comfort-focused walking footwear featuring high-density cushioning and a snug midfoot fit for daily fitness and work routines.',
    features: ['Advanced arch cushioning', 'Snug midfoot fit', 'Breathable athletic upper', 'Professional-grade non-slip sole'],
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    material: '100% Engineered Mesh Upper | EVA Midsole | Non-Slip Rubber Outsole',
  },
  {
    slug: 'emberflex',
    name: 'TOPSUN Emberflex',
    category: 'Street',
    price: 2000,
    originalPrice: 5000,
    rating: 4.8,
    reviews: 243,
    color: 'White / Grey / Orange',
    description: 'Energize your street style with the vibrant Emberflex. High-energy aesthetic delivers performance cushioning and head-turning streetwear appeal.',
    features: ['Vibrant street style silhouette', 'Responsive shock-absorbing cushioning', 'Superior wet/dry traction', 'Lightweight agile build'],
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    material: 'Engineered Mesh Upper | EVA Cushioned Midsole | Non-Slip Outsole',
  },
  {
    slug: 'cloudmax',
    name: 'TOPSUN Cloudmax',
    category: 'Everyday',
    price: 2080,
    originalPrice: 5200,
    rating: 4.7,
    reviews: 158,
    color: 'Light Grey / White',
    description: 'Clean minimalist aesthetic meets effortless flexibility. The Cloudmax is the ultimate versatile sneaker for office, gym, and weekend exploration.',
    features: ['Minimalist everyday silhouette', 'Enhanced flexibility', 'All-day arch support', 'Multi-surface capability'],
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    material: '100% Engineered Mesh Upper | EVA Midsole | Flexible Rubber Outsole',
  },
  {
    slug: 'hyperflow',
    name: 'TOPSUN HyperFlow',
    category: 'Performance',
    price: 2100,
    originalPrice: 4200,
    rating: 4.9,
    reviews: 267,
    color: 'White / Blue',
    description: 'Pro-tier performance running shoe engineered with pressure-mapping insole and enhanced ankle support for serious athletes and marathon runners.',
    features: ['Pro-tier performance design', 'Pressure-mapping insole', 'Enhanced ankle collar support', 'High-performance traction rubber'],
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    material: 'Premium Engineered Mesh + Synthetic Upper | Advanced EVA Midsole | High-Performance Rubber Outsole',
  },
];

// All static public routes to pre-render
const ROUTES = [
  {
    path: '/',
    title: 'TOPSUN Footwear | Premium Sport & Performance Footwear',
    description: "Explore TOPSUN's high-performance sports and running shoes engineered for Indian athletes. Experience lightweight cushioning, durable traction, and 7-day hassle-free exchanges.",
    h1: 'TOPSUN Performance Footwear Redefined',
    content: `
      <header>
        <nav aria-label="Main Navigation">
          <a href="/">TOPSUN</a>
          <a href="/shop">Footwear Collection</a>
          <a href="/about">About Us</a>
          <a href="/contact">Contact</a>
          <a href="/orders">Track Orders</a>
        </nav>
      </header>
      <main id="main-content">
        <h1>TOPSUN Performance Footwear Redefined</h1>
        <p>Engineered for unmatched comfort, peak performance, and everyday style. Discover next-generation athletic footwear handcrafted to power every step.</p>
        <section>
          <h2>Trending Footwear Colorways</h2>
          <ul>
            ${PRODUCTS_METADATA.map(p => `
              <li>
                <a href="/product/${p.slug}">
                  <h3>${p.name}</h3>
                  <p>${p.category} Footwear | ₹${p.price} (₹${p.originalPrice})</p>
                  <p>${p.color} - ${p.description}</p>
                </a>
              </li>
            `).join('')}
          </ul>
        </section>
        <section>
          <h2>Crafted for Total Comfort</h2>
          <p>Engineered with CloudMatrix™ high-rebound cushioning and AeroMesh™ 360-degree dynamic ventilation.</p>
        </section>
      </main>
      <footer>
        <p>© 2026 TOPSUN Footwear India. INTELAGROW PVT. LTD. All rights reserved.</p>
        <nav aria-label="Footer links">
          <a href="/shop">Shop All Shoes</a> |
          <a href="/about">About</a> |
          <a href="/contact">Contact Support</a> |
          <a href="/sizing-guide">UK Size Chart</a> |
          <a href="/returns">7-Day Return Policy</a> |
          <a href="/faq">FAQs</a> |
          <a href="/privacy-policy">Privacy Policy</a> |
          <a href="/terms-of-service">Terms of Service</a>
        </nav>
      </footer>
    `,
  },
  {
    path: '/shop',
    title: "Men's Athletic & Casual Footwear Collection | TOPSUN",
    description: 'Explore the full TOPSUN footwear range for men: high-rebound running shoes, casual sneakers, trail runners, and daily trainers. Free delivery across India.',
    h1: 'Footwear For Men',
    content: `
      <header><nav><a href="/">Home</a> / <a href="/shop">Shop</a></nav></header>
      <main id="main-content">
        <h1>Footwear For Men</h1>
        <p>Explore TOPSUN's pro-tier athletic and casual footwear range with 7-day hassle-free exchanges and doorstep delivery across India.</p>
        <nav aria-label="Footwear Categories">
          <a href="/shop?category=running">Running</a> |
          <a href="/shop?category=casual">Casual</a> |
          <a href="/shop?category=outdoor">Outdoor</a> |
          <a href="/shop?category=walking">Walking</a> |
          <a href="/shop?category=street">Street</a> |
          <a href="/shop?category=everyday">Everyday</a> |
          <a href="/shop?category=performance">Performance</a>
        </nav>
        <section>
          <h2>All Footwear Models</h2>
          <ul>
            ${PRODUCTS_METADATA.map(p => `
              <li>
                <article>
                  <a href="/product/${p.slug}">
                    <h3>${p.name}</h3>
                    <p>Category: ${p.category} | Color: ${p.color}</p>
                    <p>Price: ₹${p.price} (MSRP ₹${p.originalPrice}) - Rating: ★ ${p.rating} (${p.reviews} reviews)</p>
                    <p>${p.description}</p>
                  </a>
                </article>
              </li>
            `).join('')}
          </ul>
        </section>
      </main>
    `,
  },
  // Individual Product Pages
  ...PRODUCTS_METADATA.map((product) => ({
    path: `/product/${product.slug}`,
    title: `${product.name} – ${product.category} Performance Shoe | TOPSUN Footwear`,
    description: `${product.description} Available in UK sizes 7-10. Inclusive of all taxes and free express shipping across India.`,
    h1: product.name,
    productData: product,
    content: `
      <header><nav><a href="/">Home</a> / <a href="/shop">Shop</a> / <a href="/shop?category=${product.category.toLowerCase()}">${product.category}</a> / <span>${product.name}</span></nav></header>
      <main id="main-content">
        <article itemscope itemtype="https://schema.org/Product">
          <h1 itemprop="name">${product.name}</h1>
          <p><strong>Category:</strong> <span itemprop="category">${product.category} Footwear</span></p>
          <p><strong>Colorway:</strong> ${product.color}</p>
          <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <p><strong>Price:</strong> <span itemprop="priceCurrency" content="INR">₹</span><span itemprop="price">${product.price}</span> (Original: ₹${product.originalPrice})</p>
            <link itemprop="availability" href="https://schema.org/InStock" />
            <p>In Stock - Express Shipping Across India</p>
          </div>
          <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
            <p>Rated <span itemprop="ratingValue">${product.rating}</span>/5 based on <span itemprop="reviewCount">${product.reviews}</span> customer reviews</p>
          </div>
          <p itemprop="description">${product.description}</p>
          <h2>Key Features</h2>
          <ul>
            ${product.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
          <h2>Materials & Care</h2>
          <p>${product.material}</p>
          <h2>Available Sizes</h2>
          <p>${product.sizes.join(', ')} (True to size)</p>
          <h2>Related Shoes You May Also Like</h2>
          <ul>
            ${PRODUCTS_METADATA.filter(p => p.slug !== product.slug).slice(0, 3).map(rel => `
              <li><a href="/product/${rel.slug}">${rel.name} (${rel.category}, ₹${rel.price})</a></li>
            `).join('')}
          </ul>
        </article>
      </main>
    `,
  })),
  {
    path: '/about',
    title: 'About TOPSUN | Engineering Next-Generation Indian Footwear',
    description: "Learn how TOPSUN Footwear is engineering pro-tier athletic shoes with responsive EVA foam and breathable mesh for Indian runners at accessible direct-to-consumer prices.",
    h1: 'Born on the Track. Built for the Stride.',
    content: `
      <header><nav><a href="/">Home</a> / <span>About Us</span></nav></header>
      <main id="main-content">
        <h1>Born on the Track. Built for the Stride.</h1>
        <p>TOPSUN was founded by INTELAGROW PVT. LTD. with a singular conviction: Indian athletes, runners, and everyday explorers deserve elite performance cushioning without paying exorbitant international markups.</p>
        <h2>Our Engineering Philosophy</h2>
        <p>Every TOPSUN shoe incorporates high-density EVA foam midsoles, engineered breathable mesh uppers, and multidirectional rubber outsoles tested on Indian terrain.</p>
        <p><a href="/shop">Explore the Collection</a> | <a href="/contact">Contact Support</a></p>
      </main>
    `,
  },
  {
    path: '/contact',
    title: 'Contact TOPSUN Support | Customer Care & Inquiries',
    description: 'Get in touch with the TOPSUN footwear support team. Reach us via WhatsApp (+91 7485006659), email, or visit our headquarters in Raniganj, West Bengal.',
    h1: 'Get in Touch with TOPSUN',
    content: `
      <header><nav><a href="/">Home</a> / <span>Contact</span></nav></header>
      <main id="main-content">
        <h1>Get in Touch with TOPSUN</h1>
        <p>Questions regarding sizing, shipping, or returns? Our athlete support team responds within 2 hours on business days.</p>
        <h2>Contact Details</h2>
        <p>WhatsApp Helpline: +91 7485006659</p>
        <p>Email: topsunshoes7@gmail.com</p>
        <p>Registered Office: INTELAGROW PVT. LTD., A/90 NSB Road, Raniganj, Paschim Bardhaman, West Bengal - 713358, India</p>
      </main>
    `,
  },
  {
    path: '/sizing-guide',
    title: 'Shoe Sizing Guide & Fit Chart | TOPSUN Footwear',
    description: 'Find your perfect shoe size with the TOPSUN UK/India footwear size guide. Accurate foot measurement instructions and width recommendations.',
    h1: 'Footwear Sizing & Fit Guide',
    content: `
      <header><nav><a href="/">Home</a> / <span>Sizing Guide</span></nav></header>
      <main id="main-content">
        <h1>Footwear Sizing & Fit Guide</h1>
        <p>All TOPSUN footwear models are engineered True to Size (TTS) following standard UK/Indian measurements.</p>
        <h2>UK to Foot Length Chart</h2>
        <ul>
          <li>UK 7: Foot Length 25.5 cm</li>
          <li>UK 8: Foot Length 26.5 cm</li>
          <li>UK 9: Foot Length 27.5 cm</li>
          <li>UK 10: Foot Length 28.5 cm</li>
        </ul>
      </main>
    `,
  },
  {
    path: '/returns',
    title: '7-Day Hassle-Free Returns & Exchange Policy | TOPSUN',
    description: "Read TOPSUN's 7-day hassle-free return and size exchange policy. Easy doorstep pickups and instant replacements across India.",
    h1: '7-Day Returns & Exchanges',
    content: `
      <header><nav><a href="/">Home</a> / <span>Returns</span></nav></header>
      <main id="main-content">
        <h1>7-Day Returns & Exchanges</h1>
        <p>We want you to experience complete confidence in every step. If the size isn't perfect, request a free doorstep size exchange within 7 days of delivery.</p>
      </main>
    `,
  },
  {
    path: '/faq',
    title: 'Frequently Asked Questions | TOPSUN Footwear Support',
    description: 'Find quick answers to common questions about TOPSUN footwear sizing, shipping times, returns, exchanges, warranty, and payment methods.',
    h1: 'Frequently Asked Questions',
    content: `
      <header><nav><a href="/">Home</a> / <span>FAQ</span></nav></header>
      <main id="main-content">
        <h1>Frequently Asked Questions</h1>
        <h2>How long does shipping take?</h2>
        <p>Orders are dispatched within 24 hours. Metro deliveries arrive in 2-3 business days; other PIN codes in 4-6 business days.</p>
        <h2>What payment methods are supported?</h2>
        <p>We accept Cash on Delivery (COD), UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking via Razorpay.</p>
      </main>
    `,
  },
  {
    path: '/sustainability',
    title: 'Sustainability & Eco-Conscious Manufacturing | TOPSUN',
    description: "Discover TOPSUN's commitment to sustainable footwear design, eco-friendly EVA midsoles, recyclable packaging, and responsible manufacturing.",
    h1: 'Sustainable Footwear for a Better Planet',
    content: `
      <header><nav><a href="/">Home</a> / <span>Sustainability</span></nav></header>
      <main id="main-content">
        <h1>Sustainable Footwear for a Better Planet</h1>
        <p>From 100% recyclable cardboard shoeboxes to reducing volatile organic compounds in bonding adhesives, TOPSUN minimizes environmental impact without compromising performance.</p>
      </main>
    `,
  },
  {
    path: '/careers',
    title: 'Careers at TOPSUN | Join Our Footwear Innovation Team',
    description: 'Explore career opportunities at TOPSUN. Join our passionate team of footwear designers, engineers, and e-commerce specialists in India.',
    h1: 'Build the Future of Footwear With Us',
    content: `
      <header><nav><a href="/">Home</a> / <span>Careers</span></nav></header>
      <main id="main-content">
        <h1>Build the Future of Footwear With Us</h1>
        <p>We are always searching for athletic enthusiasts, designers, supply chain specialists, and developers to join our growing brand.</p>
      </main>
    `,
  },
  {
    path: '/press',
    title: 'Press & Media Releases | TOPSUN Footwear News',
    description: 'Official media coverage, press releases, brand announcements, and footwear technology innovations from TOPSUN.',
    h1: 'Press Room & Brand News',
    content: `
      <header><nav><a href="/">Home</a> / <span>Press</span></nav></header>
      <main id="main-content">
        <h1>Press Room & Brand News</h1>
        <article>
          <h2>TOPSUN Expands Next-Gen Running Line with Sunspark & Storm Runner</h2>
          <p>Featuring responsive EVA cushioning and high-traction honeycomb outsoles for marathon enthusiasts and street runners — available directly via topsun.in.</p>
        </article>
      </main>
    `,
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy | TOPSUN Footwear',
    description: 'Read the TOPSUN privacy policy to understand how we protect, collect, and use your personal information and transaction data.',
    h1: 'Privacy Policy',
    content: `
      <header><nav><a href="/">Home</a> / <span>Privacy Policy</span></nav></header>
      <main id="main-content">
        <h1>Privacy Policy</h1>
        <p>At TOPSUN, we respect your privacy and are committed to protecting your personal data and encrypted transaction information.</p>
      </main>
    `,
  },
  {
    path: '/terms-of-service',
    title: 'Terms of Service | TOPSUN Footwear',
    description: 'Terms and conditions governing the use of the TOPSUN website, online purchases, customer rights, and store policies.',
    h1: 'Terms of Service',
    content: `
      <header><nav><a href="/">Home</a> / <span>Terms of Service</span></nav></header>
      <main id="main-content">
        <h1>Terms of Service</h1>
        <p>These Terms and Conditions govern your access to and use of topsun.in and all purchases made on the website.</p>
      </main>
    `,
  },
  {
    path: '/track-order',
    title: 'Track Your TOPSUN Order & Shipment Live',
    description: 'Live order tracking for TOPSUN Footwear. Enter your Order ID or phone number to check dispatch, courier partner, and delivery status in real time.',
    h1: 'Track Your Order',
    content: `
      <header><nav><a href="/">Home</a> / <span>Track Order</span></nav></header>
      <main id="main-content">
        <h1>Track Your TOPSUN Order</h1>
        <p>Enter your 6-digit Order ID or 10-digit registered phone number to view real-time delivery status and tracking timeline.</p>
      </main>
    `,
  },
];

function generateJsonLd(route) {
  const schemas = [];

  // LocalBusiness Schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'TOPSUN Footwear',
    image: `${BASE_DOMAIN}/favicon.svg`,
    url: BASE_DOMAIN,
    telephone: '+91-7485006659',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'A/90 NSB Road, Raniganj, Searsole Rajbari',
      addressLocality: 'Paschim Bardhaman',
      addressRegion: 'West Bengal',
      postalCode: '713358',
      addressCountry: 'IN',
    },
  });

  // Product Schema
  if (route.productData) {
    const p = route.productData;
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      image: [`${BASE_DOMAIN}/favicon.svg`],
      description: p.description,
      sku: p.slug,
      brand: {
        '@type': 'Brand',
        name: 'TOPSUN',
      },
      category: p.category,
      offers: {
        '@type': 'Offer',
        url: `${BASE_DOMAIN}/product/${p.slug}`,
        priceCurrency: 'INR',
        price: p.price,
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'TOPSUN Footwear',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: p.rating,
        bestRating: '5',
        worstRating: '1',
        reviewCount: p.reviews,
      },
    });
  }

  return schemas.map(s => `<script type="application/ld+json" data-prerender="true">${JSON.stringify(s)}</script>`).join('\n    ');
}

export function prerender() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ dist/index.html not found! Run "vite build" first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf8');
  console.log(`🚀 Starting static pre-rendering for ${ROUTES.length} routes...`);

  let renderedCount = 0;

  for (const route of ROUTES) {
    const canonical = `${BASE_DOMAIN}${route.path === '/' ? '/' : route.path}`;
    const jsonLdScripts = generateJsonLd(route);

    let html = baseHtml;

    // Replace Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);

    // Replace Meta Description
    if (html.includes('<meta name="description"')) {
      html = html.replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${route.description}" />`);
    } else {
      html = html.replace('</head>', `  <meta name="description" content="${route.description}" />\n  </head>`);
    }

    // Insert or update Canonical tag
    const canonicalTag = `<link rel="canonical" href="${canonical}" />`;
    if (html.includes('<link rel="canonical"')) {
      html = html.replace(/<link rel="canonical"[^>]*>/i, canonicalTag);
    } else {
      html = html.replace('</head>', `  ${canonicalTag}\n  </head>`);
    }

    // Insert Open Graph and Twitter tags
    const socialTags = `
  <meta property="og:title" content="${route.title}" />
  <meta property="og:description" content="${route.description}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:type" content="${route.productData ? 'product' : 'website'}" />
  <meta property="og:site_name" content="TOPSUN Footwear" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${route.title}" />
  <meta name="twitter:description" content="${route.description}" />
  ${jsonLdScripts}
`;
    html = html.replace('</head>', `${socialTags}\n  </head>`);

    // Inject crawler-visible semantic HTML into root
    const crawlerHtml = `
      <div id="prerender-content" style="display:contents">
        ${route.content}
      </div>
    `;
    html = html.replace('<div id="root"></div>', `<div id="root">${crawlerHtml}</div>`);

    // Determine target file path
    const targetDir = route.path === '/'
      ? DIST_DIR
      : path.join(DIST_DIR, route.path.replace(/^\//, ''));

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetFile = path.join(targetDir, 'index.html');
    fs.writeFileSync(targetFile, html, 'utf8');
    renderedCount++;
    console.log(`  ✓ Pre-rendered: ${route.path} -> ${path.relative(DIST_DIR, targetFile)}`);
  }

  console.log(`\n✅ Pre-rendering complete! Successfully generated ${renderedCount} static routes.`);
}

// Run if directly executed
prerender();
