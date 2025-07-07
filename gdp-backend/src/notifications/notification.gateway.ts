import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
  
  @WebSocketGateway({ cors: true }) // ✅ Active WebSocket avec CORS
  export class NotificationGateway {
    @WebSocketServer()
    server: Server;
  
    // ✅ Fonction pour envoyer une notification à un utilisateur spécifique
    sendNotification(userId: number, message: string) {
      this.server.emit(`notification:${userId}`, { message });
      console.log(`📩 Notification envoyée à l'utilisateur ${userId}:`, message);
    }
  
    // ✅ Écoute les messages WebSocket envoyés par le frontend
    @SubscribeMessage('sendNotification')
    handleNotification(@MessageBody() data: { userId: number; message: string }) {
      this.sendNotification(data.userId, data.message);
    }
  }
  