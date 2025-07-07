"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MiniSprintCard from "@/components/Gestion-tache-projet/MiniSprintCard";
import { fetchUserById, User } from "@/services/user";
import { getUserData } from "@/services/authService";
import { motion } from "framer-motion";

const Favoris = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = getUserData();
      if (!userData || !userData.userId) {
        setError("Utilisateur non authentifié ou ID non valide.");
        setLoading(false);
        return;
      }

      try {
        const user = await fetchUserById(userData.userId.toString());
        setUserData(user);
      } catch (err) {
        setError("Erreur lors du chargement des données utilisateur.");
      } finally {
        setLoading(false);
      }
    };

    const loadFavorites = () => {
      const storedFavorites = localStorage.getItem("favorites");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    };

    fetchUser();
    loadFavorites();
  }, []);

  const toggleFavorite = (projectId: number) => {
    let newFavorites;
    if (favorites.includes(projectId)) {
      newFavorites = favorites.filter((id) => id !== projectId);
    } else {
      newFavorites = [...favorites, projectId];
    }
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  if (loading)
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-16 border-4 border-primary rounded-full border-t-transparent"
          />
        </div>
      </DefaultLayout>
    );

  if (error)
    return (
      <DefaultLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-red-500 mt-20"
        >
          {error}
        </motion.div>
      </DefaultLayout>
    );

  const favoriteProjects = userData?.projects?.filter((project) =>
    favorites.includes(project.id)
  );

  return (
    <DefaultLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Breadcrumb pageName="Mes Favoris" />

        {/* Header Section with Animation */}
        <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-gradient-to-r from-[#2560a0] via-[#2560a0] to-[#d01e3e] rounded-t-lg relative overflow-hidden mb-8">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Heart pulses */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`heart-${i}`}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                className="absolute text-white/20"
                style={{
                  top: `${30 + i * 20}%`,
                  right: `${20 + i * 15}%`,
                }}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </motion.div>
            ))}
            {/* Floating bookmarks */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={`bookmark-${i}`}
                animate={{
                  y: [0, -10, 0],
                  rotate: [-3, 3, -3],
                }}
                transition={{
                  duration: 6 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.2,
                }}
                className="absolute text-white/20"
                style={{
                  top: `${50 + i * 15}%`,
                  left: `${30 + i * 20}%`,
                }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                </svg>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <motion.h4 
              className="text-2xl font-bold text-white mb-2"
            >
              Mes Projets Favoris
            </motion.h4>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-sm"
            >
              Accédez rapidement à vos projets préférés
            </motion.p>
          </motion.div>
        </div>

        {favoriteProjects?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-96 bg-white dark:bg-boxdark rounded-lg shadow-sm border border-stroke dark:border-strokedark"
          >
            <Image
              src="/images/icon/noresult.png"
              alt="Aucun résultat"
              width={200}
              height={200}
              className="mb-4"
              sizes="(max-width: 768px) 200px, 200px"
            />
            <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold">
              Aucun projet favori à afficher.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favoriteProjects?.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <MiniSprintCard
                  projectId={project.id}
                  projectName={project.name}
                  isFavorite={favorites.includes(project.id)}
                  toggleFavorite={toggleFavorite}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </DefaultLayout>
  );
};

export default Favoris;
