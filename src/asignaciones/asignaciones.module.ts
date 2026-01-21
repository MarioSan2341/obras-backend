import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesService } from './asignaciones.service';
import { AsignacionesController } from './asignaciones.controller';
import { Usuario } from '../usuarios/usuario.entity';
import { FuncionUsuario } from '../usuarios/funcion-usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, FuncionUsuario]),
  ],
  controllers: [AsignacionesController],
  providers: [AsignacionesService],
})
export class AsignacionesModule {}
