import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpObra } from './op_obras.entity';
import { OpObrasService } from './op_obras.service';
import { OpObrasController } from './op_obras.controller';
import { Colonia } from '../colonias/colonias.entity';
import { OpNumeroOficial } from '../op_numerosoficiales/op_numerosoficiales.entity';
import { DirectorObra } from '../directores-obra/director-obra.entity';
import { HistorialModule } from '../historial/historial.module';
import { Usuario } from '../usuarios/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OpObra, Colonia, OpNumeroOficial, DirectorObra, Usuario]),
    HistorialModule,
  ],
  controllers: [OpObrasController],
  providers: [OpObrasService],
})
export class OpObrasModule {}
