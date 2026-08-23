import Header from '@/app/components/Header';
import ProductDetailPageComponent from '@/app/components/ProductDetailPage';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductBySlug, getRelatedProducts } from '@/app/routes/Routes';
import { useShopping, CartItem } from '@/app/context/ShoppingContext';
import { useAuth } from '@/app/context/AuthContext';
import Shoe1 from '@/imports/storm-runner/1.png';
import Shoe2 from '@/imports/urban-classic/1.png';
import Shoe3 from '@/imports/trail-blaze/1.png';
import Shoe4 from '@/imports/comfort-walk/1.png';
import Shoe5 from '@/imports/street-edge/1.png';
import Shoe6 from '@/imports/everyday-flex/1.png';
import Shoe7 from '@/imports/sprint-pro/1.png';

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
  const { user } = useAuth();

  const product = productSlug ? getProductBySlug(productSlug) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productSlug]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center">
        <Header
          cartCount={getCartItemCount()}
          onCartClick={() => navigate('/cart')}
          onMobileMenuToggle={setMobileMenuOpen}
          mobileMenuOpen={mobileMenuOpen}
        />
        <div className="text-center mt-20 p-8 bg-white rounded-3xl border border-gray-200 shadow-xs max-w-md mx-4">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Product Not Found</h1>
          <p className="text-gray-500 mb-6 text-sm">Sorry, the product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-black"
          >
            Back to Shop
          </button>
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
      image: shoeImages[product.id],
      size: size,
      quantity: quantity,
      colorLabel: product.colorLabel,
    };
    await addToCart(cartItem);
  };

  const handleAddToWishlist = () => {};

  const relatedProducts = getRelatedProducts(product.id);

  return (
    <div className="min-h-screen bg-[#fafafa]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <div className="pt-24 sm:pt-28">
        <ProductDetailPageComponent
          product={product}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          relatedProducts={relatedProducts}
        />
      </div>
    </div>
  );
}
