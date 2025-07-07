import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { Technologie } from '../technologie/technologie.entity';
import { Livrable } from '../livrable/livrable.entity';
import { Checklist } from '../checklist/checklist.entity';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { LivrableModule } from '../livrable/livrable.module';
import { TechnologieModule } from '../technologie/technologie.module';
import { AuthModule } from '../auth/auth.module'; 
import { JwtModule } from '@nestjs/jwt'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, User, Technologie, Livrable, Checklist]),
    LivrableModule,
    TechnologieModule,
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET, 
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
  exports: [TypeOrmModule],
})
export class ProjectModule {}
