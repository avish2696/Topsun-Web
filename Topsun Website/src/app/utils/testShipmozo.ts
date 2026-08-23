/**
 * Test if Shipmozo environment variables are loaded
 * Call this from browser console to debug
 */

export function testShipmozoEnv() {
  const pubKey = import.meta.env.VITE_SHIPMOZO_PUBLIC_KEY;
  const privKey = import.meta.env.VITE_SHIPMOZO_PRIVATE_KEY;
  
  return {
    hasPublicKey: !!pubKey,
    hasPrivateKey: !!privKey,
  };
}

// Make it globally available for console testing
if (typeof window !== 'undefined') {
  (window as any).testShipmozoEnv = testShipmozoEnv;
  
  // Dynamically import and expose testShipmozoConnection to avoid circular dependency
  import('./shipmozoService').then(module => {
    (window as any).testShipmozoConnection = module.testShipmozoConnection;
    (window as any).testAllShipmozoEndpoints = module.testAllShipmozoEndpoints;
  }).catch(err => {
    console.warn('Could not load testShipmozoConnection:', err);
  });
}
