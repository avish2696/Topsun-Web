import { motion } from 'motion/react';
import { AlertCircle, ShoppingCart, TrendingDown } from 'lucide-react';

interface ComboOfferCardProps {
  totalItems: number;
  itemsNeededForCombo: number;
  currentPrice: number;
  comboPrice: number;
  onViewCart: () => void;
}

/**
 * Component to show combo offer when user has selected at least 1 product
 * Shows: "Add 1 more shoe to get both for ₹999"
 */
export function ComboOfferCard({
  totalItems,
  itemsNeededForCombo,
  currentPrice,
  comboPrice,
  onViewCart,
}: ComboOfferCardProps) {
  const isComboActive = totalItems >= itemsNeededForCombo;
  const itemsToAdd = Math.max(0, itemsNeededForCombo - totalItems);
  const savings = currentPrice - comboPrice;

  if (isComboActive) {
    // Combo is active - show confirmation
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <TrendingDown size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-green-900 text-sm">🎉 Combo Offer Active!</h3>
            <p className="text-xs text-green-700 mt-1">
              You're getting {totalItems} shoes for just <span className="font-bold">₹{comboPrice}</span>
            </p>
            <p className="text-xs text-green-600 mt-1 font-semibold">
              💰 You're saving ₹{savings}!
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Combo not yet active - show incentive to add
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <AlertCircle size={20} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-blue-900 text-sm">✨ Special Offer Available!</h3>
          <p className="text-xs text-blue-700 mt-1">
            Add {itemsToAdd} more shoe{itemsToAdd !== 1 ? 's' : ''} and get both for just{' '}
            <span className="font-bold text-lg">₹{comboPrice}</span>
          </p>
          <p className="text-xs text-blue-600 mt-1 font-semibold">
            That's ₹{savings} off the regular price!
          </p>
          <button
            onClick={onViewCart}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors"
          >
            <ShoppingCart size={14} />
            Add Another Shoe
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Component for showing price breakdown with combo details
 */
export function ComboOfferBadge({ isCombo, savings }: { isCombo: boolean; savings: number }) {
  if (!isCombo) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-block px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white text-xs font-bold rounded-full"
    >
      💰 Save ₹{savings}
    </motion.div>
  );
}
