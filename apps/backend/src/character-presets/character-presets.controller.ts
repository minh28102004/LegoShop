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
import { CharacterPresetsService } from './character-presets.service';
import { CharacterPresetsQueryDto } from './dto/character-presets-query.dto';
import { CreateCharacterPresetDto } from './dto/create-character-preset.dto';
import { UpdateCharacterPresetDto } from './dto/update-character-preset.dto';

@ApiTags('Character Presets')
@Controller()
export class CharacterPresetsController {
  constructor(private readonly characterPresetsService: CharacterPresetsService) {}

  @Get('public/character-presets')
  findPublicCharacterPresets(@Query() query: CharacterPresetsQueryDto) {
    return this.characterPresetsService.findPublicCharacterPresets(query);
  }

  @Get('admin/character-presets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminCharacterPresets(@Query() query: CharacterPresetsQueryDto) {
    return this.characterPresetsService.findAdminCharacterPresets(query);
  }

  @Get('admin/character-presets/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminCharacterPresetById(@Param('id') id: string) {
    return this.characterPresetsService.findAdminCharacterPresetById(id);
  }

  @Post('admin/character-presets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createCharacterPreset(@Body() dto: CreateCharacterPresetDto) {
    return this.characterPresetsService.createCharacterPreset(dto);
  }

  @Patch('admin/character-presets/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateCharacterPreset(
    @Param('id') id: string,
    @Body() dto: UpdateCharacterPresetDto,
  ) {
    return this.characterPresetsService.updateCharacterPreset(id, dto);
  }

  @Delete('admin/character-presets/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteCharacterPreset(@Param('id') id: string) {
    return this.characterPresetsService.deleteCharacterPreset(id);
  }
}
