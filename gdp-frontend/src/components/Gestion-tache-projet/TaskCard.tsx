import React, { useState, useEffect, useRef } from "react";
import { Task, TaskType } from "@/services/tache";
import Image from "next/image";
import { FiMoreVertical, FiEdit, FiTrash2, FiChevronUp, FiChevronDown, FiArchive, FiX, FiCheck, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getUserData } from "@/services/authService";
import { createPortal } from "react-dom";

type TaskStatus = "To Do" | "In Progress" | "Done";

interface TaskCardProps {
  task: Task;
  status: TaskStatus;
  handleDeleteTask: (taskId: number, status: TaskStatus) => Promise<void>;
  handleUpdateTask: (updatedTask: Task) => Promise<void>;
  handleArchiveTask: (task: Task) => void;
  userPhoto: string;
  availableLabels: { id: number; color: string; name: string }[];
  selectedLabels: number[];
}

// Composant de boîte de dialogue de confirmation pour la suppression
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, taskTitle }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmer la suppression
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer la tâche <span className="font-medium text-gray-900 dark:text-white">{taskTitle}</span> ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Composant de notification de succès
const SuccessNotification = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
            <FiCheck className="w-5 h-5 text-green-600 dark:text-green-300" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-green-600 dark:text-green-300 hover:text-green-700 dark:hover:text-green-200 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  status,
  handleDeleteTask,
  handleUpdateTask,
  handleArchiveTask,
  userPhoto,
  availableLabels = [],
  selectedLabels = [],
}) => {
  const [menuOpenTaskId, setMenuOpenTaskId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskData, setEditingTaskData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    type: task.type,
    customType: task.type === TaskType.Custom ? task.customType || "" : "",
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; taskId: number; taskTitle: string }>({
    isOpen: false,
    taskId: 0,
    taskTitle: "",
  });
  const [successMessage, setSuccessMessage] = useState<{ show: boolean; message: string; type: string }>({
    show: false,
    message: "",
    type: 'success',
  });

  // Récupérer les données de l'utilisateur connecté
  const userData = getUserData();
  const userPhotoUrl = userData?.photo;

  const taskTypeColors: Record<TaskType, string> = {
    [TaskType.Bug]: "bg-red-200 text-red-800",
    [TaskType.Fix]: "bg-green-200 text-green-800",
    [TaskType.Feature]: "bg-blue-200 text-blue-800",
    [TaskType.Improvement]: "bg-yellow-200 text-yellow-800",
    [TaskType.Task]: "bg-purple-200 text-purple-800",
    [TaskType.Refactor]: "bg-pink-200 text-pink-800",
    [TaskType.Docs]: "bg-indigo-200 text-indigo-800",
    [TaskType.Test]: "bg-teal-200 text-teal-800",
    [TaskType.Research]: "bg-orange-200 text-orange-800",
    [TaskType.Security]: "bg-gray-200 text-gray-800",
    [TaskType.Performance]: "bg-cyan-200 text-cyan-800",
    [TaskType.Custom]: "bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200",
  };

  const handleUpdate = async () => {
    try {
      const updatedTask = { 
        ...task, 
        ...editingTaskData,
        customType: editingTaskData.type === TaskType.Custom ? editingTaskData.customType : undefined 
      };
      await handleUpdateTask(updatedTask);
      setEditingTaskId(null);
      setSuccessMessage({
        show: true,
        message: "Tâche mise à jour avec succès",
        type: 'success'
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "", type: 'success' });
      }, 3000);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpenTaskId(null);
    }
  };

  const confirmDelete = async () => {
    try {
      await handleDeleteTask(deleteModal.taskId, status);
      setDeleteModal({ isOpen: false, taskId: 0, taskTitle: "" });
      setSuccessMessage({
        show: true,
        message: "Tâche supprimée avec succès",
        type: 'success'
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "", type: 'success' });
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);
      setDeleteModal({ isOpen: false, taskId: 0, taskTitle: "" });
    }
  };

  const handleArchiveTaskWithNotification = (task: Task) => {
    try {
      handleArchiveTask(task);
      setSuccessMessage({
        show: true,
        message: "Tâche archivée avec succès",
        type: 'success'
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "", type: 'success' });
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de l'archivage de la tâche:", error);
      setSuccessMessage({
        show: true,
        message: "Erreur lors de l'archivage de la tâche",
        type: 'error'
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "", type: 'success' });
      }, 3000);
    }
  };

  const handleMoveTask = async (newStatus: TaskStatus) => {
    try {
      const updatedTask = { ...task, status: newStatus };
      await handleUpdateTask(updatedTask);
      setSuccessMessage({
        show: true,
        message: `Tâche déplacée vers ${newStatus}`,
        type: 'success'
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "", type: 'success' });
      }, 3000);
    } catch (error) {
      console.error("Erreur lors du déplacement de la tâche:", error);
      setSuccessMessage({
        show: true,
        message: "Erreur lors du déplacement de la tâche",
        type: 'error'
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "", type: 'success' });
      }, 3000);
    }
  };

  const handleMenuClick = (): void => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const menuHeight = 200; // Hauteur approximative du menu

      // Calculer la position du menu
      const menuStyle = {
        position: 'fixed' as const,
        top: `${buttonRect.top}px`,
        right: `${window.innerWidth - buttonRect.right}px`,
        zIndex: 9999,
      };

      setMenuPosition(spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'top' : 'bottom');
      setMenuOpenTaskId(menuOpenTaskId === task.id ? null : task.id);
    }
  };

  useEffect(() => {
    if (menuOpenTaskId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpenTaskId]);

  // Déterminer le texte à afficher pour le type
  const getTypeDisplayText = () => {
    if (task.type === TaskType.Custom) {
      return task.customType || "Type personnalisé";
    }
    return task.type;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-300 relative"
      >
        {/* Menu d'options */}
        <div className="relative">
          <button
            ref={buttonRef}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-white absolute top-1 right-1"
            onClick={handleMenuClick}
          >
            <FiMoreVertical size={16} />
          </button>
          {menuOpenTaskId === task.id && (
            <div
              ref={menuRef}
              className={`w-56 bg-white shadow-lg rounded-lg dark:bg-gray-800 border border-gray-100 dark:border-gray-700 ${
                menuPosition === 'top' ? 'bottom-8' : 'top-8'
              }`}
              style={{ 
                position: 'fixed',
                top: buttonRef.current ? `${buttonRef.current.getBoundingClientRect().top}px` : 'auto',
                right: buttonRef.current ? `${window.innerWidth - buttonRef.current.getBoundingClientRect().right}px` : 'auto',
                zIndex: 9999,
                transform: menuPosition === 'top' ? 'translateY(-100%)' : 'none',
                marginTop: menuPosition === 'top' ? '-8px' : '8px'
              }}
            >
              <ul className="text-sm whitespace-nowrap py-1">
                <li
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setEditingTaskId(task.id)}
                >
                  <FiEdit /> Modifier
                </li>
                {status === "To Do" && (
                  <>
                    <li
                      className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleMoveTask("In Progress")}
                    >
                      <FiChevronRight /> Déplacer vers En cours
                    </li>
                    <li
                      className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleMoveTask("Done")}
                    >
                      <FiChevronRight /> Déplacer vers Terminé
                    </li>
                  </>
                )}
                {status === "In Progress" && (
                  <>
                    <li
                      className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleMoveTask("To Do")}
                    >
                      <FiChevronLeft /> Retourner à À faire
                    </li>
                    <li
                      className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleMoveTask("Done")}
                    >
                      <FiChevronRight /> Déplacer vers Terminé
                    </li>
                  </>
                )}
                {status === "Done" && (
                  <>
                    <li
                      className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleMoveTask("In Progress")}
                    >
                      <FiChevronLeft /> Retourner à En cours
                    </li>
                    <li
                      className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleMoveTask("To Do")}
                    >
                      <FiChevronLeft /> Retourner à À faire
                    </li>
                  </>
                )}
                <li
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleArchiveTaskWithNotification(task)}
                >
                  <FiArchive /> Archiver
                </li>
                <li
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                  onClick={() => setDeleteModal({
                    isOpen: true, 
                    taskId: task.id,
                    taskTitle: task.title
                  })}
                >
                  <FiTrash2 /> Supprimer
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Titre */}
        <h3 className="font-semibold text-base mb-1 text-gray-800 dark:text-white">{task.title}</h3>

        {/* Type et priorité */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${taskTypeColors[task.type as TaskType]}`}>
            {getTypeDisplayText()}
          </span>
          <span className="flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
            {task.priority === "high" ? <FiChevronUp className="text-red-600" /> : <FiChevronDown className="text-green-600" />}
            {task.priority === "high" ? "Haute" : "Basse"}
          </span>
        </div>

        {/* Détails */}
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{task.description}</p>

        {/* Étiquettes */}
        <div className="flex flex-wrap gap-1 mb-2">
          {(() => {
            const foundLabels = Array.isArray(task.labels)
              ? task.labels
                  .map((labelId: number) => availableLabels.find((l) => l.id === labelId))
                  .filter((label) => !!label)
              : [];
            if (foundLabels.length > 0) {
              return foundLabels.map((label) => (
                <span
                  key={label!.id}
                  className={`text-xs font-medium px-2 py-1 rounded-full ${label!.color}`}
                >
                  {label!.name}
                </span>
              ));
            }
         
          })()}
        </div>

        {/* Footer avec l'avatar utilisateur et les icônes */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden">
              <Image
                src={
                  task.user?.photo
                    ? task.user.photo.startsWith('https://lh3.googleusercontent.com')
                      ? task.user.photo
                      : `${process.env.NEXT_PUBLIC_BACKEND_URL}${task.user.photo}`
                    : "/images/user/user1.jpg"
                }
                alt={`${task.user?.firstName || ''} ${task.user?.lastName || ''}`}
                width={24}
                height={24}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/user/user1.jpg";
                }}
                unoptimized={true}
              />
            </div>
          </div>
        </div>

        {/* Formulaire d'édition */}
        <AnimatePresence>
          {editingTaskId === task.id && (
            <motion.div 
              className="bg-gray-100 p-4 rounded shadow mt-4 dark:bg-boxdark dark:text-white"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                <input
                  type="text"
                  value={editingTaskData.title}
                  onChange={(e) => setEditingTaskData({ ...editingTaskData, title: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-boxdark-2 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingTaskData.description}
                  onChange={(e) => setEditingTaskData({ ...editingTaskData, description: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-boxdark-2 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                  rows={3}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priorité</label>
                <select
                  value={editingTaskData.priority}
                  onChange={(e) => setEditingTaskData({ ...editingTaskData, priority: e.target.value as "high" | "low" })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-boxdark-2 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                >
                  <option value="high">Haute</option>
                  <option value="low">Basse</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={editingTaskData.type}
                  onChange={(e) => setEditingTaskData({ ...editingTaskData, type: e.target.value as TaskType })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-boxdark-2 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                >
                  {Object.values(TaskType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {editingTaskData.type === TaskType.Custom && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type personnalisé</label>
                  <input
                    type="text"
                    value={editingTaskData.customType}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, customType: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-md mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-boxdark-2 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                    placeholder="Entrez un type personnalisé"
                  />
                </div>
              )}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingTaskId(null)}
                  className="px-4 py-2 text-sm bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Boîte de dialogue de confirmation de suppression */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, taskId: 0, taskTitle: "" })}
        onConfirm={confirmDelete}
        taskTitle={deleteModal.taskTitle}
      />
      
      {/* Notification de succès */}
      <AnimatePresence>
        {successMessage.show && (
          <SuccessNotification
            message={successMessage.message}
            onClose={() => setSuccessMessage({ show: false, message: "", type: 'success' })}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskCard;
