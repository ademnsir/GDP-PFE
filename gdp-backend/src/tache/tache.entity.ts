import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Project } from '../project/project.entity';
import { User } from '../users/user.entity';
import { Label } from '../labels/label.entity';

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

@Entity()
export class Tache {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' })
  status: string;

  @Column({ type: 'enum', enum: Priority, default: Priority.LOW })
  priority: Priority;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ nullable: true })
  customType: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  creationDate: Date | null;

  @ManyToOne(() => Project, (project) => project.taches, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(() => User, user => user.taches)
  user: User;

  @Column({ nullable: true })
  userId: number;

  @ManyToMany(() => Label)
  @JoinTable()
  labels: Label[];

  // This property is only used for update operations, not stored in the database
  labelIds?: number[];
}


