"use client" ;

import React, { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { fetchAllUsers, User } from "@/services/user";
import { addStagiaire } from "@/services/stagiere";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch, FiTrash2, FiX, FiCheck, FiUser, FiMail, FiCalendar, FiImage, FiBook, FiClock, FiUsers } from "react-icons/fi";
import Select from "react-select";

const CreateStagiaire: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specialite: "",
    dureeStage: "",
    dateDebut: "",
    dateFin: "",
    encadrantId: null as number | null,
    photo: "",
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await fetchAllUsers();
        setUsers(userList);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleEncadrantSelect = (selectedOption: any) => {
    setFormData((prev) => ({
      ...prev,
      encadrantId: selectedOption ? selectedOption.value : null,
    }));
    setErrors((prev) => ({ ...prev, encadrantId: "" }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = "Le prénom est requis.";
    if (!formData.lastName) newErrors.lastName = "Le nom est requis.";
    if (!formData.email) newErrors.email = "L'email est requis.";
    if (!formData.specialite) newErrors.specialite = "La spécialité est requise.";
    if (!formData.dureeStage) newErrors.dureeStage = "La durée du stage est requise.";
    if (!formData.dateDebut) newErrors.dateDebut = "La date de début est requise.";
    if (!formData.dateFin) newErrors.dateFin = "La date de fin est requise.";
    if (!formData.encadrantId) newErrors.encadrantId = "Veuillez sélectionner un encadrant.";
    if (!formData.photo) newErrors.photo = "La photo est requise.";

    if (formData.dateDebut && formData.dateFin) {
      const dateDebut = new Date(formData.dateDebut);
      const dateFin = new Date(formData.dateFin);
      const diffInMonths =
        (dateFin.getFullYear() - dateDebut.getFullYear()) * 12 +
        (dateFin.getMonth() - dateDebut.getMonth());

      if (diffInMonths < 1 || diffInMonths > 6) {
        newErrors.dateFin = "La durée du stage doit être comprise entre 1 et 6 mois.";
      }

      const dureeSaisie = Number(formData.dureeStage);
      if (diffInMonths !== dureeSaisie) {
        newErrors.dureeStage = `La durée du stage doit être de ${diffInMonths} mois, selon les dates choisies.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotification({ type: 'error', message: 'Veuillez remplir tous les champs requis correctement.' });
      return;
    }

    try {
      const payload = {
        ...formData,
        dureeStage: Number(formData.dureeStage),
      };

      await addStagiaire(payload);
      setNotification({ type: 'success', message: 'Stagiaire ajouté avec succès !' });

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        setNotification({ type: null, message: '' });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          specialite: "",
          dureeStage: "",
          dateDebut: "",
          dateFin: "",
          encadrantId: null,
          photo: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de l'ajout du stagiaire :", error);
      setNotification({ type: 'error', message: "Une erreur est survenue lors de l'ajout du stagiaire." });
    }
  };

  const encadrantOptions = users.map((user) => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName} (${user.role})`,
  }));

  return (
    <>
      <Breadcrumb pageName="Ajouter un Stagiaire" />

      <div className="flex flex-col lg:flex-row gap-6 p-4">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/2"
        >
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 dark:bg-boxdark dark:border-strokedark">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prénom
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </motion.div>

              {/* Last Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </motion.div>

              {/* Specialite */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Spécialité
                </label>
                <div className="relative">
                  <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="specialite"
                    value={formData.specialite}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
                {errors.specialite && <p className="text-red-500 text-xs mt-1">{errors.specialite}</p>}
              </motion.div>

              {/* Duree Stage */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Durée du stage (mois)
                </label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="dureeStage"
                    value={formData.dureeStage}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
                {errors.dureeStage && <p className="text-red-500 text-xs mt-1">{errors.dureeStage}</p>}
              </motion.div>

              {/* Date Debut */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de début
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="dateDebut"
                    value={formData.dateDebut}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
                {errors.dateDebut && <p className="text-red-500 text-xs mt-1">{errors.dateDebut}</p>}
              </motion.div>

              {/* Date Fin */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de fin
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="dateFin"
                    value={formData.dateFin}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
                {errors.dateFin && <p className="text-red-500 text-xs mt-1">{errors.dateFin}</p>}
              </motion.div>

              {/* Encadrant */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Encadrant
                </label>
                <div className="relative">
                  <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Select
                    options={encadrantOptions}
                    onChange={handleEncadrantSelect}
                    placeholder="Sélectionner un encadrant"
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    classNamePrefix="react-select"
                  />
                </div>
                {errors.encadrantId && <p className="text-red-500 text-xs mt-1">{errors.encadrantId}</p>}
              </motion.div>

              {/* Photo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Photo
                </label>
                <div className="relative">
                  <FiImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
                {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="mt-4 w-full rounded-md bg-[#2560a0] py-2 px-4 text-sm font-medium text-white hover:bg-[#1f4e84] focus:outline-none focus:ring-2 focus:ring-[#2560a0] focus:ring-offset-2 transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <FiPlus className="text-base" />
                  <span>Ajouter le stagiaire</span>
                </div>
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Animation Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/2 bg-gradient-to-b from-[#2560a0] via-[#2560a0]/90 to-[#d01e3e]/30 rounded-lg p-6 relative overflow-hidden"
        >
          <div className="relative h-full min-h-[500px]">
            {/* Floating Internship Cards */}
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
                    <FiUser className="text-white" />
                    <span className="text-white font-medium">Stagiaire {i + 1}</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/20 rounded text-white text-xs">Spécialité</span>
                    <span className="px-2 py-1 bg-[#d01e3e]/50 rounded text-white text-xs">En cours</span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <FiCalendar className="text-white/70" />
                    <FiClock className="text-white/70" />
                    <FiUsers className="text-white/70" />
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
                className="absolute h-0.5 bg-gradient-to-r from-white/30 to-[#d01e3e]/30 rounded-full"
                style={{
                  width: "60%",
                  top: `${40 + i * 20}%`,
                  left: "20%",
                  transformOrigin: "left",
                }}
              />
            ))}

            {/* Internship Stats */}
            <div className="absolute bottom-6 left-6 right-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-4"
              >
                {[
                  { label: "Stagiaires", value: "", icon: FiUser, color: "text-white" },
                  { label: "En cours", value: "", icon: FiClock, color: "text-white" },
                  { label: "Terminés", value: "", icon: FiCheck, color: "text-[#d01e3e]" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                    <div className="text-white font-bold text-xl">{stat.value}</div>
                    <div className="text-white/70 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Red Accent Elements */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/4 right-1/4 w-32 h-32 bg-[#d01e3e]/20 rounded-full blur-xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-[#d01e3e]/20 rounded-full blur-xl"
            />
          </div>
        </motion.div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification.type && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
              notification.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full ${
                  notification.type === 'success'
                    ? 'bg-green-100 dark:bg-green-800'
                    : 'bg-red-100 dark:bg-red-800'
                } flex items-center justify-center`}>
                  {notification.type === 'success' ? (
                    <FiCheck className="w-5 h-5 text-green-600 dark:text-green-300" />
                  ) : (
                    <FiX className="w-5 h-5 text-red-600 dark:text-red-300" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success'
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ type: null, message: '' })}
                className={`${
                  notification.type === 'success'
                    ? 'text-green-600 dark:text-green-300 hover:text-green-700 dark:hover:text-green-200'
                    : 'text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200'
                } transition-colors`}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreateStagiaire;
