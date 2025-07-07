import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Technologie } from './technologie.entity';
import { CreateTechnologieDto, UpdateTechnologieDto } from './dto/technologie.dto';

@Injectable()
export class TechnologieService {
  constructor(@InjectRepository(Technologie) private techRepo: Repository<Technologie>) {}

  async create(dto: CreateTechnologieDto): Promise<Technologie> {
    const tech = this.techRepo.create(dto);
    return this.techRepo.save(tech);
  }

  async update(id: number, dto: UpdateTechnologieDto): Promise<Technologie> {
    await this.techRepo.update(id, dto);
    return this.techRepo.findOne({ where: { id } });
  }

  async getAll(): Promise<Technologie[]> {
    return this.techRepo.find();
  }
}
