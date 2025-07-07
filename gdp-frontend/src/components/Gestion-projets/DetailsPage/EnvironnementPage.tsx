import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { Environnement, addEnvironnementToProject, fetchAllEnvironnementsByProjectId, updateEnvironnement } from "@/services/Project";
import { Project } from "@/services/Project";
import EnvironnementView from './EnvironnementView';
import { motion } from 'framer-motion';
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon, KeyIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { ServerIcon, CloudIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { getUserData } from '@/services/authService';

interface EnvironnementForm {
  nomServeur: string;
  systemeExploitation: string;
  ipServeur: string;
  port: number;
  type: string;
  Ptype: string;
  componentType: string;
  cpu: string;
  ram: string;
  stockage: string;
  logicielsInstalled: string[];
  nomUtilisateur: string;
  motDePasse: string;
}

interface FormErrors {
  [key: string]: string;
}

interface EnvironnementPageProps {
  project: Project;
}

const validateForm = (form: EnvironnementForm): FormErrors => {
  const errors: FormErrors = {};
  
  // Validation du nom du serveur
  if (!form.nomServeur) {
    errors.nomServeur = 'Le nom du serveur est requis';
  } else if (form.nomServeur.length < 3 || form.nomServeur.length > 50) {
    errors.nomServeur = 'Le nom du serveur doit contenir entre 3 et 50 caractères';
  } else if (!/^[a-zA-Z0-9-_]+$/.test(form.nomServeur)) {
    errors.nomServeur = 'Le nom du serveur ne peut contenir que des lettres, chiffres, tirets et underscores';
  }

  // Validation du système d'exploitation
  if (!form.systemeExploitation) {
    errors.systemeExploitation = 'Le système d\'exploitation est requis';
  } else if (form.systemeExploitation.length < 3 || form.systemeExploitation.length > 50) {
    errors.systemeExploitation = 'Le système d\'exploitation doit contenir entre 3 et 50 caractères';
  }

  // Validation de l'adresse IP
  if (!form.ipServeur) {
    errors.ipServeur = 'L\'adresse IP est requise';
  } else if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(form.ipServeur)) {
    errors.ipServeur = 'L\'adresse IP doit être une adresse IPv4 valide';
  }

  // Validation du port
  if (!form.port) {
    errors.port = 'Le port est requis';
  } else if (form.port < 1 || form.port > 65535) {
    errors.port = 'Le port doit être compris entre 1 et 65535';
  }

  // Validation du CPU
  if (!form.cpu) {
    errors.cpu = 'La configuration CPU est requise';
  } else if (!/^[0-9]+(\.[0-9]+)?\s*(GHz|MHz|cores?)$/i.test(form.cpu)) {
    errors.cpu = 'La configuration CPU doit être au format: "2.4 GHz" ou "4 cores"';
  }

  // Validation de la RAM
  if (!form.ram) {
    errors.ram = 'La configuration RAM est requise';
  } else if (!/^[0-9]+(\.[0-9]+)?\s*(GB|MB)$/i.test(form.ram)) {
    errors.ram = 'La configuration RAM doit être au format: "8 GB" ou "16 GB"';
  }

  // Validation du stockage
  if (!form.stockage) {
    errors.stockage = 'La configuration de stockage est requise';
  } else if (!/^[0-9]+(\.[0-9]+)?\s*(GB|TB)$/i.test(form.stockage)) {
    errors.stockage = 'La configuration de stockage doit être au format: "500 GB" ou "1 TB"';
  }

  // Validation des logiciels installés
  if (!form.logicielsInstalled.length) {
    errors.logicielsInstalled = 'Au moins un logiciel doit être spécifié';
  } else if (form.logicielsInstalled.length > 20) {
    errors.logicielsInstalled = 'La liste des logiciels ne peut pas dépasser 20 éléments';
  }

  // Validation du nom d'utilisateur
  if (!form.nomUtilisateur) {
    errors.nomUtilisateur = 'Le nom d\'utilisateur est requis';
  } else if (form.nomUtilisateur.length < 3 || form.nomUtilisateur.length > 50) {
    errors.nomUtilisateur = 'Le nom d\'utilisateur doit contenir entre 3 et 50 caractères';
  } else if (!/^[a-zA-Z0-9-_]+$/.test(form.nomUtilisateur)) {
    errors.nomUtilisateur = 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores';
  }

  // Validation du mot de passe
  if (!form.motDePasse) {
    errors.motDePasse = 'Le mot de passe est requis';
  } else if (form.motDePasse.length < 8 || form.motDePasse.length > 50) {
    errors.motDePasse = 'Le mot de passe doit contenir entre 8 et 50 caractères';
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(form.motDePasse)) {
    errors.motDePasse = 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial';
  }

  return errors;
};

const sanitizeEnvironnementData = (data: EnvironnementForm, project: Project, editingEnvironnementId: number | null): Environnement => {
  return {
    id: editingEnvironnementId ?? undefined,
    projectId: project.id,
    nomServeur: data.nomServeur,
    systemeExploitation: data.systemeExploitation,
    ipServeur: data.ipServeur,
    port: data.port,
    type: data.type,
    Ptype: data.Ptype,
    componentType: data.componentType,
    cpu: data.cpu,
    ram: data.ram,
    stockage: data.stockage,
    logicielsInstalled: data.logicielsInstalled,
    nomUtilisateur: data.nomUtilisateur,
    motDePasse: data.motDePasse,
  };
};

const EnvironnementPage = ({ project }: EnvironnementPageProps) => {
  const [environnementForm, setEnvironnementForm] = useState<EnvironnementForm>({
    nomServeur: '',
    systemeExploitation: '',
    ipServeur: '',
    port: 0,
    type: '',
    Ptype: '',
    componentType: '',
    cpu: '',
    ram: '',
    stockage: '',
    logicielsInstalled: [],
    nomUtilisateur: '',
    motDePasse: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [environnements, setEnvironnements] = useState<Environnement[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [showEnvironnementForm, setShowEnvironnementForm] = useState(false);
  const [editingEnvironnementId, setEditingEnvironnementId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState('table');
  const [showPassword, setShowPassword] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEnvironment, setNewEnvironment] = useState<Environnement>({
    id: undefined,
    projectId: project.id,
    nomServeur: '',
    systemeExploitation: '',
    ipServeur: '',
    port: 0,
    type: '',
    Ptype: '',
    componentType: '',
    cpu: '',
    ram: '',
    stockage: '',
    logicielsInstalled: [],
    nomUtilisateur: '',
    motDePasse: '',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userData = getUserData();
    setUserRole(userData?.role || null);
  }, []);

  useEffect(() => {
    const fetchEnvironnements = async () => {
      try {
        const data = await fetchAllEnvironnementsByProjectId(project.id);
        setEnvironnements(data);
      } catch (error) {
        console.error('Error fetching environnements:', error);
      }
    };

    fetchEnvironnements();
  }, [project.id]);

  const handleEnvironnementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEnvironnementForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEnvironnementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm(environnementForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const environnementData = sanitizeEnvironnementData(environnementForm, project, editingEnvironnementId);

      if (editingEnvironnementId) {
        await updateEnvironnement(editingEnvironnementId, environnementData);
      } else {
        await addEnvironnementToProject(environnementData);
      }

      const updatedEnvironnements = await fetchAllEnvironnementsByProjectId(project.id);
      setEnvironnements(updatedEnvironnements);
      setShowAlert(true);
      setShowEnvironnementForm(false);
      setEditingEnvironnementId(null);
      setEnvironnementForm({
        nomServeur: '',
        systemeExploitation: '',
        ipServeur: '',
        port: 0,
        type: '',
        Ptype: '',
        componentType: '',
        cpu: '',
        ram: '',
        stockage: '',
        logicielsInstalled: [],
        nomUtilisateur: '',
        motDePasse: '',
      });
    } catch (error: any) {
      console.error('Error adding/updating environnement:', error);
      if (error.response?.status === 409) {
        setErrorMessage('Cette adresse IP est déjà utilisée par un autre environnement.');
      } else {
        setErrorMessage('Une erreur est survenue lors de l\'ajout de l\'environnement.');
      }
    }
  };

  const renderFormField = (name: string, label: string, type: string = 'text', placeholder: string = '') => {
    const error = formErrors[name];
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        <div className="relative">
          {name === 'motDePasse' ? (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name={name}
                value={environnementForm[name as keyof EnvironnementForm] as string}
                onChange={handleEnvironnementChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
                placeholder={placeholder}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          ) : name === 'logicielsInstalled' ? (
            <input
              type="text"
              name={name}
              value={environnementForm.logicielsInstalled.join(', ')}
              onChange={(e) => {
                const logiciels = e.target.value.split(',').map((item) => item.trim());
                setEnvironnementForm((prevForm) => ({
                  ...prevForm,
                  logicielsInstalled: logiciels,
                }));
                if (formErrors[name]) {
                  setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                  });
                }
              }}
              className={`w-full px-4 py-2 rounded-lg border ${
                error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
              placeholder={placeholder}
            />
          ) : (
            <input
              type={type}
              name={name}
              value={environnementForm[name as keyof EnvironnementForm] as string}
              onChange={handleEnvironnementChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
              placeholder={placeholder}
            />
          )}
          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              <FaExclamationTriangle />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#2560a0] via-[#2560a0] to-[#d01e3e] rounded-2xl shadow-xl p-6 mb-6 border border-white/30 dark:border-gray-700 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
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
              className={`absolute w-32 h-20 rounded-xl border ${
                i % 3 === 0
                  ? "bg-red-100/40 border-red-200/40"
                  : i % 3 === 1
                  ? "bg-yellow-100/40 border-yellow-200/40"
                  : "bg-blue-100/40 border-blue-200/40"
              }`}
              style={{
                left: `${5 + i * 20}%`,
                top: `${20 + (i % 2) * 30}%`,
                transform: `rotate(${i * 3}deg)`,
              }}
            >
              <div className="p-2">
                {i % 3 === 0 ? (
                  <ServerIcon className="w-6 h-6 text-red-500/70" />
                ) : i % 3 === 1 ? (
                  <CloudIcon className="w-6 h-6 text-yellow-500/70" />
                ) : (
                  <CircleStackIcon className="w-6 h-6 text-blue-500/70" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Environnements</h2>
              <p className="mt-1 text-white/80">Gérez les environnements de votre projet</p>
            </div>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                {viewMode === 'table' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Vue Grille
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Vue Tableau
                  </>
                )}
              </motion.button>
              {(userRole === 'ADMIN' || userRole === 'INFRA') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEnvironnementForm(true)}
                  className="px-4 py-2 rounded-xl bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Ajouter un Environnement
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Détails
                  </th>
                  {(userRole === 'ADMIN' || userRole === 'INFRA') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {environnements.length > 0 ? (
                  environnements.map((environnement, index) => (
                    <motion.tr
                      key={environnement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ServerIcon className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{environnement.nomServeur}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Système:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{environnement.systemeExploitation}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">IP:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{environnement.ipServeur}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Type:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{environnement.type}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Protocole:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{environnement.Ptype}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {(userRole === 'ADMIN' || userRole === 'INFRA') && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setShowEnvironnementForm(true);
                              setEditingEnvironnementId(environnement.id ?? null);
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
                                nomUtilisateur: environnement.nomUtilisateur,
                                motDePasse: environnement.motDePasse,
                              });
                            }}
                            className="text-[#2560a0] hover:text-[#1a4a7a] dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={userRole === 'ADMIN' || userRole === 'INFRA' ? 2 : 1} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Aucun environnement disponible.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <EnvironnementView environnements={environnements} projectName={project.name} />
        )}
      </div>

      {/* Modal Form */}
      {showEnvironnementForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingEnvironnementId ? 'Modifier l\'Environnement' : 'Ajouter un Environnement'}
                </h3>
                <button
                  onClick={() => {
                    setShowEnvironnementForm(false);
                    setEditingEnvironnementId(null);
                    setFormErrors({});
                    setErrorMessage('');
                  }}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEnvironnementSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Informations de base</h4>
                  {renderFormField('nomServeur', 'Nom du Serveur', 'text', 'ex: server-01')}
                  {renderFormField('systemeExploitation', 'Système d\'exploitation', 'text', 'ex: Ubuntu 20.04')}
                  {renderFormField('ipServeur', 'IP Serveur', 'text', 'ex: 192.168.1.1')}
                  {renderFormField('port', 'Port', 'number', 'ex: 8080')}
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Configuration</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        name="type"
                        value={environnementForm.type}
                        onChange={handleEnvironnementChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Sélectionnez un type</option>
                        <option value="DEV">DEV</option>
                        <option value="PREPROD">PREPROD</option>
                        <option value="PROD">PROD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Protocole
                      </label>
                      <select
                        name="Ptype"
                        value={environnementForm.Ptype}
                        onChange={handleEnvironnementChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Sélectionnez un protocole</option>
                        <option value="SSH">SSH</option>
                        <option value="TELNET">TELNET</option>
                        <option value="RDP">RDP</option>
                        <option value="HTTP">HTTP</option>
                        <option value="HTTPS">HTTPS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type de Composant
                      </label>
                      <select
                        name="componentType"
                        value={environnementForm.componentType}
                        onChange={handleEnvironnementChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Sélectionnez un type de composant</option>
                        <option value="BDD">BDD</option>
                        <option value="BACKEND">BACKEND</option>
                        <option value="FRONTEND">FRONTEND</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ressources</h4>
                  {renderFormField('cpu', 'CPU', 'text', 'ex: 2.4 GHz')}
                  {renderFormField('ram', 'RAM', 'text', 'ex: 8 GB')}
                  {renderFormField('stockage', 'Stockage', 'text', 'ex: 500 GB')}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Accès</h4>
                {renderFormField('logicielsInstalled', 'Logiciels installés', 'text', 'ex: Apache, MySQL, PHP')}
                {renderFormField('nomUtilisateur', 'Nom d\'utilisateur', 'text', 'ex: admin')}
                {renderFormField('motDePasse', 'Mot de passe', 'password', '••••••••')}
              </div>

              {/* Error Message inside the form */}
              {errorMessage && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
                  <FaExclamationTriangle className="w-5 h-5 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setShowEnvironnementForm(false);
                    setEditingEnvironnementId(null);
                    setFormErrors({});
                    setErrorMessage('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-2 bg-[#2560a0] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors flex items-center gap-2"
                >
                  <FaCheckCircle className="w-5 h-5" />
                  {editingEnvironnementId ? 'Mettre à jour' : 'Ajouter'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Success Alert */}
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3"
        >
          <FaCheckCircle className="w-5 h-5 text-green-500" />
          <span>{editingEnvironnementId !== null ? 'Environnement modifié avec succès!' : 'Environnement ajouté avec succès!'}</span>
          <button
            onClick={() => setShowAlert(false)}
            className="text-green-500 hover:text-green-600 dark:hover:text-green-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EnvironnementPage;
