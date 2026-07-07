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
import { CharacterPartsService } from './character-parts.service';
import { CharacterPartsQueryDto } from './dto/character-parts-query.dto';
import { CreateCharacterPartDto } from './dto/create-character-part.dto';
import { UpdateCharacterPartDto } from './dto/update-character-part.dto';

@ApiTags('Character Parts')
@Controller()
export class CharacterPartsController {
  constructor(private readonly characterPartsService: CharacterPartsService) {}

  @Get('public/character-parts')
  findPublicCharacterParts(@Query() query: CharacterPartsQueryDto) {
    return this.characterPartsService.findPublicCharacterParts(query);
  }

  @Get('admin/character-parts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminCharacterParts(@Query() query: CharacterPartsQueryDto) {
    return this.characterPartsService.findAdminCharacterParts(query);
  }

  @Get('admin/character-parts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminCharacterPartById(@Param('id') id: string) {
    return this.characterPartsService.findAdminCharacterPartById(id);
  }

  @Post('admin/character-parts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createCharacterPart(@Body() createCharacterPartDto: CreateCharacterPartDto) {
    return this.characterPartsService.createCharacterPart(createCharacterPartDto);
  }

  @Patch('admin/character-parts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateCharacterPart(
    @Param('id') id: string,
    @Body() updateCharacterPartDto: UpdateCharacterPartDto,
  ) {
    return this.characterPartsService.updateCharacterPart(id, updateCharacterPartDto);
  }

  @Delete('admin/character-parts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteCharacterPart(@Param('id') id: string) {
    return this.characterPartsService.deleteCharacterPart(id);
  }
}
