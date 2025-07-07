import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checklist } from './checklist.entity';
import { ChecklistDto } from './dto/checklist.dto';

@Injectable()
export class ChecklistService {
  constructor(
    @InjectRepository(Checklist)
    private checklistRepository: Repository<Checklist>,
  ) {}

  async create(checklistDto: ChecklistDto): Promise<Checklist> {
    const existingChecklist = await this.checklistRepository.findOne({ where: { project: { id: checklistDto.projectId } } });
    if (existingChecklist) {
      throw new ConflictException('Une checklist existe déjà pour ce projet.');
    }
    const checklist = this.checklistRepository.create(checklistDto);
    return this.checklistRepository.save(checklist);
  }
  

  async findAll(): Promise<Checklist[]> {
    return this.checklistRepository.find();
  }

  async findAllByProjectId(projectId: number): Promise<Checklist[]> {
    return this.checklistRepository.find({ where: { project: { id: projectId } } });
  }

  async findOne(id: number): Promise<Checklist> {
    const checklist = await this.checklistRepository.findOne({ where: { id } });
    if (!checklist) {
      throw new NotFoundException('Checklist introuvable');
    }
    return checklist;
  }

  async update(id: number, checklistDto: Partial<ChecklistDto>): Promise<Checklist> {
    const checklist = await this.findOne(id);
    Object.assign(checklist, checklistDto);
    return this.checklistRepository.save(checklist);
  }
  
  async delete(id: number): Promise<void> {
    const checklist = await this.findOne(id);
    await this.checklistRepository.remove(checklist);
  }
}
