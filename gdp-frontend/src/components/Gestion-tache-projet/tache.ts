export interface User {
  id: number;
  firstName: string;
  lastName: string;
  photo: string;
  email: string;
  role: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: "high" | "low";
  type: string;
  customType?: string;
  creationDate: string;
  userId: number;
  projectId: number;
  labels: number[];
  commentsCount: number;
  user: User;
} 