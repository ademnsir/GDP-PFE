import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Livrable } from './livrable.entity';
import { CreateLivrableDto, UpdateLivrableDto } from './dto/livrable.dto';
import { Project } from '../project/project.entity';
import { Technologie } from '../technologie/technologie.entity';

@Injectable()
export class LivrableService {
  constructor(
    @InjectRepository(Livrable) private livrableRepo: Repository<Livrable>,
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(Technologie) private techRepo: Repository<Technologie>,
  ) {}

  // ✅ Création d'un livrable avec son projet et ses technologies
  async createLivrable(dto: CreateLivrableDto): Promise<Livrable> {
    // Vérification du projet
    const project = await this.projectRepo.findOne({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException(`Projet avec l'ID ${dto.projectId} introuvable`);

    // Récupération des technologies associées
    const technologies = dto.technologies
      ? await this.techRepo.find({ where: { id: In(dto.technologies.map(tech => tech.id)) } })
      : [];

    // ✅ Création du livrable
    const livrable = this.livrableRepo.create({
      ...dto,
      project, // ✅ Correction ici
      technologies, // ✅ Correction ici
    });

    return this.livrableRepo.save(livrable);
  }

  // ✅ Mise à jour d'un livrable
  async updateLivrable(id: number, dto: UpdateLivrableDto): Promise<Livrable> {
    const livrable = await this.livrableRepo.findOne({ where: { id }, relations: ['project', 'technologies'] });

    if (!livrable) {
      throw new NotFoundException(`Livrable avec l'ID ${id} introuvable`);
    }

    // Mise à jour des technologies si nécessaire
    if (dto.technologies) {
      livrable.technologies = await this.techRepo.find({ where: { id: In(dto.technologies.map(tech => tech.id)) } });
    }

    Object.assign(livrable, dto);
    return this.livrableRepo.save(livrable);
  }

  // ✅ Récupération de tous les livrables
  async getAllLivrables(): Promise<Livrable[]> {
    return this.livrableRepo.find({ relations: ['project', 'technologies'] });
  }

  // ✅ Suppression d'un livrable
  async deleteLivrable(id: number): Promise<void> {
    const livrable = await this.livrableRepo.findOne({ where: { id } });
    if (!livrable) throw new NotFoundException(`Livrable avec l'ID ${id} introuvable`);
    
    await this.livrableRepo.remove(livrable);
  }
}
