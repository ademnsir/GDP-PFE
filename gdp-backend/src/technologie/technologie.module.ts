import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technologie } from './technologie.entity';
import { TechnologieService } from './technologie.service';
import { TechnologieController } from './technologie.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Technologie])],
  providers: [TechnologieService],
  controllers: [TechnologieController],
  exports: [TypeOrmModule],
})
export class TechnologieModule {}
