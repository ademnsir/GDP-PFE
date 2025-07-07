import { 
  IsNotEmpty, 
  IsString, 
  IsInt, 
  IsEnum, 
  IsIP, 
  IsOptional, 
  IsArray,
  Min,
  Max,
  Matches,
  Length,
  ValidateIf,
  IsIn
} from 'class-validator';
import { EnvType, ProtType, ComponentType } from '../environnement.entity';

export class EnvironnementDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsString()
  @IsNotEmpty({ message: 'Le nom du serveur est requis' })
  @Length(3, 50, { message: 'Le nom du serveur doit contenir entre 3 et 50 caractères' })
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: 'Le nom du serveur ne peut contenir que des lettres, chiffres, tirets et underscores' })
  nomServeur: string;

  @IsString()
  @IsNotEmpty({ message: 'Le système d\'exploitation est requis' })
  @Length(3, 50, { message: 'Le système d\'exploitation doit contenir entre 3 et 50 caractères' })
  systemeExploitation: string;

  @IsIP('4', { message: 'L\'adresse IP doit être une adresse IPv4 valide' })
  @IsNotEmpty({ message: 'L\'adresse IP est requise' })
  ipServeur: string;

  @IsInt()
  @Min(1, { message: 'Le port doit être supérieur à 0' })
  @Max(65535, { message: 'Le port doit être inférieur à 65536' })
  @IsNotEmpty({ message: 'Le port est requis' })
  port: number;

  @IsEnum(EnvType, { message: 'Le type d\'environnement n\'est pas valide' })
  @IsNotEmpty({ message: 'Le type d\'environnement est requis' })
  type: EnvType;

  @IsEnum(ProtType, { message: 'Le type de protocole n\'est pas valide' })
  @IsNotEmpty({ message: 'Le type de protocole est requis' })
  Ptype: ProtType;

  @IsEnum(ComponentType, { message: 'Le type de composant n\'est pas valide' })
  @IsNotEmpty({ message: 'Le type de composant est requis' })
  componentType: ComponentType;

  @IsString()
  @IsNotEmpty({ message: 'La configuration CPU est requise' })
  @Matches(/^[0-9]+(\.[0-9]+)?\s*(GHz|MHz|cores?)$/i, { 
    message: 'La configuration CPU doit être au format: "2.4 GHz" ou "4 cores"' 
  })
  cpu: string;

  @IsString()
  @IsNotEmpty({ message: 'La configuration RAM est requise' })
  @Matches(/^[0-9]+(\.[0-9]+)?\s*(GB|MB)$/i, { 
    message: 'La configuration RAM doit être au format: "8 GB" ou "16 GB"' 
  })
  ram: string;

  @IsString()
  @IsNotEmpty({ message: 'La configuration de stockage est requise' })
  @Matches(/^[0-9]+(\.[0-9]+)?\s*(GB|TB)$/i, { 
    message: 'La configuration de stockage doit être au format: "500 GB" ou "1 TB"' 
  })
  stockage: string;

  @IsArray()
  @IsString({ each: true, message: 'Chaque logiciel doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Au moins un logiciel doit être spécifié' })
  @Length(1, 20, { message: 'La liste des logiciels doit contenir entre 1 et 20 éléments' })
  logicielsInstalled: string[];

  @IsString()
  @IsNotEmpty({ message: 'Le nom d\'utilisateur est requis' })
  @Length(3, 50, { message: 'Le nom d\'utilisateur doit contenir entre 3 et 50 caractères' })
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores' })
  nomUtilisateur: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @Length(8, 50, { message: 'Le mot de passe doit contenir entre 8 et 50 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
  })
  motDePasse: string;

  @IsInt()
  @IsNotEmpty({ message: 'L\'ID du projet est requis' })
  projectId: number;
}
