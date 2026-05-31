import { Module } from '@nestjs/common';
import { TemplateCategoriesController } from './template-categories.controller';
import { TemplateCategoriesService } from './template-categories.service';

@Module({
  controllers: [TemplateCategoriesController],
  providers: [TemplateCategoriesService],
})
export class TemplateCategoriesModule {}
