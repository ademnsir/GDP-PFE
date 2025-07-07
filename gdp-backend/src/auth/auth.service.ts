import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '../users/user.entity';
import { OAuth2Client } from 'google-auth-library';
import * as dotenv from 'dotenv';
import { CreateUserDto } from '../users/dto/user.dto';

dotenv.config();

@Injectable()
export class AuthService {
  private client: OAuth2Client;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  private cleanPhotoUrl(url: string): string {
    // Supprimer le @ au début de l'URL si présent
    return url.startsWith('@') ? url.substring(1) : url;
  }

  async validateUser(matricule: string, password: string): Promise<any | null> {
    try {
      console.log('Tentative de connexion avec matricule:', matricule);
      
      const user = await this.userService.findByMatricule(matricule);
      console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');
      
      if (!user) {
        console.log('Aucun utilisateur trouvé avec ce matricule');
        return null;
      }

      console.log('Vérification du mot de passe...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Mot de passe valide:', isPasswordValid);

      if (isPasswordValid) {
        const { password, ...result } = user;
        console.log('Connexion réussie pour:', result.matricule);
        return result;
      }

      console.log('Mot de passe incorrect');
      return null;
    } catch (error) {
      console.error('Erreur lors de la validation de l\'utilisateur:', error);
      throw error;
    }
  }

  async login(user: any) {
    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      sub: user.id,
      role: user.role,
      photo: user.photo,
      matricule: user.matricule,
      userId: user.id,
      email: user.email
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userDto: any) {
    return this.userService.create(userDto);
  }

  async googleLogin(req: any): Promise<any> {
    try {
      if (!req.user) {
        console.error('No user data received from Google');
        throw new UnauthorizedException('No user from google');
      }

      console.log('Google login user data:', JSON.stringify(req.user, null, 2));

      const { email, firstName, lastName, photo } = req.user;
      
      if (!email) {
        console.error('No email provided from Google');
        throw new UnauthorizedException('No email provided from Google');
      }

      let user = await this.userService.findByEmail(email);
      console.log('Existing user:', user ? JSON.stringify(user, null, 2) : 'Not found');

      if (!user) {
        const createUserDto: CreateUserDto = {
          email: email,
          firstName: firstName || '',
          lastName: lastName || '',
          role: UserRole.DEVELOPPER,
          password: await bcrypt.hash(Math.random().toString(36), 10),
          username: email.split('@')[0],
          matricule: `WB${Date.now().toString().slice(-6)}`,
          status: UserStatus.ACTIF,
          hireDate: new Date(),
          endDate: new Date(),
          projects: [],
          photo: photo ? this.cleanPhotoUrl(photo) : null
        };
        console.log('Creating new user with data:', JSON.stringify(createUserDto, null, 2));
        user = await this.userService.create(createUserDto);
        console.log('New user created:', JSON.stringify(user, null, 2));
      } else {
        // Mettre à jour la photo de l'utilisateur existant si elle est null
        if (!user.photo && photo) {
          const updateData = {
            photo: this.cleanPhotoUrl(photo),
            matricule: user.matricule // Préserver le matricule existant
          };
          user = await this.userService.update(user.id, updateData);
          console.log('Updated user photo:', JSON.stringify(user, null, 2));
        }
      }

      const payload = {
        firstName: user.firstName,
        lastName: user.lastName,
        sub: user.id,
        role: user.role,
        photo: user.photo,
        matricule: user.matricule,
        userId: user.id,
        email: user.email
      };
      console.log('JWT payload:', JSON.stringify(payload, null, 2));
      
      const jwt = this.jwtService.sign(payload);
      return {
        user,
        access_token: jwt,
      };
    } catch (error) {
      console.error('Error in googleLogin:', error);
      throw error;
    }
  }
}
