import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();

    if (isPublic) {
      this.logger.log('Route publique, accès autorisé');
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    this.logger.log(`Token extrait: ${token ? 'présent' : 'absent'}`);

    if (!token) {
      this.logger.warn('Aucun token fourni dans la requête');
      throw new UnauthorizedException('Aucun token fourni');
    }

    try {
      this.logger.log('Tentative de vérification du token...');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      this.logger.log(`Token vérifié avec succès, payload: ${JSON.stringify(payload)}`);
      request['user'] = payload;
    } catch (err) {
      this.logger.error(`Erreur lors de la vérification du token: ${err.message}`);
      throw new UnauthorizedException('Token invalide ou expiré');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    this.logger.log(`Header Authorization: ${authHeader}`);
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
