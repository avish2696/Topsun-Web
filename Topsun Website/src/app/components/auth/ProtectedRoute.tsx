import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [canRender, setCanRender] = useState(!!user);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      navigate(`/signin?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
    } else {
      setCanRender(true);
    }
  }, [user, isLoading, navigate, location.pathname]);

  // If user exists, render immediately without loading state
  if (user) {
    return <>{children}</>;
  }

  // Show nothing while redirecting - no loading state needed
  return null;
}
