import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from "typeorm";
import { Tramite } from "../tramites/tramite.entity";
import { Concepto } from "../conceptos/concepto.entity";

@Entity("tramites_conceptos")
@Unique(["tramite_id", "concepto_id"])
export class TramitesConceptos {
  @PrimaryGeneratedColumn()
  id: number;

  // 🔑 FK explícita
  @Column()
  tramite_id: number;

  @ManyToOne(() => Tramite, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tramite_id" })
  tramite: Tramite;

  // 🔑 FK explícita
  @Column()
  concepto_id: number;

  @ManyToOne(() => Concepto, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "concepto_id" })
  concepto: Concepto;

  @Column({ default: true })
  estado: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
