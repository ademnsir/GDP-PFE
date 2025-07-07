import { Controller, Get, Post, Put, Param, Body, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Request } from 'express';
import { UserRole } from '../users/user.entity';
import { AuthGuard } from '@nestjs/passport';

// Interface personnalisée pour étendre Request
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: UserRole;
  };
}

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('/create')
  async createNotification(@Body() data: { userId: number; message: string }) {
    return this.notificationService.createNotification(data.userId, data.message);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/admin')
  async getAdminNotifications(@Req() request: AuthenticatedRequest) {

    
    if (!request.user || request.user.role !== UserRole.ADMIN) {
      console.error("❌ Accès refusé : L'utilisateur n'est pas admin !");
      throw new Error('Accès refusé');
    }

    return this.notificationService.getAdminNotifications();
  }

  @Put('/read/:id')
  async markAsRead(@Param('id') notificationId: number) {
    return this.notificationService.markAsRead(notificationId);
  }
}
