import { Controller, Get, Post, Body } from '@nestjs/common';
import { TechnologieService } from './technologie.service';
import { CreateTechnologieDto } from './dto/technologie.dto';

@Controller('technologies')
export class TechnologieController {
  constructor(private readonly technologieService: TechnologieService) {}

  @Post('/add')
  createTechnologie(@Body() createTechnologieDto: CreateTechnologieDto) {
    return this.technologieService.create(createTechnologieDto);
  }


  @Get('/all')
  async findAll() {
    return this.technologieService.getAll();
  }
}
