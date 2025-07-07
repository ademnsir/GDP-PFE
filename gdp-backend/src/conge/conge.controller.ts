import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  UseGuards,
  Res,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { CongeService } from './conge.service';
import { CreateCongeDto, UpdateCongeDto } from './dto/conge.dto';
import { Response } from 'express';
import { CongeStatus } from './conge.entity';
import { JwtAuthGuard  } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('conges')
@UseGuards(JwtAuthGuard , RolesGuard)
export class CongeController {
  constructor(private readonly congeService: CongeService) {}

  @Post('/add')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPER, UserRole.INFRA)
  async create(@Body() createCongeDto: CreateCongeDto) {
    return this.congeService.create(createCongeDto);
  }
  
  @Get('/all')
  @Roles(UserRole.ADMIN, UserRole.INFRA) 
  async findAll() {
    return this.congeService.findAll();
  }

  @Get('download-pdf/:id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPER, UserRole.INFRA)
  async downloadCongePDF(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    const congeId = Number(id);
    if (isNaN(congeId) || congeId <= 0) {
      throw new BadRequestException("❌ L'ID doit être un nombre valide.");
    }

    return this.congeService.generateCongePDF(congeId, res);
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.INFRA) // Only admins and INFRA can view a specific congé
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.congeService.findOne(id);
  }

  @Put('/update/:id')
  @Roles(UserRole.ADMIN, UserRole.INFRA) // Only admins and INFRA can update congés
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCongeDto: UpdateCongeDto,
  ) {
    return this.congeService.update(id, updateCongeDto);
  }

  @Delete('/remove/:id')
  @Roles(UserRole.ADMIN) // Only admins can delete congés
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.congeService.delete(id);
  }

  @Delete('/cancel/:id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPER, UserRole.INFRA)
  async cancelConge(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.congeService.cancelConge(id, req.user.userId);
  }

  @Get('/matricule/:matricule')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPER,UserRole.INFRA) // Only admins and INFRA can search by matricule
  async findByMatricule(@Param('matricule') matricule: string) {
    return this.congeService.findByMatricule(matricule);
  }

  @Get('/all/matricule/:matricule')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPER, UserRole.INFRA)
  async findAllByMatricule(@Param('matricule') matricule: string) {
    return this.congeService.findAllByMatricule(matricule);
  }

  @Put('update-status/:id')
  @Roles(UserRole.ADMIN, UserRole.INFRA) // Only admins and INFRA can update congé status
  async updateCongeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ) {
    const validStatuses = Object.values(CongeStatus);
    if (!validStatuses.includes(body.status as CongeStatus)) {
      throw new BadRequestException(`Invalid status value. Expected one of ${validStatuses.join(', ')}`);
    }
    return this.congeService.updateCongeStatus(id, body.status as CongeStatus);
  }

  @Get('/month/:month')
  @Roles(UserRole.ADMIN, UserRole.INFRA)
  async getCongesByMonth(@Param('month') month: string) {
    return this.congeService.getCongesByMonth(month);
  }

  @Get('/stats/monthly')
  @Roles(UserRole.ADMIN, UserRole.INFRA)
  async getMonthlyStats() {
    return this.congeService.getMonthlyStats();
  }
}
