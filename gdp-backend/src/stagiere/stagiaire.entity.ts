import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Stagiaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;


  @Column()
  specialite: string;

  @Column()
  dureeStage: number;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;

  @Column({ nullable: true }) 
  photo?: string;

  @ManyToOne(() => User, (user) => user.stagiaires, { nullable: false, eager: true })
  encadrant: User;
}
