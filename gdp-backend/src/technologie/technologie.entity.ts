import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Livrable } from '../livrable/livrable.entity';

@Entity()
export class Technologie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  version: string;

  @Column()
  language: string;

  @ManyToMany(() => Livrable, (livrable) => livrable.technologies)
  livrables: Livrable[];
}
