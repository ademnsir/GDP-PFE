import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stagiaire } from './stagiaire.entity';
import { StagiaireService } from './stagiaire.service';
import { StagiaireController } from './stagiaire.controller';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stagiaire, User])],
  controllers: [StagiaireController],
  providers: [StagiaireService],
  exports: [StagiaireService],
})
export class StagiaireModule {}
