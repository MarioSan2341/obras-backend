// src/usuarios/area.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('area')
export class Area {
  @PrimaryGeneratedColumn({ name: 'id_area' })
  id_area: number;

  @Column({ name: 'nombre' })
  nombre: string;
}
