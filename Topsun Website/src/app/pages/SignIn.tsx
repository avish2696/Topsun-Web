import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, ArrowRight, Loader, AlertCircle, CheckCircle, ChevronLeft, ShieldCheck, Sparkles, X } from 'lucide-react';
import TopsunLogoImg from '@/imports/TOPSUN png 1.png';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectQuery = queryParams.get('redirect');
  const from = redirectQuery || (location.state as any)?.from || '/shop';

  const { sendPhoneOTP, verifyPhoneOTP, signInWithGoogle, isLoading } = useAuth();

  // Form states
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [optInUpdates, setOptInUpdates] = useState(true);
  const [error, setError] = useState('');
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handlePhoneChange = (val: string) => {
    // Only allow numbers, max 10 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    setError('');
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setDemoCodeNotice(null);

    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSending(true);
    try {
      const res = await sendPhoneOTP(phone);
      setStep(2);
      setTimer(60);
      if (res.demoCode) {
        setDemoCodeNotice(`For instant testing, use OTP: ${res.demoCode}`);
      }
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
      setError('Please enter the full 6-digit OTP');
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
      setError(err.message || 'Invalid OTP. Please try again.');
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
    <div className="min-h-screen bg-[#111315]/80 backdrop-blur-md flex items-center justify-center p-4 py-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Modal / Card Container matching Screenshot 2 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[420px] bg-[#1a1c1e] text-white rounded-3xl shadow-2xl overflow-hidden border border-gray-800 relative flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={() => navigate(from || '/shop')}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Top Dark Header Card matching Screenshot 2 */}
        <div className="p-6 pt-7 text-center relative flex flex-col items-center border-b border-gray-800/80 bg-gradient-to-b from-[#1a1c1e] to-[#22252a]">
          {/* TOPSUN Logo */}
          <div className="flex items-center gap-2 mb-2">
            <img src={TopsunLogoImg} alt="TOPSUN" className="h-9 object-contain brightness-0 invert" />
            <span className="text-[10px] tracking-widest text-[#009FE3] font-extrabold uppercase border border-[#009FE3]/40 px-1.5 py-0.5 rounded">
              FAST PASS
            </span>
          </div>

          <h2 className="text-[18px] font-extrabold text-white tracking-tight leading-snug mt-1">
            Begin Your Comfort Journey with TOPSUN
          </h2>

          {/* Proudly Made in India Pill */}
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-[12px] font-semibold text-gray-200 shadow-inner">
            <span className="text-amber-400">★</span>
            <span>Proudly Made in India</span>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center gap-1.5 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Form Body - Clean White Container matching Screenshot 2 */}
        <div className="bg-white text-gray-900 p-6 sm:p-7 flex-1 rounded-b-3xl">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Welcome to TOPSUN!</h3>
              <p className="text-sm text-gray-500 mt-1">Successfully signed in. Redirecting…</p>
            </motion.div>
          ) : step === 1 ? (
            /* STEP 1: Enter Mobile Number */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">Step into Comfort</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Enter your mobile number to Login/Signup</p>
              </div>

              {/* Mobile Number Input with Indian Flag */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center border-2 border-gray-200 focus-within:border-gray-900 rounded-2xl overflow-hidden transition-colors h-[54px] bg-gray-50/50">
                  {/* Flag and Prefix */}
                  <div className="flex items-center gap-1.5 px-3.5 bg-gray-100/80 border-r border-gray-200 text-[15px] font-bold text-gray-800 select-none h-full">
                    <span className="text-lg">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  {/* Input */}
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter Mobile Number"
                    className="flex-1 px-3.5 text-[16px] font-semibold text-gray-900 bg-transparent outline-none tracking-wider placeholder:text-gray-400 placeholder:font-normal"
                    maxLength={10}
                  />
                </div>
                {error && (
                  <p className="text-[12px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13} /> {error}
                  </p>
                )}
              </div>

              {/* Updates Opt-in Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1 select-none">
                <input
                  type="checkbox"
                  checked={optInUpdates}
                  onChange={(e) => setOptInUpdates(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                />
                <span className="text-[12px] text-gray-600 font-medium leading-snug">
                  Get updates, offers via RCS/WA/SMS
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={sending || isLoading || phone.length < 10}
                className="w-full h-[52px] rounded-2xl bg-[#1c1d1f] hover:bg-black text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {sending ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <>
                    Submit <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={gLoading || isLoading}
                className="w-full h-[48px] rounded-2xl border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-700 font-semibold text-[13px] flex items-center justify-center gap-2.5 transition-colors"
              >
                {gLoading ? <Loader size={16} className="animate-spin" /> : <><GoogleIcon /> Continue with Google</>}
              </button>
            </form>
          ) : (
            /* STEP 2: Verify OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">Enter OTP Code</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Code sent to <strong className="text-gray-900">+91 {phone}</strong>
                </p>
              </div>

              {/* Demo OTP Notice if SMS provider is pending */}
              {demoCodeNotice && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[12px] text-blue-800 font-semibold text-center flex items-center justify-center gap-1.5">
                  <Sparkles size={14} className="text-blue-600" />
                  <span>{demoCodeNotice}</span>
                </div>
              )}

              {/* 6 Digit OTP Inputs */}
              <div>
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
                      className="w-11 h-13 text-center text-xl font-bold bg-gray-50 border-2 border-gray-200 focus:border-gray-900 rounded-xl outline-none transition-colors"
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-[12px] text-rose-600 font-medium text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle size={13} /> {error}
                  </p>
                )}
              </div>

              {/* Resend Timer */}
              <div className="text-center text-[12px] text-gray-500">
                {timer > 0 ? (
                  <span>Resend OTP in <strong className="text-gray-900">{timer}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-blue-600 font-bold underline hover:text-blue-800"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={verifying || otp.join('').length < 6}
                className="w-full h-[52px] rounded-2xl bg-[#1c1d1f] hover:bg-black text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {verifying ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <>
                    Verify & Continue <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Change Phone Number */}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                }}
                className="w-full text-center text-[12px] text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1 font-semibold"
              >
                <ChevronLeft size={14} /> Change mobile number
              </button>
            </form>
          )}

          {/* Legal / Gokwik-style Footer Disclaimer matching Screenshot 2 */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center flex flex-col items-center gap-1 text-[11px] text-gray-400">
            <div className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-gray-400" />
              <span>I accept that I have read & understood TOPSUN's</span>
            </div>
            <div>
              <span onClick={() => navigate('/privacy-policy')} className="text-gray-700 underline cursor-pointer hover:text-black">
                Privacy Policy
              </span>
              {' '}and{' '}
              <span onClick={() => navigate('/terms-of-service')} className="text-gray-700 underline cursor-pointer hover:text-black">
                T&Cs
              </span>.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
