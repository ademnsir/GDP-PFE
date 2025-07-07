import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { TachePeriodiqueService } from './tache-periodique.service';
import { CreateTachePeriodiqueDto, UpdateTachePeriodiqueDto } from './dto/tache-periodique.dto';
import { TachePeriodique } from './tache-periodique.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UserRole } from '../users/user.entity';

@Controller('tache-periodique')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TachePeriodiqueController {
  constructor(private readonly tacheService: TachePeriodiqueService) {}

  @Post('/add')
  @Roles(UserRole.ADMIN)
  async createTache(@Body() dto: CreateTachePeriodiqueDto): Promise<TachePeriodique> {
    try {
      return await this.tacheService.createTache(dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/all')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPER, UserRole.INFRA)
  async getAllTachesPeriodiques(): Promise<TachePeriodique[]> {
    return this.tacheService.findAll();
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPER, UserRole.INFRA)
  async getTacheById(@Param('id', ParseIntPipe) id: number): Promise<TachePeriodique> {
    return this.tacheService.findOne(id);
  }

  @Put('/update/:id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPER)
  async updateTache(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTachePeriodiqueDto,
  ): Promise<TachePeriodique> {
    try {
      return await this.tacheService.updateTache(id, dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete('/delete/:id')
  @Roles(UserRole.ADMIN)
  async deleteTache(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.tacheService.deleteTache(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/user/:userId')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPER, UserRole.INFRA)
  async getTachesByUser(@Param('userId', ParseIntPipe) userId: number): Promise<TachePeriodique[]> {
    return this.tacheService.findByUser(userId);
  }
}
