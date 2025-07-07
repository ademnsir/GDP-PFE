"use client";
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { fetchAllProjects, Project } from '@/services/Project';
import { useRouter } from 'next/navigation';
import { DashboardStats } from '@/services/dashboardService';
import { ClipboardDocumentListIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Task {
  id: string;
  status: string;
}

interface ProjectType {
  id: string;
  name: string;
  status?: string;
  priority?: string;
  tasks?: Task[];
}

interface RecentOrdersProps {
  selectedStatus?: string;
  stats: DashboardStats | null;
}

export default function RecentOrders({ selectedStatus, stats }: RecentOrdersProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchAllProjects();
        console.log('Projets chargés:', data);
        setProjects(data);
        setFilteredProjects(data);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    console.log('Statut sélectionné:', selectedStatus);
    console.log('Projets avant filtrage:', projects);

    if (selectedStatus) {
      const filtered = projects.filter(project => {
        console.log('Vérification du projet:', {
          nom: project.name,
          statut: project.status,
          statutAttendu: selectedStatus
        });

        let matches = false;
        const projectStatus = project.status?.toLowerCase() || '';
        
        switch (selectedStatus) {
          case 'Complété':
            matches = projectStatus === 'completed' || projectStatus === 'fini';
            break;
          case 'En cours':
            matches = projectStatus === 'in_progress' || projectStatus === 'en cours';
            break;
          case 'À faire':
            matches = projectStatus === 'to_do' || projectStatus === 'a faire';
            break;
          default:
            matches = true;
        }

        console.log('Résultat du filtrage:', {
          projet: project.name,
          statutActuel: project.status,
          statutAttendu: selectedStatus,
          correspond: matches
        });

        return matches;
      });

      console.log('Projets filtrés:', filtered);
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [selectedStatus, projects]);

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'completed' || statusLower === 'fini') return "success";
    if (statusLower === 'in_progress' || statusLower === 'en cours') return "warning";
    if (statusLower === 'to_do' || statusLower === 'a faire') return "error";
    return "default";
  };

  const getPriorityColor = (priority: string) => {
    const priorityLower = priority?.toLowerCase() || '';
    if (priorityLower === 'high' || priorityLower === 'haute') return "error";
    if (priorityLower === 'medium' || priorityLower === 'moyenne') return "warning";
    if (priorityLower === 'low' || priorityLower === 'faible') return "success";
    return "default";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'completed' || statusLower === 'fini') return "Fini";
    if (statusLower === 'in_progress' || statusLower === 'en cours') return "En cours";
    if (statusLower === 'to_do' || statusLower === 'a faire') return "À faire";
    return status;
  };

  const getPriorityLabel = (priority: string) => {
    const priorityLower = priority?.toLowerCase() || '';
    if (priorityLower === 'high' || priorityLower === 'haute') return "Haute";
    if (priorityLower === 'medium' || priorityLower === 'moyenne') return "Moyenne";
    if (priorityLower === 'low' || priorityLower === 'faible') return "Faible";
    return priority;
  };

  const getProjectProgress = (project: Project) => {
    if (selectedStatus === 'À faire') {
      const totalProjects = filteredProjects.length;
      if (totalProjects === 0) return 0;
      const individualContribution = (stats?.projects?.productivity?.toDoRate || 0) / totalProjects;
      return Math.round(individualContribution);
    }

    if (!project.tasks || project.tasks.length === 0) {
      return project.status?.toLowerCase() === 'completed' || project.status?.toLowerCase() === 'fini' ? 100 : 0;
    }
    const completedTasks = project.tasks.filter(task => 
      task.status?.toLowerCase() === 'completed' || 
      task.status?.toLowerCase() === 'fini' ||
      task.status?.toLowerCase() === 'done'
    ).length;
    const progress = Math.round((completedTasks / project.tasks.length) * 100);
    return progress || 0;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 h-[380px] relative group">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {selectedStatus ? `Projets ${selectedStatus}` : 'Derniers Projets'}
          </h3>
        </div>
      </div>
      <div className="h-[310px] overflow-hidden">
        <div className="h-full overflow-auto custom-scrollbar">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y sticky top-0 bg-white dark:bg-gray-800 z-10">
                <TableRow>
                  <TableCell
                    isHeader
                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Projet
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    Statut
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    Priorité
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <TableRow 
                      key={project.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {project.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span
                          className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor:
                              getStatusLabel(project.status) === 'Fini' ? '#22c55e' :
                              getStatusLabel(project.status) === 'En cours' ? '#3b82f6' :
                              getStatusLabel(project.status) === 'À faire' ? '#eab308' :
                              '#e5e7eb',
                            color: '#fff',
                            minWidth: 60,
                            textAlign: 'center',
                            letterSpacing: 0.5
                          }}
                        >
                          {getStatusLabel(project.status)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span
                          className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor:
                              getPriorityLabel(project.priorite) === 'Haute' ? '#FF6B6B' :
                              getPriorityLabel(project.priorite) === 'Moyenne' ? '#9CB9FF' :
                              getPriorityLabel(project.priorite) === 'Faible' ? '#465FFF' :
                              '#e5e7eb',
                            color: '#fff',
                            minWidth: 60,
                            textAlign: 'center',
                            letterSpacing: 0.5
                          }}
                        >
                          {getPriorityLabel(project.priorite)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/tache/Projet/${project.id}`)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 transition-all duration-200 hover:scale-105"
                            title="Tableau Sprint"
                          >
                            <ClipboardDocumentListIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/projet/DetailsProject/${project.id}`)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 transition-all duration-200 hover:scale-105"
                            title="Détails"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="py-3 text-center text-gray-500">
                      Aucun projet trouvé
                    </TableCell>
                    <TableCell className="py-3">
                      <span></span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span></span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span></span>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
} 