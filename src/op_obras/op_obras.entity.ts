import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('op_obras')
export class OpObra {

  @PrimaryGeneratedColumn({ name: 'idobra' })
  idObra: number;

  @Column({ name: 'idusuariocapturador' })
  idUsuarioCapturador: number;

  @Column({ name: 'idusuarioautorizador' })
  idUsuarioAutorizador: number;

  @Column({ name: 'idcoloniaobra' })
  idColoniaObra: number;

  @Column({ name: 'consecutivo' })
  consecutivo: string;

  @Column({ name: 'fechacaptura' })
  fechaCaptura: Date;

  @Column({ name: 'nombrepropietario' })
  nombrePropietario: string;

  @Column({ name: 'domiciliopropietario', nullable: true })
  domicilioPropietario: string;

  @Column({ name: 'manzanaobra', nullable: true })
  manzanaObra: string;

  @Column({ name: 'loteobra', nullable: true })
  loteObra: string;

  @Column({ name: 'aguapotable', default: 'Si' })
  aguaPotable: string;

  @Column({ name: 'drenaje', default: 'Si' })
  drenaje: string;

  @Column({ name: 'electricidad', default: 'Si' })
  electricidad: string;

  @Column({ name: 'alumbradopublico', default: 'Si' })
  alumbradoPublico: string;

  @Column({ name: 'machuelos', default: 'Si' })
  machuelos: string;

  @Column({ name: 'banquetas', default: 'Si' })
  banquetas: string;

  @Column({ name: 'pavimento', default: 'Si' })
  pavimento: string;

  @Column({ name: 'vigencia' })
  vigencia: string;

  @Column({ name: 'estadoverificacion' })
  estadoVerificacion: string;

  @Column({ name: 'estadoobra' })
  estadoObra: string;

  @Column({ name: 'estadopago' })
  estadoPago: string;

  @Column({ name: 'tipopropietario', nullable: true })
  tipoPropietario: string;

  @Column({ name: 'numerospredioscontiguosobra', nullable: true })
  numerosPrediosContiguosObra: string;

  @Column({ name: 'condominioobra', nullable: true })
  condominioObra: string;

  @Column({ name: 'etapaobra', nullable: true })
  etapaObra: string;

  @Column({ name: 'entrecalle1obra', nullable: true })
  entreCalle1Obra: string;

  @Column({ name: 'entrecalle2obra', nullable: true })
  entreCalle2Obra: string;

  @Column({ name: 'destinoactualproyeto', nullable: true })
  destinoActualProyeto: string;

  @Column({ name: 'destinopropuestoproyecto', nullable: true })
  destinoPropuestoProyecto: string;
}
