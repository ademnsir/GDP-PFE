import { TaskStatus, TaskType } from "@/services/tache";

export interface Task {
  commentsCount: number;
  creationDate: string | number | Date;
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "high" | "low";
  type: TaskType;
  customType?: string;
  userId: number;
  assignedTo?: number[];
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  labels?: number[];
} 