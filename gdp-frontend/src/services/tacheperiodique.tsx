import axios from "axios";
import axiosInstance from './axiosInstance';

const API_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/tache-periodique`;

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  photo: string;
  role: string;
}

export interface TachePeriodique {
  id?: number;
  title: string;
  description: string;
  sendDate: string;
  users: User[];
  periodicite?: string;
  heureExecution?: string;
  estActive?: boolean;
}

// Récupérer toutes les tâches périodiques
export const fetchAllTachesPeriodiques = async (): Promise<TachePeriodique[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/all`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches périodiques :", error);
    throw error;
  }
};

// Ajouter une nouvelle tâche périodique
export const addTachePeriodique = async (tache: TachePeriodique): Promise<TachePeriodique> => {
  try {
    const response = await axiosInstance.post(`${API_BASE}/add`, tache);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la tâche périodique :", error);
    throw error;
  }
};

// Mettre à jour une tâche périodique
export const updateTachePeriodique = async (
  tacheId: number,
  updateData: Partial<TachePeriodique>
): Promise<TachePeriodique> => {
  try {
    // Préparer les données pour l'envoi
    const dataToSend = {
      ...updateData,
      users: updateData.users?.map(user => user.id) // Convertir les objets User en IDs
    };

    console.log('Données envoyées au backend:', dataToSend);

    const response = await axiosInstance.put(`${API_BASE}/update/${tacheId}`, dataToSend);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche périodique :", error);
    throw error;
  }
};


// Supprimer une tâche périodique
export const deleteTachePeriodique = async (tacheId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_BASE}/delete/${tacheId}`);
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche périodique :", error);
    throw error;
  }
};


// Récupérer une tâche périodique par ID
export const fetchTachePeriodiqueById = async (tacheId: number): Promise<TachePeriodique> => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/${tacheId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la tâche périodique :", error);
    throw error;
  }
};
