import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

// Récupérer les notifications d’un administrateur
export const fetchAdminNotifications = async () => {
  try {
    const token = localStorage.getItem("token"); // Récupération du token
    const response = await axios.get(`${API_BASE}/notifications/admin`, {
      headers: {
        Authorization: `Bearer ${token}`, // Ajout du token dans l'en-tête
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications admin:", error);
    throw error;
  }
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (notificationId: number) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${API_BASE}/notifications/read/${notificationId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification:", error);
    throw error;
  }
};
