"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiX, FiCheck } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simuler le chargement des notifications
    const fetchNotifications = async () => {
      try {
        // TODO: Remplacer par l'appel API réel
        const mockNotifications: Notification[] = [
          {
            id: 1,
            title: "Nouvelle tâche",
            message: "Une nouvelle tâche vous a été assignée",
            date: "2024-04-09T10:00:00",
            read: false,
          },
          {
            id: 2,
            title: "Rappel",
            message: "Votre réunion commence dans 15 minutes",
            date: "2024-04-09T09:45:00",
            read: true,
          },
        ];
        setNotifications(mockNotifications);
      } catch (error) {
        console.error("Erreur lors du chargement des notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lu
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));
    // TODO: Ajouter la logique de navigation
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <FiBell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#d01e3e] text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#d01e3e]"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Aucune notification
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        notification.read
                          ? "bg-gray-50 hover:bg-gray-100"
                          : "bg-blue-50 hover:bg-blue-100"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {notification.read ? (
                            <FiCheck className="w-5 h-5 text-gray-400" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-[#d01e3e] mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropdownNotification;
