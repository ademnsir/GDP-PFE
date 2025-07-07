import { Controller, Post, Body } from '@nestjs/common';
import { PowerbiService } from './powerbi.service';

@Controller('powerbi')
export class PowerbiController {
  constructor(private readonly powerbiService: PowerbiService) {}

  @Post('token')
  async getEmbedToken(@Body('reportId') reportId: string) {
    const token = await this.powerbiService.getEmbedToken(reportId);
    return { accessToken: token };
  }
} 