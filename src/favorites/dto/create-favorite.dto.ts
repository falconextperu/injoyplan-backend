import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateFavoriteDto {
  @ApiProperty({ description: 'ID del evento' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ description: 'ID de la fecha del evento', required: false })
  @IsString()
  @IsOptional()
  eventDateId?: string;
}
