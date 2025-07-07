import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { LivrableService } from './livrable.service';
import { CreateLivrableDto, UpdateLivrableDto } from './dto/livrable.dto';

@Controller('livrables')
export class LivrableController {
  constructor(private readonly livrableService: LivrableService) {}

  @Post('/add')
  async create(@Body() createLivrableDto: CreateLivrableDto) {
    return this.livrableService.createLivrable(createLivrableDto);
  }

  @Put('/update/:id')
  async update(@Param('id') id: number, @Body() updateLivrableDto: UpdateLivrableDto) {
    return this.livrableService.updateLivrable(id, updateLivrableDto);
  }

  @Get('/all')
  async findAll() {
    return this.livrableService.getAllLivrables();
  }
}
