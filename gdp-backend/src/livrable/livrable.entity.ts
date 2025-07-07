import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Project } from '../project/project.entity';
import { Technologie } from '../technologie/technologie.entity';

export enum LivrableType {
  BACKEND = 'backend',
  FRONTEND = 'frontend',
  RAPPORT = 'rapport',
  SCRIPT = 'script',
}

@Entity()
export class Livrable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: LivrableType })
  type: LivrableType;

  @ManyToOne(() => Project, (project) => project.livrables, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToMany(() => Technologie, (technologie) => technologie.livrables, { cascade: true })
  @JoinTable()
  technologies: Technologie[];
}
