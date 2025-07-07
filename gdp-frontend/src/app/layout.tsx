"use client";

import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState, Suspense } from "react";
import Loader from "@/components/common/Loader";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import VoiceAssistant from "@/components/VoiceAssistant";
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname(); // Get the current path

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Pages où le VoiceAssistant ne doit pas être affiché
  const excludedPaths = ['/signin', '/ResetPassword', '/reset-password', '/reset-password-token'];

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo/mini-logo.png" type="image/png" />
      </head>
      <body suppressHydrationWarning={true}>
        <FavoritesProvider>
          <Suspense fallback={<Loader />}>
            <AuthProvider>
              <div className="dark:bg-boxdark-2 dark:text-bodydark">
                {loading ? <Loader /> : children}
                {!excludedPaths.includes(pathname) && <VoiceAssistant />}
              </div>
            </AuthProvider>
          </Suspense>
        </FavoritesProvider>
      </body>
    </html>
  );
}
