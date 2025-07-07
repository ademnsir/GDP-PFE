import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import { Task } from '@/services/tache';

type TaskStatus = "To Do" | "In Progress" | "Done";

interface SortableTaskCardProps {
  task: Task;
  status: TaskStatus;
  handleDeleteTask: (taskId: number, status: TaskStatus) => Promise<void>;
  handleUpdateTask: (updatedTask: Task) => Promise<void>;
  handleArchiveTask: (task: Task) => void;
  userPhoto?: string;
  availableLabels: { id: number; color: string; name: string }[];
  selectedLabels: number[];
  index: number;
  onReorder: (newIndex: number) => void;
}

export const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
  task,
  status,
  handleDeleteTask,
  handleUpdateTask,
  handleArchiveTask,
  userPhoto,
  availableLabels,
  selectedLabels,
  index,
  onReorder,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${task.id}-${status}`,
    data: {
      type: 'task',
      task,
      index,
      status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'shadow-lg cursor-grabbing' : 'cursor-grab'} transition-all duration-200`}
    >
      <div className="relative">
        <TaskCard
          task={task}
          status={status}
          handleDeleteTask={handleDeleteTask}
          handleUpdateTask={handleUpdateTask}
          handleArchiveTask={handleArchiveTask}
          userPhoto={userPhoto || "/images/user/user1.jpg"}
          availableLabels={availableLabels}
          selectedLabels={selectedLabels}
        />
        {isDragging && (
          <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center transform rotate-3">
              <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 