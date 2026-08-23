import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Instagram, Facebook, ChevronDown, Check, AlertCircle, MessageCircle, Send } from 'lucide-react';
import { useShopping } from '@/app/context/ShoppingContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

interface FormData {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export default function ContactUs() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    topic: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contactInfo = [
    {
      icon: Mail,
      label: 'Official Email',
      value: 'topsunshoes7@gmail.com',
      subtext: 'Direct customer & business support',
      href: 'mailto:topsunshoes7@gmail.com',
    },
    {
      icon: Phone,
      label: 'Phone Line',
      value: '+91 7485006659',
      subtext: 'Mon – Sat: 9 AM to 7 PM IST',
      href: 'tel:+917485006659',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp Support',
      value: '+91 7485006659',
      subtext: 'Instant support on WhatsApp',
      href: 'https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20have%20an%20inquiry.',
    },
    {
      icon: MapPin,
      label: 'INTELAGROW PVT. LTD.',
      value: 'A/90 NSB Road, Raniganj',
      subtext: 'Searsole Rajbari, Paschim Bardhaman - 713358, West Bengal, India',
      href: null,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Construct mailto link to send directly to topsunshoes7@gmail.com
    const subject = encodeURIComponent(`[${formData.topic}] Inquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nTopic: ${formData.topic}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:topsunshoes7@gmail.com?subject=${subject}&body=${body}`;

    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Thank you! Inquiry forwarded to topsunshoes7@gmail.com');
  };

  return (
    <div className="min-h-screen bg-[#fafafa]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* Floating WhatsApp Support Button */}
      <a
        href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20need%20assistance."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="WhatsApp"
        title="WhatsApp Support"
      >
        <MessageCircle size={26} className="fill-current" />
      </a>

      <main className="pt-24 sm:pt-28 pb-20 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Hero Header */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/70 shadow-xs text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#009FE3] font-extrabold text-[11px] uppercase tracking-widest mb-3">
            Customer Care
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            We're Here to Help You
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto mt-2 leading-relaxed">
            Have questions regarding shoe sizing, order tracking, shipping, or returns? Reach out anytime!
          </p>
        </section>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Contact Info Cards */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 px-1">Direct Channels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {contactInfo.map((info, idx) => {
                const Icon = info.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-5 border border-gray-200/70 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#009FE3] flex items-center justify-center mb-3">
                        <Icon size={20} />
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{info.label}</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{info.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{info.subtext}</p>
                    </div>
                    {info.href && (
                      <a
                        href={info.href}
                        target={info.href.startsWith('http') ? '_blank' : undefined}
                        rel="noreferrer"
                        className="mt-3 text-xs font-bold text-[#009FE3] hover:underline"
                      >
                        Contact Now →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick WhatsApp Banner */}
            <div className="bg-[#e7f8ee] border border-green-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={22} className="fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Need Immediate Help?</h4>
                  <p className="text-xs text-gray-600">Chat directly with our support team on WhatsApp.</p>
                </div>
              </div>
              <a
                href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap ml-2"
              >
                Chat Now
              </a>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/70 shadow-xs">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Send a Message</h2>
            <p className="text-xs text-gray-500 mb-5">Fill out the form below and we will get back to you promptly.</p>

            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Message Received!</h3>
                <p className="text-xs text-gray-500">Our support specialist will email you within 24 hours.</p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', topic: 'General Inquiry', message: '' });
                  }}
                  className="px-5 py-2 text-xs font-bold text-[#009FE3] hover:underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-xl outline-none text-xs text-gray-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-xl outline-none text-xs text-gray-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Inquiry Topic</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-xl outline-none text-xs text-gray-900 font-medium"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Sizing Help">Sizing Help & Recommendations</option>
                    <option value="Order Tracking">Order Tracking & Status</option>
                    <option value="Returns & Exchanges">Returns & Exchanges</option>
                    <option value="Bulk/Wholesale Order">Bulk & Wholesale Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-xl outline-none text-xs text-gray-900 font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Sending...' : 'Submit Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0c0c0c] text-white py-12 px-6 text-center text-xs text-gray-400 space-y-3">
        <p>© 2026 TOPSUN Performance Sneakers. All rights reserved.</p>
        <div className="flex justify-center gap-4 text-gray-500 font-semibold">
          <Link to="/about" className="hover:text-white">About Us</Link>
          <Link to="/shop" className="hover:text-white">Shop</Link>
          <Link to="/faq" className="hover:text-white">FAQ</Link>
          <Link to="/privacy-policy" className="hover:text-white">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
