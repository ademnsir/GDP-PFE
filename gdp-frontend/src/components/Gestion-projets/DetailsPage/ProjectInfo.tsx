import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaProjectDiagram, FaArrowLeft, FaClock, FaFileAlt, FaClipboardList, FaLink, FaCopy, FaCheckCircle, FaTimesCircle, FaPlus, FaEdit, FaServer } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Project, updateProject } from "@/services/Project";
import ChecklistPage from './ChecklistPage';
import EnvironnementPage from './EnvironnementPage';
import ProjectEditModal from './ProjectEditModal';
import { motion } from 'framer-motion';
import { CalendarIcon, FolderIcon, UserGroupIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { getUserData } from '@/services/authService';

interface ProjectInfoProps {
  project: Project;
  daysLeft: number | null;
  router: ReturnType<typeof useRouter>;
  onProjectUpdated?: (updatedProject: Project) => void;
}

type TabType = 'project' | 'environnement' | 'checklist';

const ProjectInfo = ({ project, daysLeft, router, onProjectUpdated }: ProjectInfoProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('project');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userData = getUserData();
    setUserRole(userData?.role || null);
  }, []);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return '/images/user/user1.jpg';
    
    // Si l'URL est une URL Google, on la retourne directement
    if (url.startsWith('https://lh3.googleusercontent.com/')) {
      return url;
    }
    
    // Si l'URL commence par http ou https, on la retourne directement
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si l'URL est relative (commence par /), on ajoute l'URL du backend
    if (url.startsWith('/')) {
      return `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;
    }
    
    // Pour les autres cas, on ajoute l'URL du backend
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${url}`;
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setCurrentProject(updatedProject);
    if (onProjectUpdated) {
      onProjectUpdated(updatedProject);
    }
  };

  const handleEditProject = () => {
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb pageName="Informations du projet" />

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('project')}
                className={`${
                  activeTab === 'project'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Informations du projet
              </button>
              <button
                onClick={() => setActiveTab('environnement')}
                className={`${
                  activeTab === 'environnement'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Environnements
              </button>
              <button
                onClick={() => setActiveTab('checklist')}
                className={`${
                  activeTab === 'checklist'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Checklist
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {activeTab === 'project' && (
            <>
              {/* Header Section - Simplified Blue Design */}
              <div className="bg-gradient-to-r from-[#2560a0] to-[#1a4a7a] rounded-2xl shadow-xl p-8 mb-8 border border-white/30 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                      {currentProject.name}
                    </h1>
                    <p className="text-white/80 max-w-2xl">
                      {currentProject.description}
                    </p>
                  </div>
                  {userRole === 'ADMIN' && (
                    <button
                      onClick={handleEditProject}
                      className="px-4 py-2 rounded-xl bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-colors flex items-center gap-2"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                      Modifier le projet
                    </button>
                  )}
                </div>
              </div>

              {/* Project Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                        <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de fin estimée</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {currentProject.estimatedEndDate ? new Date(currentProject.estimatedEndDate).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Non définie'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                        <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Membres de l&apos;équipe</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentProject.users.length}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Team Members Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Membres de l&apos;équipe</h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentProject.users.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                      onClick={() => router.push(`/profileUsers/${user.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={getImageUrl(user.photo)}
                            alt={`${user.firstName} ${user.lastName}`}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/user/user1.jpg';
                            }}
                            unoptimized={true}
                            priority={true}
                            loading="eager"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'environnement' && (
            <EnvironnementPage project={currentProject} />
          )}

          {activeTab === 'checklist' && (
            <ChecklistPage project={currentProject} />
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      <ProjectEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={currentProject}
        onProjectUpdated={handleProjectUpdated}
      />
    </div>
  );
};

export default ProjectInfo;
