import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('op_obras')
export class OpObra {

  @PrimaryGeneratedColumn({ name: 'IdObra' })
  idObra: number;

  @Column({ name: 'Consecutivo' })
  consecutivo: string;

  @Column({ name: 'FechaCaptura' })
  fechaCaptura: Date;

  @Column({ name: 'NombrePropietario' })
  nombrePropietario: string;

  @Column({ name: 'DomicilioPropietario', nullable: true })
  domicilioPropietario: string;

  @Column({ name: 'ManzanaObra', nullable: true })
  manzanaObra: string;

  @Column({ name: 'LoteObra', nullable: true })
  loteObra: string;

  @Column({ name: 'NombreColoniaObra' })
  nombreColoniaObra: string;

  @Column({ name: 'EstadoObra' })
  estadoObra: string;

  @Column({ name: 'EstadoPago' })
  estadoPago: string;
}
