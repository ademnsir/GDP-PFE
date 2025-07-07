import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class TechnologieDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  language?: string;
}

export class CreateTechnologieDto extends TechnologieDto {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  version: string;

  @IsNotEmpty()
  @IsString()
  language: string;
}

export class UpdateTechnologieDto extends TechnologieDto {}
