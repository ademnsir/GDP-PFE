import axios from 'axios';
import axiosInstance from './axiosInstance';
import { getUserData } from './authService';

const API_AFFICHAGE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`;
const API_DELETE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/remove`;
const API_CONGES = `${process.env.NEXT_PUBLIC_BACKEND_URL}/conges`;

// Instance Axios sans authentification pour les endpoints publics
const publicAxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

export enum UserRole {
  ADMIN = "ADMIN",
  DEVELOPPER = "DEVELOPPER",
  INFRA = "INFRA",
}
export enum CongeStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
export enum UserStatus {
  ACTIVE = "ACTIF",
  INACTIVE = "EN_ATTENTE",
  SUSPENDED = "SUSPENDU",
}

export interface Project {
  id: number;
  name: string;
  status: string;
  description: string;
  estimatedEndDate: Date;
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  matricule: string;
  role: UserRole;
  photo?: string;
  status: UserStatus;
  hireDate: string;
  endDate: string;
  password?: string;
  bio?: string;
  projects?: Project[];
}

export interface Conge {
  id: number;
  userId?: number;
  matricule: string;
  service: string;
  responsable: string;
  type: string;
  startDate: string;
  endDate: string;
  dateReprise: string;
  telephone: string;
  adresse: string;
  interim1?: string;
  interim2?: string;
  status: string;
}

// Récupérer tous les utilisateurs
export const fetchAllUsers = async () => {
  try {
    const response = await axiosInstance.get(`${API_AFFICHAGE}/all`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return { redirectTo403: true };
    }

    console.error('Error fetching users:', error);
    throw error;
  }
};
// Supprimer un utilisateur
export const deleteUser = async (userId: string) => {
  try {
    const response = await axiosInstance.delete(`${API_DELETE}/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    
    // Vérifier si c'est une erreur Axios
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 403) {
        throw { response: { status: 403 } };
      }
      if (status === 404) {
        throw new Error('Utilisateur non trouvé');
      }
      if (status === 401) {
        throw new Error('Non autorisé');
      }
      if (status && status >= 500) {
        throw new Error('Erreur serveur');
      }
      // Si l'erreur a une réponse mais pas de statut spécifique
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Erreur lors de la suppression');
      }
    }
    
          // Si ce n'est pas une erreur Axios ou si on n'a pas pu la traiter
      if (error.message && error.message.includes('contrainte de clé étrangère')) {
        throw new Error('Impossible de supprimer cet utilisateur car il a des données liées (congés, tâches, etc.). Veuillez d\'abord supprimer ces données.');
      }
      throw new Error('Erreur lors de la suppression de l\'utilisateur');
  }
};

// Récupérer un utilisateur par ID
export const fetchUserById = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`${API_AFFICHAGE}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    throw error;
  }
};


// Récupérer un utilisateur par matricule
export const fetchUserByMatricule = async (matricule: string) => {
  try {
    const response = await axiosInstance.get(`${API_AFFICHAGE}/matricule/${matricule}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur par matricule:', error);
    throw error;
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (userId: number, updateData: Partial<User>) => {
  try {
    // Récupérer les données de l'utilisateur connecté
    const userData = getUserData();
    if (!userData) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur essaie de mettre à jour son propre profil
    const isSelfUpdate = userData.userId === userId;

    // Si ce n'est pas une mise à jour de son propre profil, vérifier les rôles
    if (!isSelfUpdate && ![UserRole.ADMIN, UserRole.INFRA].includes(userData.role as UserRole)) {
      throw new Error('Vous n\'avez pas les permissions nécessaires pour mettre à jour ce profil');
    }

    const response = await axiosInstance.put(`${API_AFFICHAGE}/update/${userId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour effectuer cette action');
      }
      if (error.response?.status === 401) {
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
    }
    throw error;
  }
};

// Ajouter un utilisateur
export const addUser = async (userData: Partial<User>, photoFile?: File) => {
  try {
    const formData = new FormData();

    // Append user data to FormData, ensuring values are defined
    Object.keys(userData).forEach((key) => {
      const value = userData[key as keyof User];
      if (value !== undefined) {
        formData.append(key, value.toString()); // Convert to string if necessary
      }
    });

    // Append photo if provided
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    const response = await axiosInstance.post(`${API_AFFICHAGE}/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur :", error);
    throw error;
  }
};

// Récupérer les congés d'un utilisateur par matricule
export const fetchCongesByMatricule = async (matricule: string) => {
  try {
    const response = await axiosInstance.get(`/conges/matricule/${matricule}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des congés:", error);
    throw error;
  }
};

// Mettre à jour le statut d'un congé
export const updateCongeStatus = async (congeId: number, status: string) => {
  try {
    const response = await axiosInstance.put(`${API_CONGES}/update-status/${congeId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du congé:', error);
    throw error;
  }
};

// Demander la réinitialisation de mot de passe
export const requestPasswordReset = async (email: string) => {
  try {
    const response = await publicAxiosInstance.post(`${API_AFFICHAGE}/request-password-reset`, {
      email
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    throw error;
  }
};

// Réinitialiser le mot de passe
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await publicAxiosInstance.post(`${API_AFFICHAGE}/reset-password`, {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    throw error;
  }
};

// Changer le mot de passe de l'utilisateur connecté
export const changePassword = async (data: any) => {
  try {
    const response = await axiosInstance.post(`${API_AFFICHAGE}/change-password`, data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe :", error);
    throw error;
  }
};

// Mettre à jour la photo de profil d'un utilisateur
export const updateUserPhoto = async (userId: number, photoFile: File) => {
  try {
    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await axiosInstance.put(`${API_AFFICHAGE}/update-photo/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la photo :", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour effectuer cette action');
      }
      if (error.response?.status === 401) {
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw error;
  }
};
