import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'matricule',
    });
  }

  async validate(matricule: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(matricule, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
} 