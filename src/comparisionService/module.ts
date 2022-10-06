import { Module } from '@nestjs/common';
import { BiometricService } from './services/biometricService';
import { PersonController } from './controller/controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PersonController],
  providers: [BiometricService, PrismaService],
})
export class PersonModule {}
