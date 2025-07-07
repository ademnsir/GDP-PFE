import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { LabelService } from './label.service';
import { Label } from './label.entity';

@Controller('labels')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Get()
  findAll(): Promise<Label[]> {
    return this.labelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Label> {
    return this.labelService.findOne(id);
  }

  @Post()
  create(@Body() label: Partial<Label>): Promise<Label> {
    return this.labelService.create(label);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() label: Partial<Label>): Promise<Label> {
    return this.labelService.update(id, label);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.labelService.delete(id);
  }
} 