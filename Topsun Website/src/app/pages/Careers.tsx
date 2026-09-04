import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { Briefcase, Users, Target, Heart, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

const openings = [
  {
    title: 'Footwear & Product Designer',
    department: 'Design & R&D',
    location: 'Raniganj, West Bengal / Hybrid',
    type: 'Full-time',
    description: 'Craft high-performance running silhouettes, midsole ergonomics, and seasonal color palettes.',
  },
  {
    title: 'Supply Chain & Logistics Specialist',
    department: 'Operations',
    location: 'India (Flexible)',
    type: 'Full-time',
    description: 'Oversee warehouse fulfillment, courier SLA tracking, and direct distribution networks.',
  },
  {
    title: 'Customer Experience Specialist',
    department: 'Customer Care',
    location: 'Remote',
    type: 'Full-time',
    description: 'Delight athletes and runners with rapid sizing guidance and seamless exchange support via WhatsApp.',
  },
];

export default function Careers() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="Careers at TOPSUN – Join Our Footwear Team | INTELAGROW PVT. LTD."
        description="Explore open roles at TOPSUN footwear. Join our passionate team building the future of direct-to-consumer athletic footwear in India."
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Careers', url: '/careers' }]}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-24 max-w-[1000px] mx-auto px-4 sm:px-6 space-y-8">
        <Breadcrumbs items={[{ label: 'Careers' }]} />

        {/* Hero */}
        <div className="bg-white rounded-3xl border border-[#e4ded5] p-8 sm:p-12 shadow-xs text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[rgba(179,139,63,0.12)] border border-[rgba(179,139,63,0.25)] text-[#8c6820] text-[11px] font-bold tracking-wider uppercase">
            <Briefcase size={12} className="text-[#b38b3f]" /> Careers at TOPSUN
          </span>
          <h1
            className="text-3xl sm:text-5xl font-semibold text-[#121518] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Build the Future of <br />
            <span className="text-[#b38b3f]">Athletic Footwear</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#606870] max-w-lg mx-auto leading-relaxed">
            Join a fast-moving, mission-driven team dedicated to engineering pro-tier performance shoes at direct-to-consumer prices.
          </p>
        </div>

        {/* Culture */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { Icon: Target, title: 'Obsessed with Quality', desc: 'Every shoe is built with high-density EVA foam and track tested.' },
            { Icon: Users, title: 'Direct Impact', desc: 'Fast decision-making without corporate bureaucracy or red tape.' },
            { Icon: Heart, title: 'Competitive Growth', desc: 'Fair compensation, health allowances, and shoe credit for team members.' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white p-6 rounded-3xl border border-[#e4ded5] shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[rgba(179,139,63,0.1)] flex items-center justify-center">
                <Icon size={20} className="text-[#b38b3f]" />
              </div>
              <h3 className="text-sm font-bold text-[#121518]">{title}</h3>
              <p className="text-xs text-[#606870] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Open Roles */}
        <div className="bg-white rounded-3xl border border-[#e4ded5] p-6 sm:p-8 shadow-xs space-y-5">
          <h2
            className="text-2xl font-semibold text-[#121518]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Open Roles
          </h2>
          <div className="space-y-4">
            {openings.map((job, idx) => (
              <div
                key={idx}
                className="bg-[#faf7f2] p-5 rounded-2xl border border-[#e4ded5] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#b38b3f] tracking-wider">{job.department}</span>
                  <h3 className="text-sm font-bold text-[#121518]">{job.title}</h3>
                  <p className="text-xs text-[#606870] leading-relaxed">{job.description}</p>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium pt-0.5">
                    <MapPin size={11} /> {job.location} · {job.type}
                  </div>
                </div>
                <a
                  href={`mailto:topsunshoes7@gmail.com?subject=Job Application – ${encodeURIComponent(job.title)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#121518] hover:bg-black text-white text-xs font-bold rounded-xl whitespace-nowrap self-start sm:self-center transition-colors shadow-xs"
                >
                  <span>Apply Now</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
