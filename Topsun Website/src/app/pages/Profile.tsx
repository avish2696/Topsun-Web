import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import Header from '@/app/components/Header';
import { useShopping } from '@/app/context/ShoppingContext';
import { AnimatePresence, motion } from 'motion/react';
import {
  LogOut, User, MapPin, ShoppingBag, Plus, Edit, Trash2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { SEOHead } from '@/app/components/SEOHead';

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

type Tab = 'profile' | 'addresses';

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

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addingAddress, setAddingAddress] = useState(false);
  const [editAddr, setEditAddr] = useState<SavedAddress | null>(null);
  const [newAddr, setNewAddr] = useState({
    full_name: user?.fullName || '', phone: user?.phone || '',
    address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'India',
  });

  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`topsun_addresses_${user.id}`);
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
      saveAddresses(addresses.map(a => a.id === editAddr.id ? { ...editAddr } : a));
      toast.success('Address updated!');
    } else {
      const added: SavedAddress = { id: `addr_${Date.now()}`, ...newAddr, is_default: addresses.length === 0 };
      saveAddresses([added, ...addresses]);
      toast.success('Address saved!');
    }
    setAddingAddress(false);
    setEditAddr(null);
    setNewAddr({ full_name: user?.fullName || '', phone: user?.phone || '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'India' });
  };

  const inputCls = "w-full h-11 px-3.5 bg-[#faf7f2] border border-[#d5cfc6] rounded-xl text-xs font-medium outline-none focus:border-[#121518] transition-colors text-[#121518] placeholder:text-gray-400";
  const labelCls = "text-[11px] font-bold text-[#606870] uppercase tracking-wider block mb-1.5";

  const tabs = [
    { key: 'profile' as Tab, label: 'Profile', icon: <User size={15} /> },
    { key: 'addresses' as Tab, label: 'Addresses', icon: <MapPin size={15} /> },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <SEOHead title="My Account & Profile | TOPSUN" description="Manage your TOPSUN customer account details, saved addresses, and active orders." noIndex={true} />
        <Header
          cartCount={getCartItemCount()}
          onCartClick={() => navigate('/cart')}
          onMobileMenuToggle={setMobileMenuOpen}
          mobileMenuOpen={mobileMenuOpen}
        />

        <div className="max-w-3xl mx-auto px-4 pt-24 sm:pt-28 pb-20 space-y-6">
          {/* User Banner */}
          <div className="bg-white rounded-3xl border border-[#e4ded5] p-6 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(179,139,63,0.12)] text-[#b38b3f] flex items-center justify-center text-lg font-bold shrink-0 border border-[rgba(179,139,63,0.25)]">
                {user?.fullName?.[0]?.toUpperCase() || user?.phone?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#121518] truncate">{user?.fullName || 'TOPSUN Customer'}</h2>
                <p className="text-xs text-[#606870] truncate mt-0.5">{user?.phone || user?.email}</p>
                <span className="text-[10px] text-[#b38b3f] font-bold uppercase tracking-wider">Active Member</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="bg-white rounded-2xl border border-[#e4ded5] p-5 flex items-center gap-3.5 hover:border-[#dfc38a] transition-all group text-left cursor-pointer shadow-xs"
            >
              <div className="w-10 h-10 bg-[rgba(179,139,63,0.1)] rounded-xl flex items-center justify-center group-hover:bg-[rgba(179,139,63,0.2)] transition-colors">
                <ShoppingBag size={18} className="text-[#b38b3f]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#121518]">My Orders</p>
                <p className="text-[11px] text-[#606870]">Order history & invoices</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/track-order')}
              className="bg-white rounded-2xl border border-[#e4ded5] p-5 flex items-center gap-3.5 hover:border-[#dfc38a] transition-all group text-left cursor-pointer shadow-xs"
            >
              <div className="w-10 h-10 bg-[rgba(179,139,63,0.1)] rounded-xl flex items-center justify-center group-hover:bg-[rgba(179,139,63,0.2)] transition-colors">
                <ChevronRight size={18} className="text-[#b38b3f]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#121518]">Track Package</p>
                <p className="text-[11px] text-[#606870]">Live courier tracking</p>
              </div>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white rounded-2xl p-1.5 border border-[#e4ded5] shadow-xs gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === t.key
                    ? 'bg-[#121518] text-white shadow-xs'
                    : 'text-[#606870] hover:bg-[#faf7f2]'
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border border-[#e4ded5] p-6 sm:p-8 shadow-xs space-y-4"
              >
                <h3
                  className="text-xl font-semibold text-[#121518]"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    { label: 'Full Name', value: user?.fullName || 'Not Provided' },
                    { label: 'Phone / Mobile', value: user?.phone || '—' },
                    { label: 'Auth Provider', value: user?.provider || 'phone' },
                    { label: 'Member Status', value: 'Active Member' },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#faf7f2] p-4 rounded-2xl border border-[#e4ded5]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{item.label}</span>
                      <p className="text-xs font-bold text-[#121518]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {(addingAddress || editAddr) && (
                  <div className="bg-white rounded-3xl border border-[#e4ded5] p-6 sm:p-8 shadow-xs space-y-4">
                    <h3
                      className="text-xl font-semibold text-[#121518]"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {editAddr ? 'Edit Address' : 'Add New Shipping Address'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Full Name *</label>
                        <input
                          type="text"
                          value={(editAddr ? editAddr.full_name : newAddr.full_name) || ''}
                          onChange={(e) => { if (editAddr) setEditAddr({ ...editAddr, full_name: e.target.value }); else setNewAddr({ ...newAddr, full_name: e.target.value }); }}
                          placeholder="Your full name"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Phone *</label>
                        <input
                          type="text"
                          value={(editAddr ? editAddr.phone : newAddr.phone) || ''}
                          onChange={(e) => { if (editAddr) setEditAddr({ ...editAddr, phone: e.target.value }); else setNewAddr({ ...newAddr, phone: e.target.value }); }}
                          placeholder="10-digit mobile"
                          className={inputCls}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Street Address *</label>
                        <input
                          type="text"
                          value={(editAddr ? editAddr.address_line1 : newAddr.address_line1) || ''}
                          onChange={(e) => { if (editAddr) setEditAddr({ ...editAddr, address_line1: e.target.value }); else setNewAddr({ ...newAddr, address_line1: e.target.value }); }}
                          placeholder="House / Flat / Street"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>City *</label>
                        <input
                          type="text"
                          value={(editAddr ? editAddr.city : newAddr.city) || ''}
                          onChange={(e) => { if (editAddr) setEditAddr({ ...editAddr, city: e.target.value }); else setNewAddr({ ...newAddr, city: e.target.value }); }}
                          placeholder="City"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>State *</label>
                        <input
                          type="text"
                          value={(editAddr ? editAddr.state : newAddr.state) || ''}
                          onChange={(e) => { if (editAddr) setEditAddr({ ...editAddr, state: e.target.value }); else setNewAddr({ ...newAddr, state: e.target.value }); }}
                          placeholder="State"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>PIN Code *</label>
                        <input
                          type="text"
                          value={(editAddr ? editAddr.postal_code : newAddr.postal_code) || ''}
                          onChange={(e) => { if (editAddr) setEditAddr({ ...editAddr, postal_code: e.target.value }); else setNewAddr({ ...newAddr, postal_code: e.target.value }); }}
                          placeholder="6-digit PIN"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleSaveAddress} className="px-6 py-2.5 bg-[#121518] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                        Save Address
                      </button>
                      <button onClick={() => { setAddingAddress(false); setEditAddr(null); }} className="px-5 py-2.5 bg-[#faf7f2] hover:bg-[#ece7de] text-[#121518] text-xs font-bold rounded-xl border border-[#e4ded5] transition-colors cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Address List */}
                <div className="bg-white rounded-3xl border border-[#e4ded5] p-6 sm:p-8 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-xl font-semibold text-[#121518]"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      Saved Addresses
                    </h3>
                    {!addingAddress && !editAddr && (
                      <button
                        onClick={() => { setAddingAddress(true); setEditAddr(null); }}
                        className="px-4 py-2 bg-[#121518] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus size={13} /> Add New
                      </button>
                    )}
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-[#e4ded5] rounded-2xl">
                      <MapPin size={28} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-xs text-[#606870]">No saved addresses yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="p-4 rounded-2xl border border-[#e4ded5] flex justify-between items-start gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm text-[#121518]">{addr.full_name}</span>
                              {addr.is_default && (
                                <span className="text-[10px] bg-[rgba(179,139,63,0.12)] text-[#8c6820] border border-[rgba(179,139,63,0.25)] px-2 py-0.5 rounded-md font-bold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#606870]">{addr.phone}</p>
                            <p className="text-xs text-gray-700 mt-1">
                              {addr.address_line1}, {addr.city}, {addr.state} – {addr.postal_code}
                            </p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button onClick={() => { setEditAddr(addr); setAddingAddress(false); }} className="p-2 text-gray-400 hover:text-[#121518] hover:bg-[#faf7f2] rounded-lg transition-colors cursor-pointer">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => { saveAddresses(addresses.filter(a => a.id !== addr.id)); toast.success('Address deleted'); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
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
