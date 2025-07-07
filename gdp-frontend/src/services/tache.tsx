import axios from 'axios';
import axiosInstance from './axiosInstance';
const API_TASKS = `${process.env.NEXT_PUBLIC_BACKEND_URL}/taches`;

export type TaskStatus = "To Do" | "In Progress" | "Done";

export enum TaskType {
  Bug = "Bug",
  Fix = "Fix",
  Feature = "Feature",
  Improvement = "Improvement",
  Task = "Task",
  Refactor = "Refactor",
  Docs = "Docs",
  Test = "Test",
  Research = "Research",
  Security = "Security",
  Performance = "Performance",
  Custom = "Custom",
  
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  photo?: string;
  email?: string;
  role?: string;
}

export interface Task {
  commentsCount: number;
  creationDate: string | number | Date;
  id: number;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "high" | "low";
  type: TaskType;
  customType?: string;
  userId: number;
  labels?: number[];
  position?: number;
  user?: User;
}

// Fetch all tasks for a project
export const fetchTasksByProjectId = async (projectId: number): Promise<Task[]> => {
  try {
    const response = await axiosInstance.get(`${API_TASKS}/project/${projectId}`, {
      params: {
        include: 'user'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Add a task to a project
export const addTask = async (taskData: {
  title: string;
  description: string;
  status?: "To Do" | "In Progress" | "Done";
  priority?: "high" | "low";
  type?: string;
  customType?: string;
  projectId: number;
  userId: number;
  labels?: number[];
}) => {
  try {
    // Format the data to match the backend expectations
    const formattedData = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || "To Do",
      priority: taskData.priority || "low",
      type: taskData.type || "Task",
      customType: taskData.customType,
      projectId: taskData.projectId,
      userId: taskData.userId,
      labels: taskData.labels
    };

    const response = await axiosInstance.post(`${API_TASKS}/add`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId: number, updatedData: any) => {
  try {
    console.log("Calling API:", `${API_TASKS}/update/${taskId}`);
    console.log("Payload:", updatedData);

    const response = await axiosInstance.patch(`${API_TASKS}/update/${taskId}`, {
      ...updatedData,
      include: 'user'
    });
    
    if (!response.data.user) {
      console.warn('User data missing in response, fetching complete task data...');
      const completeTask = await fetchTasksByProjectId(updatedData.projectId);
      const updatedTask = completeTask.find(task => task.id === taskId);
      if (updatedTask) {
        return updatedTask;
      }
    }
    
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId: number) => {
  try {
    console.log("Deleting task with ID:", taskId);
    const response = await axiosInstance.delete(`${API_TASKS}/delete/${taskId}`);
    console.log("Delete response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    throw error;
  }
};
