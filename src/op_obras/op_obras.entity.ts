import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('op_obras')
export class OpObra {

  @PrimaryGeneratedColumn({ name: 'idobra' })
  idObra: number;

  @Column({ name: 'IdUsuarioCapturador' })
  idUsuarioCapturador: number;

  @Column({ name: 'IdUsuarioAutorizador' })
  idUsuarioAutorizador: number;

  @Column({ name: 'IdColoniaObra' })
  idColoniaObra: number;

  @Column({ name: 'Consecutivo' })
  consecutivo: string;

  @Column({ name: 'FechaCaptura' })
  fechaCaptura: Date;

  @Column({ name: 'NombrePropietario' })
  nombrePropietario: string;

  @Column({ name: 'DomicilioPropietario', nullable: true })
  domicilioPropietario: string;

  @Column({ name: 'NombreColoniaObra' })
  nombreColoniaObra: string;

  @Column({ name: 'IdDensidadColoniaObra' })
  idDensidadColoniaObra: string;

  @Column({ name: 'ManzanaObra', nullable: true })
  manzanaObra: string;

  @Column({ name: 'LoteObra', nullable: true })
  loteObra: string;

  @Column({ name: 'AguaPotable', default: 'Si' })
  aguaPotable: string;

  @Column({ name: 'Drenaje', default: 'Si' })
  drenaje: string;

  @Column({ name: 'Electricidad', default: 'Si' })
  electricidad: string;

  @Column({ name: 'AlumbradoPublico', default: 'Si' })
  alumbradoPublico: string;

  @Column({ name: 'Machuelos', default: 'Si' })
  machuelos: string;

  @Column({ name: 'Banquetas', default: 'Si' })
  banquetas: string;

  @Column({ name: 'Pavimento', default: 'Si' })
  pavimento: string;

  @Column({ name: 'Vigencia' })
  vigencia: string;

  @Column({ name: 'EstadoVerificacion' })
  estadoVerificacion: string;

  @Column({ name: 'EstadoObra' })
  estadoObra: string;

  @Column({ name: 'EstadoPago' })
  estadoPago: string;

  // puedes agregar más columnas opcionales aquí si quieres
}
