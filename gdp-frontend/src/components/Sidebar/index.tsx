import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import { getUserRole } from "@/services/authService";
import {
  HomeIcon,
  FolderIcon,
  ArrowPathIcon,
  BellIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ServerIcon,
  UserGroupIcon,
  StarIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Menu, X } from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  // Forcer le re-rendu quand le rôle change
  useEffect(() => {
    if (userRole) {
      // Le rôle est chargé, on peut maintenant afficher le menu correct
      console.log("User role loaded:", userRole);
    }
  }, [userRole]);

  const getAdminMenuItems = () => {
    const baseItems = [
      {
        icon: <HomeIcon className="h-4 w-4" />,
        label: "Tableaux de bord",
        route: "/Dashboard",
      },
      {
        icon: <UserGroupIcon className="h-4 w-4" />,
        label: "Utilisateurs et Rôles",
        route: "/list-Users",
        children: [
          { label: "Liste des Stagiaires", route: "/stagieres" }
        ],
      },
      {
        icon: <FolderIcon className="h-4 w-4" />,
        label: "Projets & Tâches",
        route: "/projet/table-Projet",
      },
      {
        icon: <ArrowPathIcon className="h-4 w-4" />,
        label: "Tâche Périodique",
        route: "/tache-periodique",
        children: [
          { label: "Liste des tâches", route: "/tache-periodique/affichage-normal" },
        ],
      },
      {
        icon: <BellIcon className="h-4 w-4" />,
        label: "Suivi des Problèmes",
        route: "/problemes",
      },
      {
        icon: <CalendarIcon className="h-4 w-4" />,
        label: "Congés & Permissions",
        route: "/conges",
        children: [
          { label: "Liste des congés", route: "/conges/listconge" },
        ],
      },
      {
        icon: <ServerIcon className="h-4 w-4" />,
        label: "Projets et Serveurs",
        route: "/projet/Serveur-projet",
      },
    ];

    return baseItems;
  };

  const getInfraMenuItems = () => {
    return [
   
      {
        icon: <ClipboardDocumentListIcon className="h-4 w-4" />,
        label: "Mes Tableaux de Travail",
        route: "/mes-sprints",
      },
      {
        icon: <FolderIcon className="h-4 w-4" />,
        label: "Mes Projets",
        route: "/mes-projets",
      },
      {
        icon: <StarIcon className="h-4 w-4" />,
        label: "Mes Favoris",
        route: "/favoris",
      },
      {
        icon: <CalendarIcon className="h-4 w-4" />,
        label: "Congés & Permissions",
        route: "/conges",
      },
      {
        icon: <ServerIcon className="h-4 w-4" />,
        label: "Projets et Serveurs",
        route: "/projet/Serveur-projet",
      },
    ];
  };

  const adminMenuItems = getAdminMenuItems();
  const infraMenuItems = getInfraMenuItems();

  const userMenuItems = [
    {
      icon: <ClipboardDocumentListIcon className="h-4 w-4" />,
      label: "Mes Tableaux de Travail",
      route: "/mes-sprints",
    },
    {
      icon: <FolderIcon className="h-4 w-4" />,
      label: "Mes Projets",
      route: "/mes-projets",
    },
    {
      icon: <StarIcon className="h-4 w-4" />,
      label: "Mes Favoris",
      route: "/favoris",
    },
    {
      icon: <CalendarIcon className="h-4 w-4" />,
      label: "Congés & Permissions",
      route: "/conges",
    },
  ];

  const getMenuItems = () => {
    if (userRole === "ADMIN") {
      return adminMenuItems;
    } else if (userRole === "INFRA") {
      return infraMenuItems;
    } else {
      return userMenuItems;
    }
  };

  const menuGroups = [
    {
      name: "MENU",
      menuItems: getMenuItems(),
    },
  ];

  const sidebarVariants = {
    open: {
      width: "280px",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      width: "70px",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  const contentVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1,
        duration: 0.3
      }
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={`fixed top-0 left-0 h-screen shadow-lg z-50 overflow-hidden
          ${sidebarOpen ? 'w-[280px]' : 'w-[70px] min-w-[70px]'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Fond animé avec motifs */}
        <div className="absolute inset-0 bg-white dark:bg-[#1f2937] overflow-hidden">
          {/* Motif géométrique de base */}
          <div className="absolute inset-0 geometric-pattern opacity-20 dark:opacity-30"></div>
          
          {/* Motifs flottants */}
          <div className="absolute inset-0">
            <div className="floating-pattern-1"></div>
            <div className="floating-pattern-2"></div>
            <div className="floating-pattern-3"></div>
          </div>

          {/* Effet de brillance */}
          <div className="absolute inset-0 shine-effect"></div>

          {/* Overlay pour la profondeur */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/50 to-blue-100/70 dark:via-[#1f2937]/50 dark:to-[#111827]/70"></div>
        </div>

        {/* Contenu de la sidebar */}
        <div className="relative z-10">
          <div className="flex items-center justify-center p-4 border-b border-white/10">
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src="/images/logo/logo.png"
                      alt="Logo"
                      width={100}
                      height={50}
                      style={{ width: "auto", height: "auto" }}
                      className="object-contain"
                    />
                    <div className="h-12 w-px bg-gray-200 dark:bg-gray-700"></div>
                    {/* <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#bc2444] bg-clip-text text-transparent">
                        GDP
                      </span>
                    </div> */}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center"
                >
                  <Image
                    src="/images/logo/mini-logo.png"
                    alt="Mini Logo"
                    width={38}
                    height={38}
                    className="object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reste du contenu de la sidebar */}
          <div className="relative">
            <nav className="p-4">
              {menuGroups.map((group, groupIndex) => (
                <div key={groupIndex} className={groupIndex === 1 ? "mt-6" : ""}>
                  {sidebarOpen && (
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="px-4 mb-4 text-sm font-medium text-[#cc2344] dark:text-white/60 uppercase tracking-wider"
                    >
                      {group.name}
                    </motion.h3>
                  )}
                  <ul className={`mt-2 space-y-3 ${groupIndex === 0 ? "mb-4" : ""}`}>
                    {group.menuItems.map((menuItem, menuIndex) => (
                      <SidebarItem
                        key={menuIndex}
                        item={{
                          ...menuItem,
                          icon: React.cloneElement(menuItem.icon as React.ReactElement, {
                            className: sidebarOpen ? 'h-5 w-5' : 'h-5 w-5'
                          })
                        }}
                        isCollapsed={!sidebarOpen}
                        isActive={pathname === menuItem.route}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Bouton de toggle repositionné en bas */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute bottom-16 transform group z-50 ${sidebarOpen ? '-right-0' : 'right-0'}`}
        >
          <div className="relative">
            {/* Effet d'ombre */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md transform group-hover:blur-lg transition-all duration-300"></div>
            
            {/* Bouton principal */}
            <div className="relative bg-white p-2 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)] transform transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:scale-105">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-1.5">
                {sidebarOpen ? (
                  <ChevronLeftIcon className="h-4 w-4 text-white transform transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-white transform transition-transform duration-300 group-hover:scale-110" />
                )}
              </div>
            </div>
          </div>
        </button>
      </motion.div>

      <style jsx>{`
        .geometric-pattern {
          background: 
            linear-gradient(45deg, transparent 48%, rgba(59,130,246,.2) 50%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(59,130,246,.2) 50%, transparent 52%);
          background-size: 30px 30px;
          animation: pattern-slide 20s linear infinite;
        }

        .floating-pattern-1,
        .floating-pattern-2,
        .floating-pattern-3 {
          position: absolute;
          width: 100px;
          height: 100px;
          border: 2px solid rgba(59,130,246,.2);
          border-radius: 20px;
          transform: rotate(45deg);
        }

        .floating-pattern-1 {
          top: 20%;
          left: 10%;
          animation: float-1 15s ease-in-out infinite;
        }

        .floating-pattern-2 {
          top: 50%;
          right: 15%;
          width: 150px;
          height: 150px;
          animation: float-2 20s ease-in-out infinite;
        }

        .floating-pattern-3 {
          bottom: 15%;
          left: 30%;
          width: 80px;
          height: 80px;
          animation: float-3 18s ease-in-out infinite;
        }

        .shine-effect {
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(59,130,246,.15) 50%,
            rgba(188, 36, 68, 0.15) 50%,
            transparent 100%
          );
          animation: shine 8s linear infinite;
        }

        @keyframes pattern-slide {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }

        @keyframes float-1 {
          0%, 100% { transform: rotate(45deg) translate(0, 0); }
          50% { transform: rotate(60deg) translate(20px, -20px); }
        }

        @keyframes float-2 {
          0%, 100% { transform: rotate(45deg) translate(0, 0); }
          50% { transform: rotate(30deg) translate(-20px, 20px); }
        }

        @keyframes float-3 {
          0%, 100% { transform: rotate(45deg) translate(0, 0); }
          50% { transform: rotate(55deg) translate(15px, -15px); }
        }

        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }

        /* Ajout d'un effet de pulse subtil pour le bouton */
        @keyframes subtle-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        button:hover .absolute {
          animation: subtle-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
