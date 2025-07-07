import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Environnement } from './environnement.entity';
import { EnvironnementDto } from './dto/environnement.dto';
import { Project } from '../project/project.entity';

@Injectable()
export class EnvironnementService {
  constructor(
    @InjectRepository(Environnement)
    private environnementRepository: Repository<Environnement>,
  ) {}

  async create(environnementDto: EnvironnementDto): Promise<Environnement> {
    // Vérifier si le projet existe
    const project = await this.environnementRepository.manager.findOne(Project, {
      where: { id: environnementDto.projectId }
    });

    if (!project) {
      throw new NotFoundException('Le projet spécifié n\'existe pas');
    }

    // Vérifier si l'environnement existe déjà pour ce projet
    const existingEnvironnement = await this.environnementRepository.findOne({
      where: {
        project: { id: environnementDto.projectId },
        ipServeur: environnementDto.ipServeur,
      },
      relations: ['project'],
    });
  
    if (existingEnvironnement) {
      throw new ConflictException(
        'Un environnement avec cette IP existe déjà pour ce projet.'
      );
    }
  
    try {
      // Supprimer l'ID s'il est présent pour éviter les conflits
      const { id, ...environnementData } = environnementDto;
      
      const environnement = this.environnementRepository.create({
        ...environnementData,
        project: { id: environnementDto.projectId },
      });
  
      return await this.environnementRepository.save(environnement);
    } catch (error) {
      if (error.code === '23505') { // Code d'erreur pour violation de contrainte unique
        if (error.constraint === 'PK_189d3eee0ab1570b066e9087404') {
          // Réinitialiser la séquence d'IDs si nécessaire
          await this.resetIdSequence();
          throw new ConflictException('Une erreur est survenue avec l\'ID. Veuillez réessayer.');
        } else {
          throw new ConflictException('Une erreur est survenue lors de la création de l\'environnement');
        }
      }
      throw error;
    }
  }

  private async resetIdSequence(): Promise<void> {
    try {
      await this.environnementRepository.query(`
        SELECT setval(
          pg_get_serial_sequence('environnement', 'id'),
          COALESCE((SELECT MAX(id) FROM environnement), 0) + 1,
          false
        );
      `);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de la séquence:', error);
    }
  }

  async findAll(): Promise<Environnement[]> {
    return this.environnementRepository.find({
      relations: ['project'],
    });
  }
  
  async findAllByProjectId(projectId: number): Promise<Environnement[]> {
    return this.environnementRepository.find({ where: { project: { id: projectId } } });
  }

  async findOne(id: number): Promise<Environnement> {
    const environnement = await this.environnementRepository.findOne({ where: { id } });
    if (!environnement) {
      throw new NotFoundException('Environnement introuvable');
    }
    return environnement;
  }

  async update(id: number, environnementDto: Partial<EnvironnementDto>): Promise<Environnement> {
    const environnement = await this.findOne(id);
    Object.assign(environnement, environnementDto);
    return this.environnementRepository.save(environnement);
  }

  async delete(id: number): Promise<void> {
    const environnement = await this.findOne(id);
    await this.environnementRepository.remove(environnement);
  }
}
