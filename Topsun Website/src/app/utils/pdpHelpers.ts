/**
 * Helper functions for Product Detail Page
 */

/**
 * Calculate discount percentage
 * @param originalPrice - Original/list price
 * @param salePrice - Current sale price
 * @returns Discount percentage (0-100)
 */
export function calculateDiscount(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0;
  const discount = ((originalPrice - salePrice) / originalPrice) * 100;
  return Math.round(discount);
}

/**
 * Check if product is on sale
 * @param originalPrice - Original price
 * @param salePrice - Current price
 * @returns true if discounted
 */
export function isOnSale(originalPrice: number, salePrice: number): boolean {
  return originalPrice > salePrice;
}

/**
 * Format currency in INR
 * @param amount - Amount to format
 * @returns Formatted string (e.g., "₹599")
 */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Validate size selection
 * @param size - Selected size
 * @param availableSizes - List of available sizes
 * @param outOfStockSizes - List of out-of-stock sizes
 * @returns true if size is valid and in stock
 */
export function isValidSize(
  size: number | string | null,
  availableSizes: (number | string)[],
  outOfStockSizes: (number | string)[]
): boolean {
  if (!size) return false;
  if (!availableSizes.includes(size)) return false;
  if (outOfStockSizes.includes(size)) return false;
  return true;
}

/**
 * Get stock status text
 * @param inStock - Whether product is in stock
 * @param outOfStockCount - Number of out-of-stock sizes
 * @returns Status text
 */
export function getStockStatusText(inStock: boolean, outOfStockCount: number): string {
  if (!inStock) return '✗ Out of Stock';
  if (outOfStockCount === 0) return '✓ In Stock';
  return `✓ In Stock (${outOfStockCount} sizes unavailable)`;
}

/**
 * Calculate average rating from reviews
 * @param reviews - Array of review objects with rating property
 * @returns Average rating (0-5)
 */
export function calculateAverageRating(
  reviews: Array<{ rating: number }>
): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/**
 * Get star fill percentage
 * @param rating - Rating value
 * @returns Percentage of star to fill (0-100)
 */
export function getStarFillPercentage(rating: number): number {
  const clipped = Math.max(0, Math.min(5, rating));
  const decimal = clipped % 1;
  return (decimal / 1) * 100;
}

/**
 * Format date to relative format (e.g., "2 weeks ago")
 * @param dateString - ISO date string or Date object
 * @returns Relative date string
 */
export function formatRelativeDate(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
}

/**
 * Validate cart item
 * @param productId - Product ID
 * @param size - Selected size
 * @param quantity - Quantity
 * @returns { isValid: boolean, errors: string[] }
 */
export function validateCartItem(
  productId: number | undefined,
  size: number | string | null,
  quantity: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!productId) errors.push('Product ID is missing');
  if (!size) errors.push('Size is not selected');
  if (quantity < 1) errors.push('Quantity must be at least 1');
  if (quantity > 999) errors.push('Quantity cannot exceed 999');

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate product URL slug
 * @param productName - Product name
 * @param productId - Product ID
 * @returns URL-friendly slug (e.g., "apex-desert-sand-3")
 */
export function generateProductSlug(productName: string, productId: number): string {
  return `${productName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()}-${productId}`;
}

/**
 * Sort reviews by date (newest first)
 * @param reviews - Array of reviews
 * @returns Sorted reviews
 */
export function sortReviewsByDate(
  reviews: Array<{ date: string }>
): Array<{ date: string }> {
  return [...reviews].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Filter reviews by rating
 * @param reviews - Array of reviews
 * @param rating - Rating to filter by (1-5)
 * @returns Filtered reviews
 */
export function filterReviewsByRating(
  reviews: Array<{ rating: number }>,
  rating: number
): Array<{ rating: number }> {
  return reviews.filter((review) => review.rating === rating);
}

/**
 * Check if product is available (in stock and has available sizes)
 * @param inStock - In stock status
 * @param outOfStockSizes - Out of stock sizes
 * @param totalSizes - Total available sizes
 * @returns true if product can be purchased
 */
export function isProductAvailable(
  inStock: boolean,
  outOfStockSizes: (number | string)[],
  totalSizes: number
): boolean {
  return inStock && outOfStockSizes.length < totalSizes;
}

/**
 * Calculate savings amount
 * @param originalPrice - Original price
 * @param salePrice - Sale price
 * @returns Amount saved
 */
export function calculateSavings(originalPrice: number, salePrice: number): number {
  return Math.max(0, originalPrice - salePrice);
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Highlight search term in text
 * @param text - Text to search in
 * @param searchTerm - Term to highlight
 * @returns Text with HTML markup for highlighting
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
