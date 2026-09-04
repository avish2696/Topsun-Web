import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Shield, Mail, ArrowRight, Loader, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TopsunLogoImg from '@/imports/TOPSUN png 1.webp';

const ADMIN_EMAILS = [
  'admin@topsun.in',
  'topsunshoes7@gmail.com',
  'avishkar.kumar555@gmail.com',
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const { sendEmailOTP, verifyEmailOTP, user } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user && ADMIN_EMAILS.includes((user.email ?? '').toLowerCase())) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const otpInputRefs = Array.from({ length: 6 }, () => React.createRef<HTMLInputElement>());

  const handleSendOTP = async () => {
    setEmailError('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return setEmailError('Please enter your email address.');
    if (!ADMIN_EMAILS.includes(trimmed)) {
      return setEmailError('This email is not authorised for admin access.');
    }
    setSending(true);
    try {
      await sendEmailOTP(trimmed);
      setStep(2);
      setTimer(60);
    } catch (err: any) {
      setEmailError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpInputRefs[idx + 1].current?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpInputRefs[idx - 1].current?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError('');
    const code = otp.join('');
    if (code.length < 6) return setOtpError('Please enter the full 6-digit code.');
    setVerifying(true);
    try {
      await verifyEmailOTP(email.trim().toLowerCase(), code);
      setSuccess(true);
      setTimeout(() => navigate('/admin', { replace: true }), 1200);
    } catch (err: any) {
      setOtpError(err.message || 'Invalid OTP. Please try again.');
      setVerifying(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2027 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #ADD8E6, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-[#ADD8E6] via-indigo-400 to-[#ADD8E6]" />

          <div className="p-8 sm:p-10">

            {/* Logo + heading */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                style={{ background: 'rgba(173,216,230,0.12)', border: '1px solid rgba(173,216,230,0.2)' }}>
                <Shield size={28} className="text-[#ADD8E6]" />
              </div>
              <img src={TopsunLogoImg} alt="TOPSUN" className="h-7 object-contain mb-3 opacity-90" />
              <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Admin Portal
              </h1>
              <p className="text-sm text-slate-400 mt-1 text-center">Restricted access — authorised personnel only</p>
            </div>

            <AnimatePresence mode="wait">

              {/* ── Step 1: Email ── */}
              {step === 1 && !success && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="admin-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                      placeholder="you@example.com"
                      autoFocus
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: emailError ? '1.5px solid #f87171' : '1.5px solid rgba(255,255,255,0.1)',
                      }}
                    />
                  </div>
                  {emailError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
                      <AlertCircle size={12} /> {emailError}
                    </p>
                  )}

                  <button
                    id="admin-send-otp-btn"
                    onClick={handleSendOTP}
                    disabled={sending}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-[#001f27] transition-all active:scale-95 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #ADD8E6, #93c5da)' }}
                  >
                    {sending
                      ? <Loader size={16} className="animate-spin" />
                      : <><KeyRound size={16} /> Send OTP</>
                    }
                  </button>
                </motion.div>
              )}

              {/* ── Step 2: OTP ── */}
              {step === 2 && !success && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-sm text-slate-300 mb-5 text-center">
                    OTP sent to <span className="font-semibold text-white">{email}</span>
                  </p>

                  {/* OTP boxes */}
                  <div className="flex gap-2 justify-center mb-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`admin-otp-${idx}`}
                        ref={otpInputRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-xl font-bold rounded-xl text-white outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: otpError
                            ? '1.5px solid #f87171'
                            : digit
                            ? '1.5px solid rgba(173,216,230,0.6)'
                            : '1.5px solid rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="flex items-center justify-center gap-1.5 text-xs text-red-400 mt-1 mb-3">
                      <AlertCircle size={12} /> {otpError}
                    </p>
                  )}

                  <button
                    id="admin-verify-otp-btn"
                    onClick={handleVerifyOTP}
                    disabled={verifying || otp.join('').length < 6}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-[#001f27] transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #ADD8E6, #93c5da)' }}
                  >
                    {verifying
                      ? <Loader size={16} className="animate-spin" />
                      : <><Shield size={16} /> Verify &amp; Enter Admin</>
                    }
                  </button>

                  {/* Resend / change email */}
                  <div className="text-center mt-4">
                    {timer > 0 ? (
                      <p className="text-xs text-slate-500">Resend OTP in {timer}s</p>
                    ) : (
                      <button
                        onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setOtpError(''); }}
                        className="text-xs text-[#ADD8E6] hover:underline"
                      >
                        ← Change email / Resend OTP
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Success ── */}
              {success && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle size={28} className="text-emerald-400" />
                  </div>
                  <p className="text-white font-semibold text-lg">Access Granted</p>
                  <p className="text-slate-400 text-sm">Redirecting to Admin Dashboard…</p>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Footer */}
            {!success && (
              <p className="text-center text-xs text-slate-600 mt-8">
                Not an admin?{' '}
                <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition-colors">
                  Go to Homepage <ArrowRight size={10} className="inline" />
                </button>
              </p>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
}
