import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ColoniasModule } from './colonias/colonias.module';
import { AreasModule } from './areas/areas/areas.module';
import { ConceptosModule } from './conceptos/conceptos.module';

import { AsignacionesModule } from './asignaciones/asignaciones.module';


import { TramitesModule } from './tramites/tramites.module';
import { DirectoresObraModule } from './directores-obra/directores-obra.module';
import { TramitesConceptosModule } from './tramites/tramites-conceptos.module';
import { OpObrasModule } from './op_obras/op_obras.module';
import {ObraConceptosModule} from './obra-conceptos/obra-conceptos.module';
import { RepObrasModule } from './reportes/rep_obras/rep_obras.module';
import { RepLicenciasModule } from './reportes/rep_Licencias/rep_licencias.module';
import { OpNumerosOficialesModule } from './op_numeros_oficiales/op-numeros-oficiales.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { HistorialModule } from './historial/historial.module';
import {LugaresRecibidosModule} from './lugares-recibidos/lugares-recibidos.module';
@Module({
  
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    UsuariosModule,
    ColoniasModule,
    AreasModule,
    ConceptosModule,
       

    AsignacionesModule,

    TramitesModule,
    DirectoresObraModule,
    TramitesConceptosModule,
    OpObrasModule,
    ObraConceptosModule,
    RepObrasModule,
    RepLicenciasModule,
    OpNumerosOficialesModule,
    EstadisticasModule,
    HistorialModule,
    LugaresRecibidosModule,
  ],
})
export class AppModule {}
