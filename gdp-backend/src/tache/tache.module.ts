import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tache } from './tache.entity';
import { Project } from '../project/project.entity';
import { TacheService } from './tache.service';
import { TacheController } from './tache.controller';
import { UserModule } from '../users/user.module';
import { LabelModule } from '../labels/label.module';

// tache.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Tache, Project]),
    forwardRef(() => UserModule), // Correction de la dépendance circulaire
    forwardRef(() => LabelModule),
  ],
  controllers: [TacheController],
  providers: [TacheService],
  exports: [TacheService], // Export pour d'autres modules si besoin
})
export class TacheModule {}

