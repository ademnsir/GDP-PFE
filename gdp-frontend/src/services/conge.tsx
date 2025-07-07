import axios from 'axios';
import axiosInstance from './axiosInstance';


const API_CONGES = `${process.env.NEXT_PUBLIC_BACKEND_URL}/conges`;


export enum CongeType {
  MALADIE = "Maladie",
  CONGE = "Congé",
  DECES = "Décès",
  MARIAGE = "Congé Mariage",
  AUTRES = "Autres",
}

export enum CongeStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface Conge {
  id: number;
  userId?: number; 
  firstName :string;
  lastName :string;
  matricule: string;
  service: string;
  responsable: string;
  type: CongeType;
  startDate: string;
  endDate: string;
  dateReprise: string;
  telephone: string;
  adresse: string;
  interim1?: string;
  interim2?: string;
  status: CongeStatus;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

//  Récupérer tous les congés
export const fetchAllConges = async (): Promise<Conge[]> => {
  try {
    const response = await axiosInstance.get(`${API_CONGES}/all`);
    return response.data.map((conge: any) => ({
      ...conge,
      startDate: new Date(conge.startDate).toISOString().split('T')[0],
      endDate: new Date(conge.endDate).toISOString().split('T')[0],
      dateReprise: new Date(conge.dateReprise).toISOString().split('T')[0],
      photo: conge.user?.photo || null,
      firstName: conge.user?.firstName || conge.firstName,
      lastName: conge.user?.lastName || conge.lastName,
      createdAt: conge.createdAt,
      updatedAt: conge.updatedAt
    }));
  } catch (error) {
    console.error('Error fetching all conges:', error);
    throw error;
  }
};



//  Ajouter un congé (avec `userId`)
export const createConge = async (
    congeData: Omit<Conge, 'id' | 'status'> & { userId: number }
  ) => {
    try {
      const formattedData = {
        ...congeData,
        startDate: new Date(congeData.startDate).toISOString().split('T')[0],
        endDate: new Date(congeData.endDate).toISOString().split('T')[0],
        dateReprise: new Date(congeData.dateReprise).toISOString().split('T')[0],
      };
  
      const response = await axiosInstance.post(`${API_CONGES}/add`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du congé:', error);
      throw error;
    }
  };


  
  export const downloadCongePDF = async (id: number) => {
    if (!id || isNaN(id)) {
      console.error("❌ ID de congé invalide !");
      return;
    }
  
    try {
      const response = await axiosInstance.get(`/conges/download-pdf/${id}`, {
        responseType: 'blob',
      });
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `demande_conge_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
  
    } catch (error) {
      console.error("❌ Erreur lors du téléchargement du PDF :", error);
    }
  };

// Mettre à jour le statut d'un congé
export const updateCongeStatus = async (id: number, status: CongeStatus): Promise<Conge> => {
  try {
    const response = await axiosInstance.put(`${API_CONGES}/update-status/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating conge status:', error);
    throw error;
  }
};

// Annuler un congé (seulement pour l'utilisateur propriétaire)
export const cancelConge = async (id: number): Promise<void> => {
  try {
    const response = await axiosInstance.delete(`${API_CONGES}/cancel/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error canceling conge:', error);
    throw error;
  }
};

// Récupérer les congés par matricule
export const fetchCongesByMatricule = async (matricule: string): Promise<Conge[]> => {
  try {
    const response = await axiosInstance.get(`${API_CONGES}/matricule/${matricule}`);
    return response.data.map((conge: any) => ({
      ...conge,
      type: conge.type as CongeType,
      status: conge.status as CongeStatus,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des congés par matricule:', error);
    throw error;
  }
};

// Récupérer tous les congés par matricule (tous statuts confondus)
export const fetchAllCongesByMatricule = async (matricule: string): Promise<Conge[]> => {
  try {
    const response = await axiosInstance.get(`${API_CONGES}/all/matricule/${matricule}`);
    return response.data.map((conge: any) => ({
      ...conge,
      type: conge.type as CongeType,
      status: conge.status as CongeStatus,
      photo: conge.user?.photo || null,
      firstName: conge.user?.firstName || conge.firstName,
      lastName: conge.user?.lastName || conge.lastName,
      createdAt: conge.createdAt,
      updatedAt: conge.updatedAt
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les congés par matricule:', error);
    throw error;
  }
};

// Récupérer les congés en attente
export const fetchPendingConges = async (): Promise<Conge[]> => {
  try {
    const response = await axiosInstance.get(`${API_CONGES}/pending/all`);
    return response.data.map((conge: any) => ({
      ...conge,
      type: conge.type as CongeType,
      status: conge.status as CongeStatus,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des congés en attente:', error);
    throw error;
  }
};

// Récupérer les congés d'un utilisateur spécifique
export const fetchUserConges = async (userId: number): Promise<Conge[]> => {
  try {
    const response = await axiosInstance.get(`${API_CONGES}/user/${userId}`);
    return response.data.map((conge: any) => ({
      ...conge,
      type: conge.type as CongeType,
      status: conge.status as CongeStatus,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des congés de l\'utilisateur:', error);
    throw error;
  }
};

// Récupérer les congés par mois
export const fetchCongesByMonth = async (month: string): Promise<Conge[]> => {
  try {
    const response = await axiosInstance.get(`${API_CONGES}/month/${month}`);
    return response.data.map((conge: any) => ({
      ...conge,
      type: conge.type as CongeType,
      status: conge.status as CongeStatus,
      photo: conge.user?.photo || null,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des congés par mois:', error);
    throw error;
  }
};
