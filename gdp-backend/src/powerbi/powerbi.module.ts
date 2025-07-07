import { Module } from '@nestjs/common';
import { PowerbiController } from './powerbi.controller';
import { PowerbiService } from './powerbi.service';

@Module({
  controllers: [PowerbiController],
  providers: [PowerbiService],
  exports: [PowerbiService],
})
export class PowerbiModule {} 