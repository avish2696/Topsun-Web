import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface SizeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: number) => void;
  sizes?: number[];
  selectedSize?: number | string | null;
  productName?: string;
}

const DEFAULT_SIZES = [7, 8, 9, 10];

export default function SizeSelectModal({
  isOpen,
  onClose,
  onSelectSize,
  sizes = DEFAULT_SIZES,
  selectedSize = null,
  productName,
}: SizeSelectModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            aria-label="Close size modal"
          />

          {/* Bottom Sheet / Modal Card (Matching Screenshot) */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 z-10 space-y-4 border border-[#e4ded5]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {/* Header: Select Size (UK) with X close button */}
            <div className="flex items-center justify-between pb-1 border-b border-gray-100">
              <div>
                <h3
                  className="text-lg sm:text-xl font-bold text-[#121518] tracking-tight"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  Select Size (UK)
                </h3>
                {productName && (
                  <p className="text-[11px] text-[#606870] line-clamp-1">{productName}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-[#121518] rounded-full transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Horizontal Size Pills (6, 7, 8, 9, 10, 11) */}
            <div className="flex items-center justify-between gap-2 pt-1 overflow-x-auto scrollbar-none py-1">
              {sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onSelectSize(size)}
                    className={`flex-1 min-w-[44px] h-12 rounded-xl border text-sm font-bold flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
                      isSelected
                        ? 'bg-[#121518] text-white border-[#121518] shadow-sm'
                        : 'bg-white text-[#121518] border-gray-200 hover:border-[#b38b3f] hover:bg-[#faf7f2]'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <p className="text-center text-[10px] text-gray-400 font-semibold pt-1">
              All TOPSUN footwear fits True to Size (TTS)
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
