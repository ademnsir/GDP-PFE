import axios from 'axios';
import axiosInstance from './axiosInstance';
import { User } from './user';
import { getUserData } from './authService';

const API_PROJECTS = `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects`;
const API_CHECKLISTS = `${process.env.NEXT_PUBLIC_BACKEND_URL}/checklists`;
const API_TECHNOLOGY = `${process.env.NEXT_PUBLIC_BACKEND_URL}/technology`;
const API_ENVIRONNEMENTS = `${process.env.NEXT_PUBLIC_BACKEND_URL}/environnements`;

export interface Project {
  id: number;
  name: string;
  status: string;
  description: string;
  startDate: Date;
  estimatedEndDate: Date;
  priorite: string;
  etat: string;
  linkprojet?: string;
  users: User[];
  livrables: Livrable[];
  checklists: Checklist[];
  environnements: Environnement[]; // Relation with environnements
  tasks?: { id: number; status: string }[];
}

export interface Technologie {
  id: number;
  label: string;
  description: string;
  version: string;
  language: string;
}

export interface Livrable {
  id: number;
  label: string;
  description: string;
  type: string;
  technologies: Technologie[];
}

export interface Checklist {
  id?: number;
  projectId: number;
  spec?: string;
  frs?: string;
  lienGitFrontend?: string;
  lienGitBackend?: string;
}

export interface Environnement {
  id?: number;
  projectId: number;
  nomServeur: string;
  systemeExploitation: string;
  ipServeur: string;
  port: number;
  type: string;
  Ptype: string; 
  componentType: string; 
  cpu: string;
  ram: string;
  stockage: string;
  logicielsInstalled: string[];
  nomUtilisateur: string; 
  motDePasse: string;  
}


// Fetch all projects
export const fetchAllProjects = async (): Promise<Project[]> => {
  try {
    const response = await axiosInstance.get(`${API_PROJECTS}/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Fetch project by ID
export const fetchProjectById = async (projectId: number): Promise<Project> => {
  try {
    const response = await axiosInstance.get(`${API_PROJECTS}/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

// Add project
export const createProject = async (projectData: any) => {
  try {
    const response = await axiosInstance.post(`${API_PROJECTS}/add`, projectData);
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

// Assign users to a project by email
export const assignUsersByEmail = async (projectId: number, emails: string[], modalType: string) => {
  try {
    const response = await axiosInstance.put(`${API_PROJECTS}/assign-users-by-email/${projectId}`, {
      emails,
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning users by email:', error);
    throw error;
  }
};

// Fetch Technology Latest Version
export const fetchTechnologyLatestVersion = async (technologyName: string): Promise<string | null> => {
  try {
    const response = await axiosInstance.get(`${API_TECHNOLOGY}/version/${technologyName}`);
    return response.data.latestVersion || null;
  } catch (error) {
    console.error(`Error fetching latest version for ${technologyName}:`, error);
    return null;
  }
};

// Delete project
export const deleteProject = async (projectId: number) => {
  if (!projectId) {
    throw new Error('ID du projet manquant');
  }

  try {
    // Vérifier si l'utilisateur est admin avant d'envoyer la requête
    const userData = getUserData();
    if (!userData || userData.role !== "ADMIN") {
      throw new Error('Seuls les administrateurs peuvent supprimer un projet');
    }

    // Log de la requête
    console.log('Envoi de la requête de suppression:', {
      url: `${API_PROJECTS}/remove/${projectId}`,
      method: 'DELETE',
      headers: axiosInstance.defaults.headers,
      timestamp: new Date().toISOString()
    });

    const response = await axiosInstance.delete(`${API_PROJECTS}/remove/${projectId}`);
    
    // Vérifier si la réponse est valide
    if (!response) {
      throw new Error('Pas de réponse du serveur');
    }

    // Log de la réponse
    console.log('Réponse du serveur:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      timestamp: new Date().toISOString()
    });

    // Vérifier si la suppression a réussi
    if (response.status === 200 || response.status === 204) {
      return { success: true, message: 'Projet supprimé avec succès' };
    }

    return response.data;
  } catch (error: any) {
    // Vérifier si c'est une erreur Axios
    if (axios.isAxiosError(error)) {
      // Log détaillé pour le débogage
      console.error('Erreur Axios lors de la suppression:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          baseURL: error.config?.baseURL
        },
        timestamp: new Date().toISOString()
      });

      // Gérer les différents codes d'erreur
      if (error.response?.status === 403) {
        throw new Error('Seuls les administrateurs peuvent supprimer un projet');
      }
      if (error.response?.status === 404) {
        throw new Error('Le projet que vous essayez de supprimer n\'existe pas');
      }
      if (error.response?.status === 500) {
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Une erreur est survenue sur le serveur';
        console.error('Erreur serveur détaillée:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          timestamp: new Date().toISOString()
        });
        throw new Error(errorMessage);
      }
      if (!error.response) {
        throw new Error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion');
      }
      throw new Error(error.response.data?.error || error.response.data?.message || 'Une erreur est survenue lors de la suppression du projet');
    }

    // Si ce n'est pas une erreur Axios
    console.error('Erreur inattendue lors de la suppression:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    });
    throw new Error('Une erreur inattendue est survenue lors de la suppression du projet');
  }
};

// Add checklist to a project
export const addChecklistToProject = async (checklistData: Omit<Checklist, 'id'> & { projectId: number }) => {
  if (!checklistData.projectId) {
    console.error('Error: projectId is missing in checklistData', checklistData);
    throw new Error('Le projectId est requis pour ajouter une checklist.');
  }

  try {
    const response = await axiosInstance.post(`${API_CHECKLISTS}/add`, checklistData);
    return response.data;
  } catch (error) {
    console.error('Error adding checklist:', error);
    throw error;
  }
};

// Update checklist
export const updateChecklist = async (checklistId: number, checklistData: Checklist) => {
  const safeChecklistData = {
    ...checklistData,
    spec: checklistData.spec ?? "",
    frs: checklistData.frs ?? "",
    lienGitFrontend: checklistData.lienGitFrontend ?? "",
    lienGitBackend: checklistData.lienGitBackend ?? "",
  };

  try {
    const response = await axiosInstance.put(`${API_CHECKLISTS}/update/${checklistId}`, safeChecklistData);
    return response.data;
  } catch (error) {
    console.error('Error updating checklist:', error);
    throw error;
  }
};

// Delete checklist
export const deleteChecklist = async (checklistId: number) => {
  try {
    const response = await axiosInstance.delete(`${API_CHECKLISTS}/remove/${checklistId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting checklist:', error);
    throw error;
  }
};

// Fetch all checklists by project ID
export const fetchAllChecklistsByProjectId = async (projectId: number): Promise<Checklist[]> => {
  try {
    const response = await axiosInstance.get(`${API_CHECKLISTS}/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching checklists:', error);
    throw error;
  }
};

// Add environnement to a project
export const addEnvironnementToProject = async (environnementData: Omit<Environnement, 'id'> & { projectId: number }) => {
  if (!environnementData.projectId || isNaN(environnementData.projectId)) {
    throw new Error('Le projectId est invalide.');
  }

  try {
    const response = await axiosInstance.post(`${API_ENVIRONNEMENTS}/add`, environnementData);
    return response.data;
  } catch (error) {
    console.error('Error adding environnement:', error);
    throw error;
  }
};

// Update environnement
export const updateEnvironnement = async (environnementId: number, environnementData: Environnement) => {
  try {
    const response = await axiosInstance.put(`${API_ENVIRONNEMENTS}/update/${environnementId}`, environnementData);
    return response.data;
  } catch (error) {
    console.error('Error updating environnement:', error);
    throw error;
  }
};

// Delete environnement
export const deleteEnvironnement = async (environnementId: number) => {
  try {
    const response = await axiosInstance.delete(`${API_ENVIRONNEMENTS}/remove/${environnementId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting environnement:', error);
    throw error;
  }
};

// Fetch all environnements by project ID
export const fetchAllEnvironnementsByProjectId = async (projectId: number): Promise<Environnement[]> => {
  try {
    const response = await axiosInstance.get(`${API_ENVIRONNEMENTS}/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching environnements:', error);
    throw error;
  }
};

export const exportEnvironnementsToExcel = async () => {
  try {
    const response = await axiosInstance.get(`${API_ENVIRONNEMENTS}/export`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'environnements.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Erreur lors de l\'export Excel :', error);
    throw error;
  }
};

// Update project
export const updateProject = async (projectId: number, projectData: any) => {
  try {
    const response = await axiosInstance.put(`${API_PROJECTS}/update/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

