import { Module } from '@nestjs/common';
import { UserDesignsService } from './user-designs.service';
import { UserDesignsController } from './user-designs.controller';

@Module({
  providers: [UserDesignsService],
  controllers: [UserDesignsController]
})
export class UserDesignsModule {}
