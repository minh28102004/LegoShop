import { Module } from '@nestjs/common';
import { FrameSizesService } from './frame-sizes.service';
import { FrameSizesController } from './frame-sizes.controller';

@Module({
  controllers: [FrameSizesController],
  providers: [FrameSizesService],
})
export class FrameSizesModule {}
