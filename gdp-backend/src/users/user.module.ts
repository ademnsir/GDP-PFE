import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ProjectModule } from '../project/project.module';
import { CongeModule } from '../conge/conge.module';
import { NotificationModule } from '../notifications/notification.module';
import { TacheModule } from '../tache/tache.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { Project } from '../project/project.entity';
import { EmailService } from '../email/email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Project]),
    ProjectModule,
    CongeModule,
    NotificationModule,
    forwardRef(() => AuthModule),
    forwardRef(() => TacheModule),
    JwtModule.register({}),
    ConfigModule,
  ],
  providers: [UserService, EmailService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
