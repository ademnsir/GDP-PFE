import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  ValidateIf,
  IsInt,
  IsNumber,
  IsArray,
} from 'class-validator';

// Définir l'enum Priority dans le même fichier
export enum Priority {
  LOW = 'low',
  HIGH = 'high',
}

// Définir l'enum TicketType dans le même fichier
export enum TicketType {
  BUG = 'Bug',
  FIX = 'Fix',
  FEATURE = 'Feature',
  IMPROVEMENT = 'Improvement',
  TASK = 'Task',
  REFACTOR = 'Refactor',
  DOCS = 'Docs',
  TEST = 'Test',
  RESEARCH = 'Research',
  SECURITY = 'Security',
  PERFORMANCE = 'Performance',
  CUSTOM = 'Custom',
}

export class CreateTacheDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsEnum(['To Do', 'In Progress', 'Done'])
  @IsOptional()
  status?: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsString() // Permettre à type d'être une chaîne personnalisée
  @IsOptional()
  type?: string; // Type de ticket (peut être une valeur de l'enum ou une chaîne personnalisée)

  @ValidateIf((o) => o.type === TicketType.CUSTOM) // customType est requis si type est "Custom"
  @IsString()
  @IsOptional()
  customType?: string; // Type personnalisé (utilisé uniquement si type === TicketType.CUSTOM)

  @IsNotEmpty()
  @IsInt()
  projectId: number;

  @IsNotEmpty()
  @IsInt()
  userId: number; // Ajout du champ userId

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  labelIds?: number[];
}
