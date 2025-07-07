"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ClickOutside from "@/components/ClickOutside";
import { getUserData, logoutUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import { fetchUserById } from "@/services/user";

const DropdownUser = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [firstName, setUserfirstName] = useState<string | null>(null);
  const [lastName, setUserlastName] = useState<string | null>(null);
  const [photo, setUserphoto] = useState<string | null>(null);
  const [role, setUserrole] = useState<string | null>(null);

  const updateUserData = async () => {
    const userData = getUserData();
    if (userData) {
      try {
        // Récupérer les données utilisateur à jour depuis le backend
        const updatedUserData = await fetchUserById(userData.userId.toString());
        
        setUserfirstName(updatedUserData.firstName || "Utilisateur");
        setUserlastName(updatedUserData.lastName || "Utilisateur");
        setUserrole(updatedUserData.role || "Utilisateur");
        
        if (updatedUserData.photo) {
          if (updatedUserData.photo.startsWith('https://lh3.googleusercontent.com')) {
            setUserphoto(updatedUserData.photo);
          } else {
            setUserphoto(`${process.env.NEXT_PUBLIC_BACKEND_URL}${updatedUserData.photo}`);
          }
        } else {
          setUserphoto(null);
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour des données utilisateur:", error);
      }
    }
  };

  useEffect(() => {
    updateUserData();

    // Mettre à jour les données toutes les 30 secondes
    const interval = setInterval(updateUserData, 30000);

    // Écouter les changements de photo
    const handlePhotoUpdate = () => {
      updateUserData();
    };

    // Écouter les événements de stockage pour les mises à jour de photo
    window.addEventListener('photo-updated', handlePhotoUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('photo-updated', handlePhotoUpdate);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.push("/signin");
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <div
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-5 cursor-pointer transition-all duration-300 hover:opacity-80 p-1"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-base font-semibold text-black dark:text-white">
            {firstName} {lastName}
          </span>
          <span className="block text-sm text-gray-600 dark:text-gray-300 mt-1">{role}</span>
        </span>

        <span className="h-12 w-12 rounded-full overflow-hidden transition-transform duration-300 hover:scale-110 shadow-md">
          <Image
            src={photo || "/images/user/user1.jpg"}
            alt="User profile"
            width={48}
            height={48}
            className="h-12 w-12 object-cover rounded-full"
            style={{ objectFit: 'cover', width: '48px', height: '48px' }}
            unoptimized={true}
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/user/user1.jpg'; }}
          />
        </span>

        <svg
          className={`hidden fill-current sm:block transition-transform duration-300 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </div>

      {dropdownOpen && (
        <div className="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark transform transition-all duration-300 ease-in-out translate-y-0 opacity-100">
          <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
            <li>
              <Link
                href="/profile"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base transition-transform hover:translate-x-1"
                onClick={() => setDropdownOpen(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                My Profile
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base transition-transform hover:translate-x-1"
                onClick={() => setDropdownOpen(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Account Settings
              </Link>
            </li>
          </ul>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium text-red-500 hover:text-red-700 duration-300 ease-in-out lg:text-base transition-transform hover:translate-x-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Déconnexion
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;
