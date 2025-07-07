"use client";

import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { updateUser, User, UserRole, UserStatus } from "@/services/user";
import { Alert } from "@material-tailwind/react";
import { useAuth } from "@/context/AuthContext";
import { getUserData } from "@/services/authService";

interface ProfileInfoProps {
  formData: User;
  setFormData: Dispatch<SetStateAction<User | null>>;
}

const ProfileInfo = ({ formData, setFormData }: ProfileInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [tempData, setTempData] = useState<User>(formData);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [userRole, setUserRoleState] = useState<string | null>(null);
  const { setUserRole } = useAuth();

  useEffect(() => {
    // Détecter si l'utilisateur est connecté via Google
    const isGoogle = Boolean(formData.email?.includes('@gmail.com') || formData.photo?.includes('googleusercontent.com'));
    setIsGoogleUser(isGoogle);
  }, [formData]);

  useEffect(() => {
    const userData = getUserData();
    setUserRoleState(userData?.role || null);
  }, []);

  const handleEdit = () => {
    setTempData(formData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(tempData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      const dataToUpdate = isGoogleUser ? {
        ...formData,
        firstName: tempData.firstName,
        lastName: tempData.lastName,
        email: tempData.email
      } : formData;

      const updatedUser = await updateUser(formData.id, dataToUpdate);
      
      // Mettre à jour le rôle dans le contexte si le rôle a été modifié
      if (updatedUser.role !== tempData.role) {
        setUserRole(updatedUser.role);
        // Déclencher un événement de stockage pour notifier les autres composants
        window.dispatchEvent(new Event('storage'));
      }

      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Une erreur est survenue lors de la mise à jour.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-boxdark dark:to-gray-900 border border-stroke dark:border-strokedark p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-black dark:text-white">Informations personnelles</h3>
        {!isEditing && userRole === 'ADMIN' && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </button>
        )}
      </div>
      <form className="space-y-8">
        {userRole === 'ADMIN' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing || isGoogleUser}
                  className={`w-full rounded-xl border border-stroke bg-transparent px-5 py-3 text-black dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-strokedark dark:bg-form-input disabled:bg-gray-50 dark:disabled:bg-gray-800/50 transition-all duration-300 ${isGoogleUser ? 'cursor-not-allowed' : ''}`}
                />
               
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing || isGoogleUser}
                  className={`w-full rounded-xl border border-stroke bg-transparent px-5 py-3 text-black dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-strokedark dark:bg-form-input disabled:bg-gray-50 dark:disabled:bg-gray-800/50 transition-all duration-300 ${isGoogleUser ? 'cursor-not-allowed' : ''}`}
                />
            
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing || isGoogleUser}
                className={`w-full rounded-xl border border-stroke bg-transparent px-5 py-3 text-black dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-strokedark dark:bg-form-input disabled:bg-gray-50 dark:disabled:bg-gray-800/50 transition-all duration-300 ${isGoogleUser ? 'cursor-not-allowed' : ''}`}
              />
         
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Rôle</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-stroke bg-transparent px-5 py-3 text-black dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-strokedark dark:bg-form-input disabled:bg-gray-50 dark:disabled:bg-gray-800/50 transition-all duration-300"
                >
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Situation</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-stroke bg-transparent px-5 py-3 text-black dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-strokedark dark:bg-form-input disabled:bg-gray-50 dark:disabled:bg-gray-800/50 transition-all duration-300"
                >
                  {Object.values(UserStatus).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Date d&apos;embauche</label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-stroke bg-transparent px-5 py-3 text-black dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-strokedark dark:bg-form-input disabled:bg-gray-50 dark:disabled:bg-gray-800/50 transition-all duration-300"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Date de fin</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-stroke bg-transparent px-5 py-3 text-black dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-strokedark dark:bg-form-input disabled:bg-gray-50 dark:disabled:bg-gray-800/50 transition-all duration-300"
                />
              </div>
            </div>
          </>
        ) : (
          // Version en lecture seule pour INFRA et DEVELOPER
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Prénom</label>
                <div className="w-full rounded-xl border border-stroke bg-gray-50 dark:bg-gray-800 px-5 py-3 text-black dark:text-white">
                  {formData.firstName}
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Nom</label>
                <div className="w-full rounded-xl border border-stroke bg-gray-50 dark:bg-gray-800 px-5 py-3 text-black dark:text-white">
                  {formData.lastName}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
              <div className="w-full rounded-xl border border-stroke bg-gray-50 dark:bg-gray-800 px-5 py-3 text-black dark:text-white">
                {formData.email}
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Rôle</label>
              <div className="w-full rounded-xl border border-stroke bg-gray-50 dark:bg-gray-800 px-5 py-3 text-black dark:text-white">
                {formData.role}
              </div>
            </div>
          </div>
        )}
        {isEditing && userRole === 'ADMIN' && (
          <div className="flex justify-end gap-4 pt-4">
            <button 
              type="button" 
              onClick={handleCancel} 
              className="px-6 py-3 rounded-xl border border-stroke text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Annuler
            </button>
            <button 
              type="button" 
              onClick={handleSave} 
              className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Enregistrer
            </button>
          </div>
        )}
      </form>
      {showSuccessAlert && (
        <div className="mt-6 animate-fade-in">
          <Alert
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
            }
            className="rounded-xl border-l-4 border-[#2ec946] bg-[#2ec946]/10 font-medium text-[#2ec946] dark:bg-[#2ec946]/20 dark:text-[#2ec946] animate-fade-in"
          >
            Mise à jour réussie !
          </Alert>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
