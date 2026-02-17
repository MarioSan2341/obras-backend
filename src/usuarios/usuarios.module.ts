import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario, Area } from './usuario.entity';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Cargo } from './cargo.entity';
import { FuncionUsuario } from './funcion-usuario.entity';
import { FuncionUsuariosModule } from './funcion-usuarios.module';
import { HistorialModule } from '../historial/historial.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Area, Cargo, FuncionUsuario, 
      FuncionUsuariosModule]), // 🔑 Registrar Area aquí
    HistorialModule,
  ],
  providers: [UsuariosService],
  controllers: [UsuariosController],
})
export class UsuariosModule {}