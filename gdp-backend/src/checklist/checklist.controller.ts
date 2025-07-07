import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { ChecklistDto } from './dto/checklist.dto';

@Controller('checklists')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Post('/add')
  async create(@Body() checklistDto: ChecklistDto) {
    console.log('Received Checklist Data:', checklistDto); // Log the received data
    return this.checklistService.create(checklistDto);
  }
  

  @Get('/all')
  findAll() {
    return this.checklistService.findAll();
  }

  @Get('/project/:projectId')
  findAllByProjectId(@Param('projectId') projectId: number) {
    return this.checklistService.findAllByProjectId(projectId);
  }

  @Get('/:id')
  findOne(@Param('id') id: number) {
    return this.checklistService.findOne(id);
  }

  @Put('/update/:id')
  update(@Param('id') id: number, @Body() checklistDto: Partial<ChecklistDto>) {
    return this.checklistService.update(id, checklistDto);
  }
  
  @Delete('/remove/:id')
  delete(@Param('id') id: number) {
    return this.checklistService.delete(id);
  }
}
