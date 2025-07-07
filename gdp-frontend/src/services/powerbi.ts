import axios from 'axios';

const POWER_BI_API = 'https://api.powerbi.com/v1.0/myorg';

export const getEmbedToken = async (reportId: string) => {
  try {
    // This should be replaced with your actual backend endpoint
    const response = await axios.post('/api/powerbi/token', { reportId });
    return response.data.accessToken;
  } catch (error) {
    console.error('Error getting embed token:', error);
    throw error;
  }
}; 