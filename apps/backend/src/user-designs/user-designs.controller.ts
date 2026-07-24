import type { CreateUserDesignRequestContract } from '@lego-shop/shared';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { UserDesignsService } from './user-designs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type AuthenticatedUserRequest = Request & {
  user: {
    id: string;
  };
};

type UpdateUserDesignRequest = Partial<CreateUserDesignRequestContract>;

@ApiTags('User Designs')
@Controller('user-designs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserDesignsController {
  constructor(private readonly userDesignsService: UserDesignsService) {}

  @Post()
  create(
    @Req() req: AuthenticatedUserRequest,
    @Body() data: CreateUserDesignRequestContract,
  ) {
    return this.userDesignsService.create(req.user.id, data);
  }

  @Get()
  findAll(@Req() req: AuthenticatedUserRequest) {
    return this.userDesignsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedUserRequest, @Param('id') id: string) {
    return this.userDesignsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedUserRequest,
    @Param('id') id: string,
    @Body() data: UpdateUserDesignRequest,
  ) {
    return this.userDesignsService.update(req.user.id, id, data);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedUserRequest, @Param('id') id: string) {
    return this.userDesignsService.remove(req.user.id, id);
  }
}
