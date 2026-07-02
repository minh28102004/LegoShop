import type { AdminLoginResponseContract } from '@lego-shop/shared';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangeAdminPasswordDto } from './dto/change-admin-password.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AdminLoginResponseContract> {
    const email = dto.email.trim().toLowerCase();

    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await compare(dto.password, admin.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  async updateProfile(adminId: string, dto: UpdateAdminProfileDto) {
    const name = dto.name?.trim() || null;

    const admin = await this.prisma.admin.update({
      where: { id: adminId },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return admin;
  }

  async changePassword(adminId: string, dto: ChangeAdminPasswordDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin account not found');
    }

    const isCurrentPasswordValid = await compare(
      dto.currentPassword,
      admin.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const isSamePassword = await compare(dto.newPassword, admin.passwordHash);

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const passwordHash = await hash(dto.newPassword, 10);

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { passwordHash },
    });

    return {
      success: true,
      message: 'Password changed successfully. Please sign in again.',
    };
  }
}
