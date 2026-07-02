import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminListQueryDto } from '../common/dto/admin-list-query.dto';
import { ApplyVoucherDto } from './dto/apply-voucher.dto';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { VouchersService } from './vouchers.service';

@ApiTags('Vouchers')
@Controller()
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post('public/vouchers/apply')
  applyVoucher(@Body() dto: ApplyVoucherDto) {
    return this.vouchersService.applyVoucher(dto);
  }

  @Get('admin/vouchers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminVouchers(@Query() query: AdminListQueryDto) {
    return this.vouchersService.findAdminVouchers(query);
  }

  @Get('admin/vouchers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminVoucherById(@Param('id') id: string) {
    return this.vouchersService.findAdminVoucherById(id);
  }

  @Post('admin/vouchers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createVoucher(@Body() dto: CreateVoucherDto) {
    return this.vouchersService.createVoucher(dto);
  }

  @Patch('admin/vouchers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateVoucher(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.vouchersService.updateVoucher(id, dto);
  }

  @Delete('admin/vouchers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteVoucher(@Param('id') id: string) {
    return this.vouchersService.deleteVoucher(id);
  }
}
