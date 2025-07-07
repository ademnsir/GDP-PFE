import { Module } from '@nestjs/common';
import { GoogleAiService } from './google-ai.service';
import { GoogleAiController } from './google-ai.controller';
import { ChatSessionModule } from '../AI-voice/chat-session/chat-session.module';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { ProjectContextService } from './project-context.service';

@Module({
  imports: [ChatSessionModule, AuthModule],
  controllers: [GoogleAiController],
  providers: [GoogleAiService, ProjectContextService, JwtAuthGuard],
})
export class GoogleAiModule {}
