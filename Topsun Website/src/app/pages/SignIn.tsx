import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { ArrowRight, Loader, AlertCircle, CheckCircle2, ChevronLeft, ShieldCheck, Sparkles, X, Lock } from 'lucide-react';
import TopsunLogoImg from '@/imports/TOPSUN png 1.webp';
import { SEOHead } from '@/app/components/SEOHead';
import { motion, AnimatePresence } from 'motion/react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

/* Carousel slides for the dark hero section */
const slides = [
  {
    title: 'Begin Your Comfort Journey with TOPSUN',
    badge: '★ Proudly Made in India',
  },
  {
    title: 'Engineered for Every Step You Take',
    badge: '★ Premium Quality Footwear',
  },
  {
    title: 'Trusted by Thousands Across India',
    badge: '★ 4.8★ Average Rating',
  },
];

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectQuery = queryParams.get('redirect');
  const from = redirectQuery || (location.state as any)?.from || '/shop';

  const { sendPhoneOTP, verifyPhoneOTP, signInWithGoogle, isLoading } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [optInUpdates, setOptInUpdates] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  /* Auto-advance carousel */
  useEffect(() => {
    const id = setInterval(() => setSlideIdx((i) => (i + 1) % slides.length), 3200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    setError('');
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSending(true);
    try {
      await sendPhoneOTP(phone);
      setStep(2);
      setTimer(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setVerifying(true);
    try {
      await verifyPhoneOTP(phone, code, fullName.trim() || undefined);
      setSuccess(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleGoogle = async () => {
    setGLoading(true);
    try {
      localStorage.setItem('auth_redirect', from);
      await signInWithGoogle();
    } catch (e: any) {
      setError(e.message || 'Google sign in failed');
    } finally {
      setGLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f0ece6] flex items-center justify-center p-4 py-10"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <SEOHead
        title="Sign In / Register | TOPSUN Footwear"
        description="Login to your TOPSUN account to track orders, manage addresses, and unlock exclusive footwear releases."
        noIndex={true}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px] rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* ── DARK HERO TOP SECTION ── */}
        <div className="relative bg-[#1c1c1c] px-6 pt-7 pb-8 overflow-hidden">
          {/* subtle dot texture */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
              backgroundSize: '14px 14px',
            }}
          />

          {/* Close button */}
          <button
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate(from || '/shop');
            }}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={14} />
          </button>

          {/* Logo + FAST PASS badge row */}
          <div className="flex items-center justify-center gap-3 mb-5 relative z-10">
            <img src={TopsunLogoImg} alt="TOPSUN" className="h-7 object-contain brightness-0 invert" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#f5c842] border border-[#f5c842]/60 rounded px-2 py-0.5">
              Fast Pass
            </span>
          </div>

          {/* Animated heading carousel */}
          <div className="relative z-10 text-center min-h-[64px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={slideIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="text-[20px] font-extrabold text-white leading-snug tracking-tight text-center"
              >
                {slides[slideIdx].title}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Badge */}
          <div className="relative z-10 mt-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2a2a2a] text-white text-[11px] font-semibold">
              <AnimatePresence mode="wait">
                <motion.span
                  key={slideIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {slides[slideIdx].badge}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>

          {/* Carousel dots */}
          <div className="relative z-10 mt-4 flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === slideIdx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/35'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── WHITE FORM BOTTOM SECTION ── */}
        <div className="bg-white px-6 pt-6 pb-7">
          {success ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
                <CheckCircle2 size={34} />
              </div>
              <h3 className="text-xl font-bold text-[#121518]">Welcome back!</h3>
              <p className="text-sm text-gray-500">Signed in successfully. Redirecting…</p>
            </div>
          ) : step === 1 ? (
            /* ── STEP 1: Phone Number ── */
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Heading */}
              <div className="text-center mb-4">
                <h2 className="text-[22px] font-extrabold text-[#121518] leading-tight">
                  Step into <span className="text-[#e07b26]">Comfort</span>
                </h2>
                <p className="text-[13px] text-gray-500 mt-1">
                  Enter your mobile number to Login/Signup
                </p>
              </div>

              {/* Phone input */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#121518] mb-2">
                  Mobile Number
                </label>
                <div className="flex items-stretch border-2 border-[#1a1a1a] focus-within:border-[#e07b26] rounded-xl overflow-hidden transition-colors bg-white" style={{ height: '52px' }}>
                  <div className="flex items-center gap-1.5 px-3.5 border-r border-gray-200 text-sm font-bold text-[#121518] select-none whitespace-nowrap">
                    <span>🇮🇳</span>
                    <span>IN +91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter Mobile Number"
                    className="flex-1 px-3.5 text-sm font-medium text-[#121518] bg-transparent outline-none placeholder:text-gray-400"
                    maxLength={10}
                  />
                </div>
                {error && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13} /> {error}
                  </p>
                )}
              </div>

              {/* Updates checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={optInUpdates}
                  onChange={(e) => setOptInUpdates(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-[#e07b26]"
                />
                <span className="text-[12px] text-gray-500 leading-snug">
                  Get updates, offers via RCS/WA/SMS
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={sending || isLoading || phone.length < 10}
                className="w-full h-12 rounded-xl bg-[#5a5a5a] hover:bg-[#3a3a3a] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
              >
                {sending ? (
                  <Loader size={17} className="animate-spin" />
                ) : (
                  <>
                    <span>Submit</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {/* OR divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={gLoading || isLoading}
                className="w-full h-12 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 bg-white text-[#121518] font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                {gLoading ? (
                  <Loader size={17} className="animate-spin" />
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Privacy note */}
              <p className="text-center text-[11px] text-gray-400 leading-snug pt-1">
                <ShieldCheck size={12} className="inline mb-0.5 text-gray-400" />{' '}
                I accept that I have read &amp; understood TOPSUN's{' '}
                <a href="/privacy-policy" className="underline text-gray-600 hover:text-black">Privacy Policy</a>
                {' '}and{' '}
                <a href="/terms-of-service" className="underline text-gray-600 hover:text-black">T&amp;Cs</a>
              </p>
            </form>
          ) : (
            /* ── STEP 2: OTP ── */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-[22px] font-extrabold text-[#121518]">
                  Verify Your <span className="text-[#e07b26]">Phone</span>
                </h2>
                <p className="text-[13px] text-gray-500 mt-1">
                  Enter the 6-digit code sent to +91 {phone}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#121518] mb-2 text-center">
                  Enter 6-Digit Code
                </label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-12 text-center text-lg font-bold bg-white border-2 rounded-xl outline-none transition-all ${
                        digit ? 'border-[#1a1a1a]' : 'border-gray-200 focus:border-[#e07b26]'
                      } text-[#121518]`}
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-xs text-rose-600 font-medium text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle size={13} /> {error}
                  </p>
                )}
              </div>

              <div className="text-center text-xs text-gray-500">
                {timer > 0 ? (
                  <span>Resend code in <strong className="text-[#121518] font-mono">{String(timer).padStart(2, '0')}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-[#e07b26] font-bold underline hover:text-[#c06015] cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={verifying || otp.join('').length < 6}
                className="w-full h-12 rounded-xl bg-[#5a5a5a] hover:bg-[#3a3a3a] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
              >
                {verifying ? (
                  <Loader size={17} className="animate-spin" />
                ) : (
                  <>
                    <span>Verify &amp; Continue</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setError(''); }}
                className="w-full text-center text-xs text-gray-500 hover:text-[#121518] flex items-center justify-center gap-1 font-semibold cursor-pointer pt-1"
              >
                <ChevronLeft size={14} /> Change phone number
              </button>

              <p className="text-center text-[11px] text-gray-400 leading-snug pt-1">
                <Lock size={12} className="inline mb-0.5 text-gray-400" />{' '}
                256-Bit Encrypted &amp; Secure
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
