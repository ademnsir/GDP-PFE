import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Project } from '../project/project.entity';
import { Conge } from '../conge/conge.entity';
import { Notification } from '../notifications/notification.entity';
import { Stagiaire } from '../stagiere/stagiaire.entity';
import { Tache } from '../tache/tache.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  DEVELOPPER = 'DEVELOPPER',
  INFRA = 'INFRA',
}

export enum UserStatus {
  ACTIF = 'ACTIF',
  EN_ATTENTE = 'EN_ATTENTE',
  SUSPENDU = 'SUSPENDU',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  matricule: string;

  @Column({ nullable: true })
  photo: string | null;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.EN_ATTENTE })
  status: UserStatus;

  @Column({ type: 'date', nullable: true })
  hireDate: Date | null;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @ManyToMany(() => Project, (project) => project.users, { cascade: true })
  @JoinTable()
  projects: Project[];

  @OneToMany(() => Conge, (conge) => conge.user, { cascade: true, onDelete: 'CASCADE' })
  conges: Conge[];

  @OneToMany(() => Stagiaire, (stagiaire) => stagiaire.encadrant, { cascade: true, onDelete: 'CASCADE' })
  stagiaires: Stagiaire[];

  @OneToMany(() => Notification, (notification) => notification.user, { cascade: true, onDelete: 'CASCADE' })
  notifications: Notification[];
  
  @OneToMany(() => Tache, (tache) => tache.user, { cascade: true, onDelete: 'CASCADE' })
  taches: Tache[];

  @Column({ nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;
}
