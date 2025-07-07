"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchUserById, User } from "@/services/user";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ProjectList from "@/components/Gestion-users/profile/ProjectList";
import { getUserData } from "@/services/authService";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const MesProjets = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

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

  useEffect(() => {
    const fetchUser = async () => {
      const userData = getUserData();
      if (!userData || !userData.userId) {
        setError("Utilisateur non authentifié ou ID non valide.");
        setLoading(false);
        return;
      }

      try {
        const user = await fetchUserById(userData.userId.toString());
        setFormData({
          id: user.id,
          username: user.username ?? "",
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          bio: user.bio ?? "",
          photo: user.photo ?? "",
          status: user.status,
          hireDate: user.hireDate,
          endDate: user.endDate,
          matricule: user.matricule,
          projects: user.projects ?? [],
        });
      } catch (err) {
        setError("Erreur lors du chargement des données utilisateur.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const filteredProjects =
    formData?.projects?.filter((project) =>
      filterStatus ? project.status === filterStatus : true
    ) || [];

  if (loading)
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-16 border-4 border-primary rounded-full border-t-transparent"
          />
        </div>
      </DefaultLayout>
    );

  if (error)
    return (
      <DefaultLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-red-500 mt-20"
        >
          {error}
        </motion.div>
      </DefaultLayout>
    );

  return (
    <DefaultLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Breadcrumb pageName={`Projets de ${formData?.firstName ?? "Utilisateur"}`} />

        {/* Header Section with Animation */}
        <div className="flex flex-col md:flex-row justify-between items-center p-8 bg-gradient-to-r from-[#2560a0] via-[#2560a0] to-[#d01e3e] rounded-t-lg relative overflow-hidden mb-8">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated project cards */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 8 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5,
                }}
                className="absolute w-24 h-16 bg-white/20 rounded-lg border border-white/30 backdrop-blur-sm"
                style={{
                  left: `${10 + i * 25}%`,
                  top: `${30 + (i % 2) * 20}%`,
                  transform: `rotate(${i * 5}deg)`,
                }}
              />
            ))}
            {/* Animated progress bars */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`progress-${i}`}
                animate={{
                  scaleX: [0, 1, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 6 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1,
                }}
                className="absolute h-1 bg-white/50 rounded-full backdrop-blur-sm"
                style={{
                  width: "80%",
                  top: `${40 + i * 15}%`,
                  left: "10%",
                  transformOrigin: "left",
                }}
              />
            ))}
          </div>

          <motion.h4 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white mb-4 md:mb-0 relative z-10"
          >
            Mes Projets
          </motion.h4>
        </div>

        {/* User Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-boxdark rounded-lg shadow-lg border border-stroke dark:border-strokedark p-8 mb-8 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-center space-x-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-lg"
            >
              <Image
                src={getImageUrl(formData?.photo)}
                alt="Profile"
                fill
                sizes="(max-width: 768px) 96px, 96px"
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/user/user1.jpg";
                }}
                unoptimized={true}
              />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white">
                {formData?.firstName} {formData?.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{formData?.role}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData?.projects?.length || 0} Projets
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8 bg-white dark:bg-boxdark p-6 rounded-lg shadow-lg border border-stroke dark:border-strokedark"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Filtrer les projets
            </h3>
            <select
              value={filterStatus || ""}
              onChange={(e) => setFilterStatus(e.target.value || null)}
              className="border border-stroke dark:border-strokedark rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary dark:bg-boxdark transition-colors duration-200"
            >
              <option value="">Tous les projets</option>
              <option value="A faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="Fini">Fini</option>
            </select>
          </div>
        </motion.div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-boxdark rounded-lg shadow-lg border border-stroke dark:border-strokedark overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      {project.name}
                    </h3>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        project.status === "Fini"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : project.status === "En cours"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {project.status}
                    </motion.span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(project.estimatedEndDate).toLocaleDateString()}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push(`/projet/DetailsProject/${project.id}`)}
                      className="bg-[#1f4e84] text-white text-xs px-4 py-2 rounded-md hover:bg-[#2560a0] focus:outline-none focus:ring-2 focus:ring-[#2560a0] whitespace-nowrap transition-colors duration-200"
                    >
                      Voir
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-96 bg-white dark:bg-boxdark rounded-lg shadow-lg border border-stroke dark:border-strokedark"
          >
            <Image
              src="/images/icon/noresult.png"
              alt="Aucun résultat"
              width={200}
              height={200}
              className="mb-4"
            />
            <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold">
              Aucun projet à afficher.
            </p>
          </motion.div>
        )}
      </motion.div>
    </DefaultLayout>
  );
};

export default MesProjets;
