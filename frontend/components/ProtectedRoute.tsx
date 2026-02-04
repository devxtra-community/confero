'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axiosInstance';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get('/users/verify-session');

        if (!response.data.success) {
          router.push('/login');
          return;
        }

        const userData = response.data.user;
        setUser(userData);

        if (requiredRole && userData.role !== requiredRole) {
          if (userData.role === 'admin' && requiredRole === 'user') {
            router.push('/admin');
          } else if (userData.role === 'user' && requiredRole === 'admin') {
            router.push('/forbidden');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
