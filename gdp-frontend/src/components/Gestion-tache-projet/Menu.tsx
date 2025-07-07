"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiHome, FiSettings, FiUser, FiLogOut, FiPlus, FiList, FiCalendar, FiBarChart2, FiArchive, FiTag, FiActivity, FiCheck, FiArrowLeft, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Task, TaskStatus } from "@/services/tache";
import Image from "next/image";
import SprintAnalysis from "@/components/Gestion-tache-projet/SprintAnalysis";

interface MenuProps {
  className?: string;
  archivedTasks: Task[];
  handleRestoreTask: (task: Task) => void;
  tasks: Record<TaskStatus, Task[]>;
  totalTasks: number;
  availableLabels: { id: number; color: string; name: string }[];
  selectedLabels: number[];
  toggleLabelSelection: (labels: number[]) => void;
  onAddLabel: (labels: { id: number; color: string; name: string }[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Menu: React.FC<MenuProps> = ({
  className = "",
  archivedTasks,
  handleRestoreTask,
  tasks,
  totalTasks,
  availableLabels,
  selectedLabels = [],
  toggleLabelSelection,
  onAddLabel,
  isOpen,
  onClose,
}) => {
  const [showArchived, setShowArchived] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("bleu");
  const router = useRouter();

  const labelColors = [
    { name: "Bleu", class: "bg-blue-200" },
    { name: "Rouge", class: "bg-red-200" },
    { name: "Vert", class: "bg-green-200" },
    { name: "Jaune", class: "bg-yellow-200" },
    { name: "Violet", class: "bg-purple-200" },
    { name: "Orange", class: "bg-orange-200" },
    { name: "Rose", class: "bg-pink-200" },
    { name: "Gris", class: "bg-gray-200" },
  ];

  const handleAddNewLabel = () => {
    if (newLabelName.trim()) {
      // Trouver la couleur sélectionnée dans labelColors
      const selectedColor = labelColors.find(color => color.name.toLowerCase() === newLabelColor);
      
      if (selectedColor) {
        // Construire la classe de couleur complète avec le texte correspondant
        const colorClass = selectedColor.class;
        const textColorClass = colorClass.replace('bg-', 'text-').replace('-200', '-800');
        
        const newLabel = {
          id: Date.now(),
          name: newLabelName,
          color: `${colorClass} ${textColorClass}`
        };
        
        const updatedLabels = [...availableLabels, newLabel];
        onAddLabel(updatedLabels);
        localStorage.setItem('availableLabels', JSON.stringify(updatedLabels));
        setNewLabelName('');
      }
    }
  };

  const handleCloseMenu = () => {
    onClose();
    setShowArchived(false);
    setShowStats(false);
    setShowLabels(false);
  };

  return (
    <>
      {/* Menu avec animation */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay sombre avec animation de fondu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseMenu}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Menu coulissant */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-[72px] h-[calc(100vh-72px)] w-80 bg-white dark:bg-boxdark shadow-2xl z-50"
            >
              {/* En-tête du menu */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                {(showArchived || showStats || showLabels) && (
                  <motion.button
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -10, opacity: 0 }}
                    onClick={() => {
                      setShowArchived(false);
                      setShowStats(false);
                      setShowLabels(false);
                    }}
                    className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors" />
                  </motion.button>
                )}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex-1">
                  {showArchived ? "Tâches archivées" : showStats ? "Statistiques" : showLabels ? "Étiquettes" : "Menu"}
                </h2>
                <button
                  onClick={handleCloseMenu}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu du menu */}
              <div className="overflow-y-auto h-[calc(100vh-72px-5rem)]">
                {showArchived ? (
                  <div className="p-4">
                    {/* Section des tâches archivées */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <FiArchive className="text-gray-500 dark:text-gray-400" />
                        Tâches archivées
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                          {archivedTasks.length}
                        </span>
                      </h3>
                      
                      {archivedTasks.length > 0 ? (
                        <div className="space-y-4">
                          {archivedTasks.map((task, index) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-gray-800 dark:text-white line-clamp-1">
                                  {task.title}
                                </h4>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  task.priority === "high" 
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                }`}>
                                  {task.priority === "high" ? "Haute" : "Basse"}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                                {task.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {task.labels?.map((labelId) => {
                                  const label = availableLabels.find((l) => l.id === labelId);
                                  return label ? (
                                    <span
                                      key={label.id}
                                      className={`text-xs font-medium px-2 py-1 rounded-full ${label.color}`}
                                    >
                                      {label.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Archivé le {new Date(task.creationDate).toLocaleDateString()}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleRestoreTask(task)}
                                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                                >
                                  <FiRotateCcw className="w-4 h-4" />
                                  Restaurer
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <motion.div 
                          className="flex flex-col items-center justify-center min-h-[400px] p-8 relative overflow-hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {/* Cercle rotatif principal */}
                          <motion.div
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 20,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          >
                            {[0, 1, 2, 3].map((i) => (
                              <motion.div
                                key={i}
                                className="absolute inset-0 border-2 border-red-400/30 dark:border-red-500/20 rounded-full"
                                style={{
                                  transform: `rotate(${i * 45}deg)`,
                                  borderRadius: "50%"
                                }}
                              />
                            ))}
                          </motion.div>

                          {/* Icône centrale avec effet de pulsation */}
                          <motion.div
                            className="relative z-10"
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg relative">
                              {/* Effet de brillance */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                                animate={{
                                  x: ['-150%', '150%']
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatDelay: 1
                                }}
                              />
                              <FiArchive className="w-10 h-10 text-white" />
                            </div>
                          </motion.div>

                          {/* Particules flottantes */}
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className={`absolute w-2 h-2 ${i % 2 === 0 ? 'bg-red-400/30' : 'bg-purple-500/30'} rounded-full`}
                              style={{
                                left: `${30 + (i * 10)}%`,
                                top: `${20 + (i * 10)}%`
                              }}
                              animate={{
                                y: [0, -20, 0],
                                opacity: [0.2, 1, 0.2],
                                scale: [1, 1.5, 1]
                              }}
                              transition={{
                                duration: 3,
                                delay: i * 0.2,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            />
                          ))}

                          {/* Texte centré */}
                          <motion.div
                            className="text-center mt-8 z-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <motion.h3
                              className="text-xl font-semibold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent mb-2"
                              animate={{
                                opacity: [0.7, 1, 0.7]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity
                              }}
                            >
                              Archives vides
                            </motion.h3>
                            <motion.p
                              className="text-sm text-gray-500 dark:text-gray-400"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.8 }}
                            >
                              Aucune tâche n&apos;est archivée pour le moment
                            </motion.p>
                          </motion.div>

                          {/* Cercles d'accent */}
                          <motion.div
                            className="absolute w-full h-full pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                          >
                            <motion.div
                              className="absolute w-32 h-32 rounded-full bg-red-500/5 dark:bg-red-500/10"
                              style={{ top: '10%', left: '10%' }}
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.8, 0.5]
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                            <motion.div
                              className="absolute w-24 h-24 rounded-full bg-purple-500/5 dark:bg-purple-500/10"
                              style={{ bottom: '10%', right: '10%' }}
                              animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.5, 0.8, 0.5]
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1
                              }}
                            />
                          </motion.div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : showStats ? (
                  <div className="p-4">
                    <SprintAnalysis
                      done={tasks["Done"]?.length || 0}
                      inProgress={tasks["In Progress"]?.length || 0}
                      toDo={tasks["To Do"]?.length || 0}
                      totalTasks={totalTasks}
                    />
                  </div>
                ) : showLabels ? (
                  <div className="p-4 space-y-4">
                    {/* Formulaire d'ajout d'étiquette */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3"
                    >
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Nouvelle étiquette
                      </h3>
                      <input
                        type="text"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        placeholder="Nom de l'étiquette"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      
                      {/* Sélecteur de couleur */}
                      <div className="grid grid-cols-4 gap-2">
                        {labelColors.map((color) => (
                          <motion.button
                            key={color.class}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setNewLabelColor(color.name.toLowerCase())}
                            className={`w-8 h-8 rounded-full ${color.class} ${
                              newLabelColor === color.name.toLowerCase() ? 'ring-2 ring-primary' : ''
                            }`}
                          />
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddNewLabel}
                        className="w-full py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-md font-medium hover:opacity-90 transition-all"
                      >
                        Ajouter l&apos;étiquette
                      </motion.button>
                    </motion.div>

                    {/* Section des étiquettes disponibles */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Étiquettes disponibles</h3>
                      <div className="space-y-3">
                        {availableLabels.map((label, index) => (
                          <div 
                            key={`label-${label.id}-${index}`} 
                            className={`flex items-center justify-between group p-2 rounded-md transition-colors ${
                              Array.isArray(selectedLabels) && selectedLabels.includes(label.id)
                                ? `${label.color}`
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-sm px-2 py-1 rounded-full ${label.color} ${
                                Array.isArray(selectedLabels) && selectedLabels.includes(label.id)
                                  ? 'text-black'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>{label.name}</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  const updatedSelection = Array.isArray(selectedLabels) && selectedLabels.includes(label.id)
                                    ? selectedLabels.filter(id => id !== label.id)
                                    : [...(Array.isArray(selectedLabels) ? selectedLabels : []), label.id];
                                  toggleLabelSelection(updatedSelection);
                                }}
                                className={`p-1 rounded-md transition-colors ${
                                  Array.isArray(selectedLabels) && selectedLabels.includes(label.id)
                                    ? 'text-black hover:bg-black/10'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                                title={Array.isArray(selectedLabels) && selectedLabels.includes(label.id) ? "Désélectionner l'étiquette" : "Sélectionner l'étiquette"}
                              >
                                <FiCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  // Vérifier si l'étiquette est utilisée par une tâche
                                  const isUsed = Object.values(tasks).flat().some(task => Array.isArray(task.labels) && task.labels.includes(label.id));
                                  if (isUsed) {
                                    alert("Impossible de supprimer cette étiquette car elle est utilisée par une tâche.");
                                    return;
                                  }
                                  const updatedLabels = availableLabels.filter(l => l.id !== label.id);
                                  localStorage.setItem('availableLabels', JSON.stringify(updatedLabels));
                                  onAddLabel(updatedLabels);
                                  const updatedSelectedLabels = Array.isArray(selectedLabels) 
                                    ? selectedLabels.filter(id => id !== label.id)
                                    : [];
                                  toggleLabelSelection(updatedSelectedLabels);
                                }}
                                className={`p-1 transition-colors ${
                                  Array.isArray(selectedLabels) && selectedLabels.includes(label.id)
                                    ? 'text-black hover:bg-black/10'
                                    : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                                }`}
                                title="Supprimer l'étiquette"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <nav className="p-4">
                    <ul className="space-y-2">
                      <motion.li
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <button
                          onClick={() => setShowStats(true)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <FiActivity className="w-5 h-5" />
                          <span>Statistiques</span>
                        </button>
                      </motion.li>
                      <motion.li
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <button
                          onClick={() => setShowArchived(true)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <FiArchive className="w-5 h-5" />
                          <span>Tâches archivées</span>
                        </button>
                      </motion.li>
                      <motion.li
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <button
                          onClick={() => setShowLabels(true)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <FiTag className="w-5 h-5" />
                          <span>Étiquettes</span>
                        </button>
                      </motion.li>
                    </ul>
                  </nav>
                )}

                {/* Bouton de fermeture en bas */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark"
                >
                  <motion.button
                    onClick={handleCloseMenu}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 transform hover:scale-[0.98] active:scale-95"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <FiX className="w-5 h-5" />
                    <span className="font-medium">Fermer le menu</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Menu;
