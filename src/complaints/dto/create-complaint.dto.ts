import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateComplaintDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  consumerName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  consumerDocType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  consumerDocNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  consumerAddress: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  consumerDepartment: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  consumerProvince: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  consumerDistrict: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  consumerPhone: string;

  @ApiProperty()
  // @IsEmail() // Email validation might fail on empty string, let's keep it if not empty or use ValidateIf
  @ValidateIf((o) => o.consumerEmail && o.consumerEmail.length > 0)
  @IsEmail()
  @IsOptional()
  consumerEmail: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isMinor?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  repName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  repDocType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  repDocNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  repAddress?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  repDepartment?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  repProvince?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  repDistrict?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  repPhone?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.repEmail && o.repEmail.length > 0)
  @IsEmail()
  @IsOptional()
  repEmail?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  goodType: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  claimAmount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  goodDescription: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  claimType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  claimDetail: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderRequest: string;
}
