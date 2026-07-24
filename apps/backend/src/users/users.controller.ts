import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import {
  type LoginUserInput,
  type RegisterUserInput,
  UsersService,
} from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type AuthenticatedUserRequest = Request & {
  user: {
    id: string;
  };
};

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() dto: RegisterUserInput) {
    return this.usersService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginUserInput) {
    return this.usersService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@Req() req: AuthenticatedUserRequest) {
    return this.usersService.getProfile(req.user.id);
  }
}
