"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Calendar from "@/components/Gestion-tache-periodique/affichage-calendrier";
import { useState, useEffect } from "react";
import axiosInstance from "@/services/axiosInstance"; 
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar, FiClock, FiUsers, FiSearch, FiCheck, FiAlertCircle, FiPlus, FiFilter, FiX, FiClipboard, FiBell, FiRepeat } from "react-icons/fi";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const PeriodicTasks = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' });
  const [showNotification, setShowNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'calendar'>('form');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sendDate: '',
    periodicite: 'QUOTIDIEN',
    heureExecution: '',
    estActive: true,
    users: [],
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/users/all');
        setUsers(response.data); 
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        setNotification({ type: 'error', message: "Impossible de charger les utilisateurs." });
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, []);

  useEffect(() => {
    if (notification.type) {
      // Faire défiler la page vers le bas
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });

      // Timer pour masquer la notification
      const timer = setTimeout(() => {
        setNotification({ type: null, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.type]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Vérifier que tous les champs sont remplis d'abord
    if (!title || !description || !date || !time || !formData.heureExecution || selectedEmails.length === 0) {
      setNotification({ type: 'error', message: 'Tous les champs sont obligatoires.' });
      return;
    }

    // Vérifier si la date sélectionnée est un weekend
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setNotification({ 
        type: 'error', 
        message: 'Les tâches ne peuvent pas être programmées le weekend (samedi ou dimanche).' 
      });
      return;
    }

    try {
      // Créer la date avec l'heure de la tâche pour l'envoi
      const sendDate = `${date}T${time}:00`;
      
      // Créer la date de la tâche en format local
      const taskDate = `${date}T${time}:00`;

      console.log('Données envoyées:', {
        title,
        description,
        sendDate,
        taskDate,
        users: selectedEmails,
        heureExecution: formData.heureExecution,
        periodicite: formData.periodicite,
        estActive: formData.estActive
      });

      const response = await axiosInstance.post('/tache-periodique/add', {
        title,
        description,
        sendDate,
        taskDate,
        users: selectedEmails,
        heureExecution: formData.heureExecution,
        periodicite: formData.periodicite,
        estActive: formData.estActive
      });

      if (response.status === 200) {
        // Réinitialiser le formulaire
        setTitle("");
        setDescription("");
        setDate("");
        setTime("");
        setSelectedEmails([]);
        setFormData({
          title: '',
          description: '',
          sendDate: '',
          periodicite: 'QUOTIDIEN',
          heureExecution: '',
          estActive: true,
          users: [],
        });
        
        setNotification({ 
          type: 'success', 
          message: '✅ Tâche périodique créée avec succès !' 
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de la tâche:', error);
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || "Erreur lors de la création de la tâche." 
      });
    }
  };

  const handleToggleUser = (userId: number) => {
    setSelectedEmails((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === users.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(users.map((user) => user.id));
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchEmail.toLowerCase()) &&
      (filterRole ? user.role === filterRole : true)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // Fonction pour vérifier si une date est un weekend
  const isWeekend = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Fonction pour vérifier si une date tombe un weekend et afficher un message d'information
  const checkWeekendAndShowInfo = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    
    if ((formData.periodicite === 'MENSUEL' || formData.periodicite === 'ANNUEL') && (dayOfWeek === 0 || dayOfWeek === 6)) {
      const nextMonday = new Date(date);
      if (dayOfWeek === 0) { // Dimanche
        nextMonday.setDate(date.getDate() + 1);
      } else { // Samedi
        nextMonday.setDate(date.getDate() + 2);
      }
      
      setNotification({
        type: 'info',
        message: `⚠️ La date sélectionnée tombe un ${dayOfWeek === 0 ? 'dimanche' : 'samedi'}. La tâche sera automatiquement reportée au lundi ${nextMonday.toLocaleDateString('fr-FR')}.`
      });
    } else if (notification.type === 'info') {
      setNotification({ type: null, message: '' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Breadcrumb pageName="Créer une Tâche Périodique" />
      
      <div className="mx-2 lg:mx-4 flex flex-col flex-grow">
        {/* Header Section with new styling similar to user table */}
        <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-gradient-to-r from-[#2560a0] via-[#2560a0] to-[#d01e3e] rounded-t-lg relative overflow-hidden dark:from-[#1f4e84] dark:via-[#1f4e84] dark:to-[#a01e3e]">
          {/* Animated elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Task cards animation */}
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
            
            {/* Single animated line at bottom */}
            <motion.div
              animate={{
                scaleX: [0, 1, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute h-1 bg-white/30 rounded-full"
              style={{
                width: "80%",
                bottom: "0",
                left: "10%",
                transformOrigin: "left",
              }}
            />
          </div>

          <h2 className="text-2xl font-bold text-white mb-4 md:mb-0 relative z-10">
            Gestion des Tâches Périodiques
          </h2>

          <div className="relative z-10">
            <div className="flex gap-4">
              <button
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'form'
                    ? 'bg-white text-[#2560a0] shadow-md'
                    : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                }`}
                onClick={() => setActiveTab('form')}
              >
                Nouvelle Tâche
              </button>
              <button
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'calendar'
                    ? 'bg-white text-[#2560a0] shadow-md'
                    : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                }`}
                onClick={() => setActiveTab('calendar')}
              >
                Calendrier
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark shadow-md rounded-b-lg flex-grow flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'form' ? (
              <div key="form" className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Form Section */}
                  <div className="w-full lg:w-2/3">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Nouvelle Tâche Périodique</h2>
                      <p className="text-gray-600 dark:text-gray-300">Planifiez et assignez des tâches récurrentes à votre équipe</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Title */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Titre de la tâche
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-700 dark:text-white transition-all duration-200"
                            placeholder="Entrez le titre de la tâche"
                          />
                          <FiPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-700 dark:text-white transition-all duration-200"
                          rows={4}
                          placeholder="Décrivez la tâche en détail"
                        />
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={date}
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                if (isWeekend(selectedDate)) {
                                  if (formData.periodicite === 'QUOTIDIEN') {
                                    setNotification({ 
                                      type: 'error', 
                                      message: 'Les tâches quotidiennes ne peuvent pas être programmées le weekend (samedi ou dimanche).' 
                                    });
                                    setDate('');
                                  } else {
                                    setDate(selectedDate);
                                    checkWeekendAndShowInfo(selectedDate);
                                  }
                                } else {
                                  setDate(selectedDate);
                                  // Effacer la notification d'erreur si elle existe
                                  if (notification.type === 'error' || notification.type === 'info') {
                                    setNotification({ type: null, message: '' });
                                  }
                                }
                              }}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-700 dark:text-white transition-all duration-200"
                            />
                            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Heure de la tâche
                          </label>
                          <div className="relative">
                            <input
                              type="time"
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                              className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-700 dark:text-white transition-all duration-200"
                            />
                            <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Heure d&apos;exécution
                          </label>
                          <div className="relative">
                            <input
                              type="time"
                              name="heureExecution"
                              value={formData.heureExecution}
                              onChange={(e) => setFormData({
                                ...formData,
                                heureExecution: e.target.value
                              })}
                              required
                              className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-700 dark:text-white transition-all duration-200"
                            />
                            <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Users Selection */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sélectionnez les utilisateurs
                        </label>
                        
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              placeholder="Rechercher par email"
                              value={searchEmail}
                              onChange={(e) => setSearchEmail(e.target.value)}
                              className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-700 dark:text-white transition-all duration-200"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                          <div className="relative">
                            <select
                              value={filterRole}
                              onChange={(e) => setFilterRole(e.target.value)}
                              className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-700 dark:text-white transition-all duration-200"
                            >
                              <option value="">Tous les rôles</option>
                              <option value="ADMIN">Admin</option>
                              <option value="DEVELOPPER">Developer</option>
                              <option value="INFRA">Infra</option>
                            </select>
                            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>

                        {/* Select All */}
                        <div className="flex items-center space-x-3 mb-4">
                          <input
                            type="checkbox"
                            checked={selectedEmails.length === users.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-[#2560a0] border-gray-300 rounded focus:ring-[#2560a0]"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Sélectionner tout</span>
                        </div>

                        {/* Users List */}
                        <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedEmails.includes(user.id)}
                                  onChange={() => handleToggleUser(user.id)}
                                  className="w-4 h-4 text-[#2560a0] border-gray-300 rounded focus:ring-[#2560a0]"
                                />
                                <div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {user.email}
                                  </span>
                                  <span
                                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                      user.role === "DEVELOPPER"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        : user.role === "INFRA"
                                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                    }`}
                                  >
                                    {user.role}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Périodicité */}
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Périodicité
                        </label>
                        <select
                          name="periodicite"
                          value={formData.periodicite}
                          onChange={handleInputChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                          <option value="QUOTIDIEN">Quotidien</option>
                          <option value="MENSUEL">Mensuel</option>
                          <option value="ANNUEL">Annuel</option>
                        </select>
                      </div>

                      {/* Tâche active */}
                      <div className="mb-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="estActive"
                            checked={formData.estActive}
                            onChange={(e) => setFormData({ ...formData, estActive: e.target.checked })}
                            className="form-checkbox h-5 w-5 text-blue-600"
                          />
                          <span className="text-gray-700">Tâche active</span>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#2560a0] to-[#1f4e84] text-white font-semibold rounded-lg hover:from-[#1f4e84] hover:to-[#2560a0] focus:outline-none focus:ring-2 focus:ring-[#2560a0] focus:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                      >
                        <FiCheck className="w-5 h-5" />
                        <span>Créer la tâche</span>
                      </button>
                    </form>
                  </div>

                  {/* Time Management Animation Section */}
                  <div className="w-full lg:w-1/3 bg-gradient-to-b from-[#2560a0] to-[#2560a0]/70 rounded-lg p-6 relative overflow-hidden hidden lg:block dark:from-[#1f4e84] dark:to-[#1f4e84]/70">
                    <div className="relative h-full min-h-[600px]">
                      {/* Clock and Time Elements */}
                      <motion.div 
                        animate={{ 
                          rotate: 360 
                        }}
                        transition={{ 
                          duration: 60, 
                          repeat: Infinity, 
                          ease: "linear" 
                        }}
                        className="w-40 h-40 absolute top-10 left-1/2 transform -translate-x-1/2 rounded-full border-4 border-white/30 flex items-center justify-center"
                      >
                        <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center relative">
                          <FiClock className="w-12 h-12 text-white" />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute w-1 h-12 bg-white origin-bottom"
                            style={{ bottom: '50%', left: 'calc(50% - 0.5px)' }}
                          />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute w-1 h-8 bg-white/70 origin-bottom"
                            style={{ bottom: '50%', left: 'calc(50% - 0.5px)' }}
                          />
                        </div>
                      </motion.div>

                      {/* Task Cards */}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={`task-${i}`}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            y: [0, -10, 0] 
                          }}
                          transition={{
                            delay: 0.3 * i,
                            y: {
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.5
                            }
                          }}
                          className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 absolute shadow-lg"
                          style={{
                            top: `${180 + i * 80}px`,
                            left: '20px',
                            right: '20px',
                          }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {i === 0 ? (
                              <FiClipboard className="text-white" />
                            ) : i === 1 ? (
                              <FiBell className="text-white" />
                            ) : (
                              <FiRepeat className="text-white" />
                            )}
                            <div className="text-white font-medium">
                              {i === 0 ? "Planification" : i === 1 ? "Rappel" : "Récurrence"}
                            </div>
                          </div>
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                              animate={{ x: ["0%", "100%", "0%"] }}
                              transition={{ 
                                duration: 4 + i, 
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="h-full w-1/2 bg-white/50 rounded-full"
                            />
                          </div>
                        </motion.div>
                      ))}

                      {/* Background Elements */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute top-1/3 right-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key="calendar"
                className="p-6 dark:bg-boxdark flex-grow h-full"
              >
                <Calendar />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Déplacer la notification à la fin du composant */}
        {notification.type && (
          <div 
            className={`fixed bottom-4 right-4 w-96 p-4 rounded-lg shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200' 
                : notification.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200'
                  : 'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200'
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">
                {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <span className="flex-1">{notification.message}</span>
              <button 
                onClick={() => setNotification({ type: null, message: '' })}
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodicTasks;
