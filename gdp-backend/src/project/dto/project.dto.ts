import { IsNotEmpty, IsString, IsEnum, IsOptional, IsArray, IsDate, ValidateNested } from 'class-validator';
import { Priorite, Status, Etat } from '../project.entity';
import { Type } from 'class-transformer';
import { LivrableDto } from 'src/livrable/dto/livrable.dto';
import { ChecklistDto } from 'src/checklist/dto/checklist.dto'; // Importer le DTO Checklist

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsEnum(Priorite)
  @IsOptional()
  priorite?: Priorite;

  @IsEnum(Etat)
  @IsOptional()
  etat?: Etat;

  @IsString()
  @IsOptional()
  linkprojet?: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDate()
  estimatedEndDate: Date;

  @IsArray()
  @IsOptional()
  userIds?: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LivrableDto)
  @IsOptional()
  livrables?: LivrableDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistDto)
  @IsOptional()
  checklists?: ChecklistDto[]; // Ajouter le champ pour les checklists
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsEnum(Priorite)
  @IsOptional()
  priorite?: Priorite;

  @IsEnum(Etat)
  @IsOptional()
  etat?: Etat;

  @IsString()
  @IsOptional()
  linkprojet?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsOptional()
  estimatedEndDate?: Date;

  @IsArray()
  @IsOptional()
  userIds?: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LivrableDto)
  @IsOptional()
  livrables?: LivrableDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistDto)
  @IsOptional()
  checklists?: ChecklistDto[]; // Ajouter le champ pour les checklists
}
