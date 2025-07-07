import { Controller, Post, Body, Get, Param, Patch, Delete, Query } from '@nestjs/common';
import { TacheService } from './tache.service';
import { CreateTacheDto } from './dto/tache.dto';
import { Tache } from './tache.entity';

@Controller('taches')
export class TacheController {
  constructor(private readonly tacheService: TacheService) {}

  @Post('/add')
  createTache(@Body() createTacheDto: CreateTacheDto): Promise<Tache> {
    return this.tacheService.createTache(createTacheDto);
  }

  @Get('project/:projectId')
  findAllByProject(@Param('projectId') projectId: number): Promise<Tache[]> {
    return this.tacheService.findAllByProject(projectId);
  }

  @Get('project/:projectId/filter')
  findByProjectAndType(
    @Param('projectId') projectId: number,
    @Query('type') type: string
  ): Promise<Tache[]> {
    return this.tacheService.findByProjectAndType(projectId, type);
  }

  @Patch('update/:id')
  updateTache(@Param('id') id: number, @Body() updateData: Partial<Tache>): Promise<Tache> {
    return this.tacheService.updateTache(id, updateData);
  }

  @Delete('delete/:id')
  deleteTache(@Param('id') id: number): Promise<void> {
    return this.tacheService.deleteTache(id);
  }
}
