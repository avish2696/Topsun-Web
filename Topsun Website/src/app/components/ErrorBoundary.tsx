import { ReactNode, useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('ErrorBoundary caught error:', event.error);
      setHasError(true);
      setError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('ErrorBoundary caught unhandled rejection:', event.reason);
      setHasError(true);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f8f8',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#333',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#d32f2f' }}>
            Application Error
          </h1>
          <p style={{ marginBottom: '12px', color: '#666' }}>
            Something went wrong while rendering the application.
          </p>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            color: '#666',
            textAlign: 'left'
          }}>
            {error?.message || 'Unknown error'}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
