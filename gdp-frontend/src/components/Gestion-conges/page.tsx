"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createConge, CongeType, Conge } from "@/services/conge";
import { getUserData } from "@/services/authService";
import { motion } from "framer-motion";
import { FiCalendar, FiClock, FiUser, FiMapPin, FiPhone, FiUsers, FiCheck, FiPlus, FiMail, FiShield } from "react-icons/fi";
import path from "path";

const GestionConges = () => {
  const [formData, setFormData] = useState<Omit<Conge, "id" | "status"> & { userId: number }>({
    userId: 0,
    matricule: "",
    service: "",
    firstName: "",
    lastName: "",
    responsable: "",
    type: CongeType.CONGE,
    startDate: "",
    endDate: "",
    dateReprise: "",
    telephone: "",
    adresse: "",
    interim1: "",
    interim2: "",
  });

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedCongeData, setSavedCongeData] = useState<Conge | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState({
    startDate: "",
    endDate: "",
    dateReprise: "",
    telephone: "",
  });

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        userId: userData.userId, // Set userId from userData
        matricule: userData.matricule,
        firstName: userData.firstName,
        lastName: userData.lastName,
      }));
    }
  }, []);

  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "type" ? (value as CongeType) : value,
    });
  };

  const validateForm = () => {
    const errors = { startDate: "", endDate: "", dateReprise: "", telephone: "" };
    const currentDate = new Date();

    // Validate start date
    if (new Date(formData.startDate) < currentDate) {
      errors.startDate = "La date de début ne peut pas être antérieure à la date actuelle.";
    }

    // Validate end date
    if (new Date(formData.endDate) < currentDate) {
      errors.endDate = "La date de fin ne peut pas être antérieure à la date actuelle.";
    }

    // Validate dateReprise
    if (new Date(formData.dateReprise) <= new Date(formData.endDate)) {
      errors.dateReprise = "La date de reprise ne peut pas être antérieure ou égale à la date de fin.";
    }

    // Validate telephone number
    const phonePattern = /^\d{8}$/;
    if (!phonePattern.test(formData.telephone)) {
      errors.telephone = "Le numéro de téléphone doit contenir 8 chiffres.";
    }

    setFormErrors(errors);
    return Object.values(errors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await createConge(formData);

      if (response?.id) {
        setSavedCongeData(response);
        setSuccess("Congé ajouté avec succès !");
      } else {
        setError("Erreur : Impossible de récupérer l'ID du congé.");
      }
    } catch (err: any) {
      setError(`Une erreur s'est produite : ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!savedCongeData || !savedCongeData.id) {
      console.error("Erreur : Aucun ID de congé disponible pour générer le PDF.");
      return;
    }

    setDownloading(true);
    const congeId = savedCongeData.id;
    const pdfUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/conges/download-pdf/${congeId}`;

    try {
      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("Token d'authentification non trouvé");
      }

      const response = await fetch(pdfUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      setPdfBlobUrl(blobUrl);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "demande_conge.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Nettoyer l'URL du blob après le téléchargement
      URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      console.error("Erreur lors du téléchargement du PDF :", error);
      setError(error.message || "Erreur lors du téléchargement du PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Breadcrumb pageName="Demande de congé" />

      <div className="flex flex-col lg:flex-row gap-6 p-4 flex-grow">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/2"
        >
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row items-center justify-between p-4 mb-4 text-green-800 border-t-4 border-green-300 bg-green-50 dark:text-green-400 dark:bg-gray-800 dark:border-green-800 rounded-lg shadow-lg"
              role="alert"
            >
              <div className="flex items-center mb-2 md:mb-0">
                <svg
                  className="shrink-0 w-5 h-5 mr-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <div className="text-sm font-medium">{success}</div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadPDF}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <svg
                        aria-hidden="true"
                        role="status"
                        className="inline w-4 h-4 me-2 text-white animate-spin"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="#E5E7EB"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span>Génération en cours...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                      </svg>
                      <span>Générer PDF</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                  onClick={() => setSuccess("")}
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 dark:bg-boxdark dark:border-strokedark"
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-8 dark:text-white flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Demande de congé
            </motion.h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Matricule */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
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
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    required
                  />
                </div>
              </motion.div>

              {/* Full Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom Complet
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={`${formData.firstName} ${formData.lastName}`}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    readOnly
                  />
                </div>
              </motion.div>

              {/* Service et Responsable */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service
                  </label>
                  <div className="relative">
                    <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Responsable
                  </label>
                  <div className="relative">
                    <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="responsable"
                      value={formData.responsable}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                      required
                    />
                  </div>
                </motion.div>
              </div>

              {/* Type de congé */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de congé
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200 appearance-none"
                  >
                    <option value={CongeType.MALADIE}>Maladie</option>
                    <option value={CongeType.CONGE}>Congé</option>
                    <option value={CongeType.DECES}>Décès</option>
                    <option value={CongeType.MARIAGE}>Congé Mariage</option>
                    <option value={CongeType.AUTRES}>Autres</option>
                  </select>
                </div>
              </motion.div>

              {/* Dates */}
              <div className="grid md:grid-cols-3 gap-4">
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
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                      required
                    />
                  </div>
                  {formErrors.startDate && <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>}
                </motion.div>

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
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                      required
                    />
                  </div>
                  {formErrors.endDate && <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de reprise
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="dateReprise"
                      value={formData.dateReprise}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                      required
                    />
                  </div>
                  {formErrors.dateReprise && <p className="text-red-500 text-xs mt-1">{formErrors.dateReprise}</p>}
                </motion.div>
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Téléphone
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-500">+216</span>
                    <input
                      type="text"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-20 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                      required
                    />
                  </div>
                  {formErrors.telephone && <p className="text-red-500 text-xs mt-1">{formErrors.telephone}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Adresse
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                      required
                    />
                  </div>
                </motion.div>
              </div>

              {/* Intérimaires */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Intérimaire 1
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="interim1"
                      value={formData.interim1}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Intérimaire 2
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="interim2"
                      value={formData.interim2}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#2560a0] focus:ring-1 focus:ring-[#2560a0] transition-all duration-200"
                    />
                  </div>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="mt-4 w-full rounded-md bg-[#2560a0] py-2 px-4 text-sm font-medium text-white hover:bg-[#1f4e84] focus:outline-none focus:ring-2 focus:ring-[#2560a0] focus:ring-offset-2 transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <FiPlus className="text-base" />
                  <span>Ajouter la demande de congé</span>
                </div>
              </motion.button>
            </form>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 mt-4 p-3 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        </motion.div>

        {/* Animation Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/2 bg-gradient-to-b from-[#2560a0] via-[#2560a0]/90 to-[#d01e3e]/30 rounded-lg p-6 relative overflow-hidden"
        >
          <div className="relative h-full min-h-[500px]">
            {/* Floating Leave Cards */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, i % 2 === 0 ? 3 : -3, 0],
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
                  width: "220px",
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUser className="text-white" />
                    <span className="text-white font-medium">Employé {i + 1}</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/20 rounded text-white text-xs">
                      {i === 0 ? "CONGÉ" : i === 1 ? "MALADIE" : "MARIAGE"}
                    </span>
                    <span className="px-2 py-1 bg-green-500/50 rounded text-white text-xs">
                      {i === 0 ? "APPROUVÉ" : i === 1 ? "EN ATTENTE" : "APPROUVÉ"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm mt-2">
                    <FiCalendar className="shrink-0" />
                    <span>10 jours</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                    <FiClock className="shrink-0" />
                    <span>Reprise le 20/06/2024</span>
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
                className="absolute h-0.5 bg-gradient-to-r from-white/30 to-green-400/30 rounded-full"
                style={{
                  width: "60%",
                  top: `${40 + i * 20}%`,
                  left: "20%",
                  transformOrigin: "left",
                }}
              />
            ))}

            {/* Leave Stats */}
            <div className="absolute bottom-6 left-6 right-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-4"
              >
                {[
                  { label: "Congés", value: "", icon: FiCalendar },
                  { label: "En attente", value: "", icon: FiClock },
                  { label: "Approuvés", value: "", icon: FiCheck },
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

            {/* Decorative Elements */}
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
              className="absolute top-1/4 right-1/4 w-32 h-32 bg-green-400/20 rounded-full blur-xl"
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
              className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-blue-400/20 rounded-full blur-xl"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GestionConges;
