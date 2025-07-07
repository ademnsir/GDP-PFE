"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProjectById, fetchTechnologyLatestVersion, fetchAllProjects, Project } from "@/services/Project";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ProjectInfo from "@/components/Gestion-projets/DetailsPage/ProjectInfo";
import UpdateAlerts from "@/components/Gestion-projets/DetailsPage/UpdateAlerts";
import { getUserData } from "@/services/authService";

const ProjectDetailsClient = () => {
  const router = useRouter();
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateAlerts, setUpdateAlerts] = useState<{ tech: string; oldVersion: string; newVersion: string }[]>([]);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const loadProject = async () => {
    try {
      const data = await fetchProjectById(Number(id));
      setProject(data);
      if (data.estimatedEndDate) {
        const today = new Date();
        const endDate = new Date(data.estimatedEndDate);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysLeft(diffDays > 0 ? diffDays : 0);
      } else {
        setDaysLeft(null);
      }

      const alerts: { tech: string; oldVersion: string; newVersion: string }[] = [];

      for (const livrable of data.livrables) {
        for (const tech of livrable.technologies) {
          const latestVersion = await fetchTechnologyLatestVersion(tech.label);

          if (latestVersion && compareVersions(tech.version, latestVersion)) {
            alerts.push({ tech: tech.label, oldVersion: tech.version, newVersion: latestVersion });
          }
        }
      }

      setUpdateAlerts(alerts);
    } catch (err) {
      console.error("Erreur lors de la récupération du projet:", err);
      setError("Projet introuvable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = getUserData();
    setUserRole(userData?.role || null);
  }, []);

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  const handleProjectUpdated = (updatedProject: Project) => {
    setProject(updatedProject);
    // Recharger les alertes de mise à jour après la modification
    loadProject();
  };

  const compareVersions = (currentVersion: string, latestVersion: string): boolean => {
    const current = currentVersion.split(".").map(Number);
    const latest = latestVersion.split(".").map(Number);

    for (let i = 0; i < latest.length; i++) {
      if ((current[i] || 0) < latest[i]) {
        return true;
      }
    }
    return false;
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DefaultLayout>
    );
  }

  if (error || !project) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error || "Projet introuvable"}
            </h2>
            <button
              onClick={() => router.push('/projet/table-Projet')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retour aux projets
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-screen-xxl">
        <Breadcrumb pageName="Détails du Projet" />
        {updateAlerts.length > 0 && userRole === 'ADMIN' && <UpdateAlerts alerts={updateAlerts} />}
        {project && (
          <ProjectInfo 
            project={project} 
            daysLeft={daysLeft} 
            router={router} 
            onProjectUpdated={handleProjectUpdated}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default ProjectDetailsClient;
