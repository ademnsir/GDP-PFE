import axios from 'axios';
import axiosInstance from './axiosInstance';
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`;

interface DecodedToken {
  sub: string;
  firstName: string;
  lastName: string;
  role: string;
  photo?: string;
  matricule: string;
  userId: number;
  email: string;
}

// Fonction pour récupérer les données de l'utilisateur à partir du token
export const getUserData = (): DecodedToken | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserRole = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    console.error("Erreur de décodage du JWT :", error);
    return null;
  }
};

// Fonction de connexion (signin)
export const loginUser = async (matricule: string, password: string) => {
  try {
    console.log('Tentative de connexion avec matricule:', matricule);

    if (!matricule || !password) {
      console.log('Données de connexion manquantes');
      throw new Error('Matricule et mot de passe requis');
    }

    console.log('Envoi de la requête de connexion...');
    const response = await axiosInstance.post('/auth/signin', { matricule, password });
    console.log('Réponse reçue:', response.status);

    const { access_token } = response.data;
    if (!access_token) {
      console.log('Token d\'accès non reçu dans la réponse');
      throw new Error('Token d\'accès non reçu');
    }

    console.log('Token reçu, stockage dans le localStorage');
    localStorage.setItem('token', access_token);
    return response.data;
  } catch (error: any) {
    // Log détaillé de l'erreur
    console.error('Erreur détaillée lors de la connexion:', {
      error: error,
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : 'Pas de réponse',
      request: error.request ? {
        method: error.request.method,
        url: error.request.url,
        headers: error.request.headers
      } : 'Pas de requête',
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        baseURL: error.config.baseURL
      } : 'Pas de configuration'
    });
    
    if (axios.isAxiosError(error)) {
      // Erreur réseau
      if (!error.response) {
        console.error('Erreur réseau:', error.message);
        throw new Error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.');
      }

      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      const errorMessage = error.response.data?.error || message;

      switch (status) {
        case 400:
          throw new Error('Matricule et mot de passe requis');
        case 401:
          throw new Error('Matricule ou mot de passe incorrect');
        case 403:
          if (errorMessage?.includes('inactif') || errorMessage?.includes('inactive')) {
            throw new Error('Votre compte n\'est pas actif. Veuillez contacter l\'administrateur.');
          }
          throw new Error('Accès refusé. Veuillez contacter l\'administrateur.');
        case 404:
          throw new Error('Service d\'authentification non trouvé');
        case 500:
          throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
        default:
          throw new Error(errorMessage || 'Erreur lors de la connexion');
      }
    }
    
    // Si ce n'est pas une erreur Axios
    throw new Error(error.message || 'Une erreur inattendue est survenue');
  }
};

// Fonction pour l'authentification Google
export const loginWithGoogle = async () => {
  try {
    // Rediriger vers la page de connexion Google
    window.location.href = `${API_BASE_URL}/google`;
  } catch (error) {
    console.error('Erreur lors de la connexion avec Google :', error);
    throw error;
  }
};

// Fonction pour gérer le callback de l'authentification Google
export const handleGoogleCallback = async (): Promise<boolean> => {
  try {
    // Récupérer le code d'autorisation depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('Erreur lors de l\'authentification Google:', error);
      return false;
    }

    if (!code) {
      console.error('Code d\'autorisation non trouvé dans l\'URL');
      return false;
    }

    // Échanger le code contre un token
    const response = await axiosInstance.post('/auth/google/callback', { code });
    
    const { access_token } = response.data;
    if (!access_token) {
      console.error('Token d\'accès non reçu dans la réponse');
      return false;
    }

    // Stocker le token
    localStorage.setItem('token', access_token);
    console.log('Authentification Google réussie, token stocké');
    
    return true;
  } catch (error: any) {
    console.error('Erreur lors du callback Google:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      switch (status) {
        case 400:
          console.error('Requête invalide:', message);
          break;
        case 401:
          console.error('Authentification échouée:', message);
          break;
        case 500:
          console.error('Erreur serveur:', message);
          break;
        default:
          console.error('Erreur inattendue:', message);
      }
    }
    
    return false;
  }
};

// Fonction pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found in localStorage');
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.exp) {
      console.log('Invalid token structure');
      return false;
    }
    const isValid = decoded.exp * 1000 > Date.now();
    console.log('Token validation result:', isValid, 'Token:', token);
    return isValid;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// Fonction pour récupérer le token stocké
export const getToken = () => {
  return localStorage.getItem('token');
};

// Fonction pour se déconnecter
export const logoutUser = () => {
  localStorage.removeItem('token');
};



