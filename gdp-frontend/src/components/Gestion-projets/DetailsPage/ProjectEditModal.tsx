"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Edit, Users, Calendar, FileText, Link, AlertCircle } from 'lucide-react';
import { Project, updateProject } from '@/services/Project';
import { fetchAllUsers } from '@/services/user';
import { User } from '@/services/user';

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onProjectUpdated: (updatedProject: Project) => void;
}

interface FormData {
  name: string;
  description: string;
  status: string;
  priorite: string;
  etat: string;
  linkprojet: string;
  estimatedEndDate: string;
  userIds: number[];
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  isOpen,
  onClose,
  project,
  onProjectUpdated
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    status: 'En cours',
    priorite: 'Moyenne',
    etat: 'Projet existant',
    linkprojet: '',
    estimatedEndDate: '',
    userIds: []
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialiser les données du formulaire quand le projet change
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'En cours',
        priorite: project.priorite || 'Moyenne',
        etat: project.etat || 'Projet existant',
        linkprojet: project.linkprojet || '',
        estimatedEndDate: project.estimatedEndDate 
          ? new Date(project.estimatedEndDate).toISOString().split('T')[0]
          : '',
        userIds: project.users?.map(user => user.id) || []
      });
    }
  }, [project]);

  // Charger les utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await fetchAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    };

    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserToggle = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter(id => id !== userId)
        : [...prev.userIds, userId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        ...formData,
        estimatedEndDate: formData.estimatedEndDate ? new Date(formData.estimatedEndDate) : null
      };

      // Utiliser la fonction de mise à jour du service
      const updatedProject = await updateProject(project.id, updateData);
      
      setSuccess('Projet mis à jour avec succès !');
      onProjectUpdated(updatedProject);
      
      // Fermer le modal après 2 secondes
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Erreur lors de la mise à jour du projet');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-boxdark rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stroke dark:border-strokedark">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Edit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Modifier le Projet
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {project.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Alert Messages */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-green-700 dark:text-green-300">{success}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="A faire">À faire</option>
                  <option value="En cours">En cours</option>
                  <option value="Fini">Fini</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priorité
                </label>
                <select
                  name="priorite"
                  value={formData.priorite}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Faible">Faible</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Haute">Haute</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  État
                </label>
                <select
                  name="etat"
                  value={formData.etat}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Projet existant">Projet existant</option>
                  <option value="Projet à partir de zéro">Projet à partir de zéro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de fin estimée
                </label>
                <input
                  type="date"
                  name="estimatedEndDate"
                  value={formData.estimatedEndDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lien du projet
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    name="linkprojet"
                    value={formData.linkprojet}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Décrivez le projet..."
              />
            </div>

            {/* Users Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Users className="w-4 h-4 inline mr-2" />
                Utilisateurs assignés
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.userIds.includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : user.role === 'DEVELOPPER'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-stroke dark:border-strokedark">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Mettre à jour
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProjectEditModal; 