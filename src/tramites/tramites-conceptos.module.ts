import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TramitesConceptos } from './tramites-conceptos.entity';
import { TramitesConceptosService } from './tramites-conceptos.service';
import { TramitesConceptosController } from './tramites-conceptos.controller';
import { Tramite } from '../tramites/tramite.entity';
import { Concepto } from '../conceptos/concepto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TramitesConceptos,
      Tramite,
      Concepto,
    ]),
  ],
  controllers: [TramitesConceptosController],
  providers: [TramitesConceptosService],
})
export class TramitesConceptosModule {}
