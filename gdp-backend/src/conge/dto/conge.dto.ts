import { IsNotEmpty, IsDateString, IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { CongeStatus, CongeType } from '../conge.entity';
import { Type } from 'class-transformer';

export class CreateCongeDto {
    @IsOptional()
    @IsNumber()
    id?: number;

    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsNotEmpty()
    @IsString()
    matricule: string;

    @IsNotEmpty()
    @IsString()
    service: string;

    @IsNotEmpty()
    @IsString()
    responsable: string;

    @IsNotEmpty()
    @IsEnum(CongeType)
    type: CongeType;

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsNotEmpty()
    @IsDateString()
    endDate: string;

    @IsNotEmpty()
    @IsDateString()
    dateReprise: string;

    @IsNotEmpty()
    @IsString()
    telephone: string;

    @IsNotEmpty()
    @IsString()
    adresse: string;

    @IsOptional()
    @IsString()
    interim1?: string;

    @IsOptional()
    @IsString()
    interim2?: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;
}

export class UpdateCongeDto {
    @IsEnum(CongeStatus)
    status: CongeStatus;
}
