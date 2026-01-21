import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tramite } from './tramite.entity';
import { TramitesService } from './tramites.service';
import { TramitesController } from './tramites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tramite])],
  controllers: [TramitesController],
  providers: [TramitesService],
})
export class TramitesModule {}
