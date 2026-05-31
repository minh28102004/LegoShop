import { Module } from '@nestjs/common';
import { AccessoryCategoriesController } from './accessory-categories.controller';
import { AccessoryCategoriesService } from './accessory-categories.service';

@Module({
  controllers: [AccessoryCategoriesController],
  providers: [AccessoryCategoriesService],
})
export class AccessoryCategoriesModule {}
