import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) { }

  @Post()
  @ApiOperation({ summary: 'Agregar evento a favoritos' })
  addFavorite(
    @GetUser('id') userId: string,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ) {
    return this.favoritesService.addFavorite(userId, createFavoriteDto.eventId, createFavoriteDto.eventDateId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar mis favoritos' })
  getFavorites(
    @GetUser('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.favoritesService.getFavorites(userId, page, limit);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar favorito por ID' })
  removeFavorite(@GetUser('id') userId: string, @Param('id') favoriteId: string) {
    return this.favoritesService.removeFavorite(userId, favoriteId);
  }

  @Delete('event/:eventId')
  @ApiOperation({ summary: 'Eliminar favorito por ID de evento' })
  removeFavoriteByEvent(
    @GetUser('id') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.favoritesService.removeFavoriteByEvent(userId, eventId);
  }
}
