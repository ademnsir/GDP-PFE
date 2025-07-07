import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsDate, IsString } from 'class-validator';

export class CreateStagiaireDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  specialite: string;

  @IsInt()
  dureeStage: number;

  @IsDate()
  dateDebut: Date;

  @IsDate()
  dateFin: Date;

  @IsInt()
  encadrantId: number;

  @IsOptional()
  @IsString()
  photo?: string; // Ajout du champ photo
}

export class UpdateStagiaireDto {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  specialite?: string;

  @IsOptional()
  @IsInt()
  dureeStage?: number;

  @IsOptional()
  @IsDate()
  dateDebut?: Date;

  @IsOptional()
  @IsDate()
  dateFin?: Date;

  @IsOptional()
  @IsInt()
  encadrantId?: number;

  @IsOptional()
  @IsString()
  photo?: string; // Ajout du champ photo
}
