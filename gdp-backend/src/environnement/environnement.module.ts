import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironnementController } from './environnement.controller';
import { EnvironnementService } from './environnement.service';
import { Environnement } from './environnement.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Environnement]),
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [EnvironnementController],
  providers: [EnvironnementService],
  exports: [TypeOrmModule],
})
export class EnvironnementModule {}
