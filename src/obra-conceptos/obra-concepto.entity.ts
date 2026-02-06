// src/obra-conceptos/obra-concepto.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Concepto } from '../conceptos/concepto.entity';

@Entity('obra_conceptos')
export class ObraConcepto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'IdObra' })
  obra_id: number;

  @ManyToOne(() => Concepto, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_concepto' })
  concepto: Concepto;

  @Column({ type: 'numeric' })
  cantidad: number;

  @Column({ name: 'costo', type: 'numeric' })
  costo_unitario: number;

  @Column({ type: 'numeric' })
  total: number;

  @Column({ nullable: true })
  medicion: string;

  @Column({ nullable: true })
  observaciones: string;

  @Column({ default: true })
  estado: boolean;

  @Column({ name: 'fecha_creacion' })
  fecha_creacion: Date;
}
