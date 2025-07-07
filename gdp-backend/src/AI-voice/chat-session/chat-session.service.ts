import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './chat-session.entity';

@Injectable()
export class ChatSessionService {
  private readonly SESSION_ID = 1; 

  constructor(
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
  ) {}


  async getOrCreateSession(): Promise<ChatSession> {
    let session = await this.chatSessionRepository.findOne({ where: { id: this.SESSION_ID } });

    if (!session) {

      session = new ChatSession();
      session.id = this.SESSION_ID;
      session.messages = '';
      session = await this.chatSessionRepository.save(session);
    
    } else {
      console.log("Session existante trouvée avec messages :", session.messages);
    }

    return session;
  }


  async updateSession(newMessage: string): Promise<void> {
    const session = await this.getOrCreateSession();
    
    console.log("📝 Avant mise à jour, messages =", session.messages);
    
    session.messages += `\n${newMessage}`;

    await this.chatSessionRepository.save(session);

  
  }

  async getSessionMessages(): Promise<string> {
    const session = await this.getOrCreateSession();

    console.log("🔍 Historique récupéré :", session.messages);

    return session.messages || "⚠️ Aucun historique trouvé !";
  }
}
