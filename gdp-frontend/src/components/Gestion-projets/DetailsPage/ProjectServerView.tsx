"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { BsFileEarmarkExcelFill } from 'react-icons/bs';
import { Project, Environnement, fetchAllProjects, fetchAllEnvironnementsByProjectId, addEnvironnementToProject, exportEnvironnementsToExcel, deleteEnvironnement, updateEnvironnement } from '@/services/Project';
import { motion, AnimatePresence } from 'framer-motion';
import { ServerIcon, CpuChipIcon, CircleStackIcon, GlobeAltIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { FiPlus, FiSearch, FiTrash2, FiX, FiCheck, FiClock, FiUser, FiEdit2 } from 'react-icons/fi';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, serverName }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serverName: string;
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
                Êtes-vous sûr de vouloir supprimer le serveur <span className="font-medium text-gray-900 dark:text-white">{serverName}</span> ? Cette action est irréversible.
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

const ErrorNotification = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
            <FiX className="w-5 h-5 text-red-600 dark:text-red-300" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

const ProjectServerView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [environnementsMap, setEnvironnementsMap] = useState<Map<number, Environnement[]>>(new Map());
  const [activeTab, setActiveTab] = useState('environnements');
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [selectedEnvironnement, setSelectedEnvironnement] = useState<Environnement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProjects, setEditingProjects] = useState<Set<number>>(new Set());
  const [environnementForm, setEnvironnementForm] = useState({
    nomServeur: '',
    systemeExploitation: '',
    ipServeur: '',
    port: 0,
    type: 'DEV',
    Ptype: 'SSH', // Default protocol type
    componentType: 'BDD', // Default component type
    cpu: '',
    ram: '',
    stockage: '',
    logicielsInstalled: [] as string[],
    projectId: 0,
    nomUtilisateur: '',
    motDePasse: '',
  });
  const [stats, setStats] = useState({
    totalEnvironnements: 0,
    devEnvironnements: 0,
    prodEnvironnements: 0,
    preprodEnvironnements: 0,
    testEnvironnements: 0,
    autreEnvironnements: 0,
    totalProjects: 0
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; environnementId: number | null; serverName: string; projectId: number }>({
    isOpen: false,
    environnementId: null,
    serverName: "",
    projectId: 0
  });
  const [successMessage, setSuccessMessage] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const [errorMessage, setErrorMessage] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allProjects = await fetchAllProjects();
        setProjects(allProjects);
        setStats(prev => ({ ...prev, totalProjects: allProjects.length }));

        const environnementsMap = new Map<number, Environnement[]>();
        let devCount = 0;
        let prodCount = 0;
        let preprodCount = 0;
        let testCount = 0;
        let autreCount = 0;

        for (const project of allProjects) {
          const environnements = await fetchAllEnvironnementsByProjectId(project.id);
          environnementsMap.set(project.id, environnements);
          
          environnements.forEach(env => {
            switch (env.type) {
              case 'DEV':
                devCount++;
                break;
              case 'PROD':
                prodCount++;
                break;
              case 'PREPROD':
                preprodCount++;
                break;
              case 'TEST':
                testCount++;
                break;
              case 'AUTRE':
                autreCount++;
                break;
            }
          });
        }

        setEnvironnementsMap(environnementsMap);
        setStats(prev => ({
          ...prev,
          totalEnvironnements: Array.from(environnementsMap.values()).flat().length,
          devEnvironnements: devCount,
          prodEnvironnements: prodCount,
          preprodEnvironnements: preprodCount,
          testEnvironnements: testCount,
          autreEnvironnements: autreCount
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleEnvironnementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEnvironnementForm((prevForm) => ({
      ...prevForm,
      [name]: name === "projectId" ? (value ? Number(value) : null) : value,
    }));
  };

  const handleEnvironnementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (environnementForm.projectId === null || isNaN(environnementForm.projectId)) {
      alert("Veuillez sélectionner un projet valide.");
      return;
    }

    try {
      const environnementData = {
        ...environnementForm,
        projectId: environnementForm.projectId,
      };

      await addEnvironnementToProject(environnementData);

      const updatedEnvironnements = await fetchAllEnvironnementsByProjectId(environnementForm.projectId);
      setEnvironnementsMap((prevMap) => new Map(prevMap).set(environnementForm.projectId, updatedEnvironnements));

      setActiveTab('environnements');
    } catch (error) {
      console.error('Error adding environnement:', error);
    }
  };

  const handleExportToExcel = async () => {
    try {
      await exportEnvironnementsToExcel();
    } catch (error) {
      console.error('Erreur lors de l&apos;exportation vers Excel :', error);
    }
  };

  const getFieldsForType = (type: string, Ptype: string, componentType: string) => {
    const fields = {
      basic: ['nomServeur', 'systemeExploitation', 'ipServeur', 'port'],
      typeSpecific: [] as string[],
      protocolSpecific: [] as string[],
      componentSpecific: [] as string[],
      hardware: [] as string[],
      credentials: [] as string[],
      software: [] as string[],
    };

    // Type specific fields
    if (type === 'PROD') {
      fields.typeSpecific.push('cpu', 'ram', 'stockage');
    } else if (type === 'DEV') {
      fields.typeSpecific.push('cpu', 'ram', 'stockage');
    } else if (type === 'PREPROD') {
      fields.typeSpecific.push('cpu', 'ram', 'stockage');
    }

    // Protocol specific fields
    if (['SSH', 'TELNET', 'RDP'].includes(Ptype)) {
      fields.protocolSpecific.push('nomUtilisateur', 'motDePasse');
    }

    // Component specific fields
    if (componentType === 'BDD') {
      fields.componentSpecific.push('logicielsInstalled');
    } else if (componentType === 'BACKEND') {
      fields.componentSpecific.push('logicielsInstalled');
    } else if (componentType === 'FRONTEND') {
      fields.componentSpecific.push('logicielsInstalled');
    }

    // Hardware fields (always shown)
    fields.hardware.push('cpu', 'ram', 'stockage');

    // Credentials fields (always shown)
    fields.credentials.push('nomUtilisateur', 'motDePasse');

    // Software fields (always shown)
    fields.software.push('logicielsInstalled');

    return fields;
  };

  const renderFormField = (fieldName: string) => {
    const fieldConfig = {
      nomServeur: {
        label: "Nom du Serveur",
        type: "text",
        placeholder: "Entrez le nom du serveur",
        required: true
      },
      systemeExploitation: {
        label: "Système d'exploitation",
        type: "text",
        placeholder: "Entrez le système d'exploitation",
        required: true
      },
      ipServeur: {
        label: "IP Serveur",
        type: "text",
        placeholder: "Entrez l'adresse IP",
        required: true
      },
      port: {
        label: "Port",
        type: "number",
        placeholder: "Entrez le port",
        required: true
      },
      cpu: {
        label: "CPU",
        type: "text",
        placeholder: "Spécifications CPU (ex: Intel Xeon 2.4GHz, 4 cores)",
        required: true
      },
      ram: {
        label: "RAM",
        type: "text",
        placeholder: "Spécifications RAM (ex: 16GB DDR4)",
        required: true
      },
      stockage: {
        label: "Stockage",
        type: "text",
        placeholder: "Spécifications Stockage (ex: 500GB SSD)",
        required: true
      },
      nomUtilisateur: {
        label: "Nom d'utilisateur",
        type: "text",
        placeholder: "Nom d'utilisateur pour l'accès",
        required: true
      },
      motDePasse: {
        label: "Mot de passe",
        type: "password",
        placeholder: "Mot de passe pour l'accès",
        required: true
      },
      logicielsInstalled: {
        label: "Logiciels installés",
        type: "text",
        placeholder: "Logiciels installés (séparés par des virgules)",
        required: true
      }
    };

    const config = fieldConfig[fieldName as keyof typeof fieldConfig];
    if (!config) return null;

    return (
      <div className="form-group" key={fieldName}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {config.label} {config.required && <span className="text-red-500">*</span>}
        </label>
        {fieldName === 'logicielsInstalled' ? (
          <input
            type={config.type}
            name={fieldName}
            value={environnementForm.logicielsInstalled.join(', ')}
            onChange={(e) => {
              const logiciels = e.target.value.split(',').map((item) => item.trim());
              setEnvironnementForm((prevForm) => ({
                ...prevForm,
                logicielsInstalled: logiciels,
              }));
            }}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder={config.placeholder}
            required={config.required}
          />
        ) : (
          <input
            type={config.type}
            name={fieldName}
            value={environnementForm[fieldName as keyof typeof environnementForm] as string}
            onChange={handleEnvironnementChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder={config.placeholder}
            required={config.required}
          />
        )}
      </div>
    );
  };

  const handleEditEnvironnement = (environnement: Environnement) => {
    setSelectedEnvironnement(environnement);
    setEnvironnementForm({
      nomServeur: environnement.nomServeur,
      systemeExploitation: environnement.systemeExploitation,
      ipServeur: environnement.ipServeur,
      port: environnement.port,
      type: environnement.type,
      Ptype: environnement.Ptype,
      componentType: environnement.componentType,
      cpu: environnement.cpu,
      ram: environnement.ram,
      stockage: environnement.stockage,
      logicielsInstalled: environnement.logicielsInstalled,
      projectId: environnement.projectId,
      nomUtilisateur: environnement.nomUtilisateur,
      motDePasse: environnement.motDePasse,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteEnvironnement = async (environnementId: number, projectId: number, serverName: string) => {
    setDeleteModal({
      isOpen: true,
      environnementId,
      serverName,
      projectId
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.environnementId) return;

    try {
      await deleteEnvironnement(deleteModal.environnementId);
      const updatedEnvironnements = await fetchAllEnvironnementsByProjectId(deleteModal.projectId);
      setEnvironnementsMap(prev => new Map(prev).set(deleteModal.projectId, updatedEnvironnements));
      setDeleteModal({ isOpen: false, environnementId: null, serverName: "", projectId: 0 });
      setSuccessMessage({
        show: true,
        message: "Le serveur a été supprimé avec succès",
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "" });
      }, 3000);
    } catch (error) {
      setDeleteModal({ isOpen: false, environnementId: null, serverName: "", projectId: 0 });
      setErrorMessage({
        show: true,
        message: "Une erreur est survenue lors de la suppression du serveur",
      });
      setTimeout(() => {
        setErrorMessage({ show: false, message: "" });
      }, 3000);
    }
  };

  const handleUpdateEnvironnement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnvironnement?.id) return;

    try {
      await updateEnvironnement(selectedEnvironnement.id, {
        ...environnementForm,
        id: selectedEnvironnement.id,
        projectId: selectedEnvironnement.projectId
      });

      const updatedEnvironnements = await fetchAllEnvironnementsByProjectId(selectedEnvironnement.projectId);
      setEnvironnementsMap(prev => new Map(prev).set(selectedEnvironnement.projectId, updatedEnvironnements));
      setIsEditModalOpen(false);
      setSelectedEnvironnement(null);
      setSuccessMessage({
        show: true,
        message: "Le serveur a été mis à jour avec succès",
      });
      setTimeout(() => {
        setSuccessMessage({ show: false, message: "" });
      }, 3000);
    } catch (error) {
      console.error('Error updating environnement:', error);
      setErrorMessage({
        show: true,
        message: "Une erreur est survenue lors de la mise à jour du serveur",
      });
      setTimeout(() => {
        setErrorMessage({ show: false, message: "" });
      }, 3000);
    }
  };

  const toggleProjectEditMode = (projectId: number) => {
    setEditingProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Enhanced Animations */}
        <div className="bg-gradient-to-r from-[#2560a0] via-[#2560a0] to-[#d01e3e] rounded-2xl shadow-xl p-8 mb-8 border border-white/30 dark:border-gray-700 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.5, 0.2],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 8 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.2,
                }}
                className={`absolute w-40 h-24 rounded-xl border ${
                  i % 3 === 0 
                    ? "bg-red-100/40 border-red-200/40" 
                    : i % 3 === 1 
                    ? "bg-yellow-100/40 border-yellow-200/40" 
                    : "bg-blue-100/40 border-blue-200/40"
                }`}
                style={{
                  left: `${5 + i * 15}%`,
                  top: `${20 + (i % 2) * 30}%`,
                  transform: `rotate(${i * 3}deg)`,
                }}
              >
                <div className="p-2">
                  {i % 3 === 0 ? (
                    <ServerIcon className="w-6 h-6 text-red-500/70" />
                  ) : i % 3 === 1 ? (
                    <CircleStackIcon className="w-6 h-6 text-yellow-500/70" />
                  ) : (
                    <GlobeAltIcon className="w-6 h-6 text-blue-500/70" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl font-bold text-white mb-4 md:mb-0"
                >
                  Gestion des Environnements
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-2 text-white/80 max-w-2xl"
                >
                  Gérez et surveillez tous vos environnements de développement et de production en un seul endroit.
                </motion.p>
              </div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-4"
              >
                <button
                  onClick={() => setActiveTab('environnements')}
                  className={`px-6 py-2 rounded-xl transition-all duration-300 ease-in-out flex items-center transform hover:scale-105 ${
                    activeTab === 'environnements'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <span className="mr-2">📋</span>
                  Liste des Environnements
                </button>
                <button
                  onClick={() => setActiveTab('addEnvironnement')}
                  className={`px-6 py-2 rounded-xl transition-all duration-300 ease-in-out flex items-center transform hover:scale-105 ${
                    activeTab === 'addEnvironnement'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <span className="mr-2">➕</span>
                  Nouvel Environnement
                </button>
                <button
                  onClick={handleExportToExcel}
                  className="px-6 py-2 rounded-xl bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
                >
                  <BsFileEarmarkExcelFill className="text-white text-lg" />
                  Exporter Excel
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                  <ServerIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Environnements</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEnvironnements}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                  <CpuChipIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Environnements DEV</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.devEnvironnements}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-red-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/20">
                  <ShieldCheckIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Environnements PROD</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.prodEnvironnements}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/20">
                  <ServerIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Environnements PREPROD</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.preprodEnvironnements}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                  <ServerIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Environnements TEST</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.testEnvironnements}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-gray-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-900/20">
                  <ServerIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Environnements AUTRE</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.autreEnvironnements}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Rest of your existing content */}
        {activeTab === 'environnements' && (
          <div className="space-y-8">
            {projects.map((project, index) => {
              const environnements = environnementsMap.get(project.id);
              if (environnements && environnements.length > 0) {
                return (
                  <motion.div
                    key={`project-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Image
                          src="/images/icon/projet.jpg"
                          alt="Projet"
                          width={56}
                          height={56}
                          className="rounded-full mr-4"
                        />
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                          {project.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => toggleProjectEditMode(project.id)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          editingProjects.has(project.id)
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-[#2560a0] hover:bg-[#1e4d7d] text-white'
                        }`}
                      >
                        {editingProjects.has(project.id) ? 'Terminer' : 'Modifier l\'environnement'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {environnements.map((environnement) => (
                        <motion.div
                          key={`environnement-${environnement.id}`}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative"
                        >
                          {editingProjects.has(project.id) && (
                            <div className="absolute top-4 right-4 flex gap-2">
                              <button
                                onClick={() => handleEditEnvironnement(environnement)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                title="Modifier"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteEnvironnement(environnement.id!, project.id, environnement.nomServeur)}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                title="Supprimer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          )}
                          <div className="flex items-center mb-4">
                            <Image
                              src="/images/icon/serveur.jpg"
                              alt="Serveur"
                              width={48}
                              height={48}
                              className="rounded-full mr-4"
                            />
                            <div>
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {environnement.nomServeur}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {environnement.type} - {environnement.componentType}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">OS:</span>
                              <span className="text-gray-800 dark:text-white">{environnement.systemeExploitation}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">IP:</span>
                              <span className="text-gray-800 dark:text-white">{environnement.ipServeur}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">CPU:</span>
                              <span className="text-gray-800 dark:text-white">{environnement.cpu}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">RAM:</span>
                              <span className="text-gray-800 dark:text-white">{environnement.ram}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Stockage:</span>
                              <span className="text-gray-800 dark:text-white">{environnement.stockage}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Protocole:</span>
                              <span className="text-gray-800 dark:text-white">{environnement.Ptype}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              }
              return null;
            })}
          </div>
        )}

        {activeTab === 'addEnvironnement' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 flex items-center">
              <span className="mr-2">➕</span>
              Ajouter un Nouvel Environnement
            </h2>
            <form onSubmit={handleEnvironnementSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Informations de base</h3>
                  {getFieldsForType(environnementForm.type, environnementForm.Ptype, environnementForm.componentType).basic.map(renderFormField)}
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Configuration</h3>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={environnementForm.type}
                      onChange={handleEnvironnementChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    >
                      <option value="DEV">DEV</option>
                      <option value="PREPROD">PREPROD</option>
                      <option value="PROD">PROD</option>
                      <option value="TEST">TEST</option>
                      <option value="AUTRE">AUTRE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Protocole <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="Ptype"
                      value={environnementForm.Ptype}
                      onChange={handleEnvironnementChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    >
                      <option value="SSH">SSH</option>
                      <option value="TELNET">TELNET</option>
                      <option value="RDP">RDP</option>
                      <option value="HTTP">HTTP</option>
                      <option value="HTTPS">HTTPS</option>
                      <option value="FTP">FTP</option>
                      <option value="SMTP">SMTP</option>
                      <option value="TEST">TEST</option>
                      <option value="AUTRE">AUTRE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Composant <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="componentType"
                      value={environnementForm.componentType}
                      onChange={handleEnvironnementChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    >
                      <option value="BDD">BDD</option>
                      <option value="BACKEND">BACKEND</option>
                      <option value="FRONTEND">FRONTEND</option>
                      <option value="AUTRE">AUTRE</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Spécifications matérielles</h3>
                  {getFieldsForType(environnementForm.type, environnementForm.Ptype, environnementForm.componentType).hardware.map(renderFormField)}
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Identifiants</h3>
                  {getFieldsForType(environnementForm.type, environnementForm.Ptype, environnementForm.componentType).credentials.map(renderFormField)}
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Logiciels</h3>
                  {getFieldsForType(environnementForm.type, environnementForm.Ptype, environnementForm.componentType).software.map(renderFormField)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Projet <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="projectId"
                    value={environnementForm.projectId ?? ''}
                    onChange={handleEnvironnementChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="">Sélectionnez un projet</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 flex items-center"
                >
                  <span className="mr-2">➕</span>
                  Ajouter l&apos;Environnement
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Modal de modification */}
        {isEditModalOpen && selectedEnvironnement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Modifier l&apos;environnement
              </h2>
              <form onSubmit={handleUpdateEnvironnement} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getFieldsForType(environnementForm.type, environnementForm.Ptype, environnementForm.componentType).basic.map(renderFormField)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getFieldsForType(environnementForm.type, environnementForm.Ptype, environnementForm.componentType).hardware.map(renderFormField)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getFieldsForType(environnementForm.type, environnementForm.Ptype, environnementForm.componentType).credentials.map(renderFormField)}
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => handleDeleteEnvironnement(selectedEnvironnement.id!, selectedEnvironnement.projectId!, selectedEnvironnement.nomServeur)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Supprimer
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedEnvironnement(null);
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ajout des notifications et du modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, environnementId: null, serverName: "", projectId: 0 })}
          onConfirm={confirmDelete}
          serverName={deleteModal.serverName}
        />
        <AnimatePresence>
          {successMessage.show && (
            <SuccessNotification
              message={successMessage.message}
              onClose={() => setSuccessMessage({ show: false, message: "" })}
            />
          )}
          {errorMessage.show && (
            <ErrorNotification
              message={errorMessage.message}
              onClose={() => setErrorMessage({ show: false, message: "" })}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProjectServerView;
