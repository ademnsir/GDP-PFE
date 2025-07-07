import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Livrable } from './livrable.entity';
import { LivrableService } from './livrable.service';
import { LivrableController } from './livrable.controller';
import { Project } from '../project/project.entity';
import { Technologie } from '../technologie/technologie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Livrable, Project, Technologie])],
  providers: [LivrableService],
  controllers: [LivrableController],
  exports: [TypeOrmModule],
})
export class LivrableModule {}
