"use client";

import React, { useEffect, useState } from "react";
import { fetchAllTachesPeriodiques, deleteTachePeriodique, TachePeriodique, updateTachePeriodique } from "@/services/tacheperiodique";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar, FiClock, FiUsers, FiTrash2, FiEdit2, FiEye, FiX, FiCheck, FiRepeat } from "react-icons/fi";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, taskTitle }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
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
                Êtes-vous sûr de vouloir supprimer la tâche <span className="font-medium text-gray-900 dark:text-white">{taskTitle}</span> ? Cette action est irréversible.
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
                className="px-4 py-2 text-sm font-medium text-white bg-[#d01e3e] rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
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

const PeriodicTasksList: React.FC = () => {
  const [taches, setTaches] = useState<TachePeriodique[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTache, setEditingTache] = useState<TachePeriodique | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; taskId: number; taskTitle: string }>({
    isOpen: false,
    taskId: 0,
    taskTitle: "",
  });
  const [successMessage, setSuccessMessage] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const router = useRouter();

  useEffect(() => {
    const getTaches = async () => {
      try {
        const data = await fetchAllTachesPeriodiques();
        setTaches(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des tâches périodiques :", err);
        setError("Impossible de charger les tâches.");
      } finally {
        setLoading(false);
      }
    };

    getTaches();
  }, []);

  const handleDeleteTache = (taskId: number, taskTitle: string) => {
    setDeleteModal({ isOpen: true, taskId, taskTitle });
  };

  const confirmDelete = async () => {
    try {
      await deleteTachePeriodique(deleteModal.taskId);
      setTaches((prevTaches) => prevTaches.filter((tache) => tache.id !== deleteModal.taskId));
      setDeleteModal({ isOpen: false, taskId: 0, taskTitle: "" });
      setSuccessMessage({
        show: true,
        message: "La tâche a été supprimée avec succès",
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "" });
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setDeleteModal({ isOpen: false, taskId: 0, taskTitle: "" });
    }
  };

  const handleEditTache = (tache: TachePeriodique) => {
    setEditingTache(tache);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditingTache((prevTache) => {
      if (!prevTache) return null;
      
      // Si c'est l'heure d'exécution, s'assurer qu'elle est au format HH:mm
      if (field === 'heureExecution') {
        // Vérifier que l'heure est au format correct
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          return prevTache;
        }
      }
      
      return { ...prevTache, [field]: value };
    });
  };

  const handleSaveTache = async () => {
    if (editingTache) {
      try {
        // S'assurer que l'heure d'exécution est présente et au bon format
        if (!editingTache.heureExecution || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(editingTache.heureExecution)) {
          setSuccessMessage({
            show: true,
            message: "L'heure d'exécution est requise et doit être au format HH:mm (ex: 09:30 ou 14:45)",
          });
          return;
        }

        // Créer un objet avec uniquement les champs nécessaires
        const updateData: Partial<TachePeriodique> = {
          title: editingTache.title,
          description: editingTache.description,
          sendDate: editingTache.sendDate,
          heureExecution: editingTache.heureExecution,
          users: editingTache.users, // Garder les objets User complets pour le typage
          periodicite: editingTache.periodicite,
        };

        console.log('Données envoyées au backend:', updateData);

        const updatedTache = await updateTachePeriodique(editingTache.id!, updateData);
        console.log('Réponse du backend:', updatedTache);
        
        // Mettre à jour la liste des tâches
        setTaches((prevTaches) =>
          prevTaches.map((tache) =>
            tache.id === editingTache.id ? { ...tache, ...updateData } : tache
          )
        );
        
        setEditingTache(null);
        setSuccessMessage({
          show: true,
          message: "La tâche a été modifiée avec succès",
        });
        setTimeout(() => {
          setSuccessMessage({ show: false, message: "" });
        }, 3000);
      } catch (error) {
        console.error("Erreur lors de la modification de la tâche:", error);
        setSuccessMessage({
          show: true,
          message: "Erreur lors de la modification de la tâche",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2560a0]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-boxdark">
      {/* Header avec animation */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-[#2560a0] via-[#2560a0] to-[#d01e3e] p-6 rounded-t-lg">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -15, 0],
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
                  left: `${15 + i * 25}%`,
                  top: `${30 + (i % 2) * 20}%`,
                  transform: `rotate(${i * 5}deg)`,
                }}
              />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-white relative z-10">Liste des Tâches Périodiques</h2>
        </div>
      </div>

      <div className="rounded-b-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-meta-4">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white">Titre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white">Heure de la tâche</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white">Heure d&apos;exécution</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white">Périodicité</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white">Utilisateurs</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taches.map((tache, index) => (
                <motion.tr
                  key={tache.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-[#2560a0]" />
                      {editingTache?.id === tache.id && editingTache ? (
                        <input
                          type="text"
                          value={editingTache.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="w-full rounded-lg border py-2 px-4 bg-white dark:bg-boxdark dark:text-white dark:border-strokedark focus:outline-none focus:ring-1 focus:ring-[#2560a0] dark:focus:ring-[#d01e3e]"
                        />
                      ) : (
                        tache.title
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <FiEdit2 className="text-[#2560a0]" />
                      {editingTache?.id === tache.id && editingTache ? (
                        <input
                          type="text"
                          value={editingTache.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="w-full rounded-lg border py-2 px-4 bg-white dark:bg-boxdark dark:text-white dark:border-strokedark focus:outline-none focus:ring-1 focus:ring-[#2560a0] dark:focus:ring-[#d01e3e]"
                        />
                      ) : (
                        tache.description
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-[#2560a0]" />
                      {editingTache?.id === tache.id && editingTache ? (
                        <input
                          type="date"
                          value={new Date(editingTache.sendDate).toISOString().split('T')[0]}
                          onChange={(e) => handleInputChange('sendDate', e.target.value + 'T' + new Date(editingTache.sendDate).toTimeString().split(' ')[0])}
                          className="w-full rounded-lg border py-2 px-4 bg-white dark:bg-boxdark dark:text-white dark:border-strokedark focus:outline-none focus:ring-1 focus:ring-[#2560a0] dark:focus:ring-[#d01e3e]"
                        />
                      ) : (
                        new Date(tache.sendDate).toLocaleDateString()
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <FiClock className="text-[#2560a0]" />
                      {editingTache?.id === tache.id && editingTache ? (
                        <input
                          type="time"
                          value={new Date(editingTache.sendDate).toTimeString().slice(0, 5)}
                          onChange={(e) => {
                            const date = new Date(editingTache.sendDate);
                            const [hours, minutes] = e.target.value.split(':');
                            date.setHours(parseInt(hours), parseInt(minutes));
                            handleInputChange('sendDate', date.toISOString());
                          }}
                          className="w-full rounded-lg border py-2 px-4 bg-white dark:bg-boxdark dark:text-white dark:border-strokedark focus:outline-none focus:ring-1 focus:ring-[#2560a0] dark:focus:ring-[#d01e3e]"
                        />
                      ) : (
                        new Date(tache.sendDate).toLocaleTimeString()
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <FiClock className="text-[#2560a0]" />
                      {editingTache?.id === tache.id && editingTache ? (
                        <input
                          type="time"
                          value={editingTache.heureExecution}
                          onChange={(e) => handleInputChange('heureExecution', e.target.value)}
                          placeholder="HH:mm (ex: 09:30)"
                          className="w-full rounded-lg border py-2 px-4 bg-white dark:bg-boxdark dark:text-white dark:border-strokedark focus:outline-none focus:ring-1 focus:ring-[#2560a0] dark:focus:ring-[#d01e3e]"
                        />
                      ) : (
                        tache.heureExecution
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <FiRepeat className="text-[#2560a0]" />
                      {editingTache?.id === tache.id && editingTache ? (
                        <select
                          value={editingTache.periodicite}
                          onChange={(e) => handleInputChange('periodicite', e.target.value)}
                          className="w-full rounded-lg border py-2 px-4 bg-white dark:bg-boxdark dark:text-white dark:border-strokedark focus:outline-none focus:ring-1 focus:ring-[#2560a0] dark:focus:ring-[#d01e3e]"
                        >
                          <option value="QUOTIDIEN">Quotidien</option>
                          <option value="MENSUEL">Mensuel</option>
                          <option value="ANNUEL">Annuel</option>
                        </select>
                      ) : (
                        tache.periodicite === 'QUOTIDIEN' ? 'Quotidien' :
                        tache.periodicite === 'MENSUEL' ? 'Mensuel' :
                        'Annuel'
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex -space-x-2">
                      {tache.users.map((user, idx) => (
                        <motion.div
                          key={user.id}
                          whileHover={{ scale: 1.1, zIndex: 10 }}
                          className="relative w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden cursor-pointer"
                          style={{ zIndex: tache.users.length - idx }}
                          title={`${user.firstName} ${user.lastName}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/profileUsers/${user.id}`);
                          }}
                        >
                          <Image
                            src={
                              process.env.NEXT_PUBLIC_BACKEND_URL
                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.photo.startsWith('/') ? '' : '/'}${user.photo}`
                                : "/images/user/user1.jpg"
                            }
                            alt={`${user.firstName} ${user.lastName}`}
                            width={40}
                            height={40}
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/user/user1.jpg";
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {editingTache?.id === tache.id ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleSaveTache}
                            className="text-green-500 hover:text-green-700 transition-colors"
                            title="Sauvegarder les modifications"
                          >
                            <FiCheck className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditingTache(null)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            title="Annuler les modifications"
                          >
                            <FiX className="w-5 h-5" />
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditTache(tache)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Modifier la tâche"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteTache(tache.id!, tache.title);
                            }}
                            className="text-[#d01e3e] hover:text-red-700 transition-colors"
                            title="Supprimer la tâche"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, taskId: 0, taskTitle: "" })}
        onConfirm={confirmDelete}
        taskTitle={deleteModal.taskTitle}
      />

      <AnimatePresence>
        {successMessage.show && (
          <SuccessNotification
            message={successMessage.message}
            onClose={() => setSuccessMessage({ show: false, message: "" })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PeriodicTasksList;
