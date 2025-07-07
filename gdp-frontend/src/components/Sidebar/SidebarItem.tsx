"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface MenuItem {
  icon: React.ReactElement;
  label: string;
  route: string;
  children?: { label: string; route: string }[];
}

interface SidebarItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  isActive: boolean;
}

const SidebarItem = ({ item, isCollapsed, isActive }: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const iconClasses = isCollapsed ? 'w-5 h-5' : 'w-5 h-5';

  // Vérifier si l'élément actuel ou l'un de ses enfants est actif
  const isActiveCallback = useCallback((currentItem: any) => {
    if (currentItem.route === pathname) return true;
    if (currentItem.children) {
      return currentItem.children.some((child: any) => isActiveCallback(child));
    }
    return false;
  }, [pathname]);

  // Forcer l'ouverture si un élément enfant est actif
  useEffect(() => {
    if (isActiveCallback(item)) {
      setIsOpen(true);
    }
  }, [pathname, isActiveCallback, item]);

  // Gestionnaire pour le clic sur la flèche
  const handleArrowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Gestionnaire pour la navigation
  const handleNavigation = (e: React.MouseEvent) => {
    if (isCollapsed) {
      e.preventDefault();
      router.push(item.route);
    }
  };

  if (item.children) {
    return (
      <li className="w-full">
        <div className="flex items-center w-full">
          {/* Lien principal pour la navigation */}
          <Link
            href={item.route}
            onClick={handleNavigation}
            className={`flex-1 flex items-center p-3 text-base hover:bg-blue-50 dark:hover:bg-meta-4 rounded-lg relative
              ${isActive ? 'bg-blue-50 dark:bg-meta-4 text-blue-600 dark:text-white' : 'text-gray-700 dark:text-white'}
              ${isCollapsed ? 'justify-center' : ''}`}
          >
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg"></div>
            )}
            <div className="flex items-center gap-3">
              <span className={`${iconClasses} ${isActive ? 'text-blue-600 dark:text-white' : 'text-gray-500 dark:text-white'}`}>{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </div>
          </Link>

          {/* Bouton de la flèche pour le dropdown */}
          {!isCollapsed && (
            <button
              onClick={handleArrowClick}
              className="p-2 hover:bg-blue-50 dark:hover:bg-meta-4 rounded-lg"
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <ChevronDownIcon
                className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} ${isActive ? 'text-blue-600 dark:text-white' : 'text-gray-500 dark:text-white'}`}
              />
            </button>
          )}
        </div>

        {/* Contenu du dropdown */}
        {isOpen && !isCollapsed && (
          <ul className="pl-10 mt-2 space-y-2">
            {item.children.map((child, index) => (
              <li key={index}>
                <Link
                  href={child.route}
                  className={`block p-2 text-sm hover:bg-blue-50 dark:hover:bg-meta-4 rounded-lg ${
                    pathname === child.route ? 'bg-blue-50 dark:bg-meta-4 text-blue-600 dark:text-white' : 'text-gray-700 dark:text-white'
                  }`}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  // Rendu pour les éléments sans enfants
  return (
    <li>
      <Link
        href={item.route}
        className={`flex items-center w-full p-3 text-base hover:bg-blue-50 dark:hover:bg-meta-4 rounded-lg relative
          ${isActive ? 'bg-blue-50 dark:bg-meta-4 text-blue-600 dark:text-white' : 'text-gray-700 dark:text-white'}
          ${isCollapsed ? 'justify-center' : ''}`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg"></div>
        )}
        <div className="flex items-center gap-3">
          <span className={`${iconClasses} ${isActive ? 'text-blue-600 dark:text-white' : 'text-gray-500 dark:text-white'}`}>{item.icon}</span>
          {!isCollapsed && <span>{item.label}</span>}
        </div>
      </Link>
    </li>
  );
};

export default SidebarItem;
