import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Project, Status as ProjectStatus, Priorite as ProjectPriority } from '../project/project.entity';
import { Tache } from '../tache/tache.entity';
import { User } from '../users/user.entity';
import { Conge } from '../conge/conge.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Tache)
    private tacheRepository: Repository<Tache>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Conge)
    private congeRepository: Repository<Conge>,
  ) {}

  async getStats() {
    const [projects, tasks, users, conges] = await Promise.all([
      this.projectRepository.find({
        relations: ['taches', 'users'],
      }),
      this.tacheRepository.find(),
      this.userRepository.find(),
      this.congeRepository.find({
        relations: ['user'],
      }),
    ]);

    console.log('Total projects:', projects.length); // Debug log
    console.log('Sample project priorities:', projects.slice(0, 3).map(p => p.priorite)); // Debug log

    // Statistiques des projets
    const projectStats = {
      total: projects.length,
      byStatus: this.groupByStatus(projects),
      byPriority: this.groupByPriority(projects),
      productivity: this.calculateProjectProductivity(projects),
    };

    console.log('Project stats:', projectStats); // Debug log

    // Statistiques des tâches
    const taskStats = {
      total: tasks.length,
      byStatus: this.groupTasksByStatus(tasks),
      byPriority: this.groupTasksByPriority(tasks),
      productivity: this.calculateTaskProductivity(tasks),
    };

    // Statistiques des utilisateurs
    const userStats = {
      total: users.length,
      byRole: this.groupUsersByRole(users),
      productivity: this.calculateUserProductivity(users, tasks),
    };

    // Statistiques des congés
    const congeStats = {
      total: conges.length,
      byMonth: this.getCongesByMonth(conges),
      byType: this.groupCongesByType(conges),
      byStatus: this.groupCongesByStatus(conges),
    };

    return {
      projects: projectStats,
      tasks: taskStats,
      users: userStats,
      conges: congeStats,
    };
  }

  private groupByStatus(projects: Project[]) {
    return projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});
  }

  private groupByPriority(projects: Project[]) {
    const priorityCounts = projects.reduce((acc, project) => {
      console.log('Project priority:', project.priorite); // Debug log
      acc[project.priorite] = (acc[project.priorite] || 0) + 1;
      return acc;
    }, {});
    console.log('Priority counts:', priorityCounts); // Debug log
    return priorityCounts;
  }

  private groupTasksByStatus(tasks: Tache[]) {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
  }

  private groupTasksByPriority(tasks: Tache[]) {
    return tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});
  }

  private groupUsersByRole(users: User[]) {
    return users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateProjectProductivity(projects: Project[]) {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
    const inProgressProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
    const toDoProjects = projects.filter(p => p.status === ProjectStatus.TO_DO).length;

    return {
      completionRate: totalProjects ? Math.round((completedProjects / totalProjects) * 100) : 0,
      inProgressRate: totalProjects ? Math.round((inProgressProjects / totalProjects) * 100) : 0,
      toDoRate: totalProjects ? Math.round((toDoProjects / totalProjects) * 100) : 0,
      highPriorityCompletion: Math.round(this.calculatePriorityCompletion(projects, ProjectPriority.HIGH)),
      mediumPriorityCompletion: Math.round(this.calculatePriorityCompletion(projects, ProjectPriority.MEDIUM)),
      lowPriorityCompletion: Math.round(this.calculatePriorityCompletion(projects, ProjectPriority.LOW)),
    };
  }

  private calculateTaskProductivity(tasks: Tache[]) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const delayedTasks = tasks.filter(t => t.status === 'DELAYED').length;

    return {
      completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
      inProgressRate: totalTasks ? (inProgressTasks / totalTasks) * 100 : 0,
      delayRate: totalTasks ? (delayedTasks / totalTasks) * 100 : 0,
      highPriorityCompletion: this.calculateTaskPriorityCompletion(tasks, 'high'),
      mediumPriorityCompletion: this.calculateTaskPriorityCompletion(tasks, 'medium'),
      lowPriorityCompletion: this.calculateTaskPriorityCompletion(tasks, 'low'),
    };
  }

  private calculateUserProductivity(users: User[], tasks: Tache[]) {
    return users.map(user => {
      const userTasks = tasks.filter(t => t.user?.id === user.id);
      const completedTasks = userTasks.filter(t => t.status === 'COMPLETED').length;
      const totalTasks = userTasks.length;

      return {
        userId: user.id,
        username: user.username,
        totalTasks,
        completedTasks,
        completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
        averageTaskCompletionTime: this.calculateAverageTaskCompletionTime(userTasks),
      };
    });
  }

  private calculatePriorityCompletion(projects: Project[], priority: ProjectPriority) {
    const priorityProjects = projects.filter(p => p.priorite === priority);
    const completedPriorityProjects = priorityProjects.filter(p => p.status === ProjectStatus.COMPLETED).length;
    return priorityProjects.length ? (completedPriorityProjects / priorityProjects.length) * 100 : 0;
  }

  private calculateTaskPriorityCompletion(tasks: Tache[], priority: string) {
    const priorityTasks = tasks.filter(t => t.priority === priority);
    const completedPriorityTasks = priorityTasks.filter(t => t.status === 'COMPLETED').length;
    return priorityTasks.length ? (completedPriorityTasks / priorityTasks.length) * 100 : 0;
  }

  private calculateAverageTaskCompletionTime(tasks: Tache[]) {
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
    if (completedTasks.length === 0) return 0;
    return completedTasks.length; // Return number of completed tasks instead of time
  }

  private getCongesByMonth(conges: Conge[]) {
    const currentYear = new Date().getFullYear();
    const monthlyStats = new Array(12).fill(0);

    conges.forEach(conge => {
      const startDate = new Date(conge.startDate);
      if (startDate.getFullYear() === currentYear) {
        monthlyStats[startDate.getMonth()]++;
      }
    });

    return monthlyStats;
  }

  private groupCongesByType(conges: Conge[]) {
    return conges.reduce((acc, conge) => {
      acc[conge.type] = (acc[conge.type] || 0) + 1;
      return acc;
    }, {});
  }

  private groupCongesByStatus(conges: Conge[]) {
    return conges.reduce((acc, conge) => {
      acc[conge.status] = (acc[conge.status] || 0) + 1;
      return acc;
    }, {});
  }
} 