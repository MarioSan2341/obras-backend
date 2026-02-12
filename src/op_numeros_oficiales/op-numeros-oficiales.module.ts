import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpNumerosOficiales } from './op-numeros-oficiales.entity';
import { OpObra } from '../op_obras/op_obras.entity';
import { Colonia } from '../colonias/colonias.entity';
import { OpNumerosOficialesService } from './op-numeros-oficiales.service';
import { OpNumerosOficialesController } from './op-numeros-oficiales.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OpNumerosOficiales, OpObra, Colonia])],
  controllers: [OpNumerosOficialesController],
  providers: [OpNumerosOficialesService],
  exports: [OpNumerosOficialesService],
})
export class OpNumerosOficialesModule {}
