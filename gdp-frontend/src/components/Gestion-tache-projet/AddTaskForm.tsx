import React, { useState } from "react";
import { TaskType } from "@/services/tache";
import { motion } from "framer-motion";

type TaskStatus = "To Do" | "In Progress" | "Done";

interface AddTaskFormProps {
  onAddTask: (task: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: "high" | "low";
    type: string;
    customType?: string;
    labels: number[];
  }) => Promise<void>;
  onCancel: () => void;
  status: TaskStatus;
  availableLabels: { id: number; color: string; name: string }[];
  selectedLabels: number[];
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask, onCancel, status, availableLabels, selectedLabels }) => {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: status,
    priority: "low" as "high" | "low",
    type: TaskType.Bug,
    customType: "",
    selectedLabels: [] as number[]
  });

  const handleLabelToggle = (labelId: number) => {
    setNewTask(prev => ({
      ...prev,
      selectedLabels: prev.selectedLabels.includes(labelId)
        ? prev.selectedLabels.filter(id => id !== labelId)
        : [...prev.selectedLabels, labelId]
    }));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      alert("Le titre de la tâche est requis.");
      return;
    }

    const taskToAdd = {
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      type: newTask.type,
      customType: newTask.type === TaskType.Custom ? newTask.customType : undefined,
      labels: newTask.selectedLabels
    };
    onAddTask(taskToAdd);
    setNewTask({
      title: "",
      description: "",
      status: status,
      priority: "low",
      type: TaskType.Bug,
      customType: "",
      selectedLabels: []
    });
  };

  return (
    <form onSubmit={handleAddTask} className="mt-2 bg-gray-100 p-3 rounded-lg shadow-md dark:bg-boxdark dark:border-strokedark">
      <h3 className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">Nouvelle tâche</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Titre du ticket"
            value={newTask.title}
            onChange={(e) =>
              setNewTask({ ...newTask, title: e.target.value })
            }
            className="w-full border border-gray-300 px-2 py-1 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-boxdark-2 dark:border-strokedark dark:text-white dark:focus:ring-blue-400"
          />
        </div>
        
        <div className="col-span-2">
          <textarea
            placeholder="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full border border-gray-300 px-2 py-1 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-boxdark-2 dark:border-strokedark dark:text-white dark:focus:ring-blue-400"
            rows={2}
          ></textarea>
        </div>
        
        <div>
          <select
            value={newTask.priority}
            onChange={(e) =>
              setNewTask({ ...newTask, priority: e.target.value as "high" | "low" })
            }
            className="w-full border border-gray-300 px-2 py-1 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-boxdark-2 dark:border-strokedark dark:text-white dark:focus:ring-blue-400"
          >
            <option value="low">Priorité basse</option>
            <option value="high">Priorité haute</option>
          </select>
        </div>
        
        <div>
          <select
            value={newTask.type}
            onChange={(e) =>
              setNewTask({ ...newTask, type: e.target.value as TaskType })
            }
            className="w-full border border-gray-300 px-2 py-1 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-boxdark-2 dark:border-strokedark dark:text-white dark:focus:ring-blue-400"
          >
            {Object.values(TaskType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {newTask.type === TaskType.Custom && (
          <div className="col-span-2">
            <input
              type="text"
              placeholder="Type personnalisé"
              value={newTask.customType}
              onChange={(e) => setNewTask({ ...newTask, customType: e.target.value })}
              className="w-full border border-gray-300 px-2 py-1 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-boxdark-2 dark:border-strokedark dark:text-white dark:focus:ring-blue-400"
            />
          </div>
        )}

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Étiquettes sélectionnées :
          </label>
          <div className="flex flex-wrap gap-1 mb-2">
            {availableLabels
              .filter(label => newTask.selectedLabels.includes(label.id))
              .map((label) => (
                <motion.button
                  key={label.id}
                  type="button"
                  onClick={() => handleLabelToggle(label.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${label.color} text-black dark:text-black shadow-sm`}
                >
                  {label.name}
                </motion.button>
              ))}
            {newTask.selectedLabels.length === 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                Aucune étiquette sélectionnée
              </span>
            )}
          </div>
          
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Étiquettes disponibles :
          </label>
          <div className="flex flex-wrap gap-1">
            {availableLabels.map((label) => (
              <motion.button
                key={label.id}
                type="button"
                onClick={() => handleLabelToggle(label.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors
                  ${newTask.selectedLabels.includes(label.id)
                    ? `${label.color} text-black dark:text-black shadow-sm`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {label.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-xs bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Créer
        </button>
      </div>
    </form>
  );
};

export default AddTaskForm;
