import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { ReactNode } from 'react';
import { Loader } from 'lucide-react';

const ADMIN_EMAILS = [
  'admin@topsun.in',
  'topsunshoes7@gmail.com',
  'avishkar.kumar555@gmail.com',
];

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} className="animate-spin text-[#ADD8E6]" />
          <p className="text-sm text-gray-500 font-medium tracking-wide">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
}
