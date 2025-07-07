import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard'; // Correct import
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('/add')
  @Roles(UserRole.ADMIN)
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get('/all')
  @Roles(UserRole.ADMIN, UserRole.INFRA, UserRole.DEVELOPPER)
  findAll() {
    return this.projectService.findAll();
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.INFRA, UserRole.DEVELOPPER)
  findOne(@Param('id') id: number) {
    return this.projectService.findOne(id);
  }

  @Put('/update/:id')
  @Roles(UserRole.ADMIN, UserRole.INFRA)
  update(@Param('id') id: number, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete('/remove/:id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: number) {
    try {
      await this.projectService.delete(id);
      return { 
        success: true, 
        message: 'Projet supprimé avec succès',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur dans le contrôleur lors de la suppression:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });

      if (error instanceof NotFoundException) {
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          error: error.message,
          timestamp: new Date().toISOString()
        }, HttpStatus.NOT_FOUND);
      }

      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Une erreur est survenue lors de la suppression du projet',
        details: error.message,
        timestamp: new Date().toISOString()
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('assign-users-by-email/:id')
  @Roles(UserRole.ADMIN, UserRole.INFRA, UserRole.DEVELOPPER)
  async assignUsersByEmail(
    @Param('id') projectId: number,
    @Body('emails') emails: string[],
    @Req() req: any
  ) {
    try {
      console.log('User from request:', req.user);

      // Vérifier si l'utilisateur est un DEVELOPPER
      if (req.user.role === UserRole.DEVELOPPER) {
        // Vérifier si l'utilisateur est déjà assigné au projet
        const project = await this.projectService.findOne(projectId);
        console.log('Project users:', project.users);
        console.log('User ID to check:', req.user.userId);

        // Vérifier si l'utilisateur est dans la liste des utilisateurs du projet
        const isUserAssigned = project.users.some(user => {
          console.log('Comparing user.id:', user.id, 'with req.user.userId:', req.user.userId);
          return user.id === req.user.userId;
        });
        
        console.log('Is user assigned:', isUserAssigned);

        if (!isUserAssigned) {
          throw new HttpException(
            'Vous devez être assigné au projet pour pouvoir y ajouter d\'autres utilisateurs',
            HttpStatus.FORBIDDEN
          );
        }
      }

      // Vérifier si les emails sont valides
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        throw new HttpException(
          'La liste des emails est invalide',
          HttpStatus.BAD_REQUEST
        );
      }

      // Vérifier si les utilisateurs existent et ont les bons rôles
      const users = await this.projectService.findUsersByEmails(emails);
      if (users.length !== emails.length) {
        throw new HttpException(
          'Certains utilisateurs n\'ont pas été trouvés',
          HttpStatus.BAD_REQUEST
        );
      }

      return this.projectService.assignUsersByEmail(projectId, emails);
    } catch (error) {
      console.error('Error in assignUsersByEmail:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to assign users to project',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
