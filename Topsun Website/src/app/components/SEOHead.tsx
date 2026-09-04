import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  productData?: {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string;
    brand?: string;
    category?: string;
    rating?: number;
    reviewsCount?: number;
    inStock?: boolean;
    sku?: string | number;
  };
  breadcrumbs?: BreadcrumbItem[];
  schemaType?: 'Organization' | 'LocalBusiness' | 'WebSite' | 'Product';
}

const DEFAULT_TITLE = 'TOPSUN Footwear | Premium Sport & Performance Footwear';
const DEFAULT_DESCRIPTION = 'Discover TOPSUN high-performance running shoes, trail runners, and everyday casual sneakers. Engineered with responsive cushioning, breathable mesh, and all-day comfort. Free shipping across India.';
const BASE_DOMAIN = 'https://topsunfootwear.com';
const DEFAULT_OG_IMAGE = 'https://topsunfootwear.com/favicon.svg';

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noIndex = false,
  productData,
  breadcrumbs,
}: SEOHeadProps) {
  const location = useLocation();

  useEffect(() => {
    // 1. Page Title
    const formattedTitle = title
      ? (title.includes('TOPSUN') ? title : `${title} | TOPSUN`)
      : DEFAULT_TITLE;
    document.title = formattedTitle;

    // Robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', noIndex ? 'noindex,nofollow' : 'index,follow');

    // 2. Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Canonical URL
    const fullCanonical = canonicalUrl || `${BASE_DOMAIN}${location.pathname}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', fullCanonical);

    // 4. Open Graph Tags
    const setMetaProp = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaProp('og:title', formattedTitle);
    setMetaProp('og:description', description);
    setMetaProp('og:url', fullCanonical);
    setMetaProp('og:type', ogType);
    setMetaProp('og:image', ogImage);
    setMetaProp('og:site_name', 'TOPSUN Footwear');

    // 5. Twitter Card Tags
    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', formattedTitle);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', ogImage);

    // 6. JSON-LD Structured Data
    const existingScripts = document.querySelectorAll('script[data-dynamic-seo]');
    existingScripts.forEach((s) => s.remove());

    const schemas: object[] = [];

    // LocalBusiness / Organization Schema
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
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 23.6214,
        longitude: 87.1298,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '20:00',
      },
      sameAs: [
        'https://instagram.com/topsunfootwear',
        'https://facebook.com/topsunfootwear',
      ],
    });

    // Breadcrumbs Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: b.name,
          item: b.url.startsWith('http') ? b.url : `${BASE_DOMAIN}${b.url}`,
        })),
      });
    }

    // Product Schema
    if (productData) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productData.name,
        image: [productData.image],
        description: productData.description,
        sku: String(productData.sku || productData.name.toLowerCase().replace(/\s+/g, '-')),
        brand: {
          '@type': 'Brand',
          name: productData.brand || 'TOPSUN',
        },
        category: productData.category || 'Footwear',
        offers: {
          '@type': 'Offer',
          url: fullCanonical,
          priceCurrency: 'INR',
          price: productData.price,
          priceValidUntil: '2027-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability: productData.inStock !== false
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'TOPSUN Footwear',
          },
        },
        aggregateRating: productData.rating
          ? {
              '@type': 'AggregateRating',
              ratingValue: productData.rating,
              reviewCount: productData.reviewsCount || 180,
            }
          : undefined,
      });
    }

    // Inject JSON-LD to Head
    schemas.forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic-seo', 'true');
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      const dynamicScripts = document.querySelectorAll('script[data-dynamic-seo]');
      dynamicScripts.forEach((s) => s.remove());
    };
  }, [title, description, canonicalUrl, ogImage, ogType, noIndex, productData, breadcrumbs, location.pathname]);

  return null;
}

export default SEOHead;
