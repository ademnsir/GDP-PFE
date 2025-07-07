import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TachePeriodique } from './tache-periodique.entity';
import { TachePeriodiqueController } from './tache-periodique.controller';
import { TachePeriodiqueService } from './tache-periodique.service';
import { User } from '../users/user.entity';
import { UserModule } from '../users/user.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([TachePeriodique, User]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [TachePeriodiqueController],
  providers: [TachePeriodiqueService],
  exports: [TachePeriodiqueService],
})
export class TachePeriodiqueModule {}
