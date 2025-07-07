"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import { changePassword } from "@/services/user";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    
    setIsLoading(true);
    try {
      await changePassword({ oldPassword, newPassword });
      toast.success("Mot de passe modifié avec succès !");
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de la modification.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer 
        position="bottom-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        theme="colored"
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl dark:bg-boxdark"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white">
                <FiX size={24} />
              </button>
              
              <div className="text-center">
                <FiLock className="mx-auto h-12 w-12 text-primary" />
                <h3 className="mt-4 text-2xl font-semibold text-black dark:text-white">
                  Changer de mot de passe
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Entrez votre ancien mot de passe et choisissez-en un nouveau.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Old Password */}
                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">Ancien mot de passe</label>
                  <input
                    type={showOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full rounded-md border border-stroke bg-gray-100 p-3 pl-10 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
                  />
                  <FiLock className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-10 text-gray-400 hover:text-primary">
                    {showOld ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                
                {/* New Password */}
                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">Nouveau mot de passe</label>
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-md border border-stroke bg-gray-100 p-3 pl-10 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
                  />
                  <FiLock className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                   <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-10 text-gray-400 hover:text-primary">
                    {showNew ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">Confirmer le nouveau mot de passe</label>
                  <input
                    type={showNew ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-md border border-stroke bg-gray-100 p-3 pl-10 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
                  />
                   <FiLock className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-primary p-3 font-medium text-white hover:bg-primary-dark disabled:bg-opacity-70"
                >
                  {isLoading ? "Modification en cours..." : "Mettre à jour le mot de passe"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChangePasswordModal; 