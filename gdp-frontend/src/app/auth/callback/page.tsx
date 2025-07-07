"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserData } from "@/services/authService";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        if (token) {
          console.log('Token found in URL, setting in localStorage');
          localStorage.setItem('token', token);
          
          // Vérifier si l'utilisateur a un profil complet
          const userData = getUserData();
          if (userData) {
            // Rediriger vers le Dashboard
            router.replace('/Dashboard');
          } else {
            // Rediriger vers la page de profil pour compléter les informations
            router.replace('/profile');
          }
        } else {
          console.error('No token found in URL');
          router.replace('/SignIn?error=google_auth_failed');
        }
      } catch (error) {
        console.error('Error in callback:', error);
        router.replace('/SignIn?error=google_auth_failed');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Connexion en cours...</h1>
        <p className="text-gray-600">Veuillez patienter pendant que nous vous connectons.</p>
      </div>
    </div>
  );
} 