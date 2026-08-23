/**
 * Order ID Generator Utility
 * 
 * Generates short, Shipmozo-compliant order IDs that stay under 30 characters.
 * This ensures compatibility with the Shipmozo API while maintaining uniqueness.
 */

/**
 * Generates a short order reference ID compliant with Shipmozo's 30-character limit
 * Format: TOPSUN-{6-digit-timestamp}-{3-digit-random}
 * Total: ~20 characters
 * 
 * @returns {string} A unique order reference ID under 30 characters
 * 
 * @example
 * const orderId = generateShortOrderId();
 * // Returns: "TOPSUN-234567-892"
 */
export const generateShortOrderId = (): string => {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0'); // 3-digit random number with padding
  
  return `TOPSUN-${timestamp}-${random}`;
};

/**
 * Validates that an order ID complies with Shipmozo's 30-character limit
 * 
 * @param {string} orderId - The order ID to validate
 * @returns {boolean} True if the ID is 30 characters or less
 * 
 * @example
 * isValidShipmozoOrderId("TOPSUN-234567-892"); // true
 * isValidShipmozoOrderId("this-is-a-very-long-order-id-that-exceeds-the-limit"); // false
 */
export const isValidShipmozoOrderId = (orderId: string): boolean => {
  return orderId.length <= 30;
};

/**
 * Shortens a long order ID to comply with Shipmozo's 30-character limit
 * If the ID is already short enough, returns it as-is.
 * If it's too long, generates a short replacement ID.
 * 
 * @param {string} longOrderId - The potentially long order ID (e.g., UUID from database)
 * @returns {string} A Shipmozo-compliant order ID
 * 
 * @example
 * const uuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"; // 36 characters
 * const shortId = shortenOrderIdForShipmozo(uuid);
 * // Returns: "TOPSUN-234567-892" (20 characters)
 */
export const shortenOrderIdForShipmozo = (longOrderId: string): string => {
  if (isValidShipmozoOrderId(longOrderId)) {
    return longOrderId;
  }
  
  console.warn(
    `⚠️ Order ID "${longOrderId}" exceeds Shipmozo's 30-character limit (${longOrderId.length} chars). Generating short ID.`
  );
  
  return generateShortOrderId();
};

/**
 * Logs order ID validation for debugging
 * 
 * @param {string} orderId - The order ID to log
 * @param {string} context - Context about where this ID is being used
 */
export const logOrderIdValidation = (orderId: string, context: string = ''): void => {
  const isValid = isValidShipmozoOrderId(orderId);
  const status = isValid ? '✅' : '❌';
  
  console.log(
    `${status} Order ID Validation ${context}:`,
    {
      orderId,
      length: orderId.length,
      compliesWithShipmozo: isValid,
      limit: 30
    }
  );
};

/**
 * Constants for order ID generation
 */
export const ORDER_ID_CONFIG = {
  SHIPMOZO_MAX_LENGTH: 30,
  PREFIX: 'TOPSUN',
  FORMAT: 'TOPSUN-{6-digit-timestamp}-{3-digit-random}'
} as const;