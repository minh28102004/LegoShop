import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserDesignsService } from './user-designs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('User Designs')
@Controller('user-designs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserDesignsController {
  constructor(private readonly userDesignsService: UserDesignsService) {}

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.userDesignsService.create(req.user.id, data);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.userDesignsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.userDesignsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.userDesignsService.update(req.user.id, id, data);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.userDesignsService.remove(req.user.id, id);
  }
}
