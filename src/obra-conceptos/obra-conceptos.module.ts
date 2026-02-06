import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObraConcepto } from './obra-concepto.entity';
import { ObraConceptosController } from './obra-conceptos.controller';
import { ObraConceptosService } from './obra-conceptos.service';
import { Concepto } from '../conceptos/concepto.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      ObraConcepto,
      Concepto, // 👈 ESTA LÍNEA ES LA CLAVE
    ]),
  ],
  controllers: [ObraConceptosController],
  providers: [ObraConceptosService],
})
export class ObraConceptosModule {}