import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminDashboardService } from './admin-dashboard.service';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin-dashboard')
export class AdminDashboardController {
	constructor(private readonly adminDashboardService: AdminDashboardService) {}

	@Get('stats')
	getStats() {
		return this.adminDashboardService.getStats();
	}
}
