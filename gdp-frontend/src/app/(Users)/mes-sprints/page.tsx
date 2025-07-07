"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { fetchUserById, User } from "@/services/user";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getUserData } from "@/services/authService";
import MiniSprintCard from "@/components/Gestion-tache-projet/MiniSprintCard";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

const MesSprints = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

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

  const toggleFavorite = (projectId: number, projectName: string) => {
    let newFavorites;
    if (favorites.includes(projectId)) {
      newFavorites = favorites.filter((id) => id !== projectId);
      setAlertMessage(`"${projectName}" a été retiré de vos favoris.`);
    } else {
      newFavorites = [...favorites, projectId];
      setAlertMessage(`"${projectName}" a été ajouté à vos favoris.`);
    }
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));

    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
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

  return (
    <DefaultLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Breadcrumb pageName={`Sprints de ${userData?.firstName ?? "Utilisateur"}`} />

        {/* Header Section with Animation */}
        <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-gradient-to-r from-[#2560a0] via-[#2560a0] to-[#d01e3e] rounded-t-lg relative overflow-hidden mb-8">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Sprint timeline elements */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, 20, 0],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 6 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.8,
                }}
                className="absolute h-2 bg-white/30 rounded-full"
                style={{
                  width: "60%",
                  top: `${20 + i * 15}%`,
                  left: "20%",
                }}
              />
            ))}
            {/* Sprint progress indicators */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`progress-${i}`}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                className="absolute w-3 h-3 bg-white/40 rounded-full"
                style={{
                  top: `${30 + i * 20}%`,
                  left: `${40 + i * 10}%`,
                }}
              />
            ))}
            {/* Sprint completion checkmarks */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={`check-${i}`}
                animate={{
                  scale: [0.8, 1, 0.8],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.2,
                }}
                className="absolute text-white/40"
                style={{
                  top: `${50 + i * 15}%`,
                  right: `${20 + i * 15}%`,
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
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
              Mes Sprints
            </motion.h4>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-sm"
            >
              Gérez et suivez vos sprints en cours
            </motion.p>
          </motion.div>
        </div>

        <AnimatePresence>
          {alertMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-center p-4 mb-4 text-blue-800 border-t-4 border-blue-300 bg-blue-50 dark:text-blue-400 dark:bg-gray-800 dark:border-blue-800 rounded-lg shadow-sm"
              role="alert"
            >
              <svg className="shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <div className="ms-3 text-sm font-medium">
                {alertMessage}
              </div>
              <button
                type="button"
                className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
                onClick={() => setAlertMessage(null)}
                aria-label="Close"
              >
                <FiX className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {userData?.projects?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center"
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
              Aucun projet à afficher.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {userData?.projects?.map((project, index) => (
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
                  toggleFavorite={() => toggleFavorite(project.id, project.name)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </DefaultLayout>
  );
};

export default MesSprints;
