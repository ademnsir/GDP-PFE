import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/services/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/signin'); // 🔹 Redirige vers la connexion si pas de token
    } else {
      setIsAuthenticated(true);
    }
  }, [router]); // Include router in the dependency array

  return { isAuthenticated };
};
