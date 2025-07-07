import { Controller, Post, Body, HttpException, HttpStatus, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/user.dto';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @Post('signin')
  async signIn(@Body() body) {
    try {
      console.log('Tentative de connexion avec les données:', { matricule: body.matricule });

      if (!body.matricule || !body.password) {
        console.log('Données de connexion manquantes');
        throw new HttpException('Matricule et mot de passe requis', HttpStatus.BAD_REQUEST);
      }

      const user = await this.authService.validateUser(body.matricule, body.password);
      console.log('Résultat de la validation:', user ? 'Succès' : 'Échec');

      if (!user) {
        console.log('Échec de l\'authentification: identifiants invalides');
        throw new HttpException('Matricule ou mot de passe incorrect', HttpStatus.UNAUTHORIZED);
      }

      // Vérifier si l'utilisateur est actif
      if (user.status !== 'ACTIF') {
        console.log('Échec de l\'authentification: compte inactif');
        throw new HttpException('Votre compte n\'est pas actif. Veuillez contacter l\'administrateur.', HttpStatus.FORBIDDEN);
      }

      console.log('Authentification réussie pour:', user.matricule);
      const result = await this.authService.login(user);
      console.log('Token généré avec succès');
      return result;
    } catch (error) {
      console.error('Erreur détaillée lors de la connexion:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Erreur lors de la connexion',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Request() req) {
    return this.authService.register(req.body);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Cette route redirigera vers la page de connexion Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    try {
      console.log('Google callback received:', req.user);
      const result = await this.authService.googleLogin(req);
      
      if (!result || !result.access_token) {
        console.error('No token generated');
        throw new Error('No token generated');
      }

      // Rediriger vers le frontend avec le token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.access_token}`;
      console.log('Redirecting to:', redirectUrl);
      
      res.status(302).redirect(redirectUrl);
    } catch (error) {
      console.error('Google auth error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.status(302).redirect(`${frontendUrl}/SignIn?error=google_auth_failed`);
    }
  }
}
