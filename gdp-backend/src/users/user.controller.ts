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
  UseInterceptors,
  UploadedFile,
  Req,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, UserStatus } from './user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { In } from 'typeorm';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Public()
  @Get('/all')
  async findAll() {
    try {
      return await this.userService.findAll();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPPER,UserRole.INFRA)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.userService.findOne(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Public()
  @Post('/add')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const imageRegex = /\/(jpg|jpeg|png)$/;
        if (!imageRegex.exec(file.mimetype)) {
          return callback(
            new HttpException('Seules les images JPG, JPEG et PNG sont autorisées', HttpStatus.BAD_REQUEST),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    try {
      if (file) {
        createUserDto.photo = `/uploads/photos/${file.filename}`;
      }

      if (typeof createUserDto.projects === 'string') {
        createUserDto.projects = JSON.parse(createUserDto.projects);
      }

      return await this.userService.create(createUserDto);
    } catch (error) {
      console.error(error);
      throw new HttpException('Failed to create user', HttpStatus.BAD_REQUEST);
    }
  }

  @Put('/update/:id')
  @Roles(UserRole.ADMIN, UserRole.INFRA, UserRole.DEVELOPPER)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any
  ) {
    try {
      // Vérifier si l'utilisateur essaie de mettre à jour son propre profil
      const isSelfUpdate = req.user.userId === id;
      
      // Si ce n'est pas une mise à jour de son propre profil, vérifier les rôles
      if (!isSelfUpdate && ![UserRole.ADMIN, UserRole.INFRA].includes(req.user.role)) {
        throw new HttpException(
          'Vous n\'avez pas les permissions nécessaires pour mettre à jour ce profil',
          HttpStatus.FORBIDDEN
        );
      }

      const updatedUser = await this.userService.update(id, updateUserDto);
      if (!updatedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return updatedUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('/remove/:id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.userService.delete(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      
      if (error instanceof NotFoundException) {
        throw new HttpException(
          error.message,
          HttpStatus.NOT_FOUND,
        );
      }
      
      if (error instanceof BadRequestException) {
        throw new HttpException(
          error.message,
          HttpStatus.BAD_REQUEST,
        );
      }
      
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/upload-photo')
  @Roles(UserRole.ADMIN, UserRole.INFRA)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const imageRegex = /\/(jpg|jpeg|png)$/;
        if (!imageRegex.exec(file.mimetype)) {
          return callback(
            new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('File upload failed', HttpStatus.BAD_REQUEST);
    }
    return { path: `/uploads/photos/${file.filename}` };
  }

  @Get('/profile')
  @Roles(UserRole.ADMIN)
  getProfile() {
    return { message: 'This is a protected user profile route' };
  }

  @Get('/email/:email')
  @Roles(UserRole.ADMIN)
  async findByEmail(@Param('email') email: string) {
    return await this.userService.findByEmail(email);
  }

  @Get('/matricule/:matricule')
  @Roles(UserRole.ADMIN)
  async findByMatricule(@Param('matricule') matricule: string) {
    return await this.userService.findByMatricule(matricule);
  }

  @Put('/status/:id')
  @Roles(UserRole.ADMIN)
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: UserStatus,
  ) {
    try {
      console.log(`Mise à jour du statut de l'utilisateur ${id} vers ${status}`);
      const updatedUser = await this.userService.updateUserStatus(id, status);
      console.log(`Statut mis à jour avec succès pour l'utilisateur ${id}`);
      return {
        message: `Statut de l'utilisateur mis à jour avec succès vers ${status}`,
        user: updatedUser
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw new HttpException(
        'Failed to update user status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('request-password-reset')
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto): Promise<{ message: string }> {
    await this.userService.requestPasswordReset(requestPasswordResetDto);
    return { message: 'Si un compte existe avec cet email, vous recevrez un email de réinitialisation' };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.userService.resetPassword(resetPasswordDto);
    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  @Post('change-password')
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const userId = req.user.userId;
    await this.userService.changePassword(userId, changePasswordDto);
    return { message: 'Mot de passe modifié avec succès.' };
  }

  @Put('/update-photo/:id')
  @Roles(UserRole.ADMIN, UserRole.INFRA)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const imageRegex = /\/(jpg|jpeg|png)$/;
        if (!imageRegex.exec(file.mimetype)) {
          return callback(
            new HttpException('Seules les images JPG, JPEG et PNG sont autorisées', HttpStatus.BAD_REQUEST),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updatePhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    try {
      if (!file) {
        throw new HttpException('Aucun fichier fourni', HttpStatus.BAD_REQUEST);
      }

      const photoPath = `/uploads/photos/${file.filename}`;
      const updatedUser = await this.userService.updatePhoto(id, photoPath);
      
      if (!updatedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      
      return {
        message: 'Photo de profil mise à jour avec succès',
        user: updatedUser
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update user photo',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
