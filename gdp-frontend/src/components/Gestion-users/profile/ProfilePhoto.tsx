"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CameraIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import { updateUserPhoto } from "@/services/user";
import { useAuth } from "@/context/AuthContext";

interface ProfilePhotoProps {
  photo?: string;
  firstName?: string;
  lastName?: string;
  userId?: number;
  onPhotoUpdate?: (newPhotoPath: string) => void;
}

const ProfilePhoto = ({ photo, firstName, lastName, userId, onPhotoUpdate }: ProfilePhotoProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { userRole } = useAuth();

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return '/images/user/default-avatar.png';
    
    // Si l'URL est une URL Google, on la retourne directement
    if (url.startsWith('https://lh3.googleusercontent.com/')) {
      return url;
    }
    
    // Pour les autres URLs, on utilise l'URL complète
    return process.env.NEXT_PUBLIC_BACKEND_URL
      ? new URL(url, process.env.NEXT_PUBLIC_BACKEND_URL).toString()
      : url;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.match(/\/(jpg|jpeg|png)$/)) {
      setUploadError("Seules les images JPG, JPEG et PNG sont autorisées");
      return;
    }

    // Vérification de la taille du fichier (5MB max)
    if (file.size > 5 * 1024 * 1024) {
              setUploadError("La taille de l&apos;image ne doit pas dépasser 5MB");
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!selectedFile || !userId) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await updateUserPhoto(userId, selectedFile);
      
      if (response.user && onPhotoUpdate) {
        onPhotoUpdate(response.user.photo);
      }
      
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('photo-updated'));
      
      // Réinitialiser l'état
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsEditing(false);
      
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setUploadError(error.message || "Erreur lors de la mise à jour de la photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
    setUploadError(null);
    
    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    fileInputRef.current?.click();
  };

  // Vérifier si l'utilisateur peut modifier la photo (ADMIN uniquement)
  const canEditPhoto = userRole === 'ADMIN';
  const isGoogleUser = photo?.includes('googleusercontent.com');

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-boxdark dark:to-gray-900 border border-stroke dark:border-strokedark p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Rotating rings */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className={`absolute border-2 rounded-full ${
              i % 2 === 0 
                ? "border-[#c42444]/20 dark:border-[#c42444]/30" 
                : "border-[#3c5c94]/20 dark:border-[#3c5c94]/30"
            }`}
            style={{
              width: `${120 + i * 40}px`,
              height: `${120 + i * 40}px`,
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%)`,
            }}
          />
        ))}

        {/* Floating diamonds */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`diamond-${i}`}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
            className={`absolute w-3 h-3 ${
              i % 2 === 0 
                ? "bg-[#c42444]/20 dark:bg-[#c42444]/30" 
                : "bg-[#3c5c94]/20 dark:bg-[#3c5c94]/30"
            }`}
            style={{
              left: `${15 + (i * 15)}%`,
              top: `${20 + (i % 2) * 50}%`,
              transform: 'rotate(45deg)',
            }}
          />
        ))}

        {/* Pulsing dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`pulse-${i}`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
            className={`absolute w-2 h-2 rounded-full ${
              i % 2 === 0 
                ? "bg-[#c42444]/30 dark:bg-[#c42444]/40" 
                : "bg-[#3c5c94]/30 dark:bg-[#3c5c94]/40"
            }`}
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
          />
        ))}

        {/* Animated lines */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className={`absolute w-32 h-1 ${
              i % 2 === 0 
                ? "bg-[#c42444]/10 dark:bg-[#c42444]/20" 
                : "bg-[#3c5c94]/10 dark:bg-[#3c5c94]/20"
            }`}
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
            }}
          />
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#c42444]/5 via-[#3c5c94]/5 to-[#c42444]/5 dark:from-[#c42444]/10 dark:via-[#3c5c94]/10 dark:to-[#c42444]/10"></div>
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-2xl font-bold text-black dark:text-white">Photo de profil</h3>
        {canEditPhoto && !isGoogleUser && !isEditing && (
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <CameraIcon className="w-5 h-5" />
            Changer l&apos;image de profil
          </button>
        )}
      </div>
      
      {/* Message d'erreur */}
      {uploadError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg relative z-10">
          {uploadError}
        </div>
      )}

      <div className="flex flex-col items-center space-y-6 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3c5c94]/20 via-[#c42444]/20 to-[#3c5c94]/20 dark:from-[#3c5c94]/30 dark:via-[#c42444]/30 dark:to-[#3c5c94]/30 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative h-40 w-40 rounded-full overflow-hidden ring-4 ring-[#3c5c94]/30 dark:ring-[#3c5c94]/40 transition-all duration-300 group-hover:ring-[#3c5c94]/50 dark:group-hover:ring-[#3c5c94]/60">
            <Image
              src={previewUrl || getImageUrl(photo)}
              alt={`Photo de profil de ${firstName || "Utilisateur"}`}
              width={160}
              height={160}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/user/user1.jpg';
              }}
              unoptimized={true}
              priority={true}
              loading="eager"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-white dark:bg-boxdark p-2 rounded-full shadow-lg border border-[#3c5c94]/20 dark:border-[#3c5c94]/30">
            <svg className="w-5 h-5 text-[#3c5c94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h4 className="text-xl font-bold text-black dark:text-white">
            {firstName} {lastName}
          </h4>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Membre depuis 2024</span>
          </div>
        </div>
      </div>
      
      {/* Boutons d'action en mode édition */}
      {isEditing && selectedFile && (
        <div className="flex justify-end gap-4 pt-6 relative z-10">
          <button 
            type="button" 
            onClick={handleCancel} 
            disabled={isUploading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-stroke text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XMarkIcon className="w-5 h-5" />
            Annuler
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={isUploading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <CheckIcon className="w-5 h-5" />
            )}
            {isUploading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      )}
      
      {/* Message pour les utilisateurs Google */}
      {isGoogleUser && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg relative z-10">
          <p className="text-sm">La photo de cet utilisateur Google ne peut pas être modifiée</p>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ProfilePhoto;
