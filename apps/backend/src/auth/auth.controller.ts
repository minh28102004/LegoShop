import type { AdminProfileContract } from '@lego-shop/shared';
import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import { ChangeAdminPasswordDto } from './dto/change-admin-password.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@CurrentAdmin() admin: AdminProfileContract) {
    return admin;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateProfile(
    @CurrentAdmin() admin: AdminProfileContract,
    @Body() dto: UpdateAdminProfileDto,
  ) {
    return this.authService.updateProfile(admin.id, dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  changePassword(
    @CurrentAdmin() admin: AdminProfileContract,
    @Body() dto: ChangeAdminPasswordDto,
  ) {
    return this.authService.changePassword(admin.id, dto);
  }
}
