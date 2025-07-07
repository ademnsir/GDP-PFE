import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsEmail,
  IsArray,
  IsOptional,
  IsDate,
  Matches,
} from 'class-validator';
import { UserRole, UserStatus } from '../user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^WB\d{6}$/, { message: 'Matricule must start with "WB" followed by 6 digits' })
  matricule: string; // Ajout du champ matricule avec validation

  @IsOptional()
  @IsString()
  photo?: string;

  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'Role must be ADMIN, DEVELOPPER, or INFRA' })
  role: UserRole;

  @IsNotEmpty()
  @IsEnum(UserStatus, { message: 'Status must be ACTIF, EN_ATTENTE, or SUSPENDU' })
  status: UserStatus;

  @IsNotEmpty()
  @IsDate()
  hireDate: Date;

  @IsNotEmpty()
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsArray()
  projects?: number[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^WB\d{6}$/, { message: 'Matricule must start with "WB" followed by 6 digits' })
  matricule?: string; // Ajout du champ matricule avec validation

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be ADMIN, DEVELOPPER, or INFRA' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be ACTIF, EN_ATTENTE, or SUSPENDU' })
  status?: UserStatus;

  @IsOptional()
  @IsDate()
  hireDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsArray()
  projects?: number[];
}
