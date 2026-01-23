import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuncionUsuario } from './funcion-usuario.entity';
import { FuncionUsuariosService } from './funcion-usuarios.service';
import { FuncionUsuariosController } from './funcion-usuarios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FuncionUsuario])],
  controllers: [FuncionUsuariosController],
  providers: [FuncionUsuariosService],
  exports: [FuncionUsuariosService],
})
export class FuncionUsuariosModule {}
