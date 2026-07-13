import { Module } from '@nestjs/common';
import { FrameBackgroundsController } from './frame-backgrounds.controller';
import { FrameBackgroundsService } from './frame-backgrounds.service';

@Module({
  controllers: [FrameBackgroundsController],
  providers: [FrameBackgroundsService],
})
export class FrameBackgroundsModule {}
