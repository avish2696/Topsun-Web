import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { AlertCircle, CheckCircle, Loader, ArrowLeft } from 'lucide-react';
import { validation } from '@/app/utils/validation';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function ProfileEditor() {
  const { user, updateProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate full name
    const fullNameError = validation.getFullNameError(fullName);
    if (fullNameError) {
      setError(fullNameError);
      return;
    }

    // Validate email if provided
    if (email) {
      const emailError = validation.getEmailError(email);
      if (emailError) {
        setError(emailError);
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateProfile(fullName, email);
      setSuccess(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Back Button with Background Text Header */}
      <div className="relative py-16 overflow-hidden bg-gradient-to-br from-blue-50/50 to-white mb-8">
        {/* Large background text */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
          <div className="text-[180px] md:text-[280px] font-light leading-none text-blue-100/20 -mr-20 md:-mr-40 tracking-tighter">
            PROFILE
          </div>
        </div>

        {/* Back Button and Title */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl group mb-6"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
          </motion.button>

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-gray-500 font-medium">Account Settings</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">Edit Profile</h2>
          </motion.div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError(null);
              }}
              disabled={isSaving || isLoading}
              className="border-2 border-gray-300"
            />
          </div>

          {/* Phone (Read-Only) */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone Number <span className="text-gray-500 text-xs">(Read-only)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={user.phone}
              disabled
              className="border-2 border-gray-300 bg-gray-50 text-gray-600"
            />
            <p className="text-xs text-gray-500">Your phone number cannot be changed</p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email <span className="text-gray-500 text-xs">(Optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="your.email@example.com"
              disabled={isSaving || isLoading}
              className="border-2 border-gray-300"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">Profile updated successfully!</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSaving || isLoading}
              className="h-11 px-6 text-white font-semibold rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #ADD8E6, #87CEEB)',
              }}
            >
              {isSaving ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
