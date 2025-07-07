import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, OneToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Tache } from '../tache/tache.entity';
import { Livrable } from '../livrable/livrable.entity';
import { Checklist } from '../checklist/checklist.entity';
import { Environnement } from '../environnement/environnement.entity'; // Importer l'entité Checklist

export enum Priorite {
  LOW = 'Faible',
  MEDIUM = 'Moyenne',
  HIGH = 'Haute',
}

export enum Status {
  TO_DO = 'A faire',
  IN_PROGRESS = 'En cours',
  COMPLETED = 'Fini',
}

export enum Etat {
  EXISTING_PROJECT = 'Projet existant',
  FROM_SCRATCH = 'Projet à partir de zéro',
}

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: Status, default: Status.IN_PROGRESS })
  status: Status;

  @Column({ type: 'enum', enum: Priorite, default: Priorite.MEDIUM })
  priorite: Priorite;

  @Column({ type: 'enum', enum: Etat, default: Etat.EXISTING_PROJECT })
  etat: Etat;

  @Column({ nullable: true })
  linkprojet?: string;

  @Column()
  description: string;

  @Column({ type: 'date', nullable: true })
  estimatedEndDate?: Date;

  @ManyToMany(() => User, (user) => user.projects)
  users: User[];

  @OneToMany(() => Tache, (tache) => tache.project, { cascade: true })
  taches: Tache[];

  @OneToMany(() => Livrable, (livrable) => livrable.project, { cascade: true })
  livrables: Livrable[];

  @OneToMany(() => Environnement, (environnement) => environnement.project)
  environnements: Environnement[];
  
  @OneToMany(() => Checklist, (checklist) => checklist.project, { cascade: true })
  checklists: Checklist[]; // Ajouter la relation avec Checklist
}
