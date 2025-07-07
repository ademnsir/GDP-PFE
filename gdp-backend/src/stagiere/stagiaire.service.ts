import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stagiaire } from './stagiaire.entity';
import { CreateStagiaireDto, UpdateStagiaireDto } from './dto/stagiaire.dto';
import { User } from '../users/user.entity';

@Injectable()
export class StagiaireService {
  constructor(
    @InjectRepository(Stagiaire)
    private readonly stagiaireRepository: Repository<Stagiaire>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Stagiaire[]> {
    return this.stagiaireRepository.find();
  }

  async findOne(id: number): Promise<Stagiaire> {
    const stagiaire = await this.stagiaireRepository.findOne({ where: { id } });
    if (!stagiaire) {
      throw new NotFoundException(`Stagiaire avec ID ${id} non trouvé.`);
    }
    return stagiaire;
  }

  async create(createStagiaireDto: CreateStagiaireDto): Promise<Stagiaire> {
    const encadrant = await this.userRepository.findOne({
      where: { id: createStagiaireDto.encadrantId },
    });
  
    if (!encadrant) {
      throw new NotFoundException('Encadrant non trouvé.');
    }
  
    const newStagiaire = this.stagiaireRepository.create({
      ...createStagiaireDto,
      dateDebut: new Date(createStagiaireDto.dateDebut),
      dateFin: new Date(createStagiaireDto.dateFin),
      encadrant,
    });
  
    return this.stagiaireRepository.save(newStagiaire);
  }
  

  async update(id: number, updateStagiaireDto: UpdateStagiaireDto): Promise<Stagiaire> {
    const stagiaire = await this.findOne(id);
    if (updateStagiaireDto.encadrantId) {
      const encadrant = await this.userRepository.findOne({ where: { id: updateStagiaireDto.encadrantId } });
      if (!encadrant) {
        throw new NotFoundException('Encadrant non trouvé.');
      }
      stagiaire.encadrant = encadrant;
    }

    Object.assign(stagiaire, updateStagiaireDto);
    return this.stagiaireRepository.save(stagiaire);
  }

  async delete(id: number): Promise<void> {
    const stagiaire = await this.findOne(id);
    await this.stagiaireRepository.remove(stagiaire);
  }
}
