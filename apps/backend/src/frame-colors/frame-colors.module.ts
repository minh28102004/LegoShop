import { Module } from '@nestjs/common';
import { FrameColorsService } from './frame-colors.service';
import { FrameColorsController } from './frame-colors.controller';

@Module({
  controllers: [FrameColorsController],
  providers: [FrameColorsService],
})
export class FrameColorsModule {}
