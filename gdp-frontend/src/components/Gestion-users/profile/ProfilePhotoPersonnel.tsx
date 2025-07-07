"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CameraIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import { updateUserPhoto } from "@/services/user";
import { useAuth } from "@/context/AuthContext";

interface ProfilePhotoPersonnelProps {
  photo?: string;
  firstName?: string;
  lastName?: string;
  userId?: number;
  onPhotoUpdate?: (newPhotoPath: string) => void;
}

const ProfilePhotoPersonnel = ({ photo, firstName, lastName, userId, onPhotoUpdate }: ProfilePhotoPersonnelProps) => {
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
      setUploadError("La taille de l'image ne doit pas dépasser 5MB");
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

  // Vérifier si l'utilisateur peut modifier sa propre photo
  const canEditPhoto = userRole === 'ADMIN' || userRole === 'INFRA' || userRole === 'DEVELOPPER';
  const isGoogleUser = photo?.includes('googleusercontent.com');

  return (
    <div className="relative">
      {/* Profile Picture */}
      <div className="relative group">
        <div className="w-20 h-20 rounded-full overflow-hidden ring-3 ring-primary/20 shadow-md">
          <Image
            src={previewUrl || getImageUrl(photo)}
            width={80}
            height={80}
            className="object-cover w-full h-full"
            alt="User profile"
            unoptimized={true}
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/user/user1.jpg'; }}
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-boxdark"></div>
        
        {/* Bouton de modification de photo */}
        {canEditPhoto && !isGoogleUser && !isEditing && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEditClick}
            className="absolute -top-1 -right-1 p-1.5 bg-primary text-white rounded-full hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl"
            title="Modifier la photo de profil"
          >
            <CameraIcon className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Message d'erreur */}
      {uploadError && (
        <div className="absolute top-24 left-0 right-0 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs z-10">
          {uploadError}
        </div>
      )}

      {/* Boutons d'action en mode édition */}
      {isEditing && selectedFile && (
        <div className="absolute top-24 left-0 right-0 flex justify-center gap-2 z-10">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button" 
            onClick={handleCancel} 
            disabled={isUploading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stroke text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            <XMarkIcon className="w-3 h-3" />
            Annuler
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button" 
            onClick={handleSave} 
            disabled={isUploading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              <CheckIcon className="w-3 h-3" />
            )}
            {isUploading ? '...' : 'Enregistrer'}
          </motion.button>
        </div>
      )}
      
      {/* Message pour les utilisateurs Google */}
      {isGoogleUser && (
        <div className="absolute top-24 left-0 right-0 p-2 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-xs z-10">
          <p>La photo de cet utilisateur Google ne peut pas être modifiée</p>
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

export default ProfilePhotoPersonnel; 