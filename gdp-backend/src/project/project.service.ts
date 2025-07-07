import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { Livrable } from '../livrable/livrable.entity';
import { Technologie } from '../technologie/technologie.entity';
import { Checklist } from '../checklist/checklist.entity'; 
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Livrable) private livrableRepo: Repository<Livrable>,
    @InjectRepository(Technologie) private techRepo: Repository<Technologie>,
    @InjectRepository(Checklist) private checklistRepo: Repository<Checklist>, // Injecter le repository Checklist
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepo.find({
      relations: ['users', 'livrables', 'livrables.technologies', 'checklists'],
    });
  }

  async findOne(id: number): Promise<Project | null> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['users', 'livrables', 'livrables.technologies', 'checklists'],
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        estimatedEndDate: true,
        users: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          photo: true
        }
      }
    });

    if (!project) {
      throw new NotFoundException('Projet introuvable');
    }

    return project;
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const { userIds, livrables, checklists, ...projectData } = createProjectDto;

    const associatedUsers = userIds
      ? await this.userRepo.find({ where: { id: In(userIds) } })
      : [];

    const newProject = this.projectRepo.create({
      ...projectData,
      users: associatedUsers,
    });

    await this.projectRepo.save(newProject);

    if (livrables && livrables.length > 0) {
      for (const livrableDto of livrables) {
        const technologies = livrableDto.technologies
          ? await this.techRepo.find({ where: { id: In(livrableDto.technologies.map(tech => tech.id)) } })
          : [];

        const livrable = this.livrableRepo.create({
          ...livrableDto,
          project: newProject,
          technologies,
        });

        await this.livrableRepo.save(livrable);
      }
    }

    if (checklists && checklists.length > 0) {
      for (const checklistDto of checklists) {
        const checklist = this.checklistRepo.create({
          ...checklistDto,
          project: newProject,
        });

        await this.checklistRepo.save(checklist);
      }
    }

    return this.findOne(newProject.id);
  }

  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const { userIds, livrables, checklists, ...projectData } = updateProjectDto;

    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['users', 'livrables', 'livrables.technologies', 'checklists'],
    });

    if (!project) {
      throw new NotFoundException('Projet introuvable');
    }

    if (userIds) {
      const users = await this.userRepo.findBy({ id: In(userIds) });
      project.users = users;
    }

    if (livrables && livrables.length > 0) {
      for (const livrableDto of livrables) {
        const technologies = livrableDto.technologies
          ? await this.techRepo.find({ where: { id: In(livrableDto.technologies.map(tech => tech.id)) } })
          : [];

        const livrable = await this.livrableRepo.findOne({
          where: { id: livrableDto.id },
          relations: ['project', 'technologies'],
        });

        if (livrable) {
          Object.assign(livrable, livrableDto);
          livrable.technologies = technologies;
          await this.livrableRepo.save(livrable);
        }
      }
    }

    if (checklists && checklists.length > 0) {
      for (const checklistDto of checklists) {
        const checklist = await this.checklistRepo.findOne({
          where: { id: checklistDto.id },
          relations: ['project'],
        });

        if (checklist) {
          Object.assign(checklist, checklistDto);
          await this.checklistRepo.save(checklist);
        }
      }
    }

    Object.assign(project, projectData);
    return this.projectRepo.save(project);
  }
  async assignUsersByEmail(projectId: number, emails: string[]): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['users'],
    });

    if (!project) {
      throw new NotFoundException('Projet introuvable');
    }

    // Récupérer les utilisateurs par email
    const users = await this.userRepo.find({ where: { email: In(emails) } });

    if (users.length === 0) {
      throw new NotFoundException('Aucun utilisateur trouvé avec ces emails');
    }

    // Ajouter les utilisateurs au projet sans écraser les existants
    project.users = [...project.users, ...users.filter(user => !project.users.find(u => u.id === user.id))];

    return this.projectRepo.save(project);
  }

  async delete(id: number): Promise<void> {
    try {
      const project = await this.projectRepo.findOne({
        where: { id },
        relations: ['users', 'livrables', 'livrables.technologies', 'checklists', 'environnements'],
      });

      if (!project) {
        throw new NotFoundException('Projet introuvable');
      }

      // Supprimer d'abord les relations
      if (project.livrables) {
        for (const livrable of project.livrables) {
          // Supprimer d'abord les technologies associées
          if (livrable.technologies) {
            for (const tech of livrable.technologies) {
              await this.techRepo.remove(tech);
            }
          }
          await this.livrableRepo.remove(livrable);
        }
      }

      if (project.checklists) {
        for (const checklist of project.checklists) {
          await this.checklistRepo.remove(checklist);
        }
      }

      // Supprimer les environnements associés
      if (project.environnements) {
        for (const env of project.environnements) {
          await this.projectRepo.manager.remove(env);
        }
      }

      // Supprimer les associations avec les utilisateurs
      project.users = [];
      await this.projectRepo.save(project);

      // Enfin, supprimer le projet
      await this.projectRepo.remove(project);
    } catch (error) {
      console.error('Erreur détaillée lors de la suppression du projet:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new Error(`Une erreur est survenue lors de la suppression du projet: ${error.message}`);
    }
  }

  async findUsersByEmails(emails: string[]) {
    return this.userRepo.find({
      where: {
        email: In(emails)
      }
    });
  }
}
