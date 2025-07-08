import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserStatus, UserRole } from './user.entity';
import { Project } from '../project/project.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';
import { NotificationService } from '../notifications/notification.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import { MoreThan, Not, IsNull } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private notificationService: NotificationService,
    private emailService: EmailService,
  ) {}

  private cleanPhotoUrl(url: string): string {
    // Supprimer le @ au début de l'URL si présent
    return url.startsWith('@') ? url.substring(1) : url;
  }

  // 🔍 Récupérer tous les utilisateurs avec leurs projets
  async findAll(): Promise<User[]> {
    return this.userRepository.find({ 
      relations: ['projects'] 
    });
  }

  // 🔍 Récupérer un utilisateur par ID avec ses projets
  async findOne(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['projects'],
    });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return user;
  }

  // 🆕 ✅ Créer un nouvel utilisateur (Ajout d'une notification si suspendu)
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { projects, password, photo, matricule, ...userData } = createUserDto;

    // Hash du mot de passe
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const projectEntities = projects
      ? await this.projectRepository.find({ where: { id: In(projects) } })
      : [];

    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      photo: photo ? this.cleanPhotoUrl(photo) : null,
      status: UserStatus.ACTIF,
      matricule,
      projects: projectEntities,
    });

    const savedUser = await this.userRepository.save(newUser);
    console.log(`Utilisateur créé avec succès avec le statut ACTIF: ${savedUser.matricule}`);

    return savedUser;
  }

  // ✅ Mettre à jour un utilisateur (Ajout d'une notification si le statut passe à SUSPENDU)
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    // Vérifier si l'utilisateur est un utilisateur Google
    const isGoogleUser = user.email.includes('@gmail.com') || user.photo?.includes('googleusercontent.com');

    if (isGoogleUser) {
      // Pour les utilisateurs Google, on ne permet pas la modification des champs de base
      const { firstName, lastName, email, ...allowedUpdates } = updateUserDto;
      
      // Mettre à jour uniquement les champs autorisés
      Object.assign(user, allowedUpdates);
    } else {
      // Pour les utilisateurs normaux, on permet la modification de tous les champs
      Object.assign(user, updateUserDto);
    }

    // Si un mot de passe est fourni, le hacher
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return await this.userRepository.save(user);
  }

 
  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    try {
      // Charger l'utilisateur avec toutes ses relations
      const userWithRelations = await this.userRepository.findOne({
        where: { id },
        relations: ['projects', 'conges', 'stagiaires', 'notifications', 'taches']
      });

      if (!userWithRelations) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Supprimer l'utilisateur de tous les projets (retirer de la relation many-to-many)
      if (userWithRelations.projects && userWithRelations.projects.length > 0) {
        for (const project of userWithRelations.projects) {
          // Charger le projet avec ses utilisateurs
          const projectWithUsers = await this.projectRepository.findOne({
            where: { id: project.id },
            relations: ['users']
          });
          if (projectWithUsers) {
            projectWithUsers.users = projectWithUsers.users.filter(u => u.id !== id);
            await this.projectRepository.save(projectWithUsers);
          }
        }
      }

      // Log des relations qui seront supprimées par cascade
      if (userWithRelations.conges && userWithRelations.conges.length > 0) {
        console.log(`Suppression de ${userWithRelations.conges.length} congés pour l'utilisateur ${id}`);
      }
      if (userWithRelations.stagiaires && userWithRelations.stagiaires.length > 0) {
        console.log(`Suppression de ${userWithRelations.stagiaires.length} stagiaires pour l'utilisateur ${id}`);
      }
      if (userWithRelations.notifications && userWithRelations.notifications.length > 0) {
        console.log(`Suppression de ${userWithRelations.notifications.length} notifications pour l'utilisateur ${id}`);
      }
      if (userWithRelations.taches && userWithRelations.taches.length > 0) {
        console.log(`Suppression de ${userWithRelations.taches.length} tâches pour l'utilisateur ${id}`);
      }

      // Suppression physique définitive de l'utilisateur
      // Les cascades configurées dans les entités vont automatiquement supprimer toutes les relations
      await this.userRepository.remove(userWithRelations);
      
      console.log(`Utilisateur ${id} supprimé définitivement avec toutes ses relations`);
    } catch (error) {
      console.error(`Erreur lors de la suppression définitive de l'utilisateur ${id}:`, error);
      
      // Message d'erreur plus spécifique
      if (error.message && error.message.includes('contrainte de clé étrangère')) {
        throw new BadRequestException('Impossible de supprimer cet utilisateur car il a des données liées (congés, tâches, etc.). Veuillez d\'abord supprimer ces données.');
      }
      
      throw new BadRequestException('Impossible de supprimer cet utilisateur.');
    }
  }


  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

 
  async findByMatricule(matricule: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { matricule } });
  }


  async updateUserStatus(id: number, status: UserStatus): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    user.status = status;
    return await this.userRepository.save(user);
  }

  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto): Promise<void> {
    const user = await this.findByEmail(requestPasswordResetDto.email);
    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return;
    }

    // Générer un token unique
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Définir l'expiration à 1 heure
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    // Sauvegarder le token et la date d'expiration
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = resetExpires;
    await this.userRepository.save(user);

    // Envoyer l'email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    // Chercher tous les utilisateurs avec un token non expiré
    const users = await this.userRepository.find({
      where: {
        resetPasswordExpires: MoreThan(new Date()),
        resetPasswordToken: Not(IsNull())
      }
    });

    // Trouver l'utilisateur avec le bon token
    let user = null;
    for (const u of users) {
      const isValidToken = await bcrypt.compare(resetPasswordDto.token, u.resetPasswordToken);
      if (isValidToken) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    // Mettre à jour le mot de passe
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(resetPasswordDto.newPassword, salt);
    
    // Réinitialiser les champs de réinitialisation
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    
    await this.userRepository.save(user);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`Utilisateur non trouvé.`);
    }

    const isPasswordMatching = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordMatching) {
      throw new BadRequestException('L\'ancien mot de passe est incorrect.');
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(changePasswordDto.newPassword, salt);

    await this.userRepository.save(user);
  }

  // ✅ Mettre à jour la photo de profil d'un utilisateur
  async updatePhoto(id: number, photoPath: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    // Vérifier si l'utilisateur est un utilisateur Google
    const isGoogleUser = user.email.includes('@gmail.com') || user.photo?.includes('googleusercontent.com');

    if (isGoogleUser) {
      throw new BadRequestException('Impossible de modifier la photo d\'un utilisateur Google');
    }

    // Mettre à jour la photo
    user.photo = this.cleanPhotoUrl(photoPath);
    
    return await this.userRepository.save(user);
  }

}

