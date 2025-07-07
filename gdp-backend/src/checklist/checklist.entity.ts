import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../project/project.entity';

@Entity()
export class Checklist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  spec?: string;

  @Column({ nullable: true })
  frs?: string;

  @Column({ nullable: true })
  lienGitFrontend?: string;

  @Column({ nullable: true })
  lienGitBackend?: string;



  @ManyToOne(() => Project, (project) => project.checklists)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: number; // Ensure this field exists
}
