import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PowerbiService {
  private readonly embedToken: string;
  private readonly defaultReportId: string;

  constructor(private configService: ConfigService) {
    this.embedToken = this.configService.get<string>('POWERBI_EMBED_TOKEN');
    this.defaultReportId = this.configService.get<string>('POWERBI_REPORT_ID');
  }

  async getEmbedToken(reportId?: string): Promise<string> {
    // Pour le développement, on retourne directement le token
    return this.embedToken;
  }
} 