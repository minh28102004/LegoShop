import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplatesService } from './templates.service';

@ApiTags('Templates')
@Controller()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get('public/templates')
  findPublicTemplates() {
    return this.templatesService.findPublicTemplates();
  }

  @Get('public/templates/:id')
  findPublicTemplateById(@Param('id') id: string) {
    return this.templatesService.findPublicTemplateById(id);
  }

  @Get('admin/templates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminTemplates() {
    return this.templatesService.findAdminTemplates();
  }

  @Get('admin/templates/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminTemplateById(@Param('id') id: string) {
    return this.templatesService.findAdminTemplateById(id);
  }

  @Post('admin/templates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templatesService.createTemplate(createTemplateDto);
  }

  @Patch('admin/templates/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.updateTemplate(id, updateTemplateDto);
  }

  @Delete('admin/templates/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteTemplate(@Param('id') id: string) {
    return this.templatesService.deleteTemplate(id);
  }
}
