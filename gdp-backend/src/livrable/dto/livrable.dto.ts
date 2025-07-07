import { IsNotEmpty, IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { LivrableType } from '../livrable.entity';
import { Technologie } from '../../technologie/technologie.entity';

export class LivrableDto {
  @IsOptional()
  id?: number;  // ✅ Correction ici (on enlève `FindOperator<number>`)

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(LivrableType)
  @IsOptional()
  type?: LivrableType;

  @IsOptional()
  projectId?: number;

  // ✅ Correction de la liste des technologies (on attend une liste d'objets, pas d'IDs)
  @IsArray()
  @IsOptional()
  technologies?: Technologie[];
}

export class CreateLivrableDto extends LivrableDto {
  @IsNotEmpty()
  projectId: number;
}

export class UpdateLivrableDto extends LivrableDto {}
