import { IsNotEmpty, IsString, IsDateString, IsArray, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Periodicite } from '../tache-periodique.entity';

export class CreateTachePeriodiqueDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  sendDate: string; // La date et l'heure au format ISO

  @IsEnum(Periodicite)
  @IsNotEmpty()
  periodicite: Periodicite;

  @IsString()
  @IsNotEmpty()
  heureExecution: string;

  @IsBoolean()
  @IsOptional()
  estActive?: boolean;

  @IsArray()
  @IsNotEmpty()
  users: number[]; // Liste des IDs des utilisateurs
}

export class UpdateTachePeriodiqueDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  sendDate?: string;

  @IsEnum(Periodicite)
  @IsOptional()
  periodicite?: Periodicite;

  @IsString()
  @IsOptional()
  heureExecution?: string;

  @IsBoolean()
  @IsOptional()
  estActive?: boolean;

  @IsArray()
  @IsOptional()
  users?: number[];
}
