import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('colonias')
export class Colonia {
  @PrimaryGeneratedColumn({ name: 'id_colonia' })
  id_colonia: number;

  @Column()
  nombre: string;

  @Column()
  densidad: string;
}
