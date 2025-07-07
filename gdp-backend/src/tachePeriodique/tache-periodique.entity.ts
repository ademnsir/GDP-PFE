import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
  import { User } from '../users/user.entity';
  
  export enum Periodicite {
    QUOTIDIEN = 'QUOTIDIEN',
    MENSUEL = 'MENSUEL',
    ANNUEL = 'ANNUEL'
  }
  
  @Entity()
  export class TachePeriodique {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    title: string;
  
    @Column()
    description: string;
  
    @Column({ type: 'timestamp' })
    sendDate: Date; // La date et l'heure où l'email sera envoyé
  
    @Column({
      type: 'enum',
      enum: Periodicite,
      default: Periodicite.QUOTIDIEN
    })
    periodicite: Periodicite;
  
    @Column({ type: 'time', nullable: true })
    heureExecution: string;
  
    @Column({ default: true })
    estActive: boolean;
  
    @ManyToMany(() => User)
    @JoinTable()
    users: User[];
  }
  