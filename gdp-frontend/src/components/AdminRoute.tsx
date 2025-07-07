"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/services/authService';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = () => {
      const userRole = getUserRole();
      if (userRole !== "ADMIN") {
        router.replace('/403');
      }
      setIsLoading(false);
    };

    checkAdmin();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute; 