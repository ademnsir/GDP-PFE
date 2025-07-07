import { IsNotEmpty, IsString, IsOptional, IsInt, IsEnum } from 'class-validator';

export enum LienType {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
}

export class ChecklistDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsString()
  @IsOptional()
  spec?: string;

  @IsString()
  @IsOptional()
  frs?: string;

  @IsString()
  @IsOptional()
  lienGit?: string;

  @IsEnum(LienType)
  @IsOptional()
  lienType?: LienType;



  @IsInt()
  @IsNotEmpty()
  projectId: number; // projectId is still required
}
