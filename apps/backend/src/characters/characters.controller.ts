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
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

@ApiTags('Characters')
@Controller()
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get('public/characters')
  findPublicCharacters() {
    return this.charactersService.findPublicCharacters();
  }

  @Get('public/characters/:id')
  findPublicCharacterById(@Param('id') id: string) {
    return this.charactersService.findPublicCharacterById(id);
  }

  @Get('admin/characters')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminCharacters(@Query() query: AdminListQueryDto) {
    return this.charactersService.findAdminCharacters(query);
  }

  @Get('admin/characters/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminCharacterById(@Param('id') id: string) {
    return this.charactersService.findAdminCharacterById(id);
  }

  @Post('admin/characters')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createCharacter(@Body() createCharacterDto: CreateCharacterDto) {
    return this.charactersService.createCharacter(createCharacterDto);
  }

  @Patch('admin/characters/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateCharacter(
    @Param('id') id: string,
    @Body() updateCharacterDto: UpdateCharacterDto,
  ) {
    return this.charactersService.updateCharacter(id, updateCharacterDto);
  }

  @Delete('admin/characters/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteCharacter(@Param('id') id: string) {
    return this.charactersService.deleteCharacter(id);
  }
}
