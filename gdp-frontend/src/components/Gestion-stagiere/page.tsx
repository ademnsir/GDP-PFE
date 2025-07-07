"use client";

import React, { useEffect, useState } from "react";
import { fetchAllStagiaires, deleteStagiaire, Stagiaire, updateStagiaire } from "@/services/stagiere";
import { fetchAllUsers, User } from "@/services/user";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch, FiTrash2, FiX, FiCheck } from "react-icons/fi";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, stagiaireName }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  stagiaireName: string;
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
                Êtes-vous sûr de vouloir supprimer le stagiaire <span className="font-medium text-gray-900 dark:text-white">{stagiaireName}</span> ? Cette action est irréversible.
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

const TableStagiaires: React.FC = () => {
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([]);
  const [encadrants, setEncadrants] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStagiaire, setEditingStagiaire] = useState<Stagiaire | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; stagiaireId: number; stagiaireName: string }>({
    isOpen: false,
    stagiaireId: 0,
    stagiaireName: "",
  });
  const [successMessage, setSuccessMessage] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const router = useRouter();

  useEffect(() => {
    const getStagiaires = async () => {
      try {
        const data = await fetchAllStagiaires();
        setStagiaires(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des stagiaires :", err);
        setError("Impossible de récupérer les stagiaires.");
      } finally {
        setLoading(false);
      }
    };

    const getEncadrants = async () => {
      try {
        const data = await fetchAllUsers();
        setEncadrants(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des encadrants :", err);
        setError("Impossible de récupérer les encadrants.");
      }
    };

    getStagiaires();
    getEncadrants();
  }, []);

  const handleDeleteClick = (stagiaireId: number, stagiaireName: string) => {
    setDeleteModal({ isOpen: true, stagiaireId, stagiaireName });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteStagiaire(deleteModal.stagiaireId);
      setStagiaires((prevStagiaires) =>
        prevStagiaires.filter((stagiaire) => stagiaire.id !== deleteModal.stagiaireId)
      );
      setDeleteModal({ isOpen: false, stagiaireId: 0, stagiaireName: "" });
      setSuccessMessage({
        show: true,
        message: "Le stagiaire a été supprimé avec succès",
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "" });
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression du stagiaire :", error);
      setDeleteModal({ isOpen: false, stagiaireId: 0, stagiaireName: "" });
    }
  };

  const handleEditStagiaire = (stagiaire: Stagiaire) => {
    setEditingStagiaire(stagiaire);
  };

  const validateDates = (dateDebut: string, dateFin: string, dureeStage: number) => {
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);
  
    // Calculate the difference in months
    const monthsDifference = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  
    // Check if the day of the month is the same
    const isSameDayOfMonth = startDate.getDate() === endDate.getDate();
  
    // Return an object indicating which validations failed
    return {
      isMonthDifferenceValid: monthsDifference === dureeStage,
      isSameDayOfMonthValid: isSameDayOfMonth,
    };
  };

  const handleSaveStagiaire = async () => {
    if (editingStagiaire) {
      const { dateDebut, dateFin, dureeStage } = editingStagiaire;
  
      // Ensure dateDebut, dateFin, and dureeStage are defined before validation
      if (!dateDebut || !dateFin || dureeStage === undefined) {
        setDateError("Veuillez remplir tous les champs requis.");
        return;
      }
  
      const validationResult = validateDates(dateDebut, dateFin, dureeStage);
  
      if (!validationResult.isMonthDifferenceValid || !validationResult.isSameDayOfMonthValid) {
        const errors = [];
        if (!validationResult.isMonthDifferenceValid) {
          errors.push("La durée spécifiée ne correspond pas à la différence entre la date de début et la date de fin.");
        }
        if (!validationResult.isSameDayOfMonthValid) {
          errors.push("Les jours de début et de fin ne sont pas les mêmes.");
        }
        setDateError(errors.join(" "));
        return;
      }
  
      try {
        await updateStagiaire(editingStagiaire.id, editingStagiaire);
        setStagiaires((prevStagiaires) =>
          prevStagiaires.map((stagiaire) =>
            stagiaire.id === editingStagiaire.id ? editingStagiaire : stagiaire
          )
        );
        setEditingStagiaire(null);
        setDateError(null);
        setSuccessMessage({
          show: true,
          message: "Le stagiaire a été modifié avec succès",
        });
        setTimeout(() => {
          setSuccessMessage({ show: false, message: "" });
        }, 3000);
      } catch (error) {
        console.error("Erreur lors de la modification du stagiaire:", error);
      }
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditingStagiaire((prevStagiaire) => {
      if (!prevStagiaire) return null; // Return null if prevStagiaire is null
  
      const updatedStagiaire = { ...prevStagiaire, [field]: value };
  
      // Ensure dateDebut, dateFin, and dureeStage are defined before validation
      const dateDebut = updatedStagiaire.dateDebut || "";
      const dateFin = updatedStagiaire.dateFin || "";
      const dureeStage = updatedStagiaire.dureeStage || 0;
  
      if (field === 'dateDebut' || field === 'dateFin' || field === 'dureeStage') {
        const validationResult = validateDates(dateDebut, dateFin, dureeStage);
        const errors = [];
        if (!validationResult.isMonthDifferenceValid) {
          errors.push("La durée spécifiée ne correspond pas à la différence entre la date de début et la date de fin.");
        }
        if (!validationResult.isSameDayOfMonthValid) {
          errors.push("Les jours de début et de fin ne sont pas les mêmes.");
        }
        setDateError(errors.length > 0 ? errors.join(" ") : null);
      }
      return updatedStagiaire;
    });
  };
  

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-boxdark">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-gradient-to-r from-[#2560a0] via-[#2560a0] to-[#d01e3e] rounded-t-lg relative overflow-hidden">
          {/* Animated elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated internship cards */}
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
            Liste des Stagiaires
          </motion.h4>
          <button
            onClick={() => router.push("/stagieres/Form-ajout-Stagiaire/")}
            className="flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-md border border-white/30 shadow-sm relative z-10 text-sm transition-all duration-200 hover:bg-white/30 hover:shadow-md"
          >
            <FiPlus className="text-base" />
            <span>Ajouter un Stagiaire</span>
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
              placeholder="Rechercher un stagiaire..."
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
                  Nom Complet
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Spécialité
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Encadrant
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {stagiaires.map((stagiaire) => (
                <tr
                  key={stagiaire.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-[#2560a0] dark:hover:ring-[#d01e3e] transition-all duration-200 shadow-sm">
                        <Image
                          src={stagiaire.photo || "/images/user/user1.jpg"}
                          alt="Stagiaire"
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/user/user1.jpg";
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#2560a0] dark:hover:text-[#d01e3e] transition-colors duration-200">
                      {editingStagiaire?.id === stagiaire.id ? (
                        <input
                          type="text"
                          value={editingStagiaire.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full rounded-lg border py-2 px-4 bg-white dark:bg-boxdark dark:text-white dark:border-strokedark focus:outline-none focus:ring-1 focus:ring-[#2560a0] dark:focus:ring-[#d01e3e]"
                        />
                      ) : (
                        stagiaire.firstName
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {editingStagiaire?.id === stagiaire.id ? (
                        <input
                          type="text"
                          value={editingStagiaire.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full rounded-lg border py-2 px-4 mt-1 bg-white dark:bg-boxdark dark:text-white dark:border-strokedark focus:outline-none focus:ring-1 focus:ring-[#2560a0] dark:focus:ring-[#d01e3e]"
                        />
                      ) : (
                        stagiaire.lastName
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {editingStagiaire?.id === stagiaire.id ? (
                        <input
                          type="email"
                          value={editingStagiaire.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full rounded-lg border py-2 px-4 bg-white dark:bg-boxdark dark:text-white dark:border-strokedark focus:outline-none focus:ring-1 focus:ring-[#2560a0] dark:focus:ring-[#d01e3e]"
                        />
                      ) : (
                        stagiaire.email
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {editingStagiaire?.id === stagiaire.id ? (
                        <input
                          type="text"
                          value={editingStagiaire.specialite}
                          onChange={(e) => handleInputChange('specialite', e.target.value)}
                          className="w-full rounded-lg border py-2 px-4 bg-white dark:bg-boxdark dark:text-white dark:border-strokedark focus:outline-none focus:ring-1 focus:ring-[#2560a0] dark:focus:ring-[#d01e3e]"
                        />
                      ) : (
                        stagiaire.specialite
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {editingStagiaire?.id === stagiaire.id ? (
                        <input
                          type="number"
                          value={editingStagiaire.dureeStage}
                          onChange={(e) => handleInputChange('dureeStage', Number(e.target.value))}
                          className="w-full rounded-lg border py-2 px-4 bg-white dark:bg-boxdark dark:text-white dark:border-strokedark focus:outline-none focus:ring-1 focus:ring-[#2560a0] dark:focus:ring-[#d01e3e]"
                        />
                      ) : (
                        stagiaire.dureeStage
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {editingStagiaire?.id === stagiaire.id ? (
                        <select
                          value={editingStagiaire.encadrant?.id || ""}
                          onChange={(e) => {
                            const selectedEncadrantId = Number(e.target.value);
                            const selectedEncadrant = encadrants.find(
                              (encadrant) => encadrant.id === selectedEncadrantId
                            );
                            setEditingStagiaire({
                              ...editingStagiaire,
                              encadrant: selectedEncadrant || null,
                            });
                          }}
                          className="w-full rounded-lg border py-2 px-4 bg-white dark:bg-boxdark dark:text-white dark:border-strokedark focus:outline-none focus:ring-1 focus:ring-[#2560a0] dark:focus:ring-[#d01e3e]"
                        >
                          <option value="">Aucun</option>
                          {encadrants.map((encadrant) => (
                            <option key={encadrant.id} value={encadrant.id}>
                              {encadrant.firstName} {encadrant.lastName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        stagiaire.encadrant
                          ? `${stagiaire.encadrant.firstName} ${stagiaire.encadrant.lastName}`
                          : "Aucun"
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingStagiaire?.id === stagiaire.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors duration-200 transform hover:scale-110"
                          onClick={handleSaveStagiaire}
                        >
                          <FaSave className="w-5 h-5" />
                        </button>
                        <button
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 transform hover:scale-110"
                          onClick={() => setEditingStagiaire(null)}
                        >
                          <FaTimes className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 transform hover:scale-110"
                          onClick={() => handleEditStagiaire(stagiaire)}
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 transform hover:scale-110"
                          onClick={() => handleDeleteClick(stagiaire.id, `${stagiaire.firstName} ${stagiaire.lastName}`)}
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, stagiaireId: 0, stagiaireName: "" })}
        onConfirm={handleDeleteConfirm}
        stagiaireName={deleteModal.stagiaireName}
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

export default TableStagiaires;
