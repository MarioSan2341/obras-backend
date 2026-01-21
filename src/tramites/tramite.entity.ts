import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('tramites')
export class Tramite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 10 })
  letra: string;

  @Column({ default: true })
  estado: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
