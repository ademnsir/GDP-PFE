'use client';
import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaCheckCircle, FaCopy } from "react-icons/fa";
import { Checklist, addChecklistToProject, fetchAllChecklistsByProjectId, updateChecklist } from "@/services/Project";
import { Project } from "@/services/Project";
import { motion } from 'framer-motion';
import { PlusIcon, DocumentTextIcon, GlobeAltIcon, PencilSquareIcon, XMarkIcon, KeyIcon } from '@heroicons/react/24/outline';
import { getUserData } from '@/services/authService';

interface ChecklistForm {
  spec: string;
  frs: string;
  lienGitFrontend: string;
  lienGitBackend: string;
  includeSpec: boolean;
  includeFrs: boolean;
  includeLienGit: boolean;
}

interface ChecklistPageProps {
  project: Project;
}

const sanitizeChecklistData = (data: ChecklistForm, project: Project, editingChecklistId: number | null): Checklist => {
  return {
    id: editingChecklistId ?? undefined,
    projectId: project.id,
    spec: data.spec ?? "",
    frs: data.frs ?? "",
    lienGitFrontend: data.lienGitFrontend ?? "",
    lienGitBackend: data.lienGitBackend ?? "",
  };
};

const ChecklistPage = ({ project }: ChecklistPageProps) => {
  const [checklistForm, setChecklistForm] = useState<ChecklistForm>({
    spec: '',
    frs: '',
    lienGitFrontend: '',
    lienGitBackend: '',
    includeSpec: false,
    includeFrs: false,
    includeLienGit: false,
  });

  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [editingChecklistId, setEditingChecklistId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userData = getUserData();
    setUserRole(userData?.role || null);
  }, []);

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const data = await fetchAllChecklistsByProjectId(project.id);
        setChecklists(data);
      } catch (error) {
        console.error('Error fetching checklists:', error);
      }
    };

    fetchChecklists();
  }, [project.id]);

  const handleChecklistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setChecklistForm((prevForm) => {
      const updatedForm = { ...prevForm, [name]: type === 'checkbox' ? checked : value };
      if (!checked && type === 'checkbox') {
        switch (name) {
          case 'includeSpec':
            updatedForm.spec = '';
            break;
          case 'includeFrs':
            updatedForm.frs = '';
            break;
          case 'includeLienGit':
            updatedForm.lienGitFrontend = '';
            updatedForm.lienGitBackend = '';
            break;
          default:
            break;
        }
      }
      return updatedForm;
    });
  };

  const handleChecklistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const checklistData = sanitizeChecklistData(checklistForm, project, editingChecklistId);

      if (editingChecklistId) {
        await updateChecklist(editingChecklistId, checklistData);
      } else {
        await addChecklistToProject(checklistData);
      }

      const updatedChecklists = await fetchAllChecklistsByProjectId(project.id);
      setChecklists(updatedChecklists);
      setShowAlert(true);
      setShowChecklistForm(false);
      setEditingChecklistId(null);
    } catch (error) {
      console.error('Error adding/updating checklist:', error);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedStates((prevStates) => ({ ...prevStates, [key]: true }));

      setTimeout(() => {
        setCopiedStates((prevStates) => ({ ...prevStates, [key]: false }));
      }, 2000);
    }
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
                  <DocumentTextIcon className="w-6 h-6 text-red-500/70" />
                ) : i % 3 === 1 ? (
                  <GlobeAltIcon className="w-6 h-6 text-yellow-500/70" />
                ) : (
                  <KeyIcon className="w-6 h-6 text-blue-500/70" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Checklists</h2>
              <p className="mt-1 text-white/80">Gérez les checklists de votre projet</p>
            </div>
            {checklists.length === 0 && userRole === 'ADMIN' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowChecklistForm(true);
                  setEditingChecklistId(null);
                  setChecklistForm({
                    spec: '',
                    frs: '',
                    lienGitFrontend: '',
                    lienGitBackend: '',
                    includeSpec: false,
                    includeFrs: false,
                    includeLienGit: false,
                  });
                }}
                className="px-4 py-2 bg-white text-[#2560a0] rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Ajouter une Checklist
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Lien
                </th>
                {userRole === 'ADMIN' && (
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {checklists.length > 0 ? (
                checklists.map((checklist, index) => (
                  <motion.tr
                    key={checklist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {checklist.spec && (
                          <div className="flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">SPEC</span>
                          </div>
                        )}
                        {checklist.frs && (
                          <div className="flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">FRS</span>
                          </div>
                        )}
                        {checklist.lienGitFrontend && (
                          <div className="flex items-center gap-2">
                            <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">Frontend</span>
                          </div>
                        )}
                        {checklist.lienGitBackend && (
                          <div className="flex items-center gap-2">
                            <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">Backend</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {checklist.spec && (
                          <div className="flex items-center gap-2">
                            <a
                              href={checklist.spec ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2560a0] hover:text-[#1a4a7a] dark:text-blue-400 dark:hover:text-blue-300 truncate max-w-md"
                            >
                              {checklist.spec}
                            </a>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(checklist.spec ?? "", `spec-${checklist.id}`)}
                              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                              <FaCopy className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                        {checklist.frs && (
                          <div className="flex items-center gap-2">
                            <a
                              href={checklist.frs ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2560a0] hover:text-[#1a4a7a] dark:text-blue-400 dark:hover:text-blue-300 truncate max-w-md"
                            >
                              {checklist.frs}
                            </a>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(checklist.frs ?? "", `frs-${checklist.id}`)}
                              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                              <FaCopy className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                        {checklist.lienGitFrontend && (
                          <div className="flex items-center gap-2">
                            <a
                              href={checklist.lienGitFrontend ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2560a0] hover:text-[#1a4a7a] dark:text-blue-400 dark:hover:text-blue-300 truncate max-w-md"
                            >
                              {checklist.lienGitFrontend}
                            </a>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(checklist.lienGitFrontend ?? "", `lienGitFrontend-${checklist.id}`)}
                              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                              <FaCopy className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                        {checklist.lienGitBackend && (
                          <div className="flex items-center gap-2">
                            <a
                              href={checklist.lienGitBackend ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2560a0] hover:text-[#1a4a7a] dark:text-blue-400 dark:hover:text-blue-300 truncate max-w-md"
                            >
                              {checklist.lienGitBackend}
                            </a>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(checklist.lienGitBackend ?? "", `lienGitBackend-${checklist.id}`)}
                              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                              <FaCopy className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </td>
                    {userRole === 'ADMIN' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setShowChecklistForm(true);
                            setEditingChecklistId(checklist.id ?? null);
                            setChecklistForm({
                              spec: checklist.spec ?? '',
                              frs: checklist.frs ?? '',
                              lienGitFrontend: checklist.lienGitFrontend ?? '',
                              lienGitBackend: checklist.lienGitBackend ?? '',
                              includeSpec: !!checklist.spec,
                              includeFrs: !!checklist.frs,
                              includeLienGit: !!checklist.lienGitFrontend || !!checklist.lienGitBackend,
                            });
                          }}
                          className="px-4 py-2 bg-[#2560a0] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors flex items-center gap-2"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                          Modifier
                        </motion.button>
                      </td>
                    )}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={userRole === 'ADMIN' ? 3 : 2} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Aucune checklist disponible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showChecklistForm && (
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
                  {editingChecklistId ? 'Modifier la Checklist' : 'Ajouter une Checklist'}
                </h3>
                <button
                  onClick={() => {
                    setShowChecklistForm(false);
                    setEditingChecklistId(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleChecklistSubmit} className="p-6 space-y-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="includeSpec"
                      checked={checklistForm.includeSpec}
                      onChange={handleChecklistChange}
                      className="w-4 h-4 text-[#2560a0] border-gray-300 rounded focus:ring-[#2560a0]"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">SPEC</span>
                  </label>
                  {checklistForm.includeSpec && (
                    <div className="relative">
                      <input
                        type="text"
                        name="spec"
                        value={checklistForm.spec}
                        onChange={handleChecklistChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-800 dark:text-white pr-10"
                        placeholder="Copie le lien Drive ici"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => copyToClipboard(checklistForm.spec, 'form-spec')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <FaCopy className="w-4 h-4" />
                      </motion.button>
                      {copiedStates['form-spec'] && (
                        <motion.span
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-green-500 text-sm"
                        >
                          Copié!
                        </motion.span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="includeFrs"
                      checked={checklistForm.includeFrs}
                      onChange={handleChecklistChange}
                      className="w-4 h-4 text-[#2560a0] border-gray-300 rounded focus:ring-[#2560a0]"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">FRS</span>
                  </label>
                  {checklistForm.includeFrs && (
                    <div className="relative">
                      <input
                        type="text"
                        name="frs"
                        value={checklistForm.frs}
                        onChange={handleChecklistChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-800 dark:text-white pr-10"
                        placeholder="Copie le lien Drive ici"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => copyToClipboard(checklistForm.frs, 'form-frs')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <FaCopy className="w-4 h-4" />
                      </motion.button>
                      {copiedStates['form-frs'] && (
                        <motion.span
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-green-500 text-sm"
                        >
                          Copié!
                        </motion.span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="includeLienGit"
                      checked={checklistForm.includeLienGit}
                      onChange={handleChecklistChange}
                      className="w-4 h-4 text-[#2560a0] border-gray-300 rounded focus:ring-[#2560a0]"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">Lien Git</span>
                  </label>
                  {checklistForm.includeLienGit && (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          name="lienGitFrontend"
                          value={checklistForm.lienGitFrontend}
                          onChange={handleChecklistChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-800 dark:text-white pr-10"
                          placeholder="Lien Git Frontend"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => copyToClipboard(checklistForm.lienGitFrontend, 'form-lienGit-frontend')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <FaCopy className="w-4 h-4" />
                        </motion.button>
                        {copiedStates['form-lienGit-frontend'] && (
                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-green-500 text-sm"
                          >
                            Copié!
                          </motion.span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="lienGitBackend"
                          value={checklistForm.lienGitBackend}
                          onChange={handleChecklistChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2560a0] dark:bg-gray-800 dark:text-white pr-10"
                          placeholder="Lien Git Backend"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => copyToClipboard(checklistForm.lienGitBackend, 'form-lienGit-backend')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <FaCopy className="w-4 h-4" />
                        </motion.button>
                        {copiedStates['form-lienGit-backend'] && (
                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-green-500 text-sm"
                          >
                            Copié!
                          </motion.span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setShowChecklistForm(false);
                    setEditingChecklistId(null);
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
                  {editingChecklistId ? 'Mettre à jour' : 'Ajouter'}
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
          <span>Checklist {editingChecklistId ? 'mise à jour' : 'ajoutée'} avec succès!</span>
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

export default ChecklistPage;
