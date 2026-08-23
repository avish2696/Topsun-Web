/**
 * Environment Variable Checker
 * Verifies that all required environment variables are properly loaded
 */

export function checkEnvironmentVariables() {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_API_BASE_URL',
  ];

  return requiredVars.every((key) => !!import.meta.env[key]);
}

/**
 * Get API base URL with fallback
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'https://topsun.in/topsun-backend-php';
}
