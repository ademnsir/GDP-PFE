"use client";

import { useEffect, useState } from "react";
import {
  fetchAllProjects,
  assignUsersByEmail,
  deleteProject,
  Project,
} from "@/services/Project";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Modal from "@/components/Gestion-projets/formulaire-assign-userProjet/adduser-projet";
import { fetchAllUsers, User } from "@/services/user";
import { getUserData } from "@/services/authService";
import Swal from "sweetalert2";
import { FiSearch, FiPlus, FiChevronLeft, FiChevronRight, FiMoreVertical, FiTrash2, FiTrello, FiShield, FiAlertCircle, FiCheck, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ProjectTable = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpenTaskId, setMenuOpenTaskId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<"DEVELOPPER" | "INFRA" | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; projectId: number | null }>({
    show: false,
    projectId: null,
  });
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const router = useRouter();
  

  const itemsPerPage = 10;

  useEffect(() => {
    const getProjects = async () => {
      try {
        const data = await fetchAllProjects();
        setProjects(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des projets:", err);
        setError("Échec de la récupération des projets. Veuillez vérifier votre serveur.");
      } finally {
        setLoading(false);
      }
    };

    getProjects();
  }, []);

  const handleAssignUsersByEmail = async (emails: string[]) => {
    if (!selectedProjectId || !modalType) return;

    try {
      // Récupérer tous les utilisateurs
      const allUsers = await fetchAllUsers();
      const userData = getUserData();

      // Vérifier si l'utilisateur a les permissions nécessaires
      if (userData?.role === "DEVELOPPER") {
        const project = projects.find(p => p.id === selectedProjectId);
        if (!project) {
          throw new Error("Projet non trouvé");
        }

        // Vérifier si l'utilisateur est déjà assigné au projet
        const isUserAssigned = project.users.some(user => user.id === userData.userId);
        if (!isUserAssigned) {
          setNotification({
            show: true,
            message: "Vous devez être assigné au projet pour pouvoir y ajouter d'autres utilisateurs",
            type: 'error'
          });
          return;
        }
      }

      // Récupérer les utilisateurs déjà assignés au projet
      const assignedUsers = getAssignedUsers(selectedProjectId);

      // Vérifier chaque email avant de l'assigner
      for (const email of emails) {
        // Trouver l'utilisateur par email dans la liste complète des utilisateurs
        const user = allUsers.find((u: { email: string }) => u.email === email);

        if (!user) {
          setNotification({
            show: true,
            message: `Utilisateur avec l'email ${email} non trouvé.`,
            type: 'error'
          });
          return;
        }

        // Vérifier le rôle de l'utilisateur par rapport au type de modal, sauf si c'est un ADMIN
        if (user.role !== "ADMIN") {
          if (modalType === "DEVELOPPER" && user.role !== "DEVELOPPER") {
            setNotification({
              show: true,
              message: `Cet utilisateur est un ${user.role}, pas un DEVELOPPER.`,
              type: 'error'
            });
            return;
          }

          if (modalType === "INFRA" && user.role !== "INFRA") {
            setNotification({
              show: true,
              message: `Cet utilisateur est un ${user.role}, pas un INFRA.`,
              type: 'error'
            });
            return;
          }
        }

        // Vérifier si l'utilisateur est déjà assigné au projet
        if (assignedUsers.some((u) => u.id === user.id)) {
          setNotification({
            show: true,
            message: `L'utilisateur ${user.firstName} ${user.lastName} est déjà assigné à ce projet.`,
            type: 'error'
          });
          return;
        }
      }

      // Si toutes les vérifications sont passées, assigner les utilisateurs
      await assignUsersByEmail(selectedProjectId, emails, modalType);

      // Mettre à jour la liste des projets
      const updatedProjects = await fetchAllProjects();
      setProjects(updatedProjects);

      // Afficher un message de succès
      setNotification({
        show: true,
        message: "Utilisateurs assignés avec succès !",
        type: 'success'
      });

      // Fermer le modal
      setIsModalOpen(false);

    } catch (error) {
      console.error("Erreur lors de l'assignation des utilisateurs:", error);
      setNotification({
        show: true,
        message: error instanceof Error ? error.message : "Échec de l'assignation des utilisateurs.",
        type: 'error'
      });
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "A faire":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "En cours":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Fini":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Récupérer les utilisateurs assignés pour un projet donné
  const getAssignedUsers = (projectId: number): User[] => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.users : [];
  };

  // Fonction utilitaire pour gérer l'URL des images des utilisateurs
  const getUserImageUrl = (user: User): string => {
    if (!user.photo) {
      return "/images/user/user1.jpg";
    }
    
    // Si c'est une URL Google (commence par https://lh3.googleusercontent.com)
    if (user.photo.startsWith('https://lh3.googleusercontent.com')) {
      return user.photo;
    }
    
    // Si c'est une URL relative, ajouter l'URL du backend
    if (user.photo.startsWith('/')) {
      return `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.photo}`;
    }
    
    // Si c'est déjà une URL complète
    if (user.photo.startsWith('http')) {
      return user.photo;
    }
    
    // Par défaut, ajouter l'URL du backend
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${user.photo}`;
  };

  // Ouvrir le modal pour assigner des utilisateurs
  const openModal = (projectId: number, type: "DEVELOPPER" | "INFRA") => {
    setSelectedProjectId(projectId);
    setModalType(type);
    setIsModalOpen(true);
    setAssignedUsers(getAssignedUsers(projectId)); // Mettre à jour la liste des utilisateurs assignés
  };

  const handleDeleteProject = async (projectId: number) => {
    setDeleteConfirmation({ show: true, projectId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.projectId) return;

    try {
      await deleteProject(deleteConfirmation.projectId);
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== deleteConfirmation.projectId)
      );
      setDeleteConfirmation({ show: false, projectId: null });
      setNotification({
        show: true,
        message: 'Le projet a été supprimé avec succès',
        type: 'success'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression du projet :", error);
      setNotification({
        show: true,
        message: 'Une erreur est survenue lors de la suppression du projet',
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSort = (option: string) => {
    setSortOption(option);
  };

  const filteredProjects = projects
    .filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === "status") {
        return a.status.localeCompare(b.status);
      }
      if (sortOption === "endDate") {
        return new Date(a.estimatedEndDate).getTime() - new Date(b.estimatedEndDate).getTime();
      }
      return 0;
    });

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-[#e0e6ef] dark:bg-boxdark">
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-gradient-to-r from-[#2560a0] via-[#2560a0] to-[#d01e3e] rounded-t-lg relative overflow-hidden">
          {/* Project-related animated elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated project cards */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 8 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5,
                }}
                className="absolute w-24 h-16 bg-white/20 rounded-lg border border-white/30"
                style={{
                  left: `${10 + i * 25}%`,
                  top: `${30 + (i % 2) * 20}%`,
                  transform: `rotate(${i * 5}deg)`,
                }}
              />
            ))}
            {/* Animated progress bars */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`progress-${i}`}
                animate={{
                  scaleX: [0, 1, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 6 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1,
                }}
                className="absolute h-1 bg-white/50 rounded-full"
                style={{
                  width: "80%",
                  top: `${40 + i * 15}%`,
                  left: "10%",
                  transformOrigin: "left",
                }}
              />
            ))}
          </div>

          <motion.h4 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-white mb-4 md:mb-0 relative z-10"
          >
            Liste des Projets
          </motion.h4>
          <button
            onClick={() => router.push("/projet/Form-AjoutProjet")}
            className="flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-md border border-white/30 shadow-sm relative z-10 text-sm transition-all duration-200 hover:bg-white/30 hover:shadow-md"
          >
            <FiPlus className="text-base" />
            <span>Nouveau Projet</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 border-b border-gray-200 bg-gradient-to-r from-white to-[#e0e6ef] dark:from-gray-800 dark:to-gray-900">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative w-full md:w-1/3"
          >
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#205b9f] dark:text-gray-300" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#205b9f]/30 bg-white dark:bg-boxdark-2 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#205b9f] dark:focus:ring-gray-500 transition-all duration-200 shadow-sm dark:text-gray-300 dark:placeholder-gray-400"
            />
          </motion.div>
          <motion.select
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            value={sortOption}
            onChange={(e) => handleSort(e.target.value)}
            className="w-full md:w-auto px-4 py-2 rounded-lg border border-[#205b9f]/30 bg-white dark:bg-boxdark-2 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#205b9f] dark:focus:ring-gray-500 transition-all duration-200 shadow-sm text-[#205b9f] dark:text-gray-300"
          >
            <option value="" className="dark:bg-boxdark-2 dark:text-gray-300">Trier par</option>
            <option value="name" className="dark:bg-boxdark-2 dark:text-gray-300">Nom</option>
            <option value="status" className="dark:bg-boxdark-2 dark:text-gray-300">Statut</option>
            <option value="endDate" className="dark:bg-boxdark-2 dark:text-gray-300">Date de fin estimée</option>
          </motion.select>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-meta-4">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Nom du Projet</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Développeurs</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Infra</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Date de Fin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Livrables & Technologies</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
                  onClick={() => router.push(`/projet/DetailsProject/${project.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusClass(project.status)}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{project.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center -space-x-3">
                      {project.users
                        .filter((user) => user.role === "DEVELOPPER" || user.role === "ADMIN")
                        .map((user, index) => (
                          <div
                            key={user.id}
                            className="relative w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden cursor-pointer hover:z-10 transition-transform duration-200 hover:scale-110"
                            style={{ zIndex: project.users.length - index }}
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(`/profileUsers/${user.id}`);
                            }}
                          >
                            <Image
                              src={user.photo 
                                ? (user.photo.startsWith('https://lh3.googleusercontent.com') 
                                  ? user.photo 
                                  : `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.photo}`)
                                : "/images/user/user1.jpg"}
                              alt={`${user.firstName} ${user.lastName}`}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                              title={`${user.firstName} ${user.lastName} - ${user.role}`}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/user/user1.jpg";
                              }}
                              unoptimized={true}
                            />
                          </div>
                        ))}
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          openModal(project.id, "DEVELOPPER");
                        }}
                        className="relative w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center ml-2 transition-colors duration-200"
                      >
                        <FiPlus className="text-blue-500" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center -space-x-3">
                      {project.users
                        .filter((user) => user.role === "INFRA" || user.role === "ADMIN")
                        .map((user, index) => (
                          <div
                            key={user.id}
                            className="relative w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden cursor-pointer hover:z-10 transition-transform duration-200 hover:scale-110"
                            style={{ zIndex: project.users.length - index }}
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(`/profileUsers/${user.id}`);
                            }}
                          >
                            <Image
                              src={user.photo 
                                ? (user.photo.startsWith('https://lh3.googleusercontent.com') 
                                  ? user.photo 
                                  : `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.photo}`)
                                : "/images/user/user1.jpg"}
                              alt={`${user.firstName} ${user.lastName}`}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                              title={`${user.firstName} ${user.lastName} - ${user.role}`}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/user/user1.jpg";
                              }}
                              unoptimized={true}
                            />
                          </div>
                        ))}
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          openModal(project.id, "INFRA");
                        }}
                        className="relative w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center ml-2 transition-colors duration-200"
                      >
                        <FiPlus className="text-blue-500" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {project.estimatedEndDate
                        ? new Date(project.estimatedEndDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {project.livrables.length > 0 ? (
                        project.livrables.map((livrable) => (
                          <div key={livrable.id} className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {livrable.label} ({livrable.type})
                            </p>
                            {livrable.technologies.length > 0 ? (
                              <div className="mt-1 space-y-1">
                                {livrable.technologies.map((tech) => (
                                  <p key={tech.id} className="text-xs text-gray-600 dark:text-gray-300">
                                    {tech.label} - Version: {tech.version} | Langage: {tech.language}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 dark:text-gray-400">Aucune technologie associée</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aucun livrable</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="relative">
                      <button
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuOpenTaskId(menuOpenTaskId === project.id ? null : project.id);
                        }}
                      >
                        <FiMoreVertical className="w-5 h-5" />
                      </button>
                      {menuOpenTaskId === project.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-boxdark rounded-lg shadow-lg border border-gray-200 dark:border-strokedark z-10">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(`/tache/Projet/${project.id}`);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <FiTrello className="w-4 h-4" />
                            <span>Tableau de sprint</span>
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            <span>Supprimer le Projet</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex items-center justify-center px-6 py-4 border-t border-stroke dark:border-strokedark">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-stroke dark:border-strokedark bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            {/* First Page */}
            {currentPage > 2 && (
              <>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border ${
                    currentPage === 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-stroke dark:border-strokedark bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-gray-800'
                  } transition-all duration-200`}
                >
                  1
                </button>
                {currentPage > 3 && (
                  <span className="text-gray-500 dark:text-gray-400">...</span>
                )}
              </>
            )}

            {/* Previous Page */}
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-stroke dark:border-strokedark bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                {currentPage - 1}
              </button>
            )}

            {/* Current Page */}
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white border border-blue-600 transition-all duration-200"
            >
              {currentPage}
            </button>

            {/* Next Page */}
            {currentPage < Math.ceil(filteredProjects.length / itemsPerPage) && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-stroke dark:border-strokedark bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                {currentPage + 1}
              </button>
            )}

            {/* Last Page */}
            {currentPage < Math.ceil(filteredProjects.length / itemsPerPage) - 1 && (
              <>
                {currentPage < Math.ceil(filteredProjects.length / itemsPerPage) - 2 && (
                  <span className="text-gray-500 dark:text-gray-400">...</span>
                )}
                <button
                  onClick={() => setCurrentPage(Math.ceil(filteredProjects.length / itemsPerPage))}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-stroke dark:border-strokedark bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  {Math.ceil(filteredProjects.length / itemsPerPage)}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(filteredProjects.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredProjects.length / itemsPerPage)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-stroke dark:border-strokedark bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAssignUsersByEmail}
        assignedUsers={assignedUsers}
        modalType={modalType}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center ring-2 ring-red-200 dark:ring-red-800">
                  <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Confirmation de suppression
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Action sécurisée requise
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Vous êtes sur le point de supprimer définitivement ce projet. Cette action est irréversible et nécessite une confirmation explicite.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FiShield className="w-4 h-4 text-[#2560a0]" />
                  <span>Cette opération est sécurisée et tracée</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmation({ show: false, projectId: null })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors border border-gray-300 dark:border-gray-600"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Confirmer la suppression
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Message */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              notification.type === 'success' 
                ? 'bg-green-100 dark:bg-green-800/50' 
                : 'bg-red-100 dark:bg-red-800/50'
            }`}>
              {notification.type === 'success' ? (
                <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <FiAlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${
                notification.type === 'success' 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="ml-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default ProjectTable;
