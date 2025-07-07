import axios from 'axios';
import { getToken } from './authService';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 secondes de timeout
});

// Intercepteur pour ajouter automatiquement le token à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log de la requête
    console.log('Requête Axios:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      baseURL: config.baseURL
    });
    
    return config;
  },
  (error) => {
    console.error('Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
axiosInstance.interceptors.response.use(
  (response) => {
    // Log de la réponse
    console.log('Réponse Axios:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log détaillé de l'erreur
    const errorDetails = {
      message: error.message || 'Erreur inconnue',
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'Pas de réponse',
      request: error.request ? 'Requête effectuée' : 'Pas de requête',
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers
      } : 'Pas de configuration'
    };
    
    console.error('Erreur Axios:', errorDetails);

    if (error.response?.status === 401) {
      // Vérifier si nous sommes sur une page publique
      const currentPath = window.location.pathname;
      const publicPaths = ['/signin', '/SignIn', '/ResetPassword', '/reset-password', '/reset-password-token'];
      
      if (!publicPaths.includes(currentPath)) {
        // Si le token est invalide ou expiré et que nous ne sommes pas sur une page publique, on le supprime
        localStorage.removeItem('token');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
