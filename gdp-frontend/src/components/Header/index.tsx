"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUserRole } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownMessage from "./DropdownMessage";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";
import { FavoritesContext } from "@/context/FavoritesContext";
import { BsWindowSidebar } from "react-icons/bs";

const Header = ({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { userRole, setUserRole } = useAuth();
  const [active, setActive] = useState<string>("");
  const { notifyingFavorites, setNotifyingFavorites } = useContext(FavoritesContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const storedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
  const [theme, setTheme] = useState<"blue" | "gray" | "dark">(storedTheme as "blue" | "gray" | "dark" || "blue");

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    const currentUrl = window.location.pathname;
    if (currentUrl.includes("mes-sprints")) {
      setActive("mes-sprints");
    } else if (currentUrl.includes("mes-projets")) {
      setActive("mes-projets");
    } else if (currentUrl.includes("favoris")) {
      setActive("favoris");
      console.log("Navigating to Favoris, resetting notification");
      setNotifyingFavorites(false); // Reset notification when "Favoris" is opened
    } else if (currentUrl.includes("taches")) {
      setActive("taches");
    } else if (currentUrl.includes("rapports")) {
      setActive("rapports");
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && (savedTheme === "blue" || savedTheme === "gray" || savedTheme === "dark")) {
      setTheme(savedTheme as "blue" | "gray" | "dark");
    }
  }, [userRole, notifyingFavorites, setNotifyingFavorites]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && (savedTheme === "blue" || savedTheme === "gray" || savedTheme === "dark")) {
      setTheme(savedTheme as "blue" | "gray" | "dark");
    }
  }, []);

  const themes = useMemo(() => ({
    blue: { backgroundColor: "#dde4ed", color: "#2560a0" },
    gray: { backgroundColor: "#f0f0f0", color: "#333" },
    dark: { backgroundColor: "#20242c", color: "#ffffff" },
  }), []);

  useEffect(() => {
    document.body.style.backgroundColor = themes[theme].backgroundColor;
    document.body.style.color = themes[theme].color;
    localStorage.setItem("theme", theme);
  }, [theme, themes]);

  const handleNavigation = (path: string, name: string) => {
    setActive(name);
    router.push(path);
  };

  // Ajouter un écouteur d'événements pour les changements de rôle
  useEffect(() => {
    const handleRoleChange = () => {
      const newRole = getUserRole();
      if (newRole) {
        setUserRole(newRole);
      }
    };

    // Écouter les changements de stockage local
    window.addEventListener('storage', handleRoleChange);

    
    // Vérifier le rôle au chargement
    handleRoleChange();

    return () => {
      window.removeEventListener('storage', handleRoleChange);
    };
  }, [setUserRole]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 flex flex-col w-full bg-white drop-shadow-md dark:bg-boxdark dark:drop-shadow-none transition-all duration-300 ease-in-out ${
          menuOpen ? "w-[calc(100%-255px)]" : "w-full"
        }`}
      >
        <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-sm md:px-6 2x:px-11 dark:shadow-none border-b border-stroke dark:border-strokedark">
          <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
            <button
              aria-controls="sidebar"
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              }}
              className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden transition-transform duration-300 hover:scale-110"
            >
              <svg
                className="w-6 h-6 stroke-current text-black dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <Link className="block flex-shrink-0 lg:hidden transition-transform duration-300 hover:scale-105" href="/">
              <Image width={32} height={32} src={"/images/logo/mini-logo.png"} alt="Logo" />
            </Link>
          </div>

          <div className="hidden sm:block">
            <form>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full xl:w-125 py-2 pl-10 pr-4 text-sm text-black dark:text-gray-300 bg-gray-100 dark:bg-boxdark border border-gray-200 dark:border-strokedark rounded-lg focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary dark:focus:ring-primary transition-all duration-200 ease-in-out placeholder-gray-500 dark:placeholder-gray-400"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-3 2xsm:gap-7">
            <ul className="flex items-center gap-2 2xsm:gap-4">
              <DarkModeSwitcher />
              {/* {userRole === "ADMIN" && <DropdownNotification />} */}
              {/* {userRole === "ADMIN" && <DropdownMessage />} */}
            </ul>

            {isAuthenticated ? (
              <div className="relative z-50">
                <DropdownUser />
              </div>
            ) : (
              <Link href="/signin">
                <button className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 transform hover:scale-105">
                  Connexion
                </button>
              </Link>
            )}
          </div>
        </div>

        <div
          className="w-full border-t border-gray-200 dark:border-strokedark transition-all duration-300 min-h-[48px]"
          style={{
            background: "linear-gradient(to left, #2560a0, #d01e3e)",
          }}
        >
          {userRole === "ADMIN" ? (
            <div className="max-w-screen-2xl mx-auto px-6">
              <div className="flex justify-center items-center py-3 space-x-6 text-white font-medium relative">
                {[
                  { path: "/mes-sprints", name: "mes-sprints", label: "Mes Tableaux de Travail" },
                  { path: "/mes-projets", name: "mes-projets", label: "Mes Projets" },
                  { path: "/favoris", name: "favoris", label: "Mes Favoris" },
                
                ].map((item, index) => (
                  <React.Fragment key={item.name}>
                    <Link
                      href={item.path}
                      className={`relative group transition-all duration-300 ${
                        active === item.name ? "border-b-2 border-white" : ""
                      }`}
                      onClick={() => handleNavigation(item.path, item.name)}
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    {index < 2 && <span className="text-white">|</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full"></div>
          )}
        </div>
      </header>

      {menuOpen && (
        <div className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-boxdark shadow-lg transform transition-transform duration-300">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Menu</h2>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }

        .blinking-dot {
          animation: blink 1s infinite;
        }

        .group:hover .group-hover\:w-full {
          width: 100%;
        }
      `}</style>
    </>
  );
};

export default Header;
