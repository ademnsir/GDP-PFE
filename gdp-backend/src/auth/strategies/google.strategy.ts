import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      console.log('Raw Google profile:', JSON.stringify(profile, null, 2));
      
      const { name, emails, photos } = profile;
      
      if (!emails || !emails[0] || !emails[0].value) {
        console.error('No email found in Google profile');
        return done(new Error('No email found in Google profile'), null);
      }

      const user = {
        email: emails[0].value,
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        photo: photos?.[0]?.value || null,
        accessToken,
      };

      console.log('Processed user data:', JSON.stringify(user, null, 2));
      done(null, user);
    } catch (error) {
      console.error('Error in Google strategy validate:', error);
      done(error, null);
    }
  }
}
