"use client";

import React, { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { fetchAllUsers, User } from "@/services/user";
import { createProject } from "@/services/Project";
import { Alert } from "@material-tailwind/react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiCalendar, FiLink, FiUsers, FiFileText, FiFlag, FiCheck, FiLayers, FiCode, FiDatabase, FiServer, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const CreateProject: React.FC = () => {
  const { userRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    status: "En cours",
    priorite: "Faible",
    etat: "Projet existant",
    linkprojet: "",
    description: "",
    estimatedEndDate: "",
    assignedUsers: [] as number[],
  });
  const [showLinkProjet, setShowLinkProjet] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await fetchAllUsers();
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "etat") {
      setShowLinkProjet(value === "Projet existant");
    }
  };

  const handleUserSelect = (selectedOptions: any) => {
    const selectedUserIds = selectedOptions.map((option: any) => option.value);
    setFormData((prev) => ({
      ...prev,
      assignedUsers: selectedUserIds,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (userRole !== "ADMIN") {
      setErrorMessage("Seuls les administrateurs peuvent créer des projets.");
      return;
    }

    try {
      const payload = {
        ...formData,
        userIds: formData.assignedUsers,
      };

      console.log("Payload sent to backend:", payload);

      await createProject(payload);
      setShowSuccessAlert(true);

      // Faire défiler la page vers le haut
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        setShowSuccessAlert(false);
        setFormData({
          name: "",
          status: "En cours",
          priorite: "Faible",
          etat: "Projet existant",
          linkprojet: "",
          description: "",
          estimatedEndDate: "",
          assignedUsers: [],
        });
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la création du projet :", error);
      setErrorMessage("Une erreur est survenue lors de la création du projet.");
    }
  };

  // Préparer les options pour react-select
  const userOptions = users.map((user) => ({
    value: user.id,
    label: (
      <div className="flex items-center">
        <span>
          {user.firstName} {user.lastName}
        </span>
        {user.role === "DEVELOPPER" && (
          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300 ml-2">
            DEVELOPPER
          </span>
        )}
        {user.role === "INFRA" && (
          <span className="bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300 ml-2">
            INFRA
          </span>
        )}
        {user.role === "ADMIN" && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300 ml-2">
            ADMIN
          </span>
        )}
      </div>
    ),
  }));

  return (
    <>
      <Breadcrumb pageName="Créer un Projet" />

      <div className="flex flex-col lg:flex-row gap-6 p-4">
        {/* Form Section - Now on the left */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/2"
        >
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 dark:bg-boxdark dark:border-strokedark">
            <AnimatePresence>
              {showSuccessAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <Alert
                    icon={<FiCheck className="h-5 w-5" />}
                    className="rounded-lg border-l-4 border-[#2ec946] bg-[#2ec946]/5 font-medium text-[#2ec946] dark:bg-[#2ec946]/10 dark:text-[#2ec946]"
                  >
                    Projet créé avec succès !
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom du projet */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du projet
                </label>
                <div className="relative">
                  <FiFileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
              </motion.div>

              {/* Statut */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <div className="relative">
                  <FiFlag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200 appearance-none"
                  >
                    <option value="A faire">A faire</option>
                    <option value="En cours">En cours</option>
                    <option value="Fini">Fini</option>
                  </select>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                  rows={3}
                  required
                />
              </motion.div>

              {/* Priorité */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priorité
                </label>
                <div className="relative">
                  <FiFlag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="priorite"
                    value={formData.priorite}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200 appearance-none"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                  </select>
                </div>
              </motion.div>

              {/* Date estimée de fin */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date estimée de fin
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="estimatedEndDate"
                    value={formData.estimatedEndDate}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
              </motion.div>

              {/* Assigné à */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigné à
                </label>
                <div className="relative">
                  <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <Select
                    isMulti
                    options={userOptions}
                    onChange={handleUserSelect}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Sélectionner un utilisateur"
                    styles={{
                      control: (base) => ({
                        ...base,
                        paddingLeft: '2.5rem',
                        minHeight: '2.5rem',
                        fontSize: '0.875rem',
                        borderColor: '#e5e7eb',
                        '&:hover': {
                          borderColor: '#2560a0',
                        },
                      }),
                      option: (base) => ({
                        ...base,
                        fontSize: '0.875rem',
                      }),
                      multiValue: (base) => ({
                        ...base,
                        fontSize: '0.875rem',
                      }),
                    }}
                  />
                </div>
              </motion.div>

              {/* Lien du projet */}
              {showLinkProjet && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lien du projet
                  </label>
                  <div className="relative">
                    <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="linkprojet"
                      value={formData.linkprojet}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    />
                  </div>
                </motion.div>
              )}

              {/* Bouton soumettre */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="mt-4 w-full rounded-md bg-[#2560a0] py-2 px-4 text-sm font-medium text-white hover:bg-[#1f4e84] focus:outline-none focus:ring-2 focus:ring-[#2560a0] focus:ring-offset-2 transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <FiPlus className="text-base" />
                  <span>Ajouter le projet</span>
                </div>
              </motion.button>

              {/* Message d'erreur */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <Alert
                      icon={<FiAlertCircle className="h-5 w-5" />}
                      className="rounded-lg border-l-4 border-red-500 bg-red-50 font-medium text-red-700 dark:bg-red-900/10 dark:text-red-500"
                    >
                      {errorMessage}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>

        {/* Animation 3D Context Section - Now on the right */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/2 bg-gradient-to-br from-[#2560a0] to-[#1f4e84] rounded-lg p-6 relative overflow-hidden"
        >
          {/* Animated 3D Elements */}
          <div className="relative h-full min-h-[500px]">
            {/* Floating Project Cards */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                className="absolute bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 shadow-lg"
                style={{
                  left: `${20 + i * 20}%`,
                  top: `${30 + (i % 2) * 20}%`,
                  width: "200px",
                  height: "150px",
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <FiLayers className="text-white" />
                    <span className="text-white font-medium">Projet {i + 1}</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/20 rounded text-white text-xs">En cours</span>
                    <span className="px-2 py-1 bg-white/20 rounded text-white text-xs">Haute</span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <FiCode className="text-white/70" />
                    <FiDatabase className="text-white/70" />
                    <FiServer className="text-white/70" />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Animated Connection Lines */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={`line-${i}`}
                animate={{
                  scaleX: [0, 1, 0],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                className="absolute h-0.5 bg-white/30 rounded-full"
                style={{
                  width: "60%",
                  top: `${40 + i * 20}%`,
                  left: "20%",
                  transformOrigin: "left",
                }}
              />
            ))}

            {/* Project Stats */}
            <div className="absolute bottom-6 left-6 right-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-4"
              >
                {[
                  { label: "Projets", value: "", icon: FiLayers },
                  { label: "En cours", value: "", icon: FiCode },
                  { label: "Terminés", value: "", icon: FiCheck },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
                  >
                    <stat.icon className="w-6 h-6 text-white mx-auto mb-2" />
                    <div className="text-white font-bold text-xl">{stat.value}</div>
                    <div className="text-white/70 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CreateProject;