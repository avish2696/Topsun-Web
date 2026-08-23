import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import Header from '@/app/components/Header';
import { useShopping } from '@/app/context/ShoppingContext';
import { supabase } from '@/supabase';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut, User, MapPin, ShoppingBag, Plus, Edit, Trash2,
  Package, Truck, CheckCircle, Clock, ChevronRight, Loader,
  Star, ArrowLeft, MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface SavedAddress {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

type Tab = 'profile' | 'addresses' | 'orders';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    navigate('/', { replace: true });
  };

  // Addresses
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addingAddress, setAddingAddress] = useState(false);
  const [editAddr, setEditAddr] = useState<SavedAddress | null>(null);
  const [newAddr, setNewAddr] = useState({
    full_name: user?.fullName || '', phone: user?.phone || '', address_line1: '',
    address_line2: '', city: '', state: '', postal_code: '', country: 'India',
  });

  useEffect(() => {
    if (!user) return;
    const key = `topsun_addresses_${user.id}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) setAddresses(JSON.parse(stored));
    } catch {}
  }, [user]);

  const saveAddresses = (updated: SavedAddress[]) => {
    if (!user) return;
    localStorage.setItem(`topsun_addresses_${user.id}`, JSON.stringify(updated));
    setAddresses(updated);
  };

  const handleSaveAddress = () => {
    const target = editAddr || newAddr;
    if (!target.full_name || !target.phone || !target.address_line1 || !target.city || !target.state || !target.postal_code) {
      toast.error('Please fill all required fields');
      return;
    }
    if (editAddr) {
      const updated = addresses.map(a => a.id === editAddr.id ? { ...editAddr } : a);
      saveAddresses(updated);
      toast.success('Address updated!');
    } else {
      const added: SavedAddress = {
        id: `addr_${Date.now()}`,
        ...newAddr,
        is_default: addresses.length === 0,
      };
      saveAddresses([added, ...addresses]);
      toast.success('Address saved!');
    }
    setAddingAddress(false);
    setEditAddr(null);
    setNewAddr({ full_name: user?.fullName || '', phone: user?.phone || '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'India' });
  };

  const handleDeleteAddress = (id: string) => {
    saveAddresses(addresses.filter(a => a.id !== id));
    toast.success('Address deleted');
  };

  const handleSetDefault = (id: string) => {
    saveAddresses(addresses.map(a => ({ ...a, is_default: a.id === id })));
    toast.success('Default address set');
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile',   label: 'Profile',   icon: <User size={16} /> },
    { key: 'addresses', label: 'Addresses', icon: <MapPin size={16} /> },
    { key: 'orders',    label: 'My Orders', icon: <ShoppingBag size={16} /> },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fafafa]" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Header
          cartCount={getCartItemCount()}
          onCartClick={() => navigate('/cart')}
          onMobileMenuToggle={setMobileMenuOpen}
          mobileMenuOpen={mobileMenuOpen}
        />

        {/* Floating WhatsApp Support Button */}
        <a
          href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20have%20an%20account%20inquiry."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform"
          aria-label="WhatsApp"
          title="WhatsApp Support"
        >
          <MessageCircle size={26} className="fill-current" />
        </a>

        <div className="max-w-3xl mx-auto px-4 pt-24 sm:pt-28 pb-16 space-y-6">
          {/* User Banner */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#009FE3] flex items-center justify-center text-xl font-extrabold flex-shrink-0">
                {user?.fullName?.[0]?.toUpperCase() || user?.phone?.[0] || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-gray-900 truncate">{user?.fullName || 'TOPSUN Customer'}</h2>
                <p className="text-xs text-gray-500 truncate">{user?.phone || user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition-colors"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white rounded-2xl p-1 border border-gray-200/70 shadow-xs gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  if (t.key === 'orders') navigate('/orders');
                  else setActiveTab(t.key);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === t.key
                    ? 'bg-[#009FE3] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.icon} <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-4"
              >
                <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Name</span>
                    <p className="text-xs font-bold text-gray-900">{user?.fullName || 'Not Provided'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Phone / Mobile</span>
                    <p className="text-xs font-bold text-gray-900">{user?.phone || '—'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Auth Provider</span>
                    <p className="text-xs font-bold text-[#009FE3] uppercase">{user?.provider || 'phone'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Member Status</span>
                    <p className="text-xs font-bold text-emerald-600">Active Member</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Add/Edit Address Form */}
                {(addingAddress || editAddr) && (
                  <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-4">
                    <h3 className="text-base font-bold text-gray-900">{editAddr ? 'Edit Address' : 'Add New Address'}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-600 uppercase block mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={(editAddr ? editAddr.full_name : newAddr.full_name) || ''}
                          onChange={(e) => {
                            if (editAddr) setEditAddr({ ...editAddr, full_name: e.target.value });
                            else setNewAddr({ ...newAddr, full_name: e.target.value });
                          }}
                          placeholder="Your name"
                          className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-gray-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-600 uppercase block mb-1">Phone *</label>
                        <input
                          type="text"
                          value={(editAddr ? editAddr.phone : newAddr.phone) || ''}
                          onChange={(e) => {
                            if (editAddr) setEditAddr({ ...editAddr, phone: e.target.value });
                            else setNewAddr({ ...newAddr, phone: e.target.value });
                          }}
                          placeholder="10-digit mobile"
                          className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-gray-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-gray-600 uppercase block mb-1">Street Address *</label>
                        <input
                          type="text"
                          value={(editAddr ? editAddr.address_line1 : newAddr.address_line1) || ''}
                          onChange={(e) => {
                            if (editAddr) setEditAddr({ ...editAddr, address_line1: e.target.value });
                            else setNewAddr({ ...newAddr, address_line1: e.target.value });
                          }}
                          placeholder="House / Flat / Street"
                          className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-gray-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-600 uppercase block mb-1">City *</label>
                        <input
                          type="text"
                          value={(editAddr ? editAddr.city : newAddr.city) || ''}
                          onChange={(e) => {
                            if (editAddr) setEditAddr({ ...editAddr, city: e.target.value });
                            else setNewAddr({ ...newAddr, city: e.target.value });
                          }}
                          placeholder="City"
                          className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-gray-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-600 uppercase block mb-1">State *</label>
                        <input
                          type="text"
                          value={(editAddr ? editAddr.state : newAddr.state) || ''}
                          onChange={(e) => {
                            if (editAddr) setEditAddr({ ...editAddr, state: e.target.value });
                            else setNewAddr({ ...newAddr, state: e.target.value });
                          }}
                          placeholder="State"
                          className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-gray-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-600 uppercase block mb-1">PIN Code *</label>
                        <input
                          type="text"
                          value={(editAddr ? editAddr.postal_code : newAddr.postal_code) || ''}
                          onChange={(e) => {
                            if (editAddr) setEditAddr({ ...editAddr, postal_code: e.target.value });
                            else setNewAddr({ ...newAddr, postal_code: e.target.value });
                          }}
                          placeholder="6-digit PIN"
                          className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-gray-900"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveAddress}
                        className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl"
                      >
                        Save Address
                      </button>
                      <button
                        onClick={() => { setAddingAddress(false); setEditAddr(null); }}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Address List */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">Saved Addresses</h3>
                    {!addingAddress && !editAddr && (
                      <button
                        onClick={() => { setAddingAddress(true); setEditAddr(null); }}
                        className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                      >
                        <Plus size={14} /> Add New
                      </button>
                    )}
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
                      <MapPin size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-xs text-gray-500">No saved addresses yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="p-4 rounded-2xl border border-gray-200 flex justify-between items-start"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm text-gray-900">{addr.full_name}</span>
                              {addr.is_default && (
                                <span className="text-[10px] bg-blue-50 text-[#009FE3] px-2 py-0.5 rounded-md font-extrabold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{addr.phone}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {addr.address_line1}, {addr.city}, {addr.state} – {addr.postal_code}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditAddr(addr); setAddingAddress(false); }}
                              className="p-1.5 text-gray-400 hover:text-gray-800"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ProtectedRoute>
  );
}
