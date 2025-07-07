import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator'; // Assure-toi que le chemin est correct

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public() // 👈 Ceci permet à cette route d'être accessible sans JWT
  getHello(): string {
    return this.appService.getHello();
  }
}
