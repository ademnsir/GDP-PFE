import axios from 'axios';
import axiosInstance from './axiosInstance';

const API_DASHBOARD = `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboard`;

export interface DashboardStats {
  projects: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    productivity: {
      completionRate: number;
      inProgressRate: number;
      toDoRate: number;
      highPriorityCompletion: number;
      mediumPriorityCompletion: number;
      lowPriorityCompletion: number;
    };
  };
  tasks: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    productivity: {
      completionRate: number;
      inProgressRate: number;
      toDoRate: number;
      highPriorityCompletion: number;
      mediumPriorityCompletion: number;
      lowPriorityCompletion: number;
    };
  };
  users: {
    total: number;
    byRole: Record<string, number>;
    productivity: Array<{
      userId: number;
      username: string;
      totalTasks: number;
      completedTasks: number;
      completionRate: number;
      averageTaskCompletionTime: number;
    }>;
  };
  conges: {
    total: number;
    byMonth: number[];
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

export const fetchDashboardStats = async (token: string): Promise<DashboardStats> => {
  try {
    const response = await axiosInstance.get(`${API_DASHBOARD}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}; 