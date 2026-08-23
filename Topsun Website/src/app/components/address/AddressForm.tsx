import React, { useState, useEffect } from 'react';
import { useAuth, Address } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { validation } from '@/app/utils/validation';
import { toast } from 'sonner';

interface AddressFormProps {
  address?: Address | null;
  onClose?: () => void;
}

export function AddressForm({ address, onClose }: AddressFormProps) {
  const { addAddress, updateAddress, isLoading } = useAuth();
  const [fullName, setFullName] = useState(address?.fullName || '');
  const [phone, setPhone] = useState(address?.phone.replace('+91', '') || '');
  const [addressLine1, setAddressLine1] = useState(address?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(address?.addressLine2 || '');
  const [postalCode, setPostalCode] = useState(address?.postalCode || '');
  const [city, setCity] = useState(address?.city || '');
  const [state, setState] = useState(address?.state || '');
  const [pinFound, setPinFound] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-fill city and state when postal code changes
  useEffect(() => {
    if (postalCode.length === 6) {
      const pinInfo = validation.getPINCodeInfo(postalCode);
      if (pinInfo) {
        setCity(pinInfo.city);
        setState(pinInfo.state);
        setPinFound(true);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.postalCode;
          return newErrors;
        });
      } else {
        // PIN not found - clear auto-filled values but don't set error
        // Allow user to manually enter city and state
        setPinFound(false);
        setCity('');
        setState('');
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.postalCode; // Remove error for PIN code
          return newErrors;
        });
      }
    } else if (postalCode.length < 6) {
      setCity('');
      setState('');
      setPinFound(false);
    }
  }, [postalCode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName) newErrors.fullName = 'Full name is required';
    else if (fullName.length < 2) newErrors.fullName = 'Full name must be at least 2 characters';

    if (!phone) newErrors.phone = 'Phone number is required';
    else if (phone.length !== 10) newErrors.phone = 'Phone must be exactly 10 digits';

    if (!addressLine1) newErrors.addressLine1 = 'Address is required';
    else if (addressLine1.length < 5) newErrors.addressLine1 = 'Address must be at least 5 characters';

    if (!postalCode) newErrors.postalCode = 'PIN code is required';
    else if (!/^\d{6}$/.test(postalCode)) newErrors.postalCode = 'PIN code must be exactly 6 digits';

    if (!city) newErrors.city = 'City is required';
    if (!state) newErrors.state = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const addressData = {
        fullName,
        phone: '+91' + phone,
        addressLine1,
        addressLine2,
        postalCode,
        city,
        state,
        country: 'India',
        isDefault: address?.isDefault || false,
      };

      if (address) {
        await updateAddress(address.id, addressData);
        toast.success('Address updated successfully!');
      } else {
        await addAddress(addressData);
        toast.success('Address added successfully!');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose?.();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address');
      setErrors({ form: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {address ? 'Edit Address' : 'Add New Address'}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-lg p-6 border border-gray-200">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.fullName;
                return newErrors;
              });
            }}
            disabled={isSaving}
            className={`border-2 ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.fullName && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={14} />
              {errors.fullName}
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              setPhone(value);
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.phone;
                return newErrors;
              });
            }}
            maxLength={10}
            placeholder="10-digit phone number"
            disabled={isSaving}
            className={`border-2 font-mono ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.phone && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={14} />
              {errors.phone}
            </div>
          )}
        </div>

        {/* Address Line 1 */}
        <div className="space-y-2">
          <Label htmlFor="addressLine1" className="text-sm font-medium">
            Address Line 1 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="addressLine1"
            type="text"
            value={addressLine1}
            onChange={(e) => {
              setAddressLine1(e.target.value);
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.addressLine1;
                return newErrors;
              });
            }}
            placeholder="Street address, building, etc."
            disabled={isSaving}
            className={`border-2 ${errors.addressLine1 ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.addressLine1 && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={14} />
              {errors.addressLine1}
            </div>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="space-y-2">
          <Label htmlFor="addressLine2" className="text-sm font-medium">
            Address Line 2 <span className="text-gray-500 text-xs">(Optional)</span>
          </Label>
          <Input
            id="addressLine2"
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Apartment, suite, etc."
            disabled={isSaving}
            className="border-2 border-gray-300"
          />
        </div>

        {/* PIN Code */}
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-sm font-medium">
            PIN Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="postalCode"
            type="text"
            value={postalCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setPostalCode(value);
            }}
            maxLength={6}
            placeholder="6-digit PIN"
            disabled={isSaving}
            className={`border-2 font-mono ${errors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.postalCode && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={14} />
              {errors.postalCode}
            </div>
          )}
          <p className="text-xs text-gray-500">
            {pinFound ? '✓ PIN found - City & State auto-filled' : 'Enter PIN code. If not found, you can manually fill City & State below.'}
          </p>
        </div>

        {/* City and State - Editable when PIN not found */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              City <span className="text-red-500">*</span>
              {pinFound && <span className="text-gray-500 text-xs ml-1">(Auto-filled)</span>}
            </Label>
            <Input
              id="city"
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.city;
                  return newErrors;
                });
              }}
              placeholder={pinFound ? '' : 'Enter your city'}
              disabled={isSaving || pinFound}
              className={`border-2 ${
                errors.city ? 'border-red-500 bg-red-50' : pinFound ? 'border-gray-300 bg-gray-50' : 'border-gray-300'
              }`}
            />
            {errors.city && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.city}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium">
              State <span className="text-red-500">*</span>
              {pinFound && <span className="text-gray-500 text-xs ml-1">(Auto-filled)</span>}
            </Label>
            <Input
              id="state"
              type="text"
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.state;
                  return newErrors;
                });
              }}
              placeholder={pinFound ? '' : 'Enter your state'}
              disabled={isSaving || pinFound}
              className={`border-2 ${
                errors.state ? 'border-red-500 bg-red-50' : pinFound ? 'border-gray-300 bg-gray-50' : 'border-gray-300'
              }`}
            />
            {errors.state && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.state}
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle size={16} className="text-green-600" />
            <p className="text-sm text-green-700">
              {address ? 'Address updated successfully!' : 'Address added successfully!'}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSaving || isLoading}
            className="h-11 flex-1 text-white font-semibold"
            style={{ background: 'linear-gradient(135deg, #ADD8E6, #87CEEB)' }}
          >
            {isSaving ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Saving...
              </>
            ) : address ? (
              'Update Address'
            ) : (
              'Add Address'
            )}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} disabled={isSaving} className="h-11">
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
