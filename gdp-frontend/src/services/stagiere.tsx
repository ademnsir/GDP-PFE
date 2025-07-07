import axios from "axios";
import axiosInstance from './axiosInstance';
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/stagiaires`;

export interface Stagiaire {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  specialite: string;
  dureeStage: number;
  dateDebut: string;
  dateFin: string;
  encadrant: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null; 
  photo: string;
}


export interface CreateStagiaireDto {
  firstName: string;
  lastName: string;
  email: string;
  specialite: string;
  dureeStage: number;
  dateDebut: string;
  dateFin: string;
  encadrantId: number | null;
  photo: string;
}

// Récupérer tous les stagiaires
export const fetchAllStagiaires = async (): Promise<Stagiaire[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/all`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des stagiaires :", error);
    throw error;
  }
};

// Ajouter un stagiaire
export const addStagiaire = async (stagiaireData: CreateStagiaireDto) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/add`, stagiaireData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout du stagiaire :", error);
    throw error;
  }
};

// Supprimer un stagiaire
export const deleteStagiaire = async (stagiaireId: number) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/remove/${stagiaireId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du stagiaire :", error);
    throw error;
  }
};

// Récupérer un stagiaire par ID
export const fetchStagiaireById = async (stagiaireId: number) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/${stagiaireId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du stagiaire :", error);
    throw error;
  }
};

// Mettre à jour un stagiaire
export const updateStagiaire = async (stagiaireId: number, stagiaireData: Partial<CreateStagiaireDto>) => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/update/${stagiaireId}`, stagiaireData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du stagiaire :", error);
    throw error;
  }
};
