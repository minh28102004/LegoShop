import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FrameOptionsController } from './frame-options.controller';
import { FrameOptionsService } from './frame-options.service';

@Module({
  imports: [PrismaModule],
  controllers: [FrameOptionsController],
  providers: [FrameOptionsService],
})
export class FrameOptionsModule {}
