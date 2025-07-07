"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { fetchAllUsers, User, updateUser, addUser, UserRole, UserStatus } from "@/services/user";
import { Alert } from "@material-tailwind/react";
import { FaSyncAlt } from "react-icons/fa"; // Import the reload icon
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch, FiTrash2, FiX, FiCheck, FiUser, FiMail, FiLock, FiCalendar, FiImage, FiUsers, FiShield, FiCode, FiEye, FiEyeOff } from "react-icons/fi";

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    status: "EN_ATTENTE",
    hireDate: "",
    endDate: "",
    photo: "",
    password: "",
    matricule: "",
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<string>("");
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [passwordGenerator, setPasswordGenerator] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (name === "firstName" || name === "lastName") {
      setPasswordGenerator(`${formData.firstName} ${formData.lastName}`);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérification du type de fichier
      if (!file.type.match(/\/(jpg|jpeg|png)$/)) {
        setErrors((prev) => ({
          ...prev,
          photo: "Seules les images JPG, JPEG et PNG sont autorisées",
        }));
        return;
      }

      // Vérification de la taille du fichier (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          photo: "La taille de l'image ne doit pas dépasser 5MB",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photo: reader.result as string,
        }));
        setErrors((prev) => ({ ...prev, photo: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatePasswordStrength = (password: string): string => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[\W_]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        return "Very Weak";
      case 2:
        return "Weak";
      case 3:
        return "Medium";
      case 4:
        return "Strong";
      case 5:
        return "Very Strong";
      default:
        return "";
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    setGeneratedPassword(password);
    setFormData((prev) => ({
      ...prev,
      password: password,
    }));
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    if (!formData.username) newErrors.username = "Le nom d&apos;utilisateur est requis.";
    if (!formData.firstName) newErrors.firstName = "Le prénom est requis.";
    if (!formData.lastName) newErrors.lastName = "Le nom est requis.";
    if (!formData.email) newErrors.email = "L&apos;email est requis.";
    if (!formData.role) newErrors.role = "Le rôle est requis.";
    if (!formData.hireDate) newErrors.hireDate = "La date d&apos;embauche est requise.";
    if (!formData.endDate) newErrors.endDate = "La date de fin est requise.";
    if (!formData.photo) newErrors.photo = "La photo est requise.";
    if (!formData.password) newErrors.password = "Le mot de passe est requis.";
    if (!formData.matricule) newErrors.matricule = "Le matricule est requis.";

    if (formData.hireDate && formData.endDate) {
      const hireDate = new Date(formData.hireDate);
      const endDate = new Date(formData.endDate);
      const diffInMonths =
        (endDate.getFullYear() - hireDate.getFullYear()) * 12 +
        (endDate.getMonth() - hireDate.getMonth());

      if (diffInMonths < 6) {
        newErrors.endDate = "La durée d&apos;embauche doit être d&apos;au moins 6 mois.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      setNotification({ type: 'error', message: 'Veuillez remplir tous les champs requis correctement.' });
      return;
    }

    try {
      const formDataToSend = new FormData();
      const photoInput = (e.target as HTMLFormElement).elements.namedItem('photo') as HTMLInputElement;
      const photoFile = photoInput?.files?.[0];

      // Ajout des données du formulaire
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'photo') {
          formDataToSend.append(key, value);
        }
      });

      // Ajout de la photo si elle existe
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/add`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de l\'utilisateur');
      }

      setNotification({ type: 'success', message: 'Utilisateur ajouté avec succès !' });

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        setNotification({ type: null, message: '' });
        setFormData({
          username: "",
          firstName: "",
          lastName: "",
          email: "",
          role: "",
          status: "EN_ATTENTE",
          hireDate: "",
          endDate: "",
          photo: "",
          password: "",
          matricule: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur :", error);
      setNotification({ type: 'error', message: "Une erreur est survenue lors de l'ajout de l'utilisateur." });
    }
  };

  return (
    <>
      <Breadcrumb pageName="Ajouter un Utilisateur" />

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
              {/* Username */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom d&apos;utilisateur
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </motion.div>

              {/* First Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
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
                transition={{ duration: 0.5, delay: 0.3 }}
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
                transition={{ duration: 0.5, delay: 0.4 }}
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

              {/* Matricule */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Matricule
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                    placeholder="Entrez le matricule"
                  />
                </div>
                {errors.matricule && <p className="text-red-500 text-xs mt-1">{errors.matricule}</p>}
              </motion.div>

              {/* Role */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rôle
                </label>
                <div className="relative">
                  <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200 appearance-none"
                    required
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option value="ADMIN">Admin</option>
                    <option value="DEVELOPPER">Développeur</option>
                    <option value="INFRA">Infra</option>
                  </select>
                </div>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </motion.div>

              {/* Hire Date */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d&apos;embauche
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
                {errors.hireDate && <p className="text-red-500 text-xs mt-1">{errors.hireDate}</p>}
              </motion.div>

              {/* End Date */}
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
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
              </motion.div>

              {/* Photo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
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

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Force: {passwordStrength}</p>
              </motion.div>

              {generatedPassword && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Mot de passe généré par {passwordGenerator}: {generatedPassword}
                  </p>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[#2560a0] hover:text-[#1f4e84] dark:text-[#2560a0] dark:hover:text-[#1f4e84] transition-colors"
                  >
                    Regénérer
                  </button>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="mt-4 w-full rounded-md bg-[#2560a0] py-2 px-4 text-sm font-medium text-white hover:bg-[#1f4e84] focus:outline-none focus:ring-2 focus:ring-[#2560a0] focus:ring-offset-2 transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <FiPlus className="text-base" />
                  <span>Ajouter l&apos;utilisateur</span>
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
            {/* Floating User Cards */}
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
                    <span className="text-white font-medium">Utilisateur {i + 1}</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/20 rounded text-white text-xs">DEVELOPPER</span>
                    <span className="px-2 py-1 bg-[#d01e3e]/50 rounded text-white text-xs">ACTIF</span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <FiMail className="text-white/70" />
                    <FiShield className="text-white/70" />
                    <FiCalendar className="text-white/70" />
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

            {/* User Stats */}
            <div className="absolute bottom-6 left-6 right-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-4"
              >
                {[
                  { label: "Utilisateurs", value: "", icon: FiUsers, color: "text-white" },
                  { label: "Développeurs", value: "", icon: FiCode, color: "text-white" },
                  { label: "Admins", value: "", icon: FiShield, color: "text-[#d01e3e]" },
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

export default CreateUser;
