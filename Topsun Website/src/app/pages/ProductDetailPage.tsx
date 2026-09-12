import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/app/components/Header';
import ProductDetailPageComponent from '@/app/components/ProductDetailPage';
import { getProductBySlug, getRelatedProducts } from '@/app/routes/Routes';
import { useShopping, CartItem } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

import Shoe1 from '@/imports/storm-runner/1.webp';
import Shoe2 from '@/imports/urban-classic/1.webp';
import Shoe3 from '@/imports/trail-blaze/1.webp';
import Shoe4 from '@/imports/comfort-walk/1.webp';
import Shoe5 from '@/imports/street-edge/1.webp';
import Shoe6 from '@/imports/everyday-flex/1.webp';
import Shoe7 from '@/imports/sprint-pro/1.webp';

const shoeImages: Record<number, string> = {
  1: Shoe1,
  2: Shoe2,
  3: Shoe3,
  4: Shoe4,
  5: Shoe5,
  6: Shoe6,
  7: Shoe7,
};

export default function ProductDetailPageRoute() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { addToCart, getCartItemCount } = useShopping();

  const product = productSlug ? getProductBySlug(productSlug) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productSlug]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Header
          cartCount={getCartItemCount()}
          onCartClick={() => navigate('/cart')}
          onMobileMenuToggle={setMobileMenuOpen}
          mobileMenuOpen={mobileMenuOpen}
        />
        <div className="text-center mt-20 p-10 bg-white rounded-3xl border border-[#e4ded5] shadow-xs max-w-md mx-4 space-y-4">
          <h1
            className="text-2xl sm:text-3xl font-semibold text-[#121518]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Footwear Not Found
          </h1>
          <p className="text-xs text-[#606870]">Sorry, the requested shoe model doesn't exist or is currently unlisted.</p>
          <Link
            to="/shop"
            className="inline-block px-7 py-3 bg-[#121518] text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (size: number | string, quantity: number) => {
    const cartItem: CartItem = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: shoeImages[product.id] || product.image,
      size: size,
      quantity: quantity,
      colorLabel: product.colorLabel,
    };
    await addToCart(cartItem);
  };

  const relatedProducts = getRelatedProducts(product.id);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title={`${product.name} – ${product.category} Performance Shoe | TOPSUN Footwear`}
        description={product.description}
        canonicalUrl={`https://topsun.in/product/${product.slug}`}
        ogImage={shoeImages[product.id] || product.image}
        ogType="product"
        productData={{
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          image: shoeImages[product.id] || product.image,
          brand: 'TOPSUN',
          category: product.category,
          rating: product.rating,
          reviewsCount: product.reviews,
          inStock: product.inStock,
          sku: product.slug,
        }}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Shop', url: '/shop' },
          { name: product.name, url: `/product/${product.slug}` },
        ]}
      />

      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-20 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/shop' },
            { label: product.category, href: '/shop' },
            { label: product.name },
          ]}
        />

        <ProductDetailPageComponent
          product={product}
          onAddToCart={handleAddToCart}
          relatedProducts={relatedProducts}
        />
      </main>
    </div>
  );
}
