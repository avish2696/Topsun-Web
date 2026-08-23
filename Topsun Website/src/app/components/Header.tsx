import { useState, useEffect } from "react";
import { ShoppingCart, Search, Menu, X, User, LogOut, Package, MessageCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import TopsunLogoImg from "@/imports/TOPSUN png 1.png";
import { useAuth } from "@/app/context/AuthContext";
import { useShopping } from "@/app/context/ShoppingContext";
import { toast } from "sonner";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onMobileMenuToggle: (open: boolean) => void;
  mobileMenuOpen: boolean;
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
  mobileMenuOpen,
  hideTopBanner = false,
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const { clearCart } = useShopping();
  const navigate = useNavigate();
  const location = useLocation();

  const salesBanner = useSalesBanner();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-xs">
      {/* Top Countdown Deal Banner */}
      {!hideTopBanner && salesBanner.enabled && !salesBanner.isExpired && (
        <div className="bg-[#009FE3] text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-1.5 truncate pr-2">
            <span className="font-extrabold tracking-tight truncate">
              {salesBanner.title} {salesBanner.highlightText}
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] shrink-0">
            <span className="bg-white text-gray-900 px-1.5 py-0.5 rounded font-black">
              {String(salesBanner.days).padStart(2, "0")}d
            </span>
            <span>:</span>
            <span className="bg-white text-gray-900 px-1.5 py-0.5 rounded font-black">
              {String(salesBanner.hours).padStart(2, "0")}h
            </span>
            <span>:</span>
            <span className="bg-white text-gray-900 px-1.5 py-0.5 rounded font-black">
              {String(salesBanner.minutes).padStart(2, "0")}m
            </span>
            <span>:</span>
            <span className="bg-white text-[#009FE3] px-1.5 py-0.5 rounded font-black">
              {String(salesBanner.seconds).padStart(2, "0")}s
            </span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between border-b border-gray-100">
        {/* Left: Mobile Menu Toggle & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onMobileMenuToggle(!mobileMenuOpen)}
            className="lg:hidden p-1 text-gray-800 hover:text-black"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <img src={TopsunLogoImg} alt="TOPSUN" className="h-7 sm:h-8 object-contain" />
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
                className={`text-[14px] font-bold tracking-wide transition-colors ${
                  isActive ? "text-[#009FE3]" : "text-gray-700 hover:text-[#009FE3]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions (Search, Orders, Cart, User) */}
        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            className="hidden sm:flex items-center justify-center p-1.5 text-gray-700 hover:text-[#009FE3] transition-colors"
            title="Search Products"
          >
            <Search size={19} />
          </Link>

          <Link
            to="/orders"
            className="flex items-center justify-center p-1.5 text-gray-700 hover:text-[#009FE3] transition-colors"
            title="Track Orders"
          >
            <Package size={19} />
          </Link>

          {/* Cart Button with Gold Badge */}
          <button
            onClick={onCartClick}
            className="relative p-1.5 text-gray-800 hover:text-black transition-colors"
            title="Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#b48035] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={handleProfileClick}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                user ? "bg-[#009FE3] text-white" : "text-gray-700 hover:text-[#009FE3]"
              }`}
              title={user ? user.fullName || "My Account" : "Sign In"}
            >
              <User size={18} />
            </button>

            {/* Profile Dropdown */}
            {user && showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-bold text-gray-900 truncate">{user.fullName || "Customer"}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user.phone || user.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#009FE3]"
                >
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#009FE3]"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border-t border-gray-100 flex items-center gap-1.5"
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
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-3"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => onMobileMenuToggle(false)}
                className="block text-sm font-bold text-gray-800 py-1.5 hover:text-[#009FE3]"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">{user.fullName || user.phone}</span>
                <button onClick={handleLogout} className="text-xs text-rose-600 font-bold">
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/signin"
                onClick={() => onMobileMenuToggle(false)}
                className="block w-full text-center py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold"
              >
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
