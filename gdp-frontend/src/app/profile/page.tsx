"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { getUserData } from "@/services/authService"; 
import { FiUser, FiBriefcase, FiMail, FiPhone, FiMapPin, FiLock, FiBell, FiSettings, FiActivity, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi"; // Import icons
import { motion } from "framer-motion"; // Import motion
import ChangePasswordModal from "@/components/ChangePasswordModal"; // Import the modal
import UserCongesList from "@/components/UserCongesList"; // Import the user conges list
import { fetchUserById } from "@/services/user"; // Import fetchUserById
import { fetchAllCongesByMatricule, CongeStatus } from "@/services/conge"; // Import conge services
import ProfilePhotoPersonnel from "@/components/Gestion-users/profile/ProfilePhotoPersonnel"; // Import the new component

const Profile = () => {
  // États pour stocker les données utilisateur
  const [firstName, setUserfirstName] = useState<string | null>(null);
  const [lastName, setUserlastName] = useState<string | null>(null);
  const [photo, setUserPhoto] = useState<string | null>(null);
  const [role, setUserRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [matricule, setMatricule] = useState<string | null>(null);
  const [hireDate, setHireDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [conges, setConges] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    lastSubmitted: null as string | null
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  // Add state for potential additional info if fetched later
  // const [phone, setPhone] = useState<string | null>(null);
  // const [address, setAddress] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadUserConges = async (userMatricule: string) => {
    try {
      const congesData = await fetchAllCongesByMatricule(userMatricule);
      setConges(congesData);
      
      // Calculer les statistiques
      const total = congesData.length;
      const approved = congesData.filter(c => c.status === CongeStatus.APPROVED).length;
      const pending = congesData.filter(c => c.status === CongeStatus.PENDING).length;
      const rejected = congesData.filter(c => c.status === CongeStatus.REJECTED).length;
      
      // Trouver le dernier congé soumis (utiliser createdAt)
      const sortedConges = congesData.sort((a, b) => 
        new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime()
      );
      const lastSubmitted = sortedConges.length > 0 ? sortedConges[0].createdAt || sortedConges[0].startDate : null;
      
      setStats({
        total,
        approved,
        pending,
        rejected,
        lastSubmitted
      });
    } catch (error) {
      console.error('Erreur lors du chargement des congés:', error);
    }
  };

  // Récupération des données utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = getUserData();
        if (userData && userData.userId) {
          setUserId(userData.userId);
          
          // Récupérer les données complètes depuis l'API
          const fullUserData = await fetchUserById(userData.userId.toString());
          
          setUserfirstName(fullUserData.firstName || "Utilisateur");
          setUserlastName(fullUserData.lastName || "");
          setUserRole(fullUserData.role || "Rôle non défini");
          setMatricule(fullUserData.matricule || "Non défini");
          setHireDate(fullUserData.hireDate || null);
          setEndDate(fullUserData.endDate || null);
          setEmail(fullUserData.email || null);
          
          // Gérer l'URL de la photo
          if (fullUserData.photo) {
            if (fullUserData.photo.startsWith('https://lh3.googleusercontent.com')) {
              setUserPhoto(fullUserData.photo);
            } else {
              setUserPhoto(`${process.env.NEXT_PUBLIC_BACKEND_URL}${fullUserData.photo}`);
            }
          } else {
            setUserPhoto(null);
          }

          // Charger les congés de l'utilisateur
          if (fullUserData.matricule) {
            await loadUserConges(fullUserData.matricule);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        // Fallback aux données du token si l'API échoue
        const userData = getUserData();
        if (userData) {
          setUserId(userData.userId);
          setUserfirstName(userData.firstName || "Utilisateur");
          setUserlastName(userData.lastName || "");
          setUserRole(userData.role || "Rôle non défini");
          setMatricule(userData.matricule || "Non défini");
          setEmail(userData.email || null);
          
          if (userData.photo) {
            if (userData.photo.startsWith('https://lh3.googleusercontent.com')) {
              setUserPhoto(userData.photo);
            } else {
              setUserPhoto(`${process.env.NEXT_PUBLIC_BACKEND_URL}${userData.photo}`);
            }
          } else {
            setUserPhoto(null);
          }

          // Charger les congés de l'utilisateur
          if (userData.matricule) {
            await loadUserConges(userData.matricule);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Rafraîchir le temps relatif toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = currentTime;
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
    return formatDate(dateString);
  };

  const handlePhotoUpdate = (newPhotoPath: string) => {
    // Mettre à jour la photo dans l'état local
    if (newPhotoPath.startsWith('https://lh3.googleusercontent.com')) {
      setUserPhoto(newPhotoPath);
    } else {
      setUserPhoto(`${process.env.NEXT_PUBLIC_BACKEND_URL}${newPhotoPath}`);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="mx-auto max-w-7xl p-4 md:p-6 flex flex-col flex-grow">
          <Breadcrumb pageName="Profil" />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-9xl p-4 md:p-6 flex flex-col flex-grow">
        <Breadcrumb pageName="Profil" />

        {/* Professional Profile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Profile Header Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-boxdark rounded-xl border border-stroke dark:border-strokedark shadow-sm p-6">
              <div className="flex items-center space-x-6">
                {/* Profile Picture avec composant ProfilePhotoPersonnel */}
                <ProfilePhotoPersonnel
                  photo={photo || undefined}
                  firstName={firstName || undefined}
                  lastName={lastName || undefined}
                  userId={userId || undefined}
                  onPhotoUpdate={handlePhotoUpdate}
                />
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-black dark:text-white truncate">
                    {firstName} {lastName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                    <FiBriefcase className="w-4 h-4 text-primary"/>
                    <span className="font-medium">{role}</span>
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 flex items-center gap-2 mt-1">
                    <FiMail className="w-4 h-4"/>
                    <span className="truncate">{email}</span>
                  </p>
                </div>
                
                {/* Action Button */}
                <div className="flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                  >
                    <FiLock className="w-4 h-4" />
                    Modifier mot de passe
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Details Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-boxdark rounded-xl border border-stroke dark:border-strokedark shadow-sm p-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Informations employé</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Matricule</span>
                  <span className="font-medium text-black dark:text-white">{matricule}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Date d&apos;embauche</span>
                  <span className="font-medium text-black dark:text-white">{formatDate(hireDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Date de fin</span>
                  <span className="font-medium text-black dark:text-white">{formatDate(endDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Dernier congé soumis</span>
                  <span 
                    className="font-medium text-black dark:text-white cursor-help" 
                    title={stats.lastSubmitted ? new Date(stats.lastSubmitted).toLocaleString('fr-FR') : "Aucun congé"}
                  >
                    {formatRelativeTime(stats.lastSubmitted)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total congés</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FiCalendar className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <FiCheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <FiClock className="w-8 h-8 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Refusés</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <FiAlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </motion.div>
        </div>

        {/* Conges List Section */}
        <div className="bg-white dark:bg-boxdark rounded-xl border border-stroke dark:border-strokedark shadow-sm p-6">
          <UserCongesList onCongeUpdate={() => matricule && loadUserConges(matricule)} />
        </div>

        {/* Change Password Modal */}
        <ChangePasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </DefaultLayout>
  );
};

export default Profile;
