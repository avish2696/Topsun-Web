import { useState, useEffect } from "react";
import { ShoppingCart, Search, Menu, X, User, LogOut, Package, MessageCircle, Home, ShoppingBag } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import TopsunLogoImg from "@/imports/TOPSUN png 1.webp";
import { useAuth } from "@/app/context/AuthContext";
import { useShopping } from "@/app/context/ShoppingContext";
import { useSalesBanner } from "@/app/utils/salesBannerSettings";
import { toast } from "sonner";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onMobileMenuToggle?: (open: boolean) => void;
  mobileMenuOpen?: boolean;
  hideTopBanner?: boolean;
}

const navItems = [
  { label: "Home", href: "/" },
  { label: "Footwear", href: "/shop" },
  { label: "Track Orders", href: "/orders" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header({
  cartCount,
  onCartClick,
  onMobileMenuToggle,
  mobileMenuOpen = false,
  hideTopBanner = false,
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [localMenuOpen, setLocalMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { clearCart, openCartDrawer } = useShopping();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCartOpen = () => {
    openCartDrawer();
  };

  const isMenuOpen = onMobileMenuToggle !== undefined ? mobileMenuOpen : localMenuOpen;
  const toggleMenu = (val: boolean) => {
    if (onMobileMenuToggle) onMobileMenuToggle(val);
    else setLocalMenuOpen(val);
  };

  const salesBanner = useSalesBanner();

  const handleProfileClick = () => {
    if (user) {
      setShowProfileMenu(!showProfileMenu);
    } else {
      navigate('/signin', { state: { from: location.pathname } });
    }
  };

  const handleLogout = async () => {
    await logout();
    clearCart();
    setShowProfileMenu(false);
    toast.success("Logged out successfully");
    navigate('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e4ded5]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Top Countdown / Announcement Deal Banner (Photo 2 Style) */}
        {!hideTopBanner && salesBanner.enabled && !salesBanner.isExpired && (
          <div className="bg-[#009fe3] text-white px-2.5 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between text-xs font-semibold shadow-xs overflow-hidden">
            <div className="leading-tight truncate pr-1">
              <div className="font-extrabold text-xs sm:text-base tracking-tight leading-none truncate">{salesBanner.title}</div>
              <div className="text-[10px] sm:text-xs font-medium text-white/90 truncate">{salesBanner.highlightText}</div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1.5 font-bold shrink-0">
              <div className="bg-white text-[#121518] px-1 sm:px-2 py-0.5 rounded flex flex-col items-center min-w-[28px] sm:min-w-[40px] shadow-xs">
                <span className="text-[11px] sm:text-sm font-extrabold leading-tight">
                  {String(salesBanner.days).padStart(2, "0")}
                </span>
                <span className="text-[7px] sm:text-[9px] text-gray-500 font-semibold uppercase leading-none">Day</span>
              </div>
              <span className="text-white font-bold text-[10px] sm:text-xs">:</span>
              <div className="bg-white text-[#121518] px-1 sm:px-2 py-0.5 rounded flex flex-col items-center min-w-[28px] sm:min-w-[40px] shadow-xs">
                <span className="text-[11px] sm:text-sm font-extrabold leading-tight">
                  {String(salesBanner.hours).padStart(2, "0")}
                </span>
                <span className="text-[7px] sm:text-[9px] text-gray-500 font-semibold uppercase leading-none">Hours</span>
              </div>
              <span className="text-white font-bold text-[10px] sm:text-xs">:</span>
              <div className="bg-white text-[#121518] px-1 sm:px-2 py-0.5 rounded flex flex-col items-center min-w-[28px] sm:min-w-[40px] shadow-xs">
                <span className="text-[11px] sm:text-sm font-extrabold leading-tight">
                  {String(salesBanner.minutes).padStart(2, "0")}
                </span>
                <span className="text-[7px] sm:text-[9px] text-gray-500 font-semibold uppercase leading-none">Min</span>
              </div>
              <span className="text-white font-bold text-[10px] sm:text-xs">:</span>
              <div className="bg-white text-[#121518] px-1 sm:px-2 py-0.5 rounded flex flex-col items-center min-w-[28px] sm:min-w-[40px] shadow-xs">
                <span className="text-[11px] sm:text-sm font-extrabold leading-tight">
                  {String(salesBanner.seconds).padStart(2, "0")}
                </span>
                <span className="text-[7px] sm:text-[9px] text-gray-500 font-semibold uppercase leading-none">Sec</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Navbar */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Left: Mobile Menu Toggle & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleMenu(!isMenuOpen)}
              className="lg:hidden p-1.5 text-[#121518] hover:text-black rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to="/" className="flex items-center gap-2">
              <img src={TopsunLogoImg} alt="TOPSUN Footwear" className="h-7 sm:h-8 object-contain" />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-xs uppercase tracking-wider font-bold transition-colors ${
                    isActive ? "text-[#b38b3f]" : "text-[#606870] hover:text-[#121518]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions (Orders, Cart, User) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Orders Icon (Photo 2) */}
            <Link
              to="/orders"
              className="p-2 text-[#121518] hover:bg-[#faf7f2] rounded-full transition-colors cursor-pointer"
              title="Track Orders"
            >
              <Package size={20} />
            </Link>

            {/* Cart Button */}
            <button
              onClick={handleCartOpen}
              className="relative p-2 text-[#121518] hover:bg-[#faf7f2] rounded-full transition-colors cursor-pointer"
              title="View Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#b38b3f] text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={handleProfileClick}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  user ? "bg-[#121518] text-white" : "text-[#606870] hover:text-[#121518] hover:bg-[#faf7f2]"
                }`}
                title={user ? user.fullName || "My Account" : "Sign In"}
              >
                <User size={18} />
              </button>

              {/* Profile Dropdown */}
              {user && showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#e4ded5] py-2 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#e4ded5] bg-[#faf7f2]">
                    <p className="text-xs font-bold text-[#121518] truncate">{user.fullName || "Customer"}</p>
                    <p className="text-[10px] text-[#606870] truncate">{user.phone || user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-[#faf7f2] hover:text-[#121518]"
                  >
                    My Profile & Addresses
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-[#faf7f2] hover:text-[#121518]"
                  >
                    Order History
                  </Link>
                  <Link
                    to="/track-order"
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-[#faf7f2] hover:text-[#121518]"
                  >
                    Track Shipment
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border-t border-[#e4ded5] flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut size={13} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-[#e4ded5] px-5 py-5 space-y-3 shadow-md"
            >
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => toggleMenu(false)}
                  className="block text-sm font-bold text-[#121518] py-2 border-b border-[#f0ebe2] hover:text-[#b38b3f] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/sizing-guide"
                  onClick={() => toggleMenu(false)}
                  className="text-xs text-[#606870] font-semibold py-1 hover:text-[#121518]"
                >
                  Size Guide & Measurement
                </Link>
                <Link
                  to="/returns"
                  onClick={() => toggleMenu(false)}
                  className="text-xs text-[#606870] font-semibold py-1 hover:text-[#121518]"
                >
                  7-Day Returns & Exchanges
                </Link>
                <Link
                  to="/faq"
                  onClick={() => toggleMenu(false)}
                  className="text-xs text-[#606870] font-semibold py-1 hover:text-[#121518]"
                >
                  Help & FAQs
                </Link>
              </div>

              {user ? (
                <div className="pt-3 border-t border-[#e4ded5] flex items-center justify-between">
                  <span className="text-xs text-[#606870] font-medium truncate">{user.fullName || user.phone}</span>
                  <button onClick={handleLogout} className="text-xs text-rose-600 font-bold cursor-pointer">
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/signin"
                  onClick={() => toggleMenu(false)}
                  className="block w-full text-center py-3 bg-[#121518] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs"
                >
                  Sign In / Register
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (Maurya Collection App Style) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e4ded5] h-16 flex items-center justify-around px-2 shadow-lg"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 transition-colors ${
            location.pathname === "/" ? "text-[#121518]" : "text-[#606870]"
          }`}
        >
          <Home size={19} className={location.pathname === "/" ? "text-[#b38b3f]" : ""} />
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 transition-colors ${
            location.pathname.startsWith("/shop") || location.pathname.startsWith("/product") ? "text-[#121518]" : "text-[#606870]"
          }`}
        >
          <ShoppingBag size={19} className={location.pathname.startsWith("/shop") ? "text-[#b38b3f]" : ""} />
          <span className="text-[10px] font-bold">Shop</span>
        </Link>



        <Link
          to="/orders"
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 transition-colors ${
            location.pathname === "/orders" || location.pathname === "/track-order" ? "text-[#121518]" : "text-[#606870]"
          }`}
        >
          <Package size={19} className={location.pathname === "/orders" ? "text-[#b38b3f]" : ""} />
          <span className="text-[10px] font-bold">Orders</span>
        </Link>

        <Link
          to={user ? "/profile" : "/signin"}
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 transition-colors ${
            location.pathname === "/profile" || location.pathname === "/signin" ? "text-[#121518]" : "text-[#606870]"
          }`}
        >
          <User size={19} className={location.pathname === "/profile" ? "text-[#b38b3f]" : ""} />
          <span className="text-[10px] font-bold">{user ? "Account" : "Login"}</span>
        </Link>
      </nav>
    </>
  );
}
