import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ChatSession {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'text' })
  messages: string;

  @CreateDateColumn()
  createdAt: Date;
}
