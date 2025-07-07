// src/AI-voice/chat-session/chat-session.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSessionService } from './chat-session.service';
import { ChatSession } from '../chat-session/chat-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatSession])],
  providers: [ChatSessionService],
  exports: [ChatSessionService],
})
export class ChatSessionModule {}
export { ChatSession };

