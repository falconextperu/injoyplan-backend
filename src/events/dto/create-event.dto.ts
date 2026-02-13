import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateEventDateDto {
  @ApiProperty({ description: 'Fecha (ISO, puede ser YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({ required: false, description: 'Hora inicio (HH:mm)' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({ required: false, description: 'Hora fin (HH:mm)' })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({ required: false, description: 'Precio (number)' })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ required: false, description: 'Capacidad (number)' })
  @IsNumber()
  @IsOptional()
  capacity?: number;
}

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @ApiProperty({ required: false, description: 'Link para comprar entradas / fuente del evento' })
  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @ApiProperty({ required: false, description: 'Array of ticket URLs [{name: string, url: string}]' })
  @IsArray()
  @IsOptional()
  ticketUrls?: { name: string; url: string }[];

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isBanner?: boolean;

  @ApiProperty({ description: 'Fechas del evento', type: [CreateEventDateDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventDateDto)
  dates: CreateEventDateDto[];

  // Location
  @ApiProperty({ required: false, description: 'Nombre del lugar (opcional)' })
  @IsString()
  @IsOptional()
  locationName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
