import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Copy, RefreshCw, Phone, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { getDemoCredentialsForDisplay, refreshAllDemoOTPs, DEMO_USERS } from '@/app/utils/demoCredentials';

export default function DemoCredentials() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = () => {
    const creds = getDemoCredentialsForDisplay();
    setCredentials(creds);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard!');

    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const refreshOTPs = () => {
    refreshAllDemoOTPs();
    loadCredentials();
    toast.success('All OTPs refreshed!');
  };

  const generateOTPForUser = async (phone: string) => {
    toast.info(`Please use Supabase Email OTP on Sign In page.`);
  };

  const goToSignIn = () => {
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 py-8">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 rounded-full">
            <Shield size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Development Demo</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display' }}>
            Test Credentials
          </h1>

          <p className="text-gray-700 font-medium">
            Use these demo accounts to test the authentication system
          </p>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-sm text-gray-700">
            ℹ️ <span className="font-semibold">How to test:</span> Copy a phone number, go to Sign In, enter the phone, then use the OTP shown here to complete login.
          </p>
        </motion.div>

        {/* Refresh Button */}
        <motion.div
          className="flex gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            onClick={refreshOTPs}
            className="flex items-center gap-2 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ADD8E6, #87CEEB)' }}
          >
            <RefreshCw size={16} />
            Refresh All OTPs
          </Button>

          <Button
            onClick={goToSignIn}
            className="flex items-center gap-2 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"
            style={{ background: 'linear-gradient(135deg, #87CEEB, #ADD8E6)' }}
          >
            Go to Sign In
          </Button>
        </motion.div>

        {/* Credentials Cards */}
        <div className="grid gap-4">
          {credentials.map((cred, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
            >
              {/* User Name & Description */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">{cred.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{cred.description}</p>
              </div>

              {/* Credentials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Phone Number */}
                <div className="bg-gray-50 rounded p-4 border border-gray-200">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone Number</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone size={16} className="text-blue-600 flex-shrink-0" />
                    <code className="text-sm font-mono text-gray-900 flex-1">{cred.phone}</code>
                    <button
                      onClick={() => copyToClipboard(cred.phone, index)}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Copy phone number"
                    >
                      <Copy
                        size={16}
                        className={`transition-colors ${
                          copiedIndex === index ? 'text-green-600' : 'text-gray-600'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* OTP Code */}
                <div className="bg-blue-50 rounded p-4 border border-blue-200">
                  <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Current OTP</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Shield size={16} className="text-blue-600 flex-shrink-0" />
                    <code className="text-sm font-mono text-blue-900 font-bold flex-1">{cred.otp}</code>
                    <button
                      onClick={() => copyToClipboard(cred.otp, index + 100)}
                      className="p-2 hover:bg-blue-100 rounded transition-colors"
                      title="Copy OTP"
                    >
                      <Copy
                        size={16}
                        className={`transition-colors ${
                          copiedIndex === index + 100 ? 'text-green-600' : 'text-blue-600'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Generate New OTP Button */}
                <div className="flex items-end">
                  <button
                    onClick={() => generateOTPForUser(cred.phone.replace('+91 ', ''))}
                    className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Generate New OTP
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="pt-3 border-t border-gray-200">
                <ol className="text-xs text-gray-600 space-y-1">
                  <li>
                    <strong>1.</strong> Copy the phone number above
                  </li>
                  <li>
                    <strong>2.</strong> Go to Sign In page
                  </li>
                  <li>
                    <strong>3.</strong> Paste phone number and click Continue
                  </li>
                  <li>
                    <strong>4.</strong> Copy OTP above and enter it
                  </li>
                  <li>
                    <strong>5.</strong> You're logged in! 🎉
                  </li>
                </ol>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="font-bold text-gray-900 mb-3">💡 Tips for Testing</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• OTPs expire after 10 minutes. Use "Generate New OTP" to create fresh ones.</li>
            <li>• You have 3 attempts to enter the correct OTP before it's locked.</li>
            <li>• Once logged in, you can add addresses, place orders, and view your profile.</li>
            <li>• Use "Refresh All OTPs" to generate fresh OTPs for all demo users at once.</li>
            <li>• Each user's data is completely isolated - one user cannot see another's addresses or orders.</li>
            <li>• Your cart is cleared when you log out.</li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="mt-8 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button
            onClick={goToSignIn}
            className="flex-1 h-12 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ADD8E6, #87CEEB)' }}
          >
            Go to Sign In →
          </Button>

          <Button
            onClick={() => navigate('/')}
            className="flex-1 h-12 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95 bg-gray-600 hover:bg-gray-700"
          >
            Back to Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
