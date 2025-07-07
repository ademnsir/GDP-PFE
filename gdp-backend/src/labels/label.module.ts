import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './label.entity';
import { LabelService } from './label.service';
import { LabelController } from './label.controller';
import { TacheModule } from '../tache/tache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Label]),
    forwardRef(() => TacheModule),
  ],
  providers: [LabelService],
  controllers: [LabelController],
  exports: [LabelService],
})
export class LabelModule {} 