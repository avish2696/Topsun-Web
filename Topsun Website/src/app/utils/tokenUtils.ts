/**
 * JWT Token Utility Functions
 * 
 * Provides JWT parsing, validation, and expiration checking without external dependencies.
 * Supports standard JWT structure: header.payload.signature
 */

/**
 * JWT Payload interface for type safety
 */
export interface JwtPayload {
  exp?: number; // Expiration time (Unix timestamp in seconds)
  iat?: number; // Issued at (Unix timestamp in seconds)
  sub?: string; // Subject (user ID)
  email?: string; // Email claim
  [key: string]: any; // Allow additional claims
}

/**
 * Decode JWT token payload
 * 
 * Extracts and decodes the payload section of a JWT token.
 * Does NOT validate the signature (validation is done server-side).
 * 
 * @param token - JWT token string
 * @returns Decoded payload object
 * @throws Error if token is invalid or malformed
 */
export function decodeJWT(token: string): JwtPayload {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token: must be a non-empty string');
    }

    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format: expected 3 parts separated by dots');
    }

    const payload = parts[1];
    if (!payload) {
      throw new Error('Invalid token: empty payload');
    }

    // Base64 decode (with URL-safe handling)
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error(`Failed to decode JWT: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if JWT token is expired
 * 
 * Compares the 'exp' claim with current timestamp.
 * Returns true if token is expired, false if valid or no expiration claim.
 * 
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);

    // If no exp claim, consider token as not expired (trust server validation)
    if (!payload.exp) {
      return false;
    }

    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();

    // Token is expired if expiration time is in the past
    return expirationTime < currentTime;
  } catch (error) {
    // If token cannot be decoded, consider it invalid/expired
    console.warn('Token expiration check failed:', error instanceof Error ? error.message : String(error));
    return true;
  }
}

/**
 * Get token expiration timestamp
 * 
 * Returns the expiration time in milliseconds since epoch.
 * Useful for calculating time until expiration.
 * 
 * @param token - JWT token string
 * @returns Expiration timestamp in milliseconds, or null if no exp claim
 * @throws Error if token is invalid
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const payload = decodeJWT(token);
    if (!payload.exp) {
      return null;
    }
    return payload.exp * 1000; // Convert seconds to milliseconds
  } catch (error) {
    console.error('Failed to get token expiration:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Get time remaining until token expiration
 * 
 * Returns milliseconds until token expires.
 * Returns negative value if token is already expired.
 * 
 * @param token - JWT token string
 * @returns Milliseconds until expiration, or null if no exp claim
 */
export function getTimeUntilExpiration(token: string): number | null {
  const expiration = getTokenExpiration(token);
  if (expiration === null) {
    return null;
  }
  return expiration - Date.now();
}

/**
 * Validate token format and expiration
 * 
 * Checks both token format validity and expiration status.
 * 
 * @param token - JWT token string
 * @returns true if token is valid format and not expired, false otherwise
 */
export function isTokenValid(token: string): boolean {
  try {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Check format
    if (token.split('.').length !== 3) {
      return false;
    }

    // Check expiration
    return !isTokenExpired(token);
  } catch {
    return false;
  }
}

/**
 * Extract specific claim from token
 * 
 * Safely extracts a claim from token payload.
 * 
 * @param token - JWT token string
 * @param claim - Claim name to extract
 * @returns Claim value or null if not found
 */
export function getTokenClaim(token: string, claim: string): any {
  try {
    const payload = decodeJWT(token);
    return payload[claim] || null;
  } catch {
    return null;
  }
}
