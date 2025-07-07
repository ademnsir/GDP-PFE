import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationGateway } from './notification.gateway';
import { User } from '../users/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly notificationGateway: NotificationGateway
  ) {}

  async createNotification(userId: number, message: string) {
    console.log(`📩 Création d'une notification pour l'admin ${userId}`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
        console.error(`❌ Utilisateur avec ID ${userId} introuvable`);
        throw new Error(`Utilisateur avec ID ${userId} introuvable`);
    }

    const notification = this.notificationRepository.create({
        user,
        message,
    });

    await this.notificationRepository.save(notification);

    // 🚀 Vérifier si la notification est envoyée via WebSocket
    console.log(`🔔 Envoi WebSocket: ${message}`);
    this.notificationGateway.sendNotification(userId, message);

    return notification;
}


  async getAdminNotifications() {
   
    return this.notificationRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async markAsRead(notificationId: number) {
    console.log(`✅ Notification ID ${notificationId} marquée comme lue`);
    await this.notificationRepository.update(notificationId, { isRead: true });
    return { message: 'Notification marquée comme lue' };
  }
}
