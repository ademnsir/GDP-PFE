import React from "react";
import TaskCard from "./TaskCard";
import AddTaskForm from "@/components/Gestion-tache-projet/AddTaskForm";
import { Task } from "@/services/tache";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTaskCard } from "./SortableTaskCard";
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

type TaskStatus = "To Do" | "In Progress" | "Done";

const taskStatusMapping = {
  "To Do": "À Faire",
  "In Progress": "En Cours",
  "Done": "Terminé",
};

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  activeColumn: TaskStatus | null;
  setActiveColumn: (status: TaskStatus | null) => void;
  handleAddTask: (task: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: "high" | "low";
    type: string;
    customType?: string;
    labels: number[];
  }) => Promise<void>;
  handleDeleteTask: (taskId: number, status: TaskStatus) => Promise<void>;
  handleUpdateTask: (updatedTask: Task) => Promise<void>;
  handleArchiveTask: (task: Task) => void;
  userPhotos: Record<number, string>;
  availableLabels: { id: number; color: string; name: string }[];
  selectedLabels: number[];
  onReorderTasks: (status: TaskStatus, newOrder: Task[]) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  tasks,
  activeColumn,
  setActiveColumn,
  handleAddTask,
  handleDeleteTask,
  handleUpdateTask,
  handleArchiveTask,
  userPhotos,
  availableLabels,
  selectedLabels,
  onReorderTasks,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    }
  });

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      await handleUpdateTask(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  if (!tasks) {
    console.error('Tasks is undefined for status:', status);
    return null;
  }

  // Trier les tâches par position
  const sortedTasks = [...tasks].sort((a, b) => {
    const posA = a.position ?? 0;
    const posB = b.position ?? 0;
    return posA - posB;
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative p-4 rounded-xl shadow-lg bg-white dark:bg-boxdark overflow-visible flex flex-col border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 min-h-[400px]`}
    >
      {/* En-tête de la colonne */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          {taskStatusMapping[status]} 
          <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {tasks.length}
          </span>
        </h2>
        <button
          onClick={() => setActiveColumn(activeColumn === status ? null : status)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
        >
          {activeColumn === status ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Créer un ticket
            </>
          )}
        </button>
      </div>

      {/* Formulaire de création de tâche */}
      {activeColumn === status && (
        <div className="mb-4 bg-white dark:bg-boxdark p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <AddTaskForm
            onAddTask={handleAddTask}
            onCancel={() => setActiveColumn(null)}
            status={status}
            availableLabels={availableLabels}
            selectedLabels={selectedLabels}
          />
        </div>
      )}

      {/* Liste des tâches */}
      <div className={`flex-1 ${tasks.length > 5 ? 'overflow-y-auto max-h-[calc(100vh-200px)] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent dark:scrollbar-thumb-gray-500 dark:scrollbar-track-gray-800/50' : 'overflow-y-visible'}`}>
        <SortableContext 
          items={sortedTasks.map(task => `${task.id}-${status}`)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4 min-h-[100px] transition-all duration-300 relative">
            {sortedTasks.map((task, index) => {
              if (!task || !task.id) {
                console.error('Invalid task:', task);
                return null;
              }

              return (
                <SortableTaskCard
                  key={`${task.id}-${status}`}
                  task={task}
                  status={status}
                  handleDeleteTask={handleDeleteTask}
                  handleUpdateTask={handleUpdateTask}
                  handleArchiveTask={handleArchiveTask}
                  userPhoto={userPhotos[task.userId]}
                  availableLabels={availableLabels}
                  selectedLabels={selectedLabels}
                  index={index}
                  onReorder={(newIndex) => {
                    const newOrder = [...sortedTasks];
                    const [movedTask] = newOrder.splice(index, 1);
                    newOrder.splice(newIndex, 0, movedTask);
                    onReorderTasks(status, newOrder);
                  }}
                />
              );
            })}
          </div>
        </SortableContext>
      </div>

      {/* Zone de dépôt animée - Modifiée pour s'afficher en permanence pendant le drag */}
      <AnimatePresence>
        {isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-100/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-200/50 dark:bg-gray-700/50 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Déposer ici
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskColumn;
