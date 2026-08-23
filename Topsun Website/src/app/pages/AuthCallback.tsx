import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';

/**
 * OAuth Callback Handler
 * Handles redirect from Supabase after Google OAuth
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const redirectStarted = useRef(false);

  useEffect(() => {
    console.log('🔄 AuthCallback: Processing OAuth redirect...');
    console.log('User:', user, 'Loading:', isLoading);

    // If redirection has already been initiated, do nothing
    if (redirectStarted.current) {
      console.log('⏳ AuthCallback: Redirection already in progress, skipping effect');
      return;
    }

    // If user is authenticated, redirect to saved destination or home
    if (user && !isLoading) {
      redirectStarted.current = true;
      console.log('✅ AuthCallback: User authenticated:', user);
      const redirectTo = localStorage.getItem('auth_redirect') || '/';
      localStorage.removeItem('auth_redirect');
      console.log('🚀 Redirecting to:', redirectTo);
      
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1500);
      return;
    }

    // If still loading, wait for auth state
    if (isLoading) {
      console.log('⏳ AuthCallback: Waiting for auth...');
      return;
    }

    // If no user after 5 seconds, redirect to home anyway
    const timeout = setTimeout(() => {
      if (!redirectStarted.current) {
        console.log('⏱️ AuthCallback: Timeout - redirecting to home');
        navigate('/', { replace: true });
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [user, isLoading, navigate]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#f5f5f5',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '48px',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}>⚙️</div>
        <h2>Signing you in...</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>Please wait while we verify your authentication.</p>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

