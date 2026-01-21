import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Rol } from './roles.enum';
import { Cargo } from './cargo.entity';
import { FuncionUsuario } from './funcion-usuario.entity';

@Entity('area')
export class Area {

  @PrimaryGeneratedColumn()
  id_area: number;

  @Column()
  nombre: string;
}

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuarios' })
  id_usuarios: number;

  @Column({ name: 'nombre' }) // Este será tu login
  nombre: string;

  @Column({ name: 'ap_paterno' })
  ap_paterno: string;

  @Column({ name: 'ap_materno', nullable: true })
  ap_materno: string;

  @Column({ name: 'telefono', type: 'bigint', nullable: true })
  telefono: number;

  @Column({ name: 'clave', nullable: true })
  clave: string;

   @Column({
    type: 'varchar',
    length: 50,
    default: Rol.USUARIO,
  })
  rol: Rol;

  @Column({ name: 'estado', nullable: true })
  estado: string;

  @Column({ name: 'funcion', nullable: true })
  funcion: string;

  @ManyToOne(() => Area)
  @JoinColumn({ name: 'area_id_area' })
  area: Area;

   // 🔹 FECHA DE CREACIÓN
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

 @ManyToOne(() => Cargo, { nullable: true })
@JoinColumn({ name: 'cargo_idcargo' })
cargo: Cargo | null;

@ManyToOne(() => FuncionUsuario, { nullable: true })
@JoinColumn({ name: 'id_funcion' })
funcionEspecial?: FuncionUsuario;


}
