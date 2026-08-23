import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ResponsiveImage } from './ResponsiveImage';

interface ImageLightboxProps {
  images: string[];
  productName: string;
  onClose?: () => void;
}

/**
 * Lightbox component for viewing product images in fullscreen
 * Displays one image at a time with navigation arrows
 */
export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  productName,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose?.();
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
    >
      {/* Main Image Container */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
          aria-label="Close lightbox"
        >
          <X size={24} className="text-white" />
        </motion.button>

        {/* Image Counter */}
        <div className="absolute top-6 left-6 text-white/80 text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Main Image */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex items-center justify-center p-8"
        >
          <ResponsiveImage
            src={images[currentIndex]}
            alt={`${productName} - Image ${currentIndex + 1}`}
            loading="eager"
            className="max-w-full max-h-[90vh] object-contain"
          />
        </motion.div>

        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.1, x: -8 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft size={28} className="text-white" />
        </motion.button>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.1, x: 8 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
          aria-label="Next image"
        >
          <ChevronRight size={28} className="text-white" />
        </motion.button>

        {/* Thumbnail Strip at Bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-2xl overflow-x-auto px-4">
          {images.map((image, index) => (
            <motion.button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                index === currentIndex
                  ? 'border-white'
                  : 'border-white/30 opacity-60 hover:opacity-100'
              }`}
            >
              <ResponsiveImage
                src={image}
                alt={`Thumbnail ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Keyboard Help Text */}
      <div className="absolute bottom-6 right-6 text-white/50 text-xs text-right">
        <p>← → to navigate</p>
        <p>ESC to close</p>
      </div>
    </motion.div>
  );
};

export default ImageLightbox;

