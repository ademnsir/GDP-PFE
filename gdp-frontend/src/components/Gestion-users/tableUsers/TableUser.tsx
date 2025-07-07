"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchAllUsers, deleteUser, fetchCongesByMatricule } from "@/services/user";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch, FiTrash2, FiX, FiCheck, FiClock, FiUser } from "react-icons/fi";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photo: string;
  status: string;
  hireDate: string;
  endDate: string;
  matricule: string;
}

interface Conge {
  id: number;
  userId?: number;
  matricule: string;
  service: string;
  responsable: string;
  type: string;
  startDate: string;
  endDate: string;
  dateReprise: string;
  telephone: string;
  adresse: string;
  interim1?: string;
  interim2?: string;
  status: string;
}

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmer la suppression
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer l&apos;utilisateur <span className="font-medium text-gray-900 dark:text-white">{userName}</span> ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SuccessNotification = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
            <FiCheck className="w-5 h-5 text-green-600 dark:text-green-300" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-green-600 dark:text-green-300 hover:text-green-700 dark:hover:text-green-200 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

const ErrorNotification = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
            <FiX className="w-5 h-5 text-red-600 dark:text-red-300" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

const TableUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [conges, setConges] = useState<{ [key: string]: Conge[] }>({});
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: string; userName: string }>({
    isOpen: false,
    userId: "",
    userName: "",
  });
  const [successMessage, setSuccessMessage] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const [errorMessage, setErrorMessage] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const router = useRouter();

  const getUsers = useCallback(async () => {
    try {
      const data = await fetchAllUsers();
      if ((data as any).redirectTo403) {
        router.push("/not-found?error=403");
        return;
      }
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Fetch conges for all users
  useEffect(() => {
    const fetchConges = async () => {
      const congesData: { [key: string]: Conge[] } = {};
      for (const user of users) {
        if (user.matricule) {
          try {
            const conges = await fetchCongesByMatricule(user.matricule);
            if ((conges as any).redirectTo403) {
              router.push("/not-found?error=403");
              return;
            }
            congesData[user.matricule] = conges;
          } catch (err) {
            console.error(`Failed to fetch conges for user ${user.matricule}:`, err);
          }
        }
      }
      setConges(congesData);
    };

    fetchConges();
  }, [users, router, refreshTrigger]);

  // Rafraîchir les données lorsque l'utilisateur revient sur la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setRefreshTrigger(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const getStatusBadge = (user: User) => {
    if (conges[user.matricule] && conges[user.matricule].length > 0) {
      // Trier les congés par date de début (du plus récent au plus ancien)
      const sortedConges = [...conges[user.matricule]].sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      // Prendre le congé le plus récent
      const latestConge = sortedConges[0];

      if (latestConge.status === "PENDING") {
        return (
          <div className="flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              En attente
            </span>
          </div>
        );
      }

      if (latestConge.status === "APPROVED") {
        // Vérifier si le congé est toujours en cours
        const endDate = new Date(latestConge.endDate);
        const today = new Date();
        
        if (endDate >= today) {
          return (
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                <FiX className="w-4 h-4" />
                Non disponible
              </span>
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                <FiCheck className="w-4 h-4" />
                Disponible
              </span>
            </div>
          );
        }
      }

      if (latestConge.status === "REJECTED") {
        return (
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
              <FiCheck className="w-4 h-4" />
              Disponible
            </span>
          </div>
        );
      }
    }
    return (
      <div className="flex items-center gap-2">
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
          <FiCheck className="w-4 h-4" />
          Disponible
        </span>
      </div>
    );
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const confirmDelete = async () => {
    try {
      const data = await deleteUser(deleteModal.userId);
      if ((data as any).redirectTo403) {
        router.push("/not-found?error=403");
        return;
      }
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== deleteModal.userId)
      );
      setDeleteModal({ isOpen: false, userId: "", userName: "" });
      setSuccessMessage({
        show: true,
        message: "L'utilisateur a été supprimé avec succès",
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "" });
      }, 3000);
    } catch (error: any) {
      setDeleteModal({ isOpen: false, userId: "", userName: "" });
      
      console.error('Erreur lors de la suppression:', error);
      
      // Gestion spécifique des erreurs
      if (error.response?.status === 403) {
        setErrorMessage({
          show: true,
          message: "Seuls les administrateurs peuvent supprimer un utilisateur",
        });
      } else if (error.response?.status === 404) {
        setErrorMessage({
          show: true,
          message: "Utilisateur non trouvé",
        });
      } else if (error.response?.status === 401) {
        setErrorMessage({
          show: true,
          message: "Session expirée, veuillez vous reconnecter",
        });
      } else if (error.message && error.message.includes('contrainte de clé étrangère')) {
        setErrorMessage({
          show: true,
          message: "Impossible de supprimer cet utilisateur car il a des données liées (congés, tâches, etc.). Veuillez d'abord supprimer ces données.",
        });
      } else if (error.message) {
        setErrorMessage({
          show: true,
          message: error.message,
        });
      } else {
        setErrorMessage({
          show: true,
          message: "Une erreur est survenue lors de la suppression de l'utilisateur",
        });
      }
      
      setTimeout(() => {
        setErrorMessage({ show: false, message: "" });
      }, 3000);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-boxdark">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-gradient-to-r from-[#2560a0] via-[#2560a0] to-[#d01e3e] rounded-t-lg relative overflow-hidden">
          {/* User-related animated elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated user cards */}
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
            Liste des Utilisateurs
          </motion.h4>
          <button
            onClick={() => router.push("/Form-ajout-User")}
            className="flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-md border border-white/30 shadow-sm relative z-10 text-sm transition-all duration-200 hover:bg-white/30 hover:shadow-md"
          >
            <FiPlus className="text-base" />
            <span>Créer un Utilisateur</span>
          </button>
        </div>

        {/* Search Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 border-b border-gray-200 bg-gradient-to-r from-white to-[#e0e6ef] dark:from-gray-800 dark:to-gray-900 dark:border-strokedark">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative w-full md:w-1/3"
          >
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2560a0] dark:text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#2560a0]/30 bg-white focus:outline-none focus:ring-2 focus:ring-[#2560a0] transition-all duration-200 shadow-sm dark:bg-boxdark dark:text-white dark:border-strokedark dark:focus:ring-[#d01e3e]"
            />
          </motion.div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Photo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nom d&apos;utilisateur
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prénom
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Situation
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut de cong&eacute;
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date d&apos;embauche
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date de fin
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer group"
                  onClick={() => router.push(`/profileUsers/${user.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-[#2560a0] dark:group-hover:ring-[#d01e3e] transition-all duration-200 shadow-sm">
                        {user.photo ? (
                          <Image
                            src={
                              process.env.NEXT_PUBLIC_BACKEND_URL
                                ? new URL(user.photo, process.env.NEXT_PUBLIC_BACKEND_URL).toString()
                                : user.photo
                            }
                            alt="User Photo"
                            width={40}
                            height={40}
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
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#2560a0] dark:group-hover:text-[#d01e3e] transition-colors duration-200">
                      {user.username}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {user.firstName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {user.lastName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                        user.role === "DEVELOPPER"
                          ? "bg-gradient-to-r from-green-50 to-green-100 text-green-800 dark:from-green-900/20 dark:to-green-900/30 dark:text-green-300"
                          : user.role === "INFRA"
                          ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 dark:from-purple-900/20 dark:to-purple-900/30 dark:text-purple-300"
                          : "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 dark:from-yellow-900/20 dark:to-yellow-900/30 dark:text-yellow-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                        user.status === "ACTIF"
                          ? "bg-gradient-to-r from-green-50 to-green-100 text-green-800 dark:from-green-900/20 dark:to-green-900/30 dark:text-green-300"
                          : user.status === "SUSPENDU"
                          ? "bg-gradient-to-r from-red-50 to-red-100 text-red-800 dark:from-red-900/20 dark:to-red-900/30 dark:text-red-300"
                          : "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 dark:from-yellow-900/20 dark:to-yellow-900/30 dark:text-yellow-300"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {user.hireDate || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {user.endDate || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 transform hover:scale-110"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`);
                      }}
                      title="Delete User"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: "", userName: "" })}
        onConfirm={confirmDelete}
        userName={deleteModal.userName}
      />
      <AnimatePresence>
        {successMessage.show && (
          <SuccessNotification
            message={successMessage.message}
            onClose={() => setSuccessMessage({ show: false, message: "" })}
          />
        )}
        {errorMessage.show && (
          <ErrorNotification
            message={errorMessage.message}
            onClose={() => setErrorMessage({ show: false, message: "" })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TableUsers;
