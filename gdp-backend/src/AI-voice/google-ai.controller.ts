import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { GoogleAiService } from './google-ai.service';
import { ChatSessionService } from './chat-session/chat-session.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('google-ai')
@UseGuards(JwtAuthGuard)
export class GoogleAiController {
  constructor(
    private readonly googleAiService: GoogleAiService,
    private readonly chatSessionService: ChatSessionService,
  ) {}

  @Post('send-message')
  async sendMessage(
    @Body('message') message: string,
    @Req() req: any
  ): Promise<{ response: string }> {
    const userRole = req.user?.role;
    const response = await this.googleAiService.sendMessage(message, userRole);
    return { response };
  }

  @Post('get-suggestions')
  async getSuggestions(
    @Body('message') message: string,
    @Req() req: any
  ): Promise<{ suggestions: string[] }> {
    const userRole = req.user?.role;
    const suggestions = await this.googleAiService.getSuggestions(message, userRole);
    return { suggestions };
  }

  @Post('reset-conversation')
  async resetConversation(): Promise<{ message: string }> {
    await this.googleAiService.resetConversation();
    return { message: 'Conversation réinitialisée avec succès' };
  }

  @Get('session')
  async getSession(): Promise<{ messages: string }> {
    const messages = await this.chatSessionService.getSessionMessages();
    return { messages };
  }
}
