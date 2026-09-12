import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

export default function ContactUs() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', orderId: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.message.trim()) e.message = 'Please describe your question.';
    else if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSent(true);
  };

  const field = (key: string) => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    },
  });

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="Contact Us – Customer Support & WhatsApp | TOPSUN"
        description="Get in touch with the TOPSUN footwear support team. Reach us via WhatsApp (+91 7485006659), email, or visit our headquarters in Raniganj, West Bengal."
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Contact Us', url: '/contact' }]}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-24 max-w-[1040px] mx-auto px-4 sm:px-6 space-y-12">
        <Breadcrumbs items={[{ label: 'Contact Us' }]} />

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[rgba(179,139,63,0.12)] border border-[rgba(179,139,63,0.25)] text-[#8c6820] text-[11px] font-bold tracking-wider uppercase">
            We Are Here to Assist
          </span>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-[#121518] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Get in Touch with TOPSUN
          </h1>
          <p className="text-xs sm:text-sm text-[#606870] leading-relaxed max-w-lg mx-auto">
            Questions regarding sizing, shipping, or returns? Our athlete support team responds within 2 hours on business days.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* WhatsApp Support Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#e4ded5] shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#25D366] flex items-center justify-center border border-emerald-100">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-[#121518]">WhatsApp Concierge</h3>
              <p className="text-xs text-[#606870] leading-relaxed">Fastest for sizing advice, exchange requests, and live parcel status.</p>
            </div>
            <a
              href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20have%20an%20inquiry%20regarding%20footwear."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <span>Chat on WhatsApp</span>
              <ArrowRight size={13} />
            </a>
          </div>

          {/* Email Support Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#e4ded5] shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(179,139,63,0.12)] text-[#b38b3f] flex items-center justify-center border border-[rgba(179,139,63,0.25)]">
                <Mail size={24} />
              </div>
              <h3 className="text-base font-bold text-[#121518]">Email Support</h3>
              <p className="text-xs text-[#606870] leading-relaxed">For formal inquiries, corporate bulk orders, and media relations.</p>
            </div>
            <a
              href="mailto:topsunshoes7@gmail.com"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#121518] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
            >
              <span>topsunshoes7@gmail.com</span>
            </a>
          </div>

          {/* Registered Office */}
          <div className="bg-white p-6 rounded-3xl border border-[#e4ded5] shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(179,139,63,0.12)] text-[#b38b3f] flex items-center justify-center border border-[rgba(179,139,63,0.25)]">
                <MapPin size={24} />
              </div>
              <h3 className="text-base font-bold text-[#121518]">Registered Office</h3>
              <p className="text-xs text-[#606870] leading-relaxed">
                INTELAGROW PVT. LTD. <br />
                A/90 NSB Road, Raniganj, Searsole Rajbari, Paschim Bardhaman – 713358, West Bengal.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] text-[#8c6820] font-bold">
              <Clock size={12} />
              <span>Mon – Sat: 9:00 AM – 8:00 PM IST</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl border border-[#e4ded5] p-8 sm:p-12 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2
              className="text-2xl sm:text-3xl font-semibold text-[#121518]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Send Us a Message
            </h2>
            <p className="text-xs text-[#606870]">Fill in the details and our support team will reply within 2 hours.</p>
          </div>

          {sent ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#121518]">Message Delivered</h3>
              <p className="text-xs text-[#606870]">Thank you! We have received your query and will reply shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#606870] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    {...field('name')}
                    placeholder="Full name"
                    className={`w-full h-11 px-3.5 bg-[#faf7f2] border rounded-xl text-xs text-[#121518] outline-none focus:border-[#121518] transition-colors ${errors.name ? 'border-red-400 bg-red-50/30' : 'border-[#d5cfc6]'}`}
                  />
                  {errors.name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#606870] mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    {...field('phone')}
                    placeholder="10-digit mobile"
                    maxLength={10}
                    className={`w-full h-11 px-3.5 bg-[#faf7f2] border rounded-xl text-xs text-[#121518] outline-none focus:border-[#121518] transition-colors ${errors.phone ? 'border-red-400 bg-red-50/30' : 'border-[#d5cfc6]'}`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#606870] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    {...field('email')}
                    placeholder="name@example.com"
                    className={`w-full h-11 px-3.5 bg-[#faf7f2] border rounded-xl text-xs text-[#121518] outline-none focus:border-[#121518] transition-colors ${errors.email ? 'border-red-400 bg-red-50/30' : 'border-[#d5cfc6]'}`}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#606870] mb-1.5">
                    Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.orderId}
                    onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                    placeholder="e.g. TOP-2026-XXXX"
                    className="w-full h-11 px-3.5 bg-[#faf7f2] border border-[#d5cfc6] rounded-xl text-xs text-[#121518] outline-none focus:border-[#121518] transition-colors uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#606870] mb-1.5">
                  How Can We Help? *
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  {...field('message')}
                  placeholder="Describe your question or size request..."
                  className={`w-full p-3.5 bg-[#faf7f2] border rounded-xl text-xs text-[#121518] outline-none focus:border-[#121518] transition-colors resize-none ${errors.message ? 'border-red-400 bg-red-50/30' : 'border-[#d5cfc6]'}`}
                />
                {errors.message && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#121518] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? 'Sending…' : 'Send Message'}</span>
                <Send size={13} />
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
