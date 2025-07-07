import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Project } from '../project/project.entity';
import { Tache } from '../tache/tache.entity';
import { User } from '../users/user.entity';
import { Conge } from '../conge/conge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Tache, User, Conge]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {} 