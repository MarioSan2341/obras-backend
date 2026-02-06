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

  // 👇 SOLO LA COLUMNA, SIN RELACIÓN POR AHORA
  @Column()
  obra_id: number;

  @ManyToOne(() => Concepto, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'concepto_id' })
  concepto: Concepto;

  @Column({ type: 'text', nullable: true })
  descripcion_costo: string;

  @Column({ nullable: true })
  medicion: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  costo_unitario: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  cantidad: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
