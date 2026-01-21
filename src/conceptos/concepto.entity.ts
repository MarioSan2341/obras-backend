import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('conceptos')
export class Concepto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ nullable: true })
  medicion: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  costo: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  porcentaje: number;

  @Column({ default: true })
  estado: boolean;

  @Column()
  nivel: number;

  // ✅ ESTA ERA LA CLAVE
  @Column({ nullable: true })
  parent_id: number | null;

  @ManyToOne(() => Concepto, (concepto) => concepto.hijos, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  padre: Concepto | null;

  @OneToMany(() => Concepto, (concepto) => concepto.padre)
  hijos: Concepto[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
