import React from "react";
import { Clock, X, Calendar, Users, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TaskModal = ({ tasks, selectedDate, onClose }) => {
  const formatDate = (date) => {
    const daysOfWeek = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    const months = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];

    const dayOfWeek = daysOfWeek[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayOfWeek} ${day} ${month} ${year}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-2xl w-[90%] max-w-2xl relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tâches planifiées
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{selectedDate ? formatDate(selectedDate) : "Date sélectionnée"}</span>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {tasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Task Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {task.title}
                  </h3>
                  {task.time && (
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                      {task.time}
                    </span>
                  )}
                </div>

                {/* Task Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-4">{task.description}</p>

                {/* Associated Users */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {task.users.map((user, index) => (
                      <span 
                        key={user.id}
                        className="text-sm text-gray-600 dark:text-gray-300"
                      >
                        {user.firstName} {user.lastName}
                        {index < task.users.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Fermer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskModal;
