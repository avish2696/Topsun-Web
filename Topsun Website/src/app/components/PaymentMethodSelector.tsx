import { motion } from 'motion/react';
import { Smartphone, CreditCard, Wallet, Building2, CheckCircle2 } from 'lucide-react';
import { PaymentMethod, calculatePrice, formatPrice, getDiscountBadge } from '@/app/utils/pricingCalculator';

interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface PaymentMethodSelectorProps {
  totalItems: number;
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  isLoading?: boolean;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'upi',
    label: 'UPI',
    icon: <Smartphone size={20} />,
    description: 'Google Pay, PhonePe, Paytm',
  },
  {
    id: 'card',
    label: 'Credit/Debit Card',
    icon: <CreditCard size={20} />,
    description: 'Visa, Mastercard, RuPay',
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    icon: <Building2 size={20} />,
    description: 'All major Indian banks',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    icon: <Wallet size={20} />,
    description: 'Pay when product arrives',
  },
];

/**
 * Component for selecting payment method with live pricing display
 */
export function PaymentMethodSelector({
  totalItems,
  selectedMethod,
  onSelect,
  isLoading = false,
}: PaymentMethodSelectorProps) {
  const isCombo = totalItems >= 2;

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#71787b] mb-4">
        Select Payment Method
      </p>

      <div className="grid grid-cols-1 gap-3">
        {PAYMENT_METHODS.map((method) => {
          const pricing = calculatePrice(totalItems, method.id);
          const isSelected = selectedMethod === method.id;
          const discountBadge = getDiscountBadge(pricing);

          return (
            <motion.button
              key={method.id}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              onClick={() => !isLoading && onSelect(method.id)}
              disabled={isLoading}
              className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                isSelected
                  ? 'border-[#ADD8E6] bg-[#F8FDFF]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {/* Selection indicator */}
              <div
                className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-[#ADD8E6] bg-[#ADD8E6]'
                    : 'border-gray-300 bg-white group-hover:border-gray-400'
                }`}
              >
                {isSelected && <CheckCircle2 size={16} className="text-white" />}
              </div>

              {/* Content */}
              <div className="flex items-start gap-3 text-left">
                <div
                  className={`mt-1 transition-colors ${
                    isSelected ? 'text-[#ADD8E6]' : 'text-gray-400'
                  }`}
                >
                  {method.icon}
                </div>

                <div className="flex-1 pr-8">
                  <h4 className="font-bold text-sm text-gray-900 mb-0.5">
                    {method.label}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">{method.description}</p>

                  {/* Pricing display */}
                  <div className="flex items-center gap-2">
                    {pricing.basePrice !== pricing.finalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(pricing.basePrice)}
                      </span>
                    )}
                    <span
                      className={`font-bold text-lg ${
                        isCombo
                          ? 'text-green-600'
                          : isSelected
                          ? 'text-[#ADD8E6]'
                          : 'text-gray-900'
                      }`}
                    >
                      {formatPrice(pricing.finalPrice)}
                    </span>

                    {/* Discount badge */}
                    {discountBadge && (
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          isCombo
                            ? 'bg-green-100 text-green-700'
                            : pricing.discount > 0
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {discountBadge}
                      </span>
                    )}
                  </div>

                  {/* Reason text */}
                  {pricing.discount > 0 || isCombo ? (
                    <p className="text-[11px] text-gray-500 mt-1.5 italic">
                      {pricing.discountReason}
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info banner for combo */}
      {isCombo && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <p className="text-xs text-green-700 font-semibold">
            💰 Combo Offer: All prices are ₹999 for 2 or more shoes!
          </p>
        </motion.div>
      )}
    </div>
  );
}
