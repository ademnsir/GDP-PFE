import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum CongeType {
  MALADIE = 'Maladie',
  CONGE = 'Congé',
  DECES = 'Décès',
  MARIAGE = 'Congé Mariage',
  AUTRES = 'Autres',
}

export enum CongeStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity()
export class Conge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  matricule: string;

  @Column()
  service: string;

  @Column()
  responsable: string;

  @Column({
    type: 'enum',
    enum: CongeType,
  })
  type: CongeType;

  @Column('date')
  startDate: string;

  @Column('date')
  endDate: string;

  @Column('date')
  dateReprise: string;

  @Column()
  telephone: string;

  @Column()
  adresse: string;

  @Column({ nullable: true })
  interim1?: string;

  @Column({ nullable: true })
  interim2?: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: CongeStatus,
    default: CongeStatus.PENDING,
  })
  status: CongeStatus;

  @ManyToOne(() => User, (user) => user.conges, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
