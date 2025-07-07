import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conge } from './conge.entity';
import { CongeService } from './conge.service';
import { CongeController } from './conge.controller';
import { User } from '../users/user.entity';
import { UserModule } from '../users/user.module';
import { AuthModule } from '../auth/auth.module'; 
import { JwtModule } from '@nestjs/jwt'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Conge, User]), 
    forwardRef(() => UserModule), 
    forwardRef(() => AuthModule), 
    JwtModule.register({
      secret: process.env.JWT_SECRET, 
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [CongeService],
  controllers: [CongeController],
  exports: [CongeService], 
})
export class CongeModule {}
