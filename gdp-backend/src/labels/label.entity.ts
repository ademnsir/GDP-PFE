import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Tache } from '../tache/tache.entity';

@Entity()
export class Label {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  color: string;

  @ManyToMany(() => Tache, tache => tache.labels)
  taches: Tache[];
} 