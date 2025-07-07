"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Project {
  id: number;
  name: string;
  status: string;
  description: string;
  estimatedEndDate: Date;
}

interface ProjectListProps {
  projects?: Project[];
}

// Fonction pour attribuer des couleurs aux badges en fonction du statut
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "en cours":
      return "bg-yellow-200 text-yellow-800"; // Jaune
    case "à faire":
      return "bg-purple-200 text-purple-800"; // Violet
    case "fini":
      return "bg-green-200 text-green-800"; // Vert
    default:
      return "bg-gray-200 text-gray-800"; // Gris par défaut
  }
};

const ProjectList = ({ projects = [] }: ProjectListProps) => {
  const router = useRouter();
  const itemsPerPage = 4; // Nombre d'éléments affichés par page
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const visibleProjects = projects.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  if (!projects || projects.length === 0) {
    return (
      <div className="mt-8 w-full px-10 rounded-xl border border-stroke bg-gradient-to-br from-white to-gray-50 dark:from-boxdark dark:to-gray-900 shadow-lg dark:border-strokedark p-10 transition-all duration-300 hover:shadow-xl">
        <h3 className="text-2xl font-bold text-black dark:text-white mb-8">Projets assignés</h3>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-full blur-xl"></div>
              <svg className="relative mx-auto h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Aucun projet assigné</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Les projets assignés apparaîtront ici</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full px-10 rounded-xl border border-stroke bg-gradient-to-br from-white to-gray-50 dark:from-boxdark dark:to-gray-900 shadow-lg dark:border-strokedark p-10 transition-all duration-300 hover:shadow-xl">
      <h3 className="text-2xl font-bold text-black dark:text-white mb-8">Projets assignés</h3>

      <div className="relative w-full">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-boxdark text-black dark:text-white px-4 py-2 rounded-full shadow-lg border border-stroke dark:border-strokedark transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
            currentPage === 0 ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mx-10">
          {visibleProjects.map((project) => (
            <div 
              key={project.id} 
              className="group relative h-[350px] flex flex-col border border-stroke dark:border-strokedark p-6 rounded-xl shadow-sm bg-white dark:bg-boxdark transition-all duration-300 hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col h-full">
                <div className="flex justify-between items-center min-h-[60px]">
                  <h4 className="text-lg font-bold text-black dark:text-white flex-1">
                    {project.name}
                  </h4>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 min-h-[60px] line-clamp-3">
                  {project.description}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(project.estimatedEndDate).toLocaleDateString()}
                  </div>

                  <button
                    onClick={() => router.push(`/projet/DetailsProject/${project.id}`)}
                    className="flex items-center gap-2 bg-primary text-white text-xs px-4 py-2 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <span>Voir</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-boxdark text-black dark:text-white px-4 py-2 rounded-full shadow-lg border border-stroke dark:border-strokedark transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
            currentPage === totalPages - 1 ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProjectList;
