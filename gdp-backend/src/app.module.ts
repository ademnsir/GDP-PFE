﻿import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core'; 
import { RolesGuard } from './auth/guards/roles.guard'; 
import { JwtAuthGuard } from './auth/guards/auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { ProjectModule } from './project/project.module';
import { CongeModule } from './conge/conge.module';
import { TacheModule } from './tache/tache.module';
import { TachePeriodiqueModule } from './tachePeriodique/tache-periodique.module';
import { TechnologieModule } from './technologie/technologie.module';
import { LivrableModule } from './livrable/livrable.module';
import { AuthModule } from './auth/auth.module';
import { StagiaireModule } from './stagiere/stagiaire.module';
import { NotificationModule } from './notifications/notification.module';
import { TechnologyController } from './services/technology.controller';
import { TechnologyVersionService } from './services/technology-version.service';
import { ChecklistModule } from './checklist/checklist.module'; 
import { EnvironnementModule } from './environnement/environnement.module';
import { GoogleAiModule } from './AI-voice/google-ai.module';
import { ChatSessionModule } from './AI-voice/chat-session/chat-session.module';
import { PowerbiModule } from './powerbi/powerbi.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_NAME || 'gestion_projet_wifakbank',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    
    
    UserModule,
    ProjectModule,
    CongeModule,
    TacheModule,
    TachePeriodiqueModule,
    TechnologieModule,
    LivrableModule,
    AuthModule,
    StagiaireModule,
    NotificationModule,
    ChecklistModule, 
    EnvironnementModule,
    GoogleAiModule,
    ChatSessionModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
    PowerbiModule,
    DashboardModule,
  ],
  controllers: [AppController, TechnologyController],
  providers: [
    AppService,
    TechnologyVersionService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, 
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, 
    },
  ],
})
export class AppModule {}
