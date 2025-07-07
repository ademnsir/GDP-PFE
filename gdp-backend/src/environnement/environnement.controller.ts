import { Controller, Get, Post, Put, Delete, Param, Body, Res, UseGuards } from '@nestjs/common';
import { EnvironnementService } from './environnement.service';
import { EnvironnementDto } from './dto/environnement.dto';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('environnements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnvironnementController {
  constructor(private readonly environnementService: EnvironnementService) {}

  @Post('/add')
  @Roles(UserRole.ADMIN, UserRole.INFRA)
  async create(@Body() environnementDto: EnvironnementDto) {
    return this.environnementService.create(environnementDto);
  }

  @Get('/all')
  @Roles(UserRole.ADMIN, UserRole.INFRA)
  findAll() {
    return this.environnementService.findAll();
  }

  @Get('/project/:projectId')
  @Roles(UserRole.ADMIN, UserRole.INFRA, UserRole.DEVELOPPER)
  findAllByProjectId(@Param('projectId') projectId: number) {
    return this.environnementService.findAllByProjectId(projectId);
  }

  @Get('/export')
  @Roles(UserRole.ADMIN, UserRole.INFRA)
  async exportToExcel(@Res() res: Response) {
    const environnements = await this.environnementService.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Environnements');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nom Serveur', key: 'nomServeur', width: 20 },
      { header: 'Système Exploitation', key: 'systemeExploitation', width: 20 },
      { header: 'IP Serveur', key: 'ipServeur', width: 15 },
      { header: 'Port', key: 'port', width: 10 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Protocole', key: 'Ptype', width: 15 }, // Added protocol type
      { header: 'Composant', key: 'componentType', width: 15 }, // Added component type
      { header: 'CPU', key: 'cpu', width: 15 },
      { header: 'RAM', key: 'ram', width: 15 },
      { header: 'Stockage', key: 'stockage', width: 15 },
      { header: 'Logiciels Installés', key: 'logicielsInstalled', width: 30 },
      { header: 'Nom Utilisateur', key: 'nomUtilisateur', width: 20 },
      { header: 'Mot de Passe', key: 'motDePasse', width: 20 },
      { header: 'Nom Projet', key: 'projectName', width: 25 },
    ];

    environnements.forEach(env => {
      worksheet.addRow({
        ...env,
        projectName: env.project?.name || 'N/A',
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=environnements.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.INFRA, UserRole.DEVELOPPER)
  findOne(@Param('id') id: number) {
    return this.environnementService.findOne(id);
  }

  @Put('/update/:id')
  @Roles(UserRole.ADMIN, UserRole.INFRA)
  update(@Param('id') id: number, @Body() environnementDto: Partial<EnvironnementDto>) {
    return this.environnementService.update(id, environnementDto);
  }

  @Delete('/remove/:id')
  @Roles(UserRole.ADMIN,UserRole.INFRA)
  delete(@Param('id') id: number) {
    return this.environnementService.delete(id);
  }
}
