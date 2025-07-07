"use client";

import React, { useEffect, useState, useContext, useMemo } from "react";
import { getUserData } from "@/services/authService";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { fetchTasksByProjectId, addTask, updateTask, deleteTask, TaskType, Task } from "@/services/tache";
import { useParams } from "next/navigation";
import SprintAnalysis from "@/components/Gestion-tache-projet/SprintAnalysis";
import { fetchProjectById, Project } from "@/services/Project";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TaskColumn from "@/components/Gestion-tache-projet/TaskColumns";

import { fetchUserById } from "@/services/user";
import { FaLink } from 'react-icons/fa';
import { FavoritesContext } from "@/context/FavoritesContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX, FiTrash2, FiMenu } from "react-icons/fi";

import Menu from "@/components/Gestion-tache-projet/Menu";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

type TaskStatus = "To Do" | "In Progress" | "Done";

interface AddTaskData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: "high" | "low";
  type: string;
  customType?: string;
  labels: number[];
}

const SuccessNotification = ({ message, onClose, type = 'success' }: { message: string; onClose: () => void; type?: 'success' | 'error' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className={`${
        type === 'success' 
          ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
          : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
      } rounded-lg shadow-lg p-4 flex items-center gap-3`}>
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full ${
            type === 'success' 
              ? 'bg-green-100 dark:bg-green-800' 
              : 'bg-red-100 dark:bg-red-800'
          } flex items-center justify-center`}>
            {type === 'success' ? (
              <FiCheck className="w-5 h-5 text-green-600 dark:text-green-300" />
            ) : (
              <FiTrash2 className="w-5 h-5 text-red-600 dark:text-red-300" />
            )}
          </div>
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            type === 'success' 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-red-800 dark:text-red-200'
          }`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`${
            type === 'success' 
              ? 'text-green-600 dark:text-green-300 hover:text-green-700 dark:hover:text-green-200' 
              : 'text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200'
          } transition-colors`}
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

const TaskPage: React.FC = () => {
  const params = useParams();
  const projectId = Number(params.id);
  const router = useRouter();
  const { notifyingFavorites, setNotifyingFavorites } = useContext(FavoritesContext);
  const [isOpen, setIsOpen] = useState(false);

  const [tasks, setTasks] = useState<Record<TaskStatus, Task[]>>(() => {
    if (typeof window !== 'undefined') {
      const storedTasks = localStorage.getItem(`tasks_${projectId}`);
      return storedTasks ? JSON.parse(storedTasks) : {
        "To Do": [],
        "In Progress": [],
        "Done": [],
      };
    }
    return {
      "To Do": [],
      "In Progress": [],
      "Done": [],
    };
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<TaskStatus | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [userPhotos, setUserPhotos] = useState<Record<number, string>>({});
  const [archivedTasks, setArchivedTasks] = useState<Task[]>(() => {
    const userData = getUserData();
    const userId = userData?.userId;
    const storedTasks = localStorage.getItem(`archivedTasks_${userId}`);
    return storedTasks ? JSON.parse(storedTasks) : [];
  });

  const storedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
  const [theme, setTheme] = useState<"blue" | "gray" | "dark">(storedTheme as "blue" | "gray" | "dark" || "blue");

  const themes = useMemo(() => ({
    blue: { backgroundColor: "#dde4ed", color: "#2560a0" },
    gray: { backgroundColor: "#f0f0f0", color: "#333" },
    dark: { backgroundColor: "#20242c", color: "#ffffff" },
  }), []);

  useEffect(() => {
    document.body.style.backgroundColor = themes[theme].backgroundColor;
    document.body.style.color = themes[theme].color;
    localStorage.setItem("theme", theme);
  }, [theme, themes]);

  useEffect(() => {
    const getProject = async () => {
      try {
        const projectData = await fetchProjectById(projectId);
        setProject(projectData);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to fetch project.");
      }
    };
    getProject();
  }, [projectId]);

  useEffect(() => {
    const getTasks = async () => {
      try {
        const data = await fetchTasksByProjectId(projectId);

        // Filter out archived tasks from the fetched tasks
        const activeTasks = data.filter(task => !archivedTasks.some(archivedTask => archivedTask.id === task.id));

        console.log("Fetched tasks with labels:", activeTasks);
        
        const groupedTasks = activeTasks.reduce(
          (acc: Record<TaskStatus, Task[]>, task: Task) => {
            const status = task.status as TaskStatus;
            acc[status] = acc[status] || [];
            acc[status].push(task);
            return acc;
          },
          { "To Do": [], "In Progress": [], "Done": [] }
        );
        setTasks(groupedTasks);

        // Récupérer les photos des utilisateurs qui ont créé les tâches
        const userIds = [...new Set(data.map(task => task.userId).filter(userId => userId !== null && userId !== undefined))];
        const photos = await Promise.all(userIds.map(userId => fetchUserPhoto(userId)));
        const userPhotosObj = photos.reduce((acc, photo, index) => {
          acc[userIds[index]] = photo;
          return acc;
        }, {} as Record<number, string>);

        setUserPhotos(userPhotosObj);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to fetch tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    getTasks();
  }, [projectId, archivedTasks]);

  const fetchUserPhoto = async (userId: number): Promise<string> => {
    try {
      if (!userId || isNaN(userId)) {
        console.warn("Invalid user ID:", userId);
        return "/images/user/user1.jpg";
      }
      
      const user = await fetchUserById(userId.toString());
      if (!user || !user.photo) {
        console.warn(`No photo found for user ${userId}`);
        return "/images/user/user1.jpg";
      }

      const photoUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.photo}`;
      console.log(`Fetched photo URL for user ${userId}:`, photoUrl);
      return photoUrl;
    } catch (error) {
      console.error(`Error fetching photo for user ${userId}:`, error);
      return "/images/user/user1.jpg";
    }
  };

  const handleAddTask = async (task: AddTaskData) => {
    try {
      const userData = getUserData();
      const userId = userData?.userId;

      if (!userId) {
        throw new Error("User ID is not available.");
      }

      // Créer d'abord la tâche dans le backend
      const taskData = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        type: task.type as TaskType,
        customType: task.type === "Custom" ? task.customType : undefined,
        userId: userId,
        projectId: projectId,
        labels: task.labels && task.labels.length > 0 ? task.labels : []
      };

      console.log("Sending task data with labels:", taskData);

      // Attendre la réponse du backend
      const response = await addTask(taskData);
      console.log("Backend response:", response);

      // Utiliser la tâche retournée par le backend
      const newTask: Task = {
        ...response,
        creationDate: new Date().toISOString(),
        commentsCount: 0,
        labels: task.labels && task.labels.length > 0 ? task.labels : []
      };

      console.log("Final newTask with labels:", newTask);

      // Mettre à jour l'état local avec la tâche du backend
      setTasks(prevTasks => {
        const updatedTasks = {
          ...prevTasks,
          [task.status]: [...prevTasks[task.status], newTask]
        };
        
        // Sauvegarder dans localStorage
        localStorage.setItem(`tasks_${projectId}`, JSON.stringify(updatedTasks));
        
        return updatedTasks;
      });

      setActiveColumn(null);
    } catch (error) {
      console.error("Error adding task:", error);
      setError("Failed to add task. Please try again.");
    }
  };

  const [successMessage, setSuccessMessage] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: "",
    type: 'success'
  });

  const handleDeleteTask = async (taskId: number, status: TaskStatus) => {
    try {
      await deleteTask(taskId);
      setTasks((prevTasks) => ({
        ...prevTasks,
        [status]: prevTasks[status].filter((task) => task.id !== taskId),
      }));
      setSuccessMessage({
        show: true,
        message: "La tâche a été supprimée avec succès",
        type: 'success'
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "", type: 'success' });
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);
      setSuccessMessage({
        show: true,
        message: "Erreur lors de la suppression de la tâche",
        type: 'error'
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "", type: 'success' });
      }, 3000);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      // Préparer les données pour la mise à jour
      const taskData = {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        type: updatedTask.type,
        customType: updatedTask.customType,
        userId: updatedTask.userId,
        projectId: projectId,
        labels: updatedTask.labels && updatedTask.labels.length > 0 ? updatedTask.labels : []
      };

      // Mettre à jour dans le backend
      const updatedTaskData = await updateTask(updatedTask.id, taskData);
      
      // Mettre à jour l'état local
      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };
        
        // Supprimer la tâche de son ancienne colonne
        Object.keys(newTasks).forEach((status) => {
          newTasks[status as TaskStatus] = newTasks[status as TaskStatus].filter(
            (task) => task.id !== updatedTaskData.id
          );
        });
        
        // Ajouter la tâche à sa nouvelle colonne
        newTasks[updatedTaskData.status as TaskStatus].push(updatedTaskData);
        
        // Sauvegarder dans localStorage
        localStorage.setItem(`tasks_${projectId}`, JSON.stringify(newTasks));
        
        return newTasks;
      });
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  const handleArchiveTask = (task: Task) => {
    const userData = getUserData();
    const userId = userData?.userId;
    const updatedArchivedTasks = [...archivedTasks, task];
    setArchivedTasks(updatedArchivedTasks);
    localStorage.setItem(`archivedTasks_${userId}`, JSON.stringify(updatedArchivedTasks));
    setTasks((prevTasks) => ({
      ...prevTasks,
      [task.status]: prevTasks[task.status].filter((t) => t.id !== task.id),
    }));
    setSuccessMessage({
      show: true,
      message: "Tâche archivée avec succès",
      type: 'success'
    });
    setTimeout(() => {
      setSuccessMessage({ show: false, message: "", type: 'success' });
    }, 3000);
  };

  const handleRestoreTask = (task: Task) => {
    const userData = getUserData();
    const userId = userData?.userId;
    const updatedArchivedTasks = archivedTasks.filter((t) => t.id !== task.id);
    setArchivedTasks(updatedArchivedTasks);
    localStorage.setItem(`archivedTasks_${userId}`, JSON.stringify(updatedArchivedTasks));
    setTasks((prevTasks) => ({
      ...prevTasks,
      [task.status]: [...prevTasks[task.status], task],
    }));
    setSuccessMessage({
      show: true,
      message: "Tâche restaurée avec succès",
      type: 'success'
    });
    setTimeout(() => {
      setSuccessMessage({ show: false, message: "", type: 'success' });
    }, 3000);
  };

  const totalTasks = Object.values(tasks).reduce((acc, taskList) => acc + taskList.length, 0) + archivedTasks.length;

  // Define available labels and selected labels
  const [availableLabels, setAvailableLabels] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedLabels = localStorage.getItem('availableLabels');
      return storedLabels ? JSON.parse(storedLabels) : [
        { id: 1, color: "bg-red-200", name: "Urgent" },
        { id: 2, color: "bg-blue-200", name: "Important" }
      ];
    }
    return [
      { id: 1, color: "bg-red-200", name: "Urgent" },
      { id: 2, color: "bg-blue-200", name: "Important" }
    ];
  });

  const [selectedLabels, setSelectedLabels] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const storedSelectedLabels = localStorage.getItem('selectedLabels');
      return storedSelectedLabels ? JSON.parse(storedSelectedLabels) : [1, 2];
    }
    return [1, 2];
  });

  // Fonction pour ajouter une nouvelle étiquette
  const handleAddLabel = (labels: { id: number; color: string; name: string }[]) => {
    setAvailableLabels(labels);
    localStorage.setItem('availableLabels', JSON.stringify(labels));
  };

  // Fonction pour gérer la sélection des étiquettes
  const toggleLabelSelection = (labels: number[]) => {
    setSelectedLabels(labels);
    localStorage.setItem('selectedLabels', JSON.stringify(labels));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeStatus, setActiveStatus] = useState<TaskStatus | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const [taskId, status] = event.active.id.toString().split('-');
    const task = tasks[status as TaskStatus]?.find(t => t.id.toString() === taskId);
    if (task) {
      setActiveTask(task);
      setActiveStatus(status as TaskStatus);
    }
  };

  const handleReorderTasks = async (status: TaskStatus, newOrder: Task[]) => {
    try {
      // Mettre à jour l'état local immédiatement
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        newTasks[status] = newOrder;
        localStorage.setItem(`tasks_${projectId}`, JSON.stringify(newTasks));
        return newTasks;
      });

      // Mettre à jour chaque tâche dans le backend avec sa nouvelle position
      const updatePromises = newOrder.map((task, index) => {
        const taskData = {
          ...task,
          position: index,
          projectId: projectId,
          userId: task.userId,
          status: status
        };
        return updateTask(task.id, taskData);
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error reordering tasks:", error);
      // Revenir à l'état précédent en cas d'erreur
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        newTasks[status] = tasks[status];
        localStorage.setItem(`tasks_${projectId}`, JSON.stringify(newTasks));
        return newTasks;
      });
      throw error;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    setActiveStatus(null);
    const { active, over } = event;
    
    if (!over) return;

    let sourceStatus: TaskStatus | undefined;
    let destinationStatus: TaskStatus | undefined;
    let taskId: string | undefined;
    let taskToMove: Task | undefined;

    try {
      // Extraire l'ID de la tâche et le statut source
      [taskId, sourceStatus] = active.id.toString().split('-') as [string, TaskStatus];
      
      // Déterminer le statut de destination
      const validStatuses: TaskStatus[] = ["To Do", "In Progress", "Done"];
      
      if (validStatuses.includes(over.id.toString() as TaskStatus)) {
        destinationStatus = over.id.toString() as TaskStatus;
      } else {
        const [, taskStatus] = over.id.toString().split('-');
        if (!validStatuses.includes(taskStatus as TaskStatus)) {
          console.error('Invalid destination status:', over.id.toString());
          return;
        }
        destinationStatus = taskStatus as TaskStatus;
      }

      if (!sourceStatus || !validStatuses.includes(sourceStatus) || !tasks[sourceStatus]) {
        console.error('Invalid source status or tasks not found:', sourceStatus);
        return;
      }

      // Si la tâche est déposée dans la même colonne, c'est un réarrangement
      if (sourceStatus === destinationStatus) {
        const oldIndex = tasks[sourceStatus].findIndex(t => t.id.toString() === taskId);
        const newIndex = tasks[destinationStatus].findIndex(t => t.id.toString() === over.id.toString().split('-')[0]);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = [...tasks[sourceStatus]];
          const [movedTask] = newOrder.splice(oldIndex, 1);
          newOrder.splice(newIndex, 0, movedTask);
          
          // Mettre à jour les positions
          const updatedOrder = newOrder.map((task, index) => ({
            ...task,
            position: index
          }));
          
          await handleReorderTasks(sourceStatus, updatedOrder);
        }
        return;
      }

      // Si la tâche est déposée dans une autre colonne
      taskToMove = tasks[sourceStatus].find(t => t.id.toString() === taskId);
      if (!taskToMove) return;

      const updatedTask = {
        ...taskToMove,
        status: destinationStatus,
        position: tasks[destinationStatus]?.length || 0
      };

      // Mettre à jour l'état local immédiatement
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        if (sourceStatus && destinationStatus) {
          const sourceTasks = newTasks[sourceStatus] || [];
          const destinationTasks = newTasks[destinationStatus] || [];
          
          newTasks[sourceStatus] = sourceTasks.filter(
            (task: Task) => task.id.toString() !== taskId
          );
          newTasks[destinationStatus] = [...destinationTasks, updatedTask];
          localStorage.setItem(`tasks_${projectId}`, JSON.stringify(newTasks));
        }
        return newTasks;
      });

      // Mettre à jour la tâche dans le backend
      await handleUpdateTask(updatedTask);
    } catch (error) {
      console.error("Error updating task after drag:", error);
      // Revenir à l'état précédent en cas d'erreur
      if (sourceStatus && destinationStatus && taskId && taskToMove && 
          sourceStatus in tasks && destinationStatus in tasks) {
        setTasks(prevTasks => {
          const newTasks = { ...prevTasks };
          const sourceTasks = newTasks[sourceStatus as TaskStatus] || [];
          const destinationTasks = newTasks[destinationStatus as TaskStatus] || [];
          
          newTasks[sourceStatus as TaskStatus] = [...sourceTasks, taskToMove as Task];
          newTasks[destinationStatus as TaskStatus] = destinationTasks.filter(
            (task: Task) => task.id.toString() !== taskId
          );
          localStorage.setItem(`tasks_${projectId}`, JSON.stringify(newTasks));
          return newTasks;
        });
      }
    }
  };

  // Vérifier si nous sommes côté client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const storedLabels = localStorage.getItem('availableLabels');
    if (storedLabels) {
      setAvailableLabels(JSON.parse(storedLabels));
    }
    const syncLabels = () => {
      const stored = localStorage.getItem('availableLabels');
      if (stored) {
        setAvailableLabels(JSON.parse(stored));
      }
    };
    window.addEventListener('storage', syncLabels);
    return () => window.removeEventListener('storage', syncLabels);
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600 dark:text-gray-300">Loading tasks...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  const handleShareProject = () => {
    const shareUrl = `${window.location.origin}/projects/${projectId}`;
    if (navigator.share) {
      navigator.share({
        title: `Partager le projet`,
        url: shareUrl,
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Lien du projet copié dans le presse-papiers!");
      });
    }
  };

  return (
    <>
      <Breadcrumb pageName="Tableau de Travail" />
      <div className={`min-h-screen bg-gray-50 dark:bg-boxdark p-6 transition-transform duration-300`}>
        <div className="mx-auto max-w-screen-xxl">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-6 p-6 rounded-xl text-white overflow-hidden relative shadow-lg"
            style={{
              background: "linear-gradient(135deg, #2560a0 0%, #d01e3e 100%)",
            }}
          >
            {/* Effet de particules animées */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute inset-0"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                filter: "blur(40px)"
              }}
            />

            {/* Animated user cards */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 8 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5,
                }}
                className="absolute w-24 h-16 bg-white/20 rounded-lg border border-white/30"
                style={{
                  left: `${10 + i * 25}%`,
                  top: `${30 + (i % 2) * 20}%`,
                  transform: `rotate(${i * 5}deg)`,
                }}
              />
            ))}

            <div className="flex items-center -space-x-3 relative z-10">
              {project?.users && (
                <div className="flex items-center -space-x-3">
                  {project?.users && project.users.length > 0 ? (
                    project.users
                      .filter((user) => ["INFRA", "DEVELOPPER"].includes(user.role.toUpperCase()))
                      .map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden cursor-pointer hover:scale-110 transition-transform duration-200"
                          style={{ zIndex: project.users.length - index }}
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/profileUsers/${user.id}`);
                          }}
                        >
                          <Image
                            src={user.photo 
                              ? (user.photo.startsWith('https://lh3.googleusercontent.com') 
                                ? user.photo 
                                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.photo}`)
                              : "/images/user/user1.jpg"}
                            alt={`${user.firstName} ${user.lastName}`}
                            width={40}
                            height={40}
                            className="object-cover"
                            title={`${user.firstName} ${user.lastName} - ${user.role}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/user/user1.jpg";
                            }}
                            unoptimized={true}
                          />
                        </motion.div>
                      ))
                  ) : (
                    <p className="text-gray-500">Aucun utilisateur assigné.</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 relative z-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-white/30 p-2 inline-flex items-center text-white focus:outline-none rounded-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                onClick={handleShareProject}
              >
                <FaLink className="text-white" />
                <span className="text-white ml-2">Partager le lien</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="border border-white/30 p-2 inline-flex items-center text-white focus:outline-none rounded-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                <FiMenu className="text-white w-5 h-5" />
                <span className="text-white ml-2">Menu</span>
              </motion.button>
            </div>
          </motion.div>

          <div className="relative">
            {isClient ? (
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className={`grid grid-cols-1 md:grid-cols-${isOpen ? '5' : '4'} gap-6 p-6 transition-all duration-300`}>
                  <div className={`col-span-1 ${isOpen ? 'md:col-span-4' : 'md:col-span-3'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Object.entries(tasks).map(([status, taskList]) => (
                        <TaskColumn
                          key={status}
                          status={status as TaskStatus}
                          tasks={taskList}
                          activeColumn={activeColumn}
                          setActiveColumn={setActiveColumn}
                          handleAddTask={handleAddTask}
                          handleDeleteTask={handleDeleteTask}
                          handleUpdateTask={handleUpdateTask}
                          handleArchiveTask={handleArchiveTask}
                          userPhotos={userPhotos}
                          availableLabels={availableLabels}
                          selectedLabels={selectedLabels}
                          onReorderTasks={handleReorderTasks}
                        />
                      ))}
                    </div>
                  </div>

                  <div className={`col-span-1 transition-all duration-300 ${isOpen ? 'block' : 'hidden'}`}>
                    <div className="bg-white dark:bg-boxdark shadow-lg rounded-l-xl overflow-hidden h-full">
                      <Menu
                        className="h-full"
                        archivedTasks={archivedTasks}
                        handleRestoreTask={handleRestoreTask}
                        tasks={tasks}
                        totalTasks={totalTasks}
                        availableLabels={availableLabels}
                        selectedLabels={selectedLabels}
                        toggleLabelSelection={toggleLabelSelection}
                        onAddLabel={handleAddLabel}
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                      />
                    </div>
                  </div>
                </div>

                <DragOverlay>
                  {activeTask && activeStatus ? (
                    <div className="w-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 transform rotate-2">
                      <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">{activeTask.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          activeTask.priority === "high" ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
                        }`}>
                          {activeTask.priority === "high" ? "Haute" : "Basse"} priorité
                        </span>
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-800">
                          {activeTask.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{activeTask.description}</p>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-${isOpen ? '5' : '4'} gap-6 p-6 transition-all duration-300`}>
                <div className={`col-span-1 ${isOpen ? 'md:col-span-4' : 'md:col-span-3'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(tasks).map(([status, taskList]) => (
                      <TaskColumn
                        key={status}
                        status={status as TaskStatus}
                        tasks={taskList}
                        activeColumn={activeColumn}
                        setActiveColumn={setActiveColumn}
                        handleAddTask={handleAddTask}
                        handleDeleteTask={handleDeleteTask}
                        handleUpdateTask={handleUpdateTask}
                        handleArchiveTask={handleArchiveTask}
                        userPhotos={userPhotos}
                        availableLabels={availableLabels}
                        selectedLabels={selectedLabels}
                        onReorderTasks={handleReorderTasks}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification de succès */}
      <AnimatePresence>
        {successMessage.show && (
          <SuccessNotification
            message={successMessage.message}
            onClose={() => setSuccessMessage({ show: false, message: "", type: 'success' })}
            type={successMessage.type}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskPage;
