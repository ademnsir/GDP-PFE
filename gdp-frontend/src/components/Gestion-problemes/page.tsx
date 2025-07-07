"use client";

import { useEffect, useState } from "react";
import { fetchAllProjects, fetchTechnologyLatestVersion, Project } from "@/services/Project";
import { fetchAllConges, Conge } from "@/services/conge";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExclamationTriangleIcon, XCircleIcon, UserIcon, ClockIcon, ChartBarIcon, UsersIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid";
import { FiUser } from "react-icons/fi";

const ProjectAlerts = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<{ type: string; message: string; project: Project }[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [stats, setStats] = useState({
    totalAlerts: 0,
    delayedProjects: 0,
    outdatedTech: 0,
    suspendedUsers: 0,
    onLeaveUsers: 0
  });

  useEffect(() => {
    const fetchProjectsAndCheckAlerts = async () => {
      try {
        const projectsData = await fetchAllProjects();
        const allConges = await fetchAllConges();
        setProjects(projectsData);
        const newAlerts = [];
        let delayedCount = 0;
        let outdatedCount = 0;
        let suspendedCount = 0;
        let onLeaveCount = 0;
        const usersOnLeave = new Set(); // Pour suivre les utilisateurs déjà comptés comme étant en congé
        const suspendedUsers = new Set(); // Pour suivre les utilisateurs déjà comptés comme étant suspendus

        // D'abord, compter les utilisateurs suspendus
        projectsData.forEach((project) => {
          project.users.forEach((user) => {
            if (user.status.toUpperCase() === "SUSPENDU" && !suspendedUsers.has(user.matricule)) {
              suspendedUsers.add(user.matricule);
              suspendedCount++;
            }
          });
        });

        const today = new Date();
        projectsData.forEach((project) => {
          if (project.estimatedEndDate) {
            const endDate = new Date(project.estimatedEndDate);
            if (endDate < today) {
              delayedCount++;
              newAlerts.push({
                type: "danger",
                message: `Le projet "${project.name}" est en retard.`,
                project,
              });
            }
          }

          project.users.forEach((user) => {
            if (user.status.toUpperCase() === "SUSPENDU") {
              newAlerts.push({
                type: "suspended",
                message: `L'utilisateur "${user.firstName} ${user.lastName}" est suspendu mais travaille sur le projet "${project.name}".`,
                project,
              });
            }

            // Vérifier si l'utilisateur est en congé
            const userConges = allConges.filter((conge: Conge) => {
              const startDate = new Date(conge.startDate);
              const endDate = new Date(conge.endDate);
              
              // Vérification des conditions
              const isMatriculeMatch = conge.matricule === user.matricule;
              const isStatusApproved = conge.status === "APPROVED";
              
              // Vérifier que le matricule correspond et que le congé est approuvé
              if (!isMatriculeMatch) {
                return false;
              }

              if (!isStatusApproved) {
                return false;
              }

              // Vérifier si la date de fin est dépassée
              if (endDate < today) {
                // Supprimer le congé automatiquement
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/conges/${conge.id}`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }).catch(error => {
                  console.error('Erreur lors de la suppression du congé:', error);
                });
                return false;
              }

              return true;
            });

            if (userConges.length > 0) {
              // Vérifier si l'utilisateur n'a pas déjà été compté comme étant en congé
              if (!usersOnLeave.has(user.matricule)) {
                usersOnLeave.add(user.matricule);
                onLeaveCount++;
              }
              newAlerts.push({
                type: "leave",
                message: `L'utilisateur "${user.firstName} ${user.lastName}" est en congé (${userConges[0].type}) du ${new Date(userConges[0].startDate).toLocaleDateString('fr-FR')} au ${new Date(userConges[0].endDate).toLocaleDateString('fr-FR')} mais travaille sur le projet "${project.name}".`,
                project,
              });
            }
          });
        });

        for (const project of projectsData) {
          for (const livrable of project.livrables) {
            for (const tech of livrable.technologies) {
              const latestVersion = await fetchTechnologyLatestVersion(tech.label);
              if (latestVersion && compareVersions(tech.version, latestVersion)) {
                outdatedCount++;
                newAlerts.push({
                  type: "warning",
                  message: `Technologie obsolète "${tech.label}" (${tech.version} < ${latestVersion}).`,
                  project,
                });
              }
            }
          }
        }

        setStats({
          totalAlerts: newAlerts.length,
          delayedProjects: delayedCount,
          outdatedTech: outdatedCount,
          suspendedUsers: suspendedCount,
          onLeaveUsers: onLeaveCount
        });

        setAlerts(newAlerts);
      } catch (err) {
        console.error("Erreur lors de la récupération des projets:", err);
        setError("Impossible de charger les alertes des projets.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndCheckAlerts();
  }, []);

  const compareVersions = (currentVersion: string, latestVersion: string): boolean => {
    const current = currentVersion.split(".").map(Number);
    const latest = latestVersion.split(".").map(Number);
    for (let i = 0; i < latest.length; i++) {
      if ((current[i] || 0) < latest[i]) {
        return true;
      }
    }
    return false;
  };

  const filteredAlerts = alerts.filter((alert) => filterType === "all" || alert.type === filterType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb pageName="Tableau de bord des alertes" />

        {/* Header Section with Enhanced Animations */}
        <div className="bg-gradient-to-r from-[#2560a0] via-[#2560a0] to-[#d01e3e] rounded-2xl shadow-xl p-8 mb-8 border border-white/30 dark:border-gray-700 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated alert cards */}
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.5, 0.2],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 8 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.2,
                }}
                className={`absolute w-40 h-24 rounded-xl border ${
                  i % 3 === 0
                    ? "bg-red-100/40 border-red-200/40"
                    : i % 3 === 1
                    ? "bg-yellow-100/40 border-yellow-200/40"
                    : "bg-blue-100/40 border-blue-200/40"
                }`}
                style={{
                  left: `${5 + i * 15}%`,
                  top: `${20 + (i % 2) * 30}%`,
                  transform: `rotate(${i * 3}deg)`,
                }}
              >
                <div className="p-2">
                  {i % 3 === 0 ? (
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500/70" />
                  ) : i % 3 === 1 ? (
                    <ClockIcon className="w-6 h-6 text-yellow-500/70" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-blue-500/70" />
                  )}
                </div>
              </motion.div>
            ))}
            {/* Single animated progress bar at the bottom */}
            <motion.div
              animate={{
                scaleX: [0, 1, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute h-1 bg-white/50 rounded-full"
              style={{
                width: "80%",
                bottom: "10%",
                left: "10%",
                transformOrigin: "left",
              }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl font-bold text-white mb-4 md:mb-0"
                >
                  Tableau de bord des alertes
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-2 text-white/80 max-w-2xl"
                >
                  Vue d&apos;ensemble des problèmes et alertes du système. Surveillez l&apos;état de vos projets en temps réel.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-4"
              >
                <select
                  className="px-4 py-2 rounded-xl bg-white/20 text-white border border-white/30 shadow-sm outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 [&>option]:bg-[#2560a0] [&>option]:text-white"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tous les problèmes</option>
                  <option value="danger">Retards</option>
                  <option value="warning">Technologies obsolètes</option>
                  <option value="suspended">Utilisateurs suspendus</option>
                  <option value="leave">Utilisateurs en congé</option>
                </select>
                <button className="px-4 py-2 rounded-xl bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-colors flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  Exporter le rapport
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats Cards with Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-red-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/20">
                  <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Projets en retard</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.delayedProjects}</p>
                </div>
              </div>
              <div className="flex items-center text-red-500">
                <ArrowTrendingUpIcon className="w-5 h-5" />
                <span className="ml-1 text-sm font-medium">+2</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/20">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Technologies obsolètes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.outdatedTech}</p>
                </div>
              </div>
              <div className="flex items-center text-yellow-500">
                <ArrowTrendingDownIcon className="w-5 h-5" />
                <span className="ml-1 text-sm font-medium">-1</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                  <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Utilisateurs suspendus</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.suspendedUsers}</p>
                </div>
              </div>
              <div className="flex items-center text-blue-500">
                <ArrowTrendingUpIcon className="w-5 h-5" />
                <span className="ml-1 text-sm font-medium">+1</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                  <UserIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Utilisateurs en congé</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.onLeaveUsers}</p>
                </div>
              </div>
              <div className="flex items-center text-purple-500">
                <ArrowTrendingUpIcon className="w-5 h-5" />
                <span className="ml-1 text-sm font-medium">+1</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Alerts Timeline */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
          >
            <div className="flex flex-col items-center justify-center h-96">
              <div className="relative w-64 h-64 mb-6">
                <Image
                  src="/images/icon/noresult.png"
                  alt="Aucun résultat"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Aucune alerte détectée
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">
                Il n&apos;y a pas encore de livrables pour ce projet
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Détail des alertes</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Trier par :</span>
                <select className="text-sm bg-transparent border-0 focus:ring-0">
                  <option>Date</option>
                  <option>Type</option>
                  <option>Projet</option>
                </select>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAlerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                  onClick={() => router.push(`/projet/DetailsProject/${alert.project.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      alert.type === "danger"
                        ? "bg-red-100 dark:bg-red-900/30"
                        : alert.type === "warning"
                        ? "bg-yellow-100 dark:bg-yellow-900/30"
                        : alert.type === "suspended"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-purple-100 dark:bg-purple-900/30"
                    }`}>
                      {alert.type === "danger" ? (
                        <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                      ) : alert.type === "warning" ? (
                        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      ) : alert.type === "suspended" ? (
                        <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                          {alert.message}
                        </p>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {alert.type === "danger" ? "Retard" : alert.type === "warning" ? "Technologie" : alert.type === "suspended" ? "Utilisateur" : "Utilisateur en congé"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Projet: {alert.project.name}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex -space-x-3">
                          {alert.project.users && alert.project.users.slice(0, 3).map((member, idx) => (
                            <div
                              key={idx}
                              className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden cursor-pointer transition-transform hover:scale-110 hover:z-10"
                              style={{ zIndex: alert.project.users.length - idx }}
                              title={`${member.firstName} ${member.lastName}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                router.push(`/profileUsers/${member.id}`);
                              }}
                            >
                              {member.photo ? (
                                <Image
                                  src={
                                    process.env.NEXT_PUBLIC_BACKEND_URL
                                      ? new URL(member.photo, process.env.NEXT_PUBLIC_BACKEND_URL).toString()
                                      : member.photo
                                  }
                                  alt={`${member.firstName} ${member.lastName}`}
                                  width={32}
                                  height={32}
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/images/user/user1.jpg";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <FiUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </div>
                              )}
                            </div>
                          ))}
                          {alert.project.users.length > 3 && (
                            <div className="relative w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                              +{alert.project.users.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {alert.project.users.length} membres
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectAlerts;
