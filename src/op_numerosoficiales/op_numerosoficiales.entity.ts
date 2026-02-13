import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OpObra } from '../op_obras/op_obras.entity';

@Entity('op_numerosoficiales')
export class OpNumeroOficial {
  @PrimaryGeneratedColumn({ name: 'idnumerosoficialesobra' })
  idnumerosoficialesobra: number;

  @Column({ name: 'idobra' })
  idobra: number;

  @ManyToOne(() => OpObra, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'idobra', referencedColumnName: 'idObra' })
  obra: OpObra;

  @Column({ name: 'numerooficial' })
  numerooficial: string;

  @Column({ name: 'fechacreacionno' })
  fechacreacionno: Date;

  @Column({ name: 'idusuariono', nullable: true })
  idusuariono: number;

  @Column({ name: 'calle', type: 'text', nullable: true })
  calle: string;
}