import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DirectorObra } from '../directores-obra/director-obra.entity';

@Entity('op_obras')
export class OpObra {

  @PrimaryGeneratedColumn({ name: 'idobra' })
  idObra: number;

  @Column({ name: 'idusuariocapturador', nullable: true })
  idUsuarioCapturador: number;

  @Column({ name: 'idusuarioautorizador', nullable: true })
  idUsuarioAutorizador: number;

  @Column({ name: 'idcoloniaobra', nullable: true })
  idColoniaObra: number;

  @Column({ name: 'consecutivo', default: '' })
  consecutivo: string;

  @Column({ name: 'fechacaptura', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCaptura: Date;

  @Column({ name: 'tipopropietario', default: 'Fisica', nullable: true })
  tipoPropietario: string;

  @Column({ name: 'nombrepropietario', default: '' })
  nombrePropietario: string;

  @Column({ name: 'representantelegal', nullable: true })
  representanteLegal: string;

  @Column({ name: 'domiciliopropietario', nullable: true })
  domicilioPropietario: string;

  @Column({ name: 'coloniapropietario', nullable: true })
  coloniaPropietario: string;

  @Column({ name: 'municipiopropietario', nullable: true })
  municipioPropietario: string;

  @Column({ name: 'entidadpropietario', nullable: true })
  entidadPropietario: string;

  @Column({ name: 'telefonopropietario', nullable: true })
  telefonoPropietario: string;

  @Column({ name: 'rfcpropietario', nullable: true })
  rfcPropietario: string;

  @Column({ name: 'codigopostalpropietario', nullable: true })
  codigoPostalPropietario: string;

  @Column({ name: 'identificacion', nullable: true })
  identificacion: string;

  @Column({ name: 'tipoidentificacion', nullable: true })
  tipoIdentificacion: string;

  @Column({ name: 'documentoacreditapropiedad', nullable: true })
  documentoAcreditaPropiedad: string;

  @Column({ name: 'tipodocumentoacreditapropiedad', nullable: true })
  tipoDocumentoAcreditaPropiedad: string;

  @Column({ name: 'documentosrequeridos', type: 'text', nullable: true })
  documentosRequeridos: string;

  @Column({ name: 'manzanaobra', nullable: true })
  manzanaObra: string;

  @Column({ name: 'loteobra', nullable: true })
  loteObra: string;

  @Column({ name: 'etapaobra', nullable: true })
  etapaObra: string;

  @Column({ name: 'condominioobra', nullable: true })
  condominioObra: string;

  @Column({ name: 'numerospredioscontiguosobra', nullable: true })
  numerosPrediosContiguosObra: string;

  @Column({ name: 'entrecalle1obra', nullable: true })
  entreCalle1Obra: string;

  @Column({ name: 'entrecalle2obra', nullable: true })
  entreCalle2Obra: string;

  @Column({ name: 'destinoactualproyeto', nullable: true })
  destinoActualProyeto: string;

  @Column({ name: 'destinopropuestoproyecto', nullable: true })
  destinoPropuestoProyecto: string;

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

  @Column({ name: 'servidumbrefrontal', nullable: true })
  servidumbreFrontal: string;

  @Column({ name: 'servidumbrelateral', nullable: true })
  servidumbreLateral: string;

  @Column({ name: 'servidumbreposterior', nullable: true })
  servidumbrePosterior: string;

  @Column({ name: 'coeficienteocupacion', nullable: true })
  coeficienteOcupacion: string;

  @Column({ name: 'coeficienteutilizacion', nullable: true })
  coeficienteUtilizacion: string;

  @Column({ name: 'descripcionproyecto', type: 'text', nullable: true })
  descripcionProyecto: string;

  @Column({ name: 'revisor', default: '', nullable: true })
  revisor: string;

  @Column({ name: 'cuantificador', default: '', nullable: true })
  cuantificador: string;

  @Column({ name: 'vigencia', nullable: true })
  vigencia: string;

  @Column({ name: 'estadoverificacion', nullable: true })
  estadoVerificacion: string;

  @Column({ name: 'fechaverificacion', type: 'timestamp', nullable: true })
  fechaVerificacion: Date;

  @Column({ name: 'verificacion', type: 'text', nullable: true })
  verificacion: string;

  @Column({ name: 'id_director_obra', nullable: true })
  idDirectorObra: number;

  @ManyToOne(() => DirectorObra, { nullable: true })
  @JoinColumn({ name: 'id_director_obra' })
  directorObra: DirectorObra;

  @Column({ name: 'bitacora', nullable: true })
  bitacoraObra: string;

  @Column({ name: 'notas', type: 'text', nullable: true })
  nota: string;

  @Column({ name: 'fechaaprobacion', type: 'timestamp', nullable: true })
  fechaAprovacion: Date;

  @Column({ name: 'fechapago', type: 'timestamp', nullable: true })
  fechaPago: Date;

  @Column({ name: 'informacionadicional', type: 'text', nullable: true })
  informacionAdicional: string;

  @Column({ name: 'recibodepago', nullable: true })
  reciboDePago: string;

  @Column({ name: 'otrosrecibos', nullable: true })
  otrosRecibos: string;

  @Column({ name: 'foliodelaforma', nullable: true })
  folioDeLaForma: string;

  @Column({ name: 'fechavencepago', type: 'timestamp', nullable: true })
  fechaPagoTesoreria: Date;

  @Column({ name: 'estadoobra', default: 'En Proceso' })
  estadoObra: string;

  @Column({ name: 'estadopago', default: 'Sin Pagar' })
  estadoPago: string;

  @Column({ name: 'totalcostoconceptos', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalCostoConceptos: number;
}
