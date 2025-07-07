import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tache } from './tache.entity';
import { CreateTacheDto } from './dto/tache.dto';
import { Project } from '../project/project.entity';
import { User } from '../users/user.entity';
import { UserService } from 'src/users/user.service';
import { LabelService } from '../labels/label.service';

@Injectable()
export class TacheService {
  constructor(
    @InjectRepository(Tache)
    private readonly tacheRepository: Repository<Tache>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    @Inject(forwardRef(() => LabelService))
    private readonly labelService: LabelService,
  ) {}

  async createTache(createTacheDto: CreateTacheDto): Promise<Tache> {
    const project = await this.projectRepository.findOne({
      where: { id: createTacheDto.projectId },
    });
    if (!project) {
      throw new Error('Project not found');
    }
  
    const user = await this.userRepository.findOne({
      where: { id: createTacheDto.userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    const labels = createTacheDto.labelIds ? 
      await Promise.all(createTacheDto.labelIds.map(id => this.labelService.findOne(id))) : 
      [];
  
    const tache = this.tacheRepository.create({
      ...createTacheDto,
      project,
      user,
      labels,
    });
  
    return this.tacheRepository.save(tache);
  }

  async findAllByProject(projectId: number): Promise<Tache[]> {
    const tasks = await this.tacheRepository.find({
      where: { project: { id: projectId } },
      relations: ['project', 'user', 'labels'],
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          photo: true,
          email: true,
          role: true
        }
      }
    });
   
    return tasks;
  }

  async updateTache(id: number, updateData: Partial<Tache>): Promise<Tache> {
    const tache = await this.tacheRepository.findOne({ 
      where: { id },
      relations: ['labels', 'user', 'project']
    });
    if (!tache) {
      throw new Error('Task not found');
    }

    if (updateData.labelIds) {
      const labels = await Promise.all(updateData.labelIds.map(id => this.labelService.findOne(id)));
      tache.labels = labels;
      delete updateData.labelIds;
    }

    Object.assign(tache, updateData);
    const updatedTache = await this.tacheRepository.save(tache);
    
    // Récupérer la tâche mise à jour avec toutes les relations
    return this.tacheRepository.findOne({
      where: { id: updatedTache.id },
      relations: ['user', 'labels', 'project'],
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          photo: true,
          email: true,
          role: true
        }
      }
    });
  }

  async deleteTache(id: number): Promise<void> {
    // First find the task with its relations
    const tache = await this.tacheRepository.findOne({
      where: { id },
      relations: ['labels']
    });

    if (!tache) {
      throw new Error('Task not found');
    }

    // Remove all label associations
    if (tache.labels && tache.labels.length > 0) {
      tache.labels = [];
      await this.tacheRepository.save(tache);
    }

    // Now delete the task
    const result = await this.tacheRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Task not found');
    }
  }

  async findByProjectAndType(projectId: number, type?: string): Promise<Tache[]> {
    const query = this.tacheRepository.createQueryBuilder('tache')
      .leftJoinAndSelect('tache.project', 'project')
      .leftJoinAndSelect('tache.user', 'user')
      .leftJoinAndSelect('tache.labels', 'labels')
      .where('project.id = :projectId', { projectId });

    if (type) {
      query.andWhere('tache.type = :type', { type });
    }

    return query.getMany();
  }
}
