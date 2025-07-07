import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistController } from './checklist.controller';
import { ChecklistService } from './checklist.service';
import { Checklist } from './checklist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Checklist])],
  controllers: [ChecklistController],
  providers: [ChecklistService],
})
export class ChecklistModule {}
