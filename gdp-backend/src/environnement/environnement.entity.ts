import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../project/project.entity';

export enum EnvType {
  DEV = 'DEV',
  PREPROD = 'PREPROD',
  PROD = 'PROD',
  TEST = 'TEST',
  AUTRE = 'AUTRE',
}

export enum ProtType {
  SSH = 'SSH',
  TELNET = 'TELNET',
  RDP = 'RDP',
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
  FTP = 'FTP',
  SMTP = 'SMTP',
  TEST = 'TEST',
  AUTRE = 'AUTRE',
}

export enum ComponentType {
  BDD = 'BDD',
  BACKEND = 'BACKEND',
  FRONTEND = 'FRONTEND',
  AUTRE = 'AUTRE',
}

@Entity()
export class Environnement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nomServeur: string;

  @Column()
  systemeExploitation: string;

  @Column()
  ipServeur: string;

  @Column()
  port: number;

  @Column({ type: 'enum', enum: EnvType })
  type: EnvType;

  @Column({ type: 'enum', enum: ProtType })
  Ptype: ProtType;

  @Column({ type: 'enum', enum: ComponentType })
  componentType: ComponentType;

  @Column()
  cpu: string;

  @Column()
  ram: string;

  @Column()
  stockage: string;

  @Column('simple-array')
  logicielsInstalled: string[];

  @Column()
  nomUtilisateur: string;  // Added username field

  @Column()
  motDePasse: string;  // Added password field

  @ManyToOne(() => Project, (project) => project.environnements)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: number;
}
