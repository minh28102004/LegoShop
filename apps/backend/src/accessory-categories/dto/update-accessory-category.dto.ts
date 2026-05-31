import { PartialType } from '@nestjs/swagger';
import { CreateAccessoryCategoryDto } from './create-accessory-category.dto';

export class UpdateAccessoryCategoryDto extends PartialType(
  CreateAccessoryCategoryDto,
) {}
